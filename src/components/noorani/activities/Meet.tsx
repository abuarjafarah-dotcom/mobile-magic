// HEAR + SEE: meet each target once. Exposure only — no scoring.
// Syllables (Level 2) are grouped into harakah "chapters": a card introduces the mark, then each
// example is spelled the Qaida way (p. 29): letter name → harakah name → syllable, e.g. بَا · فَتْحَة · بَ.
import { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import {
  HARAKA_NAME,
  MARK,
  nooraniItems,
  phrases,
  type Haraka,
  type NooraniItem,
} from "@/data/noorani";
import { sayItem, sayPhrase } from "@/lib/nooraniAudio";
import {
  ActivityFrame,
  Glyph,
  Guide,
  MarkedGlyph,
  SoundButton,
  MarkOnly,
  promptOf,
  useAlive,
  useOnMount,
  useReaction,
  type ActivityProps,
} from "../ui";

type Card = { kind: "chapter"; haraka: Haraka } | { kind: "item"; item: NooraniItem };

const letterItem = (glyph: string) =>
  Object.values(nooraniItems).find(
    (i) => !i.haraka && !i.segments && (i.glyph === glyph || (glyph === "ي" && i.id === "ya")),
  );

export function Meet({ targets, spec, player, onDone }: ActivityProps) {
  const cards = useMemo<Card[]>(() => {
    const out: Card[] = [];
    let last: Haraka | undefined;
    for (const t of targets) {
      if (t.haraka && t.haraka !== last) {
        out.push({ kind: "chapter", haraka: t.haraka });
        last = t.haraka;
      }
      out.push({ kind: "item", item: t });
    }
    return out;
  }, [targets]);
  const [i, setI] = useState(0);
  const [heard, setHeard] = useState(false);
  const [playing, setPlaying] = useState(false);
  const r = useReaction();
  const alive = useAlive();
  const card = cards[i]!;
  const prompt = promptOf(spec, "meet");

  const playCard = async (c: Card) => {
    setPlaying(true);
    r.listen();
    if (c.kind === "chapter") await sayPhrase(c.haraka);
    else if (c.item.haraka) {
      // أَ إِ أُ are spelled with hamza, as the Qaida does ("هَمْزَة فَتْحَة أَ").
      const letter = c.item.letter
        ? letterItem(c.item.letter === "ا" ? "ء" : c.item.letter)
        : undefined;
      if (letter) {
        await sayItem(letter);
        if (!alive.current) return;
      }
      await sayPhrase(c.item.haraka);
      if (!alive.current) return;
      await sayItem(c.item);
    } else await sayItem(c.item);
    if (!alive.current) return;
    setPlaying(false);
    setHeard(true);
    r.setPose("thumbs");
  };
  useOnMount(() => {
    void sayPhrase(prompt).then(() => {
      if (alive.current) void playCard(cards[0]!);
    });
  });

  const next = () => {
    if (i + 1 >= cards.length) {
      onDone();
      return;
    }
    setI(i + 1);
    setHeard(false);
    setTimeout(() => {
      if (alive.current) void playCard(cards[i + 1]!);
    }, 250);
  };

  return (
    <ActivityFrame
      who={player}
      pose={r.pose}
      instruction={phrases[prompt].ar}
      hint={phrases[prompt].en ?? "Tap to hear it again"}
      burst={r.burst}
      round={i}
      total={cards.length}
    >
      <div className="relative mt-4 flex flex-1 flex-col items-center justify-center">
        <Guide
          pose={playing ? "listen" : "point"}
          className="absolute -start-2 bottom-2 h-28 w-24 sm:h-36 sm:w-32"
        />
        <button
          key={i}
          onClick={() => void playCard(card)}
          aria-label="Hear it again"
          className="grid h-56 w-56 animate-pop-in place-items-center rounded-[2.5rem] border-4 border-card bg-gradient-to-b from-card to-muted shadow-xl transition-transform active:scale-95 sm:h-64 sm:w-64"
        >
          {card.kind === "chapter" ? (
            <span className="flex flex-col items-center">
              <MarkOnly mark={MARK[card.haraka]} className="text-[8rem] leading-none" />
            </span>
          ) : card.item.haraka ? (
            <MarkedGlyph item={card.item} className="text-[9rem] sm:text-[10rem]" />
          ) : (
            <Glyph className="text-[9rem] text-foreground sm:text-[10rem]">{card.item.glyph}</Glyph>
          )}
        </button>
        {card.kind === "chapter" ? (
          <div className="mt-3 text-center">
            <span dir="rtl" lang="ar" className="font-arabic block text-4xl font-black">
              {HARAKA_NAME[card.haraka].ar}
            </span>
            <span className="block text-sm font-bold text-muted-foreground">
              {HARAKA_NAME[card.haraka].en} — {HARAKA_NAME[card.haraka].sound}
            </span>
          </div>
        ) : card.item.haraka ? (
          <span
            dir="rtl"
            lang="ar"
            className="font-arabic mt-2 text-2xl font-black text-muted-foreground"
          >
            {HARAKA_NAME[card.item.haraka].ar}
          </span>
        ) : (
          <span className="mt-2 text-sm font-bold text-muted-foreground">{card.item.en}</span>
        )}
      </div>
      <div className="mt-4 flex items-center justify-center gap-4 pb-2">
        <SoundButton onPlay={() => void playCard(card)} playing={playing} />
        <GameButton
          tone="mint"
          disabled={!heard}
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
