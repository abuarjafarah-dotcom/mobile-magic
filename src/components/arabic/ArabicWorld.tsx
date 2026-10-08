// Arabic ++ — an open, play-first Arabic world. Nothing is locked; progress is informational only.
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, Play, RotateCcw, Shuffle, Volume2 } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { FamilyCharacter, GameShell, shuffle } from "@/components/learn/shared";
import { GuideAvatar, ShapeSvg } from "@/components/arabic/ArabicPath";
import { allLessons, unitById, type Lesson } from "@/data/arabicCurriculum";
import { curriculumAudio } from "@/data/arabicCurriculumAudio";
import { animalImages } from "@/data/animalImages";
import { allWords, categories, dialogues, paintColors, paintTasks, questions, scenes, sentences, sentenceText, ui, verbs, yesNoText, type Pic, type Sentence, type VerbAnim, type Who } from "@/data/arabicWorld";
import { addUnique, type LearningProgress } from "@/lib/learningProgress";
import { speakArabic, stopArabicVoice } from "@/lib/arabicVoice";
import { cn } from "@/lib/utils";

type Update = (change: (p: LearningProgress) => LearningProgress) => void;
export type WorldView = string;

/* ---------------- Audio ---------------- */
const strip = (t: string) => t.replace(/[\u064B-\u0652\u0670.،؟!]/g, "").trim();
function sayOne(text: string, src?: string): Promise<void> {
  return speakArabic(text, src);
}
let token = 0;
async function say(...texts: string[]) {
  const mine = ++token;
  for (const t of texts) { if (mine !== token) return; await sayOne(t); }
}
const sayUrl = (url: string) => { token++; void sayOne("", url); };

function useSpeaking() {
  const [on, setOn] = useState<string | null>(null);
  const run = async (id: string, ...texts: string[]) => { setOn(id); await say(...texts); setOn((x) => (x === id ? null : x)); };
  useEffect(() => () => { token++; stopArabicVoice(); }, []);
  return { on, run };
}

/* ---------------- Visual building blocks ---------------- */
const animClass: Record<VerbAnim, string> = { jump: "animate-verb-jump", run: "animate-verb-run", sleep: "animate-verb-sleep", bob: "animate-verb-bob", sway: "animate-verb-sway", shake: "animate-verb-shake" };

export function Person({ who, size = "large", anim, speaking, className }: { who: Who | "family"; size?: "small" | "large"; anim?: VerbAnim | undefined; speaking?: boolean; className?: string }) {
  const inner = who === "family" ? (
    <div className="grid grid-cols-2 gap-1"><FamilyCharacter name="hamad" size="small" className="h-12 w-12" /><FamilyCharacter name="talal" size="small" className="h-12 w-12" /><FamilyCharacter name="yousef" size="small" className="h-12 w-12" /><GuideAvatar who="mama" className="h-12 w-12" /></div>
  ) : who === "mama" || who === "baba" ? <GuideAvatar who={who} size={size} className={cn(size === "large" && "h-28 w-28", className)} />
    : <FamilyCharacter name={who} size={size} speaking={speaking ?? false} className={className ?? ""} />;
  return <span className={cn("inline-block", anim && animClass[anim])}>{inner}</span>;
}

export function PicView({ pic, big, className }: { pic: Pic; big?: boolean; className?: string }) {
  const box = cn("grid place-items-center overflow-hidden rounded-3xl bg-card shadow-md", big ? "h-36 w-36" : "h-20 w-20", className);
  if (pic.who) return <div className={cn(box, "bg-transparent shadow-none")}><Person who={pic.who} size={big ? "large" : "small"} /></div>;
  if (pic.color) return <div className={box}><div className="h-3/4 w-3/4 rounded-full border-4 border-border shadow-inner" style={{ backgroundColor: pic.color }} /></div>;
  if (pic.shape) return <div className={box}><ShapeSvg shape={pic.shape} color="var(--primary)" className="h-3/4 w-3/4" /></div>;
  if (pic.animal && animalImages[pic.animal]) return <div className={box}><img src={animalImages[pic.animal]} alt="" loading="lazy" draggable={false} className="h-full w-full object-cover" /></div>;
  return <div className={cn(box, "bg-gradient-to-b from-secondary/60 to-card")}><span className={cn("drop-shadow-md", big ? "text-7xl" : "text-5xl")}>{pic.emoji}</span></div>;
}

const Ar = ({ children, className }: { children: ReactNode; className?: string }) => <span dir="rtl" lang="ar" className={cn("font-arabic", className)}>{children}</span>;

function SpeakButton({ text, url, label = "Listen", className }: { text?: string; url?: string | undefined; label?: string; className?: string }) {
  return (
    <GameButton tone="sky" aria-label={label} className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-full p-0", className)} onClick={() => (url ? sayUrl(url) : text && void say(text))}>
      <Volume2 className="h-6 w-6" />
    </GameButton>
  );
}

function Bloom({ burst }: { burst: number }) {
  if (!burst) return null;
  const items = ["🌸", "⭐", "🌼", "✨", "🐦", "🌙"];
  return (
    <div key={burst} aria-hidden className="pointer-events-none fixed inset-x-0 top-1/3 z-50 flex justify-center gap-4">
      {items.map((x, i) => <span key={i} className="animate-bloom text-4xl" style={{ animationDelay: `${i * 70}ms` }}>{x}</span>)}
    </div>
  );
}

function Stage({ who, props, anim, speaking, className }: { who?: Who | undefined; props: string[]; anim?: VerbAnim | undefined; speaking?: boolean; className?: string }) {
  return (
    <div className={cn("relative flex min-h-48 items-end justify-center gap-3 overflow-hidden rounded-[2rem] bg-gradient-to-b from-secondary/70 via-card to-success/20 p-5 shadow-inner", className)}>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-10 bg-success/25" />
      {who ? <Person who={who} anim={anim} speaking={speaking ?? false} /> : null}
      <div className="relative flex gap-2">{props.map((x, i) => <span key={i} className={cn("text-6xl drop-shadow-lg", !who && i === 0 && anim && animClass[anim])}>{x}</span>)}</div>
    </div>
  );
}

