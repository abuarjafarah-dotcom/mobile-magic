import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Music, Pause, Play } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { FamilyCharacter, type FamilyMember, shuffle } from "@/components/learn/shared";
import { cn } from "@/lib/utils";
import { ieVerses } from "@/data/islamicExplorerVerses";
import { surahs } from "@/data/surahs";
import adhanAsset from "@/assets/adhan.mp3.asset.json";

/* ---------------- sounds (synthesized, gentle) ---------------- */
type Sfx = "water" | "click" | "chime" | "bell" | "pop" | "buzz" | "rustle" | "clink" | "door" | "warm" | "coin" | "yay";
let ctx: AudioContext | null = null;
function sfx(kind: Sfx) {
  try {
    ctx ??= new AudioContext();
    const c = ctx; const t = c.currentTime;
    const tone = (f: number, d: number, type: OscillatorType = "sine", v = 0.12, at = 0, f2?: number) => {
      const o = c.createOscillator(); const g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t + at); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + at + d);
      g.gain.setValueAtTime(0.0001, t + at); g.gain.exponentialRampToValueAtTime(v, t + at + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + at + d);
      o.connect(g).connect(c.destination); o.start(t + at); o.stop(t + at + d + 0.05);
    };
    const noise = (d: number, freq: number, v = 0.15) => {
      const b = c.createBuffer(1, c.sampleRate * d, c.sampleRate); const ch = b.getChannelData(0);
      for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length);
      const s = c.createBufferSource(); s.buffer = b; const f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq; const g = c.createGain(); g.gain.value = v;
      s.connect(f).connect(g).connect(c.destination); s.start();
    };
    ({
      water: () => { noise(1.2, 900, 0.2); tone(600, 0.15, "sine", 0.05, 0.1, 900); tone(700, 0.15, "sine", 0.05, 0.4, 1000); },
      click: () => tone(1400, 0.05, "triangle", 0.1),
      chime: () => { tone(880, 1.2, "sine", 0.08); tone(1320, 1.2, "sine", 0.05, 0.15); tone(1760, 1.4, "sine", 0.04, 0.3); },
      bell: () => { tone(660, 1.6, "sine", 0.1); tone(990, 1.4, "sine", 0.05, 0.02); },
      pop: () => tone(500, 0.12, "sine", 0.12, 0, 900),
      buzz: () => tone(180, 0.8, "sawtooth", 0.03, 0, 220),
      rustle: () => noise(0.6, 3000, 0.1),
      clink: () => { tone(2200, 0.15, "triangle", 0.06); tone(2600, 0.15, "triangle", 0.05, 0.12); },
      door: () => { tone(120, 0.25, "square", 0.04, 0, 90); },
      warm: () => { tone(392, 0.5, "sine", 0.08); tone(523, 0.6, "sine", 0.07, 0.15); },
      coin: () => { tone(1320, 0.1, "square", 0.04); tone(1760, 0.2, "square", 0.04, 0.08); },
      yay: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, "triangle", 0.08, i * 0.11)); },
    } as Record<Sfx, () => void>)[kind]();
  } catch { /* audio unavailable */ }
}

/* ---------------- progress (own storage, separate from other sections) ---------------- */
const KEY = "islamic-explorer-v1";
type IeProgress = { visited: string[]; heard: string[]; games: string[] };
function loadP(): IeProgress { try { return { visited: [], heard: [], games: [], ...JSON.parse(localStorage.getItem(KEY) ?? "{}") }; } catch { return { visited: [], heard: [], games: [] }; } }
function mark(field: keyof IeProgress, id: string) { const p = loadP(); if (!p[field].includes(id)) { p[field].push(id); localStorage.setItem(KEY, JSON.stringify(p)); } }

/* ---------------- surahs ---------------- */
type Recitation = { id: string; ar: string; en: string; note: string; verses: { key: string; arabic: string; audio: string }[]; song: string[] };
const fromKeys = (keys: string[]) => keys.map((k) => ieVerses[k]!);
const fromJuz = (id: string, n?: number) => { const s = surahs.find((x) => x.id === id)!; return s.verses.slice(0, n).map((v, i) => ({ key: `${s.number}:${i + 1}`, arabic: v.arabic, audio: v.audio })); };
const R: Record<string, Recitation> = {
  fatiha: { id: "fatiha", ar: "الفاتحة", en: "Al-Fatiha", note: "Whole surah", verses: fromKeys(["1:1", "1:2", "1:3", "1:4", "1:5", "1:6", "1:7"]), song: ["Guide us on the path, straight and true", "In prayer, our hearts find peace anew"] },
  nas: { id: "nas", ar: "الناس", en: "An-Nas", note: "Whole surah", verses: fromJuz("annas"), song: ["Seek protection from harm and fear", "Allah listens when you pray sincere"] },
  maryam: { id: "maryam", ar: "مريم", en: "Maryam", note: "Ayat 24–25", verses: fromKeys(["19:24", "19:25"]), song: ["Love your mama like Maryam so true", "Help your family in all you do"] },
  yusuf: { id: "yusuf", ar: "يوسف", en: "Yusuf", note: "Ayat 4–5", verses: fromKeys(["12:4", "12:5"]), song: ["Patient and kind like Yousef so brave", "Family together, we light the way"] },
  nahl: { id: "nahl", ar: "النحل", en: "An-Nahl", note: "Ayat 68–69 (the bee)", verses: fromKeys(["16:68", "16:69"]), song: ["Bees make honey, buzzz buzzz buzzz", "Allah showed them the perfect way"] },
  anam: { id: "anam", ar: "الأنعام", en: "Al-An'am", note: "Ayah 38 (animals and birds)", verses: fromKeys(["6:38"]), song: ["Allah made the birds, the flowers, the sky", "Creation all around, open up your eyes"] },
  maun: { id: "maun", ar: "الماعون", en: "Al-Ma'un", note: "Whole surah", verses: fromJuz("almaun"), song: ["Share your heart, share your care", "Helping others is always fair"] },
  qasas: { id: "qasas", ar: "القصص", en: "Al-Qasas", note: "Ayah 77", verses: fromKeys(["28:77"]), song: ["Work with honesty, do your best", "Allah provides, puts us to the test"] },
  imran: { id: "imran", ar: "آل عمران", en: "Aal-Imran", note: "Ayah 8", verses: fromKeys(["3:8"]), song: ["Devoted hearts find peace within", "Trust in Allah's loving hand"] },
  saffat: { id: "saffat", ar: "الصافات", en: "As-Saffat", note: "Ayat 180–182", verses: fromKeys(["37:180", "37:181", "37:182"]), song: ["Trust in Allah's perfect way", "Surrender brings us peace each day"] },
};

