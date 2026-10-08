// Kitchen voice: plays the recorded ElevenLabs Farah phrases in order. Never falls back to TTS.
import { KITCHEN_VOICE } from "@/data/kitchenVoice";

let current: HTMLAudioElement | null = null;
let req = 0;
let last: string[] = [];

export function stopClips() {
  req += 1;
  if (current) { current.pause(); current.src = ""; }
  current = null;
}

export function playClips(ids: string[]): Promise<void> {
  stopClips();
  const own = req;
  last = ids;
  const urls = ids.map((id) => KITCHEN_VOICE[id]).filter(Boolean);
  return urls.reduce<Promise<void>>((p, url) => p.then(() => new Promise<void>((resolve) => {
    if (own !== req || typeof window === "undefined") { resolve(); return; }
    const a = new Audio(url);
    current = a;
    let done = false;
    const end = () => { if (!done) { done = true; resolve(); } };
    a.onended = end; a.onerror = end;
    setTimeout(end, 8000);
    void a.play().catch(end);
  })), Promise.resolve()).then(() => { if (own === req) current = null; });
}

export const replayClips = () => (last.length ? playClips(last) : Promise.resolve());
