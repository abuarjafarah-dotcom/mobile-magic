// Noorani progress: per-child mastery + Leitner spaced repetition.
// Own localStorage key so it never touches other sections' progress. Never gates access.
import { useCallback, useEffect, useState } from "react";
import type { ActivityType, NooraniSkill } from "@/data/noorani";

export type PlayerId = "hamad" | "talal";
export const PLAYERS: PlayerId[] = ["hamad", "talal"];

export type ItemStat = {
  a: number; // attempts
  c: number; // correct
  box: number; // Leitner box 0–5
  due: number; // epoch ms when it should come back
  day: string; // last day the box was raised (one step per day)
  recent: number[]; // last 8 results, 1 = correct
  acts: ActivityType[]; // activity types answered correctly
};
export type SkillStat = { sessions: number; read: number; acts: ActivityType[] };
export type PlayerProgress = { items: Record<string, ItemStat>; skills: Record<string, SkillStat>; days: string[] };
export type NooraniStore = { v: 1; player: PlayerId; players: Record<PlayerId, PlayerProgress> };

export type Mastery = "new" | "learning" | "practicing" | "mastered";
export const MASTERY_STARS: Record<Mastery, number> = { new: 0, learning: 1, practicing: 2, mastered: 3 };

const KEY = "noorani-v1";
const DAY = 86_400_000;
const INTERVAL_DAYS = [0, 0, 1, 2, 4, 8];
const today = () => new Date().toISOString().slice(0, 10);
const emptyPlayer = (): PlayerProgress => ({ items: {}, skills: {}, days: [] });
const EMPTY: NooraniStore = { v: 1, player: "hamad", players: { hamad: emptyPlayer(), talal: emptyPlayer() } };
const emptyItem = (): ItemStat => ({ a: 0, c: 0, box: 0, due: 0, day: "", recent: [], acts: [] });
const add = <T,>(list: readonly T[], v: T) => (list.includes(v) ? [...list] : [...list, v]);

export type Result = { itemId: string; skillId: string; activity: ActivityType; correct: boolean; firstTry: boolean };

export function applyResult(p: PlayerProgress, r: Result, now = Date.now()): PlayerProgress {
  const s = { ...emptyItem(), ...p.items[r.itemId] };
  s.a += 1;
  if (r.correct) s.c += 1;
  s.recent = [...s.recent, r.correct && r.firstTry ? 1 : 0].slice(-8);
  if (r.correct) s.acts = add(s.acts, r.activity);
  if (r.correct && r.firstTry) {
    if (s.day !== today()) { s.box = Math.min(5, s.box + 1); s.day = today(); }
  } else if (!r.correct) {
    s.box = Math.min(s.box, 1);
  }
  s.due = now + (INTERVAL_DAYS[s.box] ?? 8) * DAY;
  const sk = p.skills[r.skillId] ?? { sessions: 0, read: 0, acts: [] };
  const skill: SkillStat = { ...sk, acts: r.correct ? add(sk.acts, r.activity) : sk.acts, read: sk.read + (r.activity === "readAloud" ? 1 : 0) };
  return { ...p, items: { ...p.items, [r.itemId]: s }, skills: { ...p.skills, [r.skillId]: skill }, days: add(p.days, today()) };
}

export function finishSession(p: PlayerProgress, skillId: string): PlayerProgress {
  const sk = p.skills[skillId] ?? { sessions: 0, read: 0, acts: [] };
  return { ...p, skills: { ...p.skills, [skillId]: { ...sk, sessions: sk.sessions + 1 } } };
}

const accuracy = (s: ItemStat) => (s.recent.length ? s.recent.reduce((a, b) => a + b, 0) / s.recent.length : 0);

/** NEW → LEARNING (tried) → PRACTICING (every item right twice, 3+ activity kinds) → MASTERED. */
export function skillMastery(p: PlayerProgress, skill: NooraniSkill): Mastery {
  const stats = skill.itemIds.map((id) => p.items[id]);
  if (stats.every((s) => !s || s.a === 0)) return "new";
  const sk = p.skills[skill.id];
  const kinds = sk?.acts.length ?? 0;
  const solid = stats.every((s) => s && s.c >= 5 && s.box >= 3 && accuracy(s) >= 0.75);
  if (solid && kinds >= 5 && (sk?.read ?? 0) >= 1) return "mastered";
  if (stats.every((s) => s && s.c >= 2) && kinds >= 3) return "practicing";
  return "learning";
}

export function itemMastery(s: ItemStat | undefined): Mastery {
  if (!s || s.a === 0) return "new";
  if (s.c >= 5 && s.box >= 3 && accuracy(s) >= 0.75) return "mastered";
  if (s.c >= 2) return "practicing";
  return "learning";
}

/**
 * Spaced-repetition pick for Quick Review: everything due (oldest first) from other
 * groups, topped up with a sprinkle of mastered items so they keep returning.
 */
export function reviewPick(p: PlayerProgress, current: string[], count: number, now = Date.now()): string[] {
  const seen = Object.entries(p.items).filter(([id, s]) => s.a > 0 && !current.includes(id));
  const due = seen.filter(([, s]) => s.due <= now).sort((a, b) => a[1].due - b[1].due).map(([id]) => id);
  const mastered = seen.filter(([id, s]) => s.box >= 4 && !due.includes(id)).map(([id]) => id).sort(() => Math.random() - 0.5);
  const older = [...due.slice(0, Math.ceil(count / 2)), ...mastered.slice(0, 1)];
  const fill = [...current].sort(() => Math.random() - 0.5);
  const out: string[] = [...older];
  for (const id of fill) if (out.length < count) out.push(id);
  while (out.length < count && current.length) out.push(current[out.length % current.length]!);
  return out.sort(() => Math.random() - 0.5);
}

export function useNooraniProgress() {
  const [store, setStore] = useState<NooraniStore>(EMPTY);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<NooraniStore>;
      setStore({
        v: 1,
        player: parsed.player && PLAYERS.includes(parsed.player) ? parsed.player : "hamad",
        players: { hamad: { ...emptyPlayer(), ...parsed.players?.hamad }, talal: { ...emptyPlayer(), ...parsed.players?.talal } },
      });
    } catch { /* corrupt or blocked storage — start fresh without throwing */ }
  }, []);

  const update = useCallback((change: (s: NooraniStore) => NooraniStore) => {
    setStore((prev) => {
      const next = change(prev);
      try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage full or blocked */ }
      return next;
    });
  }, []);

  const setPlayer = useCallback((player: PlayerId) => update((s) => ({ ...s, player })), [update]);
  const record = useCallback((r: Result) => update((s) => ({ ...s, players: { ...s.players, [s.player]: applyResult(s.players[s.player], r) } })), [update]);
  const finish = useCallback((skillId: string) => update((s) => ({ ...s, players: { ...s.players, [s.player]: finishSession(s.players[s.player], skillId) } })), [update]);

  return { store, me: store.players[store.player], setPlayer, record, finish };
}
