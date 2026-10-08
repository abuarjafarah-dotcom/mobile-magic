// Arabic learning path. Add items or units here — the lesson engine builds every exercise from this data.
// Each item's `say` text is the exact voweled Arabic used for its audio clip (key = `${unit}-${id}`).
import type { WordPicture } from "./arabic";

export type ShapeId = "circle" | "square" | "triangle" | "rectangle" | "star" | "heart" | "oval" | "diamond" | "crescent";
export type FamilyId = "hamad" | "talal" | "yousef" | "mama" | "baba";
export type Visual =
  | { kind: "color"; value: string }
  | { kind: "shape"; shape: ShapeId; color?: string }
  | { kind: "animal"; animal: string }
  | { kind: "family"; who: FamilyId | "family" | "brother" | "sister" | "child" }
  | { kind: "picture"; picture: WordPicture };

export type CurriculumItem = {
  id: string;
  ar: string; // what the child sees
  say: string; // voweled text for the audio clip
  en: string; // parent-only meaning
  visual?: Visual;
  forms?: [string, string, string, string] | undefined; // isolated, beginning, middle, end
  example?: { ar: string; say: string };
  letters?: string[];
  answer?: string; // for animal sounds: the sound text
};

export type ExerciseKind = "learn" | "listen" | "pickWord" | "pickVisual" | "match" | "trace" | "formsFind" | "formsMiddle" | "order" | "neighbor" | "build" | "listenBuild" | "read" | "soundPick" | "combo";
export type Guide = FamilyId;
export type UnitId = "letters" | "harakat" | "forms" | "colors" | "shapes" | "animals" | "sounds" | "words" | "reading" | "days" | "months" | "family";
export type Unit = { id: UnitId; level: number; ar: string; en: string; guide: Guide; tone: "sun" | "sky" | "mint" | "berry"; chunk: number; kinds: ExerciseKind[]; items: CurriculumItem[] };

const L = (id: string, ar: string, name: string, en: string, ex: string, exSay: string): CurriculumItem => {
  const joins = !["ا", "د", "ذ", "ر", "ز", "و"].includes(ar);
  return { id, ar, say: name, en, example: { ar: ex, say: exSay }, forms: joins ? [ar, `${ar}ـ`, `ـ${ar}ـ`, `ـ${ar}`] : undefined };
};

const letters: CurriculumItem[] = [
  L("alif", "ا", "أَلِف", "Alif", "أرنب", "أَرْنَب"),
  L("ba", "ب", "بَاء", "Ba", "باب", "بَاب"),
  L("ta", "ت", "تَاء", "Ta", "تفاحة", "تُفَّاحَة"),
  L("tha", "ث", "ثَاء", "Tha", "ثعلب", "ثَعْلَب"),
  L("jim", "ج", "جِيم", "Jim", "جمل", "جَمَل"),
  L("hha", "ح", "حَاء", "Ha", "حصان", "حِصَان"),
  L("kha", "خ", "خَاء", "Kha", "خروف", "خَرُوف"),
  L("dal", "د", "دَال", "Dal", "دب", "دُبّ"),
  L("dhal", "ذ", "ذَال", "Dhal", "ذرة", "ذُرَة"),
  L("ra", "ر", "رَاء", "Ra", "رمان", "رُمَّان"),
  L("zay", "ز", "زَاي", "Zay", "زرافة", "زَرَافَة"),
  L("sin", "س", "سِين", "Sin", "سمكة", "سَمَكَة"),
  L("shin", "ش", "شِين", "Shin", "شمس", "شَمْس"),
  L("sad", "ص", "صَاد", "Sad", "صقر", "صَقْر"),
  L("dad", "ض", "ضَاد", "Dad", "ضفدع", "ضِفْدَع"),
  L("tta", "ط", "طَاء", "Ta (heavy)", "طائرة", "طَائِرَة"),
  L("zza", "ظ", "ظَاء", "Dha (heavy)", "ظرف", "ظَرْف"),
  L("ayn", "ع", "عَيْن", "Ayn", "عين", "عَيْن"),
  L("ghayn", "غ", "غَيْن", "Ghayn", "غيمة", "غَيْمَة"),
  L("fa", "ف", "فَاء", "Fa", "فيل", "فِيل"),
  L("qaf", "ق", "قَاف", "Qaf", "قطة", "قِطَّة"),
  L("kaf", "ك", "كَاف", "Kaf", "كلب", "كَلْب"),
  L("lam", "ل", "لَام", "Lam", "ليمون", "لَيْمُون"),
  L("mim", "م", "مِيم", "Mim", "موز", "مَوْز"),
  L("nun", "ن", "نُون", "Nun", "نجمة", "نَجْمَة"),
  L("ha", "ه", "هَاء", "Ha (soft)", "هلال", "هِلَال"),
  L("waw", "و", "وَاو", "Waw", "وردة", "وَرْدَة"),
  L("ya", "ي", "يَاء", "Ya", "يد", "يَد"),
];

