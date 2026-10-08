// Level 2 — الحروف مع الحركات: one letter, three short vowels (Qaida lesson 4, p. 10).
// Controlled letter sets first; add letters by adding a group — every activity is generated.
import type { ActivitySpec, NooraniSkill, NooraniUnit } from "./types";
import { HARAKAT, MARK, syl, syllablesFor } from "./syllables";

const session: ActivitySpec[] = [
  { type: "meet", rounds: 1, difficulty: 1, prompt: "harakatMeet" }, // fatha, then kasra, then damma
  { type: "contrast", rounds: 4, difficulty: 1 }, // same letter, different sound
  { type: "listenFind", rounds: 6, difficulty: 1, choices: 3, prompt: "listenChoose" }, // distractors differ only by harakah
  { type: "build", rounds: 4, difficulty: 1, prompt: "addHaraka" }, // bare letter + the right harakah
  { type: "readChoose", rounds: 4, difficulty: 2, choices: 3, prompt: "readIt" }, // listen → recognise → read
  { type: "challenge", rounds: 6, difficulty: 2, choices: 3, prompt: "harakahChallenge" }, // text→sound, sound→text
  { type: "review", rounds: 6, difficulty: 2, choices: 3 },
];

const LETTER_GLYPH: Record<string, string> = {
  alif: "ا",
  ba: "ب",
  ta: "ت",
  mim: "م",
  sin: "س",
  nun: "ن",
  lam: "ل",
  ra: "ر",
  dal: "د",
  kaf: "ك",
};

const group = (id: string, letters: string[], en: string): NooraniSkill => ({
  id,
  // Title cycles the three harakat so the stone itself shows what the group is about.
  ar: letters.map((l, i) => syl(l, HARAKAT[i % 3]!).glyph).join(" "),
  en,
  itemIds: syllablesFor(letters).map((s) => s.id),
  activities: session,
});

const g1 = ["ba", "ta", "mim", "sin"];
const g2 = ["alif", "nun", "lam"];
const g3 = ["ra", "dal", "kaf"];

export const unit2Harakat: NooraniUnit = {
  id: "u2-harakat",
  level: 2,
  ar: "الْحُرُوفُ مَعَ الْحَرَكَات",
  en: "Letters with short vowels",
  source: {
    book: "القاعدة النورانية",
    lesson: 4,
    ar: "الدَّرْسُ الرَّابِع: الْحُرُوفُ الْمُتَحَرِّكَة",
    en: "Qaida lesson 4 — harakat",
    note: "Placed as Level 2 at the family's request; the book teaches joined letters and muqattaʿat (lessons 2–3) first.",
  },
  items: syllablesFor([...g1, ...g2, ...g3]),
  skills: [
    group("u2-g1", g1, `${g1.map((l) => LETTER_GLYPH[l]).join(" ")} — core set`),
    group("u2-g2", g2, `${g2.map((l) => LETTER_GLYPH[l]).join(" ")}`),
    group("u2-g3", g3, `${g3.map((l) => LETTER_GLYPH[l]).join(" ")}`),
  ],
  completion: [
    { ar: "الْفَتْحَة", en: "Fatha", glyphs: `ـ${MARK.fatha}` },
    { ar: "الْكَسْرَة", en: "Kasra", glyphs: `ـ${MARK.kasra}` },
    { ar: "الضَّمَّة", en: "Damma", glyphs: `ـ${MARK.damma}` },
    { ar: "قَرَأْتَ الْحُرُوفَ مَعَ الْحَرَكَات", en: "You read letters with short vowels" },
  ],
};
