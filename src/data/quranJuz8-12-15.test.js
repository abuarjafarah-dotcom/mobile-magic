import { describe, expect, test } from "bun:test";
import { juz8Surahs } from "./surahsJuz8";
import { juz12Surahs } from "./surahsJuz12";
import { juz13Surahs } from "./surahsJuz13";
import { juz14Surahs } from "./surahsJuz14";
import { juz15MoreSurahs } from "./surahsJuz15b";
import { juz15Surahs } from "./surahsJuz15";
import { automaticMemorization } from "../lib/quranMemorization";

const lists = [juz8Surahs, juz12Surahs, juz13Surahs, juz14Surahs, [...juz15MoreSurahs, ...juz15Surahs]];
const counts = [206, 111, 43, 52, 99, 128, 111, 110];
describe("Juz 8, 12, 13, 14, 15 complete surahs", () => {
  test("each requested Juz has its starting surahs, without duplicating Al-Kahf", () => {
    expect(lists.map(list => list.map(s => s.number))).toEqual([[7], [12], [13, 14], [15, 16], [17, 18]]);
    expect(new Set(lists.flat().map(s => s.id)).size).toBe(8);
  });
  test("all verses start at one, have harakat, and use correctly ordered Al-Nufais audio", () => {
    lists.flat().forEach((surah, index) => {
      expect(surah.firstAyah ?? 1).toBe(1);
      expect(surah.verses.length).toBe(counts[index]);
      surah.verses.forEach((verse, i) => {
        expect(verse.audio).toBe(`https://audio-cdn.tarteel.ai/quran/alnufais/${String(surah.number).padStart(3, "0")}${String(i + 1).padStart(3, "0")}.mp3`);
        expect(verse.arabic).toMatch(/[\u064B-\u065F\u0670]/);
      });
    });
  });
  test("memorization covers every ayah exactly once with independent progress", () => {
    const setups = lists.flat().map(automaticMemorization);
    expect(new Set(setups.map(s => s.key)).size).toBe(8);
    setups.forEach((setup, index) => {
      const covered = setup.groups.flatMap(({ from, to }) => Array.from({ length: to - from + 1 }, (_, i) => from + i));
      expect(covered).toEqual(Array.from({ length: counts[index] }, (_, i) => i + 1));
    });
  });
});