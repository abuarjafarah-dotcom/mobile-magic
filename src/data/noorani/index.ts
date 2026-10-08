// Noorani world registry: levels, units and the spoken phrases the engines use.
// Levels 2–12 stay empty until their content is extracted from the family's Qaida PDF —
// nothing is invented here.
import { curriculumAudio } from "@/data/arabicCurriculumAudio";
import type { NooraniItem, NooraniLevel, NooraniUnit, Phrase } from "./types";
import { unit1Letters } from "./unit1Letters";

export * from "./types";

export const nooraniUnits: NooraniUnit[] = [unit1Letters];

export const nooraniLevels: NooraniLevel[] = [
  { level: 1, ar: "الْحُرُوف", en: "Letters & sounds", unitIds: ["u1-letters"] },
  { level: 2, ar: "الْحُرُوف", en: "Letters & sounds", unitIds: [] },
  { level: 3, ar: "الْحَرَكَات", en: "Harakat", unitIds: [] },
  { level: 4, ar: "الْحَرَكَات", en: "Harakat", unitIds: [] },
  { level: 5, ar: "قَوَاعِد", en: "Rules", unitIds: [] },
  { level: 6, ar: "قَوَاعِد", en: "Rules", unitIds: [] },
  { level: 7, ar: "قَوَاعِد", en: "Rules", unitIds: [] },
  { level: 8, ar: "الْمَدّ", en: "Madd", unitIds: [] },
  { level: 9, ar: "", en: "Next rules", unitIds: [] },
  { level: 10, ar: "", en: "Advanced", unitIds: [] },
  { level: 11, ar: "", en: "Advanced", unitIds: [] },
  { level: 12, ar: "الطَّلَاقَة", en: "Fluency", unitIds: [] },
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