const S = (id: string, ar: string, en: string): CurriculumItem => ({ id, ar, say: ar, en });
const harakat: CurriculumItem[] = [
  S("ba-a", "بَ", "ba (fatha)"), S("ba-i", "بِ", "bi (kasra)"), S("ba-u", "بُ", "bu (damma)"),
  S("ma-a", "مَ", "ma"), S("ma-i", "مِ", "mi"), S("ma-u", "مُ", "mu"),
  S("ta-a", "تَ", "ta"), S("ta-i", "تِ", "ti"), S("ta-u", "تُ", "tu"),
  S("baba", "بَابَا", "baba (ba + ba)"), S("mama", "مَامَا", "mama (ma + ma)"), S("dada", "دَادَا", "dada"),
  S("ab-s", "أَبْ", "ab (sukun)"), S("um-s", "أُمْ", "um (sukun)"), S("min-s", "مِنْ", "min (sukun)"),
  S("rabba", "رَبَّ", "rabba (shadda)"), S("umma", "أُمَّ", "umma (shadda)"), S("sukkar", "سُكَّر", "sukkar (shadda)"),
  S("ban", "بً", "ban (tanween fath)"), S("bin", "بٍ", "bin (tanween kasr)"), S("bun", "بٌ", "bun (tanween damm)"),
];

const formLetters = ["ba", "ta", "jim", "sin", "ayn", "fa", "kaf", "lam", "mim", "nun", "ha", "ya"];
const forms = letters.filter((l) => formLetters.includes(l.id)).map((l) => ({ ...l }));

const C = (id: string, ar: string, say: string, en: string, value: string): CurriculumItem => ({ id, ar, say, en, visual: { kind: "color", value } });
const colors: CurriculumItem[] = [
  C("red", "أحمر", "أَحْمَر", "red", "#e0433a"), C("blue", "أزرق", "أَزْرَق", "blue", "#2f6fd6"), C("yellow", "أصفر", "أَصْفَر", "yellow", "#f5c72e"),
  C("green", "أخضر", "أَخْضَر", "green", "#3aa655"), C("orange", "برتقالي", "بُرْتُقَالِيّ", "orange", "#f28a2e"), C("purple", "بنفسجي", "بَنَفْسَجِيّ", "purple", "#8a4fc7"),
  C("pink", "وردي", "وَرْدِيّ", "pink", "#f28bb8"), C("brown", "بني", "بُنِّيّ", "brown", "#8b5a2b"), C("black", "أسود", "أَسْوَد", "black", "#222222"),
  C("white", "أبيض", "أَبْيَض", "white", "#ffffff"), C("gray", "رمادي", "رَمَادِيّ", "gray", "#9a9a9a"),
  C("gold", "ذهبي", "ذَهَبِيّ", "gold", "#d4a62a"), C("silver", "فضي", "فِضِّيّ", "silver", "#c4c8cc"), C("turquoise", "تركوازي", "تُرْكُوَازِيّ", "turquoise", "#34c3c9"),
  C("teal", "فيروزي", "فَيْرُوزِيّ", "turquoise/teal", "#1f9c9c"), C("navy", "كحلي", "كُحْلِيّ", "navy", "#1d2d5c"), C("sky", "سماوي", "سَمَاوِيّ", "sky blue", "#8ecdf5"),
  C("olive", "زيتي", "زَيْتِيّ", "olive", "#7a7f2e"), C("beige", "بيج", "بِيج", "beige", "#e6d3b0"), C("maroon", "عنابي", "عُنَّابِيّ", "burgundy", "#7d1f35"),
];

