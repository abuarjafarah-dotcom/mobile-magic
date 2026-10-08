import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, ChevronRight, Eye, Flame, Heart, Lock, RotateCcw, Star, UserRound, Users, Volume2 } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { FamilyCharacter, GameShell, WordPicture, shuffle, useClip } from "@/components/learn/shared";
import { allLessons, combos, prompts, unitById, units, type CurriculumItem, type ExerciseKind, type Guide, type Lesson, type PromptId, type ShapeId, type Unit, type Visual } from "@/data/arabicCurriculum";
import { curriculumAudio } from "@/data/arabicCurriculumAudio";
import { animalImages } from "@/data/animalImages";
import { addUnique, streak, type LearningProgress } from "@/lib/learningProgress";
import { cn } from "@/lib/utils";

type Update = (change: (p: LearningProgress) => LearningProgress) => void;
const audioOf = (unit: string, id: string) => curriculumAudio[`${unit}-${id}`] ?? "";
const promptAudio = (p: PromptId) => curriculumAudio[`prompt-${p}`] ?? "";
const letterAudio = (char: string) => {
  const l = unitById("letters").items.find((i) => i.ar === (char === "أ" ? "ا" : char));
  return l ? audioOf("letters", l.id) : "";
};

// All lessons are open access — no sequential locking.
export const isUnlocked = (_progress: LearningProgress, _lessonId: string) => true;

/* ---------------- Characters & visuals ---------------- */

export function GuideAvatar({ who, size = "small", className }: { who: Guide; size?: "small" | "large"; className?: string }) {
  if (who === "hamad" || who === "talal" || who === "yousef") return <FamilyCharacter name={who} size={size} className={className ?? ""} />;
  // Mama & Dad: warm placeholders until their approved photos are added.
  const Icon = who === "mama" ? Heart : UserRound;
  return (
    <div className={cn(size === "large" ? "h-24 w-24 rounded-2xl border-4" : "h-12 w-12 shrink-0 rounded-xl border-2", "grid place-items-center border-card bg-accent text-accent-foreground shadow-lg", className)}>
      <div className="grid justify-items-center">
        <Icon className={size === "large" ? "h-9 w-9" : "h-5 w-5"} />
        <span lang="ar" className={cn("font-arabic font-bold leading-none", size === "large" ? "text-lg" : "text-[10px]")}>{who === "mama" ? "ماما" : "بابا"}</span>
      </div>
    </div>
  );
}

export function ShapeSvg({ shape, color = "currentColor", className }: { shape: ShapeId; color?: string; className?: string }) {
  const p = { fill: color, stroke: "hsl(0 0% 0% / 0.15)", strokeWidth: 2 };
  const el = {
    circle: <circle cx="50" cy="50" r="40" {...p} />,
    square: <rect x="12" y="12" width="76" height="76" rx="4" {...p} />,
    triangle: <polygon points="50,10 92,88 8,88" {...p} />,
    rectangle: <rect x="6" y="26" width="88" height="48" rx="4" {...p} />,
    star: <polygon points="50,6 62,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 38,38" {...p} />,
    heart: <path d="M50 88 C10 60 6 34 22 20 C34 10 46 16 50 28 C54 16 66 10 78 20 C94 34 90 60 50 88Z" {...p} />,
    oval: <ellipse cx="50" cy="50" rx="44" ry="30" {...p} />,
    diamond: <polygon points="50,6 88,50 50,94 12,50" {...p} />,
    crescent: <path d="M62 8 A42 42 0 1 0 62 92 A34 34 0 1 1 62 8Z" {...p} />,
  }[shape];
  return <svg viewBox="0 0 100 100" className={className} aria-hidden>{el}</svg>;
}

