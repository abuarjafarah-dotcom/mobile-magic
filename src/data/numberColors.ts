// One color per number 1–10, taken from the Numberblocks characters
// (1 red, 2 orange, 3 yellow, 4 green, 5 light blue, 6 purple, 7 rainbow,
// 8 magenta, 9 grey, 10 red-and-white grid). Used as a visual cue only,
// never as the only way to tell numbers apart.
// 7 (rainbow) gets a neutral stand-in; the striped art is not reproduced.

export const NUMBER_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: "#e0352b", text: "#fff8e6" },
  2: { bg: "#f7941d", text: "#2b2a21" },
  3: { bg: "#ffd23f", text: "#2b2a21" },
  4: { bg: "#5cd13a", text: "#2b2a21" },
  5: { bg: "#3ec6e8", text: "#2b2a21" },
  6: { bg: "#7b4fd6", text: "#fff8e6" },
  7: { bg: "#ff8fc7", text: "#2b2a21" },
  8: { bg: "#e8559a", text: "#fff8e6" },
  9: { bg: "#9aa0a6", text: "#2b2a21" },
  10: { bg: "#d9362c", text: "#fff8e6" },
};

export function numberColor(n: number): { bg: string; text: string } | undefined {
  return Number.isInteger(n) ? NUMBER_COLORS[n] : undefined;
}
