// عالم العربية — open discovery playground. Nothing is locked; progress is informational only
// and stored under its own key so it never touches other sections.
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Eraser, Sparkles, Volume2 } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { arabicBook, arabicStories, pictureDictionary, type ArabicLesson, type SourceBlock } from "@/data/curriculum";
import { sheets } from "@/data/curriculum/assetManifest";
import { letterExtras } from "@/data/curriculum/letterExtras";
import { allWords } from "@/data/arabicWorld";
import { speakArabic } from "@/lib/arabicVoice";
import { cn } from "@/lib/utils";

/* ---------- audio: real clip if mapped, otherwise device Arabic voice ---------- */
export function speak(text: string) {
  void speakArabic(text);
}

/* ---------- progress ---------- */
const KEY = "arabic-learning-world-v1";
type Prog = { found: string[]; stars: number };
function useProg() {
  const [p, setP] = useState<Prog>({ found: [], stars: 0 });
  useEffect(() => { try { const r = localStorage.getItem(KEY); if (r) setP(JSON.parse(r)); } catch { /* ignore */ } }, []);
  const save = (f: (x: Prog) => Prog) => setP((x) => { const n = f(x); try { localStorage.setItem(KEY, JSON.stringify(n)); } catch { /* ignore */ } return n; });
  return { p, find: (id: string) => save((x) => (x.found.includes(id) ? x : { ...x, found: [...x.found, id] })), star: () => save((x) => ({ ...x, stars: x.stars + 1 })) };
}

/* ---------- letters & vocabulary ---------- */
export const LETTERS = [
  ["ا", "أَلِف"], ["ب", "باء"], ["ت", "تاء"], ["ث", "ثاء"], ["ج", "جيم"], ["ح", "حاء"], ["خ", "خاء"], ["د", "دال"], ["ذ", "ذال"], ["ر", "راء"],
  ["ز", "زاي"], ["س", "سين"], ["ش", "شين"], ["ص", "صاد"], ["ض", "ضاد"], ["ط", "طاء"], ["ظ", "ظاء"], ["ع", "عين"], ["غ", "غين"], ["ف", "فاء"],
  ["ق", "قاف"], ["ك", "كاف"], ["ل", "لام"], ["م", "ميم"], ["ن", "نون"], ["ه", "هاء"], ["و", "واو"], ["ي", "ياء"],
] as const;
const NON_JOINING = new Set(["ا", "د", "ذ", "ر", "ز", "و"]);
const ZWJ = "\u200D";
const forms = (l: string) => NON_JOINING.has(l)
  ? { iso: l, start: l, mid: ZWJ + l, end: ZWJ + l }
  : { iso: l, start: l + ZWJ, mid: ZWJ + l + ZWJ, end: ZWJ + l };
const bare = (t: string) => t.replace(/[\u064B-\u0652\u0670\u0640]/g, "");
const firstLetter = (t: string) => { let w = bare(t).replace(/^ال/, ""); w = w.replace(/^[أإآ]/, "ا"); return w[0] ?? ""; };

type VocabImage = { sheet: string; cell: number };
type Vocab = { id: string; ar: string; plain: string; emoji: string | null; en: string | null; source: string | null; image: VocabImage | null };
const vocabCache = new Map<string, Vocab[]>();
function vocabFor(letter: string): Vocab[] {
  const hit = vocabCache.get(letter); if (hit) return hit;
  const out: Vocab[] = []; const seen = new Set<string>();
  for (const w of allWords) {
    if (firstLetter(w.ar) !== letter) continue;
    const k = bare(w.ar); if (seen.has(k)) continue; seen.add(k);
    out.push({ id: "w-" + w.id, ar: w.ar, plain: k, emoji: w.pic.emoji ?? null, en: w.en, source: null, image: null });
  }
  for (const e of pictureDictionary) {
    if (e.letter !== letter) continue;
    const k = bare(e.vowelled ?? e.word); if (seen.has(k)) continue; seen.add(k);
    out.push({ id: e.id, ar: e.vowelled ?? e.word, plain: k, emoji: null, en: e.en, source: e.sources[0] ?? null, image: e.image ? { sheet: e.image.sheet, cell: e.image.cell } : null });
  }
  for (const e of letterExtras) {
    if (e.letter !== letter || seen.has(e.plain)) continue;
    seen.add(e.plain);
    out.push({ id: e.id, ar: e.ar, plain: e.plain, emoji: e.emoji, en: e.en, source: null, image: null });
  }
  vocabCache.set(letter, out);
  return out;
}
const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

