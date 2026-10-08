/**
 * Shared voice engine for Kitchen and Chess (and any non-Qur'an game).
 * Accepts clean human text only; strips emoji, symbols and markup before speaking.
 * Arabic goes through the Arabic World voice (recorded clips, then ar-SA female-preferred).
 */
import { speakArabic, stopArabicVoice } from "@/lib/arabicVoice";
import { stopClips } from "@/lib/kitchenClips";

export type VoiceLang = "ar" | "en";

const VOICE_KEY = "voice-enabled-v1";
let last: { text: string; lang: VoiceLang } | null = null;

/** Remove emoji, arrows, brackets, markup, latin text inside Arabic lines and stray punctuation. */
export function cleanSpeechText(raw: string, lang: VoiceLang): string {
  let t = String(raw ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]/gu, " ")
    .replace(/[←→↑↓⇐⇒•·|/\\_*#@^~`{}[\]<>()"“”«»=+]/g, " ");
  if (lang === "ar") t = t.replace(/[A-Za-z0-9]+/g, " ").replace(/[,;:!?.،؛؟…—–-]+/g, " ");
  else t = t.replace(/[—–]/g, ", ").replace(/([!?.,])[!?.,]+/g, "$1");
  return t.replace(/\s+/g, " ").trim();
}

export function isVoiceOn() {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(VOICE_KEY) !== "off";
}
export function setVoiceOn(on: boolean) {
  localStorage.setItem(VOICE_KEY, on ? "on" : "off");
  if (!on) stopVoice();
}

const FEMALE = /female|woman|samantha|karen|victoria|zira|susan|serena|tessa|moira|fiona|allison|ava|lana|laila|mariam|hoda|salma|zeina|amira|google us english/i;
function englishVoice() {
  const vs = window.speechSynthesis?.getVoices() ?? [];
  const en = vs.filter((v) => v.lang.toLowerCase().startsWith("en"));
  return en.find((v) => FEMALE.test(v.name)) ?? en[0];
}

export function stopVoice() {
  stopArabicVoice();
  stopClips();
}

export function speak(raw: string, lang: VoiceLang = "ar"): Promise<void> {
  const text = cleanSpeechText(raw, lang);
  if (!text || typeof window === "undefined") return Promise.resolve();
  last = { text: raw, lang };
  if (!isVoiceOn()) return Promise.resolve();
  if (lang === "ar") return speakArabic(raw);
  return speakEnglish(text);
}

/** English device voice (female-preferred), independent of the voice on/off switch. */
export function speakEnglish(raw: string): Promise<void> {
  const text = cleanSpeechText(raw, "en");
  stopArabicVoice();
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !text) { resolve(); return; }
    if (!window.speechSynthesis) { resolve(); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US"; u.rate = 0.9; u.pitch = 1.1;
    const v = englishVoice(); if (v) u.voice = v;
    let done = false; const end = () => { if (!done) { done = true; resolve(); } };
    u.onend = end; u.onerror = end;
    setTimeout(end, Math.max(3500, text.length * 110));
    window.speechSynthesis.speak(u);
  });
}

export function replayVoice() {
  if (last) return speak(last.text, last.lang);
  return Promise.resolve();
}
