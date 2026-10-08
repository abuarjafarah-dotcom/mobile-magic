// Two single-round building blocks shared by Read It, Harakah Challenge and Find the Correct Reading.
//   PickSoundRound — text → sound: read the big Arabic, then choose which of three sounds matches.
//   PickTextRound  — sound → text: hear it, then choose which of three written forms matches.
// Options differ by one harakah (see choicesFor), so only decoding the marks finds the answer.
import { useMemo, useState } from "react";
import { Check, Volume2 } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import type { NooraniItem } from "@/data/noorani";
import { sayEncourage, sayItem, sayPhrase, saySuccess } from "@/lib/nooraniAudio";
import { cn } from "@/lib/utils";
import { Glyph, SoundButton, choicesFor, useAlive, useOnMount } from "../ui";

const NUMS = ["١", "٢", "٣", "٤"];
const sizeFor = (g: string, big: boolean) =>
  g.length > 4
    ? big
      ? "text-7xl sm:text-8xl"
      : "text-4xl sm:text-5xl"
    : big
      ? "text-[8rem]"
      : "text-7xl sm:text-8xl";

type RoundProps = {
  target: NooraniItem;
  n: number;
  onAnswer: (correct: boolean, firstTry: boolean) => void; // correct=false fires once on the first miss
  onSolved: () => void;
  react: { right: () => void; wrong: () => void; listen: () => void };
};

export function PickSoundRound({ target, n, onAnswer, onSolved, react }: RoundProps) {
  const options = useMemo(() => choicesFor(target, [], n), [target, n]);
  const [sel, setSel] = useState<number | null>(null);
  const [lit, setLit] = useState<number | null>(null);
  const [missed, setMissed] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const alive = useAlive();

  const hear = async (i: number) => {
    if (solved) return;
    setSel(i);
    setLit(i);
    react.listen();
    await sayItem(options[i]!);
    if (alive.current) setLit((x) => (x === i ? null : x));
  };
  const confirm = async () => {
    if (sel === null || solved) return;
    if (options[sel]!.id === target.id) {
      setSolved(true);
      react.right();
      onAnswer(true, missed.length === 0);
      await saySuccess(target);
      if (alive.current) onSolved();
    } else {
      if (!missed.length) onAnswer(false, false);
      const m = [...missed, sel];
      setMissed(m);
      setSel(null);
      react.wrong();
      await sayPhrase("again");
      if (alive.current && m.length >= 2) {
        const i = options.findIndex((o) => o.id === target.id);
        setLit(i);
        await sayItem(target);
        if (alive.current) setLit(null);
      }
    }
  };

  const correctIdx = options.findIndex((o) => o.id === target.id);
  return (
    <div className="flex flex-col items-center">
      <div className="grid min-h-44 min-w-44 animate-pop-in place-items-center rounded-[2.5rem] border-4 border-card bg-card px-6 shadow-xl">
        <Glyph className={sizeFor(target.glyph, true)}>{target.glyph}</Glyph>
      </div>
      <div dir="rtl" className="mt-6 grid w-full max-w-sm grid-cols-3 gap-3">
        {options.map((o, i) => (
          <button
            key={o.id}
            onClick={() => void hear(i)}
            aria-label={`Sound ${i + 1}`}
            className={cn(
              "relative flex h-24 flex-col items-center justify-center gap-1 rounded-3xl border-4 bg-card shadow-[0_5px_0_var(--neutral-shadow)] transition-all active:translate-y-1 active:shadow-none",
              sel === i ? "border-secondary bg-secondary/25" : "border-card",
              missed.includes(i) && "opacity-40",
              solved && i === correctIdx && "border-success bg-success/25",
              missed.length >= 2 &&
                !solved &&
                i === correctIdx &&
                "ring-4 ring-primary ring-offset-2 ring-offset-background",
            )}
          >
            {lit === i ? (
              <span
                aria-hidden
                className="absolute inset-0 animate-ripple rounded-3xl bg-secondary/40"
              />
            ) : null}
            <Volume2 className="relative h-8 w-8" />
            <span className="relative font-arabic text-xl font-black text-foreground/60">
              {NUMS[i]}
            </span>
          </button>
        ))}
      </div>
      <GameButton
        tone="mint"
        disabled={sel === null || solved}
        onClick={() => void confirm()}
        aria-label="This one"
        className="mt-5 grid h-20 w-20 place-items-center rounded-full p-0"
      >
        <Check className="h-10 w-10" />
      </GameButton>
    </div>
  );
}

export function PickTextRound({ target, n, onAnswer, onSolved, react }: RoundProps) {
  const options = useMemo(() => choicesFor(target, [], n), [target, n]);
  const [missed, setMissed] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [playing, setPlaying] = useState(false);
  const alive = useAlive();
  const play = async () => {
    setPlaying(true);
    react.listen();
    await sayItem(target);
    if (alive.current) setPlaying(false);
  };
  useOnMount(() => {
    void play();
  });

  const pick = async (o: NooraniItem) => {
    if (solved || missed.includes(o.id)) return;
    if (o.id === target.id) {
      setSolved(true);
      react.right();
      onAnswer(true, missed.length === 0);
      await saySuccess(target);
      if (alive.current) onSolved();
    } else {
      if (!missed.length) onAnswer(false, false);
      setMissed([...missed, o.id]);
      react.wrong();
      void sayEncourage(target);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <SoundButton onPlay={() => void play()} playing={playing} label="Hear it again" />
      <div
        dir="rtl"
        className="mt-6 grid w-full max-w-md grid-cols-1 gap-3 min-[420px]:grid-cols-3"
      >
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => void pick(o)}
            aria-label={o.en}
            className={cn(
              "grid min-h-24 animate-pop-in place-items-center rounded-[2rem] border-4 bg-card px-2 shadow-[0_6px_0_var(--neutral-shadow)] transition-all active:translate-y-1 active:shadow-none",
              solved && o.id === target.id
                ? "scale-105 border-success bg-success/25"
                : "border-card",
              missed.includes(o.id) && "opacity-40",
              missed.length >= 2 &&
                !solved &&
                o.id === target.id &&
                "ring-4 ring-primary ring-offset-2 ring-offset-background",
            )}
          >
            <Glyph className={sizeFor(o.glyph, false)}>{o.glyph}</Glyph>
          </button>
        ))}
      </div>
    </div>
  );
}
