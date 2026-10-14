// Child-friendly Arabic speech check built on the browser's speech recognition.
// Deliberately forgiving: a close attempt still counts; only silence asks to try again.
import type { NooraniItem } from "@/data/noorani";

type Rec = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type RecCtor = new () => Rec;

const ctor = (): RecCtor | undefined => {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

export const canListen = () => Boolean(ctor());

export type Heard = {
  transcripts: string[];
  error?: "denied" | "unsupported" | "silent" | "other";
};

let active: Rec | null = null;
export function stopListening() {
  try {
    active?.abort();
  } catch {
    /* already stopped */
  }
  active = null;
}

export function listenArabic(maxMs = 5000): Promise<Heard> {
  const C = ctor();
  if (!C) return Promise.resolve({ transcripts: [], error: "unsupported" });
  stopListening();
  return new Promise((resolve) => {
    const rec = new C();
    active = rec;
    rec.lang = "ar-SA";
    rec.interimResults = false;
    rec.maxAlternatives = 5;
    rec.continuous = false;
    let out: string[] = [];
    let err: Heard["error"];
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      if (active === rec) active = null;
      resolve(out.length ? { transcripts: out } : { transcripts: [], error: err ?? "silent" });
    };
    rec.onresult = (e) => {
      out = [];
      for (let i = 0; i < e.results.length; i++) {
        const alts = e.results[i]!;
        for (let j = 0; j < alts.length; j++) out.push(alts[j]!.transcript);
      }
    };
    rec.onerror = (e) => {
      err =
        e.error === "not-allowed" || e.error === "service-not-allowed"
          ? "denied"
          : e.error === "no-speech"
            ? "silent"
            : "other";
    };
    rec.onend = finish;
    try {
      rec.start();
    } catch {
      err = "other";
      finish();
    }
    setTimeout(() => {
      try {
        rec.stop();
      } catch {
        /* ended */
      }
      setTimeout(finish, 800);
    }, maxMs);
  });
}

/** Strip harakat/tatweel and fold letter variants so recognizer spellings line up. */
export function foldArabic(s: string) {
  return s
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[^ء-ي\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** "match" = clearly the target; "close" = something Arabic was said; "none" = nothing usable. */
export function judge(heard: Heard, item: NooraniItem): "match" | "close" | "none" {
  const said = heard.transcripts.map(foldArabic).filter(Boolean);
  if (!said.length) return "none";
  const name = foldArabic(item.say);
  const keys = new Set(
    [name, name.replace(/[ءا]$/, ""), name.replace(/ء$/, ""), foldArabic(item.glyph)].filter(
      (k) => k.length > 0,
    ),
  );
  const hit = said.some((t) => {
    const words = t.split(" ");
    return [...keys].some((k) => t === k || words.includes(k) || (k.length >= 2 && t.includes(k)));
  });
  return hit ? "match" : "close";
}
