// Level 5 — التَّنْوِين (Qaida lessons 5–6, pp. 11–13): ـً ـٍ ـٌ, a vowel with an n-sound ending.
// Fathatan is written with an alif after it, as the Qaida prints it (بًا مًا).
// Combinations are the Qaida's own lesson-6 drills (pp. 12–13), used for decoding only.
// No madd, shadda, ghunnah or waqf rules. Every syllable and word keeps a recording slot.
import type { ActivitySpec, NooraniItem, NooraniSkill, NooraniUnit } from "./types";
import {
  HARAKAT,
  EVERY_MARK,
  MARK,
  TANWEEN,
  VOWELS_AND_TANWEEN,
  blend,
  syl,
  syllablesFor,
} from "./syllables";

/** Tanween syllables, with the six-mark tray for "Add the mark" (َ ً ِ ٍ ُ ٌ). */
const tanweenOn = (letters: string[]) =>
  syllablesFor(letters, TANWEEN).map((s) => {
    // short vowels on the top row, their tanween right under them
    if (s.build?.kind === "mark") s.build = { ...s.build, choices: [...HARAKAT, ...TANWEEN] };
    return s;
  });

const W = (...segs: string[]) => blend(segs);

// ── skill 1: meet the three forms on ب ت م ──
const meetSet = tanweenOn(["ba", "ta", "mim"]);
// ── skill 2: hear, sort, sound ↔ symbol — more letters so the pattern, not one letter, is learned ──
const hearSet = tanweenOn(["mim", "nun", "lam", "dal", "ra", "sin", "kaf"]);
// ── skill 3: read one tanween unit ──
const readOne = tanweenOn(["ba", "nun", "dal", "ra", "kaf", "lam"]);
// ── skill 4: read short combinations from the Qaida's lesson 6 ──
const words = [
  W("alif-a", "hha-a", "dal-un"), // أَحَدٌ
  W("alif-a", "ba-a", "dal-an"), // أَبَدًا
  W("ayn-a", "mim-a", "dal-in"), // عَمَدٍ
  W("sin-u", "ra-u", "ra-un"), // سُرُرٌ
  W("qaf-a", "sin-a", "mim-un"), // قَسَمٌ
  W("kaf-a", "ba-a", "dal-in"), // كَبَدٍ
  W("lam-a", "ha-a", "ba-in"), // لَهَبٍ
  W("lam-u", "ba-a", "dal-an"), // لُبَدًا
];
// ── skill 5: mixed mastery — Levels 2–5 together ──
const marksOn = (l: string) => EVERY_MARK.map((h) => syl(l, h));
const mastery: NooraniItem[] = [
  ...marksOn("ba"),
  ...["ta", "mim", "nun"].flatMap((l) => [
    syl(l, "fatha"),
    syl(l, "sukoon"),
    syl(l, "dammatan"),
    syl(l, "kasratan"),
  ]),
  blend(["ba-a", "ta-i"]), // Level 3
  blend(["mim-a", "nun-o"]), // Level 4 مَنْ
  blend(["lam-i", "mim-o"]), // Level 4 لِمْ
  words[0]!,
  words[3]!,
];