const Sh = (id: ShapeId, ar: string, say: string, en: string): CurriculumItem => ({ id, ar, say, en, visual: { kind: "shape", shape: id } });
const shapes: CurriculumItem[] = [
  Sh("circle", "دائرة", "دَائِرَة", "circle"), Sh("square", "مربع", "مُرَبَّع", "square"), Sh("triangle", "مثلث", "مُثَلَّث", "triangle"),
  Sh("rectangle", "مستطيل", "مُسْتَطِيل", "rectangle"), Sh("star", "نجمة", "نَجْمَة", "star"), Sh("heart", "قلب", "قَلْب", "heart"),
  Sh("oval", "بيضاوي", "بَيْضَاوِيّ", "oval"), Sh("diamond", "معين", "مُعَيَّن", "diamond"), Sh("crescent", "هلال", "هِلَال", "crescent"),
];

/** Colour + shape questions: "أَيْنَ الْمُثَلَّثُ الْأَحْمَرُ؟" (masculine shapes/colours only, so grammar stays correct). */
export const combos = (["square", "triangle", "heart"] as const).flatMap((shape) =>
  (["red", "blue", "yellow", "green"] as const).map((color) => {
    const s = { square: ["المربع", "الْمُرَبَّعُ"], triangle: ["المثلث", "الْمُثَلَّثُ"], heart: ["القلب", "الْقَلْبُ"] }[shape];
    const c = { red: ["الأحمر", "الْأَحْمَرُ"], blue: ["الأزرق", "الْأَزْرَقُ"], yellow: ["الأصفر", "الْأَصْفَرُ"], green: ["الأخضر", "الْأَخْضَرُ"] }[color];
    return { id: `${shape}-${color}`, shape, color, ar: `أين ${s[0]} ${c[0]}؟`, say: `أَيْنَ ${s[1]} ${c[1]}؟` };
  }),
);

const A = (id: string, ar: string, say: string, en: string): CurriculumItem => ({ id, ar, say, en, visual: { kind: "animal", animal: id } });
const animals: CurriculumItem[] = [
  A("cat", "قطة", "قِطَّة", "cat"), A("dog", "كلب", "كَلْب", "dog"), A("lion", "أسد", "أَسَد", "lion"), A("elephant", "فيل", "فِيل", "elephant"),
  A("giraffe", "زرافة", "زَرَافَة", "giraffe"), A("horse", "حصان", "حِصَان", "horse"), A("cow", "بقرة", "بَقَرَة", "cow"), A("sheep", "خروف", "خَرُوف", "sheep"),
  A("rabbit", "أرنب", "أَرْنَب", "rabbit"), A("bird", "طائر", "طَائِر", "bird"), A("fish", "سمكة", "سَمَكَة", "fish"), A("chicken", "دجاجة", "دَجَاجَة", "chicken"),
  A("mouse", "فأر", "فَأْر", "mouse"), A("monkey", "قرد", "قِرْد", "monkey"), A("bear", "دب", "دُبّ", "bear"),
];

const Snd = (id: string, animal: string, sentence: string, sound: string, en: string): CurriculumItem => ({ id, ar: sound, say: sound, en, answer: sentence, visual: { kind: "animal", animal } });
const sounds: CurriculumItem[] = [
  Snd("cat", "cat", "القطة تقول: مِيَاو", "مِيَاو", "cat says meow"),
  Snd("dog", "dog", "الكلب يقول: هَوْ هَوْ", "هَوْ هَوْ", "dog says woof"),
  Snd("cow", "cow", "البقرة تقول: مُو", "مُو", "cow says moo"),
  Snd("sheep", "sheep", "الخروف يقول: مَاع", "مَاع", "sheep says baa"),
  Snd("horse", "horse", "الحصان يقول: هَحْهَح", "هَحْهَح", "horse neighs"),
  Snd("chicken", "chicken", "الدجاجة تقول: قُوقُو", "قُوقُو", "chicken clucks"),
];

const W = (id: string, ar: string, plain: string, letters: string[], en: string, picture: WordPicture): CurriculumItem => ({ id, ar: plain, say: ar, en, letters, visual: { kind: "picture", picture } });
const words: CurriculumItem[] = [
  W("bab", "بَاب", "باب", ["ب", "ا", "ب"], "door", "door"), W("yad", "يَد", "يد", ["ي", "د"], "hand", "hand"),
  W("ab", "أَب", "أب", ["أ", "ب"], "father", "father"), W("umm", "أُمّ", "أم", ["أ", "م"], "mother", "mother"),
  W("bayt", "بَيْت", "بيت", ["ب", "ي", "ت"], "house", "house"), W("qalam", "قَلَم", "قلم", ["ق", "ل", "م"], "pencil", "pencil"),
  W("walad", "وَلَد", "ولد", ["و", "ل", "د"], "boy", "boy"), W("bint", "بِنْت", "بنت", ["ب", "ن", "ت"], "girl", "girl"),
];
const reading = words.map((w) => ({ ...w, ar: w.say }));

