import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, RotateCcw, Sparkles, Star, Volume2, VolumeX } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { createBowlingRoundSet, type Bowler, type BowlingProblem } from "@/data/mathBowling";
import laneAsset from "@/assets/bowling/lane.jpeg.asset.json";
import ballAsset from "@/assets/bowling/ball-transparent.png";
import pinAsset from "@/assets/bowling/pin-transparent.png";
import hamadReadyAsset from "@/assets/bowling/hamad-ready-transparent.png";
import hamadBowlingAsset from "@/assets/bowling/hamad-bowling-transparent.png";
import hamadCelebratingAsset from "@/assets/bowling/hamad-celebrating-transparent.png";
import talalReadyAsset from "@/assets/bowling/talal-ready-transparent.png";
import talalBowlingAsset from "@/assets/bowling/talal-bowling-transparent.png";
import talalCelebratingAsset from "@/assets/bowling/talal-celebrating-transparent.png";
import strikeAsset from "@/assets/bowling/strike-transparent.png";

type Phase = "ready" | "rolling" | "correct" | "wrong" | "complete";
type Sound = "question" | "select" | "bowl" | "correct" | "incorrect" | "pins" | "celebration";
type Scores = Record<Bowler, number>;
const characterAssets = { hamad: { ready: hamadReadyAsset, rolling: hamadBowlingAsset, correct: hamadCelebratingAsset }, talal: { ready: talalReadyAsset, rolling: talalBowlingAsset, correct: talalCelebratingAsset } };
const rollAnimations = ["animate-bowling-roll-0", "animate-bowling-roll-1", "animate-bowling-roll-2", "animate-bowling-roll-3"];
const frequencies: Record<Exclude<Sound, "question">, [number, number]> = { select: [430, 540], bowl: [190, 310], correct: [650, 980], incorrect: [310, 250], pins: [520, 240], celebration: [720, 1120] };

const audio = { play(kind: Sound, enabled: boolean, question?: BowlingProblem) {
  if (!enabled || typeof window === "undefined") return;
  if (kind === "question" && question && "speechSynthesis" in window) { window.speechSynthesis.cancel(); const text = `${question.bowler === "hamad" ? "Hamad" : "Talal"}'s turn. ${question.first} ${question.operator === "+" ? "plus" : "minus"} ${question.second}.`; const voice = new SpeechSynthesisUtterance(text); voice.rate = 0.9; window.speechSynthesis.speak(voice); return; }
  if (kind === "question") return;
  const AudioContextType = window.AudioContext; if (!AudioContextType) return;
  const context = new AudioContextType(), oscillator = context.createOscillator(), gain = context.createGain(); oscillator.connect(gain); gain.connect(context.destination); oscillator.frequency.setValueAtTime(frequencies[kind][0], context.currentTime); oscillator.frequency.exponentialRampToValueAtTime(frequencies[kind][1], context.currentTime + 0.3); gain.gain.setValueAtTime(0.1, context.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.34); oscillator.start(); oscillator.stop(context.currentTime + 0.34);
} };
const nameOf = (bowler: Bowler) => bowler === "hamad" ? "Hamad" : "Talal";
const rackRows = [[6, 7, 8, 9], [3, 4, 5], [1, 2], [0]];
function PinRack({ down }: { down: number }) {
  if (down >= 10) return <div className="animate-pop-in absolute inset-x-0 top-[40%] z-20 mx-auto w-44"><img src={strikeAsset} alt="Strike! All 10 pins down" className="w-full object-contain drop-shadow-xl" draggable={false} /></div>;
  return <div className="pointer-events-none absolute inset-x-0 top-[42%] z-[5] flex flex-col items-center gap-0" aria-label={`${10 - down} pins standing`}>{rackRows.map((row, r) => <div key={r} className="flex gap-1">{row.map((pin) => <img key={pin} src={pinAsset} alt="" className={`h-10 w-6 object-contain drop-shadow sm:h-12 sm:w-7 ${pin < down ? "animate-bowling-pin-fall opacity-30" : ""}`} draggable={false} />)}</div>)}</div>;
}

