// Level 3 — تركيب الحروف وقراءة المقاطع: blending syllables into one continuous reading.
// Decoding only: no pictures, no meanings, no sukoon/tanween/madd/shadda.
// Difficulty curve = the three skills: 2 units same harakah → 2 units mixed → 3 units mixed.
// Each blend can take a dedicated recording (2nd argument of blend) instead of the device voice.
import type { ActivitySpec, NooraniSkill, NooraniUnit } from "./types";
import { blend } from "./syllables";

const session = (blendRounds: number): ActivitySpec[] => [
  { type: "blend", rounds: blendRounds, difficulty: 1, prompt: "readTogether" }, // hear → segmented → combined → hear again
  { type: "order", rounds: 4, difficulty: 1, variant: "together", prompt: "readTogetherCards" }, // tap the cards in reading order
  { type: "order", rounds: 3, difficulty: 1, variant: "first", prompt: "whichFirst" }, // which comes first?
  { type: "order", rounds: 4, difficulty: 2, variant: "listen", prompt: "listenBuild" }, // hear it, build it from extra cards
  { type: "readChoose", rounds: 4, difficulty: 2, choices: 3, prompt: "listenRead" }, // demo with audio, then read without it
  { type: "challenge", rounds: 6, difficulty: 3, choices: 3, prompt: "findReading" }, // one-harakah-apart choices, both directions
  { type: "review", rounds: 6, difficulty: 2, choices: 3 },
];

const B = (...segs: string[]) => blend(segs);

const sameVowel = [
  B("ba-a", "ta-a"),
  B("mim-a", "lam-a"),
  B("sin-a", "mim-a"),
  B("ta-a", "ba-a"),
  B("ra-a", "dal-a"),
  B("kaf-a", "ta-a"),
];
const mixedVowel = [
  B("ba-a", "ta-i"),
  B("mim-u", "lam-a"),
  B("sin-i", "mim-a"),
  B("ra-a", "ba-u"),
  B("ra-a", "ba-i"),
  B("kaf-u", "ta-a"),
  B("ba-a", "ta-u"),
];
const threeUnits = [
  B("ba-a", "ta-a", "kaf-a"),
  B("mim-a", "lam-i", "kaf-a"),
  B("sin-a", "mim-i", "ayn-a"),
  B("kaf-a", "ta-a", "ba-a"),
  B("dal-a", "ra-a", "sin-a"),
  B("lam-a", "ba-i", "sin-a"),
];

const skill = (
  id: string,
  items: typeof sameVowel,
  en: string,
  blendRounds: number,
): NooraniSkill => ({
  id,
  ar: items
    .slice(0, 2)
    .map((i) => i.glyph)
    .join(" "),
  en,
  itemIds: items.map((i) => i.id),
  activities: session(blendRounds),
});

export const unit3Blending: NooraniUnit = {
  id: "u3-blending",
  level: 3,
  ar: "تَرْكِيبُ الْحُرُوفِ وَقِرَاءَةُ الْمَقَاطِع",
  en: "Blending syllables",
  source: {
    book: "القاعدة النورانية",
    lesson: 6,
    ar: "تَدْرِيبَاتٌ عَلَى الْحَرَكَات",
    en: "Builds toward Qaida lesson 6 (harakat drills), without tanween",
    note: "Requested as Level 3. Uses only letters and harakat the child has met; ع appears once inside سَمِعَ.",
  },
  items: [...sameVowel, ...mixedVowel, ...threeUnits],
  skills: [
    skill("u3-g1", sameVowel, "2 syllables, same harakah", 4),
    skill("u3-g2", mixedVowel, "2 syllables, different harakat", 4),
    skill("u3-g3", threeUnits, "3 syllables, mixed harakat", 6),
  ],
  completion: [
    { ar: "قَرَأْتَ الْمَقَاطِع", en: "You read the syllables" },
    { ar: "رَتَّبْتَ الْمَقَاطِع", en: "You put syllables in order" },
    { ar: "رَكَّبْتَ الْحُرُوف", en: "You blended the letters" },
  ],
};
