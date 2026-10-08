// Noorani world registry: levels, units and the spoken phrases the engines use.
// Levels follow the family's Qaida PDF (Nour Muhammad Haqqani, 13th ed.). Levels 2–12 are
// mapped to their lessons but stay empty until each unit is built from those pages.
import { curriculumAudio } from "@/data/arabicCurriculumAudio";
import type { NooraniItem, NooraniLevel, NooraniUnit, Phrase } from "./types";
import { itemById } from "./syllables";
import { unit1Letters } from "./unit1Letters";
import { unit2Harakat } from "./unit2Harakat";
import { unit3Blending } from "./unit3Blending";
import { unit4Sukoon } from "./unit4Sukoon";
import { unit5Tanween } from "./unit5Tanween";

export * from "./types";
export {
  ALL_MARKS,
  EVERY_MARK,
  HARAKA_NAME,
  HARAKAT,
  MARK,
  SHORT_OF,
  TANWEEN,
  TANWEEN_OF,
  VOWELS_AND_TANWEEN,
  harakahVariants,
  withMark,
} from "./syllables";

export const nooraniUnits: NooraniUnit[] = [
  unit1Letters,
  unit2Harakat,
  unit3Blending,
  unit4Sukoon,
  unit5Tanween,
];

/**
 * 12 levels over the PDF's 17 lessons. Levels 2–5 (harakat, blending, sukoon, tanween) were moved forward
 * at the family's request; the book's lessons 2–3 (joined letters, muqattaʿat) follow as Level 6.
 * Everything after keeps the book's order.
 */
export const nooraniLevels: NooraniLevel[] = [
  {
    level: 1,
    ar: "حُرُوفُ الْهِجَاءِ الْمُفْرَدَة",
    en: "Single letters",
    lessons: [1],
    unitIds: ["u1-letters"],
  },
  {
    level: 2,
    ar: "الْحُرُوفُ مَعَ الْحَرَكَات",
    en: "Letters with short vowels",
    lessons: [4],
    unitIds: ["u2-harakat"],
  },
  {
    level: 3,
    ar: "تَرْكِيبُ الْحُرُوف",
    en: "Blending syllables",
    lessons: [4, 6],
    unitIds: ["u3-blending"],
  },
  { level: 4, ar: "السُّكُون", en: "Sukoon", lessons: [10, 11], unitIds: ["u4-sukoon"] },
  { level: 5, ar: "التَّنْوِين", en: "Tanween", lessons: [5, 6], unitIds: ["u5-tanween"] },
  {
    level: 6,
    ar: "الْحُرُوفُ الْمُرَكَّبَة وَالْمُقَطَّعَة",
    en: "Joined letters · Muqattaʿat",
    lessons: [2, 3],
    unitIds: [],
  },
  {
    level: 7,
    ar: "الْأَلِفُ وَالْيَاءُ وَالْوَاوُ الصَّغِيرَة",
    en: "Small alif, ya, waw",
    lessons: [7],
    unitIds: [],
  },
  { level: 8, ar: "حُرُوفُ الْمَدِّ وَاللِّين", en: "Madd & leen", lessons: [8, 9], unitIds: [] },
  { level: 9, ar: "الشَّدَّة", en: "Shadda + drills", lessons: [12, 13], unitIds: [] },
  {
    level: 10,
    ar: "الشَّدَّةُ وَالسُّكُون",
    en: "Shadda & sukoon, two shaddas",
    lessons: [14, 15],
    unitIds: [],
  },
  {
    level: 11,
    ar: "الشَّدَّةُ وَالسُّكُونُ مَعَ الْمَدّ",
    en: "Shadda & sukoon with madd",
    lessons: [16],
    unitIds: [],
  },
  {
    level: 12,
    ar: "تَدْرِيبَاتٌ عَلَى مَا سَبَق",
    en: "Review of everything",
    lessons: [17],
    unitIds: [],
  },
];

export const nooraniItems: Record<string, NooraniItem> = Object.fromEntries(
  nooraniUnits.flatMap((u) =>
    u.items.flatMap((i) => [
      [i.id, i] as const,
      ...(i.segments ?? []).map((sid) => [sid, itemById(sid)!] as const),
    ]),
  ),
);
export const unitBySkill = (skillId: string) =>
  nooraniUnits.find((u) => u.skills.some((s) => s.id === skillId))!;
export const skillById = (skillId: string) =>
  unitBySkill(skillId).skills.find((s) => s.id === skillId)!;

