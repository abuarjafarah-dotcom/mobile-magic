// Syllable (letter + harakah) and blend (syllables read together) factories.
// Every syllable/blend is plain data, so recordings can replace device voice item by item.
import { curriculumAudio } from "@/data/arabicCurriculumAudio";
import type { Haraka, NooraniItem } from "./types";
import { unit1Items } from "./unit1Letters";

/** The three short vowels. Sukoon (Level 4) is a mark but not a vowel, so it is kept apart. */
export const HARAKAT: Haraka[] = ["fatha", "kasra", "damma"];
export const ALL_MARKS: Haraka[] = [...HARAKAT, "sukoon"];
export const TANWEEN: Haraka[] = ["fathatan", "kasratan", "dammatan"];
/** Short vowels and their tanween side by side: َ ً ِ ٍ ُ ٌ */
export const VOWELS_AND_TANWEEN: Haraka[] = [
  "fatha",
  "fathatan",
  "kasra",
  "kasratan",
  "damma",
  "dammatan",
];
export const EVERY_MARK: Haraka[] = [...VOWELS_AND_TANWEEN, "sukoon"];
/** Tanween ↔ its single short vowel (بً ↔ بَ). */
export const SHORT_OF: Partial<Record<Haraka, Haraka>> = {
  fathatan: "fatha",
  kasratan: "kasra",
  dammatan: "damma",
};
export const TANWEEN_OF: Partial<Record<Haraka, Haraka>> = {
  fatha: "fathatan",
  kasra: "kasratan",
  damma: "dammatan",
};
export const MARK: Record<Haraka, string> = {
  fathatan: "\u064B",
  kasratan: "\u064D",
  dammatan: "\u064C",
  fatha: "\u064E",
  kasra: "\u0650",
  damma: "\u064F",
  sukoon: "\u0652",
};
export const HARAKA_NAME: Record<Haraka, { ar: string; en: string; sound: string }> = {
  fatha: { ar: "الْفَتْحَة", en: "Fatha", sound: "short “a” sound" },
  kasra: { ar: "الْكَسْرَة", en: "Kasra", sound: "short “i” sound" },
  damma: { ar: "الضَّمَّة", en: "Damma", sound: "short “u” sound" },
  sukoon: { ar: "السُّكُون", en: "Sukoon", sound: "no short vowel" },
  fathatan: { ar: "فَتْحَتَان", en: "Fathatan", sound: "two fathas" },
  kasratan: { ar: "كَسْرَتَان", en: "Kasratan", sound: "two kasras" },
  dammatan: { ar: "ضَمَّتَان", en: "Dammatan", sound: "two dammas" },
};
const SHORT: Record<Haraka, string> = {
  fatha: "a",
  kasra: "i",
  damma: "u",
  sukoon: "o",
  fathatan: "an",
  kasratan: "in",
  dammatan: "un",
};

const letterGlyph = Object.fromEntries(unit1Items.map((i) => [i.id, i.glyph])) as Record<
  string,
  string
>;
letterGlyph.ya = "ي"; // with harakat the Qaida's ya takes its dotted medial/initial shape (p. 10)

/** Alif carries a harakah on its hamza seat, as on p. 10 of the Qaida (أَ إِ أُ). */
const ALIF: Partial<Record<Haraka, string>> = {
  fatha: "أَ",
  kasra: "إِ",
  damma: "أُ",
  fathatan: "أً",
  kasratan: "إٍ",
  dammatan: "أٌ",
};
/** Fathatan is written with an alif after it, as on p. 11 of the Qaida (بًا مًا ثًا). */
const glyphOf = (letterId: string, h: Haraka) =>
  letterId === "alif"
    ? (ALIF[h] ?? "أَ")
    : `${letterGlyph[letterId]}${MARK[h]}${h === "fathatan" ? "ا" : ""}`;
// (alif never takes sukoon in these lessons; أَبْ puts the sukoon on the second letter)

const registry = new Map<string, NooraniItem>();
const meta = new Map<string, { letterId: string; haraka: Haraka }>();

