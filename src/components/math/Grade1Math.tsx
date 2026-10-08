// Grade 1 Math — one lesson engine for every question kind in src/data/grade1Math.ts. All lessons open.
import { useMemo, useState } from "react";
import { Check, Delete, RotateCcw } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { GameShell, shuffle } from "@/components/learn/shared";
import { g1Lessons, g1Units, type G1Lesson, type G1Question, type G1Visual } from "@/data/grade1Math";
import { addUnique, type LearningProgress } from "@/lib/learningProgress";
import { cn } from "@/lib/utils";
import { LearningLanguageSwitch, languageDirection, useLearningLanguage, type LearningLanguage } from "@/lib/learningLanguage";
import { mathText } from "@/data/learningTranslations";

type Update = (change: (p: LearningProgress) => LearningProgress) => void;

/* ---------------- Ramadan theme (optional, never locks anything) ---------------- */
const RAMADAN_KEY = "g1-ramadan";
export function useRamadan(): [boolean, (v: boolean) => void] {
  const [on, setOn] = useState(() => typeof window !== "undefined" && window.localStorage.getItem(RAMADAN_KEY) === "1");
  const set = (v: boolean) => { window.localStorage.setItem(RAMADAN_KEY, v ? "1" : "0"); setOn(v); };
  return [on, set];
}
function RamadanStrip() {
  return (
    <div dir="rtl" className="flex items-center justify-center gap-3 rounded-3xl bg-gradient-to-l from-indigo-900 via-violet-800 to-indigo-900 px-4 py-3 text-2xl shadow-md" aria-label="رمضان كريم">
      <span aria-hidden>🏮</span><span aria-hidden>🌙</span>
      <span className="font-arabic text-xl font-black text-amber-200">رمضان كريم</span>
      <span aria-hidden>✨</span><span aria-hidden>🏮</span>
    </div>
  );
}
const Ar = ({ children, className }: { children: React.ReactNode; className?: string }) => <span dir="rtl" lang="ar" className={cn("font-arabic", className)}>{children}</span>;
const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

/* ---------------- Visuals (simple line drawings) ---------------- */
function Clock({ h, m, size = 150 }: { h: number; m: number; size?: number }) {
  const hourDeg = ((h % 12) + m / 60) * 30, minDeg = m * 6;
  const hand = (deg: number, len: number) => ({ x2: 50 + len * Math.sin((deg * Math.PI) / 180), y2: 50 - len * Math.cos((deg * Math.PI) / 180) });
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-label={`${h}:${m ? "30" : "00"}`}>
      <circle cx="50" cy="50" r="46" fill="var(--card)" stroke="var(--foreground)" strokeWidth="3" />
      {Array.from({ length: 12 }, (_, i) => { const a = ((i + 1) * 30 * Math.PI) / 180; return <text key={i} x={50 + 36 * Math.sin(a)} y={54 - 36 * Math.cos(a)} fontSize="10" fontWeight="800" textAnchor="middle" fill="var(--foreground)">{i + 1}</text>; })}
      <line x1="50" y1="50" {...hand(hourDeg, 22)} stroke="var(--foreground)" strokeWidth="5" strokeLinecap="round" />
      <line x1="50" y1="50" {...hand(minDeg, 33)} stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="50" r="3" fill="var(--foreground)" />
    </svg>
  );
}

function Coins({ coins, language }: { coins: number[]; language: LearningLanguage }) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {coins.map((c, i) => (
        <span key={i} className={cn("grid place-items-center rounded-full border-4 border-foreground/30 font-black shadow-sm", c >= 50 ? "h-16 w-16 bg-muted text-lg" : c >= 25 ? "h-14 w-14 bg-primary/40" : "h-12 w-12 bg-primary/70 text-sm")}>
          <span className="leading-none">{c}<span className="block text-[9px]">{language === "ar" ? "قرش" : "piastre"}</span></span>
        </span>
      ))}
    </div>
  );
}