/* ---------------- games ---------------- */
type Item = { e: string; ar: string; en: string };
type Game =
  | { id: string; kind: "order"; ar: string; en: string; prompt: string; items: Item[]; wrong: string; right: string }
  | { id: string; kind: "match"; ar: string; en: string; prompt: string; pairs: { a: Item; b: Item }[]; right: string }
  | { id: string; kind: "collect"; ar: string; en: string; prompt: string; items: Item[]; right: string }
  | { id: string; kind: "choice"; ar: string; en: string; rounds: () => { q: string; show: string; options: string[]; answer: string }[]; right: string }
  | { id: string; kind: "give"; ar: string; en: string; right: string };

const creatures = ["🐝", "🦋", "🐛", "🐞"];
const creatureNames: Record<string, string> = { "🐝": "bees", "🦋": "butterflies", "🐛": "caterpillars", "🐞": "ladybirds" };

/* ---------------- spaces ---------------- */
type Toy = { id: string; e: string; ar: string; en: string; sfx: Sfx; fx?: "count33" | "toggle" | "unroll" | "ripple" | "bloom"; add?: string[] };
type Space = { id: string; ar: string; en: string; e: string; bg: string; guide: FamilyMember; hello: string; trayLabel?: string; toys: Toy[]; games: Game[]; surahs: string[] };

