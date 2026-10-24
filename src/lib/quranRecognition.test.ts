// Run with: bun test src/lib/quranRecognition.test.ts
import { describe, expect, test } from "bun:test";
import { matchedPrefix, normAr, progressFromResults, tokens, wordMatches } from "./quranRecognition";

// Build a fake SpeechRecognitionResultList: each inner array is one result's alternatives.
const results = (segments: string[][]) => segments.map((alts) => alts.map((transcript) => ({ transcript })));
const targets = ["بسم", "الله", "الرحمن"].map(normAr);

describe("normAr", () => {
  test("drops harakat and unifies alef variants", () => {
    expect(normAr("بِسْمِ")).toBe("بسم");
    expect(normAr("ٱلْحَمْدُ")).toBe("الحمد");
    expect(normAr("أَلْحَمْدُ")).toBe("الحمد");
  });

  test("drops non-letter marks such as waqf signs", () => {
    expect(normAr("ۖ")).toBe("");
  });
});

describe("wordMatches", () => {
  test("matches the same word with and without harakat", () => {
    expect(wordMatches(normAr("الحمد"), normAr("ٱلْحَمْدُ"))).toBe(true);
  });

  test("accepts a word heard with a common prefix", () => {
    expect(wordMatches(normAr("والله"), normAr("الله"))).toBe(true);
  });

  test("never confuses short words (3 letters must match exactly)", () => {
    expect(wordMatches(normAr("فرح"), normAr("فتح"))).toBe(false);
  });

  test("allows one letter of difference for longer words", () => {
    expect(wordMatches(normAr("الرحمان"), normAr("الرحمن"))).toBe(true);
  });

  test("does not award a longer word just because it contains the expected one", () => {
    expect(wordMatches(normAr("الرحمنالرحيم"), normAr("الرحمن"))).toBe(false);
  });

  test("ignores empty input", () => {
    expect(wordMatches("", "بسم")).toBe(false);
  });
});

describe("matchedPrefix", () => {
  test("advances through words in order", () => {
    expect(matchedPrefix(tokens("بسم الله الرحمن"), targets)).toBe(3);
  });

  test("a single skipped word does not block later words", () => {
    expect(matchedPrefix(tokens("بسم الرحمن"), targets)).toBe(3);
  });

  test("words out of order do not advance past the expected word", () => {
    expect(matchedPrefix(tokens("الرحمن"), targets)).toBe(3); // lookahead covers it
    expect(matchedPrefix(tokens("غير"), targets)).toBe(0);
  });
});

describe("progressFromResults", () => {
  test("counts words across separate utterances", () => {
    expect(progressFromResults(results([["بسم"], ["الله"]]), targets)).toBe(2);
  });

  test("uses a later alternative when the first one is wrong", () => {
    expect(progressFromResults(results([["غير", "بسم"]]), targets)).toBe(1);
  });

  test("one spoken word is never counted twice across alternatives", () => {
    // Two alternatives for the same speech both say "بسم": that is one word, not two.
    expect(progressFromResults(results([["بسم", "بسم"]]), targets)).toBe(1);
  });

  test("a repeated utterance does not advance further (duplicate events are harmless)", () => {
    const once = progressFromResults(results([["بسم"]]), targets);
    const twice = progressFromResults(results([["بسم"], ["بسم"]]), targets);
    expect(once).toBe(1);
    expect(twice).toBe(1);
  });

  test("the same events read twice give the same progress", () => {
    const evs = results([["بسم", "بسم الله"], ["الرحمن"]]);
    expect(progressFromResults(evs, targets)).toBe(progressFromResults(evs, targets));
  });

  test("starts from an earlier offset without counting old results", () => {
    expect(progressFromResults(results([["بسم"], ["الله"]]), targets, 1)).toBe(2);
  });

  test("empty session makes no progress", () => {
    expect(progressFromResults(results([]), targets)).toBe(0);
  });
});

// Not covered by unit tests (browser-only, needs real audio or timers):
// - recognition timeouts / onerror recovery, audio-resource cleanup (see MicCheck),
// - quiet versus normal-volume speech (needs representative recordings).