export function VisualView({ item, className }: { item: CurriculumItem; className?: string }) {
  const v: Visual | undefined = item.visual;
  const box = cn("grid h-28 w-28 place-items-center overflow-hidden rounded-3xl bg-card shadow-md", className);
  if (!v) return <div className={box}><span dir="rtl" lang="ar" className="font-arabic text-5xl">{item.ar}</span></div>;
  if (v.kind === "color") return <div className={box}><div className="h-3/4 w-3/4 rounded-full border-4 border-border" style={{ backgroundColor: v.value }} /></div>;
  if (v.kind === "shape") return <div className={box}><ShapeSvg shape={v.shape} color={v.color ?? "var(--primary)"} className="h-3/4 w-3/4 text-primary" /></div>;
  if (v.kind === "animal") return <div className={box}><img src={animalImages[v.animal]} alt="" draggable={false} loading="lazy" className="h-full w-full object-cover" /></div>;
  if (v.kind === "picture") return <WordPicture picture={v.picture} className={className ?? ""} />;
  const who = v.who;
  if (who === "hamad" || who === "talal" || who === "yousef" || who === "mama" || who === "baba") return <div className={box}><GuideAvatar who={who} size="large" className="h-full w-full rounded-3xl border-0 shadow-none" /></div>;
  if (who === "brother") return <div className={cn(box, "grid-flow-col gap-1 p-2")}><FamilyCharacter name="talal" size="small" className="h-14 w-14" /><FamilyCharacter name="yousef" size="small" className="h-14 w-14" /></div>;
  if (who === "child") return <div className={box}><FamilyCharacter name="yousef" size="large" className="h-full w-full rounded-3xl border-0 shadow-none" /></div>;
  if (who === "sister") return <div className={cn(box, "bg-accent text-accent-foreground")}><UserRound className="h-14 w-14" /></div>;
  return (
    <div className={cn(box, "grid-cols-2 gap-1 p-2")}>
      <FamilyCharacter name="hamad" size="small" className="h-11 w-11" /><FamilyCharacter name="talal" size="small" className="h-11 w-11" />
      <FamilyCharacter name="yousef" size="small" className="h-11 w-11" /><div className="grid h-11 w-11 place-items-center rounded-xl bg-accent"><Users className="h-5 w-5" /></div>
    </div>
  );
}

/* ---------------- Map (home tab) ---------------- */

