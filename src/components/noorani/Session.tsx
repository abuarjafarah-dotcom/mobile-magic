// Runs one learning session for a skill: the unit's activity list, in order, with a short
// station hand-off between activities and a celebration at the end. Pure orchestration —
// every screen comes from a reusable engine fed by data.
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/learn/shared";
import {
  nooraniItems,
  phrases,
  type ActivitySpec,
  type ActivityType,
  type NooraniSkill,
  type NooraniUnit,
} from "@/data/noorani";
import { sayPhrase, stopNoorani } from "@/lib/nooraniAudio";
import {
  MASTERY_STARS,
  reviewPick,
  skillMastery,
  type PlayerId,
  type PlayerProgress,
  type Result,
} from "@/lib/nooraniProgress";
import { BuildTheSound } from "./activities/BuildTheSound";
import { CharacterGame } from "./activities/CharacterGame";
import { HearAndMatch } from "./activities/HearAndMatch";
import { ListenAndFind } from "./activities/ListenAndFind";
import { Meet } from "./activities/Meet";
import { ReadAloud } from "./activities/ReadAloud";
import { Blend } from "./activities/Blend";
import { Challenge } from "./activities/Challenge";
import { Contrast } from "./activities/Contrast";
import { OrderCards } from "./activities/OrderCards";
import { Spot } from "./activities/Spot";
import { Ending } from "./activities/Ending";
import { Sort } from "./activities/Sort";
import { SymbolSound } from "./activities/SymbolSound";
import { ReadChoose } from "./activities/ReadChoose";
import { WhichIsDifferent } from "./activities/WhichIsDifferent";
import { Ar, Burst, Guide, Kid, MarkOnly, Stars, sprite, type ActivityProps } from "./ui";

export const ACTIVITY_META: Record<ActivityType, { ar: string; en: string; art: string }> = {
  meet: { ar: "تَعَرَّفْ", en: "Meet the letters", art: "station-read" },
  listenFind: { ar: "اسْمَعْ وَاخْتَرْ", en: "Listen & find", art: "station-listen" },
  hearMatch: { ar: "طَابِقْ", en: "Hear & match", art: "station-match" },
  build: { ar: "رَكِّبْ", en: "Build the letter", art: "station-build" },
  different: { ar: "أَيُّهَا مُخْتَلِف؟", en: "Which sounds different?", art: "station-listen" },
  readAloud: { ar: "اقْرَأْ", en: "Read it", art: "station-speak" },
  characterGame: { ar: "عُبُورُ النَّهْر", en: "River crossing", art: "item-gems" },
  review: { ar: "مُرَاجَعَة", en: "Quick review", art: "item-chest" },
  contrast: { ar: "حَرْفٌ وَاحِد", en: "Same letter, different sound", art: "station-match" },
  readChoose: { ar: "اقْرَأْ وَاخْتَرْ", en: "Read & choose", art: "station-read" },
  challenge: { ar: "التَّحَدِّي", en: "Challenge", art: "item-gems" },
  blend: { ar: "اقْرَأْ مَعًا", en: "Read together", art: "station-listen" },
  order: { ar: "رَتِّبْ", en: "Put in order", art: "station-build" },
  spot: { ar: "أَيْنَ؟", en: "Spot the mark", art: "station-match" },
  ending: { ar: "النِّهَايَة", en: "Choose the ending", art: "station-build" },
  sort: { ar: "صَنِّفْ", en: "Sort", art: "item-baskets" },
  symbol: { ar: "الصَّوْتُ وَالْعَلَامَة", en: "Sound and symbol", art: "station-listen" },
};

/** Station label for a step: the data's own prompt wins, so the same engine can appear twice. */
export function stepMeta(spec: ActivitySpec) {
  const base = ACTIVITY_META[spec.type];
  const p = spec.prompt
    ? (phrases as Record<string, { ar: string; en?: string }>)[spec.prompt]
    : undefined;
  return p ? { ...base, ar: p.ar, en: p.en ?? base.en } : base;
}

