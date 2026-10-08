// Noorani audio: recorded clip (override map → item/phrase clip) first, then the shared
// female Arabic voice from arabicVoice.ts. Never speaks English or UI punctuation.
import { nooraniClips, phrases, type NooraniItem, type PhraseId } from "@/data/noorani";
import { speakArabic, stopArabicVoice } from "@/lib/arabicVoice";
import { isVoiceOn } from "@/lib/voice";

let seq = 0;

export function stopNoorani() {
  seq++;
  stopArabicVoice();
}

export function sayItem(item: NooraniItem): Promise<void> {
  if (!isVoiceOn()) return Promise.resolve();
  seq++;
  return speakArabic(item.say, nooraniClips[item.id] ?? item.audio?.target);
}

export function sayPhrase(id: PhraseId): Promise<void> {
  if (!isVoiceOn()) return Promise.resolve();
  seq++;
  const p = phrases[id];
  return speakArabic(p.say, nooraniClips[id] ?? p.clip);
}

const praise: PhraseId[] = ["great", "excellent", "wellDone"];
let praiseTurn = 0;

/** Short success line; an item-specific recording wins when present. */
export function saySuccess(item?: NooraniItem): Promise<void> {
  if (!isVoiceOn()) return Promise.resolve();
  const own = item && (nooraniClips[`${item.id}:success`] ?? item.audio?.success);
  if (own && item) { seq++; return speakArabic(item.say, own); }
  return sayPhrase(praise[praiseTurn++ % praise.length]!);
}

/** Gentle correction, then the target again so the child hears the right sound. */
export async function sayEncourage(item?: NooraniItem): Promise<void> {
  if (!isVoiceOn()) return;
  const mine = ++seq;
  const own = item && (nooraniClips[`${item.id}:encourage`] ?? item.audio?.encourage);
  if (own && item) await speakArabic(item.say, own);
  else await sayPhrase("again");
  if (item && mine + 1 === seq) await sayItem(item);
}

/** Play several items one after another; stops if anything else starts speaking. */
export async function sayInOrder(items: NooraniItem[], onEach?: (index: number) => void): Promise<void> {
  const mine = ++seq;
  for (let i = 0; i < items.length; i++) {
    if (mine !== seq) return;
    onEach?.(i);
    if (isVoiceOn()) await speakArabic(items[i]!.say, nooraniClips[items[i]!.id] ?? items[i]!.audio?.target);
    else await new Promise((r) => setTimeout(r, 500));
    await new Promise((r) => setTimeout(r, 350));
    if (mine !== seq) return;
  }
  onEach?.(-1);
}
