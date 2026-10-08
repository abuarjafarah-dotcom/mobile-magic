// IDENTIFY: hear the target, tap it among 2–4 choices. Also powers Quick Review.
import { useMemo, useState } from "react";
import { phrases, type PhraseId } from "@/data/noorani";
import { sayEncourage, sayItem, sayPhrase, saySuccess } from "@/lib/nooraniAudio";
import { cn } from "@/lib/utils";
import {
  ActivityFrame,
  Glyph,
  SoundButton,
  choicesFor,
  roundTargets,
  promptOf,
  useAlive,
  useOnMount,
  useReaction,
  type ActivityProps,
} from "../ui";

export function ListenAndFind({
  targets,
  pool,
  spec,
  player,
  onResult,
  onDone,
  prompt: promptProp,
  ordered = false,
}: ActivityProps & { prompt?: PhraseId; ordered?: boolean }) {
  const prompt = promptProp ?? promptOf(spec, "listenFind");
  const rounds = useMemo(
    () => (ordered ? targets.slice(0, spec.rounds) : roundTargets(targets, spec.rounds)),
    [targets, spec.rounds, ordered],
  );
  const [round, setRound] = useState(0);
  const [misses, setMisses] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [playing, setPlaying] = useState(false);
  const r = useReaction();
  const alive = useAlive();
  const target = rounds[round]!;
  const choices = useMemo(
    () => choicesFor(target, pool, spec.choices ?? 3, spec.mark),
    [target, pool, spec.choices, spec.mark],
  );

  const play = async (item = target) => {
    setPlaying(true);
    r.listen();
    await sayItem(item);
    setPlaying(false);
  };
  useOnMount(() => {
    void sayPhrase(prompt).then(() => {
      if (alive.current) void play();
    });
  });

  const pick = (id: string) => {
    if (solved || misses.includes(id)) return;
    if (id === target.id) {
      setSolved(true);
      r.right();
      onResult({ itemId: target.id, correct: true, firstTry: misses.length === 0 });
      void saySuccess(target).then(() => {
        if (!alive.current) return;
        if (round + 1 >= rounds.length) {
          onDone();
          return;
        }
        const next = rounds[round + 1]!;
        setRound(round + 1);
        setMisses([]);
        setSolved(false);
        void play(next);
      });
    } else {
      setMisses([...misses, id]);
      r.wrong();
      if (misses.length === 0) onResult({ itemId: target.id, correct: false, firstTry: false });
      void sayEncourage(target);
    }
  };

  const hint = misses.length >= 2;
  return (
    <ActivityFrame
      who={player}
      pose={r.pose}
      instruction={phrases[prompt].ar}
      hint={phrases[prompt].en ?? "Listen, then tap what you hear"}
      burst={r.burst}
      round={round}
      total={rounds.length}
    >
      <div className="mt-5 flex justify-center">
        <SoundButton onPlay={() => void play()} playing={playing} label="Hear it again" />
      </div>
      <div
        dir="rtl"
        className={cn(
          "mx-auto mt-6 grid w-full max-w-md gap-3",
          choices.length === 4
            ? "grid-cols-2"
            : choices.length === 2
              ? "grid-cols-2"
              : "grid-cols-3",
        )}
      >
        {choices.map((c) => {
          const right = solved && c.id === target.id;
          const missed = misses.includes(c.id);
          return (
            <button
              key={`${round}-${c.id}`}
              onClick={() => pick(c.id)}
              aria-label={c.en}
              className={cn(
                "grid aspect-square animate-pop-in place-items-center rounded-[2rem] border-4 bg-card shadow-[0_6px_0_var(--neutral-shadow)] transition-[transform,opacity,background-color] active:translate-y-1 active:shadow-none",
                right ? "border-success bg-success/25 scale-105" : "border-card",
                missed && "animate-verb-shake opacity-40 [animation-iteration-count:1]",
                hint &&
                  c.id === target.id &&
                  !solved &&
                  "ring-4 ring-primary ring-offset-2 ring-offset-background",
              )}
            >
              <Glyph
                className={c.glyph.length > 4 ? "text-4xl sm:text-5xl" : "text-7xl sm:text-8xl"}
              >
                {c.glyph}
              </Glyph>
            </button>
          );
        })}
      </div>
    </ActivityFrame>
  );
}
