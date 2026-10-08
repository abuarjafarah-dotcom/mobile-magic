// HEAR & MATCH: tap a sound stone to hear it, then tap the letter it matches.
import { useMemo, useState } from "react";
import { Volume2 } from "lucide-react";
import { phrases, type NooraniItem } from "@/data/noorani";
import { sayEncourage, sayItem, sayPhrase, saySuccess } from "@/lib/nooraniAudio";
import { cn } from "@/lib/utils";
import {
  ActivityFrame,
  Glyph,
  roundTargets,
  useAlive,
  useOnMount,
  useReaction,
  type ActivityProps,
} from "../ui";

const PAIR_TINTS = [
  "bg-primary/30 border-primary",
  "bg-secondary/40 border-secondary",
  "bg-accent/30 border-accent",
  "bg-success/30 border-success",
];

export function HearAndMatch({ targets, spec, player, onResult, onDone }: ActivityProps) {
  const size = Math.min(spec.choices ?? 3, targets.length);
  const boards = useMemo(
    () => Array.from({ length: spec.rounds }, () => roundTargets(targets, size)),
    [targets, spec.rounds, size],
  );
  const [board, setBoard] = useState(0);
  const sounds = boards[board]!;
  const letters = useMemo(() => [...sounds].sort(() => Math.random() - 0.5), [sounds]);
  const [active, setActive] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [missed, setMissed] = useState<string[]>([]);
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const r = useReaction();
  const alive = useAlive();

  const hear = (item: NooraniItem) => {
    if (matched.includes(item.id)) return;
    setActive(item.id);
    r.listen();
    void sayItem(item);
  };
  useOnMount(() => {
    void sayPhrase("hearMatch").then(() => {
      if (alive.current) hear(sounds[0]!);
    });
  });

  const pickLetter = (item: NooraniItem) => {
    if (!active || matched.includes(item.id)) return;
    const target = sounds.find((s) => s.id === active)!;
    if (item.id === active) {
      const done = [...matched, item.id];
      setMatched(done);
      setActive(null);
      r.right();
      onResult({ itemId: item.id, correct: true, firstTry: !missed.includes(item.id) });
      void saySuccess(target).then(() => {
        if (!alive.current) return;
        if (done.length < sounds.length) {
          hear(sounds.find((s) => !done.includes(s.id))!);
          return;
        }
        if (board + 1 >= boards.length) {
          onDone();
          return;
        }
        setBoard(board + 1);
        setMatched([]);
        setMissed([]);
        const first = boards[board + 1]![0]!;
        setActive(first.id);
        void sayItem(first);
      });
    } else {
      r.wrong();
      setWrongFlash(item.id);
      setTimeout(() => setWrongFlash(null), 500);
      if (!missed.includes(active)) {
        setMissed([...missed, active]);
        onResult({ itemId: active, correct: false, firstTry: false });
      }
      void sayEncourage(target);
    }
  };

  const tintOf = (id: string) =>
    PAIR_TINTS[sounds.findIndex((s) => s.id === id) % PAIR_TINTS.length];

  return (
    <ActivityFrame
      who={player}
      pose={r.pose}
      instruction={phrases.hearMatch.ar}
      hint="Tap a sound, then tap its letter"
      burst={r.burst}
      round={board}
      total={boards.length}
    >
      <div dir="rtl" className="mx-auto mt-5 grid w-full max-w-md grid-cols-2 gap-x-6 gap-y-3">
        <div className="flex flex-col gap-3">
          {sounds.map((s, i) => {
            const done = matched.includes(s.id);
            return (
              <button
                key={`${board}-s-${s.id}`}
                onClick={() => hear(s)}
                aria-label={`Sound ${i + 1}`}
                className={cn(
                  "flex h-24 items-center justify-center gap-2 rounded-[50%] border-4 shadow-[0_5px_0_var(--neutral-shadow)] transition-all active:translate-y-1 active:shadow-none",
                  done
                    ? tintOf(s.id)
                    : active === s.id
                      ? "border-secondary bg-secondary/30 scale-105"
                      : "border-card bg-[oklch(0.86_0.02_70)]",
                )}
              >
                {done ? (
                  <Glyph className="text-5xl">{s.glyph}</Glyph>
                ) : (
                  <Volume2
                    className={cn(
                      "h-9 w-9 text-foreground/70",
                      active === s.id && "animate-character-speak",
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-3">
          {letters.map((l) => {
            const done = matched.includes(l.id);
            return (
              <button
                key={`${board}-l-${l.id}`}
                onClick={() => pickLetter(l)}
                aria-label={l.en}
                className={cn(
                  "grid h-24 place-items-center rounded-3xl border-4 bg-card shadow-[0_5px_0_var(--neutral-shadow)] transition-all active:translate-y-1 active:shadow-none",
                  done ? tintOf(l.id) : "border-card",
                  !active && !done && "opacity-80",
                  wrongFlash === l.id && "animate-verb-shake [animation-iteration-count:1]",
                )}
              >
                <Glyph className="text-6xl">{l.glyph}</Glyph>
              </button>
            );
          })}
        </div>
      </div>
    </ActivityFrame>
  );
}