const SPACES: Space[] = [
  { id: "mosque", ar: "المسجد", en: "The Mosque", e: "🕌", bg: "bg-space-mosque", guide: "hamad", hello: "Shh… a calm, peaceful place. Tap to explore!",
    toys: [
      { id: "fountain", e: "⛲", ar: "الماء", en: "Water", sfx: "water", fx: "ripple" },
      { id: "beads", e: "📿", ar: "المسبحة", en: "Beads", sfx: "click", fx: "count33" },
      { id: "mat", e: "🟩", ar: "السجادة", en: "Prayer mat", sfx: "rustle", fx: "unroll" },
      { id: "lamp", e: "🏮", ar: "الفانوس", en: "Lantern", sfx: "warm", fx: "toggle" },
      { id: "minaret", e: "🕌", ar: "المئذنة", en: "Minaret", sfx: "chime" },
      { id: "bell", e: "🔔", ar: "الجرس", en: "Chime", sfx: "bell" },
    ],
    games: [
      { id: "wudu", kind: "order", ar: "خطوات الوضوء", en: "Wudu steps", prompt: "Tap the steps in order", items: [{ e: "🙌", ar: "اليدان", en: "Hands" }, { e: "😊", ar: "الوجه", en: "Face" }, { e: "💪", ar: "الذراعان", en: "Arms" }, { e: "🦶", ar: "القدمان", en: "Feet" }], wrong: "Try again — wash hands first", right: "Clean heart, ready to pray! ما شاء الله" },
      { id: "postures", kind: "order", ar: "وضعيات الصلاة", en: "Prayer postures", prompt: "Tap in prayer order", items: [{ e: "🧍", ar: "القيام", en: "Standing" }, { e: "🙇", ar: "الركوع", en: "Bowing" }, { e: "🧎", ar: "السجود", en: "Prostrating" }, { e: "🪑", ar: "الجلوس", en: "Sitting" }], wrong: "Almost! We stand first 🧍", right: "Excellent prayer posture! ما شاء الله" },
    ], surahs: ["fatiha", "nas"] },
  { id: "home", ar: "البيت", en: "Home", e: "🏠", bg: "bg-space-home", guide: "talal", hello: "Welcome home! Let's help the family.", trayLabel: "Items in basket",
    toys: [
      { id: "kitchen", e: "🍳", ar: "المطبخ", en: "Kitchen", sfx: "pop", add: ["🍞", "🍯", "🫒", "🥛"] },
      { id: "table", e: "🍽️", ar: "المائدة", en: "Table", sfx: "clink" },
      { id: "mirror", e: "🪞", ar: "المرآة", en: "Wash up", sfx: "water", fx: "ripple" },
      { id: "toys", e: "🧸", ar: "الألعاب", en: "Toys", sfx: "pop", add: ["🧸", "🪀", "🧩", "🚗"] },
      { id: "fridge", e: "🧊", ar: "الثلاجة", en: "Fridge", sfx: "door", fx: "toggle" },
      { id: "mushaf", e: "📖", ar: "المصحف", en: "Qur'an shelf", sfx: "warm" },
    ],
    games: [
      { id: "foods", kind: "collect", ar: "طعام صحي", en: "Healthy foods", prompt: "Tap each food into the basket", items: [{ e: "🌴", ar: "تمر", en: "Dates" }, { e: "🫒", ar: "زيتون", en: "Olives" }, { e: "🍞", ar: "خبز", en: "Bread" }, { e: "🥛", ar: "حليب", en: "Milk" }, { e: "🍎", ar: "تفاح", en: "Apple" }, { e: "🍯", ar: "عسل", en: "Honey" }, { e: "🧀", ar: "جبن", en: "Cheese" }], right: "Great! These are healthy choices! ما شاء الله" },
      { id: "helpers", kind: "match", ar: "مساعدة الأسرة", en: "Family helpers", prompt: "Match each job to its helper", pairs: [{ a: { e: "🍽️", ar: "ترتيب المائدة", en: "Set table" }, b: { e: "👤🍽️", ar: "أنا أرتب", en: "Setting" } }, { a: { e: "🚿", ar: "الاغتسال", en: "Wash" }, b: { e: "👤💧", ar: "أنا أغسل", en: "Washing" } }, { a: { e: "🤝", ar: "مساعدة الأخ", en: "Help sibling" }, b: { e: "👤👤", ar: "أنا أساعد", en: "Helping" } }, { a: { e: "📚", ar: "القراءة", en: "Read" }, b: { e: "👤📖", ar: "أنا أقرأ", en: "Reading" } }], right: "You're such a good helper! ما شاء الله" },
    ], surahs: ["maryam", "yusuf"] },
  { id: "garden", ar: "الحديقة", en: "Garden", e: "🌳", bg: "bg-space-garden", guide: "hamad", hello: "Look at everything Allah created!", trayLabel: "Creatures spotted",
    toys: [
      { id: "flowers", e: "🌸", ar: "الزهور", en: "Flowers", sfx: "pop", fx: "bloom" },
      { id: "water", e: "💧", ar: "السقاية", en: "Water can", sfx: "water", fx: "ripple" },
      { id: "hive", e: "🐝", ar: "الخلية", en: "Beehive", sfx: "buzz", add: ["🐝"] },
      { id: "bugs", e: "🦋", ar: "الفراشات", en: "Creatures", sfx: "pop", add: ["🦋", "🐛", "🐜", "🐞"] },
      { id: "tree", e: "🌳", ar: "الشجرة", en: "Tree", sfx: "rustle" },
      { id: "bell", e: "🔔", ar: "الجرس", en: "Bell", sfx: "bell", add: ["🐦"] },
    ],
    games: [
      { id: "count", kind: "choice", ar: "عدّ المخلوقات", en: "Count creatures", rounds: () => Array.from({ length: 4 }, () => { const c = creatures[Math.floor(Math.random() * 4)]!; const n = 2 + Math.floor(Math.random() * 4); const others = shuffle(creatures.filter((x) => x !== c)).slice(0, 2); const show = shuffle([...Array(n).fill(c), ...others]).join(" "); return { q: `How many ${creatureNames[c]}? كم؟`, show, options: shuffle([n, n + 1, n - 1 || n + 2].map(String)), answer: String(n) }; }), right: "Allah made all creatures wonderful! ما شاء الله" },
      { id: "colors", kind: "match", ar: "ألوان الزهور", en: "Flower colours", prompt: "Match each flower to its colour", pairs: [{ a: { e: "🌹", ar: "وردة", en: "Rose" }, b: { e: "🟥", ar: "أحمر", en: "Red" } }, { a: { e: "🌻", ar: "عباد الشمس", en: "Sunflower" }, b: { e: "🟨", ar: "أصفر", en: "Yellow" } }, { a: { e: "🪻", ar: "خزامى", en: "Lavender" }, b: { e: "🟪", ar: "بنفسجي", en: "Purple" } }, { a: { e: "🌸", ar: "زهرة", en: "Blossom" }, b: { e: "🩷", ar: "زهري", en: "Pink" } }], right: "Such beautiful colours Allah created! ما شاء الله" },
    ], surahs: ["nahl", "anam"] },
  { id: "market", ar: "السوق", en: "Market", e: "🛒", bg: "bg-space-market", guide: "talal", hello: "You have 10 قرش. What will you buy?", toys: [],
    games: [
      { id: "coins", kind: "choice", ar: "قيمة النقود", en: "Coin value", rounds: () => shuffle([
        { q: "How many 1-قرش coins make 5 قرش?", show: "🪙 5 = ? × 🪙 1", options: ["5", "2", "10"], answer: "5" },
        { q: "How many 5-قرش coins make 10 قرش?", show: "🪙 10 = ? × 🪙 5", options: ["2", "5", "1"], answer: "2" },
        { q: "Which is more? أيهما أكثر؟", show: "🪙 1   🪙 10", options: ["10 قرش", "1 قرش"], answer: "10 قرش" },
        { q: "1 + 1 + 1 قرش = ?", show: "🪙 🪙 🪙", options: ["3 قرش", "1 قرش", "5 قرش"], answer: "3 قرش" },
      ]), right: "You know how to count money! ما شاء الله" },
      { id: "zakat", kind: "give", ar: "العطاء", en: "Giving", right: "What a generous heart you have! ما شاء الله" },
    ], surahs: ["maun", "qasas"] },
  { id: "stories", ar: "حكايات القيم", en: "Value stories", e: "📜", bg: "bg-space-stories", guide: "hamad", hello: "Tap a story of a beautiful value.", toys: [],
    games: [
      { id: "seq", kind: "order", ar: "ترتيب الرموز", en: "Patience journey", prompt: "Put the patience journey in order", items: [{ e: "🕳️", ar: "البئر", en: "Well" }, { e: "⛓️", ar: "الصعوبة", en: "Hard times" }, { e: "💡", ar: "الأمل", en: "Hope" }, { e: "👑", ar: "الكرامة", en: "Honour" }], wrong: "Try again — it starts in the well 🕳️", right: "You understand the journey of patience! ما شاء الله" },
      { id: "values", kind: "match", ar: "طابق القيم", en: "Match the value", prompt: "Match each action to its value", pairs: [{ a: { e: "🧍⛈️", ar: "يقف بقوة", en: "Standing strong" }, b: { e: "", ar: "صبر", en: "Patience" } }, { a: { e: "👤🤲👶", ar: "يعتني", en: "Caring" }, b: { e: "", ar: "رحمة", en: "Compassion" } }, { a: { e: "👤⛰️🌟", ar: "يثق بالله", en: "Trusting" }, b: { e: "", ar: "توكل", en: "Trust" } }], right: "That's exactly what it means! ما شاء الله" },
    ], surahs: ["yusuf", "imran", "saffat"] },
];

