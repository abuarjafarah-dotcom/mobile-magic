export type Bowler = "hamad" | "talal";
export type BowlingProblem = { round: number; bowler: Bowler; first: number; second: number; operator: "+" | "−"; answer: number; choices: number[]; hint: string };

const random = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const shuffled = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

function choices(answer: number, spread: number) {
  const values = new Set([answer]);
  while (values.size < 4) { const distance = random(1, spread); values.add(Math.max(0, answer + (Math.random() > 0.5 ? distance : -distance))); }
  return shuffled([...values]);
}
function addition(max: number) { const first = random(1, max - 2); const second = random(1, max - first); return { first, second, operator: "+" as const, answer: first + second, hint: `Count on ${second} from ${first}.` }; }
function subtraction() { const first = random(5, 20); const second = random(1, first); return { first, second, operator: "−" as const, answer: first - second, hint: `Start at ${first} and count back ${second}.` }; }
function twoDigitAddition() { const firstTens = random(1, 5), secondTens = random(1, 3), firstOnes = random(0, 8), secondOnes = random(0, 9 - firstOnes); const first = firstTens * 10 + firstOnes, second = secondTens * 10 + secondOnes; return { first, second, operator: "+" as const, answer: first + second, hint: "Add the ones, then add the tens." }; }

export function createBowlingRoundSet(): BowlingProblem[] {
  return Array.from({ length: 10 }, (_, index) => {
    const round = index + 1;
    const core = round <= 2 ? addition(10) : round <= 4 ? addition(20) : round <= 6 ? subtraction() : round <= 8 ? (Math.random() > 0.5 ? addition(20) : subtraction()) : twoDigitAddition();
    return { ...core, round, bowler: index % 2 === 0 ? "hamad" : "talal", choices: choices(core.answer, round <= 2 ? 4 : round <= 8 ? 8 : 14) };
  });
}