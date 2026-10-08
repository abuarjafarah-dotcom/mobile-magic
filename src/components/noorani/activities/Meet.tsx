// HEAR + SEE: meet each target once. Exposure only — no scoring.
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { phrases } from "@/data/noorani";
import { sayItem, sayPhrase } from "@/lib/nooraniAudio";
import { ActivityFrame, Glyph, Guide, SoundButton, useAlive, useOnMount, useReaction, type ActivityProps } from "../ui";

export function Meet({ targets, player, onDone }: ActivityProps) {
  const [i, setI] = useState(0);
  const [heard, setHeard] = useState(false);
  const [playing, setPlaying] = useState(false);
  const r = useReaction();
  const alive = useAlive();
  const item = targets[i]!;

  const play = async () => {
    setPlaying(true); r.listen();
    await sayItem(item);
    setPlaying(false); setHeard(true); r.setPose("thumbs");
  };
  useOnMount(() => { void sayPhrase("meet").then(() => { if (alive.current) void play(); }); });

  const next = () => {
    if (i + 1 >= targets.length) { onDone(); return; }
    setI(i + 1); setHeard(false);
    setTimeout(() => { setPlaying(true); r.listen(); void sayItem(targets[i + 1]!).then(() => { setPlaying(false); setHeard(true); }); }, 250);
  };

  return (
    <ActivityFrame who={player} pose={r.pose} instruction={phrases.meet.ar} hint="Tap the letter to hear it" burst={r.burst} round={i} total={targets.length}>
      <div className="relative mt-4 flex flex-1 flex-col items-center justify-center">
        <Guide pose={playing ? "listen" : "point"} className="absolute -start-2 bottom-2 h-28 w-24 sm:h-36 sm:w-32" />
        <button
          key={item.id}
          onClick={play}
          aria-label={`Hear ${item.en}`}
          className="grid h-56 w-56 animate-pop-in place-items-center rounded-[2.5rem] border-4 border-card bg-gradient-to-b from-card to-muted shadow-xl transition-transform active:scale-95 sm:h-64 sm:w-64"
        >
          <Glyph className="text-[9rem] text-foreground sm:text-[10rem]">{item.glyph}</Glyph>
        </button>
        <span className="mt-2 text-sm font-bold text-muted-foreground">{item.en}</span>
      </div>
      <div className="mt-4 flex items-center justify-center gap-4 pb-2">
        <SoundButton onPlay={play} playing={playing} />
        <GameButton tone="mint" disabled={!heard} onClick={next} aria-label="Next" className="grid h-20 w-20 place-items-center rounded-full p-0">
          <ChevronLeft className="h-10 w-10" />
        </GameButton>
      </div>
    </ActivityFrame>
  );
}
