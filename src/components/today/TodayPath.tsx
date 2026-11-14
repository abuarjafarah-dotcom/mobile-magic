import { useEffect, useMemo, useState } from "react";
import { Check, Star } from "lucide-react";
import type { SurahData } from "@/data/surahs";
import type { LearningProgress } from "@/lib/learningProgress";
import { dueKeys, loadDeck } from "@/lib/reviewDeck";
import {
  claimBonus,
  learnPick,
  loadPath,
  markStep,
  nooraniDueCount,
  PATH_BONUS_STARS,
  todayKey,
  type PathState,
  type PathStepId,
} from "@/lib/todayPath";

type Step = { id: PathStepId; label: string; detail: string; icon: string; open?: () => void };

const STEP_ART: Record<PathStepId, string> = {
  review: "linear-gradient(135deg,#8BD48A,#2E9E3A)",
  learn: "linear-gradient(135deg,#FFD85A,#FFB02E)",
  pick: "linear-gradient(135deg,#D8A4E6,#8B4AB0)",
};

/**
 * Three steps for today: one review, one new, one free pick. The cards are
 * pictures with a number, because the boys cannot read yet. Nothing is locked:
 * the games grid under it always stays open.
 */
export function TodayPath({
  learning,
  surahs,
  onOpenScreen,
  onOpenAyah,
  onBonus,
}: {
  learning: LearningProgress;
  surahs: readonly SurahData[];
  onOpenScreen: (screen: string) => void;
  onOpenAyah: (surah: SurahData) => void;
  onBonus: (stars: number) => void;
}) {
  const [state, setState] = useState<PathState | null>(null);
  const [dueSurah, setDueSurah] = useState<SurahData | null>(null);
  const [nooraniDue, setNooraniDue] = useState(0);

  useEffect(() => {
    setState(loadPath());
    setNooraniDue(nooraniDueCount());
    // Surahs he has started are the review pool; the longest-waiting one comes first.
    const started = surahs.filter((s) => (learning.quran[s.id]?.completed.length ?? 0) > 0);
    const due = dueKeys(
      loadDeck(),
      started.map((s) => `quran:${s.id}`),
    );
    setDueSurah(started.find((s) => `quran:${s.id}` === due[0]) ?? null);
  }, [learning, surahs]);

  useEffect(() => {
    if (state && state.done.length >= 3 && !state.bonus && claimBonus()) {
      onBonus(PATH_BONUS_STARS);
      setState(loadPath());
    }
  }, [state, onBonus]);

  const steps = useMemo<Step[]>(() => {
    const review: Step = dueSurah
      ? {
          id: "review",
          label: dueSurah.name.replace("Surah ", ""),
          detail: "Review · Qur’an",
          icon: "📖",
          open: () => onOpenAyah(dueSurah),
        }
      : nooraniDue > 0
        ? {
            id: "review",
            label: "Noorani review",
            detail: "Review · letters",
            icon: "🌳",
            open: () => onOpenScreen("noorani"),
          }
        : {
            id: "review",
            label: "Qur’an",
            detail: "Listen · Qur’an",
            icon: "📖",
            open: () => onOpenScreen("quran"),
          };
    const learn = learnPick(todayKey(), !dueSurah && nooraniDue > 0 ? "noorani" : undefined);
    return [
      review,
      {
        id: "learn",
        label: learn.label,
        detail: "New today",
        icon: learn.icon,
        open: () => onOpenScreen(learn.screen),
      },
      { id: "pick", label: "Your pick", detail: "Any game below", icon: "🎁" },
    ];
  }, [dueSurah, nooraniDue, onOpenAyah, onOpenScreen]);

  if (!state) return null;
  const allDone = state.done.length >= 3;

  return (
    <div className="mb-6 rounded-[28px] bg-white/95 p-3 shadow-[0_6px_0_rgba(0,0,0,.18)]">
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="font-display text-2xl font-bold text-[#2B1B4A]">Today</h2>
        <span
          className="inline-flex items-center gap-1 rounded-full bg-[#FFF3C4] px-2.5 py-1 text-sm font-black text-[#2B1B4A]"
          aria-label={`${state.done.length} of 3 done`}
        >
          {[0, 1, 2].map((i) => (
            <Star
              key={i}
              aria-hidden="true"
              className={`h-4 w-4 ${i < state.done.length ? "fill-[#FFC930] text-[#FFC930]" : "text-[#D9CDE8]"}`}
            />
          ))}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {steps.map((step, i) => {
          const done = state.done.includes(step.id);
          const body = (
            <>
              <span
                className="relative grid h-20 w-full place-items-center overflow-hidden rounded-2xl text-4xl leading-none"
                style={{ background: STEP_ART[step.id] }}
              >
                <span aria-hidden="true">{step.icon}</span>
                <span className="absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-white text-sm font-black text-[#2B1B4A]">
                  {i + 1}
                </span>
                {done && (
                  <span className="absolute inset-0 grid place-items-center bg-[#2E9E3A]/80">
                    <Check className="h-10 w-10 text-white" strokeWidth={4} aria-hidden="true" />
                  </span>
                )}
              </span>
              <span className="mt-1.5 block truncate px-0.5 font-display text-base font-bold leading-tight text-[#2B1B4A]">
                {step.label}
              </span>
              <span className="block truncate px-0.5 text-xs font-extrabold text-[#7E3C8A]">
                {done ? "Done!" : step.detail}
              </span>
            </>
          );
          const cls =
            "min-w-0 rounded-3xl bg-[#FFF9EC] p-1.5 pb-2 text-left shadow-[0_4px_0_rgba(0,0,0,.14)]";
          return step.open ? (
            <button
              key={step.id}
              type="button"
              onClick={() => {
                setState(markStep(step.id));
                step.open?.();
              }}
              aria-label={`Step ${i + 1}: ${step.label}${done ? ", done" : ""}`}
              className={`${cls} touch-manipulation transition-transform active:translate-y-1 active:shadow-none focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#FFC930]`}
            >
              {body}
            </button>
          ) : (
            <div key={step.id} className={cls}>
              {body}
            </div>
          );
        })}
      </div>
      {allDone && (
        <p className="mt-3 rounded-2xl bg-[#E7F7E8] px-3 py-2 text-center font-display text-lg font-bold text-[#1F6B2A]">
          All done for today! +{PATH_BONUS_STARS} stars
        </p>
      )}
    </div>
  );
}
