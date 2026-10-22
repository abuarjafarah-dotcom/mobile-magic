// Run with: bun test src/data/brainSenses.test.ts
import { describe, expect, test } from "bun:test";
import {
  BRAIN_FIND_ROUNDS,
  BRAIN_REGIONS,
  PADS,
  SENSE_FIND_ROUNDS,
  SENSE_FRIENDS,
  SEE_MESSAGE,
  TOUCH_MESSAGE,
  makeSequence,
  sequenceMatches,
} from "./brainSenses";

const short = (s: string) => s.length <= 110;

describe("content is play-friendly for ages 3 to 4½", () => {
  test("every spoken line is short and one idea", () => {
    const lines = [
      ...BRAIN_REGIONS.map((r) => r.say),
      ...SENSE_FRIENDS.map((f) => f.say),
      TOUCH_MESSAGE.say,
      SEE_MESSAGE.say,
    ];
    for (const l of lines) expect(short(l)).toBe(true);
  });

  test("every game round points at a real part", () => {
    const regionIds = BRAIN_REGIONS.map((r) => r.id);
    for (const r of BRAIN_FIND_ROUNDS) expect(regionIds).toContain(r.target);
    const friendIds = SENSE_FRIENDS.map((f) => f.id);
    for (const r of SENSE_FIND_ROUNDS) expect(friendIds).toContain(r.target);
  });

  test("the four brain parts and five sense friends are all present", () => {
    expect(BRAIN_REGIONS.length).toBe(4);
    expect(SENSE_FRIENDS.map((f) => f.id).sort()).toEqual(["ear", "eye", "hand", "nose", "tongue"]);
  });

  test("grown-up notes never claim one region owns a behaviour", () => {
    const all = [
      ...BRAIN_REGIONS.map((r) => r.grownUp),
      ...SENSE_FRIENDS.map((f) => f.grownUp),
    ].join(" ");
    expect(all).not.toMatch(/exclusively|only the/i);
  });

  test("tongue line keeps the five tastes; touch note avoids one universal receptor", () => {
    const tongue = SENSE_FRIENDS.find((f) => f.id === "tongue")!;
    for (const t of ["sweet", "sour", "salty", "bitter", "umami"])
      expect(tongue.say.toLowerCase()).toContain(t);
    const hand = SENSE_FRIENDS.find((f) => f.id === "hand")!;
    expect(hand.grownUp).toMatch(/not one universal receptor/i);
  });
});

describe("Copy Me sequences", () => {
  test("sequences are deterministic and use only the four pads", () => {
    expect(makeSequence(4, 7)).toEqual(makeSequence(4, 7));
    for (const v of makeSequence(8, 3)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(PADS.length);
    }
  });

  test("a copy matches only when every tap is in order", () => {
    expect(sequenceMatches([0, 2], [0, 2])).toBe(true);
    expect(sequenceMatches([0, 2], [2, 0])).toBe(false);
    expect(sequenceMatches([0, 2], [0])).toBe(false);
  });
});
