// Level 7 — الألف الصغيرة والياء الصغيرة والواو الصغيرة (Qaida lesson 7, book p. 13).
// A small letter sits above or below the base letter and lengthens its vowel:
//   small alif (ٰ, U+0670) on fatha   → بَٰ  "bā"
//   small waw  (ۥ, U+06E5) on damma   → بُۥ  "bū"
//   small ya   (ۦ, U+06E6) on kasra   → بِۦ  "bī"
// Rows follow the book's grid (p. 13), read right to left. Distractors are the same letter without the
// small letter, so the child must hear and see the extra letter. Reading only: no madd length rules.
import type { ActivitySpec, NooraniItem, NooraniSkill, NooraniUnit } from "./types";

const FATHA = "َ";
const DAMMA = "ُ";
const KASRA = "ِ";
const SMALL_ALIF = "ٰ";
const SMALL_WAW = "ۥ";
const SMALL_YA = "ۦ";

const item = (glyph: string, id: string, en: string, alternates: NooraniItem[] = []): NooraniItem => ({
  id,
  glyph,
  say: glyph,
  en,
  alternates,
});

/** Small alif on fatha. Distractors: the plain fatha and the plain damma on the same letter. */
const alifRow = (letters: [string, string][]) =>
  letters.map(([g, n]) => {
    const plainFatha = item(`${g}${FATHA}`, `${n}-fatha`, `${n} · fatha`);
    const plainDamma = item(`${g}${DAMMA}`, `${n}-damma`, `${n} · damma`);
    return item(`${g}${FATHA}${SMALL_ALIF}`, `${n}-alif`, `${n} · fatha + small alif`, [
      plainFatha,
      plainDamma,
    ]);
  });

const row1 = alifRow([
  ["ب", "ba"],
  ["ي", "ya"],
  ["ر", "ra"],
  ["م", "mim"],
  ["ل", "lam"],
  ["و", "waw"],
  ["ن", "nun"],
]);
const row2 = alifRow([
  ["ء", "hamza"],
  ["ه", "ha"],
  ["ع", "ayn"],
  ["ح", "haa"],
  ["غ", "ghayn"],
  ["خ", "kha"],
  ["ت", "ta"],
]);
const row3 = alifRow([
  ["ش", "shin"],
  ["س", "sin"],
  ["ز", "zay"],
  ["ذ", "dhal"],
  ["د", "dal"],
  ["ج", "jim"],
  ["ث", "tha"],
]);
const row4 = alifRow([
  ["ك", "kaf"],
  ["ق", "qaf"],
  ["ف", "fa"],
  ["ظ", "zha"],
  ["ط", "ta2"],
  ["ض", "dad"],
  ["ص", "sad"],
]);

/** Small waw on damma and small ya on kasra (bottom of the grid). Distractors: plain damma, plain kasra. */
const waw = (g: string, n: string) =>
  item(`${g}${DAMMA}${SMALL_WAW}`, `${n}-waw`, `${n} · damma + small waw`, [
    item(`${g}${DAMMA}`, `${n}-damma2`, `${n} · damma`),
    item(`${g}${KASRA}`, `${n}-kasra2`, `${n} · kasra`),
  ]);
const ya = (g: string, n: string) =>
  item(`${g}${KASRA}${SMALL_YA}`, `${n}-ya`, `${n} · kasra + small ya`, [
    item(`${g}${KASRA}`, `${n}-kasra3`, `${n} · kasra`),
    item(`${g}${DAMMA}`, `${n}-damma3`, `${n} · damma`),
  ]);
const bottomWaw = [waw("ع", "ayn"), waw("ه", "ha3"), waw("و", "waw2")];
const bottomYa = [ya("ه", "ha4"), ya("\u0625", "hamza-ya")];

const session = (rounds: number): ActivitySpec[] => [
  { type: "listenFind", rounds, difficulty: 1, choices: 3, prompt: "listenFind" },
  { type: "readChoose", rounds: 4, difficulty: 2, choices: 3, prompt: "readIt" },
  { type: "challenge", rounds: 6, difficulty: 2, choices: 3 },
  { type: "review", rounds: 6, difficulty: 2, choices: 3 },
];

const skill = (id: string, items: NooraniItem[], en: string, rounds: number): NooraniSkill => ({
  id,
  ar: items.slice(0, 3).map((i) => i.glyph).join(" "),
  en,
  itemIds: items.map((i) => i.id),
  activities: session(rounds),
});

export const unit7Small: NooraniUnit = {
  id: "u7-small",
  level: 7,
  ar: "الْأَلِفُ وَالْيَاءُ وَالْوَاوُ الصَّغِيرَة",
  en: "Small alif, ya, waw",
  source: {
    book: "القاعدة النورانية",
    lesson: 7,
    ar: "الدَّرْسُ السَّابِع: الْأَلِفُ الصَّغِيرَةُ وَالْيَاءُ الصَّغِيرَةُ وَالْوَاوُ الصَّغِيرَة",
    en: "Qaida lesson 7 — small alif, small ya and small waw (book p. 13)",
    note: "Small letters are drawn as the book's grid shows (p. 13): small alif on fatha; small waw on damma; small ya on kasra.",
  },
  items: [...row1, ...row2, ...row3, ...row4, ...bottomWaw, ...bottomYa],
  skills: [
    skill("u7-g1", row1, "بَٰ · يَٰ · رَٰ · مَٰ", 6),
    skill("u7-g2", row2, "Hamza to ta", 6),
    skill("u7-g3", row3, "Shin to tha", 6),
    skill("u7-g4", row4, "Kaf to sad", 6),
    skill("u7-g5", [...bottomWaw, ...bottomYa], "Small waw and small ya", 6),
  ],
  completion: [
    { ar: "الْأَلِفُ الصَّغِيرَة", en: "Small alif" },
    { ar: "الْوَاوُ الصَّغِيرَة", en: "Small waw" },
    { ar: "الْيَاءُ الصَّغِيرَة", en: "Small ya" },
  ],
};
