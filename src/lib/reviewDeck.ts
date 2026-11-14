// Review deck: one spaced-review schedule shared by every game.
// A game reports "this item was practiced" and the deck says when it should
// come back. Own localStorage key, so each child has his own deck.

export type DeckItem = { box: number; due: number; day: string };
export type Deck = Record<string, DeckItem>;

const KEY = "review-deck-v1";
const DAY = 86_400_000;
// Days until an item returns, by box. Same spacing the Noorani game uses.
export const INTERVAL_DAYS = [0, 1, 2, 4, 8, 16];
const dayKey = (now: number) => new Date(now).toISOString().slice(0, 10);

/** Pure step: a good practice moves the item up one box (once a day); a miss sends it back. */
export function practiced(deck: Deck, key: string, ok: boolean, now = Date.now()): Deck {
  const item = deck[key] ?? { box: 0, due: 0, day: "" };
  const today = dayKey(now);
  let box = item.box;
  if (!ok) box = Math.min(box, 1);
  else if (item.day !== today) box = Math.min(INTERVAL_DAYS.length - 1, box + 1);
  return {
    ...deck,
    [key]: { box, due: now + INTERVAL_DAYS[box]! * DAY, day: ok ? today : item.day },
  };
}

/** Keys that should come back now, longest-waiting first. Unknown keys count as due. */
export function dueKeys(deck: Deck, keys: readonly string[], now = Date.now()): string[] {
  return keys
    .filter((k) => (deck[k]?.due ?? 0) <= now)
    .sort((a, b) => (deck[a]?.due ?? 0) - (deck[b]?.due ?? 0));
}

export function loadDeck(): Deck {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Deck) : {};
  } catch {
    return {};
  }
}

export function recordPractice(key: string, ok = true) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(practiced(loadDeck(), key, ok)));
  } catch {
    /* storage full or blocked: the review simply is not scheduled */
  }
}
