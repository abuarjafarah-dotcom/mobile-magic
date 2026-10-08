// BUILD: drag the right dots onto the letter body (Unit 1). The BuildSpec in data
// decides the body, dot count and place, so later units can feed other components.
import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Check, RotateCcw } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { phrases, type BuildSpec } from "@/data/noorani";
import { sayEncourage, sayItem, sayPhrase, saySuccess } from "@/lib/nooraniAudio";
import { cn } from "@/lib/utils";
import { ActivityFrame, Glyph, SoundButton, roundTargets, useAlive, useOnMount, useReaction, type ActivityProps } from "../ui";

type Zone = "above" | "below";
type Placed = Record<Zone, number>;
const EMPTY: Placed = { above: 0, below: 0 };

function Dots({ n, ghost, size = "md" }: { n: number; ghost?: boolean; size?: "sm" | "md" }) {
  const d = cn("rounded-full bg-foreground", size === "md" ? "h-5 w-5" : "h-3 w-3", ghost && "bg-primary opacity-60");
  if (!n) return null;
  return (
    <span className="flex flex-col items-center gap-1">
      {n === 3 ? <span className={d} /> : null}
      <span className="flex gap-1.5">{Array.from({ length: n === 3 ? 2 : n }, (_, i) => <span key={i} className={d} />)}</span>
    </span>
  );
}

const isRight = (b: BuildSpec, p: Placed) =>
  b.place === "none" ? p.above === 0 && p.below === 0 : p[b.place] === b.dots && p[b.place === "above" ? "below" : "above"] === 0;