const STORIES = [
  { id: "sabr", e: "🌱", ar: "الصبر", en: "Patience", desc: "Journey from struggle to honour", steps: [["🕳️", "Well"], ["⛓️", "Hard times"], ["💡", "Hope"], ["👑", "Honour"]], surah: "yusuf" },
  { id: "rahma", e: "❤️", ar: "الرحمة", en: "Compassion", desc: "Heart of family care", steps: [["👤", "A mother"], ["🤲", "Caring"], ["💕", "Love spreads"], ["✨", "Blessing"]], surah: "maryam" },
  { id: "tawakkul", e: "✨", ar: "التوكل", en: "Trust", desc: "Faith in Allah's plan", steps: [["⛰️", "Mountain"], ["🌟", "Stars appear"], ["💫", "Certainty"], ["🕊️", "Peace"]], surah: "saffat" },
] as const;

/* ---------------- UI ---------------- */
type View = { at: "hub" } | { at: "space"; id: string } | { at: "game"; space: string; game: string } | { at: "story"; id: string } | { at: "surah"; space: string; id: string };

export function IslamicExplorer({ onExit }: { onExit: () => void }) {
  const [view, setView] = useState<View>({ at: "hub" });
  const space = "space" in view ? SPACES.find((s) => s.id === view.space) : view.at === "space" ? SPACES.find((s) => s.id === view.id) : undefined;
  const back = () => (view.at === "hub" ? onExit() : view.at === "space" ? setView({ at: "hub" }) : view.at === "story" ? setView({ at: "space", id: "stories" }) : setView({ at: "space", id: (view as { space: string }).space }));

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 min-[960px]:max-w-5xl min-[960px]:pb-6 min-[960px]:pt-6">
      <header className="flex items-center gap-3 pr-14">
        <GameButton tone="neutral" className="grid h-12 w-12 place-items-center rounded-full p-0" onClick={back} aria-label="Back"><ArrowLeft className="h-5 w-5" /></GameButton>
        <h1 className="truncate text-xl font-black">{view.at === "hub" ? "More to Explore" : view.at === "story" ? "حكايات القيم" : `${space?.ar} · ${space?.en}`}</h1>
      </header>
      {view.at === "hub" && <Hub onOpen={(id) => { mark("visited", id); setView({ at: "space", id }); }} />}
      {view.at === "space" && space && <SpaceView space={space} onGame={(g) => setView({ at: "game", space: space.id, game: g })} onSurah={(id) => setView({ at: "surah", space: space.id, id })} onStory={(id) => setView({ at: "story", id })} />}
      {view.at === "game" && space && <GameView key={view.game} game={space.games.find((g) => g.id === view.game)!} onDone={() => setView({ at: "space", id: space.id })} />}
      {view.at === "surah" && <SurahPlayer rec={R[view.id]!} />}
      {view.at === "story" && <StoryView story={STORIES.find((s) => s.id === view.id)!} onSurah={(id) => setView({ at: "surah", space: "stories", id })} />}
    </section>
  );
}

