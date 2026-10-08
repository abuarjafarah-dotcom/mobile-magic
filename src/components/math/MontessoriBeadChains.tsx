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
import { GardenBed, useGardenGrowth } from "./montessori/materials";
import { ChainMultiples, FactorFamilies, SquaresCubes } from "./montessori/levels";

type Mode = "multiples" | "factors" | "share" | "powers" | "count" | "build";
const MODES: [Mode, string, string][] = [["multiples", "مضاعفات السلسلة", "Chain multiples"], ["factors", "عائلات العوامل", "Factor families"], ["share", "المشاركة", "Sharing"], ["powers", "مربعات ومكعبات", "Squares & cubes"], ["count", "عُدّ السلسلة", "Count"], ["build", "ابنِ العدد", "Build"]];

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
      <div className={cn("relative flex flex-wrap items-center justify-center", n > 6 ? "gap-1.5" : "gap-3")}>{children}</div>
    </div>
  );
}

function CountingMode({ n, lang, onNext }: { n: number; lang: LearningLanguage; onNext: () => void }) {
  const [counted, setCounted] = useState<number[]>([]);
  const done = counted.length === n;
  const tap = (i: number) => {
    if (counted.includes(i)) return;
    const next = [...counted, i];
    setCounted(next);
    say(next.length, lang);
  };
  return (
    <div className="grid gap-6">
      <p className={cn("text-center text-2xl font-black", lang === "ar" && "font-arabic")}>{t(lang, "كم خرزة؟", "How many beads?")}</p>
      <BeadChain n={n}>
        {Array.from({ length: n }, (_, i) => {
          const pos = counted.indexOf(i);
          return (
            <button key={i} type="button" onClick={() => tap(i)} aria-label={`bead ${i + 1}`} className="grid min-h-16 min-w-14 place-items-center rounded-full">
              <Bead color={n} size={n > 6 ? 54 : 70} active={pos >= 0} label={pos >= 0 ? pos + 1 : undefined} />
            </button>
          );
        })}
      </BeadChain>
      <p className="text-center text-xl font-black text-muted-foreground" aria-live="polite">{counted.length || " "}</p>
      {done && (
        <div className="grid justify-items-center gap-2 text-center animate-pop-in">
          <p className={cn("text-2xl font-black", lang === "ar" && "font-arabic")}>{t(lang, `عددت ${n}!`, `You counted ${n}!`)}</p>
          <p className="text-7xl font-black text-primary">{n}</p>
          <p className={cn("font-bold", lang === "ar" && "font-arabic")}>{t(lang, `${n} خرزات`, `${n} bead${n > 1 ? "s" : ""}`)}</p>
          <div className="mt-2 flex gap-3">
            <GameButton tone="neutral" onClick={() => setCounted([])}><RotateCcw className="me-2 inline h-5 w-5" />{t(lang, "عدّ مرة ثانية", "Count again")}</GameButton>
            <GameButton tone="mint" onClick={onNext}>{t(lang, "جرّب غيرها", "Try another")}</GameButton>
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
      <p className="text-center text-8xl font-black text-primary">{n}</p>
      <p className={cn("text-center text-2xl font-black", lang === "ar" && "font-arabic")}>{t(lang, `ابنِ ${n}`, `Build ${n}.`)}</p>
      <div ref={chainRef} className="rounded-3xl border-4 border-dashed border-border bg-card/60">
        <BeadChain n={n}>
          {Array.from({ length: n }, (_, i) => i < placed
            ? <Bead key={i} color={n} size={n > 6 ? 50 : 64} className="animate-pop-in" />
            : <span key={i} className={cn("shrink-0 rounded-full border-4 border-dashed border-muted-foreground/40 bg-background/60", n > 6 ? "h-[50px] w-[50px]" : "h-16 w-16")} />)}
        </BeadChain>
      </div>
      {done ? (
        <div className="grid justify-items-center gap-3 text-center animate-pop-in">
          <p className={cn("text-2xl font-black", lang === "ar" && "font-arabic")}>{t(lang, `ممتاز! ${n} خرزات`, `Well done! ${n} beads`)}</p>
          <div className="flex gap-3">
            <GameButton tone="neutral" onClick={() => setPlaced(0)}><RotateCcw className="me-2 inline h-5 w-5" />{t(lang, "مرة ثانية", "Again")}</GameButton>
            <GameButton tone="mint" onClick={onNext}>{t(lang, "جرّب غيرها", "Try another")}</GameButton>
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
          <p className={cn("text-sm font-bold text-muted-foreground", lang === "ar" && "font-arabic")}>{t(lang, "اسحب الخرزة إلى السلسلة", "Drag a bead onto the chain")}</p>
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
      <div dir={languageDirection(lang)} className="mt-4 grid gap-4">
        <LearningLanguageSwitch language={lang} onChange={setLang} />
        <GardenBed growth={growth} />
        <div className="flex flex-wrap justify-center gap-2">
          {MODES.map(([m, ar, en]) => (
            <GameButton key={m} tone={mode === m ? "sky" : "neutral"} className={cn("min-h-11 px-3 text-sm", lang === "ar" && "font-arabic")} onClick={() => { setMode(m); setRound((r) => r + 1); }}>{t(lang, ar, en)}</GameButton>
          ))}
        </div>
        <div className="flex justify-center"><GameButton tone="neutral" className={cn("min-h-10 px-3 text-xs", lang === "ar" && "font-arabic")} onClick={() => setRound((r) => r + 1)}><RotateCcw className="me-1 inline h-4 w-4" />{t(lang, "ابدأ العمل من جديد", "Clear the work")}</GameButton></div>
        {mode === "multiples" && <ChainMultiples key={round} lang={lang} grow={grow} />}
        {mode === "factors" && <FactorFamilies key={round} lang={lang} grow={grow} />}
        {mode === "share" && <FactorFamilies key={round} lang={lang} grow={grow} share />}
        {mode === "powers" && <SquaresCubes key={round} lang={lang} grow={grow} />}
        {(mode === "count" || mode === "build") && (
          <>
            <div dir="ltr" className="flex flex-wrap justify-center gap-1.5">
              {NUMBERS.map(({ number }) => (
                <button key={number} type="button" onClick={() => { setN(number); setRound((r) => r + 1); }} className={cn("h-11 w-11 rounded-full text-lg font-black shadow-sm", number === n ? "bg-primary text-primary-foreground" : "bg-card")}>{number}</button>
              ))}
            </div>
            {mode === "count" ? <CountingMode key={`c${round}-${n}`} n={n} lang={lang} onNext={next} /> : <BuildNumberMode key={`b${round}-${n}`} n={n} lang={lang} onNext={next} />}
          </>
        )}
      </div>
    </GameShell>
    </div>
  );
}
