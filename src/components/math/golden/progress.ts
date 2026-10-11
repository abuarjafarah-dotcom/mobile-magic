// Golden Bead Workshop progress — its own localStorage key so it never touches other sections.
// Progress is a record of discoveries; it unlocks garden rewards but never gates any activity.
import { useCallback, useEffect, useState } from "react";

export type WorkshopMode = "discover" | "figure" | "master";
export type WorkshopProgress = { found: string[]; mode: WorkshopMode; exchanges: number };

const KEY = "golden-workshop-v1";
export const EMPTY_WORKSHOP: WorkshopProgress = { found: [], mode: "discover", exchanges: 0 };

export type RewardId =
  | "sprout"
  | "flower"
  | "stones"
  | "apple-tree"
  | "bridge"
  | "crystal"
  | "dog"
  | "turtle"
  | "worm"
  | "bloom"
  | "shell"
  | "plus"
  | "sprite"
  | "arch";
/** Discoveries needed for each garden reward (gentle, ever-widening steps). */
export const REWARDS: {
  id: RewardId;
  at: number;
  kind: "garden" | "friend";
  ar: string;
  en: string;
}[] = [
  { id: "sprout", at: 1, kind: "garden", ar: "نبتة صغيرة", en: "a little sprout" },
  { id: "flower", at: 3, kind: "garden", ar: "زهرة ملوّنة", en: "a rainbow flower" },
  { id: "dog", at: 5, kind: "friend", ar: "صديق جديد", en: "a new friend" },
  { id: "stones", at: 7, kind: "garden", ar: "حجارة الممر", en: "stepping stones" },
  { id: "apple-tree", at: 10, kind: "garden", ar: "شجرة تفاح", en: "an apple tree" },
  { id: "turtle", at: 13, kind: "friend", ar: "سلحفاة صديقة", en: "a turtle friend" },
  { id: "bridge", at: 16, kind: "garden", ar: "جسر خشبي", en: "a wooden bridge" },
  { id: "worm", at: 20, kind: "friend", ar: "دودة مرحة", en: "a wiggly friend" },
  { id: "crystal", at: 24, kind: "garden", ar: "بلّورة لامعة", en: "a shining crystal" },
  { id: "bloom", at: 28, kind: "friend", ar: "صديق الزهرة", en: "a flower friend" },
  { id: "shell", at: 33, kind: "friend", ar: "سلحفاة برتقالية", en: "an orange turtle" },
  { id: "plus", at: 38, kind: "friend", ar: "صديق الزائد", en: "a plus-shaped friend" },
  { id: "sprite", at: 44, kind: "friend", ar: "صديق صغير", en: "a tiny friend" },
  { id: "arch", at: 50, kind: "friend", ar: "عائلة المكعبات", en: "the block family" },
];

export const unlocked = (p: WorkshopProgress) => REWARDS.filter((r) => p.found.length >= r.at);

function read(): WorkshopProgress {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY_WORKSHOP;
    const parsed = JSON.parse(raw) as Partial<WorkshopProgress>;
    return {
      found: Array.isArray(parsed.found)
        ? parsed.found.filter((x): x is string => typeof x === "string")
        : [],
      mode: parsed.mode === "figure" || parsed.mode === "master" ? parsed.mode : "discover",
      exchanges: typeof parsed.exchanges === "number" ? parsed.exchanges : 0,
    };
  } catch {
    return EMPTY_WORKSHOP;
  }
}
function write(p: WorkshopProgress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable — keep playing */
  }
}

export function useWorkshopProgress() {
  const [progress, setProgress] = useState<WorkshopProgress>(EMPTY_WORKSHOP);
  useEffect(() => {
    setProgress(read());
  }, []);
  const update = useCallback((change: (p: WorkshopProgress) => WorkshopProgress) => {
    setProgress((prev) => {
      const next = change(prev);
      write(next);
      return next;
    });
  }, []);
  return [progress, update] as const;
}
