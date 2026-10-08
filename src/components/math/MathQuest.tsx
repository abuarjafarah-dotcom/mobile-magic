import { useEffect, useState } from "react";
import { ArrowLeft, Lightbulb, RotateCcw, Star, Volume2 } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { createQuestRound, questLevels, type QuestLevel } from "@/data/mathQuest";

const KEY = "math-quest-v1";
type Stars = Record<number, number>;

function beep(ok: boolean) {
  try { const c = new AudioContext(), o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.setValueAtTime(ok ? 660 : 300, c.currentTime); o.frequency.exponentialRampToValueAtTime(ok ? 990 : 240, c.currentTime + 0.25); g.gain.setValueAtTime(0.1, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3); o.start(); o.stop(c.currentTime + 0.3); } catch { /* no audio */ }
}
function speak(text: string) {
  if (!("speechSynthesis" in window)) return; window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace("×", "times").replace("÷", "divided by").replace("−", "minus").replace("+", "plus").replace("▢", "what").replace("=", "equals")); u.rate = 0.9; window.speechSynthesis.speak(u);
}

export function MathQuest({ onExit }: { onExit: () => void }) {
  const [stars, setStars] = useState<Stars>({});
  const [level, setLevel] = useState<QuestLevel | null>(null);
  useEffect(() => { try { setStars(JSON.parse(localStorage.getItem(KEY) ?? "{}")); } catch { /* ignore */ } }, []);
  const save = (id: number, n: number) => setStars((s) => { const next = { ...s, [id]: Math.max(s[id] ?? 0, n) }; localStorage.setItem(KEY, JSON.stringify(next)); return next; });

  if (level) return <QuestLevelScreen key={level.id} level={level} onExit={() => setLevel(null)} onDone={(n) => save(level.id, n)} onNext={() => setLevel(questLevels.find((l) => l.id === level.id + 1) ?? null)} />;

  return <section className="mx-auto min-h-dvh w-full max-w-3xl px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] min-[960px]:max-w-5xl">
    <header className="flex items-center gap-3"><GameButton tone="neutral" className="grid h-11 w-11 place-items-center rounded-full p-0" onClick={onExit} aria-label="Back"><ArrowLeft className="h-5 w-5" /></GameButton><div><h1 className="text-2xl font-black">Math Quest</h1><p className="text-sm font-bold text-muted-foreground">8 levels · each one a little harder</p></div></header>
    <ol className="mt-5 grid grid-cols-2 gap-3 min-[960px]:grid-cols-4">
      {questLevels.map((l) => <li key={l.id}><GameButton tone={l.tone} className="flex min-h-40 w-full flex-col items-center justify-center gap-1 rounded-3xl p-3" onClick={() => setLevel(l)}>
        <span className="text-xs font-black uppercase opacity-80">Level {l.id}</span><span className="text-5xl">{l.emoji}</span><span className="text-lg font-black leading-tight">{l.title}</span><span className="text-xs font-bold opacity-80">{l.skill}</span>
        <span className="flex gap-0.5" aria-label={`${stars[l.id] ?? 0} of 3 stars`}>{[1, 2, 3].map((i) => <Star key={i} className={`h-4 w-4 ${i <= (stars[l.id] ?? 0) ? "fill-current" : "opacity-40"}`} />)}</span>
      </GameButton></li>)}
    </ol>
  </section>;
}

