import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Lightbulb, Mic, RotateCcw, Square, Volume2 } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { GameShell } from "@/components/learn/shared";
import type { SurahData, SurahVerse } from "@/data/surahs";
import { cn } from "@/lib/utils";
import { Block } from "@/components/building/BuildingWorld";
import hamadCelebrating from "@/assets/building/hamad-celebrating.png";
import talalCelebrating from "@/assets/building/talal-celebrating.png";
import v1 from "@/assets/alaq/g1.mp4.asset.json";
import v2 from "@/assets/alaq/g2.mp4.asset.json";
import p1 from "@/assets/alaq/g1.jpg.asset.json";
import p2 from "@/assets/alaq/g2.jpg.asset.json";

/**
 * Memorization groups for Surah Al-'Alaq. To add or replace a group's memory-cue video later,
 * set `video` (and optionally `poster`) on that group only — nothing else needs to change.
 */
const GROUPS: Array<{ from: number; to: number; video?: string; poster?: string }> = [
  { from: 1, to: 3, video: v1.url, poster: p1.url },
  { from: 4, to: 6, video: v2.url, poster: p2.url },
  { from: 7, to: 9 },
  { from: 10, to: 12 },
  { from: 13, to: 15 },
  { from: 16, to: 19 },
];
const KEY = "alaq-memorize-v1";
const AYAH_KEY = "alaq-memorize-ayahs-v1";
/** 0 = Learn (unchanged). 1–4 = 🧠 Memorize levels with decreasing text support. */
const LEVELS = [
  { id: 1, title: "Practice" },
  { id: 2, title: "Remember" },
  { id: 3, title: "Almost there" },
  { id: 4, title: "On my own" },
] as const;
/** Is word k hidden before the child says it, at this memorize level? */
const masked = (level: number, k: number, count: number) =>
  level <= 1 ? false : level === 2 ? k % 2 === 1 : level === 3 ? !(k === 0 && count > 1) : true;
const HINT_AFTER_MS = 5000;

// Waqf marks stay on screen but are never counted as words (same rule as Finish the Ayah).
const isMark = (t: string) => /^[\u06D6-\u06ED]+$/.test(t);
const words = (v: SurahVerse) => v.arabic.split(/\s+/).filter((t) => t && !isMark(t));

/** Strip harakat/Quranic marks and unify letter variants so recognition is forgiving. */
const norm = (s: string) =>
  s.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
    .replace(/[ٱأإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/ؤ/g, "و").replace(/ئ/g, "ي")
    .replace(/[^\u0621-\u064A]/g, "");

function close(a: string, b: string) {
  if (!a || !b) return false;
  if (a === b || a.includes(b) || b.includes(a)) return true;
  const ta = a.replace(/^(ال|و|ف|ب)/, ""), tb = b.replace(/^(ال|و|ف|ب)/, "");
  if (ta && (ta === tb || ta.includes(tb) || tb.includes(ta))) return true;
  // small edit distance, scaled to word length
  const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)] as number[]);
  for (let j = 1; j <= n; j++) d[0]![j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    d[i]![j] = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m]![n]! <= Math.max(1, Math.floor(Math.max(m, n) / 3));
}