function Hub({ onOpen }: { onOpen: (id: string) => void }) {
  const p = useMemo(loadP, []);
  return (
    <div className="mt-4 grid gap-3 min-[960px]:grid-cols-2">
      <div className="flex items-center gap-3 min-[960px]:col-span-2"><FamilyCharacter name="hamad" className="animate-hamad-float" /><p className="rounded-2xl bg-card px-4 py-3 text-sm font-black shadow-sm">Five places to discover! · خمسة أماكن نكتشفها</p></div>
      {SPACES.map((s) => (
        <button key={s.id} onClick={() => onOpen(s.id)} className={cn(s.bg, "flex min-h-24 items-center gap-4 rounded-3xl px-5 py-4 text-left text-primary-foreground shadow-md transition active:scale-95")}>
          <span className="text-5xl">{s.e}</span>
          <span className="min-w-0 flex-1"><span lang="ar" className="block font-arabic text-2xl font-black">{s.ar}</span><span className="block font-black opacity-90">{s.en}</span></span>
          {p.visited.includes(s.id) && <span className="rounded-full bg-card/30 px-2 py-1 text-xs font-black">✓</span>}
        </button>
      ))}
      <p className="text-center text-xs font-bold text-muted-foreground min-[960px]:col-span-2">{p.heard.length} surahs heard · {p.games.length} games played</p>
    </div>
  );
}

function Burst({ n }: { n: number }) {
  return n ? <div key={n} className="pointer-events-none absolute inset-0 grid place-items-center">{["⭐", "✨", "🌟"].map((s, i) => <span key={i} className="animate-bloom absolute text-4xl" style={{ animationDelay: `${i * 120}ms`, left: `${30 + i * 20}%` }}>{s}</span>)}</div> : null;
}

function SpaceView({ space, onGame, onSurah, onStory }: { space: Space; onGame: (id: string) => void; onSurah: (id: string) => void; onStory: (id: string) => void }) {
  return (
    <div className="mt-4 grid gap-4">
      <div className="flex items-center gap-3"><FamilyCharacter name={space.guide} className="animate-hamad-float" /><p className="rounded-2xl bg-card px-4 py-3 text-sm font-black shadow-sm">{space.hello}</p></div>
      {space.id === "market" ? <Market /> : space.id === "stories" ? (
        <div className="grid gap-3">{STORIES.map((s) => (
          <button key={s.id} onClick={() => onStory(s.id)} className="bg-space-stories flex items-center gap-4 rounded-3xl px-5 py-4 text-left text-primary-foreground shadow-md active:scale-95">
            <span className="text-4xl">{s.e}</span><span><span lang="ar" className="block font-arabic text-2xl font-black">{s.ar}</span><span className="font-black">{s.en} — {s.desc}</span></span>
          </button>))}</div>
      ) : <Playground space={space} />}
      <div>
        <h2 className="mb-2 font-black">Mini-games · ألعاب</h2>
        <div className="grid grid-cols-2 gap-3">{space.games.map((g) => (
          <GameButton key={g.id} tone="sky" className="min-h-20 px-3" onClick={() => onGame(g.id)}><span><span lang="ar" className="block font-arabic text-lg">{g.ar}</span><span className="text-sm">{g.en}</span></span></GameButton>
        ))}</div>
      </div>
      <div>
        <h2 className="mb-2 font-black">Listen · استمع</h2>
        <div className="grid gap-2">{space.surahs.map((id) => (
          <button key={id} onClick={() => onSurah(id)} className={cn(space.bg, "flex min-h-14 items-center gap-3 rounded-2xl px-4 text-left font-black text-primary-foreground shadow active:scale-95")}>
            <Music className="h-5 w-5" /><span className="flex-1">Sing Along 🎵 · {R[id]!.en}</span><span lang="ar" className="font-arabic text-xl">{R[id]!.ar}</span>
          </button>))}</div>
      </div>
    </div>
  );
}

function Playground({ space }: { space: Space }) {
  const [state, setState] = useState<Record<string, number>>({});
  const [tray, setTray] = useState<string[]>([]);
  const adhanRef = useRef<HTMLAudioElement | null>(null);
  const [adhanOn, setAdhanOn] = useState(false);
  useEffect(() => () => { adhanRef.current?.pause(); }, []);
  const toggleAdhan = () => {
    if (adhanRef.current && !adhanRef.current.paused) { adhanRef.current.pause(); adhanRef.current.currentTime = 0; setAdhanOn(false); return; }
    const a = adhanRef.current ?? new Audio(adhanAsset.url);
    adhanRef.current = a; a.onended = () => setAdhanOn(false);
    a.play().then(() => setAdhanOn(true)).catch(() => setAdhanOn(false));
  };
  return (
    <div className={cn(space.bg, "relative overflow-hidden rounded-3xl p-4 shadow-md")}>
      {space.id === "garden" && <span className="animate-drift-cloud pointer-events-none absolute top-1 text-4xl opacity-80">☁️</span>}
      {space.trayLabel && (
        <div className="mb-3 rounded-2xl bg-card/90 px-3 py-2 text-sm font-black">{space.trayLabel}: {tray.length}<div className="mt-1 min-h-7 text-2xl leading-7">{tray.slice(-14).join(" ") || "…"}</div></div>
      )}
      <div className="grid grid-cols-3 gap-3 pt-6">
        {space.toys.map((t) => {
          const n = state[t.id] ?? 0;
          const isAdhan = t.id === "minaret";
          const on = isAdhan ? adhanOn : t.fx === "toggle" ? n % 2 === 1 : n > 0;
          return (
            <button key={t.id} onClick={() => { if (isAdhan) { toggleAdhan(); return; } sfx(t.sfx); setState((s) => ({ ...s, [t.id]: t.fx === "count33" ? (n % 33) + 1 : n + 1 })); if (t.add) setTray((x) => [...x, t.add![n % t.add!.length]!]); }}
              aria-pressed={isAdhan ? adhanOn : undefined}
              className={cn("relative grid min-h-28 place-items-center rounded-2xl bg-card/85 p-2 font-black shadow transition active:scale-90", (t.fx === "toggle" || isAdhan) && on && "bg-primary/90 shadow-[0_0_30px] shadow-primary")}>
              <span className={cn("text-5xl", t.fx === "unroll" && on && "animate-unroll", isAdhan && on && "animate-character-speak")} key={t.fx === "unroll" ? n : undefined}>{t.e}</span>
              {t.fx === "ripple" && n > 0 && <span key={n} className="animate-ripple absolute h-12 w-12 rounded-full border-4 border-card" />}
              {t.fx === "bloom" && n > 0 && <span key={n} className="animate-bloom absolute text-3xl">🌺</span>}
              <span className="grid text-center text-xs leading-tight"><span lang="ar" className="font-arabic text-sm">{t.ar}</span><span>{isAdhan ? (on ? "Tap to stop" : "Adhan") : t.en}</span></span>
              {t.fx === "count33" && n > 0 && <span className="absolute right-1 top-1 rounded-full bg-primary px-2 text-sm text-primary-foreground">{n}</span>}
              {t.fx === "bloom" && n > 0 && <span className="absolute right-1 top-1 rounded-full bg-primary px-2 text-xs text-primary-foreground">{n}</span>}
            </button>
          );
        })}
      </div>
      {space.id === "mosque" && <p className="mt-3 text-center text-[10px] font-bold opacity-80">Adhan: Aaqib Azeez, via Wikimedia Commons (CC BY-SA 4.0)</p>}
    </div>
  );
}