/** One syllable, e.g. syl("ba", "kasra") → بِ. Same id always returns the same object. */
export function syl(letterId: string, haraka: Haraka): NooraniItem {
  const id = `${letterId}-${SHORT[haraka]}`;
  const known = registry.get(id);
  if (known) return known;
  const glyph = glyphOf(letterId, haraka);
  // Recorded female clips already exist for ب ت م with each harakah (Arabic path "harakat" unit).
  const clipKey = ({ ba: "ba", ta: "ta", mim: "ma" } as Record<string, string>)[letterId];
  // …and for بً بٍ بٌ (tanween).
  const clip =
    letterId === "ba" && TANWEEN.includes(haraka)
      ? curriculumAudio[`harakat-b${SHORT[haraka]}`]
      : clipKey
        ? curriculumAudio[`harakat-${clipKey}-${SHORT[haraka]}`]
        : undefined;
  const item: NooraniItem = {
    id,
    glyph,
    say: glyph,
    en: `${letterId} + ${HARAKA_NAME[haraka].en.toLowerCase()}`,
    letter: letterId === "alif" ? "ا" : letterGlyph[letterId]!,
    haraka,
    confusable: HARAKAT.filter((h) => h !== haraka).map((h) => `${letterId}-${SHORT[h]}`),
    // Level 4: a sukoon letter's natural contrast is the same letter with a vowel.
    ...(letterId !== "alif"
      ? { build: { kind: "mark" as const, base: letterGlyph[letterId]!, mark: haraka } }
      : {}),
    ...(clip ? { audio: { target: clip } } : {}),
  };
  registry.set(id, item);
  meta.set(id, { letterId, haraka });
  return item;
}

/** All three harakat (or the given marks) on each letter, grouped by mark for teaching order. */
export const syllablesFor = (letterIds: string[], marks: Haraka[] = HARAKAT) =>
  marks.flatMap((h) => letterIds.map((l) => syl(l, h)));

/** A reading made of syllables, e.g. blend(["ba-a","ta-a"]) → بَتَ. `blended` = optional dedicated recording. */
export function blend(segmentIds: string[], blended?: string): NooraniItem {
  const segs = segmentIds.map((s) => registry.get(s) ?? sylFromId(s));
  const glyph = segs.map((s) => s.glyph).join("");
  const id = `bl:${segmentIds.join("+")}`;
  const known = registry.get(id);
  if (known) return known;
  const item: NooraniItem = {
    id,
    glyph,
    say: glyph,
    en: segs.map((s) => s.en).join(" · "),
    segments: segmentIds,
    ...(blended ? { audio: { target: blended } } : {}),
  };
  registry.set(id, item);
  return item;
}

function sylFromId(id: string): NooraniItem {
  const m = /^(.+)-(an|in|un|a|i|u|o)$/.exec(id);
  if (!m) throw new Error(`Unknown syllable ${id}`);
  const h = Object.entries(SHORT).find(([, v]) => v === m[2])![0] as Haraka;
  return syl(m[1]!, h);
}

export const itemById = (id: string) => registry.get(id);

const involves = (item: NooraniItem, marks: Haraka[]) =>
  marks.includes(item.haraka!) ||
  (item.segments ?? []).some((id) => marks.includes(meta.get(id)?.haraka as Haraka));

/** The same syllable or reading with the LAST mark changed, e.g. withMark(مَنْ, "fatha") → مَنَ. */
export function withMark(item: NooraniItem, h: Haraka): NooraniItem {
  if (item.haraka) {
    const m = meta.get(item.id)!;
    return syl(m.letterId, h);
  }
  const segs = [...(item.segments ?? [])];
  const last = meta.get(segs[segs.length - 1]!)!;
  segs[segs.length - 1] = syl(last.letterId, h).id;
  return blend(segs);
}

/**
 * Alternatives that differ by exactly ONE mark — so a child can only pick the right one by
 * decoding the marks, never by the overall shape, colour or position.
 * Base set = the three short vowels, plus `extra` (Level 4: sukoon, Level 5: tanween), plus
 * whatever the item itself already uses. Rules that keep every option a real reading:
 *   - a reading never starts with sukoon (position 0);
 *   - tanween only ever ends a reading (last position);
 *   - alif never takes sukoon.
 */
export function harakahVariants(item: NooraniItem, extra?: Haraka | Haraka[]): NooraniItem[] {
  const marks = [...HARAKAT];
  for (const h of Array.isArray(extra) ? extra : extra ? [extra] : [])
    if (!marks.includes(h)) marks.push(h);
  if (involves(item, ["sukoon"]) && !marks.includes("sukoon")) marks.push("sukoon");
  if (involves(item, TANWEEN)) for (const h of TANWEEN) if (!marks.includes(h)) marks.push(h);
  if (item.haraka) {
    const m = meta.get(item.id);
    if (!m) return [];
    return marks
      .filter((h) => h !== m.haraka && !(m.letterId === "alif" && h === "sukoon"))
      .map((h) => syl(m.letterId, h));
  }
  if (item.segments) {
    const out: NooraniItem[] = [];
    const lastPos = item.segments.length - 1;
    item.segments.forEach((segId, pos) => {
      const m = meta.get(segId) ?? meta.get(sylFromId(segId).id)!;
      for (const h of marks) {
        if (
          h === m.haraka ||
          (pos === 0 && h === "sukoon") ||
          (pos !== lastPos && TANWEEN.includes(h)) ||
          (m.letterId === "alif" && h === "sukoon")
        )
          continue;
        const segs = [...item.segments!];
        segs[pos] = syl(m.letterId, h).id;
        out.push(blend(segs));
      }
    });
    return out;
  }
  return [];
}