type Recognizer = { lang: string; continuous: boolean; interimResults: boolean; start: () => void; stop: () => void; onresult: ((e: any) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };
const getRecognizer = (): (new () => Recognizer) | null =>
  typeof window === "undefined" ? null : ((window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null);

export function AlaqMemorize({ surah, onExit }: { surah: SurahData; onExit: () => void }) {
  const [g, setG] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const [ayah, setAyah] = useState(0); // index within group
  const [word, setWord] = useState(-1); // active word while listening
  const [playing, setPlaying] = useState(false);
  const [turn, setTurn] = useState(false);
  const [said, setSaid] = useState(0); // words revealed in My Turn
  const [hinted, setHinted] = useState<number[]>([]);
  const [listening, setListening] = useState(false);
  const [success, setSuccess] = useState(false);
  const [canHear, setCanHear] = useState(true);
  const [level, setLevel] = useState(0);
  const [ayahsDone, setAyahsDone] = useState<number[]>([]);
  const [whole, setWhole] = useState(false);

  const group = GROUPS[g]!;
  const verses = surah.verses.slice(group.from - 1, group.to);
  const verse = verses[ayah]!;
  const vw = words(verse);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef(0);
  const recRef = useRef<Recognizer | null>(null);
  const saidRef = useRef(0);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => { setCanHear(!!getRecognizer()); try { setAyahsDone(JSON.parse(localStorage.getItem(AYAH_KEY) ?? "[]")); setDone(JSON.parse(localStorage.getItem(KEY) ?? "[]")); } catch { /* ignore */ } }, []);

  const stopAudio = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    audioRef.current?.pause(); audioRef.current = null;
    setPlaying(false); setWord(-1);
  }, []);
  const stopMic = useCallback(() => {
    clearTimeout(hintTimer.current);
    const r = recRef.current; recRef.current = null;
    if (r) { r.onend = null; try { r.stop(); } catch { /* ignore */ } }
    setListening(false);
  }, []);

  // Changing group: reset everything and restart the cue video from the beginning.
  useEffect(() => {
    stopAudio(); stopMic(); setAyah(0); setTurn(false); setSuccess(false);
    const v = videoRef.current;
    if (v) { v.currentTime = 0; v.play().catch(() => {}); }
  }, [g, stopAudio, stopMic]);
  useEffect(() => () => { stopAudio(); stopMic(); videoRef.current?.pause(); }, [stopAudio, stopMic]);

  /** Play ayah `i` of the group with word-by-word highlighting; optionally continue through the group. */
  const playAyah = (i: number, continueGroup: boolean) => {
    stopAudio(); stopMic(); setTurn(false); setSuccess(false);
    const v = verses[i]; if (!v) return;
    setAyah(i);
    const audio = new Audio(v.audio); audioRef.current = audio;
    const timings = v.wordTimings ?? [];
    const count = words(v).length;
    const tick = () => {
      if (audioRef.current !== audio) return;
      const ms = audio.currentTime * 1000;
      let w = -1;
      if (timings.length === count) { for (let k = 0; k < timings.length; k++) if (ms >= timings[k]![0]!) w = k; }
      else if (audio.duration) w = Math.min(count - 1, Math.floor((audio.currentTime / audio.duration) * count));
      setWord(w);
      rafRef.current = requestAnimationFrame(tick);
    };
    audio.onplay = () => { setPlaying(true); rafRef.current = requestAnimationFrame(tick); };
    audio.onended = () => {
      if (audioRef.current !== audio) return;
      stopAudio();
      if (continueGroup && i + 1 < verses.length) playAyah(i + 1, true);
    };
    audio.play().catch(() => stopAudio());
  };

  const armHint = () => {
    clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => {
      // Child seems stuck: gently reveal the next word.
      const next = saidRef.current;
      if (next < vw.length) { setHinted((h) => [...h, next]); advanceTo(next + 1); }
    }, HINT_AFTER_MS);
  };

  const advanceTo = (n: number) => {
    const clamped = Math.min(n, vw.length);
    if (clamped <= saidRef.current) return;
    saidRef.current = clamped; setSaid(clamped);
    if (clamped >= vw.length) {
      stopMic(); setSuccess(true); markDone();
      const n = group.from + ayah;
      setAyahsDone((d) => { const next = [...new Set([...d, n])]; localStorage.setItem(AYAH_KEY, JSON.stringify(next)); return next; });
    } else armHint();
  };

  const markDone = () => {
    if (ayah < verses.length - 1) return;
    setDone((d) => { const next = [...new Set([...d, g])]; localStorage.setItem(KEY, JSON.stringify(next)); return next; });
  };

  const startTurn = () => {
    stopAudio(); stopMic();
    saidRef.current = 0; setSaid(0); setHinted([]); setSuccess(false); setTurn(true);
    const R = getRecognizer();
    if (!R) return; // no mic support: child taps "next word" instead
    const rec = new R(); recRef.current = rec;
    rec.lang = "ar-SA"; rec.continuous = true; rec.interimResults = true;
    const targets = vw.map(norm);
    rec.onresult = (e: any) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += " " + e.results[i][0].transcript;
      const heard = text.split(/\s+/).map(norm).filter(Boolean);
      // Walk heard words forward; each match moves the pointer. Look a couple of words ahead so one miss never blocks.
      let p = 0;
      for (const h of heard) {
        for (let k = p; k < Math.min(p + 3, targets.length); k++) if (close(h, targets[k]!)) { p = k + 1; break; }
      }
      if (p > saidRef.current) advanceTo(p);
      else armHint();
    };
    rec.onerror = () => { /* stay calm; tap-to-reveal still works */ };
    rec.onend = () => { if (recRef.current === rec) { try { rec.start(); } catch { setListening(false); } } };
    try { rec.start(); setListening(true); armHint(); } catch { setListening(false); }
  };

  const nextAyah = () => {
    setSuccess(false); setTurn(false); stopMic();
    if (ayah + 1 < verses.length) setAyah(ayah + 1);
    else if (g + 1 < GROUPS.length) setG(g + 1);
  };

  if (whole) return <WholeSurah surah={surah} onExit={() => setWhole(false)} />;

  return (
    <GameShell title="Memorize Al-'Alaq" current={done.length} total={GROUPS.length} onExit={onExit}>
      <div className="mt-4 flex flex-1 flex-col gap-4">
        {/* 1. Visual memory cue. Groups without a video keep a clean, calm frame of the same size. */}
        <div className="mx-auto w-full max-w-xl overflow-hidden rounded-3xl bg-gradient-to-br from-secondary/60 via-card to-accent/40 shadow-md">
          {group.video ? (
            <video key={group.video} ref={videoRef} src={group.video} poster={group.poster} autoPlay loop muted playsInline preload="auto" disablePictureInPicture className="aspect-video w-full object-cover" aria-hidden="true" />
          ) : (
            <div className="grid aspect-video w-full place-items-center" aria-hidden="true">
              <p dir="rtl" lang="ar" className="font-quran text-4xl text-foreground/25">{surah.arabicName}</p>
            </div>
          )}
        </div>

        {/* 2. Group indicator */}
        <div className="flex flex-wrap justify-center gap-2">
          {GROUPS.map((x, i) => (
            <button key={i} onClick={() => setG(i)} className={cn("relative min-h-11 rounded-full border-2 px-3 text-sm font-black", i === g ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card")} aria-label={`Ayahs ${x.from} to ${x.to}`}>
              {x.from}–{x.to}
              {done.includes(i) && <Check className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-success text-success-foreground" />}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-1.5 rounded-2xl bg-muted/60 p-1.5" role="tablist" aria-label="Memory support">
          {[{ id: 0, title: "Learn" }, ...LEVELS].map((l) => (
            <button key={l.id} role="tab" aria-selected={level === l.id} onClick={() => { stopAudio(); stopMic(); setTurn(false); setSuccess(false); setLevel(l.id); }}
              className={cn("min-h-12 rounded-xl px-1 text-[11px] font-black leading-tight", level === l.id ? "bg-card shadow" : "text-muted-foreground")}>
              {l.id === 0 ? "📖" : `🧠 ${l.id}`}<br />{l.title}
            </button>
          ))}
        </div>

        {/* 3. Arabic text — every ayah in the group; tap an ayah to hear it alone */}
        {level === 4 && !turn ? (
          <div className="rounded-3xl bg-card p-5 text-center shadow-md">
            <p className="text-lg font-black">Ayahs {group.from}–{group.to}</p>
            <p className="text-sm font-bold text-muted-foreground">Recite the whole group from memory · ayah {ayah + 1} of {verses.length}</p>
          </div>
        ) : (
        <div className="grid gap-2 rounded-3xl bg-card p-4 shadow-md">
          {verses.map((v, i) => {
            const ws = words(v);
            const current = i === ayah;
            return (
              <button key={i} type="button" onClick={() => playAyah(i, false)} className={cn("rounded-2xl p-2 transition-colors", current && "bg-primary/5 ring-2 ring-primary/30")} aria-label={`Play ayah ${group.from + i}`}>
                <p dir="rtl" lang="ar" className="font-quran text-center text-3xl leading-[2.2] sm:text-4xl">
                  {ws.map((w, k) => {
                    const hint = level > 0 && !masked(level, k, ws.length);
                    const hidden = level > 0 ? k >= said || !current ? !hint && !(current && k < said) : false : current && turn && k >= said;
                    const active = current && !turn && playing && k === word;
                    const passed = current && !turn && playing && k < word;
                    return (
                      <span key={k} className={cn("mx-0.5 inline-block rounded-xl px-1 transition-all duration-200",
                        active && "scale-110 bg-primary/25 text-primary",
                        passed && "text-foreground/70",
                        current && turn && k < said && (hinted.includes(k) ? "bg-accent/40" : "bg-success/25"),
                        hidden && "text-transparent [text-shadow:0_0_14px_hsl(var(--muted-foreground)/0.35)]",
                        !current && turn && level === 0 && "opacity-40")}>{w}</span>
                    );
                  })}
                  <span className="mx-1 inline-grid h-8 w-8 place-items-center rounded-full border-2 border-primary align-middle font-sans text-xs font-black">{group.from + i}</span>
                </p>
              </button>
            );
          })}
        </div>
        )}

        {success && (
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-success/15 p-3 animate-pop-in">
            <Check className="h-6 w-6 text-success" /><span className="text-lg font-black">You said it!</span>
            <GameButton tone="mint" className="min-h-11 px-4" onClick={nextAyah}>Next</GameButton>
          </div>
        )}

        {/* 4–5. Listen + My Turn */}
        {turn && !success ? (
          <div className="grid grid-cols-3 gap-3">
            <GameButton tone="neutral" className="min-h-16" onClick={() => { stopMic(); setTurn(false); }} aria-label="Stop"><Square className="mx-auto h-6 w-6" /></GameButton>
            <div className="grid place-items-center text-center text-xs font-black text-muted-foreground">
              <Mic className={cn("h-7 w-7", listening ? "animate-pulse text-primary" : "opacity-50")} />
              {listening ? "I’m listening…" : canHear ? "Say the ayah" : "Tap the light for each word"}
            </div>
            <GameButton tone="sun" className="min-h-16" onClick={() => { setHinted((h) => [...h, saidRef.current]); advanceTo(saidRef.current + 1); }} aria-label="Show the next word"><Lightbulb className="mx-auto h-6 w-6" /></GameButton>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <GameButton tone="sky" className="min-h-16" onClick={() => playAyah(ayah, false)} aria-label="Replay this ayah">
              <span className="inline-flex flex-col items-center text-xs font-black"><Volume2 className={cn("h-6 w-6", playing && "animate-pulse")} />Ayah</span>
            </GameButton>
            <GameButton tone="neutral" className="min-h-16" onClick={() => playAyah(0, true)} aria-label="Replay the whole group">
              <span className="inline-flex flex-col items-center text-xs font-black"><RotateCcw className="h-6 w-6" />Group</span>
            </GameButton>
            <GameButton tone="berry" className="min-h-16" onClick={startTurn}>
              <span className="inline-flex flex-col items-center text-xs font-black"><Mic className="h-6 w-6" />My Turn</span>
            </GameButton>
          </div>
        )}

        <GameButton tone="sun" className="min-h-14" onClick={() => { stopAudio(); stopMic(); setWhole(true); }}>
          <span className="inline-flex items-center gap-2 text-base font-black"><Mic className="h-6 w-6" />🎤 Recite the Whole Surah</span>
        </GameButton>

        {/* 6. Progress */}
        <div className="mt-auto">
          <div className="h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-success transition-all" style={{ width: `${(ayahsDone.length / surah.verses.length) * 100}%` }} /></div>
          <p className="mt-1 text-center text-xs font-black text-muted-foreground">{done.length} / {GROUPS.length} groups · {ayahsDone.length} / {surah.verses.length} ayahs</p>
        </div>
      </div>
    </GameShell>
  );
}

/** Final activity: recite all ayahs in order. The group's video (if any) follows along as the child moves through. */
function WholeSurah({ surah, onExit }: { surah: SurahData; onExit: () => void }) {
  const total = surah.verses.length;
  const [idx, setIdx] = useState(0);
  const [said, setSaid] = useState(0);
  const [hinted, setHinted] = useState<number[]>([]);
  const [listening, setListening] = useState(false);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [canHear, setCanHear] = useState(true);
  const recRef = useRef<Recognizer | null>(null);
  const saidRef = useRef(0);
  const idxRef = useRef(0);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const nextTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const verse = surah.verses[idx]!;
  const vw = words(verse);
  const gi = GROUPS.findIndex((x) => idx + 1 >= x.from && idx + 1 <= x.to);
  const group = GROUPS[gi]!;

  useEffect(() => setCanHear(!!getRecognizer()), []);

  const stopMic = useCallback(() => {
    clearTimeout(hintTimer.current);
    const r = recRef.current; recRef.current = null;
    if (r) { r.onend = null; try { r.stop(); } catch { /* ignore */ } }
    setListening(false);
  }, []);
  useEffect(() => () => { stopMic(); clearTimeout(nextTimer.current); }, [stopMic]);

  const armHint = () => {
    clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => { const n = saidRef.current; setHinted((h) => [...h, n]); advanceTo(n + 1); }, HINT_AFTER_MS);
  };

  const advanceTo = (n: number) => {
    const count = words(surah.verses[idxRef.current]!).length;
    const c = Math.min(n, count);
    if (c <= saidRef.current) return;
    saidRef.current = c; setSaid(c);
    if (c < count) { armHint(); return; }
    clearTimeout(hintTimer.current);
    const nextIdx = idxRef.current + 1;
    if (nextIdx >= total) {
      stopMic(); setFinished(true);
      try {
        const all = surah.verses.map((_, i) => i + 1);
        localStorage.setItem(AYAH_KEY, JSON.stringify(all));
        localStorage.setItem(KEY, JSON.stringify(GROUPS.map((_, i) => i)));
      } catch { /* ignore */ }
      return;
    }
    // Calm pause, then move on to the next ayah without restarting the microphone.
    nextTimer.current = setTimeout(() => { idxRef.current = nextIdx; setIdx(nextIdx); saidRef.current = 0; setSaid(0); setHinted([]); resetHeard.current = true; armHint(); }, 1200);
  };

  // Recognition results accumulate; remember where each new ayah began so old words are ignored.
  const offset = useRef(0);
  const resetHeard = useRef(false);

  const start = () => {
    stopMic(); setStarted(true);
    const R = getRecognizer();
    if (!R) return;
    const rec = new R(); recRef.current = rec;
    rec.lang = "ar-SA"; rec.continuous = true; rec.interimResults = true;
    offset.current = 0;
    rec.onresult = (e: any) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += " " + e.results[i][0].transcript;
      const heard = text.split(/\s+/).map(norm).filter(Boolean);
      if (resetHeard.current) { offset.current = heard.length; resetHeard.current = false; }
      const targets = words(surah.verses[idxRef.current]!).map(norm);
      let p = 0;
      for (const h of heard.slice(offset.current)) {
        for (let k = p; k < Math.min(p + 3, targets.length); k++) if (close(h, targets[k]!)) { p = k + 1; break; }
      }
      if (p > saidRef.current) advanceTo(p); else armHint();
    };
    rec.onerror = () => {};
    rec.onend = () => { if (recRef.current === rec) { offset.current = 0; resetHeard.current = saidRef.current === 0; try { rec.start(); } catch { setListening(false); } } };
    try { rec.start(); setListening(true); armHint(); } catch { setListening(false); }
  };

  const restart = () => { stopMic(); clearTimeout(nextTimer.current); idxRef.current = 0; setIdx(0); saidRef.current = 0; setSaid(0); setHinted([]); setFinished(false); setStarted(false); };

  if (finished) {
    return (
      <GameShell title="Recite the Whole Surah" onExit={onExit}>
        <div className="relative mt-6 grid justify-items-center gap-4 text-center animate-pop-in">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex justify-center gap-4">{["⭐", "✨", "🌟", "✨", "⭐"].map((st, i) => <span key={i} className="animate-pop-in text-3xl" style={{ animationDelay: `${i * 80}ms` }}>{st}</span>)}</div>
          <div className="mt-10 flex items-end justify-center gap-2">
            <img src={hamadCelebrating} alt="Hamad celebrating" className="h-40 w-auto object-contain drop-shadow-lg animate-bw-bounce" />
            <img src={talalCelebrating} alt="Talal celebrating" className="h-36 w-auto object-contain drop-shadow-lg animate-bw-bounce" />
          </div>
          <div className="flex gap-1">{(["R", "Y", "B", "G", "R"] as const).map((c, i) => <Block key={i} color={c} className="h-9 w-11 animate-bw-snap" />)}</div>
          <h2 className="text-3xl font-black">You did it!</h2>
          <p className="text-lg font-black text-muted-foreground">You memorized Surat Al-’Alaq!</p>
          <p dir="rtl" lang="ar" className="font-quran text-3xl">{surah.arabicName}</p>
          <div className="grid w-full grid-cols-2 gap-3">
            <GameButton tone="neutral" className="min-h-16" onClick={onExit}>Back</GameButton>
            <GameButton tone="mint" className="min-h-16" onClick={restart}><RotateCcw className="mx-auto h-6 w-6" /></GameButton>
          </div>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title="Recite the Whole Surah" current={idx} total={total} onExit={() => { stopMic(); onExit(); }}>
      <div className="mt-4 flex flex-1 flex-col gap-4">
        <div className="mx-auto w-full max-w-xl overflow-hidden rounded-3xl bg-gradient-to-br from-secondary/60 via-card to-accent/40 shadow-md">
          {group.video ? (
            <video key={group.video} src={group.video} poster={group.poster} autoPlay loop muted playsInline preload="auto" disablePictureInPicture className="aspect-video w-full object-cover animate-in fade-in duration-700" aria-hidden="true" />
          ) : (
            <div key={gi} className="grid aspect-video w-full place-items-center animate-in fade-in duration-700" aria-hidden="true">
              <p dir="rtl" lang="ar" className="font-quran text-4xl text-foreground/25">{surah.arabicName}</p>
            </div>
          )}
        </div>
        <p className="text-center text-sm font-black text-muted-foreground">Ayahs {group.from}–{group.to} · ayah {idx + 1} of {total}</p>

        <div className="rounded-3xl bg-card p-5 shadow-md">
          <p dir="rtl" lang="ar" className="font-quran text-center text-3xl leading-[2.2] sm:text-4xl">
            {vw.map((w, k) => {
              const shown = k < said || (k === 0 && vw.length > 1);
              return <span key={k} className={cn("mx-0.5 inline-block rounded-xl px-1 transition-all duration-300", k < said ? (hinted.includes(k) ? "bg-accent/40" : "bg-success/25") : shown ? "text-foreground/50" : "text-transparent [text-shadow:0_0_14px_rgba(120,120,120,0.35)]")}>{w}</span>;
            })}
            <span className="mx-1 inline-grid h-8 w-8 place-items-center rounded-full border-2 border-primary align-middle font-sans text-xs font-black">{idx + 1}</span>
          </p>
          {said >= vw.length && <p className="mt-2 text-center font-black text-success animate-pop-in">You said it!</p>}
        </div>

        {!started ? (
          <GameButton tone="berry" className="min-h-16" onClick={start}><span className="inline-flex items-center gap-2 text-lg font-black"><Mic className="h-6 w-6" />Start reciting</span></GameButton>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <GameButton tone="neutral" className="min-h-16" onClick={() => { stopMic(); setStarted(false); }} aria-label="Pause"><Square className="mx-auto h-6 w-6" /></GameButton>
            <div className="grid place-items-center text-center text-xs font-black text-muted-foreground">
              <Mic className={cn("h-7 w-7", listening ? "animate-pulse text-primary" : "opacity-50")} />
              {listening ? "I’m listening…" : canHear ? "Take your time" : "Tap the light for each word"}
            </div>
            <GameButton tone="sun" className="min-h-16" onClick={() => { setHinted((h) => [...h, saidRef.current]); advanceTo(saidRef.current + 1); }} aria-label="Show the next word"><Lightbulb className="mx-auto h-6 w-6" /></GameButton>
          </div>
        )}
      </div>
    </GameShell>
  );
}