function Fraction({ shape, parts, shaded, equal = true, size = 130 }: { shape: "circle" | "rect"; parts: number; shaded: number; equal?: boolean; size?: number }) {
  const fill = (i: number) => (i < shaded ? "var(--success)" : "var(--card)");
  if (shape === "circle") {
    const slice = (i: number) => {
      const a0 = (i / parts) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / parts) * 2 * Math.PI - Math.PI / 2;
      return `M50 50 L${50 + 44 * Math.cos(a0)} ${50 + 44 * Math.sin(a0)} A44 44 0 ${parts === 1 ? 1 : 0} 1 ${50 + 44 * Math.cos(a1)} ${50 + 44 * Math.sin(a1)} Z`;
    };
    return <svg viewBox="0 0 100 100" width={size} height={size}>{Array.from({ length: parts }, (_, i) => <path key={i} d={slice(i)} fill={fill(i)} stroke="var(--foreground)" strokeWidth="2.5" />)}</svg>;
  }
  const widths = equal ? Array(parts).fill(88 / parts) : [60, 28];
  let x = 6;
  return (
    <svg viewBox="0 0 100 70" width={size} height={size * 0.7}>
      {widths.map((w: number, i: number) => { const r = <rect key={i} x={x} y="8" width={w} height="54" fill={fill(i)} stroke="var(--foreground)" strokeWidth="2.5" />; x += w; return r; })}
    </svg>
  );
}

function Shape({ shape, size = 120 }: { shape: "circle" | "triangle" | "square" | "rectangle"; size?: number }) {
  const p = { fill: "var(--secondary)", stroke: "var(--foreground)", strokeWidth: 3 };
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      {shape === "circle" && <circle cx="50" cy="50" r="40" {...p} />}
      {shape === "triangle" && <polygon points="50,10 92,88 8,88" {...p} />}
      {shape === "square" && <rect x="14" y="14" width="72" height="72" {...p} />}
      {shape === "rectangle" && <rect x="4" y="28" width="92" height="44" {...p} />}
    </svg>
  );
}

function Blocks({ nums }: { nums: number[] }) {
  return (
    <div dir="ltr" className="flex items-end justify-center gap-4">
      {nums.map((num, k) => (
        <div key={k} className="flex items-end gap-1 rounded-2xl bg-card p-2 shadow-sm">
          {Array.from({ length: Math.floor(num / 10) }, (_, i) => <div key={i} className="grid h-20 w-3 grid-rows-10 overflow-hidden rounded-sm border border-foreground/40 bg-secondary">{Array.from({ length: 10 }, (_, j) => <span key={j} className="border-b border-foreground/20" />)}</div>)}
          <div className="grid grid-cols-2 gap-0.5">{Array.from({ length: num % 10 }, (_, i) => <span key={i} className="h-3 w-3 rounded-sm border border-foreground/40 bg-primary/60" />)}</div>
        </div>
      ))}
    </div>
  );
}

export function G1View({ v, small, language = "ar" }: { v: G1Visual; small?: boolean; language?: LearningLanguage }) {
  switch (v.k) {
    case "clock": return <Clock h={v.h} m={v.m} size={small ? 96 : 160} />;
    case "coins": return <Coins coins={v.coins} language={language} />;
    case "fraction": return <Fraction shape={v.shape} parts={v.parts} shaded={v.shaded} equal={v.equal ?? true} size={small ? 84 : 140} />;
    case "shape": return <Shape shape={v.shape} size={small ? 76 : 130} />;
    case "blocks": return <Blocks nums={v.nums} />;
    case "emoji": return <span dir="rtl" className="text-5xl font-black">{v.text}</span>;
    case "set": return <div className="flex gap-2">{Array.from({ length: v.n }, (_, i) => <span key={i} className={cn("rounded-2xl p-2 text-5xl", i < v.shaded ? "bg-success/40 ring-4 ring-success" : "bg-card opacity-60 grayscale")}>{v.emoji}</span>)}</div>;
    case "pattern": return <div dir="ltr" className="flex flex-wrap items-center justify-center gap-1 text-4xl">{v.seq.map((x, i) => <span key={i}>{x}</span>)}<span className="grid h-12 w-12 place-items-center rounded-xl border-4 border-dashed border-border text-2xl">?</span></div>;
    case "clips": return <div dir="ltr" className="grid justify-items-start gap-1"><span className="text-4xl" style={{ transform: `scaleX(${1 + v.n * 0.15})`, transformOrigin: "left" }}>{v.emoji}</span><span className="flex gap-0.5">{Array.from({ length: v.n }, (_, i) => <span key={i} className="text-xl">📎</span>)}</span></div>;
    case "balance": return <div dir="ltr" className="flex items-end gap-6 text-4xl"><span className="rounded-t-3xl border-b-4 border-foreground px-3">{v.left}</span><span className="text-3xl">⚖️</span><span className="flex max-w-40 flex-wrap gap-0.5 border-b-4 border-foreground px-2">{Array.from({ length: v.blocks }, (_, i) => <span key={i} className="h-5 w-5 rounded-sm bg-primary" />)}</span></div>;
    case "week": return <div dir={languageDirection(language)} className="flex flex-wrap justify-center gap-1">{days.map((d, i) => <span key={d} className={cn("rounded-xl px-2 py-1 text-lg font-bold", language === "ar" && "font-arabic", i === v.missing ? "border-2 border-dashed border-border bg-card text-muted-foreground" : i === 5 || i === 6 ? "bg-destructive/20" : "bg-secondary")}>{i === v.missing ? "?" : mathText(d, language)}</span>)}</div>;
  }
}

