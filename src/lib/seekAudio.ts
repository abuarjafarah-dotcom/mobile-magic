import { SEEK_SPRITE, SEEK_SPRITE_URL } from "@/data/seekWorld";
import { speakArabic, stopArabicVoice } from "@/lib/arabicVoice";

let el: HTMLAudioElement | null = null;
let req = 0;
let timer: ReturnType<typeof setTimeout> | null = null;

function audio() {
  if (!el) { el = new Audio(SEEK_SPRITE_URL); el.preload = "auto"; }
  return el;
}
export function preloadSeek() { if (typeof window !== "undefined") audio().load(); }

export function stopSeek() {
  req++;
  if (timer) clearTimeout(timer);
  el?.pause();
  stopArabicVoice();
}

export type Piece = { sprite: string } | { url: string; text: string } | { text: string };

function playSprite(key: string, id: number) {
  return new Promise<void>((resolve) => {
    const seg = SEEK_SPRITE[key];
    if (!seg || id !== req) return resolve();
    const a = audio();
    const [s, e] = seg;
    let done = false;
    const end = () => { if (done) return; done = true; a.removeEventListener("timeupdate", tick); if (id === req) a.pause(); resolve(); };
    const tick = () => { if (a.currentTime >= e || id !== req) end(); };
    a.addEventListener("timeupdate", tick);
    try { a.currentTime = s; } catch { /* not loaded yet */ }
    a.play().catch(end);
    timer = setTimeout(end, (e - s) * 1000 + 600);
  });
}

/** Plays pieces in order; a new call cancels the previous one. */
export async function playSeek(pieces: Piece[]) {
  stopSeek();
  const id = req;
  for (const p of pieces) {
    if (id !== req) return;
    if ("sprite" in p) await playSprite(p.sprite, id);
    else await speakArabic(p.text, "url" in p ? p.url : undefined);
  }
}
