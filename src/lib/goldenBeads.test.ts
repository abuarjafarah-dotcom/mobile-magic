// Run with: bun test src/lib/goldenBeads.test.ts
import { describe, expect, test } from "bun:test";
import {
  EMPTY_MATERIALS,
  MAX_TOTAL,
  add,
  addF,
  canExchangeDown,
  canExchangeUp,
  classify,
  compare,
  dealRoundRobin,
  divF,
  divide,
  equivalent,
  equivalents,
  exchangeDown,
  exchangeUp,
  expandedParts,
  factorPairs,
  factors,
  frac,
  fromNumber,
  gcd,
  isCanonical,
  isCube,
  isPrime,
  isSquare,
  isValidMaterials,
  lcm,
  longDivision,
  matchesTarget,
  mulF,
  multiples,
  normalize,
  partialProducts,
  placeParts,
  primeFactorization,
  remove,
  repeatedAddition,
  scaleTo,
  simplify,
  splitOnce,
  subF,
  toDecimal,
  toMixed,
  toPercent,
  total,
  FractionError,
  type Materials,
} from "./goldenBeads";

describe("place value", () => {
  test("material values are exact: 1, 10, 100, 1000", () => {
    expect(total({ ...EMPTY_MATERIALS, units: 1 })).toBe(1);
    expect(total({ ...EMPTY_MATERIALS, tens: 1 })).toBe(10);
    expect(total({ ...EMPTY_MATERIALS, hundreds: 1 })).toBe(100);
    expect(total({ ...EMPTY_MATERIALS, thousands: 1 })).toBe(1000);
  });

  test("fromNumber round-trips every number 0–9999", () => {
    for (let n = 0; n <= MAX_TOTAL; n++) {
      const m = fromNumber(n);
      expect(total(m)).toBe(n);
      expect(isCanonical(m)).toBe(true);
    }
  });

  test("fromNumber rejects invalid input", () => {
    expect(() => fromNumber(-1)).toThrow();
    expect(() => fromNumber(10000)).toThrow();
    expect(() => fromNumber(2.5)).toThrow();
  });

  test("ten units exchange for one ten-bar and back, total unchanged", () => {
    let m: Materials = { ...EMPTY_MATERIALS, units: 13 };
    expect(canExchangeUp(m, "units")).toBe(true);
    m = exchangeUp(m, "units");
    expect(m).toEqual({ units: 3, tens: 1, hundreds: 0, thousands: 0 });
    expect(total(m)).toBe(13);
    m = exchangeDown(m, "tens");
    expect(m).toEqual({ units: 13, tens: 0, hundreds: 0, thousands: 0 });
  });

  test("ten tens → hundred, ten hundreds → thousand", () => {
    const tens = exchangeUp({ ...EMPTY_MATERIALS, tens: 10 }, "tens");
    expect(tens).toEqual({ units: 0, tens: 0, hundreds: 1, thousands: 0 });
    const hundreds = exchangeUp({ ...EMPTY_MATERIALS, hundreds: 12, units: 4 }, "hundreds");
    expect(hundreds).toEqual({ units: 4, tens: 0, hundreds: 2, thousands: 1 });
    expect(total(hundreds)).toBe(1204);
    expect(exchangeDown(hundreds, "thousands")).toEqual({
      units: 4,
      tens: 0,
      hundreds: 12,
      thousands: 0,
    });
  });

  test("exchanges are refused without the right quantity", () => {
    const nine: Materials = { ...EMPTY_MATERIALS, units: 9 };
    expect(canExchangeUp(nine, "units")).toBe(false);
    expect(exchangeUp(nine, "units")).toBe(nine);
    expect(canExchangeUp({ ...EMPTY_MATERIALS, thousands: 15 }, "thousands")).toBe(false); // nothing above thousands
    expect(canExchangeDown(EMPTY_MATERIALS, "tens")).toBe(false);
    expect(canExchangeDown({ ...EMPTY_MATERIALS, units: 1 }, "units")).toBe(false); // nothing below units
    expect(canExchangeDown({ ...EMPTY_MATERIALS, tens: 1, units: 10 }, "tens")).toBe(false); // column would overflow
  });

  test("every exchange preserves the total", () => {
    for (let n = 0; n <= 9999; n += 37) {
      let m = fromNumber(n);
      for (const p of ["tens", "hundreds", "thousands"] as const)
        if (canExchangeDown(m, p)) {
          const next = exchangeDown(m, p);
          expect(total(next)).toBe(n);
          m = next;
        }
      expect(total(normalize(m))).toBe(n);
    }
  });

  test("add/remove respect limits", () => {
    const m = add(EMPTY_MATERIALS, "thousands", 9);
    expect(total(m)).toBe(9000);
    expect(add(fromNumber(9999), "units")).toEqual(fromNumber(9999)); // would exceed 9999
    expect(remove(EMPTY_MATERIALS, "units")).toBe(EMPTY_MATERIALS);
    expect(isValidMaterials({ ...EMPTY_MATERIALS, units: 20 })).toBe(false);
  });

  test("matchesTarget needs the numeral's digits, not just the total", () => {
    expect(matchesTarget(fromNumber(37), 37)).toBe(true);
    expect(matchesTarget({ ...EMPTY_MATERIALS, tens: 2, units: 17 }, 37)).toBe(false);
    expect(total({ ...EMPTY_MATERIALS, tens: 2, units: 17 })).toBe(37);
  });

  test("expanded form", () => {
    expect(expandedParts(1234)).toEqual([1000, 200, 30, 4]);
    expect(expandedParts(1004)).toEqual([1000, 4]);
    expect(expandedParts(0)).toEqual([]);
  });
});

