// Run with: bun test src/data/humanBiology.test.ts
import { describe, expect, test } from "bun:test";
import { LABS, ORGANS, ORGAN_IDS, matchOptions, organById } from "./humanBiology";
import { ORGAN_DRAW_ORDER, ORGAN_SHAPES } from "./humanBiologyBody";

describe("Human Biology Lab content", () => {
  test("has the six initial structures with unique ids", () => {
    expect(ORGANS.length).toBe(6);
    expect(new Set(ORGAN_IDS).size).toBe(6);
    expect([...ORGAN_IDS].sort()).toEqual([
      "brain",
      "heart",
      "lungs",
      "skeleton",
      "smallIntestine",
      "stomach",
    ]);
  });

  test("every organ has the required content fields filled in", () => {
    for (const o of ORGANS) {
      expect(o.name.length).toBeGreaterThan(0);
      expect(o.discover.length).toBeGreaterThan(20);
      expect(o.investigate.length).toBeGreaterThan(o.discover.length);
      expect(o.location.length).toBeGreaterThan(0);
      expect(o.functionShort.length).toBeGreaterThan(0);
      expect(o.systems.length).toBeGreaterThan(0);
      expect(o.activity.length).toBeGreaterThan(0);
      expect(o.hint.length).toBeGreaterThan(0);
      expect(o.narration.length).toBeGreaterThan(0);
      expect(o.sourceNotes.length).toBeGreaterThan(0);
    }
  });

  test("function answers are distinct so each multiple-choice question has one right answer", () => {
    const fns = ORGANS.map((o) => o.functionShort);
    expect(new Set(fns).size).toBe(fns.length);
  });

  test("every organ has accurate hotspot geometry and is drawn once", () => {
    for (const id of ORGAN_IDS) {
      expect(ORGAN_SHAPES[id].shapes.length).toBeGreaterThan(0);
      expect(ORGAN_SHAPES[id].color).toMatch(/^#[0-9a-f]{6}$/i);
    }
    expect([...ORGAN_DRAW_ORDER].sort()).toEqual([...ORGAN_IDS].sort());
  });

  test("organById returns the matching entry and throws for unknown ids", () => {
    expect(organById("heart").name).toBe("Heart");
    expect(() => organById("kidney" as never)).toThrow();
  });

  test("factual anchors match standard physiology", () => {
    expect(organById("heart").investigate).toMatch(/pulmonary/i);
    expect(organById("heart").investigate).toMatch(/systemic/i);
    expect(organById("skeleton").discover).toMatch(/206/);
    expect(organById("stomach").investigate).toMatch(/absorbs very little/i);
    expect(organById("smallIntestine").investigate).toMatch(/villi/i);
  });

  test("the Anatomy Atlas and Brain and Senses Lab are ready; the other four are clearly marked as coming soon", () => {
    expect(LABS.length).toBe(6);
    expect(LABS.filter((l) => l.status === "ready").map((l) => l.id)).toEqual(["anatomy", "brain"]);
    expect(LABS.filter((l) => l.status === "coming-soon").length).toBe(4);
  });
});

describe("match-function challenge", () => {
  test("for every organ, the correct option is present exactly once and is the organ's own function", () => {
    for (let i = 0; i < ORGANS.length; i++) {
      const { options, correctIndex } = matchOptions(i);
      expect(options.length).toBe(3);
      expect(new Set(options).size).toBe(3);
      expect(options[correctIndex]).toBe(ORGANS[i].functionShort);
    }
  });

  test("the correct answer position varies so it is not always first", () => {
    const positions = new Set(ORGANS.map((_, i) => matchOptions(i).correctIndex));
    expect(positions.size).toBeGreaterThan(1);
  });
});
