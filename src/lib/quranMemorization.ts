import type { SurahData } from "@/data/surahs";

/** Use the existing small-group lesson flow, with separate progress per surah. */
export function automaticMemorization(surah: SurahData) {
  const count = surah.verses.length;
  const size = count <= 5 ? (count <= 3 ? count : Math.ceil(count / 2)) : count <= 12 ? 3 : 4;
  const groups: { from: number; to: number }[] = [];
  for (let from = 1; from <= count; from += size) {
    groups.push({ from, to: Math.min(count, from + size - 1) });
  }
  const short = surah.name.replace(/^Surah /, "");
  return {
    groups,
    key: `${surah.id}-memorize-v1`,
    ayahKey: `${surah.id}-memorize-ayahs-v1`,
    title: `Memorize ${short}`,
    done: `You memorized Surat ${short}!`,
  };
}
