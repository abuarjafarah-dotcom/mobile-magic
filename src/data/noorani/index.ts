// Noorani world registry: levels, units and the spoken phrases the engines use.
// Levels follow the family's Qaida PDF (Nour Muhammad Haqqani, 13th ed.). Levels 2–12 are
// mapped to their lessons but stay empty until each unit is built from those pages.
import { curriculumAudio } from "@/data/arabicCurriculumAudio";
import type { NooraniItem, NooraniLevel, NooraniUnit, Phrase } from "./types";
import { unit1Letters } from "./unit1Letters";

export * from "./types";

export const nooraniUnits: NooraniUnit[] = [unit1Letters];

/** The PDF's 17 lessons grouped into 12 levels, in the book's own order (pp. 6–28). */
export const nooraniLevels: NooraniLevel[] = [
  { level: 1, ar: "حُرُوفُ الْهِجَاءِ الْمُفْرَدَة", en: "Single letters", lessons: [1], unitIds: ["u1-letters"] },
  { level: 2, ar: "الْحُرُوفُ الْمُرَكَّبَة وَالْمُقَطَّعَة", en: "Joined letters · Muqattaʿat", lessons: [2, 3], unitIds: [] },
  { level: 3, ar: "الْحُرُوفُ الْمُتَحَرِّكَة", en: "Harakat", lessons: [4], unitIds: [] },
  { level: 4, ar: "الْحُرُوفُ الْمُنَوَّنَة", en: "Tanween + drills", lessons: [5, 6], unitIds: [] },
  { level: 5, ar: "الْأَلِفُ وَالْيَاءُ وَالْوَاوُ الصَّغِيرَة", en: "Small alif, ya, waw", lessons: [7], unitIds: [] },
  { level: 6, ar: "حُرُوفُ الْمَدِّ وَاللِّين", en: "Madd & leen", lessons: [8], unitIds: [] },
  { level: 7, ar: "تَدْرِيبَاتٌ عَلَى التَّنْوِينِ وَالْمَدّ", en: "Tanween, madd & leen drills", lessons: [9], unitIds: [] },
  { level: 8, ar: "السُّكُون", en: "Sukoon + drills", lessons: [10, 11], unitIds: [] },
  { level: 9, ar: "الشَّدَّة", en: "Shadda + drills", lessons: [12, 13], unitIds: [] },
  { level: 10, ar: "الشَّدَّةُ وَالسُّكُون", en: "Shadda & sukoon, two shaddas", lessons: [14, 15], unitIds: [] },
  { level: 11, ar: "الشَّدَّةُ وَالسُّكُونُ مَعَ الْمَدّ", en: "Shadda & sukoon with madd", lessons: [16], unitIds: [] },
  { level: 12, ar: "تَدْرِيبَاتٌ عَلَى مَا سَبَق", en: "Review of everything", lessons: [17], unitIds: [] },
];

export const nooraniItems: Record<string, NooraniItem> = Object.fromEntries(nooraniUnits.flatMap((u) => u.items.map((i) => [i.id, i])));
export const unitBySkill = (skillId: string) => nooraniUnits.find((u) => u.skills.some((s) => s.id === skillId))!;
export const skillById = (skillId: string) => unitBySkill(skillId).skills.find((s) => s.id === skillId)!;

const P = (ar: string, say: string, clipKey?: string): Phrase => {
  const clip = clipKey ? curriculumAudio[clipKey] : undefined;
  return clip ? { ar, say, clip } : { ar, say };
};

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
} satisfies Record<string, Phrase>;
export type PhraseId = keyof typeof phrases;

/**
 * Drop-in recordings: put a URL here keyed by item id (`ba`), `<id>:success`,
 * `<id>:encourage`, or phrase id (`build`) and it wins over everything else.
 */
export const nooraniClips: Record<string, string> = {};
