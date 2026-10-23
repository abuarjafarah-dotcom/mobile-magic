/**
 * Shared phrase voice: plays Farah's recorded clip for a phrase.
 * - `sayPhrase("praise-03", lang)` plays a phrase by id from any game.
 * - `phraseClipFor(text)` lets speakArabic() use a recording whenever a game
 *   speaks a line that matches a library phrase (with or without harakat).
 */
import { VOICE_PHRASES, type VoicePhrase } from "@/data/voicePhrases";

const AR_DIR = "/audio/voice/ar/";

/** Strip harakat, tatweel, punctuation and unify alef/ya/ta-marbuta so text matches loosely. */
export function normalizeArabic(raw: string) {
  return String(raw ?? "")
    .replace(/[ً-ٰٟۖ-ۭـ]/g, "")
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^ء-ي\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const byId = new Map<string, VoicePhrase>(VOICE_PHRASES.map((p) => [p.id, p]));
const byArabic = new Map<string, string>(VOICE_PHRASES.map((p) => [normalizeArabic(p.ar), p.id]));

/** Formal (fusha) lines already in the games that should play a library recording. */
const ALIASES: Record<string, string> = {
  "حاول مرة أخرى": "retry-01",
  "لنجرب مرة أخرى": "retry-05",
  "لا بأس حاول مرة أخرى": "retry-03",
  "محاولة جميلة": "retry-10",
  "استمع": "do-03",
  "هيا نبدأ": "flow-01",
  "ممتاز": "praise-02",
  "رائع": "praise-03",
  "ما شاء الله": "praise-06",
};
for (const [text, id] of Object.entries(ALIASES)) byArabic.set(normalizeArabic(text), id);

export const phraseClipUrl = (id: string) => (byId.has(id) ? `${AR_DIR}${id}.mp3` : undefined);

/** Recorded clip URL for an Arabic line, if it matches a library phrase. */
export function phraseClipFor(text: string): string | undefined {
  const id = byArabic.get(normalizeArabic(text));
  return id ? phraseClipUrl(id) : undefined;
}

/** Play a library phrase by id. Arabic uses the recording; English uses the device voice for now. */
export async function sayPhrase(id: string, lang: "ar" | "en" = "ar"): Promise<void> {
  const p = byId.get(id);
  if (!p) return;
  const { speak } = await import("@/lib/voice");
  return speak(lang === "ar" ? p.ar : p.en, lang);
}

/** Pick a random phrase from a group, e.g. randomPhrase("praise") → "praise-07". */
export function randomPhrase(group: "praise" | "retry" | "flow" | "do" | "salah" | "kitchen" | "math" | "name") {
  const ids = VOICE_PHRASES.filter((p) => p.id.startsWith(group + "-")).map((p) => p.id);
  return ids[Math.floor(Math.random() * ids.length)];
}
