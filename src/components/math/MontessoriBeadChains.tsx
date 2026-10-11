// Montessori Bead Chains — count a chain bead by bead, then build a quantity from a numeral.
import { useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { GameShell } from "@/components/learn/shared";
import { LearningLanguageSwitch, languageDirection, useLearningLanguage, type LearningLanguage } from "@/lib/learningLanguage";
import { speakArabic } from "@/lib/arabicVoice";
import { speakEnglish } from "@/lib/voice";
import { cn } from "@/lib/utils";
import gardenBg from "@/assets/montessori/bead-garden.jpg.asset.json";
import cube3 from "@/assets/montessori/cube3.png";
import { AgainIcon, Apple, Chain, GardenBed, Hint, IconBtn, NextIcon, WoodNum, WoodOp, sayText, useBeadSize, useGardenGrowth } from "./montessori/materials";
import { ChainMultiples, FactorFamilies, SquaresCubes } from "./montessori/levels";

type Mode = "multiples" | "factors" | "share" | "powers" | "count" | "build";
const MODES: [Mode, string, string][] = [["multiples", "مضاعفات السلسلة", "Chain multiples"], ["factors", "عائلات العوامل", "Factor families"], ["share", "المشاركة", "Sharing"], ["powers", "مربعات ومكعبات", "Squares & cubes"], ["count", "عُدّ السلسلة", "Count"], ["build", "ابنِ العدد", "Build"]];

/** Picture for each mode tile — the children pick by picture, the name is spoken. */
function ModeIcon({ mode }: { mode: Mode }) {
  switch (mode) {
    case "multiples": return <span className="grid justify-items-center gap-0.5"><Chain n={3} reps={2} bead={6} /><span dir="ltr" className="text-[11px] font-black leading-none">3·6</span></span>;
    case "factors": return <span className="flex gap-0.5">{[0, 1].map((g) => <span key={g} className="grid grid-cols-2 gap-px rounded bg-amber-100/80 p-0.5">{[0, 1, 2, 3].map((a) => <Apple key={a} size={9} />)}</span>)}</span>;
    case "share": return <span dir="ltr" className="flex items-center"><Apple size={13} /><Apple size={13} /><WoodOp op="÷" size={18} /></span>;
    case "powers": return <img src={cube3} alt="" className="h-9 w-9 object-contain" />;
    case "count": return <span dir="ltr" className="grid justify-items-center gap-0.5 text-[11px] font-black leading-none"><Chain n={3} bead={9} /><span>1 2 3</span></span>;
    case "build": return <span dir="ltr" className="flex items-end gap-0.5"><WoodNum n={4} size={16} /><Chain n={4} bead={6} /></span>;
  }
}

const beadImgs = import.meta.glob("@/assets/beads/bead-*.png", { eager: true, import: "default" }) as Record<string, string>;
const beadSrc = (n: number) => Object.entries(beadImgs).find(([k]) => k.endsWith(`/bead-${n}.png`))?.[1] ?? "";
const NUMBERS = Array.from({ length: 10 }, (_, i) => ({ number: i + 1, beads: i + 1 }));
const AR = ["واحد", "اثنين", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة"];
const EN = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
const say = (n: number, lang: LearningLanguage) => void (lang === "ar" ? speakArabic(AR[n - 1]!) : speakEnglish(EN[n - 1]!));
const t = (lang: LearningLanguage, ar: string, en: string) => (lang === "ar" ? ar : en);

function Bead({ color, size = 64, active, label, className }: { color: number; size?: number; active?: boolean; label?: number | undefined; className?: string }) {
  return (
    <span className={cn("relative grid shrink-0 place-items-center transition-transform duration-200", active && "scale-110", className)} style={{ width: size, height: size }}>
      <img src={beadSrc(color)} alt="" draggable={false} className={cn("h-full w-full select-none drop-shadow-md", active && "drop-shadow-[0_0_10px_var(--primary)]")} />
      {label !== undefined && <span className="absolute -top-3 grid h-7 min-w-7 place-items-center rounded-full bg-card px-1 text-sm font-black shadow animate-pop-in">{label}</span>}
    </span>
  );
}

function BeadChain({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div dir="ltr" className="relative mx-auto w-full max-w-3xl px-2 py-6">
      <div className="absolute left-2 right-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-amber-700/50" aria-hidden />
      <div className={cn("relative flex flex-wrap items-center justify-center", n > 6 ? "gap-1" : "gap-3")}>{children}</div>
    </div>
  );
}

function CountingMode({ n, lang, onNext }: { n: number; lang: LearningLanguage; onNext: () => void }) {
  const [counted, setCounted] = useState<number[]>([]);
  const done = counted.length === n;
  const B = useBeadSize();
  // one size for every bead on the chain, as big as the row allows
  const rowWidth = B < 28 ? 320 : B < 34 ? 440 : 800;
  const countSize = Math.max(36, Math.min(72, Math.floor(rowWidth / n) - (n > 6 ? 4 : 12)));
  const tap = (i: number) => {
    if (counted.includes(i)) return;
    const next = [...counted, i];
    setCounted(next);
    say(next.length, lang);
  };
  return (
    <div className="grid gap-6">
      <Hint lang={lang} text={t(lang, "كم خرزة؟ المس كل خرزة", "How many beads? Touch each bead")} />
      <BeadChain n={n}>
        {Array.from({ length: n }, (_, i) => {
          const pos = counted.indexOf(i);
          return (
            <button key={i} type="button" onClick={() => tap(i)} aria-label={`bead ${i + 1}`} className="grid place-items-center rounded-full">
              <Bead color={n} size={countSize} active={pos >= 0} label={pos >= 0 ? pos + 1 : undefined} />
            </button>
          );
        })}
      </BeadChain>
      {!done && <p className="text-center text-5xl font-black text-muted-foreground" aria-live="polite">{counted.length || " "}</p>}
      {done && (
        <div className="grid justify-items-center gap-2 text-center animate-pop-in">
          <p className="text-8xl font-black text-primary">{n} <span className="text-5xl text-success">✓</span></p>
          <div className="mt-2 flex gap-3">
            <IconBtn tone="neutral" label={t(lang, "عدّ مرة ثانية", "Count again")} onClick={() => setCounted([])}><AgainIcon /></IconBtn>
            <IconBtn label={t(lang, "جرّب غيرها", "Try another")} onClick={onNext}><NextIcon /></IconBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function BuildNumberMode({ n, lang, onNext }: { n: number; lang: LearningLanguage; onNext: () => void }) {
  const [placed, setPlaced] = useState(0);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const start = useRef({ x: 0, y: 0 });
  const chainRef = useRef<HTMLDivElement>(null);
  const done = placed === n;
  const place = () => { if (placed >= n) return; setPlaced(placed + 1); say(placed + 1, lang); };
  const up = (e: React.PointerEvent) => {
    const r = chainRef.current?.getBoundingClientRect();
    const moved = Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 8;
    const inside = r && e.clientX > r.left - 30 && e.clientX < r.right + 30 && e.clientY > r.top - 40 && e.clientY < r.bottom + 40;
    if (!moved || inside) place();
    setDrag(null);
  };
  return (
    <div className="grid gap-5">
      <p className="text-center text-7xl font-black text-primary">{n}</p>
      <Hint lang={lang} text={t(lang, `ابنِ ${n}. اسحب الخرز إلى السلسلة`, `Build ${n}. Drag beads onto the chain`)} />
      <div ref={chainRef} className="rounded-3xl border-4 border-dashed border-border bg-card/60">
        <BeadChain n={n}>
          {Array.from({ length: n }, (_, i) => i < placed
            ? <Bead key={i} color={n} size={n > 6 ? 50 : 64} className="animate-pop-in" />
            : <span key={i} className={cn("shrink-0 rounded-full border-4 border-dashed border-muted-foreground/40 bg-background/60", n > 6 ? "h-[50px] w-[50px]" : "h-16 w-16")} />)}
        </BeadChain>
      </div>
      {done ? (
        <div className="grid justify-items-center gap-3 text-center animate-pop-in">
          <span className="text-5xl font-black text-success">✓</span>
          <div className="flex gap-3">
            <IconBtn tone="neutral" label={t(lang, "مرة ثانية", "Again")} onClick={() => setPlaced(0)}><AgainIcon /></IconBtn>
            <IconBtn label={t(lang, "جرّب غيرها", "Try another")} onClick={onNext}><NextIcon /></IconBtn>
          </div>
        </div>
      ) : (
        <div className="grid justify-items-center gap-2">
          <div
            className="grid h-28 w-28 touch-none place-items-center rounded-full bg-amber-100/60 shadow-inner"
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); start.current = { x: e.clientX, y: e.clientY }; setDrag({ x: e.clientX, y: e.clientY }); }}
            onPointerMove={(e) => drag && setDrag({ x: e.clientX, y: e.clientY })}
            onPointerUp={up}
            onPointerCancel={() => setDrag(null)}
            aria-label={t(lang, "خرزة", "bead")} role="button"
          >
            <Bead color={n} size={76} />
          </div>
          <span className="text-3xl font-black text-muted-foreground" dir="ltr">{placed} / {n}</span>
        </div>
      )}
      {drag && <div className="pointer-events-none fixed z-50" style={{ left: drag.x - 38, top: drag.y - 38 }}><Bead color={n} size={76} active /></div>}
    </div>
  );
}

export function MontessoriBeadChains({ onExit }: { onExit: () => void }) {
  const [lang, setLang] = useLearningLanguage();
  const [mode, setMode] = useState<Mode>("multiples");
  const [growth, grow] = useGardenGrowth();
  const [n, setN] = useState(1);
  const [round, setRound] = useState(0);
  const next = () => { setN((x) => (x % 10) + 1); setRound((r) => r + 1); };
  return (
    <div className="min-h-dvh bg-cover bg-center bg-fixed" style={{ backgroundImage: `linear-gradient(color-mix(in oklab, var(--background) 72%, transparent), color-mix(in oklab, var(--background) 82%, transparent)), url(${gardenBg.url})` }}>
    <GameShell title={t(lang, "حديقة الخرز", "Bead Garden")} onExit={onExit}>
      <div dir={languageDirection(lang)} className="mt-3 grid gap-4">
        <div className="mx-auto grid w-full max-w-xl grid-cols-6 gap-1.5" role="tablist">
          {MODES.map(([m, ar, en]) => (
            <GameButton key={m} role="tab" aria-selected={mode === m} aria-label={t(lang, ar, en)} title={t(lang, ar, en)} tone={mode === m ? "sky" : "neutral"}
              className={cn("grid h-14 min-w-0 place-items-center overflow-hidden rounded-2xl px-0.5 sm:h-16", mode === m && "ring-4 ring-secondary/40")}
              onClick={() => { setMode(m); setRound((r) => r + 1); sayText(lang, ar, en); }}>
              <ModeIcon mode={m} />
            </GameButton>
          ))}
        </div>
        {mode === "multiples" && <ChainMultiples key={round} lang={lang} grow={grow} />}
        {mode === "factors" && <FactorFamilies key={round} lang={lang} grow={grow} />}
        {mode === "share" && <FactorFamilies key={round} lang={lang} grow={grow} share />}
        {mode === "powers" && <SquaresCubes key={round} lang={lang} grow={grow} />}
        {(mode === "count" || mode === "build") && (
          <>
            <div dir="ltr" className="flex flex-wrap justify-center gap-1.5">
              {NUMBERS.map(({ number }) => (
                <button key={number} type="button" onClick={() => { setN(number); setRound((r) => r + 1); say(number, lang); }} className={cn("h-11 w-11 rounded-full text-lg font-black shadow-sm", number === n ? "bg-primary text-primary-foreground" : "bg-card")}>{number}</button>
              ))}
            </div>
            {mode === "count" ? <CountingMode key={`c${round}-${n}`} n={n} lang={lang} onNext={next} /> : <BuildNumberMode key={`b${round}-${n}`} n={n} lang={lang} onNext={next} />}
          </>
        )}
        <div className="mt-4 grid gap-3">
          <GardenBed growth={growth} />
          <div className="flex items-center justify-center gap-3">
            <LearningLanguageSwitch language={lang} onChange={setLang} />
            <IconBtn tone="neutral" label={t(lang, "ابدأ العمل من جديد", "Clear the work")} className="h-12 min-h-12 w-12 min-w-12 px-0" onClick={() => setRound((r) => r + 1)}><RotateCcw className="h-5 w-5" /></IconBtn>
          </div>
        </div>
      </div>
    </GameShell>
    </div>
  );
}
