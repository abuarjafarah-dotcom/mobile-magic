// SORT (Level 5): one card at a time — a letter with tanween — goes into its category:
// فَتْحَتَان · كَسْرَتَان · ضَمَّتَان. Tap the bin (tap-to-place) or drag the card onto it.
// Cards use many letters, so the child sorts by the mark, not by one remembered letter.
import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { HARAKA_NAME, MARK, TANWEEN, phrases, type Haraka, type NooraniItem } from "@/data/noorani";
import { sayItem, sayPhrase } from "@/lib/nooraniAudio";
import { cn } from "@/lib/utils";
import {
  ActivityFrame,
  Glyph,
  MarkOnly,
  promptOf,
  roundTargets,
  useAlive,
  useOnMount,
  useReaction,
  type ActivityProps,
} from "../ui";

export function Sort({ targets, spec, player, onResult, onDone }: ActivityProps) {
  const bins: Haraka[] = Array.isArray(spec.mark) ? spec.mark : TANWEEN;
  const cards = useMemo(
    () =>
      roundTargets(
        targets.filter((t) => t.haraka && bins.includes(t.haraka)),
        spec.rounds,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [targets, spec.rounds],
  );
  const [i, setI] = useState(0);
  const [placed, setPlaced] = useState<Record<string, NooraniItem[]>>({});
  const [missed, setMissed] = useState(false);
  const [shake, setShake] = useState<Haraka | null>(null);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [over, setOver] = useState<Haraka | null>(null);
  const [busy, setBusy] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const r = useReaction();
  const alive = useAlive();
  const prompt = promptOf(spec, "sortTanween");
  const card = cards[i];

  useOnMount(() => {
    void sayPhrase(prompt).then(() => {
      if (alive.current && cards[0]) void sayItem(cards[0]);
    });
  });
  if (!card) return null;

  const drop = async (bin: Haraka) => {
    if (busy) return;
    if (bin === card.haraka) {
      setBusy(true);
      r.right();
      onResult({ itemId: card.id, correct: true, firstTry: !missed });
      setPlaced((p) => ({ ...p, [bin]: [...(p[bin] ?? []), card] }));
      await sayItem(card);
      if (!alive.current) return;
      setBusy(false);
      setMissed(false);
      if (i + 1 >= cards.length) return onDone();
      setI(i + 1);
      void sayItem(cards[i + 1]!);
    } else {
      if (!missed) onResult({ itemId: card.id, correct: false, firstTry: false });
      setMissed(true);
      setShake(bin);
      setTimeout(() => setShake(null), 500);
      r.wrong();
      await sayPhrase("again");
      if (alive.current) void sayItem(card);
    }
  };

  const binAt = (x: number, y: number) =>
    document
      .elementsFromPoint(x, y)
      .map((el) => (el as HTMLElement).dataset?.bin as Haraka | undefined)
      .find(Boolean) ?? null;
  const onDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    setDrag({ x: e.clientX, y: e.clientY });
  };
  const onMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    setDrag({ x: e.clientX, y: e.clientY });
    setOver(binAt(e.clientX, e.clientY));
  };
  const onUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const s = start.current;
    start.current = null;
    setDrag(null);
    setOver(null);
    const moved = s ? Math.hypot(e.clientX - s.x, e.clientY - s.y) >= 12 : false;
    if (!moved) return void sayItem(card); // a tap on the card plays it
    const bin = binAt(e.clientX, e.clientY);
    if (bin) void drop(bin);
  };

  return (
    <ActivityFrame
      who={player}
      pose={r.pose}
      instruction={phrases[prompt].ar}
      hint="Tap a basket — or drag the card into it"
      burst={r.burst}
      round={i}
      total={cards.length}
    >
      <div className="flex justify-center">
        <button
          key={card.id + i}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={() => {
            setDrag(null);
            setOver(null);
            start.current = null;
          }}
          aria-label={`Card ${card.en} — tap to hear`}
          className={cn(
            "grid h-40 w-40 touch-none animate-pop-in place-items-center rounded-[2rem] border-4 border-card bg-card shadow-xl",
            drag && "opacity-30",
          )}
        >
          <Glyph className="text-[7rem]">{card.glyph}</Glyph>
        </button>
      </div>

      <div dir="rtl" className="mx-auto mt-6 grid w-full max-w-md grid-cols-3 gap-3">
        {bins.map((b) => (
          <button
            key={b}
            data-bin={b}
            onClick={() => void drop(b)}
            aria-label={HARAKA_NAME[b].en}
            className={cn(
              "flex min-h-44 flex-col items-center rounded-3xl border-4 bg-[oklch(0.86_0.06_75)] p-2 shadow-[0_6px_0_oklch(0.62_0.08_60)] transition-all active:translate-y-1 active:shadow-none",
              over === b ? "scale-105 border-primary" : "border-[oklch(0.72_0.08_65)]",
              shake === b && "animate-verb-shake [animation-iteration-count:1]",
            )}
          >
            <MarkOnly mark={MARK[b]} className="pointer-events-none text-6xl leading-[1.2]" />
            <span lang="ar" className="pointer-events-none font-arabic text-lg font-black">
              {HARAKA_NAME[b].ar}
            </span>
            <span className="pointer-events-none flex flex-wrap justify-center gap-1">
              {(placed[b] ?? []).map((p, k) => (
                <span
                  key={k}
                  className="grid h-9 min-w-9 animate-pop-in place-items-center rounded-lg bg-card px-1 shadow-sm"
                >
                  <Glyph className="text-2xl leading-none" centerOn={false}>
                    {p.glyph}
                  </Glyph>
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>

      {drag ? (
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-3xl bg-card/95 shadow-2xl"
          style={{ left: drag.x, top: drag.y }}
        >
          <Glyph className="text-7xl">{card.glyph}</Glyph>
        </div>
      ) : null}
    </ActivityFrame>
  );
}
