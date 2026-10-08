// SPOT THE MARK (Level 4: "أَيْنَ السُّكُون؟"). One letter in all its forms — بَ بِ بُ بْ — in a
// fresh random order each round, all drawn the same way: only reading the marks finds the answer.
// A wrong tap is spoken back ("that's بَ") so the child hears why it isn't the one.
import { useMemo, useState } from "react";
import { ALL_MARKS, phrases, withMark, type NooraniItem } from "@/data/noorani";
import { sayItem, sayPhrase, saySuccess } from "@/lib/nooraniAudio";
import { cn } from "@/lib/utils";
import {
  ActivityFrame,
  Glyph,
  promptOf,
  useAlive,
  useOnMount,
  useReaction,
  type ActivityProps,
} from "../ui";

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

export function Spot({ targets, pool, spec, player, onResult, onDone }: ActivityProps) {
  const mark = spec.mark ?? "sukoon";
  // One round per letter that has the mark; the letter's other forms come from the syllable model.
  const rounds = useMemo(() => {
    const withTheMark = [...targets, ...pool].filter(
      (t) => t.haraka === mark && t.letter && t.letter !== "ا",
    );
    const unique = [...new Map(withTheMark.map((t) => [t.id, t])).values()];
    const fromTargets = targets
      .filter((t) => t.haraka && t.haraka !== mark && t.letter !== "ا")
      .map((t) => withMark(t, mark));
    const list = shuffle([
      ...new Map([...unique, ...fromTargets].map((t) => [t.id, t])).values(),
    ]).slice(0, spec.rounds);
    return list.map((t) => ({ target: t, forms: shuffle(ALL_MARKS.map((h) => withMark(t, h))) }));
  }, [targets, pool, mark, spec.rounds]);
  const [round, setRound] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const r = useReaction();
  const alive = useAlive();
  const prompt = promptOf(spec, "spotSukoon");
  useOnMount(() => {
    void sayPhrase(prompt);
  });

  const cur = rounds[round];
  if (!cur) return null;

  const pick = async (f: NooraniItem) => {
    if (solved || missed.includes(f.id)) return;
    if (f.id === cur.target.id) {
      setSolved(true);
      r.right();
      onResult({ itemId: cur.target.id, correct: true, firstTry: missed.length === 0 });
      await sayItem(f);
      if (!alive.current) return;
      await saySuccess(f);
      if (!alive.current) return;
      if (round + 1 >= rounds.length) return onDone();
      setRound(round + 1);
      setMissed([]);
      setSolved(false);
    } else {
      if (!missed.length) onResult({ itemId: cur.target.id, correct: false, firstTry: false });
      setMissed([...missed, f.id]);
      r.wrong();
      await sayItem(f); // "that's بَ"
      if (alive.current) void sayPhrase(prompt);
    }
  };

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
      <div dir="rtl" className="mx-auto grid w-full max-w-md grid-cols-2 gap-3">
        {cur.forms.map((f) => (
          <button
            key={`${round}-${f.id}`}
            onClick={() => void pick(f)}
            aria-label={f.en}
            className={cn(
              "grid h-32 animate-pop-in place-items-center rounded-[2rem] border-4 bg-card shadow-[0_6px_0_var(--neutral-shadow)] transition-all active:translate-y-1 active:shadow-none",
              solved && f.id === cur.target.id
                ? "scale-105 border-success bg-success/25"
                : "border-card",
              missed.includes(f.id) &&
                "animate-verb-shake opacity-40 [animation-iteration-count:1]",
              missed.length >= 2 &&
                !solved &&
                f.id === cur.target.id &&
                "ring-4 ring-primary ring-offset-2 ring-offset-background",
            )}
          >
            <Glyph className="text-8xl">{f.glyph}</Glyph>
          </button>
        ))}
      </div>
    </ActivityFrame>
  );
}
