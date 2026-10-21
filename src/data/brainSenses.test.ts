// Run with: bun test src/data/brainSenses.test.ts
import { describe, expect, test } from "bun:test";
import {
  BRAIN_REGIONS,
  BRAIN_ROLE_DISTRACTORS,
  CHALLENGE_IDS,
  MEMORY_FACTS,
  REFLEX_COMPARE,
  REFLEX_STEPS,
  SENSE_SCENARIOS,
  SENSE_STATIONS,
  TOUCH_JOURNEY,
  VISION_JOURNEY,
  makePattern,
  observationQuestion,
  patternMatches,
  rotateOptions,
} from "./brainSenses";

describe("Brain Control Room content", () => {
  test("covers the four required regions with discover and investigate text", () => {
    expect(BRAIN_REGIONS.map((r) => r.id).sort()).toEqual([
      "brainstem",
      "cerebellum",
      "cerebrum",
      "spinalCord",
    ]);
    for (const r of BRAIN_REGIONS) {
      expect(r.discover.length).toBeGreaterThan(30);
      expect(r.investigate.length).toBeGreaterThan(100);
      expect(r.injury.length).toBeGreaterThan(20);
    }
  });

  test("never claims a region owns a behaviour exclusively", () => {
    const all = BRAIN_REGIONS.map((r) => `${r.discover} ${r.investigate} ${r.injury}`).join(" ");
    expect(all).not.toMatch(/only (the|this) (part|area|region)/i);
    expect(all).not.toMatch(/exclusively/i);
  });

  test("every match challenge has three distinct roles with the correct one present once", () => {
    for (const r of BRAIN_REGIONS.slice(0, 3)) {
      const c = rotateOptions(r.mainRole, BRAIN_ROLE_DISTRACTORS[r.id], 1);
      expect(c.options.length).toBe(3);
      expect(new Set(c.options).size).toBe(3);
      expect(c.options[c.correctIndex]).toBe(r.mainRole);
    }
  });
});

describe("Follow a Signal content", () => {
  test("touch journey has the five required stages in order", () => {
    expect(TOUCH_JOURNEY.length).toBe(5);
    expect(TOUCH_JOURNEY.map((s) => s.stop)).toEqual(["skin", "nerve", "spine", "brain", "muscle"]);
  });

  test("vision journey explains the brain interprets signals, not the eye", () => {
    const brain = VISION_JOURNEY[VISION_JOURNEY.length - 1].text;
    expect(brain).toMatch(/interprets/);
    expect(brain).toMatch(/not a complete picture|does not see/i);
  });
});

describe("Five Senses content", () => {
  test("has five stations, each with a valid question", () => {
    expect(SENSE_STATIONS.map((s) => s.id)).toEqual([
      "vision",
      "hearing",
      "smell",
      "taste",
      "touch",
    ]);
    for (const s of SENSE_STATIONS) {
      expect(s.structures.length).toBeGreaterThan(1);
      const q = s.question.choice;
      expect(q.options.length).toBe(3);
      expect(new Set(q.options).size).toBe(3);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(3);
    }
  });

  test("taste lists the five basic tastes and separates taste from flavour", () => {
    const taste = SENSE_STATIONS.find((s) => s.id === "taste")!;
    const all = `${taste.discover} ${taste.investigate} ${taste.structures.map((x) => x.text).join(" ")}`;
    for (const t of ["sweet", "sour", "salty", "bitter", "umami"])
      expect(all.toLowerCase()).toContain(t);
    expect(taste.investigate).toMatch(/flavour/i);
  });

  test("touch does not imply one universal receptor", () => {
    const touch = SENSE_STATIONS.find((s) => s.id === "touch")!;
    expect(touch.investigate).toMatch(/not one single receptor/i);
  });

  test("sense scenarios use real station ids", () => {
    const ids = SENSE_STATIONS.map((s) => s.id);
    for (const s of SENSE_SCENARIOS) expect(ids).toContain(s.sense);
  });
});

describe("Reflex and memory content", () => {
  test("reflex steps and comparison items are present", () => {
    expect(REFLEX_STEPS.length).toBe(4);
    expect(REFLEX_COMPARE.some((c) => c.automatic)).toBe(true);
    expect(REFLEX_COMPARE.some((c) => !c.automatic)).toBe(true);
  });

  test("memory facts avoid the file-folder idea and intelligence claims", () => {
    const all = MEMORY_FACTS.join(" ");
    expect(all).toMatch(/not stored as tiny files/i);
    expect(all).not.toMatch(/intelligence|IQ/i);
  });

  test("pattern generator is deterministic and within nine tiles", () => {
    expect(makePattern(4, 7)).toEqual(makePattern(4, 7));
    for (const v of makePattern(8, 3)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(9);
    }
  });

  test("pattern check needs exact order and length", () => {
    expect(patternMatches([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(patternMatches([1, 2, 3], [1, 3, 2])).toBe(false);
    expect(patternMatches([1, 2, 3], [1, 2])).toBe(false);
  });

  test("observation question has the right answer among the options", () => {
    const scene = ["🍎", "🐶", "🎈"];
    for (let seed = 0; seed < 6; seed++) {
      const q = observationQuestion(scene, seed);
      expect(q.options[q.correctIndex]).toBe(q.answer);
      expect(scene).toContain(q.answer);
    }
  });
});

describe("challenge ids", () => {
  test("are unique", () => {
    expect(new Set(CHALLENGE_IDS).size).toBe(CHALLENGE_IDS.length);
  });
});
