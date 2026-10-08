// READ IT: the child reads the big letter into the microphone. Forgiving scoring:
// a clear match earns 3 stars, any attempt earns 2 and hears the model; nothing is ever "wrong".
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Check, Mic } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { phrases } from "@/data/noorani";
import { canListen, judge, listenArabic, stopListening } from "@/lib/arabicListen";
import { sayItem, sayPhrase, saySuccess } from "@/lib/nooraniAudio";
import { cn } from "@/lib/utils";
import { ActivityFrame, Glyph, SoundButton, Stars, roundTargets, sprite, useAlive, useOnMount, useReaction, type ActivityProps } from "../ui";

export function ReadAloud({ targets, spec, player, onResult, onDone }: ActivityProps) {
  const rounds = useMemo(() => roundTargets(targets, spec.rounds), [targets, spec.rounds]);
  const [round, setRound] = useState(0);
  const [state, setState] = useState<"idle" | "listening" | "match" | "close">("idle");
  const [silent, setSilent] = useState(0);
  const [recorded, setRecorded] = useState(false);
  const [denied, setDenied] = useState(!canListen());
  const [playing, setPlaying] = useState(false);
  const r = useReaction();
  const alive = useAlive();
  const target = rounds[round]!;
  useEffect(() => stopListening, []);

  useOnMount(() => { void sayPhrase("readAloud"); r.setPose("point"); });

  const model = async () => { setPlaying(true); r.listen(); await sayItem(target); setPlaying(false); };

  const next = () => {
    stopListening();
    if (round + 1 >= rounds.length) { onDone(); return; }
    setRound(round + 1); setState("idle"); setSilent(0); setRecorded(false); r.setPose("point");
    void sayPhrase("yourTurn");
  };

  const record = (firstTry: boolean) => { if (!recorded) { onResult({ itemId: target.id, correct: true, firstTry }); setRecorded(true); } };

  const mic = async () => {
    if (state === "listening") return;
    setState("listening"); r.listen();
    const heard = await listenArabic();
    if (!alive.current) return;
    if (heard.error === "denied" || heard.error === "unsupported") { setDenied(true); setState("idle"); return; }
    const verdict = judge(heard, target);
    if (verdict === "match") {
      setState("match"); r.right(); record(!recorded && silent === 0);
      await saySuccess(target);
      if (alive.current) setTimeout(() => { if (alive.current) next(); }, 400);
    } else if (verdict === "close") {
      setState("close"); r.setPose("thumbs"); record(false);
      await sayPhrase("close"); if (alive.current) await sayItem(target);
    } else {
      setState("idle"); setSilent((s) => s + 1); r.setPose("think");
      void sayPhrase("yourTurn");
    }
  };

  const selfCheck = () => { r.right(); record(false); setState("close"); void saySuccess(target); };

  return (
    <ActivityFrame who={player} pose={r.pose} instruction={phrases.readAloud.ar} hint="Tap the microphone and read the letter out loud" burst={r.burst} round={round} total={rounds.length}>
      <div className="relative mx-auto mt-4 w-full max-w-sm overflow-hidden rounded-[2rem] shadow-xl">
        <img src={sprite("station-speak")} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="relative grid h-60 place-items-center">
          <div key={target.id} className="grid h-48 w-48 animate-pop-in place-items-center rounded-[2.5rem] border-4 border-card bg-card/95 shadow-lg">
            <Glyph className="text-[8rem]">{target.glyph}</Glyph>
          </div>
        </div>
      </div>
      <div className="mt-2 flex h-7 justify-center">
        {state === "match" ? <Stars value={3} /> : state === "close" ? <Stars value={2} /> : null}
      </div>

      <div className="mt-2 flex items-center justify-center gap-4" dir="rtl">
        <SoundButton size="md" onPlay={() => void model()} playing={playing} label="Hear how it sounds" />
        {!denied ? (
          <GameButton tone="berry" onClick={() => void mic()} aria-label="Read into the microphone" className="relative grid h-24 w-24 place-items-center rounded-full p-0">
            {state === "listening" ? <span aria-hidden className="absolute inset-0 animate-ripple rounded-full bg-accent" /> : null}
            <Mic className={cn("relative h-11 w-11", state === "listening" && "animate-character-speak")} />
          </GameButton>
        ) : null}
        {denied || silent >= 2 ? (
          <GameButton tone="mint" onClick={selfCheck} aria-label="I said it" className="flex h-16 items-center gap-2 rounded-full px-5">
            <Check className="h-6 w-6" /><span className="font-arabic text-lg font-black" lang="ar">قُلْتُهَا</span>
          </GameButton>
        ) : null}
        {recorded && state !== "match" ? (
          <GameButton tone="sun" onClick={next} aria-label="Next" className="grid h-16 w-16 place-items-center rounded-full p-0"><ChevronLeft className="h-8 w-8" /></GameButton>
        ) : null}
      </div>
      {denied ? <p className="mt-3 text-center text-xs font-bold text-muted-foreground">Microphone not available here — a grown-up can tap ✓ after the child reads.</p> : null}
    </ActivityFrame>
  );
}
