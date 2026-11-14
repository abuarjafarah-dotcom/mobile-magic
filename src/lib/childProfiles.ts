// Child profiles: each child gets his own copy of every game's saved progress.
//
// Games keep reading and writing their usual localStorage keys. When the player
// changes, the outgoing child's keys are parked under `mm-child:<id>:<key>` and
// the incoming child's parked keys are put back. No game needs to know about
// profiles, and new games are covered automatically.

export type ChildId = "hamad" | "talal" | "yousef";

export const CHILDREN: readonly { id: ChildId; name: string; arabic: string }[] = [
  { id: "hamad", name: "Hamad", arabic: "حمد" },
  { id: "talal", name: "Talal", arabic: "طلال" },
  { id: "yousef", name: "Yousef", arabic: "يوسف" },
];

const ACTIVE_KEY = "mm-active-child";
const NS = "mm-child:";
const STATS_KEY = "math-adventure-progress";

// Settings shared by the whole family; these never move between children.
const SHARED_KEYS = new Set([
  ACTIVE_KEY,
  "voice-enabled-v1",
  "learning-language-v1",
  "chess-lang-v1",
  "chunk-reload-at",
  "calm-mode-v1",
  "play-limit-v1",
]);

const isShared = (key: string) => SHARED_KEYS.has(key) || key.startsWith(NS);
const isChild = (v: string | null): v is ChildId => CHILDREN.some((c) => c.id === v);

function allKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k) keys.push(k);
  }
  return keys;
}

export function getActiveChild(): ChildId | null {
  try {
    const v = localStorage.getItem(ACTIVE_KEY);
    return isChild(v) ? v : null;
  } catch {
    return null;
  }
}

// Park the live progress under this child's name.
function park(id: ChildId) {
  const prefix = `${NS}${id}:`;
  const keys = allKeys();
  keys.filter((k) => k.startsWith(prefix)).forEach((k) => localStorage.removeItem(k));
  keys
    .filter((k) => !isShared(k))
    .forEach((k) => {
      const v = localStorage.getItem(k);
      if (v !== null) localStorage.setItem(prefix + k, v);
    });
}

// Replace the live progress with this child's parked copy.
function restore(id: ChildId) {
  const prefix = `${NS}${id}:`;
  const keys = allKeys();
  keys.filter((k) => !isShared(k)).forEach((k) => localStorage.removeItem(k));
  keys
    .filter((k) => k.startsWith(prefix))
    .forEach((k) => {
      const v = localStorage.getItem(k);
      if (v !== null) localStorage.setItem(k.slice(prefix.length), v);
    });
}

// Switch player. Returns true when the live progress changed, in which case the
// caller should reload the page so every game reads the new child's progress.
export function chooseChild(id: ChildId): boolean {
  try {
    const active = getActiveChild();
    if (active === id) return false;
    if (active) {
      park(active);
    } else if (!allKeys().some((k) => k.startsWith(NS))) {
      // First time: progress so far was shared, so both older boys keep it.
      park("hamad");
      park("talal");
    }
    restore(id);
    localStorage.setItem(ACTIVE_KEY, id);
    return true;
  } catch {
    return false;
  }
}

// Stars for any child, whether he is the one playing or parked.
export function readChildStars(id: ChildId): number {
  try {
    const key = getActiveChild() === id ? STATS_KEY : `${NS}${id}:${STATS_KEY}`;
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    const stars = (JSON.parse(raw) as { stars?: unknown }).stars;
    return typeof stars === "number" ? stars : 0;
  } catch {
    return 0;
  }
}