const ReviewFind = (p: ActivityProps) => <ListenAndFind {...p} prompt="review" ordered />;
const ENGINES: Record<ActivityType, ComponentType<ActivityProps>> = {
  meet: Meet,
  listenFind: ListenAndFind,
  hearMatch: HearAndMatch,
  build: BuildTheSound,
  different: WhichIsDifferent,
  readAloud: ReadAloud,
  characterGame: CharacterGame,
  review: ReviewFind,
  contrast: Contrast,
  readChoose: ReadChoose,
  challenge: Challenge,
  blend: Blend,
  order: OrderCards,
  spot: Spot,
  ending: Ending,
  sort: Sort,
  symbol: SymbolSound,
};

const MASTERY_AR = {
  new: "جَدِيد",
  learning: "أَتَعَلَّم",
  practicing: "أَتَدَرَّب",
  mastered: "أَتْقَنْت",
} as const;
export { MASTERY_AR };

export function Session({
  unit,
  skill,
  only,
  player,
  me,
  record,
  finish,
  onExit,
  onReplayUnit,
}: {
  unit: NooraniUnit;
  skill: NooraniSkill;
  only?: number | undefined; // index into skill.activities: play just that station
  player: PlayerId;
  me: PlayerProgress;
  record: (r: Result) => void;
  finish: (skillId: string) => void;
  onExit: () => void;
  onReplayUnit?: () => void;
}) {
  const targets = useMemo(() => skill.itemIds.map((id) => nooraniItems[id]!), [skill]);
  const pool = useMemo(() => {
    const upto = unit.skills.findIndex((s) => s.id === skill.id);
    return unit.skills.slice(0, upto + 1).flatMap((s) => s.itemIds.map((id) => nooraniItems[id]!));
  }, [unit, skill]);
  const steps = useMemo<ActivitySpec[]>(() => {
    const list = only !== undefined ? skill.activities.slice(only, only + 1) : skill.activities;
    return list.filter((a) => a.type !== "build" || targets.some((t) => t.build));
  }, [skill, only, targets]);
  // Review set is fixed once per session so it does not reshuffle as results come in.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reviewIds = useMemo(
    () => reviewPick(me, skill.itemIds, steps.find((s) => s.type === "review")?.rounds ?? 6),
    [skill],
  );

  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [runKey, setRunKey] = useState(0);
  const spec = steps[step];

  useEffect(() => () => stopNoorani(), []);
  useEffect(() => {
    if (phase !== "intro") return;
    const t = setTimeout(() => setPhase("play"), 1700);
    return () => clearTimeout(t);
  }, [phase, step]);

  const advance = () => {
    if (step + 1 >= steps.length) {
      finish(skill.id);
      setPhase("done");
      void sayPhrase("great");
      return;
    }
    setStep(step + 1);
    setPhase("intro");
  };
  const again = () => {
    setStep(0);
    setPhase("intro");
    setRunKey((k) => k + 1);
  };

  const reviewItems = reviewIds.map((id) => nooraniItems[id]!).filter(Boolean);
  const Engine = spec ? ENGINES[spec.type] : null;
  const mastery = skillMastery(me, skill);

  return (
    <section className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 min-[960px]:max-w-2xl">
      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 pr-14">
        <GameButton
          tone="neutral"
          className="grid h-12 w-12 place-items-center rounded-full p-0"
          onClick={() => {
            stopNoorani();
            onExit();
          }}
          aria-label="Back to the garden"
        >
          <ArrowLeft className="h-5 w-5" />
        </GameButton>
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2">
            <Ar className="truncate text-lg font-black">{skill.ar}</Ar>
            {spec && phase !== "done" ? (
              <span className="truncate text-xs font-bold text-muted-foreground">
                {stepMeta(spec).en}
              </span>
            ) : null}
          </div>
          <ProgressBar
            value={phase === "done" ? steps.length : step}
            total={Math.max(steps.length, 1)}
          />
        </div>
      </header>

      {phase === "intro" && spec ? (
        <button
          className="mt-6 flex flex-1 flex-col items-center justify-center gap-4"
          onClick={() => setPhase("play")}
          aria-label="Start"
        >
          <div className="relative w-full max-w-sm animate-pop-in overflow-hidden rounded-[2rem] border-4 border-card bg-card shadow-xl">
            <img
              src={sprite(stepMeta(spec).art)}
              alt=""
              className={
                stepMeta(spec).art.startsWith("item")
                  ? "mx-auto h-48 object-contain p-6"
                  : "h-56 w-full object-cover"
              }
            />
          </div>
          <Ar className="text-center text-4xl font-black">{stepMeta(spec).ar}</Ar>
          <Kid who={player} pose="point" className="h-28 w-20 animate-hamad-float" />
        </button>
      ) : null}

      {phase === "play" && spec && Engine ? (
        <Engine
          key={`${runKey}-${step}`}
          skill={skill}
          spec={spec.type === "review" ? { ...spec, rounds: reviewItems.length } : spec}
          targets={spec.type === "review" ? reviewItems : targets}
          pool={
            spec.type === "review"
              ? [...new Map([...pool, ...reviewItems].map((i) => [i.id, i])).values()]
              : pool
          }
          player={player}
          onResult={(r) => record({ ...r, skillId: skill.id, activity: spec.type })}
          onDone={advance}
        />
      ) : null}

      {phase === "done" || !spec ? (
        <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <div className="flex items-end gap-2">
            <Kid who={player} pose="cheer" className="h-40 w-28 animate-pop-in" />
            <Guide pose="cheer" className="h-32 w-28 animate-hamad-float" />
          </div>
          <Ar className="text-4xl font-black">
            {mastery === "mastered" ? "أَتْقَنْتَ الْحُرُوف!" : "أَحْسَنْتَ!"}
          </Ar>
          {unit.completion ? (
            <span className="-mt-3 text-sm font-bold text-muted-foreground">Great job!</span>
          ) : null}
          <div dir="rtl" className="flex flex-wrap justify-center gap-2">
            {targets.map((t) => (
              <span
                key={t.id}
                className={cn(
                  "grid place-items-center rounded-2xl bg-card px-2 shadow-md",
                  targets.length > 8 ? "h-12 min-w-12" : "h-16 min-w-16",
                )}
              >
                <span
                  className={cn("font-quran", targets.length > 8 ? "text-3xl" : "text-4xl")}
                  lang="ar"
                >
                  {t.glyph}
                </span>
              </span>
            ))}
          </div>
          {unit.completion ? (
            <div className="w-full max-w-sm rounded-3xl bg-card/80 p-3 shadow-sm" dir="rtl">
              <span className="block text-xs font-bold text-muted-foreground" dir="ltr">
                You learned:
              </span>
              <ul className="mt-1 space-y-1">
                {unit.completion.map((c) => (
                  <li key={c.ar} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <span className="text-success">✓</span>
                      <Ar className="text-xl font-black">{c.ar}</Ar>
                      {c.glyphs ? (
                        <MarkOnly
                          mark={c.glyphs.replace("\u0640", "")}
                          className="text-3xl leading-none"
                        />
                      ) : null}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground" dir="ltr">
                      {c.en}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="flex flex-col items-center gap-1">
            <Stars value={MASTERY_STARS[mastery]} className="scale-150" />
            <Ar className="mt-2 text-lg font-bold text-muted-foreground">{MASTERY_AR[mastery]}</Ar>
          </div>
          <div className="mt-2 flex gap-3">
            <GameButton
              tone="sun"
              onClick={again}
              className="flex items-center gap-2 rounded-full px-6 py-4 text-lg"
            >
              <RotateCcw className="h-5 w-5" />
              <Ar className="font-black">مَرَّةً أُخْرَى</Ar>
              {unit.completion ? (
                <span className="text-xs font-bold opacity-80">Practice again</span>
              ) : null}
            </GameButton>
            <GameButton tone="mint" onClick={onExit} className="rounded-full px-6 py-4 text-lg">
              <Ar className="font-black">إِلَى الْحَدِيقَة</Ar>
              {unit.completion ? (
                <span className="block text-xs font-bold opacity-80">
                  Back to القاعدة النورانية
                </span>
              ) : null}
            </GameButton>
          </div>
          {unit.completion && onReplayUnit ? (
            <GameButton tone="sky" onClick={onReplayUnit} className="rounded-full px-5 py-3">
              <Ar className="font-black">أَعِدِ الْمُسْتَوَى</Ar>{" "}
              <span className="text-xs font-bold opacity-80">Replay level</span>
            </GameButton>
          ) : null}
          <Burst fire={1} />
        </div>
      ) : null}
    </section>
  );
}