/* ---------------- Progress helpers ---------------- */
const today = () => new Date().toISOString().slice(0, 10);
function useMark(onProgress: Update) {
  return (key: string) => onProgress((p) => ({ ...p, arabic: { ...p.arabic, learned: addUnique(p.arabic.learned, `aw:${key}`), days: addUnique(p.arabic.days, today()) } }));
}
const count = (p: LearningProgress, prefix: string) => p.arabic.learned.filter((k) => k.startsWith(`aw:${prefix}`)).length;

/* ---------------- Hub ---------------- */
type Card = { view: string; ar: string; en: string; icon: ReactNode; tone: "sun" | "sky" | "mint" | "berry" };
const face = (who: Who) => <Person who={who} size="small" />;
const hubCards: Card[] = [
  { view: "seek", ar: "أَدُوِّر وَأَلَاقِي", en: "Seek & find", icon: <span className="text-4xl">🔎</span>, tone: "sun" },
  { view: "letters", ar: "الْحُرُوف", en: "Letters", icon: <Ar className="text-4xl font-black">أ ب</Ar>, tone: "sun" },
  { view: "harakat", ar: "الْأَصْوَات وَالْحَرَكَات", en: "Sounds & harakat", icon: <Ar className="text-4xl font-black">بَ بِ بُ</Ar>, tone: "sky" },
  { view: "reading", ar: "الْقِرَاءَة", en: "Reading", icon: <span className="text-4xl">📖</span>, tone: "mint" },
  { view: "words", ar: "الْكَلِمَات", en: "Words", icon: <span className="text-4xl">🔤</span>, tone: "berry" },
  { view: "verbs", ar: "الْأَفْعَال", en: "Verbs", icon: face("talal"), tone: "sun" },
  { view: "sentences", ar: "الْجُمَل", en: "Sentences", icon: face("hamad"), tone: "sky" },
  { view: "qa", ar: "اسْأَلْ وَأَجِبْ", en: "Ask & answer", icon: <span className="text-4xl">❓</span>, tone: "mint" },
  { view: "yesno", ar: "نَعَمْ أَمْ لَا؟", en: "Yes or no", icon: <span className="text-4xl">👍</span>, tone: "berry" },
  { view: "talk", ar: "مُحَادَثَات", en: "Conversations", icon: face("yousef"), tone: "sun" },
  ...scenes.map((s): Card => ({ view: `scene:${s.id}`, ar: s.ar, en: s.en, icon: <span className="text-4xl">{s.things[0]!.emoji}</span>, tone: "sky" })),
  ...categories.map((c): Card => ({ view: `cat:${c.id}`, ar: c.ar, en: c.en, icon: <span className="text-4xl">{c.icon}</span>, tone: c.tone })),
  { view: "sort", ar: "صَنِّفْ", en: "Sort fruit & veg", icon: <span className="text-4xl">🧺</span>, tone: "mint" },
  { view: "paint", ar: "لَوِّنْ", en: "Colour by instruction", icon: <span className="text-4xl">🖍️</span>, tone: "berry" },
];

export function ArabicWorldHub({ progress, onOpen, path }: { progress: LearningProgress; onOpen: (v: WorldView) => void; path: ReactNode }) {
  const [showPath, setShowPath] = useState(false);
  const letters = new Set([...progress.arabic.learned.filter((k) => k.startsWith("letters:")).map((k) => k.slice(8)), ...progress.arabic.learned.filter((k) => k.startsWith("aw:l:")).map((k) => k.slice(5))]).size;
  const stats = [["الْحُرُوف", `${letters} / 28`], ["الْكَلِمَات", count(progress, "w:")], ["الْأَفْعَال", count(progress, "v:")], ["الْجُمَل", count(progress, "s:")], ["⭐", count(progress, "star")]] as const;
  return (
    <div>
      <div className="mb-4 text-center">
        <Ar className="block text-4xl font-black">{ui.title}</Ar>
        <Ar className="block text-lg font-bold text-muted-foreground">{ui.subtitle}</Ar>
      </div>
      <GameButton tone="berry" className="mb-4 flex min-h-24 w-full items-center justify-center gap-3 rounded-3xl text-xl" onClick={() => onOpen("free")}>
        <span className="text-4xl">🎮</span><span><Ar className="block text-2xl font-black">{ui.free}</Ar><span className="block text-sm font-bold opacity-80">Free play</span></span>
      </GameButton>
      <div dir="rtl" className="mb-4 flex flex-wrap justify-center gap-2" aria-label="Progress">
        {stats.map(([k, v]) => <span key={k} className="rounded-full bg-card px-3 py-1 text-sm font-black shadow-sm"><Ar>{k}</Ar> {v}</span>)}
      </div>
      <div dir="rtl" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {hubCards.map((c) => {
          const explored = progress.arabic.learned.includes(`aw:open:${c.view}`);
          return (
            <GameButton key={c.view} tone={c.tone} className="relative flex min-h-32 flex-col items-center justify-center gap-2 rounded-3xl p-3" onClick={() => onOpen(c.view)} aria-label={c.en}>
              {explored && <span className="absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-card text-success shadow"><Check className="h-4 w-4" /></span>}
              {c.icon}
              <Ar className="text-xl font-black leading-tight">{c.ar}</Ar>
              <span className="text-xs font-bold opacity-75">{c.en}</span>
            </GameButton>
          );
        })}
      </div>
      <GameButton tone="neutral" className="mt-6 w-full rounded-3xl" onClick={() => setShowPath((x) => !x)}>
        <Ar className="text-xl font-black">مَسَارُ الدُّرُوس</Ar> · Lesson path {showPath ? "▲" : "▼"}
      </GameButton>
      {showPath && <div className="mt-4">{path}</div>}
    </div>
  );
}