export function BuildTheSound({ targets, spec, player, onResult, onDone }: ActivityProps) {
  const buildable = useMemo(() => targets.filter((t) => t.build), [targets]);
  const rounds = useMemo(() => roundTargets(buildable, Math.min(spec.rounds, Math.max(buildable.length, 1))), [buildable, spec.rounds]);
  const [round, setRound] = useState(0);
  const [placed, setPlaced] = useState<Placed>(EMPTY);
  const [selected, setSelected] = useState<number | null>(null);
  const [drag, setDrag] = useState<{ n: number; x: number; y: number } | null>(null);
  const [misses, setMisses] = useState(0);
  const [built, setBuilt] = useState(false);
  const [shake, setShake] = useState(0);
  const [playing, setPlaying] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const r = useReaction();
  const alive = useAlive();
  const target = rounds[round]!;
  const b = target.build!;

  const play = async (item = target) => { setPlaying(true); r.listen(); await sayItem(item); setPlaying(false); };
  useOnMount(() => { void sayPhrase("build").then(() => { if (alive.current) void play(); }); });

  const drop = (zone: Zone, n: number) => { if (!built) setPlaced((p) => ({ ...p, [zone]: n })); };

  const onChipDown = (n: number) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (built) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    setDrag({ n, x: e.clientX, y: e.clientY });
  };
  const onChipMove = (e: ReactPointerEvent<HTMLButtonElement>) => { if (drag) setDrag({ ...drag, x: e.clientX, y: e.clientY }); };
  const onChipUp = (n: number) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    const s = start.current; start.current = null; setDrag(null);
    if (!s || Math.hypot(e.clientX - s.x, e.clientY - s.y) < 10) { setSelected(selected === n ? null : n); return; }
    const zone = document.elementsFromPoint(e.clientX, e.clientY).map((el) => (el as HTMLElement).dataset?.zone).find(Boolean) as Zone | undefined;
    if (zone) { drop(zone, n); setSelected(null); }
  };
  const tapZone = (zone: Zone) => {
    if (built) return;
    if (selected) { drop(zone, selected); setSelected(null); return; }
    if (placed[zone]) setPlaced((p) => ({ ...p, [zone]: 0 }));
  };

  const check = () => {
    if (built) return;
    if (isRight(b, placed)) {
      setBuilt(true); r.right();
      onResult({ itemId: target.id, correct: true, firstTry: misses === 0 });
      void saySuccess(target).then(() => sayItem(target)).then(() => {
        if (!alive.current) return;
        if (round + 1 >= rounds.length) { onDone(); return; }
        setRound(round + 1); setPlaced(EMPTY); setMisses(0); setBuilt(false); setSelected(null);
        void play(rounds[round + 1]);
      });
    } else {
      if (misses === 0) onResult({ itemId: target.id, correct: false, firstTry: false });
      setMisses(misses + 1); setShake((x) => x + 1); r.wrong();
      void sayEncourage(target);
    }
  };

  const hint = misses >= 2;
  const zoneBox = (zone: Zone) => (
    <button
      data-zone={zone}
      onClick={() => tapZone(zone)}
      aria-label={zone === "above" ? "Dots above" : "Dots below"}
      className={cn(
        "grid h-16 w-40 place-items-center rounded-full border-4 border-dashed transition-colors",
        placed[zone] ? "border-transparent bg-transparent" : selected ? "border-primary bg-primary/15" : "border-foreground/15 bg-card/40",
        built && "opacity-0",
      )}
    >
      {placed[zone] ? <Dots n={placed[zone]} /> : hint && b.place === zone ? <Dots n={b.dots} ghost /> : null}
    </button>
  );

  return (
    <ActivityFrame who={player} pose={r.pose} instruction={phrases.build.ar} hint="Drag the dots where they belong, then press ✓" burst={r.burst} round={round} total={rounds.length}>
      <div className="mt-3 flex justify-center"><SoundButton size="md" onPlay={() => void play()} playing={playing} /></div>

      <div className="relative mx-auto mt-3 flex w-full max-w-sm flex-col items-center gap-1 rounded-[2rem] border-4 border-[oklch(0.62_0.08_60)] bg-gradient-to-b from-[oklch(0.8_0.07_70)] to-[oklch(0.7_0.08_60)] px-4 py-4 shadow-[0_8px_0_oklch(0.52_0.08_55)]">
        {zoneBox("above")}
        <div key={`${round}-${shake}`} className={cn("grid h-36 w-56 place-items-center rounded-3xl bg-card/90 shadow-inner", shake > 0 && !built && "animate-verb-shake [animation-iteration-count:1]")}>
          <Glyph className={cn("text-[7rem] leading-none", built && "animate-pop-in text-success-foreground")}>{built ? target.glyph : b.base}</Glyph>
        </div>
        {zoneBox("below")}
      </div>

      <div className="mt-4 flex items-center justify-center gap-3" dir="rtl">
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            onPointerDown={onChipDown(n)}
            onPointerMove={onChipMove}
            onPointerUp={onChipUp(n)}
            onPointerCancel={() => { setDrag(null); start.current = null; }}
            aria-label={`${n} dot${n > 1 ? "s" : ""}`}
            className={cn(
              "grid h-20 w-20 touch-none place-items-center rounded-full border-4 bg-[oklch(0.86_0.03_80)] shadow-[0_5px_0_var(--neutral-shadow)]",
              selected === n ? "border-primary scale-110" : "border-card",
              drag?.n === n && "opacity-40",
            )}
          >
            <Dots n={n} size="sm" />
          </button>
        ))}
        <GameButton tone="mint" onClick={check} aria-label="Check" className={cn("grid h-20 w-20 place-items-center rounded-full p-0", hint && b.place === "none" && "ring-4 ring-primary ring-offset-2")}>
          <Check className="h-10 w-10" />
        </GameButton>
        <GameButton tone="neutral" onClick={() => { setPlaced(EMPTY); setSelected(null); }} aria-label="Clear" className="grid h-12 w-12 place-items-center rounded-full p-0">
          <RotateCcw className="h-5 w-5" />
        </GameButton>
      </div>

      {drag ? (
        <div aria-hidden className="pointer-events-none fixed z-50 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-card/90 shadow-xl" style={{ left: drag.x, top: drag.y }}>
          <Dots n={drag.n} />
        </div>
      ) : null}
    </ActivityFrame>
  );
}