export function MathBowling({ onExit }: { onExit: () => void }) {
  const [problems, setProblems] = useState(createBowlingRoundSet);
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [scores, setScores] = useState<Scores>({ hamad: 0, talal: 0 });
  const [sound, setSound] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef<number | null>(null);
  const dragRef = useRef<number | null>(null);
  const [dragNote, setDragNote] = useState(false);
  const problem = problems[roundIndex];
  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); if ("speechSynthesis" in window) window.speechSynthesis.cancel(); }, []);
  const selectAnswer = (choice: number) => { if (!problem || phase === "rolling" || phase === "correct") return; setSelected(choice); setPhase("ready"); setShowHint(false); audio.play("select", sound); };
  const bowl = useCallback(() => {
    if (!problem || selected === null || phase === "rolling" || phase === "correct") return;
    setPhase("rolling"); setShowHint(false); audio.play("bowl", sound);
    timerRef.current = window.setTimeout(() => {
      if (selected !== problem.answer) { setPhase("wrong"); setShowHint(true); audio.play("incorrect", sound); return; }
      setScores((current) => ({ ...current, [problem.bowler]: current[problem.bowler] + 1 })); setPhase("correct"); audio.play("pins", sound);
      timerRef.current = window.setTimeout(() => audio.play("celebration", sound), 260);
      timerRef.current = window.setTimeout(() => { if (roundIndex === 9) { setPhase("complete"); return; } setRoundIndex((current) => current + 1); setSelected(null); setPhase("ready"); setShowHint(false); }, 1450);
    }, 1450);
  }, [phase, problem, roundIndex, selected, sound]);
  useEffect(() => { const key = (event: KeyboardEvent) => { if (event.code === "Space") { event.preventDefault(); bowl(); } }; window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key); }, [bowl]);
  const playAgain = () => { setProblems(createBowlingRoundSet()); setRoundIndex(0); setSelected(null); setPhase("ready"); setScores({ hamad: 0, talal: 0 }); setShowHint(false); };
  if (!problem) return null;
  if (phase === "complete") return <BowlingFinal scores={scores} onAgain={playAgain} onExit={onExit} />;
  const name = nameOf(problem.bowler), state = phase === "rolling" ? "rolling" : phase === "correct" ? "correct" : "ready", selectedIndex = selected === null ? -1 : problem.choices.indexOf(selected);
  const feedback = phase === "correct" ? (roundIndex === 9 ? "Great job, brothers!" : `Great bowling, ${name}!`) : phase === "wrong" ? "Let’s try again!" : `${name}'s turn!`;
  return <section className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col overflow-hidden px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(.75rem,env(safe-area-inset-top))] sm:px-5 min-[960px]:max-w-6xl min-[960px]:pb-4 min-[960px]:pt-4">
    <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2"><GameButton tone="neutral" className="grid h-11 w-11 place-items-center rounded-full p-0" onClick={onExit} aria-label="Leave Math Bowling"><ArrowLeft className="h-5 w-5" /></GameButton><div className="min-w-0 text-center"><p className="text-xs font-black uppercase text-muted-foreground">Round {problem.round} of 10</p><h1 className="truncate text-xl font-black sm:text-2xl">{name}&apos;s turn!</h1></div><GameButton tone={sound ? "mint" : "neutral"} className="grid h-11 w-11 place-items-center rounded-full p-0" onClick={() => setSound((value) => !value)} aria-label={sound ? "Turn bowling sounds off" : "Turn bowling sounds on"}>{sound ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}</GameButton></header>
    <div className="min-[960px]:grid min-[960px]:min-h-0 min-[960px]:flex-1 min-[960px]:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] min-[960px]:gap-4">
    <div className="mx-auto mt-2 flex w-full max-w-xl flex-col gap-2 min-[960px]:mt-0 min-[960px]:justify-center"><div className="flex items-center gap-3 min-[960px]:flex-col"><img src={characterAssets[problem.bowler][state]} alt={`${name} ${state}`} className="h-28 w-24 shrink-0 object-contain drop-shadow-lg sm:h-36 sm:w-32 min-[960px]:h-52 min-[960px]:w-48" draggable={false} /><div className="min-w-0 flex-1 text-center min-[960px]:flex-none"><p className="text-4xl font-black tabular-nums sm:text-5xl">{problem.first} {problem.operator} {problem.second} = ?</p><GameButton tone="neutral" className="mt-2 min-h-10 px-4 text-sm" onClick={() => audio.play("question", sound, problem)}><span className="inline-flex items-center gap-2"><Volume2 className="h-4 w-4" />Hear question</span></GameButton></div></div><div className="grid grid-cols-4 gap-2" aria-label="Choose an answer pin">{problem.choices.map((choice) => { const isSelected = choice === selected; return <GameButton key={choice} tone={isSelected ? "sun" : "neutral"} className={`relative min-h-24 overflow-hidden px-1 py-1 shadow-md transition-transform ${isSelected ? "-translate-y-1 ring-4 ring-primary" : ""}`} onClick={() => selectAnswer(choice)} aria-pressed={isSelected} aria-label={`Answer ${choice}`}><img src={pinAsset} alt="" className="mx-auto h-16 w-full object-contain drop-shadow-md" draggable={false} /><span className="absolute inset-x-1 bottom-1 rounded-lg bg-card/90 py-0.5 text-lg font-black tabular-nums">{choice}</span></GameButton>; })}</div><div className="text-center"><p className={`mx-auto min-h-10 rounded-2xl px-4 py-2 text-base font-black shadow-md ${phase === "wrong" ? "bg-card text-destructive" : phase === "correct" ? "bg-success text-success-foreground" : "bg-card text-card-foreground"}`} aria-live="polite">{feedback}</p>{dragNote && selected === null && <p className="mt-2 rounded-xl bg-secondary px-3 py-2 text-sm font-black text-secondary-foreground">Pick an answer pin first!</p>}{showHint && <p className="mt-2 rounded-xl bg-secondary px-3 py-2 text-sm font-black text-secondary-foreground">Hint: {problem.hint}</p>}<p className="my-1 text-xs font-black text-muted-foreground">Swipe the ball up or press BOWL</p><GameButton tone="mint" className="min-h-14 w-full text-xl" disabled={selected === null || phase === "rolling" || phase === "correct"} onClick={bowl}>BOWL</GameButton></div></div>
    <div className="relative mx-auto mt-2 min-h-[430px] w-full max-w-xl flex-1 overflow-hidden rounded-3xl border-4 border-card bg-muted shadow-xl sm:min-h-[520px] min-[960px]:mt-0 min-[960px]:min-h-[560px] min-[960px]:max-w-none"><img src={laneAsset.url} alt="Wooden bowling lane" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <PinRack down={phase === "correct" ? Math.min(problem.answer, 10) : 0} />
      {(phase === "rolling" || phase === "correct") && selectedIndex >= 0 && <img src={ballAsset} alt="Bowling ball rolling" className={`${rollAnimations[selectedIndex] ?? rollAnimations[0]} absolute bottom-4 left-1/2 z-10 h-20 w-20 -translate-x-1/2 object-contain drop-shadow-lg sm:h-24 sm:w-24`} draggable={false} />}
      {(phase === "ready" || phase === "wrong") && <img src={ballAsset} alt="Drag the ball up to throw" onPointerDown={(e) => { dragRef.current = e.clientY; (e.target as HTMLElement).setPointerCapture(e.pointerId); }} onPointerUp={(e) => { const start = dragRef.current; dragRef.current = null; if (start !== null && start - e.clientY > 40) { if (selected === null) setDragNote(true); else bowl(); } }} className="absolute bottom-40 left-1/2 z-10 h-16 w-16 -translate-x-1/2 cursor-grab touch-none select-none object-contain drop-shadow-lg active:cursor-grabbing sm:h-20 sm:w-20" draggable={false} />}
      {phase === "correct" && <p className="animate-pop-in absolute inset-x-0 top-[62%] z-20 mx-auto w-fit rounded-2xl bg-card px-4 py-1 text-lg font-black shadow-md">{Math.min(problem.answer, 10) === 10 ? "STRIKE! 10 pins down!" : `${Math.min(problem.answer, 10)} ${problem.answer === 1 ? "pin" : "pins"} down!`}</p>}
    </div></div><div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs font-black"><span className="rounded-xl bg-card px-2 py-2">{roundIndex} rounds done</span><span className="rounded-xl bg-card px-2 py-2">Hamad {scores.hamad}</span><span className="rounded-xl bg-card px-2 py-2">Talal {scores.talal}</span></div>
  </section>;
}