describe("multiplication", () => {
  test("12 × 14 decomposes into 100 + 40 + 20 + 8 = 168", () => {
    const { parts, total: t } = partialProducts(12, 14);
    expect(parts.map((p) => [p.a, p.b, p.product])).toEqual([
      [10, 10, 100],
      [10, 4, 40],
      [2, 10, 20],
      [2, 4, 8],
    ]);
    expect(t).toBe(168);
  });
  test("partial products always sum to the product", () => {
    for (let a = 0; a <= 120; a += 7)
      for (let b = 0; b <= 120; b += 11) expect(partialProducts(a, b).total).toBe(a * b);
  });
  test("place parts", () => {
    expect(placeParts(123)).toEqual([100, 20, 3]);
    expect(placeParts(105)).toEqual([100, 5]);
    expect(placeParts(0)).toEqual([0]);
  });
  test("repeated addition and commutativity", () => {
    expect(repeatedAddition(4, 6)).toBe("6 + 6 + 6 + 6");
    expect(partialProducts(7, 13).total).toBe(partialProducts(13, 7).total);
  });
});

describe("division", () => {
  test("24 shared among 4 is 6 each", () => {
    expect(divide(24, 4)).toEqual({ ok: true, quotient: 6, remainder: 0 });
    expect(dealRoundRobin(24, 4)).toEqual([6, 6, 6, 6]);
  });
  test("remainders", () => {
    expect(divide(25, 4)).toEqual({ ok: true, quotient: 6, remainder: 1 });
    expect(dealRoundRobin(7, 3)).toEqual([3, 2, 2]);
  });
  test("division by zero is refused safely", () => {
    expect(divide(5, 0)).toEqual({ ok: false, reason: "zero-divisor" });
    expect(longDivision(5, 0)).toEqual({ ok: false, reason: "zero-divisor" });
    expect(dealRoundRobin(5, 0)).toEqual([]);
    expect(divide(0, 3)).toEqual({ ok: true, quotient: 0, remainder: 0 });
  });
  test("long division matches integer division", () => {
    for (let n = 0; n <= 9999; n += 113)
      for (let d = 1; d <= 13; d++) {
        const r = longDivision(n, d);
        if (!r.ok) throw new Error("unexpected");
        expect(r.quotient).toBe(Math.floor(n / d));
        expect(r.remainder).toBe(n % d);
      }
    const r = longDivision(1234, 5);
    if (!r.ok) throw new Error("unexpected");
    expect(r.steps.map((s) => s.digit)).toEqual([0, 2, 4, 6]);
  });
});

