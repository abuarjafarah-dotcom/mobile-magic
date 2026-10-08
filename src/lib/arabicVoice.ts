import { arabicWorldAudio } from "@/data/arabicWorldAudio";

let currentAudio: HTMLAudioElement | null = null;
let requestId = 0;

/** Strip emoji, arrows, symbols, latin fallback text and punctuation so only Arabic words are spoken. */
export function cleanArabicSpeech(raw: string) {
  return String(raw ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]/gu, " ")
    .replace(/[A-Za-z0-9←→↑↓•·|/\\_*#@^~`{}[\]<>()"“”«»=+]+/g, " ")
    .replace(/[,;:!?.،؛؟…—–-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const audioKeyVariants = (text: string) => {
  const trimmed = text.trim();
  return [trimmed, trimmed.replace(/[.،؟!]$/, ""), cleanArabicSpeech(trimmed)];
};

const FEMALE_AR = /female|woman|laila|mariam|hoda|salma|zeina|amira|lana|noura|google/i;
function arabicVoice() {
  const vs = window.speechSynthesis?.getVoices() ?? [];
  const ar = vs.filter((v) => v.lang.toLowerCase().startsWith("ar"));
  return ar.find((v) => FEMALE_AR.test(v.name) && !/maged|tarik|hamed|male/i.test(v.name)) ?? ar.find((v) => !/maged|tarik|hamed/i.test(v.name)) ?? ar[0];
}

export function stopArabicVoice() {
  requestId += 1;
  currentAudio?.pause();
  currentAudio = null;
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}

/** Arabic World's recorded voice first, then its calm Arabic device voice. */
export function speakArabic(text: string, preferredUrl?: string): Promise<void> {
  const ownRequest = ++requestId;
  return new Promise((resolve) => {
    if (typeof window === "undefined") { resolve(); return; }
    currentAudio?.pause();
    currentAudio = null;
    window.speechSynthesis?.cancel();

    const tts = () => {
      if (ownRequest !== requestId) { resolve(); return; }
      const clean = cleanArabicSpeech(text);
      if (!window.speechSynthesis || !clean) { resolve(); return; }
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = "ar-SA";
      utterance.rate = 0.8;
      const v = arabicVoice(); if (v) utterance.voice = v;
      let done = false;
      const end = () => { if (!done) { done = true; resolve(); } };
      utterance.onend = end;
      utterance.onerror = end;
      // Safety: never hang the flow if the browser drops the utterance.
      setTimeout(end, Math.max(4000, clean.length * 180));
      // Start inside the tap/click event. Mobile browsers can reject speech
      // once user activation is lost, which made only pre-recorded words play.
      if (ownRequest === requestId) {
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      } else end();
    };

    const mappedUrl = audioKeyVariants(text).map((key) => arabicWorldAudio[key]).find(Boolean);
    const url = preferredUrl || mappedUrl;
    if (url) {
      const audio = new Audio(url);
      currentAudio = audio;
      let settled = false;
      const finish = () => { if (settled) return; settled = true; if (ownRequest === requestId) currentAudio = null; resolve(); };
      const fallback = () => { if (settled) return; settled = true; if (ownRequest === requestId) currentAudio = null; tts(); };
      audio.onended = finish;
      audio.onerror = fallback;
      void audio.play().catch(fallback);
      return;
    }
    tts();
  });
}
