// HARAKAH CHALLENGE (Level 2) / FIND THE CORRECT READING (Level 3).
// Rounds alternate text → sound and sound → text, so both directions are tested.
// The buddy brother holds the treasure chest; every solved round drops a gem into the row.
import { useMemo, useState } from "react";
import { Eye, Ear } from "lucide-react";
import { phrases } from "@/data/noorani";
import { sayPhrase } from "@/lib/nooraniAudio";
import { PLAYERS } from "@/lib/nooraniProgress";
import { cn } from "@/lib/utils";
import {
  ActivityFrame,
  Kid,
  promptOf,
  roundTargets,
  sprite,
  useOnMount,
  useReaction,
  type ActivityProps,
} from "../ui";
import { PickSoundRound, PickTextRound } from "./rounds";

const GEMS = ["💎", "🔷", "💚", "💜", "🔶", "❤️"];

export function Challenge({ targets, spec, player, onResult, onDone }: ActivityProps) {
  const rounds = useMemo(() => roundTargets(targets, spec.rounds), [targets, spec.rounds]);
  const [round, setRound] = useState(0);
  const [won, setWon] = useState(0);
  const r = useReaction();
  const buddy = PLAYERS.find((p) => p !== player) ?? player;
  const prompt = promptOf(spec, "harakahChallenge");
  const readFirst = round % 2 === 0; // even rounds: text → sound
  useOnMount(() => {
    void sayPhrase(prompt);
  });

  const target = rounds[round]!;
  const common = {
    target,
    n: spec.choices ?? 3,
    react: r,
    mark: spec.mark,
    onAnswer: (correct: boolean, firstTry: boolean) =>
      onResult({ itemId: target.id, correct, firstTry }),
    onSolved: () => {
      setWon((w) => w + 1);
      if (round + 1 >= rounds.length) onDone();
      else setRound(round + 1);
    },
  };

  return (
    <ActivityFrame
      who={player}
      pose={r.pose}
      instruction={phrases[prompt].ar}
      hint={readFirst ? "Read it, then pick the sound" : "Listen, then pick how it is written"}
      burst={r.burst}
      round={round}
      total={rounds.length}
    >
      <div
        className="mb-4 flex items-center justify-between gap-2 rounded-3xl bg-card/70 px-3 py-2"
        dir="rtl"
      >
        <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-card px-3 py-1 text-sm font-black shadow-sm">
          {readFirst ? <Eye className="h-4 w-4" /> : <Ear className="h-4 w-4" />}
          <span className="font-arabic" lang="ar">
            {readFirst ? "اقْرَأْ ← اسْمَعْ" : "اسْمَعْ ← اقْرَأْ"}
          </span>
        </span>
        <span className="flex gap-0.5" aria-label={`${won} gems`}>
          {rounds.map((_, i) => (
            <span
              key={i}
              className={cn(
                "text-base transition-all sm:text-xl",
                i < won ? "animate-pop-in" : "opacity-20 grayscale",
              )}
            >
              {GEMS[i % GEMS.length]}
            </span>
          ))}
        </span>
        <span className="flex items-end">
          <img src={sprite("item-chest")} alt="" aria-hidden className="h-10 w-12 object-contain" />
          <Kid
            who={buddy}
            pose={won > 0 && won === round ? "cheer" : "explain"}
            className="h-14 w-10"
          />
        </span>
      </div>
      {readFirst ? (
        <PickSoundRound key={round} {...common} />
      ) : (
        <PickTextRound key={round} {...common} />
      )}
    </ActivityFrame>
  );
}
