// WHICH ONE SOUNDS DIFFERENT? Three stones speak; two say the same letter. Tap the odd one.
// Distractors come from the letter's sound-/look-alikes so the ear learns real Qaida contrasts.
import { useMemo, useState } from "react";
import { Volume2 } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { phrases, type NooraniItem } from "@/data/noorani";
import { sayEncourage, sayInOrder, sayItem, sayPhrase, saySuccess } from "@/lib/nooraniAudio";
import { cn } from "@/lib/utils";
import { ActivityFrame, Glyph, choicesFor, roundTargets, useAlive, useOnMount, useReaction, type ActivityProps } from "../ui";

const NUMS = ["١", "٢", "٣"];

export function WhichIsDifferent({ targets, pool, spec, player, onResult, onDone }: ActivityProps) {
  const rounds = useMemo(() => roundTargets(targets, spec.rounds).map((t, i) => {
    const other = choicesFor(t, pool, 2).find((c) => c.id !== t.id) ?? t;
    // Alternate which one is odd so the child must really listen.
    const odd = i % 2 === 0 ? other : t;
    const same = odd === t ? other : t;
    const cards = [same, same, odd].sort(() => Math.random() - 0.5);
    return { target: t, odd, cards };
  }), [targets, pool, spec.rounds]);
  const [round, setRound] = useState(0);
  const [lit, setLit] = useState(-1);
  const [listened, setListened] = useState(false);
  const [missed, setMissed] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const r = useReaction();
  const alive = useAlive();
  const cur = rounds[round]!;

  const playAll = async (cards: NooraniItem[] = cur.cards) => {
    r.listen(); setListened(false);
    await sayInOrder(cards, setLit);
    if (alive.current) { setLit(-1); setListened(true); }
  };
  useOnMount(() => { void sayPhrase("different").then(() => { if (alive.current) void playAll(); }); });

  const pick = (i: number) => {
    if (solved || missed.includes(i)) return;
    const card = cur.cards[i]!;
    if (card.id === cur.odd.id) {
      setSolved(true); r.right();
      onResult({ itemId: cur.target.id, correct: true, firstTry: missed.length === 0 });
      void saySuccess(cur.odd).then(() => {
        if (!alive.current) return;
        if (round + 1 >= rounds.length) { onDone(); return; }
        setRound(round + 1); setMissed([]); setSolved(false);
        setTimeout(() => void playAll(rounds[round + 1]!.cards), 200);
      });
    } else {
      if (missed.length === 0) onResult({ itemId: cur.target.id, correct: false, firstTry: false });
      setMissed([...missed, i]); r.wrong();
      void sayEncourage().then(() => { if (alive.current) void playAll(); });
    }
  };

  return (
    <ActivityFrame who={player} pose={r.pose} instruction={phrases.different.ar} hint="Listen to all three — tap the one that sounds different" burst={r.burst} round={round} total={rounds.length}>
      <div dir="rtl" className="mx-auto mt-8 grid w-full max-w-md grid-cols-3 gap-3">
        {cur.cards.map((c, i) => (
          <div key={`${round}-${i}`} className="flex flex-col items-center gap-2">
            <button
              onClick={() => pick(i)}
              aria-label={`Stone ${i + 1}`}
              className={cn(
                "grid aspect-[5/4] w-full place-items-center rounded-[50%] border-4 shadow-[0_6px_0_var(--neutral-shadow)] transition-all active:translate-y-1 active:shadow-none",
                lit === i ? "scale-110 border-secondary bg-secondary/35" : "border-card bg-[oklch(0.85_0.02_70)]",
                solved && c.id === cur.odd.id && "border-success bg-success/30",
                missed.includes(i) && "opacity-40",
              )}
            >
              {solved ? <Glyph className="animate-pop-in text-6xl">{c.glyph}</Glyph> : <span className="font-arabic text-4xl font-black text-foreground/60">{NUMS[i]}</span>}
            </button>
            <GameButton tone="neutral" onClick={() => { r.listen(); setLit(i); void sayItem(c).then(() => setLit(-1)); }} aria-label={`Hear stone ${i + 1}`} className="grid h-11 w-11 place-items-center rounded-full p-0">
              <Volume2 className="h-5 w-5" />
            </GameButton>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <GameButton tone="sky" onClick={() => void playAll()} className="flex items-center gap-2 rounded-full px-6 py-3 text-lg">
          <Volume2 className="h-6 w-6" /> <span className="font-arabic font-black" lang="ar">اسْمَعِ الثَّلَاثَة</span>
        </GameButton>
      </div>
      {!listened && !solved ? <p className="mt-3 text-center text-xs font-bold text-muted-foreground">Listening…</p> : null}
    </ActivityFrame>
  );
}
