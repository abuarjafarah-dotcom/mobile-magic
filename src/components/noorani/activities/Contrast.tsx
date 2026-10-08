// SAME LETTER, DIFFERENT SOUND: the bare letter branches into its three syllables. The child taps
// each and hears the change. Shape, a labelled mark and position carry the idea — not colour alone.
import { useMemo, useState } from "react";
import { Check, ChevronLeft } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { HARAKA_NAME, HARAKAT, phrases, type NooraniItem } from "@/data/noorani";
import { sayItem, sayPhrase } from "@/lib/nooraniAudio";
import { cn } from "@/lib/utils";
import {
  ActivityFrame,
  Glyph,
  MarkedGlyph,
  promptOf,
  useAlive,
  useOnMount,
  useReaction,
  type ActivityProps,
} from "../ui";

export function Contrast({ targets, spec, player, onResult, onDone }: ActivityProps) {
  // One round per letter, harakat always in the same order (fatha → kasra → damma, right to left).
  const rounds = useMemo(() => {
    const byLetter = new Map<string, NooraniItem[]>();
    for (const t of targets)
      if (t.letter && t.haraka) byLetter.set(t.letter, [...(byLetter.get(t.letter) ?? []), t]);
    return [...byLetter.values()]
      .map(
        (list) =>
          HARAKAT.map((h) => list.find((x) => x.haraka === h)).filter(Boolean) as NooraniItem[],
      )
      .slice(0, spec.rounds);
  }, [targets, spec.rounds]);
  const [round, setRound] = useState(0);
  const [heard, setHeard] = useState<string[]>([]);
  const [lit, setLit] = useState<string | null>(null);
  const r = useReaction();
  const alive = useAlive();
  const set = rounds[round] ?? [];
  const prompt = promptOf(spec, "contrast");

  useOnMount(() => {
    void sayPhrase(prompt);
  });

  const tap = async (item: NooraniItem) => {
    setLit(item.id);
    r.listen();
    if (!heard.includes(item.id)) {
      setHeard((h) => [...h, item.id]);
      onResult({ itemId: item.id, correct: true, firstTry: false });
    }
    await sayItem(item);
    if (!alive.current) return;
    setLit((x) => (x === item.id ? null : x));
    if (set.every((s) => s.id === item.id || heard.includes(s.id))) r.right();
  };

  const next = () => {
    if (round + 1 >= rounds.length) {
      onDone();
      return;
    }
    setRound(round + 1);
    setHeard([]);
    r.listen();
  };

  if (!set.length) return null;
  const all = set.every((s) => heard.includes(s.id));
  return (
    <ActivityFrame
      who={player}
      pose={r.pose}
      instruction={phrases[prompt].ar}
      hint={phrases[prompt].en ?? "Tap each one and listen"}
      burst={r.burst}
      round={round}
      total={rounds.length}
    >
      {/* the bare letter… */}
      <div className="flex flex-col items-center">
        <div
          key={round}
          className="grid h-28 w-28 animate-pop-in place-items-center rounded-3xl bg-card shadow-md"
        >
          <Glyph className="text-7xl text-foreground/70">{set[0]!.letter}</Glyph>
        </div>
        {/* …branches into three readings */}
        <svg
          viewBox="0 0 300 40"
          className="h-10 w-full max-w-sm text-muted-foreground"
          aria-hidden
        >
          <path
            d="M150 2 V18 M150 18 C150 30 250 26 250 38 M150 18 V38 M150 18 C150 30 50 26 50 38"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div dir="rtl" className="mx-auto grid w-full max-w-md grid-cols-3 gap-3">
        {set.map((s) => (
          <button
            key={`${round}-${s.id}`}
            onClick={() => void tap(s)}
            aria-label={`${s.glyph} ${HARAKA_NAME[s.haraka!].en}`}
            className={cn(
              "relative flex animate-pop-in flex-col items-center rounded-[2rem] border-4 bg-card pb-2 shadow-[0_6px_0_var(--neutral-shadow)] transition-transform active:translate-y-1 active:shadow-none",
              lit === s.id ? "scale-105 border-secondary" : "border-card",
            )}
          >
            {heard.includes(s.id) ? (
              <span className="absolute end-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-success text-success-foreground">
                <Check className="h-4 w-4" />
              </span>
            ) : null}
            <MarkedGlyph item={s} className="text-7xl sm:text-8xl" pulse={lit === s.id} />
            <span lang="ar" className="font-arabic text-lg font-black">
              {HARAKA_NAME[s.haraka!].ar}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground">
              {HARAKA_NAME[s.haraka!].en}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <GameButton
          tone="mint"
          disabled={!all}
          onClick={next}
          aria-label="Next"
          className="grid h-20 w-20 place-items-center rounded-full p-0"
        >
          <ChevronLeft className="h-10 w-10" />
        </GameButton>
      </div>
    </ActivityFrame>
  );
}