function VocabPicture({ word, className }: { word: Vocab; className?: string }) {
  if (!word.image) return <span className={className}>{word.emoji ?? "✨"}</span>;
  const sheet = sheets[word.image.sheet];
  if (!sheet) return <span className={className}>{word.emoji ?? "✨"}</span>;
  const rows = Math.ceil(sheet.cells.length / sheet.cols);
  const col = word.image.cell % sheet.cols;
  const row = Math.floor(word.image.cell / sheet.cols);
  const x = sheet.cols > 1 ? (col / (sheet.cols - 1)) * 100 : 0;
  const y = rows > 1 ? (row / (rows - 1)) * 100 : 0;
  return <span className={cn("block bg-no-repeat", className)} style={{ backgroundImage: `url(${sheet.url})`, backgroundSize: `${sheet.cols * 100}% ${rows * 100}%`, backgroundPosition: `${x}% ${y}%` }} aria-hidden="true" />;
}

/* ---------- scene crop from the opaque Gemini scene sheet (3 cols × 6 rows) ---------- */
function sceneStyle(i: number) {
  const s = sheets["sheet-3076"]!; const cell = i % 18; const col = cell % 3; const row = Math.floor(cell / 3);
  return { backgroundImage: `url(${s.url})`, backgroundSize: "300% 600%", backgroundPosition: `${col * 50}% ${row * 20}%` };
}

const tones = ["sun", "sky", "mint", "berry"] as const;
const AREAS = [
  { id: "dict", ar: "قاموس الحروف", icon: "📚" }, { id: "letters", ar: "الحروف", icon: "🔤" }, { id: "reading", ar: "القراءة", icon: "📖" },
  { id: "talk", ar: "التحدث", icon: "🗣️" }, { id: "write", ar: "الكتابة", icon: "✏️" }, { id: "words", ar: "الكلمات", icon: "🧩" },
  { id: "verbs", ar: "الأفعال", icon: "🏃" }, { id: "sentences", ar: "الجمل", icon: "💬" }, { id: "qa", ar: "اسأل وأجب", icon: "❓" },
  { id: "stories", ar: "القصص", icon: "🎭" }, { id: "free", ar: "الألعاب", icon: "🎮" }, { id: "book", ar: "كتابي — الصف الأول", icon: "🏫" },
] as const;
const EXTERNAL = new Set(["letters", "reading", "talk", "words", "verbs", "sentences", "qa", "free"]);

type View = { k: "home" } | { k: "map" } | { k: "dict" } | { k: "letter"; l: string } | { k: "write"; l?: string } | { k: "stories" } | { k: "book" } | { k: "lesson"; lesson: ArabicLesson };

