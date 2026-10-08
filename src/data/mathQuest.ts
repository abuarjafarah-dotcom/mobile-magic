export type QuestProblem = { text: string; answer: number; choices: number[]; hint: string; visual?: { emoji: string; groups: number; each: number } };
export type QuestLevel = { id: number; title: string; emoji: string; skill: string; scene: string; tone: "sun" | "mint" | "sky" | "berry"; make: () => Omit<QuestProblem, "choices"> };

const r = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
function choicesFor(answer: number, spread: number) {
  const s = new Set([answer]);
  while (s.size < 4) { const d = r(1, spread); s.add(Math.max(0, answer + (Math.random() > 0.5 ? d : -d))); }
  return shuffle([...s]);
}

export const questLevels: QuestLevel[] = [
  { id: 1, title: "Balloon Pop", emoji: "🎈", skill: "Add within 20", scene: "Pop the balloon with the answer!", tone: "sun",
    make: () => { const a = r(3, 12), b = r(2, 20 - a); return { text: `${a} + ${b}`, answer: a + b, hint: `Start at ${a} and count on ${b}.` }; } },
  { id: 2, title: "Rocket Countdown", emoji: "🚀", skill: "Subtract within 20", scene: "Fuel the rocket with the right number!", tone: "sky",
    make: () => { const a = r(8, 20), b = r(2, a - 1); return { text: `${a} − ${b}`, answer: a - b, hint: `Start at ${a} and count back ${b}.` }; } },
  { id: 3, title: "Mystery Box", emoji: "🎁", skill: "Find the missing number", scene: "What number is hiding in the box?", tone: "berry",
    make: () => { const a = r(2, 15), c = r(a + 2, 25); return { text: `${a} + ▢ = ${c}`, answer: c - a, hint: `Count up from ${a} to ${c}.` }; } },
  { id: 4, title: "Treasure Dive", emoji: "🏴‍☠️", skill: "Two-digit adding with regrouping", scene: "Open the treasure chest!", tone: "mint",
    make: () => { const a = r(15, 58), b = r(12, 39); return { text: `${a} + ${b}`, answer: a + b, hint: `Ones: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}. Then add the tens.` }; } },
  { id: 5, title: "Fruit Train", emoji: "🚂", skill: "Multiply equal groups", scene: "Each wagon carries the same number!", tone: "sun",
    make: () => { const g = r(2, 6), e = r(2, 6); return { text: `${g} × ${e}`, answer: g * e, hint: `${g} wagons with ${e} each. Count by ${e}s.`, visual: { emoji: "🍎", groups: g, each: e } }; } },
  { id: 6, title: "Pizza Party", emoji: "🍕", skill: "Share equally (division)", scene: "Share the slices fairly!", tone: "berry",
    make: () => { const g = r(2, 6), e = r(2, 6); return { text: `${g * e} ÷ ${g}`, answer: e, hint: `Give ${g} friends one slice each, again and again, until all ${g * e} are gone.`, visual: { emoji: "🍕", groups: g, each: e } }; } },
  { id: 7, title: "Castle Climb", emoji: "🏰", skill: "Bigger times tables", scene: "Climb each step of the castle!", tone: "sky",
    make: () => { const a = r(6, 12), b = r(3, 12); return { text: `${a} × ${b}`, answer: a * b, hint: `Split it: ${a} × ${b} = (${a} × ${b - 1}) + ${a}.` }; } },
  { id: 8, title: "Star Champion", emoji: "🌟", skill: "Two steps at once", scene: "The final challenge — two steps!", tone: "mint",
    make: () => { const a = r(2, 9), b = r(2, 9), c = r(1, 20); return { text: `${a} × ${b} + ${c}`, answer: a * b + c, hint: `First ${a} × ${b} = ${a * b}. Then add ${c}.` }; } },
];

export function createQuestRound(level: QuestLevel): QuestProblem[] {
  return Array.from({ length: 8 }, () => { const p = level.make(); return { ...p, choices: choicesFor(p.answer, Math.max(3, Math.ceil(p.answer / 5))) }; });
}
