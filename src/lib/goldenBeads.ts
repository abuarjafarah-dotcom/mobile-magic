/**
 * Golden Bead Workshop — pure math engine (no React, no DOM).
 * Every activity reads its numbers from here so visuals, numerals and checks always agree.
 * Whole numbers use exact integer arithmetic; fractions are integer numerator/denominator pairs.
 */

// ───────────────────────── place value ─────────────────────────
export const PLACES = ["units", "tens", "hundreds", "thousands"] as const;
export type Place = (typeof PLACES)[number];
export const PLACE_VALUE: Record<Place, number> = {
  units: 1,
  tens: 10,
  hundreds: 100,
  thousands: 1000,
};
/** Highest total the workspace accepts. */
export const MAX_TOTAL = 9999;
/** Most pieces one column may hold (lets a child gather 10+ before exchanging, but keeps the mat readable). */
export const MAX_PER_PLACE = 19;

export type Materials = Record<Place, number>;
export const EMPTY_MATERIALS: Materials = { units: 0, tens: 0, hundreds: 0, thousands: 0 };

const isWhole = (n: number) => Number.isInteger(n) && n >= 0;

export function total(m: Materials): number {
  return m.units + 10 * m.tens + 100 * m.hundreds + 1000 * m.thousands;
}

export function isValidMaterials(m: Materials): boolean {
  return PLACES.every((p) => isWhole(m[p]) && m[p] <= MAX_PER_PLACE) && total(m) <= MAX_TOTAL;
}

/** Canonical golden-bead layout of a number (each place 0–9). */
export function fromNumber(n: number): Materials {
  if (!isWhole(n) || n > MAX_TOTAL)
    throw new RangeError(`fromNumber expects a whole number 0–${MAX_TOTAL}`);
  return {
    thousands: Math.floor(n / 1000),
    hundreds: Math.floor(n / 100) % 10,
    tens: Math.floor(n / 10) % 10,
    units: n % 10,
  };
}

/** True when every column holds 0–9 pieces, so the materials read directly as the numeral. */
export function isCanonical(m: Materials): boolean {
  return PLACES.every((p) => m[p] >= 0 && m[p] <= 9);
}

/** Built exactly as the numeral is written: same total AND each column matches its digit. */
export function matchesTarget(m: Materials, target: number): boolean {
  return total(m) === target && isCanonical(m);
}

export function canAdd(m: Materials, place: Place, count = 1): boolean {
  return (
    isWhole(count) &&
    m[place] + count <= MAX_PER_PLACE &&
    total(m) + count * PLACE_VALUE[place] <= MAX_TOTAL
  );
}
export function add(m: Materials, place: Place, count = 1): Materials {
  if (!canAdd(m, place, count)) return m;
  return { ...m, [place]: m[place] + count };
}
export function canRemove(m: Materials, place: Place, count = 1): boolean {
  return isWhole(count) && m[place] >= count;
}
export function remove(m: Materials, place: Place, count = 1): Materials {
  if (!canRemove(m, place, count)) return m;
  return { ...m, [place]: m[place] - count };
}

const UP: Partial<Record<Place, Place>> = {
  units: "tens",
  tens: "hundreds",
  hundreds: "thousands",
};
const DOWN: Partial<Record<Place, Place>> = {
  tens: "units",
  hundreds: "tens",
  thousands: "hundreds",
};
export const nextPlace = (p: Place) => UP[p];
export const prevPlace = (p: Place) => DOWN[p];

/** Ten of `place` → one of the next place. Only allowed with at least ten pieces. */
export function canExchangeUp(m: Materials, place: Place): boolean {
  const up = UP[place];
  return !!up && m[place] >= 10 && m[up] + 1 <= MAX_PER_PLACE;
}
export function exchangeUp(m: Materials, place: Place): Materials {
  const up = UP[place];
  if (!up || !canExchangeUp(m, place)) return m;
  return { ...m, [place]: m[place] - 10, [up]: m[up] + 1 };
}
/** One of `place` → ten of the place below (decomposing). */
export function canExchangeDown(m: Materials, place: Place): boolean {
  const down = DOWN[place];
  return !!down && m[place] >= 1 && m[down] + 10 <= MAX_PER_PLACE;
}
export function exchangeDown(m: Materials, place: Place): Materials {
  const down = DOWN[place];
  if (!down || !canExchangeDown(m, place)) return m;
  return { ...m, [place]: m[place] - 1, [down]: m[down] + 10 };
}

/** Repeatedly exchange up until canonical (used for "show me" hints, never automatically). */
export function normalize(m: Materials): Materials {
  return fromNumber(total(m));
}

/** "1,000 + 200 + 30 + 4" parts (non-zero), largest first. */
export function expandedParts(n: number): number[] {
  const m = fromNumber(n);
  return (["thousands", "hundreds", "tens", "units"] as Place[])
    .map((p) => m[p] * PLACE_VALUE[p])
    .filter((x) => x > 0);
}

