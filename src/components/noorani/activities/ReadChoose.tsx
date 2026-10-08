// READ IT (Level 2) / READ WITHOUT AUDIO (Level 3): LISTEN → RECOGNISE → READ.
// Phase 1: a strip of syllables or readings — tap each to hear it (the demonstration).
// Phase 2: the audio goes away; read each one and pick the matching sound from three.
import { useMemo, useState } from "react";
import { BookOpen, Check } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { phrases, type NooraniItem } from "@/data/noorani";
import { sayItem, sayPhrase } from "@/lib/nooraniAudio";
import { cn } from "@/lib/utils";
import {
  ActivityFrame,
  Ar,
  Glyph,
  promptOf,
  roundTargets,
  useAlive,
  useOnMount,
  useReaction,
  type ActivityProps,
} from "../ui";
import { PickSoundRound } from "./rounds";

export function ReadChoose({ targets, spec, player, onResult, onDone }: ActivityProps) {
  const items = useMemo(
    () => roundTargets(targets, Math.min(spec.rounds, targets.length)),
    [targets, spec.rounds],
  );
  const [phase, setPhase] = useState<"listen" | "read">("listen");
  const [heard, setHeard] = useState<string[]>([]);
  const [lit, setLit] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const r = useReaction();
  const alive = useAlive();
  const prompt = promptOf(spec, "readIt");

  useOnMount(() => {
    void sayPhrase(prompt);
  });

  const tap = async (it: NooraniItem) => {
    setLit(it.id);
    r.listen();
    setHeard((h) => (h.includes(it.id) ? h : [...h, it.id]));
    await sayItem(it);
    if (alive.current) setLit((x) => (x === it.id ? null : x));
  };
  const allHeard = items.every((i) => heard.includes(i.id));

  if (phase === "listen") {
    return (
      <ActivityFrame
        who={player}
        pose={r.pose}
        instruction={phrases[prompt].ar}
        hint={
          phrases[prompt].en
            ? `${phrases[prompt].en} — tap each one to hear it`
            : "Tap each one to hear it"
        }
        burst={r.burst}
      >
        <div
          dir="rtl"
          className={cn(
            "mx-auto grid w-full max-w-md gap-3",
            items.some((i) => i.glyph.length > 4)
              ? "grid-cols-2"
              : "grid-cols-2 min-[420px]:grid-cols-4",
          )}
        >
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => void tap(it)}
              aria-label={`Hear ${it.en}`}
              className={cn(
                "relative grid min-h-28 animate-pop-in place-items-center rounded-[2rem] border-4 bg-card px-2 shadow-[0_6px_0_var(--neutral-shadow)] transition-all active:translate-y-1 active:shadow-none",
                lit === it.id ? "scale-105 border-secondary bg-secondary/25" : "border-card",
              )}
            >
              {heard.includes(it.id) ? (
                <span className="absolute end-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-success text-success-foreground">
                  <Check className="h-4 w-4" />
                </span>
              ) : null}
              <Glyph className={it.glyph.length > 4 ? "text-5xl" : "text-7xl"}>{it.glyph}</Glyph>
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <GameButton
            tone="sun"
            disabled={!allHeard}
            onClick={() => {
              setPhase("read");
              r.setPose("point");
              void sayPhrase("readMode");
            }}
            className="flex items-center gap-3 rounded-full px-6 py-4 text-lg"
          >
            <BookOpen className="h-6 w-6" />
            <Ar className="text-xl font-black">الْآنَ اقْرَأْ</Ar>
          </GameButton>
        </div>
      </ActivityFrame>
    );
  }

  return (
    <ActivityFrame
      who={player}
      pose={r.pose}
      instruction={phrases.readMode.ar}
      hint={phrases.readMode.en ?? ""}
      burst={r.burst}
      round={round}
      total={items.length}
    >
      <PickSoundRound
        key={round}
        target={items[round]!}
        n={spec.choices ?? 3}
        react={r}
        onAnswer={(correct, firstTry) => onResult({ itemId: items[round]!.id, correct, firstTry })}
        onSolved={() => {
          if (round + 1 >= items.length) onDone();
          else setRound(round + 1);
        }}
      />
    </ActivityFrame>
  );
}