export function LearningWorld({ onExit, onOpenWorld }: { onExit: () => void; onOpenWorld: (view: string) => void }) {
  const [v, setV] = useState<View>({ k: "home" });
  const prog = useProg();
  const back = () => (v.k === "home" ? onExit() : v.k === "letter" ? setV({ k: "dict" }) : v.k === "lesson" ? setV({ k: "book" }) : setV({ k: "home" }));
  const open = (id: string) => {
    if (EXTERNAL.has(id)) return onOpenWorld(id);
    if (id === "dict" || id === "stories" || id === "book") return setV({ k: id } as View);
    if (id === "write") return setV({ k: "write" });
  };
  return (
    <main dir="rtl" lang="ar" className="min-h-dvh bg-background px-3 pb-10 pt-[max(env(safe-area-inset-top),12px)] font-arabic">
      <div className="mx-auto max-w-5xl">
        <header className="mb-4 flex items-center justify-between gap-2">
          <GameButton tone="neutral" className="flex min-h-12 items-center gap-2 px-4" onClick={back} aria-label="رجوع"><ArrowLeft className="h-5 w-5 rotate-180" /> رجوع</GameButton>
          <div className="rounded-full bg-card px-4 py-2 text-lg font-black shadow">⭐ {prog.p.stars} · 🌸 {prog.p.found.length}</div>
        </header>
        {v.k === "home" && <Home onOpen={open} onMap={() => setV({ k: "map" })} />}
        {v.k === "map" && <AdventureMap onOpen={open} />}
        {v.k === "dict" && <LetterDictionary found={prog.p.found} onPick={(l) => setV({ k: "letter", l })} />}
        {v.k === "letter" && <LetterWorld key={v.l} letter={v.l} found={prog.p.found} onFind={prog.find} onStar={prog.star} onWrite={() => setV({ k: "write", l: v.l })} />}
        {v.k === "write" && <Tracing initial={v.l ?? "ب"} onStar={prog.star} />}
        {v.k === "stories" && <Stories />}
        {v.k === "book" && <BookWorld onLesson={(lesson) => setV({ k: "lesson", lesson })} />}
        {v.k === "lesson" && <LessonView lesson={v.lesson} onStar={prog.star} />}
      </div>
    </main>
  );
}

