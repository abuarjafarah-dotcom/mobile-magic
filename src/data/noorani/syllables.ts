// Syllable (letter + harakah) and blend (syllables read together) factories.
// Every syllable/blend is plain data, so recordings can replace device voice item by item.
import { curriculumAudio } from "@/data/arabicCurriculumAudio";
import type { Haraka, NooraniItem } from "./types";
import { unit1Items } from "./unit1Letters";

export const HARAKAT: Haraka[] = ["fatha", "kasra", "damma"];
export const MARK: Record<Haraka, string> = { fatha: "َ", kasra: "ِ", damma: "ُ" };
export const HARAKA_NAME: Record<Haraka, { ar: string; en: string; sound: string }> = {
  fatha: { ar: "الْفَتْحَة", en: "Fatha", sound: "short “a” sound" },
  kasra: { ar: "الْكَسْرَة", en: "Kasra", sound: "short “i” sound" },
  damma: { ar: "الضَّمَّة", en: "Damma", sound: "short “u” sound" },
};
const SHORT: Record<Haraka, "a" | "i" | "u"> = { fatha: "a", kasra: "i", damma: "u" };

const letterGlyph = Object.fromEntries(unit1Items.map((i) => [i.id, i.glyph])) as Record<
  string,
  string
>;
letterGlyph.ya = "ي"; // with harakat the Qaida's ya takes its dotted medial/initial shape (p. 10)

/** Alif carries a harakah on its hamza seat, as on p. 10 of the Qaida (أَ إِ أُ). */
const glyphOf = (letterId: string, h: Haraka) =>
  letterId === "alif"
    ? h === "kasra"
      ? "إِ"
      : h === "fatha"
        ? "أَ"
        : "أُ"
    : `${letterGlyph[letterId]}${MARK[h]}`;

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
  const clip = clipKey ? curriculumAudio[`harakat-${clipKey}-${SHORT[haraka]}`] : undefined;
  const item: NooraniItem = {
    id,
    glyph,
    say: glyph,
    en: `${letterId} + ${HARAKA_NAME[haraka].en.toLowerCase()}`,
    letter: letterId === "alif" ? "ا" : letterGlyph[letterId]!,
    haraka,
    confusable: HARAKAT.filter((h) => h !== haraka).map((h) => `${letterId}-${SHORT[h]}`),
    ...(letterId !== "alif"
      ? { build: { kind: "mark" as const, base: letterGlyph[letterId]!, mark: haraka } }
      : {}),
    ...(clip ? { audio: { target: clip } } : {}),
  };
  registry.set(id, item);
  meta.set(id, { letterId, haraka });
  return item;
}

/** All three harakat on each letter, grouped by harakah (fatha → kasra → damma) for teaching order. */
export const syllablesFor = (letterIds: string[]) =>
  HARAKAT.flatMap((h) => letterIds.map((l) => syl(l, h)));

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
  const m = /^(.+)-([aiu])$/.exec(id);
  if (!m) throw new Error(`Unknown syllable ${id}`);
  const h = Object.entries(SHORT).find(([, v]) => v === m[2])![0] as Haraka;
  return syl(m[1]!, h);
}

export const itemById = (id: string) => registry.get(id);

/**
 * Alternatives that differ by exactly ONE harakah — so a child can only pick the right one by
 * decoding the marks, never by the overall shape, colour or position.
 */
export function harakahVariants(item: NooraniItem): NooraniItem[] {
  if (item.haraka) {
    const m = meta.get(item.id);
    return m ? HARAKAT.filter((h) => h !== m.haraka).map((h) => syl(m.letterId, h)) : [];
  }
  if (item.segments) {
    const out: NooraniItem[] = [];
    item.segments.forEach((segId, pos) => {
      const m = meta.get(segId) ?? meta.get(sylFromId(segId).id)!;
      for (const h of HARAKAT) {
        if (h === m.haraka) continue;
        const segs = [...item.segments!];
        segs[pos] = syl(m.letterId, h).id;
        out.push(blend(segs));
      }
    });
    return out;
  }
  return [];
}
