/**
 * Matching for the Quran memorization games: browser speech recognition → expected ayah words.
 * Pure functions only (no DOM access), so they are covered by `bun test`.
 */

export type RecognitionAlternative = { transcript: string };
/** Shape of SpeechRecognitionResultList: each result is one utterance with its competing guesses. */
export type RecognitionResults = ArrayLike<ArrayLike<RecognitionAlternative>>;

/** Strip harakat/Quranic marks and unify letter variants so recognition is forgiving. */
// Explicit code points: harakat and Quranic marks U+0610–U+061A, U+064B–U+065F, U+0670, U+06D6–U+06ED, tatweel U+0640.
export const normAr = (s: string) =>
  s.replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, "")
    .replace(/[ٱآأإ]/g, "ا") // alef variants → ا
    .replace(/ى/g, "ي") // ى → ي
    .replace(/ة/g, "ه") // ة → ه
    .replace(/ؤ/g, "و") // ؤ → و
    .replace(/ئ/g, "ي") // ئ → ي
    .replace(/[^ء-ي]/g, ""); // keep only letters ء–ي

const PREFIXES = ["ال", "و", "ف", "ب"];

/** The word as heard, plus the same word without one common prefix (e.g. "والله" also counts as "الله"). */
function forms(word: string): string[] {
  const out = [word];
  for (const p of PREFIXES) {
    if (word.startsWith(p) && word.length - p.length >= 2) { out.push(word.slice(p.length)); break; }
  }
  return out;
}

function editDistance(a: string, b: string) {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]!; prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j]!;
      prev[j] = Math.min(prev[j]! + 1, prev[j - 1]! + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length]!;
}

/**
 * Conservative word match on normalized text. Exact match (after an optional prefix is dropped) always counts.
 * Near matches are allowed only for words of 4+ letters, one letter off, so short words are never confused
 * (فتح / فرح) and a longer word never counts just because it contains the expected one.
 */
export function wordMatches(heardNorm: string, targetNorm: string): boolean {
  if (!heardNorm || !targetNorm) return false;
  for (const h of forms(heardNorm)) {
    for (const t of forms(targetNorm)) {
      if (h === t) return true;
      if (t.length >= 4 && h.length >= 4 && Math.abs(h.length - t.length) <= 1 && editDistance(h, t) <= 1) return true;
    }
  }
  return false;
}

/** Split a recognized transcript into normalized words, dropping empty tokens. */
export function tokens(transcript: string): string[] {
  return transcript.split(/\s+/).map(normAr).filter(Boolean);
}

/**
 * Walk heard words forward through the expected words. Each heard word may match one of the next few
 * expected words (so a single skipped word never blocks progress). Returns how many expected words are done.
 */
export function matchedPrefix(heard: string[], targetsNorm: string[], from = 0, lookahead = 3): number {
  let p = from;
  for (const h of heard) {
    for (let k = p; k < Math.min(p + lookahead, targetsNorm.length); k++) {
      if (wordMatches(h, targetsNorm[k]!)) { p = k + 1; break; }
    }
  }
  return p;
}

/**
 * Furthest expected word reached by a recognition session.
 * Each result is one utterance. Its alternatives are competing guesses at the same speech, so only the
 * alternative that advances furthest is used; adding them together would count one spoken word twice.
 * Results are processed in order, so re-reading the same events always gives the same answer (duplicate-safe).
 */
export function progressFromResults(results: RecognitionResults, targetsNorm: string[], from = 0, maxAlternatives = 5): number {
  let p = from;
  for (let i = 0; i < results.length; i++) {
    const alts = results[i]!;
    let best = p;
    const n = Math.min(alts.length, maxAlternatives);
    for (let j = 0; j < n; j++) {
      best = Math.max(best, matchedPrefix(tokens(alts[j]!.transcript), targetsNorm, p));
    }
    p = best;
  }
  return p;
}

/** True when the browser exposes a speech recognizer at all (separates "no engine" from "quiet voice"). */
export function speechRecognitionAvailable(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
  return Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition);
}
