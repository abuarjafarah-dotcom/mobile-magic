// ADD THE HARAKAH: hear a syllable, put the right harakah on the bare letter.
// Tap a harakah (or drag it onto the letter). The letter then shows — and says — what was built,
// so a wrong choice is heard too: "that's بُ, we wanted بِ".
import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  HARAKA_NAME,
  HARAKAT,
  MARK,
  withMark,
  phrases,
  type BuildSpec,
  type Haraka,
  type NooraniItem,
} from "@/data/noorani";
import { sayEncourage, sayItem, sayPhrase, saySuccess } from "@/lib/nooraniAudio";
import { cn } from "@/lib/utils";
import {
  ActivityFrame,
  Glyph,
  SoundButton,
  MarkOnly,
  promptOf,
  roundTargets,
  useAlive,
  useOnMount,
  useReaction,
  type ActivityProps,
} from "../ui";

type MarkSpec = Extract<BuildSpec, { kind: "mark" }>;

export function AddHarakah({ targets, spec, player, onResult, onDone }: ActivityProps) {
  const buildable = useMemo(() => targets.filter((t) => t.build?.kind === "mark"), [targets]);
  const rounds = useMemo(
    () => roundTargets(buildable, Math.min(spec.rounds, Math.max(buildable.length, 1))),
    [buildable, spec.rounds],
  );
  const [round, setRound] = useState(0);
  const [shown, setShown] = useState<NooraniItem | null>(null); // what the child built
  const [misses, setMisses] = useState(0);
  const [done, setDone] = useState(false);
  const [drag, setDrag] = useState<{ h: Haraka; x: number; y: number } | null>(null);
  const [over, setOver] = useState(false);
  const [playing, setPlaying] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const r = useReaction();
  const alive = useAlive();
  const target = rounds[round]!;
  const b = target.build as MarkSpec;
  const choices = b.choices ?? HARAKAT;
  const many = choices.length > 4; // Level 5's six marks: tighter layout so it fits a phone
  const prompt = promptOf(spec, "addHaraka");

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

  const place = async (h: Haraka) => {
    if (done) return;
    const built = h === b.mark ? target : withMark(target, h);
    setShown(built);
    if (h === b.mark) {
      setDone(true);
      r.right();
      onResult({ itemId: target.id, correct: true, firstTry: misses === 0 });
      await sayItem(target);
      if (!alive.current) return;
      await saySuccess(target);
      if (!alive.current) return;
      if (round + 1 >= rounds.length) {
        onDone();
        return;
      }
      const next = rounds[round + 1]!;
      setRound(round + 1);
      setShown(null);
      setMisses(0);
      setDone(false);
      void play(next);
    } else {
      if (misses === 0) onResult({ itemId: target.id, correct: false, firstTry: false });
      setMisses((m) => m + 1);
      r.wrong();
      await sayItem(built);
      if (!alive.current) return; // hear what was built
      await sayEncourage(target);
      if (!alive.current) return; // then the target again
      setShown(null);
    }
  };

  const onDown = (h: Haraka) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (done) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    setDrag({ h, x: e.clientX, y: e.clientY });
  };
  const hitLetter = (x: number, y: number) =>
    document.elementsFromPoint(x, y).some((el) => (el as HTMLElement).dataset?.zone === "letter");
  const onMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (drag) {
      setDrag({ ...drag, x: e.clientX, y: e.clientY });
      setOver(hitLetter(e.clientX, e.clientY));
    }
  };
  const onUp = (h: Haraka) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    const s = start.current;
    start.current = null;
    setDrag(null);
    setOver(false);
    const moved = s ? Math.hypot(e.clientX - s.x, e.clientY - s.y) >= 10 : false;
    if (!moved || hitLetter(e.clientX, e.clientY)) void place(h); // a tap places it too
  };

  const hint = misses >= 2;
  return (
    <ActivityFrame
      who={player}
      pose={r.pose}
      instruction={phrases[prompt].ar}
      hint={phrases[prompt].en ?? "Tap the harakah you hear"}
      burst={r.burst}
      round={round}
      total={rounds.length}
    >
      <div className="flex justify-center">
        <SoundButton size="md" onPlay={() => void play()} playing={playing} label="Hear it again" />
      </div>

      <div
        dir="rtl"
        className={cn(
          "relative mx-auto flex w-full max-w-sm justify-center rounded-[2rem] border-4 border-[oklch(0.62_0.08_60)] bg-gradient-to-b from-[oklch(0.8_0.07_70)] to-[oklch(0.7_0.08_60)] shadow-[0_8px_0_oklch(0.52_0.08_55)]",
          many ? "mt-2 p-3" : "mt-4 p-5",
        )}
      >
        {b.prefix && !shown ? (
          // Level 4: the vowelled part is given; the mark goes on the letter after it (مَ + ن)
          <div
            className="me-3 grid h-48 w-32 place-items-center rounded-3xl bg-card/80 shadow-inner"
            dir="rtl"
          >
            <Glyph className="text-[6rem] leading-none text-foreground/80">{b.prefix}</Glyph>
          </div>
        ) : null}
        <div
          data-zone="letter"
          className={cn(
            "grid place-items-center rounded-3xl bg-card/95 shadow-inner transition-[outline]",
            many ? "h-36" : "h-48",
            b.prefix && shown ? "w-64" : b.prefix ? "w-32" : "w-48",
            over && "outline-4 outline-dashed outline-primary",
          )}
        >
          <Glyph
            key={`${round}-${shown?.id ?? "bare"}`}
            className={cn(
              "pointer-events-none leading-none",
              b.prefix || many ? "text-[6rem]" : "text-[8rem]",
              shown && "animate-pop-in",
              shown && !done && "text-foreground/60",
            )}
            centerOn={b.base}
          >
            {shown ? shown.glyph : b.base}
          </Glyph>
        </div>
      </div>

      <div
        dir="rtl"
        className={cn(
          "mx-auto grid w-full max-w-sm",
          many ? "mt-3 gap-2" : "mt-5 gap-3",
          choices.length === 4 ? "grid-cols-4" : "grid-cols-3",
        )}
      >
        {choices.map((h) => (
          <button
            key={h}
            onPointerDown={onDown(h)}
            onPointerMove={onMove}
            onPointerUp={onUp(h)}
            onPointerCancel={() => {
              setDrag(null);
              setOver(false);
              start.current = null;
            }}
            aria-label={HARAKA_NAME[h].en}
            className={cn(
              "flex touch-none flex-col items-center rounded-3xl border-4 border-card bg-[oklch(0.95_0.03_80)] pb-1 shadow-[0_5px_0_var(--neutral-shadow)] active:translate-y-1 active:shadow-none",
              drag?.h === h && "opacity-40",
              hint && h === b.mark && "ring-4 ring-primary ring-offset-2 ring-offset-background",
            )}
          >
            <MarkOnly
              mark={MARK[h]}
              className={many ? "text-6xl leading-[1.15]" : "text-7xl leading-[1.25]"}
            />
            <span lang="ar" className="font-arabic text-base font-black">
              {HARAKA_NAME[h].ar}
            </span>
          </button>
        ))}
      </div>

      {drag ? (
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-card/90 shadow-xl"
          style={{ left: drag.x, top: drag.y }}
        >
          <MarkOnly mark={MARK[drag.h]} className="text-5xl" />
        </div>
      ) : null}
    </ActivityFrame>
  );
}
