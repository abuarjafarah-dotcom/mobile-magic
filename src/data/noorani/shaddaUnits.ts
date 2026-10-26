// Levels 9–11 — الشَّدَّة (Qaida lessons 12–16, pp. 22–26).
// Shadda (ّ) doubles a letter. Level 9: one shadda on syllables (book p. 22) and words (p. 23).
// Level 10: words with two shaddas (lesson 14–15). Level 11: shadda with madd (lesson 16).
// Word forms are copied from the repo's verified Uthmani text (src/data/surahs*.ts), not retyped from the scan.
// Distractors: the same word with one shadda removed (the closest mistake), and another word from the same level.
import type { ActivitySpec, NooraniItem, NooraniSkill, NooraniUnit } from "./types";

const SHADDA = "ّ";

const word = (
  glyph: string,
  id: string,
  en: string,
  alternates: NooraniItem[] = [],
): NooraniItem => ({
  id,
  glyph,
  say: glyph,
  en,
  alternates,
});

/** Remove the k-th shadda (0-based) from a word, so the child hears a single letter instead of a double one. */
function dropShadda(glyph: string, k: number): string {
  let seen = -1;
  let out = "";
  for (const ch of glyph) {
    if (ch === SHADDA && ++seen === k) continue;
    out += ch;
  }
  return out;
}

/** Each word's alternates: the word with one shadda dropped, plus one other word from the same level. */
function withContrast(words: { glyph: string; id: string; en: string }[]): NooraniItem[] {
  return words.map((w, i) => {
    const count = [...w.glyph].filter((c) => c === SHADDA).length;
    const drops = Array.from({ length: count }, (_, k) =>
      word(dropShadda(w.glyph, k), `${w.id}-no${k}`, `${w.en} · one letter`),
    );
    const others = words
      .filter((_, j) => j !== i)
      .slice(0, Math.max(0, 2 - drops.length))
      .map((o) => word(o.glyph, `${o.id}-alt`, o.en));
    return word(w.glyph, w.id, w.en, [...drops, ...others]);
  });
}

// ── Level 9: one shadda on syllables (p. 22), e.g. أَبَّ = alif-fatha + بَّ ──
const ALIF_VOWEL = { fatha: "أَ", kasra: "إِ", damma: "أُ" } as const;
const VOWEL = { fatha: "َ", kasra: "ِ", damma: "ُ" } as const;
type V = keyof typeof VOWEL;
const VOWELS: V[] = ["fatha", "kasra", "damma"];
const syllable = (letter: string, alifV: V, v: V) =>
  word(
    `${ALIF_VOWEL[alifV]}${letter}${VOWEL[v]}${SHADDA}`,
    `${letter}-${alifV}-${v}`,
    `${letter} · ${alifV} · shadda ${v}`,
  );
const syllableSet = (letter: string) => {
  const all = VOWELS.flatMap((a) => VOWELS.map((v) => syllable(letter, a, v)));
  return all.map((s, i) => {
    const others = all.filter((_, j) => j !== i).slice(0, 2);
    return word(s.glyph, s.id, s.en, others);
  });
};
const shaddaSyllables = [...syllableSet("ب"), ...syllableSet("ت")]; // ب ت

// ── Level 9 words (p. 23, verified in the repo) — one shadda each ──
const level9Words = withContrast([
  { glyph: "صَدَّقَ", id: "l9-sadaqa", en: "ṣaddaqa" },
  { glyph: "قَدَّرَ", id: "l9-qaddara", en: "qaddara" },
  { glyph: "كَذَّبَ", id: "l9-kadhdhaba", en: "kadhdhaba" },
  { glyph: "يَظُنُّ", id: "l9-yazunnu", en: "yaẓunnu" },
  { glyph: "يَحُضُّ", id: "l9-yahuddu", en: "yaḥuḍḍu" },
  { glyph: "كُذِّبَ", id: "l9-kudhdhiba", en: "kudhdhiba" },
]);

