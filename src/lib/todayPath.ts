// Today's path: three small steps a day, chosen for the child.
// 1) something to review, 2) something to learn, 3) his own pick.
// Own localStorage key, so each child has his own day.

export type PathStepId = "review" | "learn" | "pick";
export type PathState = { day: string; done: PathStepId[]; bonus: boolean };

const KEY = "today-path-v1";
export const PATH_BONUS_STARS = 5;
export const todayKey = (now = new Date()) =>
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

// Learning games the "learn" step rotates through, one per day.
export const LEARN_ROTATION: readonly { screen: string; label: string; icon: string }[] = [
  { screen: "noorani", label: "Noorani Qaida", icon: "🌳" },
  { screen: "quest", label: "Math Quest", icon: "🌟" },
  { screen: "lw", label: "Arabic", icon: "🔤" },
  { screen: "golden", label: "Golden Beads", icon: "🟡" },
  { screen: "ws", label: "Wudu & Salah", icon: "🤲" },
  { screen: "play", label: "Harakat", icon: "🎰" },
  { screen: "sci", label: "Science", icon: "🔬" },
  { screen: "beads", label: "Bead Garden", icon: "🌼" },
  { screen: "seek", label: "Seek & Find", icon: "🔎" },
  { screen: "hbl", label: "Human Body", icon: "🫀" },
];

/** Same game all day, a different one tomorrow. */
export function learnPick(day: string, avoidScreen?: string) {
  const n = Math.floor(new Date(`${day}T12:00:00`).getTime() / 86_400_000);
  let pick = LEARN_ROTATION[n % LEARN_ROTATION.length]!;
  if (pick.screen === avoidScreen) pick = LEARN_ROTATION[(n + 1) % LEARN_ROTATION.length]!;
  return pick;
}

export function loadPath(day = todayKey()): PathState {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<PathState>) : null;
    if (parsed && parsed.day === day)
      return { day, done: parsed.done ?? [], bonus: Boolean(parsed.bonus) };
  } catch {
    /* fall through to a fresh day */
  }
  return { day, done: [], bonus: false };
}

function save(state: PathState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked */
  }
}

export function markStep(step: PathStepId): PathState {
  const state = loadPath();
  if (!state.done.includes(step)) state.done = [...state.done, step];
  save(state);
  return state;
}

/** True the first time all three steps are done today; the caller gives the bonus stars. */
export function claimBonus(): boolean {
  const state = loadPath();
  if (state.bonus || state.done.length < 3) return false;
  save({ ...state, bonus: true });
  return true;
}

/** Noorani items waiting for review for the child who is playing. */
export function nooraniDueCount(now = Date.now()): number {
  try {
    const raw = window.localStorage.getItem("noorani-v1");
    if (!raw) return 0;
    const store = JSON.parse(raw) as {
      player?: string;
      players?: Record<string, { items?: Record<string, { a: number; due: number }> }>;
    };
    const items = store.players?.[store.player ?? "hamad"]?.items ?? {};
    return Object.values(items).filter((s) => s.a > 0 && s.due <= now).length;
  } catch {
    return 0;
  }
}