function Home({ onOpen, onMap }: { onOpen: (id: string) => void; onMap: () => void }) {
  return (
    <section>
      <button onClick={onMap} className="relative mb-5 block h-52 w-full overflow-hidden rounded-3xl border-4 border-card shadow-lg sm:h-72" style={{ backgroundImage: `url(${sheets["sheet-3070"]!.url})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <span className="absolute inset-x-0 bottom-0 bg-card/85 p-3 text-center text-2xl font-black">🗺️ عالم العربية — ابدأ المغامرة</span>
      </button>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {AREAS.map((a, i) => (
          <GameButton key={a.id} tone={tones[i % 4]!} className="flex min-h-28 flex-col items-center justify-center gap-1 rounded-3xl p-3" onClick={() => onOpen(a.id)}>
            <span className="text-4xl">{a.icon}</span><span className="text-xl font-black">{a.ar}</span>
          </GameButton>
        ))}
      </div>
      <p className="mt-4 text-center text-sm font-bold opacity-70">كل الأماكن مفتوحة — استكشف كما تحب!</p>
    </section>
  );
}

const NODES = [[12, 82], [30, 70], [48, 78], [66, 66], [82, 54], [64, 42], [44, 48], [24, 38], [14, 22], [36, 18], [58, 22], [80, 20]] as const;
function AdventureMap({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <section className="relative mx-auto aspect-[3/4] w-full max-w-3xl overflow-hidden rounded-3xl border-4 border-card shadow-xl sm:aspect-[4/3]" style={{ backgroundImage: `url(${sheets["sheet-3072"]!.url})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <p className="absolute inset-x-0 top-0 bg-card/80 py-2 text-center text-xl font-black">استكشف ← اكتشف ← العب ← تعلّم</p>
      {AREAS.map((a, i) => (
        <button key={a.id} onClick={() => onOpen(a.id)} className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: `${NODES[i]![0]}%`, top: `${NODES[i]![1]}%` }}>
          <span className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-card bg-primary text-3xl shadow-lg transition-transform hover:scale-110 active:scale-95 motion-safe:animate-[bounce_3s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.2}s` }}>{a.icon}</span>
          <span className="mt-1 rounded-full bg-card/90 px-2 text-sm font-black shadow">{a.ar}</span>
        </button>
      ))}
    </section>
  );
}

function LetterDictionary({ found, onPick }: { found: string[]; onPick: (l: string) => void }) {
  return (
    <section>
      <h1 className="text-center text-4xl font-black">قاموس الحروف</h1>
      <p className="mb-5 text-center text-xl font-bold opacity-75">استكشف عالم الكلمات</p>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
        {LETTERS.map(([l, name], i) => {
          const words = vocabFor(l); const n = words.filter((w) => found.includes(w.id)).length;
          return (
            <button key={l} onClick={() => onPick(l)} className="relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-3xl border-4 border-card shadow-md active:scale-95" style={sceneStyle(i)}>
              <span className="rounded-2xl bg-card/85 px-3 text-5xl font-black leading-tight">{l}</span>
              <span className="mt-1 rounded-full bg-card/85 px-2 text-xs font-black">{name} · {n}/{words.length}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- a single letter world ---------- */
type Game = "explore" | "listen" | "first" | "build" | "hunt" | "memory";
function LetterWorld({ letter, found, onFind, onStar, onWrite }: { letter: string; found: string[]; onFind: (id: string) => void; onStar: () => void; onWrite: () => void }) {
  const idx = LETTERS.findIndex(([l]) => l === letter);
  const name = LETTERS[idx]?.[1] ?? letter;
  const words = vocabFor(letter);
  const [game, setGame] = useState<Game>("explore");
  const [sel, setSel] = useState<Vocab | null>(null);
  const f = forms(letter);
  const spots = useMemo(() => words.slice(0, 24).map((w, i) => ({ w, x: 8 + ((i * 37) % 84), y: 12 + ((i * 53) % 74) })), [words]);
  const tap = (w: Vocab) => { setSel(w); onFind(w.id); speak(w.ar); };
  const games: [Game, string][] = [["explore", "🔍 استكشف"], ["listen", "🎧 اسمع واختر"], ["first", "🔤 الصوت الأول"], ["build", "🧱 ركّب الكلمة"], ["hunt", "🎯 ابحث عن الحرف"], ["memory", "🃏 الذاكرة"]];
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
        <button onClick={() => speak(letter)} className="rounded-3xl bg-primary px-6 text-7xl font-black text-primary-foreground shadow-lg">{letter}</button>
        <div className="text-center"><p className="text-3xl font-black">حرف {name}</p><p className="text-sm font-bold opacity-70">{words.length} كلمة للاستكشاف</p></div>
      </div>
      <div className="mb-3 grid grid-cols-4 gap-2 sm:grid-cols-8">
        {[["َ", "فتحة"], ["ِ", "كسرة"], ["ُ", "ضمة"], ["ْ", "سكون"]].map(([h, n]) => (
          <button key={n} onClick={() => speak(letter + h)} className="rounded-2xl bg-card p-2 shadow"><span className="block text-4xl font-black">{letter}{h}</span><span className="text-xs font-bold">{n}</span></button>
        ))}
        {[[f.iso, "منفرد"], [f.start, "أول"], [f.mid, "وسط"], [f.end, "آخر"]].map(([g, n]) => (
          <button key={n} onClick={() => speak(letter)} className="rounded-2xl bg-secondary/40 p-2 shadow"><span className="block text-4xl font-black">{g}</span><span className="text-xs font-bold">{n}</span></button>
        ))}
      </div>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {games.map(([g, t]) => <GameButton key={g} tone={game === g ? "sun" : "neutral"} className="min-h-12 shrink-0 px-4 text-lg" onClick={() => setGame(g)}>{t}</GameButton>)}
        <GameButton tone="neutral" className="min-h-12 shrink-0 px-4 text-lg" onClick={onWrite}>✏️ اكتب</GameButton>
      </div>
      {game === "explore" && (
        <>
          <div className="relative h-[26rem] overflow-hidden rounded-3xl border-4 border-card shadow-xl sm:h-[32rem]" style={sceneStyle(idx)}>
            {spots.map(({ w, x, y }) => {
              const got = found.includes(w.id);
              return (
                <button key={w.id} onClick={() => tap(w)} className={cn("absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-2xl p-1 transition-transform active:scale-90", sel?.id === w.id && "scale-125 animate-bounce")} style={{ left: `${x}%`, top: `${y}%` }}>
                   <span className={cn("flex h-16 w-16 items-center justify-center rounded-full border-4 text-3xl shadow-lg", got ? "border-success bg-card" : "border-card bg-card/70")}>{got ? <VocabPicture word={w} className="h-12 w-12" /> : "❔"}</span>
                  {got && <span className="mt-0.5 rounded-full bg-card/90 px-2 text-sm font-black">{w.plain}</span>}
                </button>
              );
            })}
          </div>
          {sel && (
            <div className="mt-3 rounded-3xl bg-card p-4 text-center shadow-lg">
               <button onClick={() => speak(sel.ar)} className="inline-flex items-center gap-2 text-5xl font-black"><VocabPicture word={sel} className="h-16 w-16 shrink-0" /> {sel.ar} <Volume2 className="h-7 w-7" /></button>
              {sel.en && <p dir="ltr" className="mt-1 font-sans text-lg font-bold opacity-70">{sel.en}</p>}
              <p className="mt-2 text-lg font-bold">
                {sel.ar.split("").map((ch, i) => <span key={i} className={bare(ch) && firstLetter(ch) === letter ? "text-accent" : ""}>{ch}</span>)}
              </p>
              {sel.source && <p className="mt-1 text-sm font-bold opacity-60">من كتابي: {sel.source.replace("arabic-book p.", "صفحة ").replace("science-book p.", "العلوم صفحة ")}</p>}
            </div>
          )}
        </>
      )}
      {game === "listen" && <ListenFind key="l" words={words} onStar={onStar} />}
      {game === "first" && <FirstSound key="f" letter={letter} onStar={onStar} />}
      {game === "build" && <BuildWord key="b" words={words} onStar={onStar} />}
      {game === "hunt" && <LetterHunt key="h" letter={letter} onStar={onStar} />}
      {game === "memory" && <Memory key="m" words={words} onStar={onStar} />}
    </section>
  );
}

function Cheer({ ok }: { ok: boolean | null }) {
  if (ok === null) return null;
  return <p className="mt-3 text-center text-3xl font-black">{ok ? "🌸 أحسنت!" : "🙂 حاول مرة أخرى"}</p>;
}
function useRound<T>(make: () => T) { const [r, setR] = useState(make); const [ok, setOk] = useState<boolean | null>(null); return { r, ok, setOk, next: () => { setR(make()); setOk(null); } }; }

function ListenFind({ words, onStar }: { words: Vocab[]; onStar: () => void }) {
  const pool = words.length >= 2 ? words : [...words, ...vocabFor("ب")];
  const { r, ok, setOk, next } = useRound(() => { const opts = shuffle(pool).slice(0, 4); return { opts, ans: opts[Math.floor(Math.random() * opts.length)]! }; });
  useEffect(() => { speak(r.ans.ar); }, [r]);
  return (
    <div className="rounded-3xl bg-card p-4 shadow-lg">
      <GameButton tone="sky" className="mx-auto mb-4 flex min-h-14 items-center gap-2 px-6 text-2xl" onClick={() => speak(r.ans.ar)}><Volume2 /> اسمع</GameButton>
      <div className="grid grid-cols-2 gap-3">{r.opts.map((o) => <GameButton key={o.id} tone="neutral" className="min-h-20 text-3xl" onClick={() => { const y = o.id === r.ans.id; setOk(y); if (y) { onStar(); setTimeout(next, 900); } }}>{o.emoji} {o.ar}</GameButton>)}</div>
      <Cheer ok={ok} />
    </div>
  );
}

function FirstSound({ letter, onStar }: { letter: string; onStar: () => void }) {
  const { r, ok, setOk, next } = useRound(() => {
    const target = Math.random() < 0.5 ? letter : LETTERS[Math.floor(Math.random() * 28)]![0];
    const list = vocabFor(target); const w = list[Math.floor(Math.random() * list.length)] ?? vocabFor(letter)[0]!;
    const ans = firstLetter(w.ar); const opts = shuffle([ans, ...shuffle(LETTERS.map(([l]) => l).filter((l) => l !== ans)).slice(0, 3)]);
    return { w, ans, opts };
  });
  useEffect(() => { speak(r.w.ar); }, [r]);
  return (
    <div className="rounded-3xl bg-card p-4 text-center shadow-lg">
      <p className="text-xl font-bold">بأي حرف تبدأ الكلمة؟</p>
      <button onClick={() => speak(r.w.ar)} className="my-3 text-5xl font-black">{r.w.emoji} {r.w.ar} 🔊</button>
      <div className="grid grid-cols-4 gap-3">{r.opts.map((o) => <GameButton key={o} tone="neutral" className="min-h-20 text-5xl" onClick={() => { speak(o); const y = o === r.ans; setOk(y); if (y) { onStar(); setTimeout(next, 900); } }}>{o}</GameButton>)}</div>
      <Cheer ok={ok} />
    </div>
  );
}

function BuildWord({ words, onStar }: { words: Vocab[]; onStar: () => void }) {
  const short = words.filter((w) => w.plain.length >= 2 && w.plain.length <= 6);
  const pool = short.length ? short : words;
  const { r, ok, setOk, next } = useRound(() => { const w = pool[Math.floor(Math.random() * pool.length)]!; return { w, tiles: shuffle(w.plain.split("").map((c, i) => ({ c, i }))) }; });
  const [picked, setPicked] = useState<number[]>([]);
  useEffect(() => { setPicked([]); speak(r.w.ar); }, [r]);
  const built = picked.map((i) => r.w.plain[i]).join("");
  const add = (i: number) => {
    const p = [...picked, i]; setPicked(p);
    if (p.length === r.w.plain.length) { const y = p.map((k) => r.w.plain[k]).join("") === r.w.plain; setOk(y); if (y) { onStar(); speak(r.w.ar); setTimeout(next, 1200); } else setTimeout(() => { setPicked([]); setOk(null); }, 900); }
  };
  return (
    <div className="rounded-3xl bg-card p-4 text-center shadow-lg">
      <button onClick={() => speak(r.w.ar)} className="text-5xl">{r.w.emoji ?? "🔊"}</button>
      <p className="my-3 min-h-16 rounded-2xl bg-muted p-2 text-5xl font-black">{built || "…"}</p>
      <div className="flex flex-wrap justify-center gap-2">{r.tiles.map((t) => <GameButton key={t.i} tone="sky" disabled={picked.includes(t.i)} className="h-16 w-16 text-4xl" onClick={() => add(t.i)}>{t.c}</GameButton>)}</div>
      <Cheer ok={ok} />
    </div>
  );
}

function LetterHunt({ letter, onStar }: { letter: string; onStar: () => void }) {
  const { r, next } = useRound(() => shuffle([...Array(5).fill(letter), ...shuffle(LETTERS.map(([l]) => l).filter((l) => l !== letter)).slice(0, 11)]).map((l, i) => ({ l, i })));
  const [hit, setHit] = useState<number[]>([]);
  const total = r.filter((x) => x.l === letter).length;
  useEffect(() => setHit([]), [r]);
  return (
    <div className="rounded-3xl bg-card p-4 text-center shadow-lg">
      <p className="mb-3 text-xl font-bold">اضغط على كل حرف {letter} ({hit.length}/{total})</p>
      <div className="grid grid-cols-4 gap-2">{r.map((x) => <GameButton key={x.i} tone={hit.includes(x.i) ? "mint" : "neutral"} className="min-h-16 text-4xl" onClick={() => { speak(x.l); if (x.l === letter && !hit.includes(x.i)) { const h = [...hit, x.i]; setHit(h); if (h.length === total) { onStar(); setTimeout(next, 1000); } } }}>{x.l}</GameButton>)}</div>
      {hit.length === total && <Cheer ok />}
    </div>
  );
}

function Memory({ words, onStar }: { words: Vocab[]; onStar: () => void }) {
  const { r, next } = useRound(() => shuffle(shuffle(words).slice(0, 4).flatMap((w) => [{ k: w.id + "a", id: w.id, face: w.emoji ?? w.plain[0]!, w }, { k: w.id + "b", id: w.id, face: w.plain, w }])));
  const [open, setOpen] = useState<number[]>([]); const [done, setDone] = useState<string[]>([]);
  useEffect(() => { setOpen([]); setDone([]); }, [r]);
  const flip = (i: number) => {
    if (open.length === 2 || open.includes(i) || done.includes(r[i]!.id)) return;
    speak(r[i]!.w.ar); const o = [...open, i]; setOpen(o);
    if (o.length === 2) setTimeout(() => { if (r[o[0]!]!.id === r[o[1]!]!.id) { const d = [...done, r[o[0]!]!.id]; setDone(d); if (d.length * 2 === r.length) { onStar(); setTimeout(next, 1200); } } setOpen([]); }, 800);
  };
  return (
    <div className="grid grid-cols-4 gap-2 rounded-3xl bg-card p-4 shadow-lg">
      {r.map((c, i) => { const show = open.includes(i) || done.includes(c.id); return <button key={c.k} onClick={() => flip(i)} className={cn("flex aspect-square items-center justify-center rounded-2xl text-2xl font-black shadow sm:text-4xl", show ? "bg-secondary/40" : "bg-primary text-primary-foreground")}>{show ? c.face : "؟"}</button>; })}
    </div>
  );
}

/* ---------- writing / tracing ---------- */
function Tracing({ initial, onStar }: { initial: string; onStar: () => void }) {
  const [l, setL] = useState(initial);
  const ref = useRef<HTMLCanvasElement>(null); const drawing = useRef(false);
  const clear = () => { const c = ref.current; c?.getContext("2d")?.clearRect(0, 0, c.width, c.height); };
  useEffect(clear, [l]);
  const pos = (e: React.PointerEvent) => { const c = ref.current!; const b = c.getBoundingClientRect(); return [((e.clientX - b.left) / b.width) * c.width, ((e.clientY - b.top) / b.height) * c.height] as const; };
  return (
    <section className="text-center">
      <h1 className="mb-2 text-3xl font-black">✏️ أكتب حرف {l}</h1>
      <div className="relative mx-auto aspect-square w-full max-w-md rounded-3xl bg-card shadow-xl">
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[14rem] font-black leading-none text-muted-foreground/25">{l}</span>
        <canvas ref={ref} width={600} height={600} className="absolute inset-0 h-full w-full touch-none"
          onPointerDown={(e) => { drawing.current = true; const g = ref.current!.getContext("2d")!; const [x, y] = pos(e); g.beginPath(); g.moveTo(x, y); g.lineWidth = 28; g.lineCap = "round"; g.strokeStyle = "#e0433a"; }}
          onPointerMove={(e) => { if (!drawing.current) return; const g = ref.current!.getContext("2d")!; const [x, y] = pos(e); g.lineTo(x, y); g.stroke(); }}
          onPointerUp={() => { drawing.current = false; }} onPointerLeave={() => { drawing.current = false; }} />
      </div>
      <div className="my-3 flex justify-center gap-2">
        <GameButton tone="neutral" className="flex min-h-12 items-center gap-2 px-4" onClick={clear}><Eraser /> امسح</GameButton>
        <GameButton tone="mint" className="flex min-h-12 items-center gap-2 px-4" onClick={() => { onStar(); speak("أحسنت"); clear(); }}><Sparkles /> انتهيت</GameButton>
      </div>
      <div className="flex flex-wrap justify-center gap-2">{LETTERS.map(([x]) => <GameButton key={x} tone={x === l ? "sun" : "neutral"} className="h-12 w-12 text-2xl" onClick={() => { setL(x); speak(x); }}>{x}</GameButton>)}</div>
    </section>
  );
}

/* ---------- stories straight from the textbook ---------- */
function Stories() {
  return (
    <section className="space-y-3">
      <h1 className="text-center text-3xl font-black">🎭 القصص من كتابي</h1>
      {arabicStories.map((s) => <BlockCard key={s.block.id} b={s.block} page={s.page} />)}
    </section>
  );
}

function BlockCard({ b, page }: { b: SourceBlock; page?: number }) {
  return (
    <div className="rounded-3xl bg-card p-4 shadow">
      <button onClick={() => speak(b.text)} className="w-full text-right">
        {b.number && <span className="ms-2 rounded-full bg-primary px-2 text-sm font-black text-primary-foreground">{b.number}</span>}
        <span className="whitespace-pre-line text-2xl font-bold leading-loose">{b.text}</span> <Volume2 className="inline h-5 w-5 opacity-60" />
      </button>
      {b.items.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{b.items.map((it, i) => <button key={i} onClick={() => speak(it)} className="rounded-2xl bg-secondary/40 px-3 py-2 text-xl font-bold">{it}</button>)}</div>}
      {page && <p className="mt-1 text-xs font-bold opacity-50">صفحة {page}</p>}
    </div>
  );
}

/* ---------- curriculum world: faithful to the Grade 1 book ---------- */
function BookWorld({ onLesson }: { onLesson: (l: ArabicLesson) => void }) {
  return (
    <section className="space-y-5">
      <h1 className="text-center text-3xl font-black">🏫 كتابي — اللغة العربية، الصف الأول</h1>
      {arabicBook.units.map((u, ui) => (
        <div key={u.id} className="overflow-hidden rounded-3xl shadow-lg">
          <div className="p-4 text-center" style={sceneStyle(ui * 3 + 1)}><span className="rounded-2xl bg-card/90 px-4 py-1 text-2xl font-black">الوحدة {u.number}: {u.title}</span></div>
          <div className="grid grid-cols-1 gap-2 bg-card p-3 sm:grid-cols-2">
            {u.lessons.map((l, i) => <GameButton key={l.id} tone={tones[i % 4]!} className="min-h-14 px-3 text-right text-lg" onClick={() => onLesson(l)}>{l.letter ? `حرف ${l.letter} — ` : ""}{l.title}</GameButton>)}
          </div>
        </div>
      ))}
    </section>
  );
}

const SKILLS = [["all", "📚 الكل"], ["listening", "🎧 اسمع"], ["speaking", "🗣️ تحدث"], ["reading", "📖 اقرأ"], ["writing", "✏️ اكتب"], ["letters", "🧩 العب"], ["construction", "💬 اسأل وأجب"]] as const;
function LessonView({ lesson, onStar }: { lesson: ArabicLesson; onStar: () => void }) {
  const [skill, setSkill] = useState<string>("all");
  const blocks = lesson.pages.flatMap((p) => p.blocks.map((b) => ({ b, page: p.page })));
  const shown = skill === "all" ? blocks : blocks.filter((x) => x.b.skill === skill);
  return (
    <section>
      <h1 className="mb-3 text-center text-2xl font-black">{lesson.title}</h1>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">{SKILLS.map(([k, t]) => <GameButton key={k} tone={skill === k ? "sun" : "neutral"} className="min-h-12 shrink-0 px-4" onClick={() => setSkill(k)}>{t}</GameButton>)}</div>
      {lesson.letter && <p className="mb-3 text-center"><button onClick={() => speak(lesson.letter!)} className="rounded-3xl bg-primary px-6 text-6xl font-black text-primary-foreground">{lesson.letter}</button></p>}
      <div className="space-y-3">
        {shown.length ? shown.map((x) => <BlockCard key={x.b.id} b={x.b} page={x.page} />) : <p className="text-center text-xl font-bold opacity-70">لا يوجد نشاط من هذا النوع في هذا الدرس.</p>}
      </div>
      <GameButton tone="mint" className="mx-auto mt-4 flex min-h-14 items-center gap-2 px-6 text-xl" onClick={() => { onStar(); speak("أحسنت"); }}>⭐ أنهيت الدرس</GameButton>
    </section>
  );
}