describe("factors & primes", () => {
  test("factor pairs of 24", () => {
    expect(factorPairs(24)).toEqual([
      [1, 24],
      [2, 12],
      [3, 8],
      [4, 6],
    ]);
    expect(factors(24)).toEqual([1, 2, 3, 4, 6, 8, 12, 24]);
    expect(factors(36)).toEqual([1, 2, 3, 4, 6, 9, 12, 18, 36]);
  });
  test("prime / composite / neither", () => {
    const primes = Array.from({ length: 100 }, (_, i) => i).filter(isPrime);
    expect(primes).toEqual([
      2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89,
      97,
    ]);
    expect(classify(0)).toBe("neither");
    expect(classify(1)).toBe("neither");
    expect(classify(2)).toBe("prime");
    expect(classify(91)).toBe("composite");
  });
  test("prime factorization multiplies back", () => {
    expect(primeFactorization(360)).toEqual([
      [2, 3],
      [3, 2],
      [5, 1],
    ]);
    for (let n = 2; n <= 2000; n++)
      expect(primeFactorization(n).reduce((s, [p, e]) => s * p ** e, 1)).toBe(n);
    expect(splitOnce(24)).toEqual([2, 12]);
    expect(splitOnce(13)).toBeNull();
  });
  test("gcd, lcm, multiples, squares, cubes", () => {
    expect(gcd(12, 18)).toBe(6);
    expect(lcm(4, 6)).toBe(12);
    expect(lcm(0, 6)).toBe(0);
    expect(multiples(3, 4)).toEqual([3, 6, 9, 12]);
    expect([1, 4, 9, 16, 25, 36, 49, 64, 81, 100].every(isSquare)).toBe(true);
    expect(isSquare(50)).toBe(false);
    expect([1, 8, 27, 64, 125, 1000].every(isCube)).toBe(true);
    expect(isCube(100)).toBe(false);
  });
});

describe("fractions", () => {
  test("construction guards", () => {
    expect(() => frac(1, 0)).toThrow(FractionError);
    expect(() => frac(0.5, 2)).toThrow(FractionError);
    expect(frac(1, -2)).toEqual({ n: -1, d: 2 });
  });
  test("simplify and equivalence", () => {
    expect(simplify(frac(6, 8))).toEqual({ n: 3, d: 4 });
    expect(simplify(frac(0, 5))).toEqual({ n: 0, d: 1 });
    expect(equivalent(frac(1, 2), frac(4, 8))).toBe(true);
    expect(equivalent(frac(1, 3), frac(3, 8))).toBe(false);
    expect(equivalents(frac(1, 2), 8)).toEqual([
      { n: 1, d: 2 },
      { n: 2, d: 4 },
      { n: 3, d: 6 },
      { n: 4, d: 8 },
    ]);
    expect(scaleTo(frac(1, 3), 4)).toBeNull();
  });
  test("compare", () => {
    expect(compare(frac(1, 3), frac(1, 2))).toBe(-1);
    expect(compare(frac(3, 4), frac(6, 8))).toBe(0);
    expect(compare(frac(5, 6), frac(4, 5))).toBe(1);
  });
  test("arithmetic is exact (no floating point)", () => {
    expect(addF(frac(1, 3), frac(1, 6))).toEqual({ n: 1, d: 2 });
    expect(addF(frac(1, 10), frac(2, 10))).toEqual({ n: 3, d: 10 }); // 0.1 + 0.2 trap
    expect(subF(frac(3, 4), frac(1, 4))).toEqual({ n: 1, d: 2 });
    expect(subF(frac(1, 4), frac(3, 4))).toEqual({ n: -1, d: 2 });
    expect(mulF(frac(2, 3), frac(3, 4))).toEqual({ n: 1, d: 2 });
    expect(divF(frac(1, 2), frac(1, 4))).toEqual({ n: 2, d: 1 });
    expect(() => divF(frac(1, 2), frac(0, 3))).toThrow(FractionError);
  });
  test("decimals, percents and mixed numbers", () => {
    expect(toDecimal(frac(1, 4))).toBe("0.25");
    expect(toDecimal(frac(1, 3))).toBe("0.(3)");
    expect(toDecimal(frac(1, 6))).toBe("0.1(6)");
    expect(toDecimal(frac(1, 7))).toBe("0.(142857)");
    expect(toDecimal(frac(3, 1))).toBe("3");
    expect(toPercent(frac(1, 4))).toBe("25%");
    expect(toPercent(frac(1, 3))).toBe("33.(3)%");
    expect(toPercent(frac(1, 8))).toBe("12.5%");
    expect(toMixed(frac(7, 4))).toEqual({ whole: 1, rest: { n: 3, d: 4 } });
  });
});
