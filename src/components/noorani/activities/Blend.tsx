// PUT THE SOUNDS TOGETHER (Level 3). For each reading:
//   1 hear it  →  2 see it segmented (each syllable lights as it is spoken)
//   3 the cards slide together and become the joined writing  →  4 hear it again (a sweep runs
//   right-to-left under the whole word: one continuous reading)  →  5 the child's turn (mic or "I said it").
// Syllable cards move as whole units, so a harakah can never separate from its letter.
import { useMemo, useState } from "react";
import { Check, ChevronLeft, Mic, RotateCcw } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { nooraniItems, phrases, type NooraniItem } from "@/data/noorani";
import { canListen, judge, listenArabic, stopListening } from "@/lib/arabicListen";
import { sayItem, sayPhrase, saySuccess } from "@/lib/nooraniAudio";
import { cn } from "@/lib/utils";
import {
  ActivityFrame,
  Ar,
  Glyph,
  MarkedGlyph,
  Stars,
  promptOf,
  roundTargets,
  useAlive,
  useOnMount,
  useReaction,
  type ActivityProps,
} from "../ui";

type Stage = "hear" | "split" | "merge" | "joined" | "turn";
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function Blend({ targets, spec, player, onResult, onDone }: ActivityProps) {
  const rounds = useMemo(
    () => roundTargets(targets, Math.min(spec.rounds, targets.length)),
    [targets, spec.rounds],
  );
  const [round, setRound] = useState(0);
  const [stage, setStage] = useState<Stage>("hear");
  const [lit, setLit] = useState(-1);
  const [sweep, setSweep] = useState(0);
  const [result, setResult] = useState<"match" | "close" | null>(null);
  const [listening, setListening] = useState(false);
  const r = useReaction();
  const alive = useAlive();
  const prompt = promptOf(spec, "readTogether");
  const item = rounds[round]!;
  const segs = (item.segments ?? []).map((id) => nooraniItems[id]!).filter(Boolean);

  const demo = async (it: NooraniItem) => {
    const parts = (it.segments ?? []).map((id) => nooraniItems[id]!);
    setResult(null);
    setLit(-1);
    setStage("hear");
    r.listen();
    await sayItem(it);
    if (!alive.current) return;
    await wait(300);
    setStage("split");
    for (let i = 0; i < parts.length; i++) {
      if (!alive.current) return;
      setLit(i);
      await sayItem(parts[i]!);
      await wait(250);
    }
    if (!alive.current) return;
    setLit(-1);
    setStage("merge");
    await wait(700);
    if (!alive.current) return;
    setStage("joined");
    setSweep((s) => s + 1);
    await sayItem(it);
    if (!alive.current) return;
    setStage("turn");
    r.setPose("point");
  };
  useOnMount(() => {
    void sayPhrase(prompt).then(() => {
      if (alive.current) void demo(rounds[0]!);
    });
  });

  const mic = async () => {
    if (listening) return;
    setListening(true);
    r.listen();
    const heard = await listenArabic(6000);
    if (!alive.current) return;
    setListening(false);
    const v = judge(heard, item);
    if (v === "none") {
      r.setPose("think");
      void sayPhrase("yourTurn");
      return;
    }
    setResult(v);
    r.right();
    onResult({ itemId: item.id, correct: true, firstTry: v === "match" });
    void saySuccess(item);
  };
  const said = () => {
    setResult("close");
    r.right();
    onResult({ itemId: item.id, correct: true, firstTry: false });
    void saySuccess(item);
  };
  const next = () => {
    stopListening();
    if (round + 1 >= rounds.length) {
      onDone();
      return;
    }
    setRound(round + 1);
    void demo(rounds[round + 1]!);
  };

  const together = stage === "merge" || stage === "joined" || stage === "turn";
  return (
    <ActivityFrame
      who={player}
      pose={r.pose}
      instruction={phrases[prompt].ar}
      hint={phrases[prompt].en ?? ""}
      burst={r.burst}
      round={round}
      total={rounds.length}
    >
      <div className="flex min-h-64 flex-col items-center justify-center">
        {stage === "hear" ? (
          <div
            key={`h-${round}`}
            className="grid min-h-40 min-w-40 animate-pop-in place-items-center rounded-[2.5rem] border-4 border-card bg-card px-6 shadow-xl"
          >
            <span className="text-5xl" aria-label="Listen">
              👂
            </span>
          </div>
        ) : stage === "split" || stage === "merge" ? (
          // segmented cards, laid out right-to-left; the gap closes to show them joining
          <div
            dir="rtl"
            className={cn(
              "flex items-center transition-[gap] duration-700 ease-in-out",
              together ? "gap-0" : segs.length > 2 ? "gap-3 sm:gap-8" : "gap-6 sm:gap-10",
            )}
          >
            {segs.map((s, i) => (
              <div
                key={s.id + i}
                className={cn(
                  segs.length > 2
                    ? "grid h-28 w-24 place-items-center rounded-[2rem] border-4 bg-card shadow-lg transition-all duration-300 sm:h-36 sm:w-32"
                    : "grid h-32 w-28 place-items-center rounded-[2rem] border-4 bg-card shadow-lg transition-all duration-300 sm:h-36 sm:w-32",
                  lit === i
                    ? "-translate-y-2 scale-105 border-secondary bg-secondary/25"
                    : "border-card",
                  together && "rounded-none first:rounded-s-[2rem] last:rounded-e-[2rem]",
                )}
              >
                <MarkedGlyph item={s} emphasis={lit === i} className="text-7xl" />
              </div>
            ))}
          </div>
        ) : (
          <div
            key={`j-${round}`}
            className="relative animate-pop-in rounded-[2.5rem] border-4 border-card bg-card px-8 pb-3 shadow-xl"
          >
            <Glyph className="text-[6.5rem] sm:text-[7.5rem]">{item.glyph}</Glyph>
            <span
              key={sweep}
              aria-hidden
              className="absolute inset-x-6 bottom-3 h-2 animate-blend-sweep rounded-full bg-secondary"
            />
          </div>
        )}
        {stage !== "hear" ? (
          // the segmentation stays visible underneath once joined: بَ + تَ → بَتَ
          <div
            dir="rtl"
            className={cn(
              "mt-3 flex items-center gap-2 text-muted-foreground transition-opacity",
              stage === "split" ? "opacity-0" : "opacity-100",
            )}
          >
            {segs.map((s, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 ? <span className="text-2xl font-black">+</span> : null}
                <Glyph className="text-4xl">{s.glyph}</Glyph>
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {stage === "turn" ? (
        <div className="mt-2 flex flex-col items-center gap-3">
          <Ar className="text-xl font-black">{phrases.yourTurn.ar}</Ar>
          <div className="flex h-7 justify-center">
            {result === "match" ? (
              <Stars value={3} />
            ) : result === "close" ? (
              <Stars value={2} />
            ) : null}
          </div>
          <div dir="rtl" className="flex items-center justify-center gap-3">
            <GameButton
              tone="sky"
              onClick={() => void demo(item)}
              aria-label="Show me again"
              className="grid h-14 w-14 place-items-center rounded-full p-0"
            >
              <RotateCcw className="h-6 w-6" />
            </GameButton>
            {canListen() && !result ? (
              <GameButton
                tone="berry"
                onClick={() => void mic()}
                aria-label="Read into the microphone"
                className="relative grid h-20 w-20 place-items-center rounded-full p-0"
              >
                {listening ? (
                  <span
                    aria-hidden
                    className="absolute inset-0 animate-ripple rounded-full bg-accent"
                  />
                ) : null}
                <Mic className="relative h-9 w-9" />
              </GameButton>
            ) : null}
            {!result ? (
              <GameButton
                tone="mint"
                onClick={said}
                aria-label="I said it"
                className="flex h-14 items-center gap-2 rounded-full px-4"
              >
                <Check className="h-5 w-5" />
                <Ar className="text-lg font-black">قُلْتُهَا</Ar>
              </GameButton>
            ) : null}
            <GameButton
              tone="sun"
              onClick={next}
              aria-label="Next"
              className="grid h-16 w-16 place-items-center rounded-full p-0"
            >
              <ChevronLeft className="h-8 w-8" />
            </GameButton>
          </div>
        </div>
      ) : null}
    </ActivityFrame>
  );
}