const D = (id: string, ar: string, say: string, en: string): CurriculumItem => ({ id, ar, say, en });
const days: CurriculumItem[] = [
  D("sun", "الأحد", "الْأَحَد", "Sunday"), D("mon", "الإثنين", "الْإِثْنَيْن", "Monday"), D("tue", "الثلاثاء", "الثُّلَاثَاء", "Tuesday"),
  D("wed", "الأربعاء", "الْأَرْبِعَاء", "Wednesday"), D("thu", "الخميس", "الْخَمِيس", "Thursday"), D("fri", "الجمعة", "الْجُمُعَة", "Friday"), D("sat", "السبت", "السَّبْت", "Saturday"),
];
const months: CurriculumItem[] = [
  D("jan", "يناير", "يَنَايِر", "January"), D("feb", "فبراير", "فِبْرَايِر", "February"), D("mar", "مارس", "مَارِس", "March"),
  D("apr", "أبريل", "أَبْرِيل", "April"), D("may", "مايو", "مَايُو", "May"), D("jun", "يونيو", "يُونْيُو", "June"),
  D("jul", "يوليو", "يُولْيُو", "July"), D("aug", "أغسطس", "أُغُسْطُس", "August"), D("sep", "سبتمبر", "سِبْتَمْبِر", "September"),
  D("oct", "أكتوبر", "أُكْتُوبَر", "October"), D("nov", "نوفمبر", "نُوفَمْبِر", "November"), D("dec", "ديسمبر", "دِيسَمْبِر", "December"),
];
/** Ready for a future separate "الشهور الهجرية" unit — never mixed with Gregorian months. */
export const hijriMonths = ["محرّم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];

const F = (id: string, ar: string, say: string, en: string, who: Extract<Visual, { kind: "family" }>["who"]): CurriculumItem => ({ id, ar, say, en, visual: { kind: "family", who } });
const family: CurriculumItem[] = [
  F("hamad", "هذا حمد", "هٰذَا حَمَد", "This is Hamad", "hamad"), F("talal", "هذا طلال", "هٰذَا طَلَال", "This is Talal", "talal"),
  F("yousef", "هذا يوسف", "هٰذَا يُوسُف", "This is Yousef", "yousef"), F("mama", "هذه ماما", "هٰذِهِ مَامَا", "This is Mama", "mama"),
  F("baba", "هذا بابا", "هٰذَا بَابَا", "This is Dad", "baba"), F("brother", "أخي", "أَخِي", "my brother", "brother"),
  F("sister", "أختي", "أُخْتِي", "my sister", "sister"), F("family", "عائلتي", "عَائِلَتِي", "my family", "family"),
  F("child", "طفل", "طِفْل", "child", "child"),
];

export const units: Unit[] = [
  { id: "letters", level: 1, ar: "الحروف", en: "Letters", guide: "hamad", tone: "sun", chunk: 4, kinds: ["learn", "listen", "trace", "listen"], items: letters },
  { id: "harakat", level: 2, ar: "الحركات", en: "Harakat", guide: "talal", tone: "sky", chunk: 3, kinds: ["learn", "listen", "listen"], items: harakat },
  { id: "forms", level: 3, ar: "أشكال الحروف", en: "Letter forms", guide: "hamad", tone: "mint", chunk: 3, kinds: ["learn", "formsFind", "formsMiddle"], items: forms },
  { id: "colors", level: 4, ar: "الألوان", en: "Colors", guide: "mama", tone: "berry", chunk: 4, kinds: ["learn", "listen", "pickWord", "pickVisual", "match"], items: colors },
  { id: "shapes", level: 5, ar: "الأشكال", en: "Shapes", guide: "talal", tone: "sun", chunk: 3, kinds: ["learn", "listen", "pickWord", "pickVisual", "match", "combo"], items: shapes },
  { id: "animals", level: 6, ar: "الحيوانات", en: "Animals", guide: "yousef", tone: "mint", chunk: 4, kinds: ["learn", "listen", "pickWord", "pickVisual", "match"], items: animals },
  { id: "sounds", level: 7, ar: "أصوات الحيوانات", en: "Animal sounds", guide: "yousef", tone: "sky", chunk: 3, kinds: ["learn", "listen", "soundPick", "match"], items: sounds },
  { id: "words", level: 8, ar: "الكلمات", en: "Words", guide: "hamad", tone: "berry", chunk: 4, kinds: ["learn", "pickWord", "pickVisual", "match", "listen"], items: words },
  { id: "reading", level: 9, ar: "القراءة", en: "Reading", guide: "hamad", tone: "sun", chunk: 4, kinds: ["build", "listenBuild", "trace", "read"], items: reading },
  { id: "days", level: 10, ar: "الأيام", en: "Days", guide: "baba", tone: "mint", chunk: 4, kinds: ["learn", "listen", "order", "neighbor"], items: days },
  { id: "months", level: 11, ar: "الشهور الميلادية", en: "Months", guide: "baba", tone: "sky", chunk: 4, kinds: ["learn", "listen", "order", "neighbor"], items: months },
  { id: "family", level: 12, ar: "عائلتي", en: "My family", guide: "mama", tone: "berry", chunk: 3, kinds: ["learn", "listen", "pickVisual", "match"], items: family },
];

export type Lesson = { id: string; unit: UnitId; index: number; review: boolean; items: CurriculumItem[] };

export function unitLessons(unit: Unit): Lesson[] {
  const out: Lesson[] = [];
  for (let i = 0; i < unit.items.length; i += unit.chunk) {
    const items = unit.items.slice(i, i + unit.chunk);
    // Merge a tiny leftover chunk into the previous lesson.
    if (items.length < 2 && out.length) { out[out.length - 1]!.items.push(...items); continue; }
    out.push({ id: `${unit.id}-${out.length + 1}`, unit: unit.id, index: out.length, review: false, items });
  }
  out.push({ id: `${unit.id}-review`, unit: unit.id, index: out.length, review: true, items: unit.items });
  return out;
}

export const allLessons = units.flatMap(unitLessons);
export const unitById = (id: UnitId) => units.find((u) => u.id === id)!;

/** Short Arabic instructions — also voiced. */
export const prompts = {
  listen: { ar: "اسمع واختر", say: "اِسْمَعْ وَاخْتَرْ" },
  tap: { ar: "اضغط واسمع", say: "اِضْغَطْ وَاسْمَعْ" },
  what: { ar: "ما هذا؟", say: "مَا هٰذَا؟" },
  where: { ar: "أين هو؟", say: "أَيْنَ هُوَ؟" },
  match: { ar: "طابق", say: "طَابِقْ" },
  trace: { ar: "اكتب بإصبعك", say: "اُكْتُبْ بِإِصْبَعِكَ" },
  find: { ar: "أين الحرف؟", say: "أَيْنَ الْحَرْفُ؟" },
  middle: { ar: "أيها في الوسط؟", say: "أَيُّهَا فِي الْوَسَطِ؟" },
  order: { ar: "رتب", say: "رَتِّبْ" },
  after: { ar: "ماذا بعد", say: "مَاذَا بَعْدَ" },
  before: { ar: "ماذا قبل", say: "مَاذَا قَبْلَ" },
  build: { ar: "ركّب الكلمة", say: "رَكِّبِ الْكَلِمَةَ" },
  read: { ar: "اقرأ", say: "اِقْرَأْ" },
  sound: { ar: "ماذا يقول؟", say: "مَاذَا يَقُولُ؟" },
  great: { ar: "أحسنت!", say: "أَحْسَنْتَ!" },
  again: { ar: "حاول مرة أخرى", say: "حَاوِلْ مَرَّةً أُخْرَى" },
} as const;
export type PromptId = keyof typeof prompts;

/** Every clip the app can play: key → voweled text. Used to generate and look up audio. */
export function clipTexts(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const u of units) for (const i of u.items) {
    out[`${u.id}-${i.id}`] = i.say;
    if (i.example) out[`${u.id}-${i.id}-ex`] = i.example.say;
  }
  for (const c of combos) out[`combo-${c.id}`] = c.say;
  for (const [k, p] of Object.entries(prompts)) out[`prompt-${k}`] = p.say;
  return out;
}