function BowlingFinal({ scores, onAgain, onExit }: { scores: Scores; onAgain: () => void; onExit: () => void }) {
  const stars = useMemo(() => Array.from({ length: 6 }), []);
  return <section className="relative mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center justify-center overflow-hidden px-4 py-[max(2rem,env(safe-area-inset-bottom))] text-center">{stars.map((_, index) => <Star key={index} className="animate-float-star absolute bottom-0 h-8 w-8 fill-primary text-primary" style={{ left: `${8 + index * 16}%`, animationDelay: `${index * 0.16}s` }} aria-hidden="true" />)}<Sparkles className="h-10 w-10 text-primary" /><h1 className="mt-2 text-4xl font-black">10 rounds complete!</h1><p className="mt-2 text-xl font-black text-success">Great job, brothers!</p><p dir="rtl" className="font-arabic text-2xl font-black">ما شاء الله!</p><div className="mt-5 flex w-full max-w-lg items-end justify-center gap-2"><img src={hamadCelebratingAsset} alt="Hamad celebrating" className="h-56 min-w-0 flex-1 object-contain drop-shadow-xl" /><img src={talalCelebratingAsset} alt="Talal celebrating" className="h-56 min-w-0 flex-1 object-contain drop-shadow-xl" /></div><img src={strikeAsset} alt="Bowling strike" className="-mt-8 h-28 w-40 object-contain drop-shadow-xl" /><div className="mt-4 grid w-full max-w-md grid-cols-3 gap-2"><div className="rounded-2xl bg-card p-3 shadow-sm"><span className="block text-2xl font-black">5</span>Hamad turns</div><div className="rounded-2xl bg-card p-3 shadow-sm"><span className="block text-2xl font-black">5</span>Talal turns</div><div className="rounded-2xl bg-success p-3 text-success-foreground shadow-sm"><span className="block text-2xl font-black">{scores.hamad + scores.talal}</span>Total correct</div></div><div className="mt-5 grid w-full max-w-md gap-3"><GameButton tone="mint" className="min-h-16 text-xl" onClick={onAgain}><span className="inline-flex items-center gap-2"><RotateCcw className="h-5 w-5" />Play again</span></GameButton><GameButton tone="neutral" className="min-h-14" onClick={onExit}>Choose another game</GameButton></div></section>;
}