export const formatNumber = (n: number) => n.toLocaleString("en-US");

// ───────────────────────── multiplication ─────────────────────────
/** Split a whole number by place value: 123 → [100, 20, 3]; 0 → [0]. */
export function placeParts(n: number): number[] {
  if (!isWhole(n)) throw new RangeError("placeParts expects a whole number");
  if (n === 0) return [0];
  const parts: number[] = [];
  let scale = 1;
  let rest = n;
  while (rest > 0) {
    const digit = rest % 10;
    if (digit) parts.unshift(digit * scale);
    rest = Math.floor(rest / 10);
    scale *= 10;
  }
  return parts;
}

export type PartialProduct = { a: number; b: number; product: number };
/** Distributive decomposition: 12 × 14 → 10×10, 10×4, 2×10, 2×4. */
export function partialProducts(a: number, b: number): { parts: PartialProduct[]; total: number } {
  const parts: PartialProduct[] = [];
  for (const x of placeParts(a))
    for (const y of placeParts(b)) parts.push({ a: x, b: y, product: x * y });
  const sum = parts.reduce((s, p) => s + p.product, 0);
  return { parts, total: sum };
}

export function repeatedAddition(groups: number, size: number): string {
  if (!isWhole(groups) || !isWhole(size))
    throw new RangeError("repeatedAddition expects whole numbers");
  if (groups === 0) return "0";
  return Array.from({ length: groups }, () => String(size)).join(" + ");
}

// ───────────────────────── division ─────────────────────────
export type DivisionResult =
  | { ok: true; quotient: number; remainder: number }
  | { ok: false; reason: "zero-divisor" | "not-whole" };
export function divide(dividend: number, divisor: number): DivisionResult {
  if (!isWhole(dividend) || !isWhole(divisor)) return { ok: false, reason: "not-whole" };
  if (divisor === 0) return { ok: false, reason: "zero-divisor" };
  return { ok: true, quotient: Math.floor(dividend / divisor), remainder: dividend % divisor };
}

/** Deal `total` objects one at a time into `groups` bowls (round-robin). Returns bowl sizes after `dealt` objects. */
export function dealRoundRobin(dealt: number, groups: number): number[] {
  if (groups <= 0) return [];
  return Array.from(
    { length: groups },
    (_, i) => Math.floor(dealt / groups) + (i < dealt % groups ? 1 : 0),
  );
}

export type LongDivisionStep = {
  position: number;
  current: number;
  digit: number;
  product: number;
  remainder: number;
};
/** Classic long division, digit by digit (left to right). */
export function longDivision(
  dividend: number,
  divisor: number,
):
  | { ok: false; reason: "zero-divisor" | "not-whole" }
  | { ok: true; steps: LongDivisionStep[]; quotient: number; remainder: number } {
  const check = divide(dividend, divisor);
  if (!check.ok) return check;
  const digits = String(dividend).split("").map(Number);
  const steps: LongDivisionStep[] = [];
  let rem = 0;
  let q = 0;
  digits.forEach((d, position) => {
    const current = rem * 10 + d;
    const digit = Math.floor(current / divisor);
    const product = digit * divisor;
    rem = current - product;
    q = q * 10 + digit;
    steps.push({ position, current, digit, product, remainder: rem });
  });
  return { ok: true, steps, quotient: q, remainder: rem };
}

// ───────────────────────── factors & primes ─────────────────────────
export function factorPairs(n: number): [number, number][] {
  if (!Number.isInteger(n) || n < 1) return [];
  const pairs: [number, number][] = [];
  for (let i = 1; i * i <= n; i++) if (n % i === 0) pairs.push([i, n / i]);
  return pairs;
}
export function factors(n: number): number[] {
  const small = factorPairs(n).map(([a]) => a);
  const large = factorPairs(n)
    .map(([, b]) => b)
    .reverse();
  return [...new Set([...small, ...large])];
}
export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}
export type NumberKind = "prime" | "composite" | "neither";
/** 0 and 1 are neither prime nor composite. */
export function classify(n: number): NumberKind {
  if (!Number.isInteger(n) || n < 2) return "neither";
  return isPrime(n) ? "prime" : "composite";
}
/** 360 → [[2,3],[3,2],[5,1]] */
export function primeFactorization(n: number): [number, number][] {
  if (!Number.isInteger(n) || n < 2) return [];
  const out: [number, number][] = [];
  let rest = n;
  for (let p = 2; p * p <= rest; p++) {
    let e = 0;
    while (rest % p === 0) {
      rest /= p;
      e++;
    }
    if (e) out.push([p, e]);
  }
  if (rest > 1) out.push([rest, 1]);
  return out;
}
/** Factor-tree split: smallest prime factor × the rest (e.g. 24 → [2, 12]). */
export function splitOnce(n: number): [number, number] | null {
  if (!Number.isInteger(n) || n < 4 || isPrime(n)) return null;
  for (let p = 2; p * p <= n; p++) if (n % p === 0) return [p, n / p];
  return null;
}
export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
}
export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}
export function multiples(n: number, count: number): number[] {
  return Array.from({ length: Math.max(0, count) }, (_, i) => n * (i + 1));
}
export function isSquare(n: number): boolean {
  if (!Number.isInteger(n) || n < 0) return false;
  const r = Math.round(Math.sqrt(n));
  return r * r === n;
}
export function isCube(n: number): boolean {
  if (!Number.isInteger(n) || n < 0) return false;
  const r = Math.round(Math.cbrt(n));
  return r * r * r === n;
}

