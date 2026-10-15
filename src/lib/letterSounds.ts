/**
 * Letter sounds for the sandpaper-letter tracing game.
 *
 * A child hears the letter's SOUND (بَ = "ba"), not its name (باء).
 * Recorded clips go in LETTER_SOUND_FILES (one mp3 per letter, e.g.
 * "/audio/letter-sounds/ba.mp3"). Until a clip is added, the device Arabic
 * voice reads the placeholder in LETTER_SOUND_PLACEHOLDER.
 */
import { speakArabic } from "@/lib/arabicVoice";

/** Shape-first order: easy, distinct shapes and dot-group contrasts first. */
export const LETTER_ORDER = ["ا", "ب", "ت", "ث", "ن", "ي"] as const;

const rank = (letter: string) => {
  const i = (LETTER_ORDER as readonly string[]).indexOf(letter);
  return i === -1 ? LETTER_ORDER.length : i;
};

/** Sort any list of letter cards into the teaching order (stable for the rest). */
export function orderLetters<T extends { letter: string }>(cards: readonly T[]): T[] {
  return [...cards].sort((a, b) => rank(a.letter) - rank(b.letter));
}

/** Recorded sound clips. Empty until the ElevenLabs recordings are added. */
export const LETTER_SOUND_FILES: Record<string, string> = {};

const FATHA = "َ";

/** Placeholder read by the device voice: the letter with a fatha, so it sounds like its sound. */
export const LETTER_SOUND_PLACEHOLDER: Record<string, string> = {
  "ا": "أَ",
  "و": "وَ",
  "ي": "يَ",
};

export function letterSoundText(letter: string): string {
  return LETTER_SOUND_PLACEHOLDER[letter] ?? `${letter}${FATHA}`;
}

let current: HTMLAudioElement | null = null;

/**
 * Play the sound of a letter. Resolves when it has finished (or immediately
 * if nothing could play), so a caller can chain the word after it.
 */
export function playLetterSound(letter: string): Promise<void> {
  const url = LETTER_SOUND_FILES[letter];
  if (url && typeof Audio !== "undefined") {
    return new Promise((resolve) => {
      current?.pause();
      const audio = new Audio(url);
      current = audio;
      const done = () => { if (current === audio) current = null; resolve(); };
      audio.onended = done;
      audio.onerror = done;
      audio.play().catch(done);
    });
  }
  return speakArabic(letterSoundText(letter));
}
