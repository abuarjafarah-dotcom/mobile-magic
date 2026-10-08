// Small pure chess engine: legal moves, check, checkmate, stalemate, promotion (auto-queen).
export type Color = "w" | "b";
export type Kind = "p" | "n" | "b" | "r" | "q" | "k";
export type Piece = { id: string; c: Color; t: Kind };
export type Board = (Piece | null)[];
export type ChessState = { board: Board; turn: Color };
export type MoveResult = { state: ChessState; captured: Piece | null };

export const sq = (f: number, r: number) => r * 8 + f; // r 0 = rank 8 (top)
export const fileOf = (i: number) => i % 8;
export const rankOf = (i: number) => Math.floor(i / 8);
export const nameToSq = (n: string) => sq(n.charCodeAt(0) - 97, 8 - Number(n[1]));

export function initialState(): ChessState {
  const board: Board = Array(64).fill(null);
  const back: Kind[] = ["r", "n", "b", "q", "k", "b", "n", "r"];
  back.forEach((t, f) => {
    board[sq(f, 0)] = { id: `b${t}${f}`, c: "b", t };
    board[sq(f, 1)] = { id: `bp${f}`, c: "b", t: "p" };
    board[sq(f, 6)] = { id: `wp${f}`, c: "w", t: "p" };
    board[sq(f, 7)] = { id: `w${t}${f}`, c: "w", t };
  });
  return { board, turn: "w" };
}

/** Build a position from e.g. { e1: "wk", a8: "br" }. */
export function fromMap(map: Record<string, string>, turn: Color = "w"): ChessState {
  const board: Board = Array(64).fill(null);
  for (const [n, code] of Object.entries(map)) board[nameToSq(n)] = { id: `${code}${n}`, c: code[0] as Color, t: code[1] as Kind };
  return { board, turn };
}

const ROOK: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const BISH: [number, number][] = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
const DIRS: Record<Exclude<Kind, "p">, [number, number][]> = {
  r: ROOK, b: BISH, q: [...ROOK, ...BISH], k: [...ROOK, ...BISH],
  n: [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]],
};

function pseudo(board: Board, from: number): number[] {
  const p = board[from];
  if (!p) return [];
  const f = fileOf(from), r = rankOf(from), out: number[] = [];
  const inside = (x: number, y: number) => x >= 0 && x < 8 && y >= 0 && y < 8;
  if (p.t === "p") {
    const d = p.c === "w" ? -1 : 1, start = p.c === "w" ? 6 : 1;
    if (inside(f, r + d) && !board[sq(f, r + d)]) {
      out.push(sq(f, r + d));
      if (r === start && !board[sq(f, r + 2 * d)]) out.push(sq(f, r + 2 * d));
    }
    for (const dx of [-1, 1]) {
      if (!inside(f + dx, r + d)) continue;
      const t = board[sq(f + dx, r + d)];
      if (t && t.c !== p.c) out.push(sq(f + dx, r + d));
    }
    return out;
  }
  const slide = p.t === "r" || p.t === "b" || p.t === "q";
  for (const [dx, dy] of DIRS[p.t]) {
    let x = f + dx, y = r + dy;
    while (inside(x, y)) {
      const t = board[sq(x, y)];
      if (!t || t.c !== p.c) out.push(sq(x, y));
      if (t || !slide) break;
      x += dx; y += dy;
    }
  }
  return out;
}

export function isAttacked(board: Board, target: number, by: Color) {
  return board.some((p, i) => p && p.c === by && (p.t === "p"
    ? Math.abs(fileOf(i) - fileOf(target)) === 1 && rankOf(target) - rankOf(i) === (by === "w" ? -1 : 1)
    : pseudo(board, i).includes(target)));
}

export function inCheck(board: Board, c: Color) {
  const k = board.findIndex((p) => p?.c === c && p.t === "k");
  return k >= 0 && isAttacked(board, k, c === "w" ? "b" : "w");
}

function raw(board: Board, from: number, to: number): { board: Board; captured: Piece | null } {
  const b = board.slice();
  const p = b[from]!;
  const captured = b[to] ?? null;
  b[to] = p.t === "p" && (rankOf(to) === 0 || rankOf(to) === 7) ? { ...p, t: "q" } : p;
  b[from] = null;
  return { board: b, captured };
}

export function legalMoves(state: ChessState, from: number): number[] {
  const p = state.board[from];
  if (!p || p.c !== state.turn) return [];
  return pseudo(state.board, from).filter((to) => !inCheck(raw(state.board, from, to).board, p.c));
}

export function move(state: ChessState, from: number, to: number): MoveResult | null {
  if (!legalMoves(state, from).includes(to)) return null;
  const { board, captured } = raw(state.board, from, to);
  return { state: { board, turn: state.turn === "w" ? "b" : "w" }, captured };
}

export type Status = "playing" | "check" | "checkmate" | "stalemate";
export function status(state: ChessState): Status {
  const any = state.board.some((p, i) => p?.c === state.turn && legalMoves(state, i).length > 0);
  const chk = inCheck(state.board, state.turn);
  if (!any) return chk ? "checkmate" : "stalemate";
  return chk ? "check" : "playing";
}