/* ---------------- Home ---------------- */
export function Grade1Home({ progress, onStart }: { progress: LearningProgress; onStart: (lesson: G1Lesson) => void }) {
  const done = progress.g1?.done ?? [];
  const [ramadan, setRamadan] = useRamadan();
  const [language, setLanguage] = useLearningLanguage();
  return (
    <div className="grid gap-5 min-[960px]:grid-cols-2" dir={languageDirection(language)}>
      <div className="text-center min-[960px]:col-span-2"><h2 className={cn("text-3xl font-black", language === "ar" && "font-arabic")}>{mathText("رياضيات الصف الأول", language)}</h2><span className="text-sm font-bold text-muted-foreground">{language === "ar" ? `تدرّبت على ${done.length} من ${g1Lessons.length} درسًا` : `${done.length} / ${g1Lessons.length} lessons practiced`}</span></div>
      <div className="min-[960px]:col-span-2"><LearningLanguageSwitch language={language} onChange={setLanguage} /></div>
      <GameButton tone={ramadan ? "sun" : "neutral"} className="min-h-12 rounded-2xl min-[960px]:col-span-2" onClick={() => setRamadan(!ramadan)} aria-pressed={ramadan} aria-label="Ramadan theme">
        <span className="text-xl" aria-hidden>{ramadan ? "🌙" : "☀️"}</span>
        <span className={cn("text-base font-black", language === "ar" && "font-arabic")}>{mathText(ramadan ? "وضع رمضان: مُفعَّل" : "تفعيل وضع رمضان", language)}</span>
      </GameButton>
      {ramadan && <div className="min-[960px]:col-span-2"><RamadanStrip /></div>}
      {g1Units.map((u) => (
        <section key={u.id} className={cn("rounded-3xl p-4 shadow-sm", ramadan ? "bg-indigo-950/80 ring-2 ring-amber-300/40" : "bg-card/70")}>
           <div className={cn("mb-3 flex items-center gap-3", ramadan && "text-amber-100")}><span className="text-3xl">{u.icon}</span><div><span className={cn("block text-xl font-black", language === "ar" && "font-arabic")}>{language === "ar" ? `الوحدة ${u.id}: ${u.ar}` : `Unit ${u.id}: ${u.en}`}</span></div></div>
           <div className="grid grid-cols-2 gap-2">
            {g1Lessons.filter((l) => l.unit === u.id).map((l, i) => (
              <GameButton key={l.id} tone={done.includes(l.id) ? "mint" : "neutral"} className="relative min-h-20 rounded-2xl px-3 py-2 text-start" onClick={() => onStart(l)} aria-label={l.en}>
                {done.includes(l.id) && <Check className="absolute left-2 top-2 h-4 w-4" />}
                 <span className="block text-xs font-black opacity-60">{language === "ar" ? `الدرس ${i + 1}` : `Lesson ${i + 1}`}</span><span className={cn("block text-base font-black leading-snug", language === "ar" && "font-arabic")}>{language === "ar" ? l.ar : l.en}</span>
              </GameButton>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ---------------- Lesson engine ---------------- */
function OrderQ({ q, language, onRight, onWrong }: { q: G1Question; language: LearningLanguage; onRight: () => void; onWrong: () => void }) {
  const items = q.items!;
  const shown = useMemo(() => shuffle(items), [items]);
  const [placed, setPlaced] = useState<string[]>([]);
  const tap = (x: string) => {
    if (placed.includes(x)) return;
    if (x !== items[placed.length]) { onWrong(); return; }
    const next = [...placed, x];
    setPlaced(next);
    if (next.length === items.length) onRight();
  };
  return (
    <div className="grid gap-3">
       <div dir={languageDirection(language)} className="grid grid-cols-2 gap-2">
        {shown.map((x) => { const pos = placed.indexOf(x); return (
          <GameButton key={x} tone={pos >= 0 ? "mint" : "neutral"} className="relative min-h-20 rounded-2xl" onClick={() => tap(x)}>
             {pos >= 0 && <span className="absolute right-2 top-1 text-lg font-black">{pos + 1}</span>}<span className={cn("text-xl font-black", language === "ar" && "font-arabic")}>{mathText(x, language)}</span>
          </GameButton>
        ); })}
      </div>
       <p className={cn("text-center text-sm font-bold text-muted-foreground", language === "ar" && "font-arabic")}>{language === "ar" ? "اضغط بالترتيب: 1 ← 2 ← 3 ← 4" : "Tap in order: 1 → 2 → 3 → 4"}</p>
    </div>
  );
}

function Keypad({ onSubmit }: { onSubmit: (v: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="grid gap-2">
      <div dir="ltr" className="mx-auto grid h-16 min-w-32 place-items-center rounded-2xl border-4 border-border bg-card px-6 text-4xl font-black">{val || " "}</div>
      <div dir="ltr" className="mx-auto grid w-full max-w-xs grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => <GameButton key={d} tone="neutral" className="min-h-14 text-2xl" onClick={() => setVal((v) => (v.length < 3 ? v + d : v))}>{d}</GameButton>)}
        <GameButton tone="neutral" className="min-h-14" aria-label="Delete" onClick={() => setVal((v) => v.slice(0, -1))}><Delete className="mx-auto h-6 w-6" /></GameButton>
        <GameButton tone="neutral" className="min-h-14 text-2xl" onClick={() => setVal((v) => (v.length < 3 ? v + "0" : v))}>0</GameButton>
        <GameButton tone="mint" className="min-h-14" aria-label="Check" disabled={!val} onClick={() => { onSubmit(val); setVal(""); }}><Check className="mx-auto h-7 w-7" /></GameButton>
      </div>
    </div>
  );
}

export function Grade1Lesson({ lesson, onProgress, onExit }: { lesson: G1Lesson; onProgress: Update; onExit: () => void }) {
  const [ramadan] = useRamadan();
  const [i, setI] = useState(0);
  const [feedback, setFeedback] = useState<"right" | "wrong" | null>(null);
  const [wrongPicks, setWrongPicks] = useState<string[]>([]);
  const [language, setLanguage] = useLearningLanguage();
  const q = lesson.questions[i];
  const choices = useMemo(() => (q?.options ? (q.optionScale ? q.options : shuffle(q.options)) : []), [q]);
  const right = () => {
    setFeedback("right");
    window.setTimeout(() => {
      setFeedback(null); setWrongPicks([]);
      if (i + 1 >= lesson.questions.length) onProgress((p) => ({ ...p, g1: { done: addUnique(p.g1?.done ?? [], lesson.id) } }));
      setI((x) => x + 1);
    }, 900);
  };
  const wrong = () => { setFeedback("wrong"); window.setTimeout(() => setFeedback((f) => (f === "wrong" ? null : f)), 1200); };
  const check = (v: string) => (v === q!.answer ? right() : (setWrongPicks((w) => [...w, v]), wrong()));

  if (!q) return (
     <GameShell title={language === "ar" ? lesson.ar : lesson.en} current={1} total={1} onExit={onExit}>
       <div className="mt-4"><LearningLanguageSwitch language={language} onChange={setLanguage} /></div>
      {ramadan && <div className="mt-4"><RamadanStrip /></div>}
      <div className="mt-16 grid justify-items-center gap-4 text-center">
         <div className="text-7xl">🌟</div><p className={cn("text-4xl font-black", language === "ar" && "font-arabic")}>{mathText("أحسنت!", language)}</p><p className="font-bold">{language === "ar" ? "اكتمل الدرس" : "Lesson complete"}</p>
         <div className="flex gap-3"><GameButton tone="mint" onClick={() => setI(0)}><RotateCcw className="me-2 inline h-5 w-5" />{language === "ar" ? "مرة أخرى" : "Again"}</GameButton><GameButton tone="neutral" onClick={onExit}>{language === "ar" ? "رجوع" : "Back"}</GameButton></div>
      </div>
    </GameShell>
  );
  return (
     <GameShell title={language === "ar" ? lesson.ar : lesson.en} current={i} total={lesson.questions.length} onExit={onExit}>
       <div className="mt-4"><LearningLanguageSwitch language={language} onChange={setLanguage} /></div>
      {ramadan && <div className="mt-4"><RamadanStrip /></div>}
      <div className="mt-6 grid gap-5">
         <p dir={languageDirection(language)} className={cn("text-center text-2xl font-black leading-relaxed", language === "ar" && "font-arabic")}>{mathText(q.prompt, language)}</p>
         {q.visual && <div className="grid place-items-center"><G1View v={q.visual} language={language} /></div>}
         {q.expr && <p dir="ltr" className="text-center text-5xl font-black tracking-wide">{language === "en" ? q.expr.replaceAll("؟", "?") : q.expr}</p>}
        <div className={cn("grid h-10 place-items-center text-xl font-black", feedback === "right" ? "text-success" : "text-destructive")} aria-live="polite">
           {feedback === "right" ? <Check className="h-10 w-10 animate-pop-in" /> : feedback === "wrong" ? <span className={language === "ar" ? "font-arabic" : ""}>{mathText("حاول مرة أخرى", language)}</span> : null}
        </div>
        {q.kind === "number" && <Keypad key={i} onSubmit={check} />}
        {q.kind === "compare" && (
          <div dir="ltr" className="grid grid-cols-3 gap-3">{["<", "=", ">"].map((s) => <GameButton key={s} tone={wrongPicks.includes(s) ? "neutral" : "sky"} className={cn("min-h-20 text-5xl", wrongPicks.includes(s) && "opacity-40")} onClick={() => check(s)}>{s}</GameButton>)}</div>
        )}
        {q.kind === "op" && (
          <div dir="ltr" className="grid grid-cols-2 gap-3">{["+", "-"].map((s) => <GameButton key={s} tone={wrongPicks.includes(s) ? "neutral" : "sun"} className={cn("min-h-24 text-6xl", wrongPicks.includes(s) && "opacity-40")} onClick={() => check(s)}>{s === "-" ? "−" : "+"}</GameButton>)}</div>
        )}
        {q.kind === "choice" && (
           <div dir={languageDirection(language)} className={cn("grid gap-3", choices.length === 2 ? "grid-cols-2" : choices.length === 4 ? "grid-cols-2" : "grid-cols-3")}>
            {choices.map((o, k) => (
              <GameButton key={o} tone="neutral" className={cn("grid min-h-20 place-items-center rounded-3xl p-2", wrongPicks.includes(o) && "opacity-40")} onClick={() => check(o)} aria-label={o}>
                 {q.optionVisuals ? <G1View v={q.optionVisuals[Number(o)]!} small language={language} /> : /^[\d/:]+$/.test(o) ? <span dir="ltr" className="text-3xl font-black">{o}</span> : <span className={cn("text-2xl font-black", language === "ar" && "font-arabic")} style={q.optionScale ? { fontSize: `${2.2 * (q.optionScale[k] ?? 1)}rem` } : undefined}>{mathText(o, language)}</span>}
              </GameButton>
            ))}
          </div>
        )}
         {q.kind === "order" && <OrderQ key={i} q={q} language={language} onRight={right} onWrong={wrong} />}
      </div>
    </GameShell>
  );
}