function QuestLevelScreen({ level, onExit, onDone, onNext }: { level: QuestLevel; onExit: () => void; onDone: (stars: number) => void; onNext: () => void }) {
  const [round] = useState(() => createQuestRound(level));
  const [i, setI] = useState(0);
  const [misses, setMisses] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const [done, setDone] = useState(false);
  const p = round[i] ?? round[0]!;

  const pick = (n: number) => {
    if (picked === p.answer) return;
    setPicked(n); const ok = n === p.answer; beep(ok);
    if (!ok) { setMisses((m) => m + 1); setHint(true); return; }
    window.setTimeout(() => { if (i === round.length - 1) { const s = misses === 0 ? 3 : misses <= 3 ? 2 : 1; onDone(s); setDone(true); } else { setI(i + 1); setPicked(null); setHint(false); } }, 900);
  };

  if (done) { const s = misses === 0 ? 3 : misses <= 3 ? 2 : 1; const hasNext = level.id < questLevels.length;
    return <section className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center"><span className="animate-pop-in text-7xl">{level.emoji}</span><h1 className="text-3xl font-black">Level {level.id} complete!</h1><p dir="rtl" className="font-arabic text-2xl font-black">ما شاء الله!</p><div className="flex gap-1">{[1, 2, 3].map((k) => <Star key={k} className={`h-10 w-10 text-primary ${k <= s ? "fill-primary" : "opacity-30"}`} />)}</div>
      <div className="grid w-full gap-3">{hasNext && <GameButton tone="mint" className="min-h-16 text-xl" onClick={onNext}>Next level →</GameButton>}<GameButton tone="sun" className="min-h-14" onClick={onExit}><span className="inline-flex items-center gap-2"><RotateCcw className="h-5 w-5" />All levels</span></GameButton></div></section>; }

  return <section className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(.75rem,env(safe-area-inset-top))]">
    <header className="grid grid-cols-[auto_1fr_auto] items-center gap-2"><GameButton tone="neutral" className="grid h-11 w-11 place-items-center rounded-full p-0" onClick={onExit} aria-label="Back to levels"><ArrowLeft className="h-5 w-5" /></GameButton><div className="text-center"><p className="text-xs font-black uppercase text-muted-foreground">Level {level.id} · Question {i + 1} of {round.length}</p><h1 className="text-xl font-black">{level.emoji} {level.title}</h1></div><GameButton tone="neutral" className="grid h-11 w-11 place-items-center rounded-full p-0" onClick={() => speak(p.text)} aria-label="Hear question"><Volume2 className="h-5 w-5" /></GameButton></header>
    <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full bg-success transition-all" style={{ width: `${(i / round.length) * 100}%` }} /></div>
    <div className={`mt-4 flex flex-1 flex-col items-center justify-center gap-4 rounded-3xl p-5 shadow-lg ${level.tone === "sun" ? "bg-primary/20" : level.tone === "sky" ? "bg-secondary/40" : level.tone === "berry" ? "bg-accent/25" : "bg-success/25"}`}>
      <p className="text-center text-sm font-black text-muted-foreground">{level.scene}</p>
      <p key={i} className="animate-pop-in text-5xl font-black tabular-nums sm:text-6xl">{p.text}{p.text.includes("=") ? "" : " = ?"}</p>
      {p.visual && <div className="flex flex-wrap justify-center gap-2" aria-hidden="true">{Array.from({ length: p.visual.groups }, (_, g) => <div key={g} className="flex max-w-24 flex-wrap justify-center gap-0.5 rounded-xl bg-card px-2 py-1 text-lg">{Array.from({ length: p.visual!.each }, (_, k) => <span key={k}>{p.visual!.emoji}</span>)}</div>)}</div>}
      <div className="grid w-full max-w-md grid-cols-2 gap-3">{p.choices.map((c) => { const right = picked === c && c === p.answer, wrong = picked === c && c !== p.answer;
        return <GameButton key={c} tone={right ? "mint" : wrong ? "neutral" : level.tone} className={`min-h-20 rounded-full text-3xl tabular-nums ${wrong ? "opacity-50" : ""} ${right ? "animate-pop-in" : ""}`} onClick={() => pick(c)} aria-label={`Answer ${c}`}>{level.id === 1 ? "🎈" : ""}{c}</GameButton>; })}</div>
      <p className="min-h-8 text-lg font-black" aria-live="polite">{picked === p.answer ? "Great job! ⭐" : picked !== null ? "Let’s try again!" : ""}</p>
      {hint ? <p className="rounded-2xl bg-card px-4 py-3 text-center font-black">💡 {p.hint}</p> : <GameButton tone="neutral" className="min-h-11 px-4 text-sm" onClick={() => setHint(true)}><span className="inline-flex items-center gap-2"><Lightbulb className="h-4 w-4" />Hint</span></GameButton>}
    </div>
  </section>;
}
