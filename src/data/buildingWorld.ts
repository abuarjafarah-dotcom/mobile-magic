// Building World challenge data. Add more entries to any list — the engine renders them all.
export type BrickColor = "R" | "B" | "Y" | "G";
export const brickVar: Record<BrickColor, string> = { R: "var(--brick-red)", B: "var(--brick-blue)", Y: "var(--brick-yellow)", G: "var(--brick-green)" };
export const brickName: Record<BrickColor, string> = { R: "red", B: "blue", Y: "yellow", G: "green" };

export type NumberStage = "count5" | "count10" | "count20" | "add10" | "add20" | "sub20" | "place" | "compare";
export type NumberChallenge =
  | { id: string; stage: NumberStage; kind: "build"; prompt: string; target: number; parts?: [number, number] }
  | { id: string; stage: "place"; kind: "place"; prompt: string; target: number }
  | { id: string; stage: "compare"; kind: "compare"; prompt: string; left: number; right: number };

export const numberStages: { id: NumberStage; label: string; group: "counting" | "addition" | "subtraction" | "place" | "compare" }[] = [
  { id: "count5", label: "Count 1–5", group: "counting" },
  { id: "count10", label: "Count 1–10", group: "counting" },
  { id: "count20", label: "Count 1–20", group: "counting" },
  { id: "add10", label: "Add within 10", group: "addition" },
  { id: "add20", label: "Add within 20", group: "addition" },
  { id: "sub20", label: "Take away within 20", group: "subtraction" },
  { id: "compare", label: "Which is taller?", group: "compare" },
  { id: "place", label: "Tens & ones", group: "place" },
];

const counts = (stage: NumberStage, list: number[]): NumberChallenge[] => list.map((n, i) => ({ id: `${stage}-${i}`, stage, kind: "build", prompt: `Build ${n}.`, target: n }));
const adds = (stage: NumberStage, list: [number, number][]): NumberChallenge[] => list.map(([a, b], i) => ({ id: `${stage}-${i}`, stage, kind: "build", prompt: `Build ${a} + ${b}.`, target: a + b, parts: [a, b] }));

export const numberChallenges: NumberChallenge[] = [
  ...counts("count5", [2, 4, 1, 5, 3, 4]),
  ...counts("count10", [6, 8, 7, 10, 9, 6]),
  ...counts("count20", [12, 15, 11, 18, 20, 14]),
  ...adds("add10", [[2, 1], [3, 2], [4, 3], [5, 4], [6, 2], [3, 5]]),
  ...adds("add20", [[8, 3], [9, 4], [7, 6], [10, 5], [6, 8], [9, 9]]),
  ...([[5, 2], [7, 3], [9, 4], [12, 5], [15, 6], [18, 9]] as [number, number][]).map(([a, b], i): NumberChallenge => ({ id: `sub20-${i}`, stage: "sub20", kind: "build", prompt: `Build ${a} − ${b}.`, target: a - b })),
  ...([[3, 5], [7, 4], [6, 9], [8, 2], [5, 6], [10, 7]] as [number, number][]).map(([left, right], i): NumberChallenge => ({ id: `compare-${i}`, stage: "compare", kind: "compare", prompt: "Which tower is taller?", left, right })),
  ...[13, 23, 31, 17, 42, 25, 36, 50].map((n, i): NumberChallenge => ({ id: `place-${i}`, stage: "place", kind: "place", prompt: `Build ${n}.`, target: n })),
];

// Structures are rows top → bottom. "." = empty.
export type Structure = { id: string; name: string; rows: string[] };
export const copyBuilds: Structure[] = [
  { id: "tower2", name: "2-block tower", rows: ["R", "B"] },
  { id: "tower3", name: "3-block tower", rows: ["Y", "G", "R"] },
  { id: "stripe", name: "Color pattern", rows: ["RBRB"] },
  { id: "steps", name: "Little steps", rows: ["..B", ".BB", "BBB"] },
  { id: "wall", name: "Garden wall", rows: ["GYGY", "YGYG"] },
  { id: "flat", name: "Long road", rows: ["YYYYY"] },
  { id: "bridge", name: "Bridge", rows: ["BBBBB", "R...R", "R...R"] },
  { id: "tallTower", name: "Tall tower", rows: ["Y", "R", "B", "G", "R"] },
  { id: "house", name: "House", rows: ["..R..", ".RRR.", "YYYYY", "Y.B.Y"] },
  { id: "twin", name: "Twin towers", rows: ["R...R", "B...B", "BYYYB"] },
  { id: "pyramid", name: "Symmetry pyramid", rows: ["..G..", ".GYG.", "GYRYG"] },
  { id: "castle", name: "Castle", rows: ["B.B.B", "BBBBB", "BRYRB", "BR.RB"] },
];

export type FixPuzzle =
  | { id: string; kind: "pattern"; prompt: string; seq: (BrickColor | "?")[]; answer: BrickColor; options: BrickColor[] }
  | { id: string; kind: "repair"; prompt: string; target: string[]; broken: string[] };

export const fixPuzzles: FixPuzzle[] = [
  { id: "p1", kind: "pattern", prompt: "Which block is missing?", seq: ["R", "B", "R", "?"], answer: "B", options: ["B", "Y", "G"] },
  { id: "r1", kind: "repair", prompt: "A block is missing. Tap where it goes!", target: ["R", "R", "R"], broken: ["R", ".", "R"] },
  { id: "p2", kind: "pattern", prompt: "Finish the pattern!", seq: ["Y", "Y", "G", "Y", "Y", "?"], answer: "G", options: ["Y", "G", "R"] },
  { id: "r2", kind: "repair", prompt: "One block is the wrong color. Tap it!", target: ["BBBB"], broken: ["BBRB"] },
  { id: "p3", kind: "pattern", prompt: "Which block fits?", seq: ["R", "B", "Y", "R", "?", "Y"], answer: "B", options: ["R", "B", "G"] },
  { id: "r3", kind: "repair", prompt: "Make both sides match!", target: [".G.", "GYG"], broken: [".G.", "GYR"] },
  { id: "r4", kind: "repair", prompt: "Fix the bridge!", target: ["YYYY", "B..B"], broken: ["Y.YY", "B..B"] },
  { id: "p4", kind: "pattern", prompt: "What comes next?", seq: ["G", "B", "B", "G", "B", "?"], answer: "B", options: ["G", "B", "Y"] },
  { id: "r5", kind: "repair", prompt: "Two mistakes! Can you find them?", target: ["RYR", "YRY", "RYR"], broken: ["RYR", "YYY", "RYB"] },
  { id: "r6", kind: "repair", prompt: "Fix the house!", target: [".R.", "RRR", "YBY"], broken: [".R.", "R.R", "YBG"] },
];

export const freePrompts = ["Can you build a house?", "Can you build something tall?", "Can you build a bridge for Hamad?", "Can you build a car for Talal?", "Can you build a castle?", "Build anything you imagine!"];