// ───────────────────────── fractions ─────────────────────────
export type Fraction = { n: number; d: number };
export class FractionError extends Error {}

export function frac(n: number, d: number): Fraction {
  if (!Number.isInteger(n) || !Number.isInteger(d))
    throw new FractionError("Fractions need whole-number tops and bottoms");
  if (d === 0) throw new FractionError("A fraction cannot have 0 equal parts");
  if (d < 0) return { n: -n, d: -d };
  return { n, d };
}
export function simplify(f: Fraction): Fraction {
  if (f.n === 0) return { n: 0, d: 1 };
  const g = gcd(f.n, f.d);
  return frac(f.n / g, f.d / g);
}
export const isSimplest = (f: Fraction) => gcd(f.n, f.d) === 1 || (f.n === 0 && f.d === 1);
export function equivalent(a: Fraction, b: Fraction): boolean {
  return a.n * b.d === b.n * a.d;
}
/** -1, 0, 1 like a comparator. */
export function compare(a: Fraction, b: Fraction): -1 | 0 | 1 {
  const l = a.n * b.d;
  const r = b.n * a.d;
  return l < r ? -1 : l > r ? 1 : 0;
}
export function addF(a: Fraction, b: Fraction): Fraction {
  return simplify(frac(a.n * b.d + b.n * a.d, a.d * b.d));
}
export function subF(a: Fraction, b: Fraction): Fraction {
  return simplify(frac(a.n * b.d - b.n * a.d, a.d * b.d));
}
export function mulF(a: Fraction, b: Fraction): Fraction {
  return simplify(frac(a.n * b.n, a.d * b.d));
}
export function divF(a: Fraction, b: Fraction): Fraction {
  if (b.n === 0) throw new FractionError("We cannot divide by zero");
  return simplify(frac(a.n * b.d, a.d * b.n));
}
/** Same value, scaled to a new denominator — null when not a whole-number scale. */
export function scaleTo(f: Fraction, d: number): Fraction | null {
  if (d <= 0 || (f.n * d) % f.d !== 0) return null;
  return { n: (f.n * d) / f.d, d };
}
export function equivalents(f: Fraction, maxDen = 12): Fraction[] {
  const out: Fraction[] = [];
  for (let d = 1; d <= maxDen; d++) {
    const s = scaleTo(f, d);
    if (s) out.push(s);
  }
  return out;
}
export const lcd = (a: Fraction, b: Fraction) => lcm(a.d, b.d);

/** Exact decimal string via long division; repeating part shown in parentheses: 1/3 → "0.(3)", 1/6 → "0.1(6)". */
export function toDecimal(f: Fraction, maxDigits = 12): string {
  const sign = f.n < 0 ? "-" : "";
  const n = Math.abs(f.n);
  const whole = Math.floor(n / f.d);
  let rem = n % f.d;
  if (rem === 0) return `${sign}${whole}`;
  const seen = new Map<number, number>();
  let digits = "";
  while (rem !== 0 && digits.length < maxDigits) {
    if (seen.has(rem)) {
      const at = seen.get(rem)!;
      return `${sign}${whole}.${digits.slice(0, at)}(${digits.slice(at)})`;
    }
    seen.set(rem, digits.length);
    rem *= 10;
    digits += String(Math.floor(rem / f.d));
    rem %= f.d;
  }
  return `${sign}${whole}.${digits}${rem !== 0 ? "…" : ""}`;
}
/** Percent as exact string: 1/4 → "25%", 1/3 → "33.(3)%". */
export function toPercent(f: Fraction): string {
  return `${toDecimal(simplify(frac(f.n * 100, f.d)))}%`;
}
/** 7/4 → { whole: 1, rest: 3/4 } */
export function toMixed(f: Fraction): { whole: number; rest: Fraction } {
  const s = simplify(f);
  const whole = Math.trunc(s.n / s.d);
  return { whole, rest: { n: Math.abs(s.n % s.d), d: s.d } };
}
export const fracText = (f: Fraction) => (f.d === 1 ? String(f.n) : `${f.n}/${f.d}`);