const STALLS = [{ e: "🌴", ar: "تمر", en: "Dates", price: 2 }, { e: "🍞", ar: "خبز", en: "Bread", price: 1 }, { e: "🍯", ar: "عسل", en: "Honey", price: 3 }, { e: "🫒", ar: "زيتون", en: "Olives", price: 2 }];
function Market() {
  const [coins, setCoins] = useState(10); const [basket, setBasket] = useState<string[]>([]); const [msg, setMsg] = useState("");
  return (
    <div className="bg-space-market rounded-3xl p-4 shadow-md">
      <div className="mb-3 grid gap-1 rounded-2xl bg-card/90 px-3 py-2 font-black">
        <span>💰 Your coins: {coins} قرش</span>
        <span>🛒 Your basket: {basket.length} items</span>
        <span className="min-h-7 text-2xl">{basket.join(" ") || <span className="text-sm opacity-70">Buy items from the stalls!</span>}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">{STALLS.map((s) => (
        <button key={s.en} onClick={() => { if (coins < s.price) { setMsg("Not enough coins! Try another item"); return; } sfx("coin"); setCoins(coins - s.price); setBasket((b) => [...b, s.e]); setMsg(""); }}
          className="grid min-h-28 place-items-center rounded-2xl bg-card/90 p-2 font-black shadow active:scale-90">
          <span className="text-xs opacity-60">⛱️</span><span className="text-5xl">{s.e}</span><span><span lang="ar" className="font-arabic">{s.ar}</span> · {s.en}</span><span className="text-sm">{s.price} قرش</span>
        </button>))}</div>
      {msg && <p className="mt-3 rounded-xl bg-card px-3 py-2 text-center font-black">{msg}</p>}
      <GameButton tone="neutral" className="mt-3 w-full" onClick={() => { setCoins(10); setBasket([]); setMsg(""); }}>Start again · من جديد</GameButton>
    </div>
  );
}

function Win({ text, onDone, again }: { text: string; onDone: () => void; again: () => void }) {
  useEffect(() => sfx("yay"), []);
  return (
    <div className="relative mt-8 grid place-items-center gap-4 text-center">
      <Burst n={1} /><FamilyCharacter name="hamad" size="hero" className="animate-hamad-cheer" />
      <p className="text-2xl font-black">✓ {text}</p>
      <div className="grid w-full grid-cols-2 gap-3"><GameButton tone="mint" onClick={again}>Again · مرة أخرى</GameButton><GameButton tone="sun" onClick={onDone}>Done · تم</GameButton></div>
    </div>
  );
}

function GameView({ game, onDone }: { game: Game; onDone: () => void }) {
  const [round, setRound] = useState(0);
  const [won, setWon] = useState(false);
  const win = () => { mark("games", game.id); setWon(true); };
  if (won) return <Win text={game.right} onDone={onDone} again={() => { setWon(false); setRound((r) => r + 1); }} />;
  const k = `${game.id}-${round}`;
  return (
    <div className="mt-4">
      <h2 className="text-center text-2xl font-black"><span lang="ar" className="font-arabic">{game.ar}</span> · {game.en}</h2>
      {game.kind === "order" && <OrderGame key={k} game={game} onWin={win} />}
      {game.kind === "match" && <MatchGame key={k} game={game} onWin={win} />}
      {game.kind === "collect" && <CollectGame key={k} game={game} onWin={win} />}
      {game.kind === "choice" && <ChoiceGame key={k} game={game} onWin={win} />}
      {game.kind === "give" && <GiveGame key={k} onWin={win} />}
    </div>
  );
}