const E = (ar: string, say: string, en: string, clipKey?: string): Phrase => ({
  ...P(ar, say, clipKey),
  en,
});
function P(ar: string, say: string, clipKey?: string): Phrase {
  const clip = clipKey ? curriculumAudio[clipKey] : undefined;
  return clip ? { ar, say, clip } : { ar, say };
}

/** Every instruction / feedback line. Clips are reused where a recording exists; others use the female Arabic voice. */
export const phrases = {
  welcome: P("أَهْلًا بِكَ فِي حَدِيقَةِ النُّور", "أَهْلًا بِكَ فِي حَدِيقَةِ النُّورِ"),
  meet: P("اسْمَعْ وَانْظُرْ", "اِسْمَعْ وَانْظُرْ"),
  listenFind: P("اسْمَعْ وَاخْتَرْ", "اِسْمَعْ وَاخْتَرْ", "prompt-listen"),
  hearMatch: P("طَابِقْ", "طَابِقْ", "prompt-match"),
  build: P("رَكِّبِ الْحَرْف", "رَكِّبِ الْحَرْفَ"),
  different: P("أَيُّهَا مُخْتَلِف؟", "أَيُّهَا مُخْتَلِفٌ؟"),
  readAloud: P("اقْرَأْ", "اِقْرَأْ", "prompt-read"),
  characterGame: P("اعْبُرِ النَّهْر", "اُعْبُرِ النَّهْرَ"),
  review: P("هَيَّا نُرَاجِع", "هَيَّا نُرَاجِعْ"),
  great: P("أَحْسَنْتَ!", "أَحْسَنْتَ!", "prompt-great"),
  excellent: P("مُمْتَاز!", "مُمْتَازٌ!"),
  wellDone: P("رَائِع!", "رَائِعٌ!"),
  again: P("حَاوِلْ مَرَّةً أُخْرَى", "حَاوِلْ مَرَّةً أُخْرَى", "prompt-again"),
  close: P("قَرِيب! اسْمَعْ مَعِي", "قَرِيبٌ! اِسْمَعْ مَعِي"),
  yourTurn: P("دَوْرُكَ", "دَوْرُكَ"),
  mastered: P("أَتْقَنْتَ الْحُرُوف!", "أَتْقَنْتَ الْحُرُوفَ!"),
  // Level 2 — harakat
  harakatMeet: E("الْحَرَكَات", "اَلْحَرَكَاتُ", "Short vowels"),
  fatha: E("فَتْحَة", "فَتْحَةٌ", "Fatha"),
  kasra: E("كَسْرَة", "كَسْرَةٌ", "Kasra"),
  damma: E("ضَمَّة", "ضَمَّةٌ", "Damma"),
  contrast: E(
    "حَرْفٌ وَاحِد، أَصْوَاتٌ مُخْتَلِفَة",
    "حَرْفٌ وَاحِدٌ، أَصْوَاتٌ مُخْتَلِفَةٌ",
    "Same letter, different sound",
  ),
  listenChoose: E("اسْمَعْ وَاخْتَرْ", "اِسْمَعْ وَاخْتَرْ", "Listen and choose", "prompt-listen"),
  addHaraka: E("ضَعِ الْحَرَكَة", "ضَعِ الْحَرَكَةَ", "Add the harakah"),
  readIt: E("اقْرَأْ", "اِقْرَأْ", "Read it", "prompt-read"),
  readMode: E(
    "اقْرَأْ ثُمَّ اخْتَرِ الصَّوْت",
    "اِقْرَأْ ثُمَّ اخْتَرِ الصَّوْتَ",
    "Read, then pick the sound",
  ),
  harakahChallenge: E("تَحَدِّي الْحَرَكَات", "تَحَدِّي الْحَرَكَاتِ", "Harakah challenge"),
  // Level 3 — blending
  readTogether: E("اقْرَأْ مَعًا", "اِقْرَأْ مَعًا", "Read together"),
  readTogetherCards: E("اقْرَأْهَا مَعًا", "اِقْرَأْهَا مَعًا", "Tap the cards in reading order"),
  whichFirst: E("أَيُّهَا أَوَّلًا؟", "أَيُّهَا أَوَّلًا؟", "Which comes first?"),
  listenBuild: E(
    "اسْتَمِعْ ثُمَّ رَكِّبْ",
    "اِسْتَمِعْ ثُمَّ رَكِّبْ",
    "Listen, then build the reading",
  ),
  listenRead: E("اسْتَمِعْ ثُمَّ اقْرَأْ", "اِسْتَمِعْ ثُمَّ اقْرَأْ", "Listen, then read"),
  findReading: E(
    "ابْحَثْ عَنِ الْقِرَاءَةِ الصَّحِيحَة",
    "اِبْحَثْ عَنِ الْقِرَاءَةِ الصَّحِيحَةِ",
    "Find the correct reading",
  ),
  whichSound: E("أَيُّ صَوْتٍ هٰذَا؟", "أَيُّ صَوْتٍ هٰذَا؟", "Which sound matches?"),
  // Level 4 — sukoon
  sukoon: E("سُكُون", "سُكُونٌ", "Sukoon"),
  sukoonMeet: E("السُّكُون", "اَلسُّكُونُ", "Sukoon — no short vowel"),
  sukoonContrast: E("حَرَكَةٌ أَمْ سُكُون؟", "حَرَكَةٌ أَمْ سُكُونٌ؟", "Vowel or no vowel?"),
  spotSukoon: E("أَيْنَ السُّكُون؟", "أَيْنَ السُّكُونُ؟", "Where is the sukoon?"),
  hearDifference: E("اسْتَمِعْ", "اِسْتَمِعْ", "Listen"),
  buildClosed: E("رَكِّبْ", "رَكِّبْ", "Build — the vowel, then the sukoon"),
  chooseEnding: E("اخْتَرِ النِّهَايَة", "اِخْتَرِ النِّهَايَةَ", "Choose the correct ending"),
  addSukoon: E("ضَعِ الْعَلَامَة", "ضَعِ الْعَلَامَةَ", "Add the right mark"),
  readClosed: E("اقْرَأْ", "اِقْرَأْ", "Read", "prompt-read"),
  selfRead: E("اقْرَأْ وَحْدَكَ", "اِقْرَأْ وَحْدَكَ", "Read it by yourself"),
  mixedReview: E("مُرَاجَعَة", "مُرَاجَعَةٌ", "Mixed review"),
  // Level 5 — tanween
  fathatan: E("فَتْحَتَان", "فَتْحَتَانِ", "Fathatan"),
  kasratan: E("كَسْرَتَان", "كَسْرَتَانِ", "Kasratan"),
  dammatan: E("ضَمَّتَان", "ضَمَّتَانِ", "Dammatan"),
  tanweenMeet: E("التَّنْوِين", "اَلتَّنْوِينُ", "Tanween"),
  tanweenIdentify: E(
    "اسْمَعْ وَاخْتَرْ",
    "اِسْمَعْ وَاخْتَرْ",
    "Listen, then find it",
    "prompt-listen",
  ),
  sameEnding: E(
    "حَرَكَةٌ أَمْ تَنْوِين؟",
    "حَرَكَةٌ أَمْ تَنْوِينٌ؟",
    "Same letter, different ending",
  ),
  addTanween: E("ضَعِ الْعَلَامَة", "ضَعِ الْعَلَامَةَ", "Add the right mark"),
  tanweenExact: E(
    "اخْتَرِ الشَّكْلَ الصَّحِيح",
    "اِخْتَرِ الشَّكْلَ الصَّحِيحَ",
    "Choose the exact form",
  ),
  tanweenMixed: E(
    "حَرَكَة، سُكُون، أَمْ تَنْوِين؟",
    "حَرَكَةٌ، سُكُونٌ، أَمْ تَنْوِينٌ؟",
    "Vowel, sukoon or tanween?",
  ),
  sortTanween: E("صَنِّفْ", "صَنِّفْ", "Sort"),
  soundSymbol: E("الصَّوْتُ وَالْعَلَامَة", "اَلصَّوْتُ وَالْعَلَامَةُ", "Sound and symbol"),
  readTanween: E("اقْرَأْ", "اِقْرَأْ", "Read", "prompt-read"),
  readTanweenTogether: E("اقْرَأْ مَعًا", "اِقْرَأْ مَعًا", "Read together"),
  masteryChallenge: E(
    "التَّحَدِّي الْكَبِير",
    "اَلتَّحَدِّي الْكَبِيرُ",
    "Mixed mastery challenge",
  ),
} satisfies Record<string, Phrase>;
export type PhraseId = keyof typeof phrases;

/**
 * Drop-in recordings: put a URL here keyed by item id (`ba`), `<id>:success`,
 * `<id>:encourage`, or phrase id (`build`) and it wins over everything else.
 */
export const nooraniClips: Record<string, string> = {};
