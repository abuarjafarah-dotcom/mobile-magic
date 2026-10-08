import { useCallback, useEffect, useState } from "react";

export type SurahProgress = { completed: number[]; levels: number[] };
export type LearningProgress = {
  quran: Record<string, SurahProgress>;
  // lessons: completed lesson ids; learned: "unit:item" keys; days: YYYY-MM-DD practice days (streak)
  arabic: { letters: string[]; words: string[]; read: string[]; stages: number[]; lessons: string[]; learned: string[]; days: string[] };
  geo: { lessons: string[]; learned: string[]; lang: "en" | "ar" | "both" };
  // Interactive Qur'an world: stars = discovered word/animal ids; lang = UI language
  iq: { stars: string[]; lang: "ar" | "en" };
  // Grade 1 math: finished lesson ids (informational only — every lesson stays open)
  g1: { done: string[] };
};

const KEY = "learning-adventure-progress";
export const EMPTY_PROGRESS: LearningProgress = { quran: {}, arabic: { letters: [], words: [], read: [], stages: [], lessons: [], learned: [], days: [] }, geo: { lessons: [], learned: [], lang: "both" }, iq: { stars: [], lang: "ar" }, g1: { done: [] } };

export function streak(days: readonly string[]): number {
  let n = 0;
  const d = new Date();
  const key = (x: Date) => x.toISOString().slice(0, 10);
  if (!days.includes(key(d))) d.setDate(d.getDate() - 1);
  while (days.includes(key(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

export const addUnique = <T,>(list: readonly T[], value: T): T[] => (list.includes(value) ? [...list] : [...list, value]);

export function useLearningProgress() {
  const [progress, setProgress] = useState<LearningProgress>(EMPTY_PROGRESS);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as Partial<LearningProgress>;
      setProgress({ quran: parsed.quran ?? {}, arabic: { ...EMPTY_PROGRESS.arabic, ...(parsed.arabic ?? {}) }, geo: { ...EMPTY_PROGRESS.geo, ...(parsed.geo ?? {}) }, iq: { ...EMPTY_PROGRESS.iq, ...(parsed.iq ?? {}) }, g1: { ...EMPTY_PROGRESS.g1, ...(parsed.g1 ?? {}) } });
    } catch {
      window.localStorage.removeItem(KEY);
    }
  }, []);

  const update = useCallback((change: (previous: LearningProgress) => LearningProgress) => {
    setProgress((previous) => {
      const next = change(previous);
      window.localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return [progress, update] as const;
}

export function surahProgress(progress: LearningProgress, id: string): SurahProgress {
  return progress.quran[id] ?? { completed: [], levels: [] };
}