const Tile = ({ it, onClick, done, big }: { it: Item; onClick?: () => void; done?: boolean; big?: boolean }) => (
  <button onClick={onClick} disabled={done} className={cn("grid min-h-24 place-items-center rounded-2xl bg-card p-2 font-black shadow transition active:scale-90", done && "opacity-40", big && "min-h-28")}>
    {it.e && <span className="text-4xl">{it.e}</span>}<span lang="ar" className="font-arabic text-lg">{it.ar}</span><span className="text-xs">{it.en}</span>
  </button>
);

function OrderGame({ game, onWin }: { game: Extract<Game, { kind: "order" }>; onWin: () => void }) {
  const tiles = useMemo(() => shuffle(game.items), [game]);
  const [picked, setPicked] = useState<Item[]>([]); const [msg, setMsg] = useState(game.prompt);
  const tap = (it: Item) => {
    if (it === game.items[picked.length]) { sfx("pop"); const next = [...picked, it]; setPicked(next); setMsg("Yes! نعم"); if (next.length === game.items.length) setTimeout(onWin, 500); }
    else { sfx("click"); setMsg(game.wrong); }
  };
  return (
    <div className="mt-4 grid gap-4">
      <p className="rounded-2xl bg-card px-4 py-3 text-center font-black">{msg}</p>
      <div className="flex min-h-16 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-4xl">{picked.map((p) => <span key={p.en} className="animate-pop-in">{p.e}</span>)}{picked.length < game.items.length && <span className="opacity-30">…</span>}</div>
      <div className="grid grid-cols-2 gap-3">{tiles.map((t) => <Tile key={t.en} it={t} big done={picked.includes(t)} onClick={() => tap(t)} />)}</div>
    </div>
  );
}

function MatchGame({ game, onWin }: { game: Extract<Game, { kind: "match" }>; onWin: () => void }) {
  const left = useMemo(() => shuffle(game.pairs), [game]); const right = useMemo(() => shuffle(game.pairs), [game]);
  const [sel, setSel] = useState<number | null>(null); const [done, setDone] = useState<number[]>([]); const [msg, setMsg] = useState(game.prompt);
  const tapRight = (p: (typeof game.pairs)[number]) => {
    if (sel === null) { setMsg("First tap one on the left 👈"); return; }
    if (left[sel] === p) { sfx("pop"); const d = [...done, game.pairs.indexOf(p)]; setDone(d); setSel(null); setMsg("Yes! نعم"); if (d.length === game.pairs.length) setTimeout(onWin, 500); }
    else { sfx("click"); setMsg("Try another one 🙂"); }
  };
  return (
    <div className="mt-4 grid gap-4">
      <p className="rounded-2xl bg-card px-4 py-3 text-center font-black">{msg}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-3">{left.map((p, i) => <div key={i} className={cn("rounded-2xl", sel === i && "ring-4 ring-primary")}><Tile it={p.a} done={done.includes(game.pairs.indexOf(p))} onClick={() => { sfx("click"); setSel(i); }} /></div>)}</div>
        <div className="grid gap-3">{right.map((p, i) => <Tile key={i} it={p.b} done={done.includes(game.pairs.indexOf(p))} onClick={() => tapRight(p)} />)}</div>
      </div>
    </div>
  );
}

function CollectGame({ game, onWin }: { game: Extract<Game, { kind: "collect" }>; onWin: () => void }) {
  const [got, setGot] = useState<Item[]>([]);
  return (
    <div className="mt-4 grid gap-4">
      <p className="rounded-2xl bg-card px-4 py-3 text-center font-black">{game.prompt}</p>
      <div className="grid min-h-20 place-items-center rounded-2xl bg-space-home p-2 text-3xl">🧺 {got.map((g) => <span key={g.en} className="animate-pop-in">{g.e}</span>)}</div>
      <div className="grid grid-cols-3 gap-3">{game.items.map((t) => <Tile key={t.en} it={t} done={got.includes(t)} onClick={() => { sfx("pop"); const n = [...got, t]; setGot(n); if (n.length === game.items.length) setTimeout(onWin, 500); }} />)}</div>
    </div>
  );
}

function ChoiceGame({ game, onWin }: { game: Extract<Game, { kind: "choice" }>; onWin: () => void }) {
  const rounds = useMemo(() => game.rounds(), [game]); const [i, setI] = useState(0); const [msg, setMsg] = useState("");
  const r = rounds[i]!;
  return (
    <div className="mt-4 grid gap-4">
      <p className="rounded-2xl bg-card px-4 py-3 text-center font-black">{r.q}</p>
      <div className="bg-space-garden grid min-h-28 place-items-center rounded-3xl p-3 text-center text-4xl leading-relaxed">{r.show}</div>
      <div className="grid grid-cols-3 gap-3">{r.options.map((o) => (
        <GameButton key={o} tone="neutral" className="min-h-20 text-2xl" onClick={() => { if (o === r.answer) { sfx("pop"); setMsg(""); if (i + 1 === rounds.length) onWin(); else setI(i + 1); } else { sfx("click"); setMsg("Let's count again together 🙂"); } }}>{o}</GameButton>
      ))}</div>
      {msg && <p className="text-center font-black">{msg}</p>}
      <p className="text-center text-sm font-bold text-muted-foreground">{i + 1} / {rounds.length}</p>
    </div>
  );
}

