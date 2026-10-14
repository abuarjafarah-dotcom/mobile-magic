// READ IT (Level 2) / READ WITHOUT AUDIO (Level 3): LISTEN → RECOGNISE → READ.
// Phase 1: a strip of syllables or readings — tap each to hear it (the demonstration).
// Phase 2: the audio goes away; read each one and pick the matching sound from three.
// Variant "readFirst" (Level 4): skip the demonstration, pick sounds, then an independent
// reading mode — read it alone, tap "I read it", and only then hear the correct reading.
import { useMemo, useState } from "react";
import { BookOpen, Check, ChevronLeft, Volume2 } from "lucide-react";
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
  const [phase, setPhase] = useState<"listen" | "read" | "self">(
    spec.variant === "readFirst" ? "read" : "listen",
  );
  const [revealed, setRevealed] = useState(false);
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

  if (phase === "self") {
    const it = items[round]!;
    const reveal = async () => {
      setRevealed(true);
      r.right();
      onResult({ itemId: it.id, correct: true, firstTry: false });
      await sayItem(it);
    };
    const next = () => {
      setRevealed(false);
      if (round + 1 >= items.length) onDone();
      else setRound(round + 1);
    };
    return (
      <ActivityFrame
        who={player}
        pose={r.pose}
        instruction={phrases.selfRead.ar}
        hint={revealed ? "Listen — did you read it the same way?" : (phrases.selfRead.en ?? "")}
        burst={r.burst}
        round={round}
        total={items.length}
      >
        <div className="flex flex-col items-center">
          <div
            key={it.id}
            className={cn(
              "grid min-h-44 min-w-44 animate-pop-in place-items-center rounded-[2.5rem] border-4 bg-card px-6 shadow-xl",
              revealed ? "border-success" : "border-card",
            )}
          >
            <Glyph className={it.glyph.length > 4 ? "text-7xl sm:text-8xl" : "text-[8rem]"}>
              {it.glyph}
            </Glyph>
          </div>
          <div className="mt-6 flex items-center gap-3" dir="rtl">
            {!revealed ? (
              <GameButton
                tone="mint"
                onClick={() => void reveal()}
                aria-label="I read it"
                className="flex items-center gap-2 rounded-full px-6 py-4"
              >
                <Check className="h-6 w-6" />
                <Ar className="text-2xl font-black">قَرَأْتُهَا</Ar>
                <span className="text-xs font-bold opacity-80" dir="ltr">
                  I read it
                </span>
              </GameButton>
            ) : (
              <>
                <GameButton
                  tone="sky"
                  onClick={() => void sayItem(it)}
                  aria-label="Hear it again"
                  className="grid h-16 w-16 place-items-center rounded-full p-0"
                >
                  <Volume2 className="h-7 w-7" />
                </GameButton>
                <GameButton
                  tone="sun"
                  onClick={next}
                  aria-label="Next"
                  className="grid h-16 w-16 place-items-center rounded-full p-0"
                >
                  <ChevronLeft className="h-8 w-8" />
                </GameButton>
              </>
            )}
          </div>
        </div>
      </ActivityFrame>
    );
  }

  return (
    <ActivityFrame
      who={player}
      pose={r.pose}
      instruction={
        phase === "read" && spec.variant === "readFirst" ? phrases[prompt].ar : phrases.readMode.ar
      }
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
          if (round + 1 < items.length) setRound(round + 1);
          else if (spec.variant === "readFirst") {
            setRound(0);
            setPhase("self");
            r.setPose("point");
            void sayPhrase("selfRead");
          } else onDone();
        }}
        mark={spec.mark}
      />
    </ActivityFrame>
  );
}