/* ---------------- Quiz runner (shared by most games) ---------------- */
type Option = { id: string; node: ReactNode; label: string; correct: boolean };
type Round = { say: string[]; top: ReactNode; options: Option[]; cols?: 2 | 3; after?: string[]; reveal?: ReactNode; key?: string };

function QuizRunner({ make, total = 6, onMark, onDone }: { make: (i: number) => Round; total?: number; onMark: (key: string) => void; onDone: () => void }) {
  const [i, setI] = useState(0);
  const [seed, setSeed] = useState(0);
  const round = useMemo(() => make(i), [i, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const [wrong, setWrong] = useState<string[]>([]);
  const [right, setRight] = useState(false);
  const [burst, setBurst] = useState(0);
  const finished = i >= total;
  useEffect(() => { setWrong([]); setRight(false); if (!finished) void say(...round.say); }, [round, finished]);
  const pick = (o: Option) => {
    if (right) return;
    if (!o.correct) { setWrong((w) => [...w, o.id]); void say(ui.again); return; }
    setRight(true); setBurst((b) => b + 1);
    if (round.key) onMark(round.key);
    onMark(`star:${Date.now()}`);
    void say(...(round.after ?? [ui.great])).then(() => window.setTimeout(() => setI((x) => x + 1), 500));
  };
  if (finished) return (
    <div className="mt-8 grid justify-items-center gap-4 text-center">
      <div className="text-7xl">🌸🌼🌸</div>
      <Ar className="text-4xl font-black">{ui.great}</Ar>
      <div className="flex gap-3">
        <GameButton tone="mint" onClick={() => { setI(0); setSeed((s) => s + 1); }}><RotateCcw className="me-2 inline h-5 w-5" />Again</GameButton>
        <GameButton tone="neutral" onClick={onDone}>Back</GameButton>
      </div>
    </div>
  );
  return (
    <div className="mt-4 grid gap-4">
      <Bloom burst={burst} />
      <div className="flex items-center justify-between text-sm font-black text-muted-foreground"><span>{i + 1} / {total}</span>
        <GameButton tone="sky" className="grid h-12 w-12 place-items-center rounded-full p-0" aria-label="Hear again" onClick={() => void say(...round.say)}><Volume2 className="h-5 w-5" /></GameButton>
      </div>
      <div className="grid justify-items-center gap-3">{right && round.reveal ? round.reveal : round.top}</div>
      <div dir="rtl" className={cn("grid gap-3", round.cols === 2 ? "grid-cols-2" : "grid-cols-3")}>
        {round.options.map((o) => (
          <GameButton key={o.id} aria-label={o.label} tone={right && o.correct ? "mint" : "neutral"} onClick={() => pick(o)}
            className={cn("grid min-h-28 place-items-center gap-1 rounded-3xl p-2", wrong.includes(o.id) && "opacity-40", right && !o.correct && "opacity-40")}>
            {o.node}
          </GameButton>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Round generators ---------------- */
const pickN = <T,>(list: readonly T[], n: number, not?: (x: T) => boolean) => shuffle(list.filter((x) => !not?.(x))).slice(0, n);
const wordNode = (ar: string) => <Ar className="text-3xl font-black leading-tight">{ar}</Ar>;

function vocabRound(catId: string | null, mode: "listen" | "picword" | "wordpic"): Round {
  const pool = catId ? categories.find((c) => c.id === catId)!.words : allWords;
  const [target, ...rest] = pickN(pool, 3);
  const opts = shuffle([target!, ...rest]);
  const base = { key: `w:${target!.id}`, cols: 3 as const };
  if (mode === "picword") return { ...base, say: [ui.what], top: <PicView pic={target!.pic} big />, options: opts.map((o) => ({ id: o.id, label: o.en, correct: o === target, node: wordNode(o.ar) })), after: [target!.ar] };
  if (mode === "wordpic") return { ...base, say: [target!.ar], top: <div className="rounded-3xl bg-card px-8 py-4 shadow">{wordNode(target!.ar)}</div>, options: opts.map((o) => ({ id: o.id, label: o.en, correct: o === target, node: <PicView pic={o.pic} /> })), after: [target!.ar] };
  return { ...base, say: [ui.listen, target!.ar], top: <div className="text-6xl">👂</div>, options: opts.map((o) => ({ id: o.id, label: o.en, correct: o === target, node: <PicView pic={o.pic} /> })), after: [target!.ar] };
}

function questionRound(): Round {
  const q = shuffle(questions)[0]!;
  return {
    key: `q:${q.id}`, say: [q.q], cols: 3, after: [q.answer],
    top: <><Stage who={q.scene.who} props={q.scene.props} anim={q.scene.anim} className="w-full" />{q.scene.props.length || q.scene.who ? null : null}<Ar className="text-3xl font-black">{q.q}</Ar></>,
    reveal: <><Stage who={q.scene.who ?? q.choices[0]!.pic.who as Who | undefined} props={q.scene.props.length ? q.scene.props : [q.choices[0]!.pic.emoji ?? ""]} anim={q.scene.anim ?? "jump"} className="w-full" /><Ar className="text-3xl font-black text-success">{q.answer}</Ar></>,
    options: shuffle(q.choices.map((c, i) => ({ id: c.ar, label: c.ar, correct: i === 0, node: <>{c.pic.who ? <Person who={c.pic.who} size="small" /> : <PicView pic={c.pic} className="h-14 w-14 shadow-none" />}<Ar className="text-lg font-black leading-tight">{c.ar}</Ar></> }))),
  };
}

function yesNoRound(): Round {
  const shown = shuffle(sentences)[0]!;
  const truth = Math.random() < 0.5;
  const asked = truth ? shown : shuffle(sentences.filter((x) => x.who !== shown.who || x.props[0] !== shown.props[0]))[0]!;
  const text = yesNoText(asked);
  return {
    key: `s:${shown.id}`, say: [text], cols: 2, after: [truth ? ui.yes : ui.no, sentenceText(shown)],
    top: <><Stage who={shown.who} props={shown.props} anim={shown.anim} className="w-full" /><Ar className="text-3xl font-black">{text}</Ar></>,
    options: [
      { id: "yes", label: "Yes", correct: truth, node: <><span className="text-5xl">👍</span><Ar className="text-2xl font-black">{ui.yes}</Ar></> },
      { id: "no", label: "No", correct: !truth, node: <><span className="text-5xl">👎</span><Ar className="text-2xl font-black">{ui.no}</Ar></> },
    ],
  };
}

function sentencePicRound(flip: boolean): Round {
  const [t, ...rest] = pickN(sentences, 3);
  const opts = shuffle([t!, ...rest]);
  if (flip) return { key: `s:${t!.id}`, say: [ui.what], cols: 2, top: <Stage who={t!.who} props={t!.props} anim={t!.anim} className="w-full" />, after: [sentenceText(t!)],
    options: opts.slice(0, 2).includes(t!) ? opts.slice(0, 2).map((o) => ({ id: o.id, label: o.en, correct: o === t, node: <Ar className="text-xl font-black leading-snug">{sentenceText(o)}</Ar> })) : [t!, opts.find((o) => o !== t)!].map((o) => ({ id: o.id, label: o.en, correct: o === t, node: <Ar className="text-xl font-black leading-snug">{sentenceText(o)}</Ar> })) };
  return { key: `s:${t!.id}`, say: [sentenceText(t!)], cols: 3, top: <Ar className="rounded-3xl bg-card px-5 py-4 text-3xl font-black shadow">{sentenceText(t!)}</Ar>, after: [sentenceText(t!)],
    options: opts.map((o) => ({ id: o.id, label: o.en, correct: o === t, node: <div className="flex items-center gap-1">{o.who ? <Person who={o.who} size="small" /> : null}<span className="text-3xl">{o.props[0]}</span></div> })) };
}

function sortRound(): Round {
  const fruit = Math.random() < 0.5;
  const item = shuffle(categories.find((c) => c.id === (fruit ? "fruits" : "vegetables"))!.words)[0]!;
  return { key: `w:${item.id}`, say: [item.ar], cols: 2, after: [fruit ? ui.fruit : ui.veg], top: <PicView pic={item.pic} big />,
    options: [
      { id: "f", label: "Fruit", correct: fruit, node: <><span className="text-5xl">🧺🍎</span><Ar className="text-2xl font-black">{ui.fruit}</Ar></> },
      { id: "v", label: "Vegetable", correct: !fruit, node: <><span className="text-5xl">🧺🥕</span><Ar className="text-2xl font-black">{ui.veg}</Ar></> },
    ] };
}

function paintRound(): Round {
  const t = shuffle(paintTasks)[0]!;
  return { key: `paint:${t.id}`, say: [t.text], cols: 2, top: <><ShapeSvg shape={t.shape} color="var(--muted)" className="h-40 w-40" /><Ar className="text-2xl font-black">{t.text}</Ar></>,
    reveal: <><ShapeSvg shape={t.shape} color={paintColors[t.color]} className="h-40 w-40 animate-pop-in" /><Ar className="text-2xl font-black">{t.text}</Ar></>,
    options: (Object.keys(paintColors) as (keyof typeof paintColors)[]).map((c) => ({ id: c, label: c, correct: c === t.color, node: <div className="h-16 w-16 rounded-full border-4 border-card shadow" style={{ backgroundColor: paintColors[c] }} /> })) };
}

function missingRound(catId: string | null): Round {
  const pool = catId ? categories.find((c) => c.id === catId)!.words : allWords.filter((x) => x.pic.emoji);
  const shown = pickN(pool, 4);
  const gone = shown[Math.floor(Math.random() * shown.length)]!;
  const extras = pickN(pool, 2, (x) => shown.includes(x));
  return { key: `w:${gone.id}`, say: [ui.missing], cols: 3, after: [gone.ar],
    top: <div className="flex gap-2">{shown.map((x) => x === gone ? <div key={x.id} className="grid h-20 w-20 place-items-center rounded-3xl border-4 border-dashed border-border text-4xl font-black text-muted-foreground">؟</div> : <PicView key={x.id} pic={x.pic} />)}</div>,
    reveal: <div className="flex gap-2">{shown.map((x) => <PicView key={x.id} pic={x.pic} className={x === gone ? "ring-4 ring-success" : ""} />)}</div>,
    options: shuffle([gone, ...extras]).map((o) => ({ id: o.id, label: o.en, correct: o === gone, node: <><PicView pic={o.pic} className="h-14 w-14 shadow-none" /><Ar className="text-lg font-black">{o.ar}</Ar></> })) };
}

const lettersUnit = unitById("letters");
function letterFindRound(char?: string): Round {
  const target = char ? lettersUnit.items.find((l) => l.ar === char)! : shuffle(lettersUnit.items)[0]!;
  const opts = shuffle([target, ...pickN(lettersUnit.items, 2, (x) => x === target)]);
  return { key: `l:${target.id}`, say: [], cols: 3, top: <SpeakButton url={curriculumAudio[`letters-${target.id}`]} className="h-20 w-20" />,
    options: opts.map((o) => ({ id: o.id, label: o.en, correct: o === target, node: <Ar className="text-6xl font-black">{o.ar}</Ar> })) };
}

function freeRound(): Round {
  const gens = [questionRound, yesNoRound, () => vocabRound(null, "listen"), () => vocabRound(null, "picword"), () => sentencePicRound(false), () => sentencePicRound(true), sortRound, paintRound, () => missingRound(null), () => letterFindRound()];
  return shuffle(gens)[0]!();
}

/* ---------------- Views ---------------- */
function WordsGrid({ catId, mark }: { catId: string; mark: (k: string) => void }) {
  const cat = categories.find((c) => c.id === catId)!;
  const [on, setOn] = useState<string | null>(null);
  return (
    <div dir="rtl" className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {cat.words.map((x) => (
        <button key={x.id} type="button" aria-label={x.en} onClick={() => { setOn(x.id); mark(`w:${x.id}`); void say(x.ar); }}
          className={cn("grid justify-items-center gap-1 rounded-3xl bg-card/80 p-2 shadow-sm transition active:scale-95", on === x.id && "ring-4 ring-primary")}>
          <PicView pic={x.pic} className={on === x.id ? "animate-hamad-cheer" : ""} />
          <Ar className="text-xl font-black leading-tight">{x.ar}</Ar>
        </button>
      ))}
    </div>
  );
}

function MemoryGame({ catId, mark, onDone }: { catId: string; mark: (k: string) => void; onDone: () => void }) {
  const cat = categories.find((c) => c.id === catId)!;
  const [seed, setSeed] = useState(0);
  const cards = useMemo(() => shuffle(pickN(cat.words, 4).flatMap((x) => [{ k: `${x.id}-p`, id: x.id, pic: true, x }, { k: `${x.id}-w`, id: x.id, pic: false, x }])), [cat, seed]);
  const [open, setOpen] = useState<string[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [burst, setBurst] = useState(0);
  const flip = (c: (typeof cards)[number]) => {
    if (open.length === 2 || open.includes(c.k) || found.includes(c.id)) return;
    void say(c.x.ar);
    const next = [...open, c.k];
    setOpen(next);
    if (next.length === 2) {
      const [a, b] = next.map((k) => cards.find((y) => y.k === k)!);
      window.setTimeout(() => {
        if (a!.id === b!.id) { setFound((f) => [...f, a!.id]); mark(`w:${a!.id}`); mark(`star:${Date.now()}`); setBurst((x) => x + 1); }
        setOpen([]);
      }, 900);
    }
  };
  const done = found.length === 4;
  return (
    <div className="mt-4">
      <Bloom burst={burst} />
      <Ar className="mb-3 block text-center text-2xl font-black">{ui.memory}</Ar>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((c) => {
          const show = open.includes(c.k) || found.includes(c.id);
          return (
            <button key={c.k} type="button" onClick={() => flip(c)} aria-label="card" className={cn("grid aspect-square place-items-center rounded-2xl shadow-md transition", show ? "bg-card" : "bg-primary", found.includes(c.id) && "ring-4 ring-success")}>
              {show ? (c.pic ? <PicView pic={c.x.pic} className="h-16 w-16 shadow-none" /> : <Ar className="text-lg font-black leading-tight">{c.x.ar}</Ar>) : <span className="text-3xl">🌙</span>}
            </button>
          );
        })}
      </div>
      {done && <div className="mt-4 flex justify-center gap-3"><GameButton tone="mint" onClick={() => { setFound([]); setSeed((s) => s + 1); }}>Again</GameButton><GameButton tone="neutral" onClick={onDone}>Back</GameButton></div>}
    </div>
  );
}

function CategoryView({ catId, mark }: { catId: string; mark: (k: string) => void }) {
  const [game, setGame] = useState<string | null>(null);
  const games = [["listen", "👂", "اسْمَعْ وَاخْتَرْ"], ["picword", "🖼️", "صُورَة ← كَلِمَة"], ["wordpic", "🔤", "كَلِمَة ← صُورَة"], ["memory", "🃏", "ذَاكِرَة"], ["missing", "🔍", "مَاذَا نَقَصَ؟"]] as const;
  if (game === "memory") return <MemoryGame catId={catId} mark={mark} onDone={() => setGame(null)} />;
  if (game) return <QuizRunner key={game} make={() => game === "missing" ? missingRound(catId) : vocabRound(catId, game as "listen" | "picword" | "wordpic")} onMark={mark} onDone={() => setGame(null)} />;
  return (
    <div className="mt-4 grid gap-4">
      <div dir="rtl" className="flex gap-2 overflow-x-auto pb-1">
        {games.map(([id, icon, ar]) => <GameButton key={id} tone="sun" className="flex min-h-14 shrink-0 items-center gap-2 rounded-full px-4" onClick={() => setGame(id)}><span className="text-2xl">{icon}</span><Ar className="text-base font-black">{ar}</Ar></GameButton>)}
      </div>
      <WordsGrid catId={catId} mark={mark} />
    </div>
  );
}

function WordsView({ onOpen }: { onOpen: (v: string) => void }) {
  return (
    <div dir="rtl" className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {categories.map((c) => (
        <GameButton key={c.id} tone={c.tone} className="flex min-h-28 flex-col items-center justify-center gap-1 rounded-3xl" onClick={() => onOpen(`cat:${c.id}`)}>
          <span className="text-4xl">{c.icon}</span><Ar className="text-xl font-black">{c.ar}</Ar><span className="text-xs font-bold opacity-75">{c.words.length} words</span>
        </GameButton>
      ))}
    </div>
  );
}

function VerbsView({ mark }: { mark: (k: string) => void }) {
  const [sel, setSel] = useState(verbs[0]!);
  const [playing, setPlaying] = useState(false);
  const play = async (vb: typeof sel) => { setSel(vb); setPlaying(true); mark(`v:${vb.id}`); await say(vb.ar, vb.sentence); setPlaying(false); };
  return (
    <div className="mt-4 grid gap-4">
      <button type="button" onClick={() => void play(sel)} aria-label="Play verb" className="text-start">
        <Stage who={sel.who} props={[sel.prop]} anim={playing ? sel.anim : undefined} speaking={playing} />
      </button>
      <div className="grid justify-items-center gap-1 text-center">
        <Ar className="text-5xl font-black">{sel.ar}</Ar>
        <Ar className="text-2xl font-bold text-muted-foreground">{sel.sentence}</Ar>
      </div>
      <div dir="rtl" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {verbs.map((vb) => (
          <GameButton key={vb.id} tone={vb === sel ? "sun" : "neutral"} aria-label={vb.en} className="flex min-h-24 flex-col items-center justify-center gap-1 rounded-3xl p-2" onClick={() => void play(vb)}>
            <span className="text-3xl">{vb.prop}</span><Ar className="text-xl font-black">{vb.ar}</Ar>
          </GameButton>
        ))}
      </div>
    </div>
  );
}

function SentenceBuilder({ s, onBuilt }: { s: Sentence; onBuilt: () => void }) {
  const [placed, setPlaced] = useState<number[]>([]);
  const [shake, setShake] = useState<number | null>(null);
  const order = useMemo(() => shuffle(s.words.map((_, i) => i)), [s]);
  useEffect(() => setPlaced([]), [s]);
  const tap = (i: number) => {
    if (s.words[i] === s.words[placed.length]) {
      const next = [...placed, placed.length];
      setPlaced(next); void say(s.words[i]!.replace(/\.$/, ""));
      if (next.length === s.words.length) window.setTimeout(() => { void say(sentenceText(s)); onBuilt(); }, 700);
    } else { setShake(i); window.setTimeout(() => setShake(null), 500); }
  };
  const used = (i: number) => placed.some((p) => s.words[p] === s.words[i]) && placed.length > s.words.slice(0, i + 1).filter((w) => w === s.words[i]).length - 1 && placed.includes(i);
  return (
    <div className="grid gap-3">
      <Ar className="block text-center text-xl font-black text-muted-foreground">{ui.build}</Ar>
      <div dir="rtl" className="flex min-h-20 flex-wrap items-center justify-center gap-2 rounded-3xl border-4 border-dashed border-border bg-card/60 p-3">
        {placed.map((i) => <span key={i} className="animate-pop-in rounded-2xl bg-success/20 px-3 py-2"><Ar className="text-3xl font-black">{s.words[i]}</Ar></span>)}
      </div>
      <div dir="rtl" className="flex flex-wrap justify-center gap-2">
        {order.map((i) => used(i) ? null : (
          <GameButton key={i} tone="sky" className={cn("rounded-2xl px-4", shake === i && "animate-verb-shake")} onClick={() => tap(i)}><Ar className="text-3xl font-black">{s.words[i]}</Ar></GameButton>
        ))}
      </div>
    </div>
  );
}

function SentencesView({ mark }: { mark: (k: string) => void }) {
  const [sel, setSel] = useState(sentences[0]!);
  const [mode, setMode] = useState<"see" | "build" | "quiz1" | "quiz2">("see");
  const [speaking, setSpeaking] = useState(false);
  const [burst, setBurst] = useState(0);
  const playAll = async () => { setSpeaking(true); mark(`s:${sel.id}`); await say(sentenceText(sel)); setSpeaking(false); };
  if (mode === "quiz1" || mode === "quiz2") return <QuizRunner key={mode} make={() => sentencePicRound(mode === "quiz2")} onMark={mark} onDone={() => setMode("see")} />;
  return (
    <div className="mt-4 grid gap-4">
      <Bloom burst={burst} />
      <div dir="rtl" className="flex gap-2 overflow-x-auto pb-1">
        {([["see", "👀", "شَاهِدْ"], ["build", "🧩", "كَوِّنْ"], ["quiz1", "🖼️", "جُمْلَة ← صُورَة"], ["quiz2", "📝", "صُورَة ← جُمْلَة"]] as const).map(([id, icon, ar]) => (
          <GameButton key={id} tone={mode === id ? "sun" : "neutral"} className="flex min-h-14 shrink-0 items-center gap-2 rounded-full px-4" onClick={() => setMode(id)}><span className="text-2xl">{icon}</span><Ar className="font-black">{ar}</Ar></GameButton>
        ))}
      </div>
      <button type="button" onClick={() => void playAll()} aria-label="Play sentence"><Stage who={sel.who} props={sel.props} anim={speaking ? sel.anim : undefined} speaking={speaking} /></button>
      {mode === "see" ? (
        <div className="flex items-center justify-center gap-3">
          <GameButton tone="sky" className="grid h-14 w-14 place-items-center rounded-full p-0" aria-label="Play sentence" onClick={() => void playAll()}><Play className="h-6 w-6" /></GameButton>
          <div dir="rtl" className="flex flex-wrap justify-center gap-2">
            {sel.words.map((x, i) => <button key={i} type="button" onClick={() => void say(x.replace(/\.$/, ""))} className="rounded-2xl bg-card px-3 py-2 shadow-sm active:scale-95"><Ar className="text-3xl font-black">{x}</Ar></button>)}
          </div>
        </div>
      ) : <SentenceBuilder s={sel} onBuilt={() => { mark(`s:${sel.id}`); mark(`star:${Date.now()}`); setBurst((b) => b + 1); }} />}
      <div dir="rtl" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {sentences.map((x) => (
          <GameButton key={x.id} tone={x === sel ? "sun" : "neutral"} className="flex min-h-16 items-center gap-2 rounded-2xl px-3 py-2 text-start" onClick={() => { setSel(x); void say(sentenceText(x)); }}>
            <span className="text-2xl">{x.props[0]}</span><Ar className="text-base font-black leading-snug">{sentenceText(x)}</Ar>
          </GameButton>
        ))}
      </div>
    </div>
  );
}

function TalkView({ mark }: { mark: (k: string) => void }) {
  const [d, setD] = useState(dialogues[0]!);
  const [line, setLine] = useState<number | null>(null);
  const run = async (dd = d) => {
    mark(`talk:${dd.id}`);
    const mine = token + 1;
    for (let i = 0; i < dd.lines.length; i++) { setLine(i); await say(dd.lines[i]!.text); if (token !== mine) break; }
    setLine(null);
  };
  const [a, b] = d.lines;
  return (
    <div className="mt-4 grid gap-4">
      <div className="relative flex min-h-56 items-end justify-between rounded-[2rem] bg-gradient-to-b from-secondary/70 to-card p-4 shadow-inner">
        <Person who={a!.who} speaking={line === 0} anim={line === 0 ? "bob" : undefined} />
        <span className="self-center text-5xl">{d.props[0]}</span>
        <Person who={b!.who} speaking={line === 1} anim={line === 1 ? "bob" : undefined} />
      </div>
      <div className="grid gap-2">
        {d.lines.map((l, i) => (
          <button key={i} type="button" onClick={() => void say(l.text)} className={cn("flex items-center gap-3 rounded-3xl bg-card p-3 text-start shadow-sm", i % 2 ? "flex-row-reverse" : "", line === i && "ring-4 ring-primary")}>
            <Person who={l.who} size="small" /><Ar className="flex-1 text-2xl font-black leading-snug">{l.text}</Ar>
          </button>
        ))}
      </div>
      <GameButton tone="mint" className="rounded-3xl" onClick={() => void run()}><Play className="me-2 inline h-5 w-5" />اسْمَعِ الْمُحَادَثَةَ</GameButton>
      <div dir="rtl" className="flex flex-wrap justify-center gap-2">
        {dialogues.map((x, i) => <GameButton key={x.id} tone={x === d ? "sun" : "neutral"} className="h-14 w-14 rounded-full p-0 text-xl" onClick={() => { setD(x); void run(x); }}>{i + 1}</GameButton>)}
      </div>
    </div>
  );
}

function SceneView({ id, mark }: { id: string; mark: (k: string) => void }) {
  const sc = scenes.find((s) => s.id === id)!;
  const [hit, setHit] = useState<string | null>(null);
  const [act, setAct] = useState<(typeof verbs)[number] | null>(null);
  const acts = sc.actions.map((a) => verbs.find((v) => v.id === a)!).filter(Boolean);
  return (
    <div className="mt-4 grid gap-4">
      <div className={cn("relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-gradient-to-b shadow-inner sm:aspect-[4/3]", sc.bg)}>
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/4 bg-success/25" />
        {sc.things.map((t) => (
          <button key={t.ar + t.x} type="button" aria-label={t.ar} onClick={() => { setHit(t.ar); mark(`w:${t.ar}`); void say(t.ar); }}
            className={cn("absolute grid -translate-x-1/2 place-items-center rounded-full transition active:scale-90", hit === t.ar && "animate-hamad-cheer")} style={{ left: `${t.x}%`, top: `${t.y}%` }}>
            <span className="text-5xl drop-shadow-lg sm:text-6xl">{t.emoji}</span>
            {hit === t.ar && <Ar className="mt-1 rounded-full bg-card px-3 py-0.5 text-xl font-black shadow">{t.ar}</Ar>}
          </button>
        ))}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
          <Person who={sc.who} anim={act?.anim} speaking={!!act} />
          {act && <span className="absolute -top-6 end-0 text-4xl">{act.prop}</span>}
        </div>
      </div>
      <div dir="rtl" className="flex flex-wrap justify-center gap-2">
        {acts.map((v) => <GameButton key={v.id} tone={act === v ? "sun" : "sky"} className="rounded-full px-4" onClick={() => { setAct(v); mark(`v:${v.id}`); void say(v.ar, v.sentence).then(() => setAct(null)); }}><span className="me-1 text-2xl">{v.prop}</span><Ar className="text-2xl font-black">{v.ar}</Ar></GameButton>)}
      </div>
    </div>
  );
}

const findLesson = (unit: string, itemId?: string) => allLessons.find((l) => l.unit === unit && !l.review && (!itemId || l.items.some((i) => i.id === itemId))) ?? allLessons.find((l) => l.unit === unit)!;

function LettersView({ mark, onStartLesson }: { mark: (k: string) => void; onStartLesson: (l: Lesson) => void }) {
  const [sel, setSel] = useState(lettersUnit.items[0]!);
  const [game, setGame] = useState(false);
  const words = allWords.filter((x) => strip(x.ar).includes(sel.ar === "ا" ? "ا" : sel.ar)).slice(0, 6);
  if (game) return <QuizRunner make={() => letterFindRound(Math.random() < 0.4 ? sel.ar : undefined)} onMark={mark} onDone={() => setGame(false)} />;
  return (
    <div className="mt-4 grid gap-4">
      <div className="grid justify-items-center gap-2 rounded-[2rem] bg-card/80 p-4 shadow-sm">
        <button type="button" onClick={() => sayUrl(curriculumAudio[`letters-${sel.id}`] ?? "")} aria-label="Hear letter"><Ar className="text-8xl font-black text-primary">{sel.ar}</Ar></button>
        {sel.forms && <div dir="rtl" className="flex gap-3">{sel.forms.map((f, i) => <span key={i} className="rounded-xl bg-muted px-3 py-1"><Ar className="text-3xl">{f}</Ar></span>)}</div>}
        {sel.example && <button type="button" onClick={() => sayUrl(curriculumAudio[`letters-${sel.id}-ex`] ?? "")} className="rounded-2xl bg-secondary px-4 py-2"><Ar className="text-3xl font-black">{sel.example.say}</Ar></button>}
        <div dir="rtl" className="flex flex-wrap justify-center gap-2">
          {words.map((x) => <button key={x.id} type="button" onClick={() => void say(x.ar)} className="flex items-center gap-1 rounded-2xl bg-background px-2 py-1"><PicView pic={x.pic} className="h-10 w-10 rounded-xl shadow-none [&_span]:text-2xl" /><Ar className="text-xl font-black">{x.ar}</Ar></button>)}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <GameButton tone="sun" onClick={() => setGame(true)}>🔍 <Ar className="font-black">أَيْنَ الْحَرْفُ؟</Ar></GameButton>
          <GameButton tone="mint" onClick={() => onStartLesson(findLesson("letters", sel.id))}>✍️ <Ar className="font-black">تَتَبَّعْ وَتَدَرَّبْ</Ar></GameButton>
          {sel.forms && <GameButton tone="sky" onClick={() => onStartLesson(findLesson("forms", sel.id))}><Ar className="font-black">أَشْكَالُ الْحَرْف</Ar></GameButton>}
        </div>
      </div>
      <div dir="rtl" className="grid grid-cols-7 gap-1.5">
        {lettersUnit.items.map((l) => (
          <button key={l.id} type="button" aria-label={l.en} onClick={() => { setSel(l); mark(`l:${l.id}`); sayUrl(curriculumAudio[`letters-${l.id}`] ?? ""); }}
            className={cn("grid aspect-square place-items-center rounded-2xl bg-card shadow-sm active:scale-95", l === sel && "bg-primary text-primary-foreground")}>
            <Ar className="text-3xl font-black">{l.ar}</Ar>
          </button>
        ))}
      </div>
    </div>
  );
}

const harakaInfo = [
  { ar: "الْفَتْحَة", ids: ["ba-a", "ma-a", "ta-a"] }, { ar: "الْكَسْرَة", ids: ["ba-i", "ma-i", "ta-i"] }, { ar: "الضَّمَّة", ids: ["ba-u", "ma-u", "ta-u"] },
  { ar: "السُّكُون", ids: ["ab-s", "um-s", "min-s"] }, { ar: "الشَّدَّة", ids: ["rabba", "umma", "sukkar"] }, { ar: "التَّنْوِين", ids: ["ban", "bin", "bun"] },
];
function HarakatView({ onStartLesson }: { onStartLesson: (l: Lesson) => void }) {
  const unit = unitById("harakat");
  return (
    <div className="mt-4 grid gap-3">
      {harakaInfo.map((h) => (
        <div key={h.ar} className="rounded-3xl bg-card/80 p-3 shadow-sm">
          <Ar className="mb-2 block text-center text-2xl font-black">{h.ar}</Ar>
          <div dir="rtl" className="flex justify-center gap-2">
            {h.ids.map((id) => { const it = unit.items.find((i) => i.id === id)!; return (
              <GameButton key={id} tone="sky" className="min-w-20 rounded-2xl" onClick={() => sayUrl(curriculumAudio[`harakat-${id}`] ?? "")}><Ar className="text-4xl font-black">{it.ar}</Ar></GameButton>
            ); })}
          </div>
        </div>
      ))}
      <div dir="rtl" className="flex justify-center gap-2">
        {["بَاب", "بِنْت", "كُرَة"].map((x) => <GameButton key={x} tone="sun" className="rounded-2xl" onClick={() => void say(x)}><Ar className="text-3xl font-black">{x}</Ar></GameButton>)}
      </div>
      <GameButton tone="mint" className="rounded-3xl" onClick={() => onStartLesson(findLesson("harakat"))}><Ar className="font-black">دَرْسُ الْحَرَكَات</Ar> · Practice</GameButton>
    </div>
  );
}

function ReadingView({ onStartLesson }: { onStartLesson: (l: Lesson) => void }) {
  const lessons = allLessons.filter((l) => l.unit === "reading");
  return (
    <div className="mt-4 grid gap-3">
      <Ar className="block text-center text-xl font-bold text-muted-foreground">رَكِّبِ الْكَلِمَةَ وَاقْرَأْ</Ar>
      {lessons.map((l, i) => (
        <GameButton key={l.id} tone={i % 2 ? "sky" : "sun"} className="flex min-h-20 items-center justify-between rounded-3xl px-5" onClick={() => onStartLesson(l)}>
          <Ar className="text-2xl font-black">{l.items.map((x) => x.say).join(" · ")}</Ar><span className="text-2xl">{l.review ? "🔄" : "📖"}</span>
        </GameButton>
      ))}
    </div>
  );
}

const titles: Record<string, string> = { letters: "الْحُرُوف", harakat: "الْحَرَكَات", reading: "الْقِرَاءَة", words: "الْكَلِمَات", verbs: "الْأَفْعَال", sentences: "الْجُمَل", qa: "اسْأَلْ وَأَجِبْ", yesno: "نَعَمْ أَمْ لَا؟", talk: "مُحَادَثَات", sort: "صَنِّفْ", paint: "لَوِّنْ", free: ui.free };

export function ArabicWorld({ view, progress, onProgress, onExit, onStartLesson }: { view: WorldView; progress: LearningProgress; onProgress: Update; onExit: () => void; onStartLesson: (l: Lesson) => void }) {
  const [v, setV] = useState(view);
  const history = useRef<string[]>([]);
  const mark = useMark(onProgress);
  void progress;
  useEffect(() => { mark(`open:${v}`); }, [v]); // eslint-disable-line react-hooks/exhaustive-deps
  const open = (next: string) => { history.current.push(v); setV(next); };
  const back = () => { const prev = history.current.pop(); if (prev) setV(prev); else onExit(); };
  const [kind, arg] = v.split(":") as [string, string | undefined];
  const title = kind === "cat" ? categories.find((c) => c.id === arg)!.ar : kind === "scene" ? scenes.find((s) => s.id === arg)!.ar : titles[kind] ?? ui.title;
  const body = (() => {
    switch (kind) {
      case "letters": return <LettersView mark={mark} onStartLesson={onStartLesson} />;
      case "harakat": return <HarakatView onStartLesson={onStartLesson} />;
      case "reading": return <ReadingView onStartLesson={onStartLesson} />;
      case "words": return <WordsView onOpen={open} />;
      case "cat": return <CategoryView key={arg} catId={arg!} mark={mark} />;
      case "verbs": return <VerbsView mark={mark} />;
      case "sentences": return <SentencesView mark={mark} />;
      case "qa": return <QuizRunner total={8} make={questionRound} onMark={mark} onDone={back} />;
      case "yesno": return <QuizRunner total={8} make={yesNoRound} onMark={mark} onDone={back} />;
      case "talk": return <TalkView mark={mark} />;
      case "scene": return <SceneView key={arg} id={arg!} mark={mark} />;
      case "sort": return <QuizRunner total={8} make={sortRound} onMark={mark} onDone={back} />;
      case "paint": return <QuizRunner total={6} make={paintRound} onMark={mark} onDone={back} />;
      case "free": return <QuizRunner total={12} make={freeRound} onMark={mark} onDone={back} />;
      default: return null;
    }
  })();
  return (
    <GameShell title={title} onExit={back}>
      <div className="mx-auto w-full max-w-2xl">
        {kind === "free" && <p className="mt-2 flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground"><Shuffle className="h-4 w-4" /> Every round is a surprise</p>}
        {body}
      </div>
    </GameShell>
  );
}
