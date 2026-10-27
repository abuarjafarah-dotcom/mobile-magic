import { describe, expect, test } from "bun:test";
import { juz23Surahs } from "./surahsJuz23";
import { juz24Surahs } from "./surahsJuz24";
import { juz25Surahs } from "./surahsJuz25";
import { juz26Surahs } from "./surahsJuz26";
import { automaticMemorization } from "../lib/quranMemorization";

const lists = [juz23Surahs, juz24Surahs, juz25Surahs, juz26Surahs];
const counts = [182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60];

describe("Juz 23–26 complete surahs and shared memorization", () => {
  test("all four requested Juz include the surahs starting there", () => {
    expect(lists.map((list) => list.map((s) => s.number))).toEqual([
      [37, 38, 39],
      [40, 41],
      [42, 43, 44, 45],
      [46, 47, 48, 49, 50, 51],
    ]);
  });
  test("every surah is complete and recordings follow exact ayah order", () => {
    lists.flat().forEach((surah, index) => {
      expect(surah.firstAyah ?? 1).toBe(1);
      expect(surah.verses.length).toBe(counts[index]);
      surah.verses.forEach((verse, i) => {
        expect(verse.audio).toBe(
          `https://audio-cdn.tarteel.ai/quran/alnufais/${String(surah.number).padStart(3, "0")}${String(i + 1).padStart(3, "0")}.mp3`,
        );
        expect(verse.arabic).toMatch(/[ً-ٰٟ]/);
      });
    });
  });
  test("memorization groups cover every ayah once with independent progress", () => {
    const setups = lists.flat().map(automaticMemorization);
    expect(new Set(setups.map((s) => s.key)).size).toBe(15);
    lists.flat().forEach((surah, i) => {
      const covered = setups[i].groups.flatMap(({ from, to }) =>
        Array.from({ length: to - from + 1 }, (_, j) => from + j),
      );
      expect(covered).toEqual(Array.from({ length: counts[i] }, (_, j) => j + 1));
    });
  });
});
