// Level 4 — السُّكُون (Qaida lessons 10–11, pp. 18–19): a letter with no vowel of its own.
// The vowel before it connects into it: مَ + نْ → مَنْ. Reading mechanics only — no meanings,
// no tanween, madd, shadda or qalqalah.
// Difficulty curve = the four skills: single letter + sukoon → two-letter closed syllables →
// different vowels before the sukoon → mixed review with Level 2.
// Every closed syllable can take a dedicated recording (2nd argument of `closed`).
import type { ActivitySpec, NooraniItem, NooraniSkill, NooraniUnit } from "./types";
import { ALL_MARKS, blend, itemById, syl } from "./syllables";

const LETTER_GLYPH: Record<string, string> = {
  ba: "ب",
  ta: "ت",
  mim: "م",
  nun: "ن",
  lam: "ل",
  ra: "ر",
  kaf: "ك",
  sin: "س",
  dal: "د",
  alif: "ا",
};

/** A closed syllable: segments in reading order, the last one carrying sukoon. */
function closed(segments: string[], blended?: string): NooraniItem {
  const item = blend(segments, blended);
  const last = segments[segments.length - 1]!;
  const letterId = last.slice(0, last.lastIndexOf("-"));
  // Build spec for "Add the sukoon": the vowelled part is given, the child adds the last mark.
  item.build = {
    kind: "mark",
    base: LETTER_GLYPH[letterId]!,
    mark: "sukoon",
    prefix: segments
      .slice(0, -1)
      .map((id) => itemById(id)!.glyph)
      .join(""),
    choices: ALL_MARKS,
  };
  return item;
}

// ── skill 1: single letter + sukoon (with its vowelled twin for contrast) ──
const singles = ["ba", "ta", "mim", "nun"];
const sukoonOnly = singles.map((l) => syl(l, "sukoon"));
const pairs = singles.flatMap((l) => [syl(l, "fatha"), syl(l, "sukoon")]);

// ── skill 2: two-letter closed syllables, fatha before the sukoon ──
const fathaClosed = [
  closed(["mim-a", "nun-o"]), // مَنْ
  closed(["ba-a", "ta-o"]), // بَتْ
  closed(["lam-a", "mim-o"]), // لَمْ
  closed(["alif-a", "ba-o"]), // أَبْ — the Qaida's own first sukoon example (p. 18)
  closed(["sin-a", "mim-o"]), // سَمْ
];

// ── skill 3: different vowels before the sukoon ──
const mixedClosed = [
  closed(["mim-i", "nun-o"]), // مِنْ
  closed(["lam-i", "mim-o"]), // لِمْ
  closed(["ra-u", "ba-o"]), // رُبْ
  closed(["kaf-u", "nun-o"]), // كُنْ
  closed(["alif-i", "ba-o"]), // إِبْ
  closed(["dal-u", "mim-o"]), // دُمْ
];

// ── skill 4: mixed review — short vowel vs sukoon, open vs closed ──
const mixed = [
  syl("ba", "fatha"),
  syl("ba", "sukoon"),
  syl("ba", "kasra"),
  syl("ba", "damma"),
  fathaClosed[0]!,
  syl("mim", "fatha"),
  syl("mim", "sukoon"),
  mixedClosed[1]!,
];

const letterSession: ActivitySpec[] = [
  { type: "meet", rounds: 1, difficulty: 1, prompt: "sukoonMeet" }, // ـْ, then بْ تْ مْ نْ (spelled the Qaida way)
  { type: "contrast", rounds: 4, difficulty: 1, prompt: "sukoonContrast" }, // بَ → بْ
  { type: "spot", rounds: 4, difficulty: 1, mark: "sukoon", prompt: "spotSukoon" }, // أين السكون؟
  {
    type: "listenFind",
    rounds: 6,
    difficulty: 1,
    choices: 2,
    mark: "sukoon",
    prompt: "hearDifference",
  }, // بَ or بْ?
  { type: "review", rounds: 6, difficulty: 2, choices: 3 },
];

const closedSession: ActivitySpec[] = [
  { type: "blend", rounds: 4, difficulty: 1, prompt: "buildClosed" }, // مَ + نْ → مَنْ
  { type: "ending", rounds: 4, difficulty: 2, choices: 3, prompt: "chooseEnding" }, // مَ + ؟
  { type: "build", rounds: 4, difficulty: 2, prompt: "addSukoon" }, // add the mark to ن
  { type: "order", rounds: 4, difficulty: 2, variant: "listen", prompt: "listenBuild" }, // hear → build
  {
    type: "readChoose",
    rounds: 5,
    difficulty: 2,
    choices: 3,
    variant: "readFirst",
    prompt: "readClosed",
  }, // read, then "I read it"
  { type: "review", rounds: 6, difficulty: 2, choices: 3 },
];

const mixedSession: ActivitySpec[] = [
  { type: "spot", rounds: 3, difficulty: 2, mark: "sukoon", prompt: "spotSukoon" },
  {
    type: "listenFind",
    rounds: 6,
    difficulty: 2,
    choices: 3,
    mark: "sukoon",
    prompt: "hearDifference",
  },
  {
    type: "challenge",
    rounds: 6,
    difficulty: 3,
    choices: 3,
    mark: "sukoon",
    prompt: "mixedReview",
  },
  { type: "review", rounds: 6, difficulty: 2, choices: 3 },
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
  itemIds: items.map((i) => i.id),
  activities,
});

export const unit4Sukoon: NooraniUnit = {
  id: "u4-sukoon",
  level: 4,
  ar: "السُّكُون",
  en: "Sukoon",
  source: {
    book: "القاعدة النورانية",
    lesson: 10,
    ar: "الدَّرْسُ الْعَاشِر: السُّكُون",
    en: "Qaida lessons 10–11 — sukoon",
    note: "Requested as Level 4. The book introduces sukoon through أَبْ إِبْ أُبْ (p. 18); أَبْ and إِبْ appear here.",
  },
  items: [...pairs, ...fathaClosed, ...mixedClosed],
  skills: [
    skill(
      "u4-g1",
      [...sukoonOnly, ...pairs.filter((p) => p.haraka === "fatha")],
      sukoonOnly.map((s) => s.glyph).join(" "),
      "Letter + sukoon",
      letterSession,
    ),
    skill(
      "u4-g2",
      fathaClosed,
      fathaClosed
        .slice(0, 2)
        .map((i) => i.glyph)
        .join(" "),
      "Closed syllables (fatha)",
      closedSession,
    ),
    skill(
      "u4-g3",
      mixedClosed,
      mixedClosed
        .slice(0, 2)
        .map((i) => i.glyph)
        .join(" "),
      "Different vowels + sukoon",
      closedSession,
    ),
    skill("u4-g4", mixed, "بَ بْ مَنْ", "Mixed review", mixedSession),
  ],
  completion: [
    { ar: "السُّكُون", en: "Sukoon — no short vowel", glyphs: "ـْ" },
    { ar: "مَ ≠ مْ", en: "A vowel is not a sukoon" },
    { ar: "مَ + نْ ← مَنْ", en: "You read closed syllables" },
  ],
};
