/**
 * Shared helpers for "the child reads it aloud" moments (Arabic games).
 * Recognition uses the browser's Web Speech API when present; callers must still offer a tap fallback.
 */

export type Recognizer = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: any) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

export const getRecognizer = (): (new () => Recognizer) | null =>
  typeof window === "undefined" ? null : ((window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null);

/** Strip harakat/Quranic marks and unify letter variants so recognition is forgiving. */
export const normAr = (s: string) =>
  s.replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, "")
    .replace(/[ٱأإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/ؤ/g, "و").replace(/ئ/g, "ي")
    .replace(/[^ء-ي]/g, "");

/** Short words (3 letters) must match exactly: a single letter change turns one word into another (فتح / فرح). */
function wordMatches(heard: string, target: string) {
  if (!heard || !target) return false;
  if (heard === target) return true;
  return target.length >= 4 && heard.length >= 4 && Math.abs(heard.length - target.length) <= 1 && editDistance(heard, target) <= 1;
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

/** True when any heard word is the target word (harakat ignored). */
export function heardMatches(transcript: string, targetAr: string) {
  const target = normAr(targetAr);
  return transcript.split(/\s+/).map(normAr).some((h) => wordMatches(h, target));
}

/**
 * Call synchronously inside a tap or click. iOS/iPadOS only lets speech start after a user gesture,
 * so speech started later from a timer is silently dropped. Speaking a silent utterance here unlocks it.
 */
export function unlockVoice() {
  if (typeof window === "undefined") return;
  const s = window.speechSynthesis;
  if (!s) return;
  try {
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    s.speak(u);
    s.resume();
  } catch { /* ignore */ }
}