const meetSession: ActivitySpec[] = [
  { type: "meet", rounds: 1, difficulty: 1, mark: TANWEEN, prompt: "tanweenMeet" }, // ـً then ـٍ then ـٌ
  { type: "contrast", rounds: 3, difficulty: 1, variant: "pairs", prompt: "sameEnding" }, // بَ | بًا
  {
    type: "listenFind",
    rounds: 6,
    difficulty: 1,
    choices: 6,
    mark: VOWELS_AND_TANWEEN,
    prompt: "tanweenIdentify",
  },
  { type: "build", rounds: 6, difficulty: 2, prompt: "addTanween" }, // ب + ً
  { type: "review", rounds: 6, difficulty: 2, choices: 3 },
];
const hearSession: ActivitySpec[] = [
  {
    type: "listenFind",
    rounds: 6,
    difficulty: 2,
    choices: 6,
    mark: VOWELS_AND_TANWEEN,
    prompt: "tanweenExact",
  }, // مَ مً مِ مٍ مُ مٌ
  { type: "sort", rounds: 9, difficulty: 2, mark: TANWEEN, prompt: "sortTanween" },
  { type: "symbol", rounds: 6, difficulty: 2, mark: TANWEEN, prompt: "soundSymbol" },
  {
    type: "listenFind",
    rounds: 6,
    difficulty: 3,
    choices: 7,
    mark: EVERY_MARK,
    prompt: "tanweenMixed",
  }, // + sukoon
  { type: "review", rounds: 6, difficulty: 2, choices: 3 },
];
const readOneSession: ActivitySpec[] = [
  {
    type: "readChoose",
    rounds: 5,
    difficulty: 2,
    choices: 3,
    variant: "readFirst",
    mark: VOWELS_AND_TANWEEN,
    prompt: "readTanween",
  },
  {
    type: "challenge",
    rounds: 6,
    difficulty: 2,
    choices: 3,
    mark: VOWELS_AND_TANWEEN,
    prompt: "harakahChallenge",
  },
  { type: "review", rounds: 6, difficulty: 2, choices: 3 },
];
const wordsSession: ActivitySpec[] = [
  { type: "blend", rounds: 4, difficulty: 2, prompt: "readTanweenTogether" },
  {
    type: "readChoose",
    rounds: 5,
    difficulty: 3,
    choices: 3,
    variant: "readFirst",
    mark: VOWELS_AND_TANWEEN,
    prompt: "readTanween",
  },
  {
    type: "challenge",
    rounds: 6,
    difficulty: 3,
    choices: 3,
    mark: VOWELS_AND_TANWEEN,
    prompt: "findReading",
  },
  { type: "review", rounds: 6, difficulty: 2, choices: 3 },
];
const masterySession: ActivitySpec[] = [
  {
    type: "listenFind",
    rounds: 6,
    difficulty: 3,
    choices: 7,
    mark: EVERY_MARK,
    prompt: "tanweenMixed",
  },
  {
    type: "challenge",
    rounds: 8,
    difficulty: 3,
    choices: 3,
    mark: EVERY_MARK,
    prompt: "masteryChallenge",
  },
  { type: "review", rounds: 8, difficulty: 3, choices: 3 },
];

const skill = (
  id: string,
  items: NooraniItem[],
  ar: string,
  en: string,
  activities: ActivitySpec[],
): NooraniSkill => ({
  id,
  ar,
  en,
  itemIds: [...new Set(items.map((i) => i.id))],
  activities,
});

export const unit5Tanween: NooraniUnit = {
  id: "u5-tanween",
  level: 5,
  ar: "التَّنْوِين",
  en: "Tanween",
  source: {
    book: "القاعدة النورانية",
    lesson: 5,
    ar: "الدَّرْسُ الْخَامِس: الْحُرُوفُ الْمُنَوَّنَة",
    en: "Qaida lessons 5–6 — tanween, then the lesson-6 drills",
    note: "Requested as Level 5. Fathatan is shown with its alif (بًا) as the book prints it.",
  },
  items: [...meetSet, ...hearSet, ...readOne, ...words],
  skills: [
    skill(
      "u5-g1",
      meetSet,
      meetSet
        .slice(0, 3)
        .map((s) => s.glyph)
        .join(" "),
      "Meet tanween",
      meetSession,
    ),
    skill(
      "u5-g2",
      hearSet,
      TANWEEN.map((h) => syl("mim", h).glyph).join(" "),
      "Hear & sort",
      hearSession,
    ),
    skill(
      "u5-g3",
      readOne,
      readOne
        .slice(6, 9)
        .map((s) => s.glyph)
        .join(" "),
      "Read one tanween",
      readOneSession,
    ),
    skill(
      "u5-g4",
      words,
      words
        .slice(0, 2)
        .map((w) => w.glyph)
        .join(" "),
      "Read tanween words",
      wordsSession,
    ),
    skill("u5-g5", mastery, "بَ بْ بٌ", "Mixed mastery", masterySession),
  ],
  completion: [
    { ar: "فَتْحَتَان", en: "Fathatan", glyphs: `ـ${MARK.fathatan}` },
    { ar: "كَسْرَتَان", en: "Kasratan", glyphs: `ـ${MARK.kasratan}` },
    { ar: "ضَمَّتَان", en: "Dammatan", glyphs: `ـ${MARK.dammatan}` },
    { ar: "تَعَلَّمْتَ التَّنْوِين", en: "You learned التنوين" },
  ],
};
