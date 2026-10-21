// Level 6 — الْحُرُوفُ الْمُرَكَّبَة وَالْمُقَطَّعَة (Qaida lessons 2–3, pp. 7 and 9).
// Lesson 2: letters joined into one shape (لا، با، كب، بكت). Lesson 3: the muqattaʿat, isolated letters at
// the start of some surahs (الم، طه، يس). Items are plain letters: the font joins them, so the shapes are
// the Qaida's own. Distractors: the same shape with one letter changed (the closest mistake).
// Muqattaʿat forms are the Qaida's list (p. 9). Some (المص، كهيعص، طسم، عسق، طس) are not in the repo's
// verified Qur'an text, so they are marked in the note for a check before release.
import type { ActivitySpec, NooraniItem, NooraniSkill, NooraniUnit } from "./types";

const item = (glyph: string, id: string, en: string, alternates: NooraniItem[] = []): NooraniItem => ({
  id,
  glyph,
  say: glyph,
  en,
  alternates,
});

/** Each item's alternates: the two nearest other forms in the same group (one letter apart). */
function withContrast(group: { glyph: string; id: string; en: string }[]): NooraniItem[] {
  return group.map((g, i) => {
    const others = group
      .filter((_, j) => j !== i)
      .slice(0, 2)
      .map((o) => item(o.glyph, `${o.id}-alt`, o.en));
    return item(g.glyph, g.id, g.en, others);
  });
}

// ── Lesson 2 (p. 7): one letter joined to alif ──
const joinAlifA = withContrast(
  [
    { glyph: "با", id: "j-ba-alif", en: "ba + alif" },
    { glyph: "تا", id: "j-ta-alif", en: "ta + alif" },
    { glyph: "ثا", id: "j-tha-alif", en: "tha + alif" },
    { glyph: "جا", id: "j-jim-alif", en: "jim + alif" },
    { glyph: "حا", id: "j-ha-alif", en: "ha + alif" },
    { glyph: "خا", id: "j-kha-alif", en: "kha + alif" },
    { glyph: "سا", id: "j-sin-alif", en: "sin + alif" },
    { glyph: "شا", id: "j-shin-alif", en: "shin + alif" },
    { glyph: "صا", id: "j-sad-alif", en: "sad + alif" },
    { glyph: "عا", id: "j-ayn-alif", en: "ʿayn + alif" },
  ],
);
const joinAlifB = withContrast(
  [
    { glyph: "فا", id: "j-fa-alif", en: "fa + alif" },
    { glyph: "قا", id: "j-qaf-alif", en: "qaf + alif" },
    { glyph: "كا", id: "j-kaf-alif", en: "kaf + alif" },
    { glyph: "لا", id: "j-lam-alif", en: "lam + alif" },
    { glyph: "ما", id: "j-mim-alif", en: "mim + alif" },
    { glyph: "نا", id: "j-nun-alif", en: "nun + alif" },
    { glyph: "ها", id: "j-ha2-alif", en: "ha + alif (end)" },
    { glyph: "يا", id: "j-ya-alif", en: "ya + alif" },
  ],
);

// ── Lesson 2 (p. 7): two and three letters joined in one shape ──
const joinedWords = withContrast(
  [
    { glyph: "كب", id: "j-kaf-ba", en: "kaf + ba" },
    { glyph: "بكت", id: "j-ba-kaf-ta", en: "ba + kaf + ta" },
    { glyph: "تكت", id: "j-ta-kaf-ta", en: "ta + kaf + ta" },
    { glyph: "بلب", id: "j-ba-lam-ba", en: "ba + lam + ba" },
    { glyph: "لم", id: "j-lam-mim", en: "lam + mim" },
    { glyph: "نب", id: "j-nun-ba", en: "nun + ba" },
  ],
);

// ── Lesson 3 (p. 9): الحروف المقطعة — isolated letters at the start of a surah ──
const muqattaat = withContrast(
  [
    { glyph: "الم", id: "m-alif-lam-mim", en: "Alif Lam Mim" },
    { glyph: "الر", id: "m-alif-lam-ra", en: "Alif Lam Ra" },
    { glyph: "المص", id: "m-alif-lam-mim-sad", en: "Alif Lam Mim Sad" },
    { glyph: "المر", id: "m-alif-lam-mim-ra", en: "Alif Lam Mim Ra" },
    { glyph: "طه", id: "m-ta-ha", en: "Ta Ha" },
    { glyph: "طسم", id: "m-ta-sin-mim", en: "Ta Sin Mim" },
    { glyph: "طس", id: "m-ta-sin", en: "Ta Sin" },
    { glyph: "يس", id: "m-ya-sin", en: "Ya Sin" },
    { glyph: "كهيعص", id: "m-kaf-ha-ya-ayn-sad", en: "Kaf Ha Ya ʿAyn Sad" },
    { glyph: "حم", id: "m-ha-mim", en: "Ha Mim" },
    { glyph: "عسق", id: "m-ayn-sin-qaf", en: "ʿAyn Sin Qaf" },
    { glyph: "ص", id: "m-sad", en: "Sad" },
    { glyph: "ق", id: "m-qaf", en: "Qaf" },
    { glyph: "ن", id: "m-nun", en: "Nun" },
  ],
);

const session = (rounds: number): ActivitySpec[] => [
  { type: "listenFind", rounds, difficulty: 2, choices: 3, prompt: "listenFind" },
  { type: "readChoose", rounds: 4, difficulty: 2, choices: 3, prompt: "readIt" },
  { type: "challenge", rounds: 6, difficulty: 2, choices: 3 },
  { type: "review", rounds: 6, difficulty: 2, choices: 3 },
];
const skill = (id: string, items: NooraniItem[], en: string, rounds: number): NooraniSkill => ({
  id,
  ar: items.slice(0, 3).map((i) => i.glyph).join(" "),
  en,
  itemIds: items.map((i) => i.id),
  activities: session(rounds),
});

export const unit6Joined: NooraniUnit = {
  id: "u6-joined",
  level: 6,
  ar: "الْحُرُوفُ الْمُرَكَّبَة وَالْمُقَطَّعَة",
  en: "Joined letters · Muqattaʿat",
  source: {
    book: "القاعدة النورانية",
    lesson: 2,
    ar: "الدَّرْسُ الثَّانِي وَالدَّرْسُ الثَّالِث: الْحُرُوفُ الْمُرَكَّبَةُ وَالْمُقَطَّعَة",
    en: "Qaida lessons 2–3 — joined letters, then the muqattaʿat (book pp. 7 and 9)",
    note: "Muqattaʿat forms follow the Qaida's p. 9 list. Five are not in the repo's verified Qur'an text (المص، كهيعص، طسم، طس، عسق); check them before release.",
  },
  items: [...joinAlifA, ...joinAlifB, ...joinedWords, ...muqattaat],
  skills: [
    skill("u6-g1", joinAlifA, "Letter + alif · group A", 6),
    skill("u6-g2", joinAlifB, "Letter + alif · group B", 6),
    skill("u6-g3", joinedWords, "Joined words", 6),
    skill("u6-g4", muqattaat, "Muqattaʿat", 6),
  ],
  completion: [
    { ar: "الْحُرُوفُ الْمُرَكَّبَة", en: "Joined letters" },
    { ar: "الْحُرُوفُ الْمُقَطَّعَة", en: "Muqattaʿat" },
  ],
};