function GiveGame({ onWin }: { onWin: () => void }) {
  const [given, setGiven] = useState(false);
  return (
    <div className="mt-4 grid gap-4 text-center">
      <p className="rounded-2xl bg-card px-4 py-3 font-black">You have 3 dates. Give 1 to someone in need · أعطِ تمرة</p>
      <div className="flex justify-center gap-3 text-5xl">{Array.from({ length: given ? 2 : 3 }, (_, i) => <button key={i} onClick={() => { if (!given) { sfx("warm"); setGiven(true); setTimeout(onWin, 900); } }} className="active:scale-90">🌴</button>)}</div>
      <p className="font-black">Tap a date 👆</p>
      <div className="grid place-items-center gap-1 rounded-3xl bg-muted p-4"><span className="text-6xl grayscale">👤</span>{given && <span className="animate-pop-in text-4xl">🌴 😊</span>}</div>
    </div>
  );
}

function StoryView({ story, onSurah }: { story: (typeof STORIES)[number]; onSurah: (id: string) => void }) {
  const [step, setStep] = useState(0); const [party, setParty] = useState(0);
  useEffect(() => { if (step < story.steps.length - 1) { const t = setTimeout(() => setStep((s) => s + 1), 1400); return () => clearTimeout(t); } return undefined; }, [step, story]);
  return (
    <div className="relative mt-4 grid gap-4">
      <Burst n={party} />
      <h2 className="text-center"><span lang="ar" className="block font-arabic text-4xl font-black">{story.ar}</span><span className="font-black">{story.en} — {story.desc}</span></h2>
      <div className="bg-space-stories grid grid-cols-4 gap-2 rounded-3xl p-4" style={{ filter: `brightness(${0.6 + step * 0.15})` }}>
        {story.steps.map(([e, l], i) => (
          <div key={l} className={cn("grid place-items-center gap-1 rounded-2xl bg-card/85 p-2 text-center transition-all duration-700", i > step ? "opacity-20" : "animate-pop-in")}>
            <span className="text-4xl">{e}</span><span className="text-xs font-black">{l}</span>
          </div>))}
      </div>
      <div className="grid place-items-center"><span className="text-7xl grayscale transition-transform duration-700" style={{ transform: `translateY(${(3 - step) * 6}px) scale(${1 + step * 0.08})` }}>👤</span></div>
      <div className="grid grid-cols-2 gap-3">
        <GameButton tone="sun" onClick={() => { sfx("yay"); setParty((p) => p + 1); setStep(0); }}>🎉 Celebrate</GameButton>
        <GameButton tone="berry" onClick={() => onSurah(story.surah)}>🎵 Listen</GameButton>
      </div>
      {party > 0 && <div className="flex justify-center gap-2"><FamilyCharacter name="hamad" size="small" className="animate-hamad-cheer" /><FamilyCharacter name="talal" size="small" className="animate-hamad-cheer" /></div>}
    </div>
  );
}

function SurahPlayer({ rec }: { rec: Recitation }) {
  const [cur, setCur] = useState<number | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const stop = () => { audio.current?.pause(); audio.current = null; setCur(null); };
  useEffect(() => stop, []);
  const playFrom = (i: number) => {
    audio.current?.pause();
    if (i >= rec.verses.length) { setCur(null); mark("heard", rec.id); return; }
    const a = new Audio(rec.verses[i]!.audio); audio.current = a; setCur(i);
    a.onended = () => { if (audio.current === a) playFrom(i + 1); };
    a.play().catch(() => setCur(null));
  };
  const sing = () => {
    stop();
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(rec.song.join(". ")); u.lang = "en-US"; u.rate = 0.85; u.pitch = 1.2; speechSynthesis.speak(u);
  };
  return (
    <div className="mt-4 grid gap-4">
      <div className="flex items-center gap-3"><FamilyCharacter name="hamad" speaking={cur !== null} className="animate-hamad-float" /><div><p lang="ar" className="font-arabic text-3xl font-black">سورة {rec.ar}</p><p className="font-black">Surah {rec.en} · {rec.note}</p><p className="text-xs font-bold text-muted-foreground">Recited by Ahmad Al-Nufais</p></div></div>
      <GameButton tone={cur === null ? "mint" : "neutral"} className="min-h-14" onClick={() => (cur === null ? playFrom(0) : stop())}>
        <span className="inline-flex items-center gap-2">{cur === null ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}{cur === null ? "Listen · استمع" : "Stop · توقف"}</span>
      </GameButton>
      <div dir="rtl" className="grid gap-2">{rec.verses.map((v, i) => (
        <button key={v.key} onClick={() => playFrom(i)} className={cn("rounded-2xl bg-card px-4 py-3 text-right font-quran text-2xl leading-loose shadow-sm transition", cur === i && "bg-primary/20 ring-4 ring-primary")}>
          {v.arabic} <span className="text-base text-muted-foreground">﴿{v.key.split(":")[1]}﴾</span>
        </button>))}</div>
      <div className="rounded-3xl border-2 border-dashed border-border p-4">
        <p className="text-xs font-black uppercase text-muted-foreground">Kids' song about this surah — not Qur'an</p>
        {rec.song.map((l) => <p key={l} className="mt-1 text-lg font-black">🎵 {l}</p>)}
        <GameButton tone="sun" className="mt-3 w-full" onClick={sing}>Sing along 🎵</GameButton>
      </div>
    </div>
  );
}
