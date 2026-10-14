// Noorani Qaida — Lesson 1: الحروف الهجائية المفردة (single letters), in the Qaida's order.
// Checked against the family's PDF (p. 6): same 30 cells, same order, same row groups, Qaida letter names.
// Audio reuses the existing recorded female clips (`letters-<id>`); those say the standard names
// (بَاء not بَا) until Qaida-style recordings are dropped into nooraniClips.
// Edit content here only; the engines build every activity from this file.
import { curriculumAudio } from "@/data/arabicCurriculumAudio";
import type { ActivitySpec, BuildSpec, NooraniItem, NooraniSkill, NooraniUnit } from "./types";

const DOTLESS_BA = "ٮ"; // ٮ
const DOTLESS_FA = "ڡ"; // ڡ
const DOTLESS_QAF = "ٯ"; // ٯ
const DOTLESS_NUN = "ں"; // ں

type DotsSpec = Extract<BuildSpec, { place: unknown }>;
const B = (base: string, dots: DotsSpec["dots"], place: DotsSpec["place"]): BuildSpec => ({
  base,
  dots,
  place,
});

// id, glyph, spoken name, parent label, build spec, look/sound-alike ids
const L = (
  id: string,
  glyph: string,
  say: string,
  en: string,
  build: BuildSpec | undefined,
  confusable: string[],
): NooraniItem => {
  const clip = curriculumAudio[`letters-${id === "ya2" ? "ya" : id}`];
  return {
    id,
    glyph,
    say,
    en,
    confusable,
    ...(build ? { build } : {}),
    ...(clip ? { audio: { target: clip } } : {}),
  };
};

export const unit1Items: NooraniItem[] = [
  L("alif", "ا", "أَلِف", "Alif", undefined, ["hamza", "lam"]),
  L("ba", "ب", "بَا", "Ba", B(DOTLESS_BA, 1, "below"), ["ta", "tha", "nun", "ya"]),
  L("ta", "ت", "تَا", "Ta", B(DOTLESS_BA, 2, "above"), ["ba", "tha", "tta", "nun"]),
  L("tha", "ث", "ثَا", "Tha", B(DOTLESS_BA, 3, "above"), ["ta", "ba", "sin", "dhal"]),
  L("jim", "ج", "جِيم", "Jim", B("ح", 1, "below"), ["hha", "kha"]),
  L("hha", "ح", "حَا", "Ḥa", B("ح", 0, "none"), ["jim", "kha", "ha"]),
  L("kha", "خ", "خَا", "Kha", B("ح", 1, "above"), ["hha", "jim", "ghayn"]),
  L("dal", "د", "دَال", "Dal", B("د", 0, "none"), ["dhal", "dad", "ra"]),
  L("dhal", "ذ", "ذَال", "Dhal", B("د", 1, "above"), ["dal", "zay", "zza"]),
  L("ra", "ر", "رَا", "Ra", B("ر", 0, "none"), ["zay", "dal", "waw"]),
  L("zay", "ز", "زَا", "Zay", B("ر", 1, "above"), ["ra", "dhal", "zza"]),
  L("sin", "س", "سِين", "Sin", B("س", 0, "none"), ["shin", "sad", "tha"]),
  L("shin", "ش", "شِين", "Shin", B("س", 3, "above"), ["sin", "tha"]),
  L("sad", "ص", "صَاد", "Ṣad", B("ص", 0, "none"), ["dad", "sin", "tta"]),
  L("dad", "ض", "ضَاد", "Ḍad", B("ص", 1, "above"), ["sad", "dal", "zza"]),
  L("tta", "ط", "طَا", "Ṭa", B("ط", 0, "none"), ["zza", "ta"]),
  L("zza", "ظ", "ظَا", "Ẓa", B("ط", 1, "above"), ["tta", "dhal", "zay", "dad"]),
  L("ayn", "ع", "عَيْن", "ʿAyn", B("ع", 0, "none"), ["ghayn", "hamza", "alif"]),
  L("ghayn", "غ", "غَيْن", "Ghayn", B("ع", 1, "above"), ["ayn", "kha"]),
  L("fa", "ف", "فَا", "Fa", B(DOTLESS_FA, 1, "above"), ["qaf"]),
  L("qaf", "ق", "قَاف", "Qaf", B(DOTLESS_QAF, 2, "above"), ["fa", "kaf"]),
  L("kaf", "ك", "كَاف", "Kaf", undefined, ["qaf", "lam"]),
  L("lam", "ل", "لَام", "Lam", undefined, ["kaf", "alif"]),
  L("mim", "م", "مِيم", "Mim", undefined, ["nun", "ha"]),
  L("nun", "ن", "نُون", "Nun", B(DOTLESS_NUN, 1, "above"), ["ba", "ta", "mim"]),
  L("waw", "و", "وَاو", "Waw", undefined, ["ra", "zay"]),
  L("ha", "ه", "هَا", "Ha", undefined, ["hha", "mim"]),
  L("hamza", "ء", "هَمْزَة", "Hamza", undefined, ["alif", "ayn"]),
  // The Qaida writes ya without dots (ى) and also shows the long form (ے); both are read "يا".
  L("ya", "ى", "يَا", "Ya", undefined, ["ya2", "nun", "ba"]),
  L("ya2", "ے", "يَا", "Ya (long form)", undefined, ["ya", "ra"]),
];

/** The default session for one group of letters: HEAR → SEE → IDENTIFY → BUILD → READ → MASTER. */
const session: ActivitySpec[] = [
  { type: "meet", rounds: 1, difficulty: 1 },
  { type: "listenFind", rounds: 5, difficulty: 1, choices: 3 },
  { type: "hearMatch", rounds: 1, difficulty: 1, choices: 3 },
  { type: "build", rounds: 3, difficulty: 1 },
  { type: "different", rounds: 3, difficulty: 2 },
  { type: "readAloud", rounds: 3, difficulty: 1 },
  { type: "characterGame", rounds: 5, difficulty: 2, choices: 3 },
  { type: "review", rounds: 6, difficulty: 2, choices: 4 },
];

const group = (id: string, ids: string[], en: string): NooraniSkill => ({
  id,
  ar: ids.map((i) => unit1Items.find((x) => x.id === i)!.glyph).join(" "),
  en,
  itemIds: ids,
  activities: session,
});

export const unit1Letters: NooraniUnit = {
  id: "u1-letters",
  level: 1,
  ar: "الْحُرُوفُ الْمُفْرَدَة",
  en: "Single letters",
  source: {
    book: "القاعدة النورانية",
    lesson: 1,
    ar: "الدَّرْسُ الْأَوَّل: الْحُرُوفُ الْهِجَائِيَّةُ الْمُفْرَدَة",
    en: "Lesson 1 — the single letters, in Qaida order",
    note: "Verified against the family's PDF, p. 6 — rows of five, ending و ه ء ى ے.",
  },
  items: unit1Items,
  skills: [
    group("u1-g1", ["alif", "ba", "ta", "tha", "jim"], "Alif to Jim"),
    group("u1-g2", ["hha", "kha", "dal", "dhal", "ra"], "Ḥa to Ra"),
    group("u1-g3", ["zay", "sin", "shin", "sad", "dad"], "Zay to Ḍad"),
    group("u1-g4", ["tta", "zza", "ayn", "ghayn", "fa"], "Ṭa to Fa"),
    group("u1-g5", ["qaf", "kaf", "lam", "mim", "nun"], "Qaf to Nun"),
    group("u1-g6", ["waw", "ha", "hamza", "ya", "ya2"], "Waw to Ya"),
  ],
};