export function ArabicMap({ progress, onStart }: { progress: LearningProgress; onStart: (lesson: Lesson) => void }) {
  const done = progress.arabic.lessons;
  const current = allLessons.find((l) => !done.includes(l.id));
  const days = streak(progress.arabic.days);
  const reviewable = units.filter((u) => done.includes(`${u.id}-1`));
  const review = () => {
    const u = shuffle(reviewable)[0];
    if (u) onStart({ id: `${u.id}-review`, unit: u.id, index: 99, review: true, items: u.items.filter((i) => progress.arabic.learned.includes(`${u.id}:${i.id}`)) });
  };
  return (
    <div>
      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-card p-2 shadow-sm"><Flame className="mx-auto h-6 w-6 text-primary" /><p className="text-lg font-black">{days}</p></div>
        <div className="rounded-2xl bg-card p-2 shadow-sm"><Star className="mx-auto h-6 w-6 fill-primary text-primary" /><p className="text-lg font-black">{done.length}</p></div>
        <GameButton tone="sky" className="min-h-0 rounded-2xl p-2" disabled={!reviewable.length} onClick={review} aria-label="Review">
          <RotateCcw className="mx-auto h-6 w-6" /><span lang="ar" className="font-arabic text-base">مراجعة</span>
        </GameButton>
      </div>
      <ol className="grid gap-6 min-[960px]:grid-cols-2">
        {units.map((unit) => {
          const lessons = allLessons.filter((l) => l.unit === unit.id);
          const complete = lessons.every((l) => done.includes(l.id));
          return (
            <li key={unit.id} className="rounded-3xl bg-card/70 p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <GuideAvatar who={unit.guide} />
                <div className="min-w-0 flex-1">
                  <p dir="rtl" lang="ar" className="font-arabic text-2xl font-bold leading-tight">{unit.ar}</p>
                  <p className="text-xs font-bold text-muted-foreground">{unit.level}. {unit.en}</p>
                </div>
                {complete && <Check className="h-7 w-7 text-success" />}
              </div>
              <div className="flex flex-wrap justify-center gap-3" dir="rtl">
                {lessons.map((l, i) => {
                  const finished = done.includes(l.id);
                  const open = isUnlocked(progress, l.id);
                  const isCurrent = current?.id === l.id;
                  return (
                    <GameButton key={l.id} tone={finished ? "mint" : isCurrent ? unit.tone : "neutral"} disabled={!open} onClick={() => onStart(l)}
                      className={cn("grid h-16 w-16 place-items-center rounded-full p-0", i % 2 === 1 && "translate-y-3", isCurrent && "ring-4 ring-primary ring-offset-2 ring-offset-background")}
                      aria-label={`${unit.en} ${l.review ? "review" : `lesson ${i + 1}`}${finished ? " done" : open ? "" : " locked"}`}>
                      {finished ? <Check className="h-7 w-7" /> : !open ? <Lock className="h-5 w-5 opacity-60" /> : l.review ? <RotateCcw className="h-6 w-6" /> : <span className="text-xl font-black">{i + 1}</span>}
                    </GameButton>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------------- Lesson engine ---------------- */

type Ex = { kind: ExerciseKind; item: CurriculumItem; options: CurriculumItem[]; flag?: boolean };

function makeExercises(unit: Unit, lesson: Lesson): Ex[] {
  const pool = lesson.items.length >= 3 ? lesson.items : [...lesson.items, ...unit.items.filter((i) => !lesson.items.includes(i))];
  const opts = (item: CurriculumItem, n = 3) => shuffle([item, ...shuffle(pool.filter((p) => p.id !== item.id)).slice(0, n - 1)]);
  const out: Ex[] = [];
  if (!lesson.review && unit.kinds.includes("learn")) lesson.items.forEach((item) => out.push({ kind: "learn", item, options: [] }));
  const kinds = unit.kinds.filter((k) => k !== "learn");
  const count = lesson.review ? 8 : Math.max(5, lesson.items.length * 2);
  let targets: CurriculumItem[] = [];
  for (let i = 0; i < count; i++) {
    if (!targets.length) targets = shuffle(lesson.items);
    const item = targets.pop()!;
    const kind = kinds[i % kinds.length]!;
    if (kind === "combo" && !lesson.review && lesson.index < 2) { out.push({ kind: "pickVisual", item, options: opts(item) }); continue; }
    out.push({ kind, item, options: kind === "match" ? opts(item, Math.min(3, pool.length)) : opts(item), flag: Math.random() < 0.5 });
  }
  return out;
}

export function ArabicLesson({ lesson, progress, onProgress, onExit }: { lesson: Lesson; progress: LearningProgress; onProgress: Update; onExit: () => void }) {
  const unit = unitById(lesson.unit);
  const [seed, setSeed] = useState(0);
  const exercises = useMemo(() => makeExercises(unit, lesson), [unit, lesson, seed]);
  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone] = useState(false);
  const { play } = useClip();

  const next = () => {
    if (index + 1 < exercises.length) { setIndex(index + 1); return; }
    const today = new Date().toISOString().slice(0, 10);
    onProgress((p) => ({
      ...p,
      arabic: {
        ...p.arabic,
        lessons: lesson.index === 99 ? p.arabic.lessons : addUnique(p.arabic.lessons, lesson.id),
        learned: lesson.items.reduce((acc, i) => addUnique(acc, `${unit.id}:${i.id}`), p.arabic.learned),
        days: addUnique(p.arabic.days, today),
      },
    }));
    play(promptAudio("great"));
    setDone(true);
  };
  const miss = () => { setMistakes((m) => m + 1); };

  const title = unit.ar;
  if (done) {
    const stars = mistakes === 0 ? 3 : mistakes <= 3 ? 2 : 1;
    const nextLesson = allLessons[allLessons.findIndex((l) => l.id === lesson.id) + 1];
    return (
      <GameShell title={title} onExit={onExit}>
        <div className="mt-10 grid justify-items-center gap-5 text-center animate-pop-in">
          <div className="flex items-end gap-3"><GuideAvatar who={unit.guide} size="large" className="animate-hamad-cheer" /><FamilyCharacter name="yousef" size="small" /></div>
          <p dir="rtl" lang="ar" className="font-arabic text-5xl font-bold">{prompts.great.ar}</p>
          <div className="flex gap-2">{[1, 2, 3].map((s) => <Star key={s} className={cn("h-12 w-12", s <= stars ? "fill-primary text-primary" : "text-muted")} />)}</div>
          <div className="flex flex-wrap justify-center gap-2">{lesson.items.slice(0, 8).map((i) => <VisualView key={i.id} item={i} className="h-16 w-16 rounded-2xl [&_span]:text-2xl" />)}</div>
          <div className="grid w-full grid-cols-2 gap-3">
            <GameButton tone="neutral" className="min-h-16" onClick={onExit}>Map</GameButton>
            <GameButton tone="mint" className="min-h-16" onClick={() => { setSeed((s) => s + 1); setIndex(0); setMistakes(0); setDone(false); }} aria-label="Play again"><RotateCcw className="mx-auto h-6 w-6" /></GameButton>
          </div>
          {nextLesson && nextLesson.unit === lesson.unit && lesson.index !== 99 && <p className="text-sm font-bold text-muted-foreground">Next lesson unlocked on the map</p>}
        </div>
      </GameShell>
    );
  }

  const ex = exercises[index]!;
  const common = { ex, unit, onNext: next, onMiss: miss };
  const k = `${seed}-${index}`;
  return (
    <GameShell title={title} current={index} total={exercises.length} onExit={onExit}>
      {ex.kind === "learn" && <LearnEx key={k} {...common} />}
      {(ex.kind === "listen" || ex.kind === "pickWord" || ex.kind === "pickVisual" || ex.kind === "soundPick") && <ChoiceEx key={k} {...common} />}
      {ex.kind === "match" && <MatchEx key={k} {...common} />}
      {ex.kind === "trace" && <TraceEx key={k} {...common} />}
      {(ex.kind === "formsFind" || ex.kind === "formsMiddle") && <FormsEx key={k} {...common} />}
      {ex.kind === "order" && <OrderEx key={k} {...common} />}
      {ex.kind === "neighbor" && <NeighborEx key={k} {...common} />}
      {(ex.kind === "build" || ex.kind === "listenBuild") && <BuildEx key={k} {...common} />}
      {ex.kind === "read" && <ReadEx key={k} {...common} />}
      {ex.kind === "combo" && <ComboEx key={k} {...common} />}
    </GameShell>
  );
}

type ExProps = { ex: Ex; unit: Unit; onNext: () => void; onMiss: () => void };

function Prompt({ who, id, cheer, extra }: { who: Guide; id: PromptId; cheer?: boolean; extra?: string }) {
  return (
    <div className="mt-4 flex items-center gap-3" dir="rtl">
      <GuideAvatar who={who} className={cheer ? "animate-hamad-cheer" : "animate-hamad-float"} />
      <div lang="ar" className="rounded-2xl rounded-br-sm bg-card px-4 py-2 font-arabic text-2xl font-bold shadow-sm">{cheer ? prompts.great.ar : `${prompts[id].ar}${extra ? ` ${extra}` : ""}`}</div>
    </div>
  );
}

function NextButton({ onClick }: { onClick: () => void }) {
  return (
    <GameButton tone="mint" className="mt-auto min-h-16 text-xl animate-pop-in" onClick={onClick} aria-label="Next">
      <ChevronRight className="mx-auto h-8 w-8" />
    </GameButton>
  );
}

function SpeakButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return <GameButton tone="sky" className={cn("grid h-16 w-16 place-items-center rounded-full p-0", className)} onClick={onClick} aria-label="Hear it"><Volume2 className="h-7 w-7" /></GameButton>;
}

const ArText = ({ children, className }: { children: ReactNode; className?: string }) => <span dir="rtl" lang="ar" className={cn("font-arabic leading-snug", className)}>{children}</span>;

function LearnEx({ ex, unit, onNext }: ExProps) {
  const { play } = useClip();
  const [heard, setHeard] = useState(false);
  const say = () => { play(audioOf(unit.id, ex.item.id)); setHeard(true); };
  useEffect(() => { play(audioOf(unit.id, ex.item.id)); }, [ex, unit, play]);
  const it = ex.item;
  return (
    <div className="flex flex-1 flex-col gap-5">
      <Prompt who={unit.guide} id="tap" cheer={heard} />
      <GameButton tone={heard ? "mint" : unit.tone} className="mx-auto grid w-full max-w-80 place-items-center gap-2 p-5" onClick={say} aria-label="Hear it">
        {it.visual ? <VisualView item={it} className="h-40 w-40" /> : <ArText className="text-[8rem] leading-none">{it.ar}</ArText>}
        {it.visual && <ArText className="text-5xl font-bold">{it.ar}</ArText>}
        {it.answer && <ArText className="text-2xl">{it.answer}</ArText>}
      </GameButton>
      {it.forms && unit.id === "forms" && (
        <div className="grid grid-cols-4 gap-2" dir="rtl">
          {it.forms.map((f) => <div key={f} className="grid h-20 place-items-center rounded-2xl bg-card shadow-sm"><ArText className="text-5xl">{f}</ArText></div>)}
        </div>
      )}
      {it.example && unit.id === "letters" && (
        <GameButton tone="neutral" className="mx-auto px-6" onClick={() => play(audioOf(unit.id, `${it.id}-ex`))} aria-label="Hear example word">
          <ArText className="text-4xl"><span className="text-primary">{it.example.ar.charAt(0)}</span>{it.example.ar.slice(1)}</ArText>
        </GameButton>
      )}
      {heard && <NextButton onClick={onNext} />}
    </div>
  );
}

function ChoiceEx({ ex, unit, onNext, onMiss }: ExProps) {
  const { play } = useClip();
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<string[]>([]);
  const mode = ex.kind;
  const target = () => play(audioOf(unit.id, ex.item.id));
  useEffect(() => { if (mode === "listen" || mode === "pickVisual") play(audioOf(unit.id, ex.item.id)); }, [ex, mode, unit, play]);
  const showVisualOptions = mode === "listen" ? !!ex.item.visual : mode === "pickVisual";
  const pick = (o: CurriculumItem) => {
    if (solved) return;
    if (o.id === ex.item.id) { setSolved(true); play(audioOf(unit.id, o.id)); }
    else { setWrong((w) => addUnique(w, o.id)); onMiss(); play(promptAudio("again")); }
  };
  const promptId: PromptId = mode === "listen" ? "listen" : mode === "soundPick" ? "sound" : mode === "pickWord" ? "what" : "where";
  return (
    <div className="flex flex-1 flex-col gap-5">
      <Prompt who={unit.guide} id={promptId} cheer={solved} />
      <div className="flex items-center justify-center gap-4">
        {mode === "listen" && <SpeakButton onClick={target} className="h-24 w-24" />}
        {(mode === "pickWord" || mode === "soundPick") && <VisualView item={ex.item} className="h-40 w-40" />}
        {mode === "pickVisual" && <GameButton tone="neutral" className="px-6" onClick={target} aria-label="Hear it"><ArText className="text-5xl font-bold">{ex.item.ar}</ArText></GameButton>}
      </div>
      <div className={cn("mt-auto grid gap-3", showVisualOptions ? "grid-cols-3" : "grid-cols-1")} dir="rtl">
        {ex.options.map((o) => (
          <GameButton key={o.id} tone={solved && o.id === ex.item.id ? "mint" : "neutral"} onClick={() => pick(o)} aria-label={o.en}
            className={cn("grid place-items-center p-2", showVisualOptions ? "aspect-square" : "min-h-20", wrong.includes(o.id) && "opacity-40", wrong.length > 0 && !solved && o.id === ex.item.id && "ring-4 ring-success ring-offset-2 ring-offset-background")}>
            {showVisualOptions ? <VisualView item={o} className="h-full w-full shadow-none [&_span]:text-4xl" /> : <ArText className="text-4xl font-bold">{o.ar}</ArText>}
          </GameButton>
        ))}
      </div>
      {solved && <NextButton onClick={onNext} />}
    </div>
  );
}

function MatchEx({ ex, unit, onNext, onMiss }: ExProps) {
  const { play } = useClip();
  const left = ex.options;
  const right = useMemo(() => shuffle(ex.options), [ex]);
  const [sel, setSel] = useState<string | null>(null);
  const [paired, setPaired] = useState<string[]>([]);
  const [bad, setBad] = useState<string | null>(null);
  const complete = paired.length === left.length;
  const pickRight = (o: CurriculumItem) => {
    if (!sel || paired.includes(o.id)) return;
    if (sel === o.id) { setPaired((p) => [...p, o.id]); setSel(null); play(audioOf(unit.id, o.id)); }
    else { setBad(o.id); onMiss(); setTimeout(() => setBad(null), 500); }
  };
  return (
    <div className="flex flex-1 flex-col gap-5">
      <Prompt who={unit.guide} id="match" cheer={complete} />
      <div className="grid grid-cols-2 gap-4" dir="rtl">
        <div className="grid gap-3">
          {left.map((o) => (
            <GameButton key={o.id} tone={paired.includes(o.id) ? "mint" : sel === o.id ? "sun" : "neutral"} disabled={paired.includes(o.id)} onClick={() => setSel(o.id)} className="grid aspect-square place-items-center p-2" aria-label={`Picture ${o.en}`}>
              <VisualView item={o} className="h-full w-full shadow-none" />
            </GameButton>
          ))}
        </div>
        <div className="grid gap-3">
          {right.map((o) => (
            <GameButton key={o.id} tone={paired.includes(o.id) ? "mint" : "neutral"} disabled={paired.includes(o.id)} onClick={() => pickRight(o)} className={cn("grid place-items-center p-2", bad === o.id && "opacity-40")} aria-label={`Word ${o.en}`}>
              <ArText className="text-3xl font-bold">{o.ar}</ArText>
            </GameButton>
          ))}
        </div>
      </div>
      {complete && <NextButton onClick={onNext} />}
    </div>
  );
}

function TraceEx({ ex, unit, onNext }: ExProps) {
  const { play } = useClip();
  const [points, setPoints] = useState<{ x: number; y: number }[][]>([]);
  const [length, setLength] = useState(0);
  const drawing = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const text = ex.item.ar;
  const needed = text.length > 1 ? 900 : 450;
  const complete = length >= needed;
  useEffect(() => { if (complete) play(audioOf(unit.id, ex.item.id)); }, [complete, ex, unit, play]);
  const at = (e: React.PointerEvent) => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 300, y: ((e.clientY - r.top) / r.height) * 240 };
  };
  return (
    <div className="flex flex-1 flex-col gap-5">
      <Prompt who={unit.guide} id="trace" cheer={complete} />
      <svg ref={svgRef} viewBox="0 0 300 240" className="w-full touch-none rounded-3xl bg-card shadow-md"
        onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); drawing.current = true; setPoints((p) => [...p, [at(e)]]); }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const pt = at(e);
          setPoints((p) => {
            const last = p[p.length - 1]!; const prev = last[last.length - 1]!;
            setLength((l) => l + Math.hypot(pt.x - prev.x, pt.y - prev.y));
            return [...p.slice(0, -1), [...last, pt]];
          });
        }}
        onPointerUp={() => { drawing.current = false; }} onPointerCancel={() => { drawing.current = false; }}>
        <text x="150" y="170" textAnchor="middle" direction="rtl" fontSize={text.length > 1 ? 120 : 190} className="font-arabic" fill={complete ? "color-mix(in oklab, var(--success) 35%, transparent)" : "var(--muted)"} stroke="var(--muted-foreground)" strokeWidth="2" strokeDasharray="6 6">{text}</text>
        {points.map((line, i) => <polyline key={i} points={line.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="var(--primary)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />)}
      </svg>
      <div className="h-3 overflow-hidden rounded-full bg-muted"><div className="h-full bg-success transition-[width]" style={{ width: `${Math.min(100, (length / needed) * 100)}%` }} /></div>
      {complete ? <NextButton onClick={onNext} /> : <GameButton tone="neutral" className="mt-auto" onClick={() => { setPoints([]); setLength(0); }} aria-label="Clear"><RotateCcw className="mx-auto h-6 w-6" /></GameButton>}
    </div>
  );
}

function FormsEx({ ex, unit, onNext, onMiss }: ExProps) {
  const { play } = useClip();
  const target = ex.item;
  const middle = ex.kind === "formsMiddle";
  const choices = useMemo(() => {
    if (middle) return shuffle(target.forms!.map((f, i) => ({ f, right: i === 2 })));
    const others = shuffle(unit.items.filter((i) => i.id !== target.id)).slice(0, 2).map((i) => ({ f: i.forms![1 + Math.floor(Math.random() * 3)]!, right: false }));
    return shuffle([{ f: target.forms![1 + Math.floor(Math.random() * 3)]!, right: true }, ...others]);
  }, [target, unit, middle]);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<string[]>([]);
  useEffect(() => { play(audioOf(unit.id, target.id)); }, [target, unit, play]);
  return (
    <div className="flex flex-1 flex-col gap-5">
      <Prompt who={unit.guide} id={middle ? "middle" : "find"} cheer={solved} />
      <div className="mx-auto grid h-36 w-full place-items-center rounded-3xl bg-card shadow-md" dir="rtl">
        {middle ? (
          <ArText className="text-7xl"><span className="text-muted-foreground">ـ</span><span className={cn("inline-block min-w-16 rounded-xl border-4 border-dashed px-1", solved ? "border-success text-success" : "border-border text-transparent")}>{target.forms![2]}</span><span className="text-muted-foreground">ـ</span></ArText>
        ) : <ArText className="text-8xl">{target.ar}</ArText>}
      </div>
      <div className={cn("mt-auto grid gap-3", middle ? "grid-cols-2" : "grid-cols-3")} dir="rtl">
        {choices.map((c) => (
          <GameButton key={c.f} tone={solved && c.right ? "mint" : "neutral"} className={cn("grid aspect-square place-items-center", wrong.includes(c.f) && "opacity-40", wrong.length > 0 && !solved && c.right && "ring-4 ring-success ring-offset-2 ring-offset-background")}
            onClick={() => { if (solved) return; if (c.right) { setSolved(true); play(audioOf(unit.id, target.id)); } else { setWrong((w) => addUnique(w, c.f)); onMiss(); } }} aria-label={c.right ? "letter form" : "other form"}>
            <ArText className="text-6xl">{c.f}</ArText>
          </GameButton>
        ))}
      </div>
      {solved && <NextButton onClick={onNext} />}
    </div>
  );
}

function OrderEx({ ex, unit, onNext, onMiss }: ExProps) {
  const { play } = useClip();
  const seq = useMemo(() => {
    const start = Math.min(unit.items.indexOf(ex.item), unit.items.length - 4);
    return unit.items.slice(Math.max(0, start), Math.max(0, start) + 4);
  }, [ex, unit]);
  const tiles = useMemo(() => shuffle(seq), [seq]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [hint, setHint] = useState(false);
  const complete = placed.length === seq.length;
  const tap = (o: CurriculumItem) => {
    if (placed.includes(o.id)) return;
    if (seq[placed.length]!.id === o.id) { setPlaced((p) => [...p, o.id]); setHint(false); play(audioOf(unit.id, o.id)); }
    else { setHint(true); onMiss(); }
  };
  return (
    <div className="flex flex-1 flex-col gap-5">
      <Prompt who={unit.guide} id="order" cheer={complete} />
      <div className="grid grid-cols-4 gap-2" dir="rtl">
        {seq.map((s, i) => (
          <div key={s.id} className={cn("grid min-h-20 place-items-center rounded-2xl border-4 border-dashed p-1 text-center", placed[i] ? "border-success bg-success/15" : "border-border", s.id === "fri" && placed[i] && "bg-primary/20")}>
            {placed[i] ? <ArText className="text-lg font-bold">{s.ar}</ArText> : <span className="text-xl font-black text-muted-foreground">{i + 1}</span>}
          </div>
        ))}
      </div>
      {complete ? <NextButton onClick={onNext} /> : (
        <div className="mt-auto grid grid-cols-2 gap-3" dir="rtl">
          {tiles.map((t) => (
            <GameButton key={t.id} tone={t.id === "fri" ? "sun" : "neutral"} className={cn("min-h-20", placed.includes(t.id) && "invisible", hint && seq[placed.length]?.id === t.id && "ring-4 ring-success ring-offset-2 ring-offset-background")} onClick={() => tap(t)} aria-label={t.en}>
              <ArText className="text-2xl font-bold">{t.ar}</ArText>
            </GameButton>
          ))}
        </div>
      )}
    </div>
  );
}

function NeighborEx({ ex, unit, onNext, onMiss }: ExProps) {
  const { play } = useClip();
  const list = unit.items;
  const idx = Math.min(Math.max(list.indexOf(ex.item), 1), list.length - 2);
  const base = list[idx]!;
  const after = !!ex.flag;
  const answer = list[after ? idx + 1 : idx - 1]!;
  const options = useMemo(() => shuffle([answer, ...shuffle(list.filter((l) => l.id !== answer.id && l.id !== base.id)).slice(0, 2)]), [answer, base, list]);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<string[]>([]);
  const ask = () => play(promptAudio(after ? "after" : "before"), { onEnd: () => play(audioOf(unit.id, base.id)) });
  useEffect(() => { ask(); }, [base.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="flex flex-1 flex-col gap-5">
      <Prompt who={unit.guide} id={after ? "after" : "before"} extra={`${base.ar}؟`} cheer={solved} />
      <div className="flex items-center justify-center gap-3" dir="rtl">
        {list.map((l) => (
          <div key={l.id} className={cn("h-4 w-4 rounded-full", l.id === base.id ? "h-6 w-6 bg-primary" : solved && l.id === answer.id ? "h-6 w-6 bg-success" : l.id === "fri" ? "bg-primary/40" : "bg-muted")} />
        ))}
      </div>
      <SpeakButton onClick={ask} className="mx-auto" />
      <div className="mt-auto grid gap-3" dir="rtl">
        {options.map((o) => (
          <GameButton key={o.id} tone={solved && o.id === answer.id ? "mint" : "neutral"} className={cn("min-h-20", wrong.includes(o.id) && "opacity-40", wrong.length > 0 && !solved && o.id === answer.id && "ring-4 ring-success ring-offset-2 ring-offset-background")}
            onClick={() => { if (solved) return; play(audioOf(unit.id, o.id)); if (o.id === answer.id) setSolved(true); else { setWrong((w) => addUnique(w, o.id)); onMiss(); } }} aria-label={o.en}>
            <ArText className="text-3xl font-bold">{o.ar}</ArText>
          </GameButton>
        ))}
      </div>
      {solved && <NextButton onClick={onNext} />}
    </div>
  );
}

function BuildEx({ ex, unit, onNext, onMiss }: ExProps) {
  const { play } = useClip();
  const word = ex.item;
  const letters = word.letters ?? [];
  const listen = ex.kind === "listenBuild";
  const tiles = useMemo(() => {
    const extra = shuffle(unitById("letters").items.map((l) => l.ar).filter((c) => !letters.includes(c))).slice(0, listen ? 2 : 1);
    return shuffle([...letters, ...extra].map((char, i) => ({ id: i, char })));
  }, [word]); // eslint-disable-line react-hooks/exhaustive-deps
  const [used, setUsed] = useState<number[]>([]);
  const [hint, setHint] = useState(false);
  const built = used.length;
  const complete = built === letters.length;
  useEffect(() => { if (listen) play(audioOf(unit.id, word.id)); }, [word, listen, unit, play]);
  const tap = (tile: { id: number; char: string }) => {
    if (complete || used.includes(tile.id)) return;
    if (tile.char !== letters[built]) { setHint(true); onMiss(); play(letterAudio(letters[built]!)); return; }
    setHint(false);
    const nextUsed = [...used, tile.id];
    setUsed(nextUsed);
    if (nextUsed.length === letters.length) play(audioOf(unit.id, word.id)); else play(letterAudio(tile.char));
  };
  return (
    <div className="flex flex-1 flex-col gap-5">
      <Prompt who={unit.guide} id="build" cheer={complete} />
      <div className="flex items-center justify-center gap-4">
        {(!listen || complete) && <VisualView item={word} className="animate-pop-in" />}
        {listen && <SpeakButton onClick={() => play(audioOf(unit.id, word.id))} />}
      </div>
      <div className="min-h-32 rounded-3xl bg-card p-4 shadow-md">
        {complete ? <p className="text-center"><ArText className="text-7xl animate-pop-in">{word.say}</ArText></p> : (
          <div dir="rtl" className="flex justify-center gap-3">
            {letters.map((char, i) => <span key={i} lang="ar" className={cn("grid h-24 w-20 place-items-center rounded-2xl border-4 border-dashed font-arabic text-6xl", i < built ? "border-success bg-success/20" : "border-border")}>{i < built ? char : ""}</span>)}
          </div>
        )}
      </div>
      {complete ? <NextButton onClick={onNext} /> : (
        <div dir="rtl" className="mt-auto grid grid-cols-3 gap-3">
          {tiles.map((tile) => (
            <GameButton key={tile.id} tone="sun" aria-label={`Letter ${tile.char}`} className={cn("grid aspect-square place-items-center", used.includes(tile.id) && "invisible", hint && tile.char === letters[built] && "ring-4 ring-success ring-offset-2 ring-offset-background")} onClick={() => tap(tile)}>
              <ArText className="text-6xl leading-none">{tile.char}</ArText>
            </GameButton>
          ))}
        </div>
      )}
    </div>
  );
}

function ReadEx({ ex, unit, onNext }: ExProps) {
  const { play } = useClip();
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="flex flex-1 flex-col gap-5">
      <Prompt who={unit.guide} id="read" cheer={revealed} />
      <div className="rounded-3xl bg-card p-6 text-center shadow-md"><ArText className="text-8xl">{ex.item.say}</ArText></div>
      {revealed && <VisualView item={ex.item} className="mx-auto animate-pop-in" />}
      {!revealed ? (
        <GameButton tone="sky" className="mt-auto min-h-20" onClick={() => { setRevealed(true); play(audioOf(unit.id, ex.item.id)); }} aria-label="Check">
          <span className="inline-flex items-center gap-2"><Eye className="h-7 w-7" /><Volume2 className="h-7 w-7" /></span>
        </GameButton>
      ) : (
        <div className="mt-auto grid grid-cols-2 gap-3">
          <GameButton tone="neutral" className="min-h-20" onClick={() => play(audioOf(unit.id, ex.item.id))} aria-label="Hear again"><RotateCcw className="mx-auto h-7 w-7" /></GameButton>
          <GameButton tone="mint" className="min-h-20" onClick={onNext} aria-label="Next"><Check className="mx-auto h-8 w-8" /></GameButton>
        </div>
      )}
    </div>
  );
}

const comboColors = { red: "#e0433a", blue: "#2f6fd6", yellow: "#f5c72e", green: "#3aa655" } as const;
function ComboEx({ unit, onNext, onMiss }: ExProps) {
  const { play } = useClip();
  const q = useMemo(() => shuffle(combos)[0]!, []);
  const options = useMemo(() => shuffle([q, ...shuffle(combos.filter((c) => c.id !== q.id && (c.shape === q.shape || c.color === q.color))).slice(0, 3)]), [q]);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<string[]>([]);
  const ask = () => play(curriculumAudio[`combo-${q.id}`] ?? "");
  useEffect(() => { ask(); }, [q]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="mt-4 flex items-center gap-3" dir="rtl">
        <GuideAvatar who={unit.guide} className={solved ? "animate-hamad-cheer" : "animate-hamad-float"} />
        <div className="rounded-2xl bg-card px-4 py-2 shadow-sm"><ArText className="text-2xl font-bold">{solved ? prompts.great.ar : q.ar}</ArText></div>
      </div>
      <SpeakButton onClick={ask} className="mx-auto" />
      <div className="mt-auto grid grid-cols-2 gap-3">
        {options.map((o) => (
          <GameButton key={o.id} tone={solved && o.id === q.id ? "mint" : "neutral"} className={cn("grid aspect-square place-items-center p-4", wrong.includes(o.id) && "opacity-40", wrong.length > 0 && !solved && o.id === q.id && "ring-4 ring-success ring-offset-2 ring-offset-background")}
            onClick={() => { if (solved) return; if (o.id === q.id) setSolved(true); else { setWrong((w) => addUnique(w, o.id)); onMiss(); } }} aria-label={o.id}>
            <ShapeSvg shape={o.shape} color={comboColors[o.color]} className="h-full w-full" />
          </GameButton>
        ))}
      </div>
      {solved && <NextButton onClick={onNext} />}
    </div>
  );
}
