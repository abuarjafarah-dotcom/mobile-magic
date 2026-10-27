// Level 8 — حُرُوفُ الْمَدِّ وَاللِّين (Qaida lessons 8–9, pp. 14–17).
// Madd: a short vowel followed by its long-vowel letter (بَا، بُو، بِي). Leen: fatha + waw or ya with sukoon (بَوْ، بَيْ).
// Each item's distractors are the other long or leen forms on the same letter, so the child must hear the vowel
// and the letter that follows it. Reading mechanics only: no madd length rules, shadda, or qalqalah.
import type { ActivitySpec, NooraniItem, NooraniSkill, NooraniUnit } from "./types";

const BASES = [
  { glyph: "ب", en: "ba" },
  { glyph: "ت", en: "ta" },
  { glyph: "م", en: "mim" },
  { glyph: "ن", en: "nun" },
  { glyph: "ل", en: "lam" },
  { glyph: "ر", en: "ra" },
];

const FORMS = [
  { vowel: "َ", long: "ا", name: "alif", en: "fatha + alif" },
  { vowel: "ُ", long: "و", name: "waw", en: "damma + waw" },
  { vowel: "ِ", long: "ي", name: "ya", en: "kasra + ya" },
];
const LEEN = [
  { vowel: "َ", long: "وْ", name: "leen-waw", en: "fatha + waw sukoon" },
  { vowel: "َ", long: "يْ", name: "leen-ya", en: "fatha + ya sukoon" },
];

/** A standalone madd/leen reading. `alternates` are the other forms on the same letter. */
function reading(
  glyph: string,
  id: string,
  en: string,
  alternates: NooraniItem[] = [],
): NooraniItem {
  return { id, glyph, say: glyph, en, alternates };
}

const build = (base: { glyph: string; en: string }, forms: typeof FORMS | typeof LEEN) => {
  const items = forms.map((f) => ({
    id: `${base.en}-${f.name}`,
    glyph: `${base.glyph}${f.vowel}${f.long}`,
    en: `${base.en} · ${f.en}`,
    f,
  }));
  return items.map(({ id, glyph, en }, i) =>
    reading(
      glyph,
      id,
      en,
      items.filter((_, j) => j !== i).map((o) => reading(o.glyph, o.id, o.en)),
    ),
  );
};

const maddAlif = BASES.slice(0, 2).flatMap((b) => build(b, FORMS));
const maddMixed = BASES.slice(2, 4).flatMap((b) => build(b, FORMS));
const maddAll = BASES.slice(4).flatMap((b) => build(b, FORMS));
const leen = BASES.flatMap((b) => build(b, LEEN));

const session = (rounds: number): ActivitySpec[] => [
  { type: "listenFind", rounds, difficulty: 1, choices: 3, prompt: "listenFind" },
  { type: "readChoose", rounds: 4, difficulty: 2, choices: 3, prompt: "readIt" },
  { type: "challenge", rounds: 6, difficulty: 2, choices: 3 },
  { type: "review", rounds: 6, difficulty: 2, choices: 3 },
];

const skill = (id: string, items: NooraniItem[], en: string, rounds: number): NooraniSkill => ({
  id,
  ar: items
    .slice(0, 3)
    .map((i) => i.glyph)
    .join(" "),
  en,
  itemIds: items.map((i) => i.id),
  activities: session(rounds),
});

export const unit8Madd: NooraniUnit = {
  id: "u8-madd",
  level: 8,
  ar: "حُرُوفُ الْمَدِّ وَاللِّين",
  en: "Madd & leen",
  source: {
    book: "القاعدة النورانية",
    lesson: 8,
    ar: "الدَّرْسُ الثَّامِن: حُرُوفُ الْمَدِّ وَاللِّين",
    en: "Qaida lessons 8–9 — madd letters, then leen (with the lesson-9 drills)",
    note: "Level 8 in the app. Madd and leen are read as written in the Qaida; length rules are not taught here.",
  },
  items: [...maddAlif, ...maddMixed, ...maddAll, ...leen],
  skills: [
    skill("u8-g1", maddAlif, "بَا · بُو · بِي", 6),
    skill("u8-g2", maddMixed, "Mixed madd", 6),
    skill("u8-g3", maddAll, "All six letters", 6),
    skill("u8-g4", leen, "Leen: بَوْ · بَيْ", 6),
  ],
  completion: [
    { ar: "حُرُوفُ الْمَدّ", en: "Madd letters" },
    { ar: "حُرُوفُ اللِّين", en: "Leen letters" },
  ],
};