// ── Level 10: words with two shaddas (lessons 14–15, pp. 24–25) ──
const level10Words = withContrast([
  { glyph: "مِّمَّا", id: "l10-mimma", en: "mimmā" },
  { glyph: "لِّلَّذِينَ", id: "l10-lilladhina", en: "lilladhīna" },
  { glyph: "مُّدَّكِرٍ", id: "l10-muddakirin", en: "muddakir" },
  { glyph: "مُّسَمًّى", id: "l10-musamman", en: "musammā" },
  { glyph: "بَيَّنَّا", id: "l10-bayyanna", en: "bayyannā" },
  { glyph: "مَّوَدَّةً", id: "l10-mawaddatan", en: "mawaddatan" },
  { glyph: "يَذَّكَّرُ", id: "l10-yadhdhakkaru", en: "yadhdhakkaru" },
  { glyph: "مُّتَّكِـِٔينَ", id: "l10-muttaki", en: "muttakiʾīna" },
]);

// ── Level 11: shadda with madd (lesson 16, p. 26) ──
const level11Words = withContrast([
  { glyph: "دَآبَّةٍ", id: "l11-dabbatin", en: "dābbatin" },
  { glyph: "لَّجَآءَهُمُ", id: "l11-lajaahum", en: "lajāʾahum" },
  { glyph: "بَيِّنَـٰتٌ", id: "l11-bayyinatun", en: "bayyinātun" },
  { glyph: "ءَامَنَّا", id: "l11-aamanna", en: "āmannā" },
  { glyph: "إِنَّمَآ", id: "l11-innama", en: "innamā" },
  { glyph: "أَنَّآ", id: "l11-anna", en: "annā" },
  { glyph: "فَإِيَّـٰىَ", id: "l11-fa-iyaya", en: "fa-iyyāya" },
  { glyph: "فَلَمَّا", id: "l11-falamma", en: "falammā" },
]);

const session = (rounds: number): ActivitySpec[] => [
  { type: "listenFind", rounds, difficulty: 2, choices: 3, prompt: "listenFind" },
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

export const unit9Shadda: NooraniUnit = {
  id: "u9-shadda",
  level: 9,
  ar: "الشَّدَّة",
  en: "Shadda + drills",
  source: {
    book: "القاعدة النورانية",
    lesson: 12,
    ar: "الدَّرْسُ الثَّانِي عَشَر: الشَّدَّة",
    en: "Qaida lessons 12–13 — shadda on syllables, then one-shadda words",
    note: "Words are the repo's verified Uthmani text, matching the book's drill lines.",
  },
  items: [...shaddaSyllables, ...level9Words],
  skills: [
    skill("u9-g1", shaddaSyllables, "أَبَّ · أَتَّ", 6),
    skill("u9-g2", level9Words, "One shadda in a word", 6),
  ],
  completion: [{ ar: "الشَّدَّة", en: "Shadda" }],
};

export const unit10DoubleShadda: NooraniUnit = {
  id: "u10-double-shadda",
  level: 10,
  ar: "الشَّدَّتَانِ فِي الْكَلِمَة",
  en: "Two shaddas in a word",
  source: {
    book: "القاعدة النورانية",
    lesson: 14,
    ar: "الدَّرْسُ الرَّابِعُ عَشَر وَالْخَامِسُ عَشَر: الشَّدَّتَيْنِ فِي كَلِمَة",
    en: "Qaida lessons 14–15 — words with two shaddas",
    note: "Word forms are the repo's verified Uthmani text.",
  },
  items: level10Words,
  skills: [
    skill("u10-g1", level10Words.slice(0, 4), "Two shaddas · group A", 6),
    skill("u10-g2", level10Words.slice(4), "Two shaddas · group B", 6),
  ],
  completion: [{ ar: "الشَّدَّتَان", en: "Two shaddas" }],
};

export const unit11ShaddaMadd: NooraniUnit = {
  id: "u11-shadda-madd",
  level: 11,
  ar: "الشَّدَّةُ وَالسُّكُونُ مَعَ الْمَدّ",
  en: "Shadda with madd",
  source: {
    book: "القاعدة النورانية",
    lesson: 16,
    ar: "الدَّرْسُ السَّادِسُ عَشَر: تَدْرِيبَاتٌ عَلَى الشَّدَّةِ وَالسُّكُونِ مَعَ الْمَدّ",
    en: "Qaida lesson 16 — shadda and sukoon with madd",
    note: "Word forms are the repo's verified Uthmani text.",
  },
  items: level11Words,
  skills: [
    skill("u11-g1", level11Words.slice(0, 4), "Shadda with madd · group A", 6),
    skill("u11-g2", level11Words.slice(4), "Shadda with madd · group B", 6),
  ],
  completion: [{ ar: "الْمَدّ", en: "Madd" }],
};
