/**
 * Harakat & Tracing (لعبة الحركات) — homepage section, screen "play".
 *
 *   Harakat Slot Machine: pull the lever, three reels land on a 3-letter word.
 *   The child reads it aloud (mic); a correct read celebrates and the word + picture appear.
 *   Hear / show-next buttons help, and a tap-to-finish fallback covers devices without speech recognition.
 *   Build mode: see the picture, tap each reel to the right haraka, check.
 *
 *   Sandpaper Letters: trace a rough letter on a smooth board. The letter sound plays first. Coverage-based check
 *   (works for all 28 letters, dots included); a picture card rewards each letter.
 *
 * Data: src/data/arabicPlayArt.ts (words, levels, pictures, syllable audio map).
 * Art:  ./PlayArt.tsx (code-drawn) + src/assets/arabicplay/ (Gemini cut-outs).
 * Own localStorage key arabic-play-v1 so it never touches other progress.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Lightbulb, Mic, RotateCcw, Volume2 } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { shuffle } from "@/components/learn/shared";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/explorerSfx";
import { speakArabic, stopArabicVoice } from "@/lib/arabicVoice";
import { orderLetters, playLetterSound } from "@/lib/letterSounds";
import { getRecognizer, heardMatches, unlockVoice, type Recognizer } from "@/lib/arabicRecite";
import { LETTER_CARDS, SLOT_LEVELS, SYLLABLE_AUDIO, type SlotWord } from "@/data/arabicPlayArt";
import { Lever, SandTray, SlotMachine, StarBurst, StartDot, TraceTrail, type Pt } from "./PlayArt";

/* ---------------- progress (own key) ---------------- */

type Progress = { slot: string[]; trace: string[] };
const KEY = "arabic-play-v1";
function loadProgress(): Progress {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return { slot: Array.isArray(p.slot) ? p.slot : [], trace: Array.isArray(p.trace) ? p.trace : [] };
  } catch {
    return { slot: [], trace: [] };
  }
}
function useProgress() {
  const [p, setP] = useState<Progress>({ slot: [], trace: [] });
  useEffect(() => setP(loadProgress()), []);
  const mark = useCallback((kind: keyof Progress, id: string) => {
    setP((prev) => {
      if (prev[kind].includes(id)) return prev;
      const next = { ...prev, [kind]: [...prev[kind], id] };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
      return next;
    });
  }, []);
  return [p, mark] as const;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const say = (t: string) => speakArabic(t, SYLLABLE_AUDIO[t]);
/** The "yay" cheer lasts ~0.65s; speaking over it gets the word dropped on iPad/iPhone. */
const YAY_MS = 750;
/** Child seems stuck reading: reveal the next syllable after this long. */
const HINT_AFTER_MS = 6000;

/* ---------------- shell ---------------- */

type Screen = "hub" | "slot" | "trace";

export function ArabicPlayWorld({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState<Screen>("hub");
  const [progress, mark] = useProgress();
  useEffect(() => () => stopArabicVoice(), []);
  const back = () => { stopArabicVoice(); if (screen === "hub") onExit(); else setScreen("hub"); };
  const totalWords = SLOT_LEVELS.reduce((n, l) => n + l.words.length, 0);

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 min-[960px]:max-w-3xl">
      <header className="flex items-center gap-3">
        <GameButton tone="neutral" className="grid h-12 w-12 shrink-0 place-items-center rounded-full p-0" onClick={back} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </GameButton>
        <div className="min-w-0">
          <p lang="ar" dir="rtl" className="font-arabic text-xl font-black leading-tight">
            {screen === "slot" ? "آلة الحركات" : screen === "trace" ? "حروف ورق الصنفرة" : "لعبة الحركات"}
          </p>
          <p className="text-sm font-bold text-muted-foreground">
            {screen === "slot" ? "Harakat Slot Machine" : screen === "trace" ? "Sandpaper Letters" : "Harakat & Tracing"}
          </p>
        </div>
      </header>

      {screen === "hub" && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button type="button" onClick={() => { sfx("click"); setScreen("slot"); }} className="group grid gap-3 rounded-3xl border-2 border-foreground/10 bg-card p-4 text-start shadow-[0_5px_0_var(--neutral-shadow)] transition-transform active:translate-y-1 active:shadow-none">
            <SlotMachine reels={["كَ", "تَ", "بَ"]} spinning={false} />
            <span>
              <span lang="ar" dir="rtl" className="block font-arabic text-2xl font-black">آلة الحركات</span>
              <span className="block text-lg font-black">Harakat Slot Machine</span>
              <span className="block text-sm font-bold text-muted-foreground">Spin, read, build words · {progress.slot.length}/{totalWords} words</span>
            </span>
          </button>
          <button type="button" onClick={() => { sfx("click"); setScreen("trace"); }} className="group grid gap-3 rounded-3xl border-2 border-foreground/10 bg-card p-4 text-start shadow-[0_5px_0_var(--neutral-shadow)] transition-transform active:translate-y-1 active:shadow-none">
            <SandTray className="mx-auto max-w-[220px]">
              <span lang="ar" className="grid h-full place-items-center font-arabic text-[7rem] font-bold leading-none text-[#b8925a] opacity-70">ب</span>
            </SandTray>
            <span>
              <span lang="ar" dir="rtl" className="block font-arabic text-2xl font-black">حروف ورق الصنفرة</span>
              <span className="block text-lg font-black">Sandpaper Letters</span>
              <span className="block text-sm font-bold text-muted-foreground">Trace every letter · {progress.trace.length}/{TRACE_CARDS.length} letters</span>
            </span>
          </button>
        </div>
      )}

      {screen === "slot" && <SlotGame done={progress.slot} onWin={(id) => mark("slot", id)} />}
      {screen === "trace" && <TraceGame done={progress.trace} onWin={(id) => mark("trace", id)} />}
    </section>
  );
}

/* ================================================================
   HARAKAT SLOT MACHINE
   ================================================================ */

const HARAKAT = ["َ", "ِ", "ُ"]; // fatha, kasra, damma
const SUKUN = "ْ";
const baseOf = (s: string) => s.replace(/[ً-ْ]/g, "");
function optionsFor(reel: string, last: boolean, withSukun: boolean) {
  const b = baseOf(reel);
  const set = HARAKAT.map((h) => b + h);
  if (last && withSukun) set.push(b + SUKUN);
  return set;
}

type Mode = "spin" | "build";

function SlotGame({ done, onWin }: { done: readonly string[]; onWin: (id: string) => void }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [mode, setMode] = useState<Mode>("spin");
  const level = SLOT_LEVELS[levelIdx];
  const order = useMemo(() => shuffle(level.words), [level]);
  const [wi, setWi] = useState(0);
  const word = order[wi % order.length]; // build mode target
  const [spinWord, setSpinWord] = useState<SlotWord>(order[0]); // spin mode: last landed word
  useEffect(() => setSpinWord(order[0]), [order]);
  const shown = mode === "spin" ? spinWord : word;

  // spin state
  const [reels, setReels] = useState<readonly string[]>(word.reels);
  const [spinning, setSpinning] = useState(false);
  const [pulled, setPulled] = useState(false);
  const [hl, setHl] = useState<number | undefined>();
  const [won, setWon] = useState(false);
  const [busy, setBusy] = useState(false);
  const run = useRef(0);
  // reading (spin mode): the child reads the landed word aloud
  const [ready, setReady] = useState(false);
  const [listening, setListening] = useState(false);
  const [canHear, setCanHear] = useState(true);
  const readingRef = useRef(false);
  const targetRef = useRef<SlotWord>(order[0]);
  const revealRef = useRef(0);
  const recRef = useRef<Recognizer | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => { setCanHear(!!getRecognizer()); }, []);

  // build state
  const [pick, setPick] = useState<number[]>([0, 0, 0]);
  const opts = useMemo(
    () => word.reels.map((r, i) => optionsFor(r, i === 2, level.id === "sukun")),
    [word, level.id],
  );
  const [wrong, setWrong] = useState<number | undefined>();

  const stopMic = useCallback(() => {
    clearTimeout(hintTimer.current);
    const r = recRef.current; recRef.current = null;
    if (r) { r.onend = null; try { r.stop(); } catch { /* ignore */ } }
    setListening(false);
  }, []);

  const resetFor = useCallback((w: SlotWord, m: Mode) => {
    run.current++;
    stopArabicVoice(); stopMic();
    readingRef.current = false;
    setReady(false);
    setWon(false); setHl(undefined); setWrong(undefined); setBusy(false);
    if (m === "spin") setReels(w.reels);
    else {
      const o = w.reels.map((r, i) => optionsFor(r, i === 2, level.id === "sukun"));
      // start every reel on a wrong haraka so there's something to fix
      const start = o.map((list, i) => {
        const ok = list.indexOf(w.reels[i]);
        const wrongIdx = list.map((_, k) => k).filter((k) => k !== ok);
        return wrongIdx[Math.floor(Math.random() * wrongIdx.length)];
      });
      setPick(start);
      setReels(start.map((k, i) => o[i][k]));
    }
  }, [level.id, stopMic]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { resetFor(mode === "spin" ? spinWord : word, mode); }, [word, mode, resetFor]);
  useEffect(() => () => { run.current++; stopMic(); stopArabicVoice(); }, [stopMic]);

  const celebrate = async (id: number) => {
    setHl(undefined);
    sfx("yay");
    setWon(true);
    onWin(word.id);
    await wait(YAY_MS); // let the cheer finish so it doesn't swallow the word
    if (run.current === id) await say(word.ar);
  };

  const readSyllables = async (id: number) => {
    for (let i = 0; i < 3; i++) {
      if (run.current !== id) return;
      setHl(i);
      await say(word.reels[i]);
      await wait(250);
    }
  };

  const armHint = (target: SlotWord) => {
    clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => revealNext(target), HINT_AFTER_MS);
  };

  /** Show the next syllable (highlight + say it). Used by the hint timer and the lightbulb button. */
  const revealNext = (target: SlotWord) => {
    if (!readingRef.current) return;
    const k = revealRef.current;
    if (k >= 3) return;
    revealRef.current = k + 1;
    setHl(k);
    void say(target.reels[k]);
    armHint(target);
  };

  /** Mic: recognise the child's reading; a match finishes the round straight away. */
  const startListening = (target: SlotWord) => {
    unlockVoice();
    stopMic();
    const R = getRecognizer();
    if (!R) { setCanHear(false); return; }
    const rec = new R(); recRef.current = rec;
    rec.lang = "ar-SA"; rec.continuous = true; rec.interimResults = true;
    rec.onresult = (e: any) => {
      if (recRef.current !== rec) return;
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += " " + e.results[i][0].transcript;
      if (heardMatches(text, target.ar)) { stopMic(); void finishRead(target); }
      else armHint(target);
    };
    rec.onerror = () => { /* stay calm; the tap fallback still works */ };
    rec.onend = () => { if (recRef.current === rec) { try { rec.start(); } catch { stopMic(); } } };
    try { rec.start(); setListening(true); armHint(target); } catch { stopMic(); setCanHear(false); }
  };

  /** The child read it (or tapped ✓): celebrate immediately, then say the full word. */
  const finishRead = async (target: SlotWord) => {
    if (!readingRef.current) return;
    readingRef.current = false;
    stopMic();
    const id = run.current;
    setReady(false); setHl(undefined);
    sfx("yay");
    setWon(true);
    onWin(target.id);
    await wait(YAY_MS); // let the cheer finish so it doesn't swallow the word
    if (run.current === id) await say(target.ar);
  };

  const pull = async () => {
    if (spinning || busy) return;
    unlockVoice(); // inside the tap, so speech stays allowed on iPad/iPhone
    const id = ++run.current;
    stopMic();
    readingRef.current = false;
    setBusy(true); setWon(false); setHl(undefined); setReady(false); setWrong(undefined);
    sfx("click");
    setPulled(true); setSpinning(true);
    setTimeout(() => setPulled(false), 380);
    const pool = order.filter((w) => w.id !== spinWord.id);
    const next = pool[Math.floor(Math.random() * pool.length)] ?? spinWord;
    await wait(1100);
    if (run.current !== id) return;
    setSpinWord(next);
    setReels(next.reels);
    setSpinning(false);
    sfx("coin");
    await wait(250); // reels stop; the child's turn starts right away
    if (run.current !== id) return;
    targetRef.current = next;
    revealRef.current = 0;
    readingRef.current = true;
    setBusy(false);
    setReady(true);
  };

  const tapReel = (i: number) => {
    if (won) return;
    sfx("pop");
    setWrong(undefined);
    setPick((p) => {
      const n = [...p];
      n[i] = (n[i] + 1) % opts[i].length;
      setReels(n.map((k, j) => opts[j][k]));
      void say(opts[i][n[i]]);
      return n;
    });
  };

  const check = async () => {
    unlockVoice();
    const id = ++run.current;
    const bad = reels.findIndex((r, i) => r !== word.reels[i]);
    if (bad >= 0) {
      sfx("buzz");
      setWrong(bad);
      setHl(bad);
      return;
    }
    setBusy(true);
    await readSyllables(id);
    if (run.current === id) await celebrate(id);
    setBusy(false);
  };

  const nextWord = () => { sfx("click"); setWi((n) => n + 1); };

  return (
    <div className="mt-4 grid gap-4">
      {/* level + mode */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Level">
        {SLOT_LEVELS.map((l, i) => {
          const n = l.words.filter((w) => done.includes(w.id)).length;
          return (
            <GameButton key={l.id} tone={i === levelIdx ? "sun" : "neutral"} role="tab" aria-selected={i === levelIdx} className="shrink-0 px-3 py-2 text-sm" onClick={() => { setLevelIdx(i); setWi(0); }}>
              <span lang="ar" className="font-arabic">{l.title.ar}</span> · {n}/{l.words.length}
            </GameButton>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Mode">
        <GameButton tone={mode === "spin" ? "sky" : "neutral"} role="tab" aria-selected={mode === "spin"} className="min-h-12 text-sm" onClick={() => setMode("spin")}>
          🎰 Spin · <span lang="ar" className="font-arabic">اسحب</span>
        </GameButton>
        <GameButton tone={mode === "build" ? "sky" : "neutral"} role="tab" aria-selected={mode === "build"} className="min-h-12 text-sm" onClick={() => setMode("build")}>
          🧩 Build · <span lang="ar" className="font-arabic">ركّب</span>
        </GameButton>
      </div>

      <p className="text-center text-sm font-bold text-muted-foreground">
        <span lang="ar" className="font-arabic">{level.hint.ar}</span> · {level.hint.en}
      </p>

      {/* build mode: target picture */}
      {mode === "build" && (
        <div className="flex items-center justify-center gap-3">
          <img src={word.img} alt={word.en} className="h-28 w-28 object-contain drop-shadow" />
          <div className="grid gap-2">
            <p className="text-sm font-bold text-muted-foreground">Tap each reel to fix its haraka</p>
            <GameButton tone="neutral" className="flex items-center justify-center gap-2 px-3 py-2 text-sm" onClick={() => void say(word.ar)}>
              <Volume2 className="h-4 w-4" /> Hear the word
            </GameButton>
          </div>
        </div>
      )}

      {/* machine */}
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <SlotMachine reels={reels} spinning={spinning} highlight={hl} onReelTap={mode === "build" && !busy ? tapReel : undefined} />
          <StarBurst show={won} />
        </div>
        {mode === "spin" && <Lever pulled={pulled} onPull={() => void pull()} disabled={busy} className="h-40 shrink-0 sm:h-52" />}
      </div>

      {wrong != null && (
        <p className="text-center font-bold text-destructive">
          <span lang="ar" className="font-arabic">حاول مرّة ثانية</span> · Check the glowing reel
        </p>
      )}

      {mode === "build" && !won && (
        <GameButton tone="mint" className="flex min-h-14 items-center justify-center gap-2 text-lg" onClick={() => void check()} disabled={busy}>
          <Check className="h-5 w-5" /> Check · <span lang="ar" className="font-arabic">تحقّق</span>
        </GameButton>
      )}
      {mode === "spin" && !won && !ready && !busy && (
        <p className="text-center font-black">Pull the lever! · <span lang="ar" className="font-arabic">اسحب الذراع</span></p>
      )}

      {/* the child reads the word the reels landed on */}
      {mode === "spin" && ready && !won && (
        <div className="grid gap-3 rounded-3xl border-2 border-primary/30 bg-card p-4 text-center shadow-md animate-pop-in">
          <p className="text-xl font-black">
            Read the word! · <span lang="ar" dir="rtl" className="font-arabic">اقرأ الكلمة</span>
          </p>
          <p className="text-sm font-bold text-muted-foreground">
            {!canHear ? "Read it, then tap ✓" : listening ? "I’m listening… read the whole word" : "Tap the mic, then read the word"}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {canHear ? (
              <GameButton tone="berry" className="min-h-16" onClick={() => startListening(targetRef.current)} aria-label="Start reading">
                <Mic className={cn("mx-auto h-7 w-7", listening && "animate-pulse")} />
              </GameButton>
            ) : (
              <GameButton tone="mint" className="min-h-16" onClick={() => void finishRead(targetRef.current)} aria-label="I read it">
                <Check className="mx-auto h-7 w-7" />
              </GameButton>
            )}
            <GameButton tone="sky" className="min-h-16" onClick={() => { unlockVoice(); void say(targetRef.current.ar); }} aria-label="Hear the word">
              <Volume2 className="mx-auto h-7 w-7" />
            </GameButton>
            <GameButton tone="sun" className="min-h-16" onClick={() => { unlockVoice(); revealNext(targetRef.current); }} aria-label="Show the next part">
              <Lightbulb className="mx-auto h-7 w-7" />
            </GameButton>
          </div>
          {canHear && (
            <button type="button" onClick={() => void finishRead(targetRef.current)} className="text-sm font-black text-muted-foreground underline">
              I read it ✓
            </button>
          )}
        </div>
      )}

      {/* result card */}
      {won && (
        <div className="grid grid-cols-[auto_1fr] items-center gap-4 rounded-3xl border-2 border-foreground/10 bg-card p-4 shadow-[0_5px_0_var(--neutral-shadow)]">
          <img src={shown.img} alt={shown.en} className="h-28 w-28 object-contain" />
          <div className="min-w-0">
            <p lang="ar" dir="rtl" className="font-arabic text-5xl font-black leading-tight">{shown.ar}</p>
            <p className="text-lg font-black">{shown.en}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <GameButton tone="neutral" className="flex items-center gap-1 px-3 py-2 text-sm" onClick={() => void say(shown.ar)}><Volume2 className="h-4 w-4" /> Again</GameButton>
              {mode === "build" && <GameButton tone="sun" className="flex items-center gap-1 px-3 py-2 text-sm" onClick={nextWord}>Next word <ArrowRight className="h-4 w-4" /></GameButton>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   SAND TRACING
   ================================================================ */

const M = 200; // mask resolution (logical units)
const CELL = 2; // coverage grid cell size
const BRUSH = 13; // finger radius in mask units
const FONT = '"Noto Naskh Arabic", "Amiri Quran", serif';
const TRACE_CARDS = orderLetters(LETTER_CARDS);

type Glyph = { cells: Set<number>; total: number; start: Pt; angle: number; fontPx: number; x: number; y: number };

/** Render the letter offscreen, centred and scaled, and return its pixel mask on a coarse grid. */
function measureGlyph(letter: string): Glyph {
  const c = document.createElement("canvas");
  c.width = M; c.height = M;
  const ctx = c.getContext("2d")!;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `700 100px ${FONT}`;
  let m = ctx.measureText(letter);
  const w0 = m.actualBoundingBoxLeft + m.actualBoundingBoxRight || 50;
  const h0 = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent || 80;
  const fontPx = 100 * Math.min((M * 0.62) / w0, (M * 0.72) / h0);
  ctx.font = `700 ${fontPx}px ${FONT}`;
  m = ctx.measureText(letter);
  const x = M / 2 - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
  const y = M / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
  ctx.fillStyle = "#000";
  ctx.fillText(letter, x, y);
  const data = ctx.getImageData(0, 0, M, M).data;
  const cells = new Set<number>();
  const G = M / CELL;
  let best = -Infinity, sx = 100, sy = 100, minX = M, maxX = 0, minY = M, maxY = 0;
  for (let gy = 0; gy < G; gy++)
    for (let gx = 0; gx < G; gx++) {
      const px = gx * CELL + 1, py = gy * CELL + 1;
      if (data[(py * M + px) * 4 + 3] > 110) {
        cells.add(gy * G + gx);
        minX = Math.min(minX, px); maxX = Math.max(maxX, px); minY = Math.min(minY, py); maxY = Math.max(maxY, py);
        const score = px - py * 0.6; // Arabic starts top-right
        if (score > best) { best = score; sx = px; sy = py; }
      }
    }
  const tall = maxY - minY > (maxX - minX) * 1.6;
  return { cells, total: cells.size, start: { x: sx / 2, y: sy / 2 }, angle: tall ? 90 : 180, fontPx, x, y };
}

/** A grainy pattern for the sandpaper letter (tan grit on darker and lighter specks). */
function sandpaperGrain(ctx: CanvasRenderingContext2D): CanvasPattern | string {
  if (typeof document === "undefined") return "#c9a46a";
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  if (!g) return "#c9a46a";
  g.fillStyle = "#cfa96e";
  g.fillRect(0, 0, 64, 64);
  const colors = ["#a87a40", "#e2c28c", "#8a5f2e", "#f0d9a8"];
  for (let i = 0; i < 260; i++) {
    g.fillStyle = colors[i % colors.length]!;
    g.globalAlpha = 0.35 + ((i * 37) % 60) / 100;
    g.fillRect((i * 53) % 64, (i * 29) % 64, 1 + (i % 2), 1);
  }
  return ctx.createPattern(c, "repeat") ?? "#c9a46a";
}

function TraceGame({ done, onWin }: { done: readonly string[]; onWin: (id: string) => void }) {
  const firstTodo = Math.max(0, TRACE_CARDS.findIndex((c) => !done.includes(c.letter)));
  const [li, setLi] = useState(firstTodo);
  const card = TRACE_CARDS[li];
  const [glyph, setGlyph] = useState<Glyph | null>(null);
  const [pts, setPts] = useState<Pt[]>([]);
  const [strokes, setStrokes] = useState<Pt[][]>([]);
  const [won, setWon] = useState(false);
  const [hint, setHint] = useState(false);
  const covered = useRef(new Set<number>());
  const off = useRef({ off: 0, all: 0 });
  const area = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const down = useRef(false);
  const stripRef = useRef<HTMLDivElement>(null);

  // measure the glyph once the Arabic font is ready
  useEffect(() => {
    let alive = true;
    setGlyph(null);
    const go = () => alive && setGlyph(measureGlyph(card.letter));
    if (document.fonts?.load) document.fonts.load(`700 100px ${FONT}`, card.letter).then(go, go);
    else go();
    return () => { alive = false; };
  }, [card.letter]);

  // reset on letter change
  useEffect(() => {
    covered.current = new Set(); off.current = { off: 0, all: 0 };
    setPts([]); setStrokes([]); setWon(false); setHint(false);
    stripRef.current?.querySelector(`[data-i="${li}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [li]);

  // say the letter's sound when a letter opens
  useEffect(() => { void playLetterSound(card.letter); }, [card.letter]);

  // draw the sandpaper letter on the board at full resolution
  const paint = useCallback(() => {
    const cv = canvas.current, box = area.current;
    if (!cv || !box || !glyph) return;
    const size = box.clientWidth;
    const dpr = window.devicePixelRatio || 1;
    cv.width = size * dpr; cv.height = size * dpr;
    const ctx = cv.getContext("2d")!;
    const k = (size / M) * dpr;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.clearRect(0, 0, M, M);
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.font = `700 ${glyph.fontPx}px ${FONT}`;
    // rough sandpaper letter, raised: soft shadow under a grainy fill
    ctx.save();
    ctx.shadowColor = "rgba(70, 42, 16, 0.35)";
    ctx.shadowOffsetX = 1.4;
    ctx.shadowOffsetY = 1.8;
    ctx.shadowBlur = 1.6;
    ctx.fillStyle = sandpaperGrain(ctx);
    ctx.fillText(card.letter, glyph.x, glyph.y);
    ctx.restore();
  }, [glyph, card.letter]);

  useEffect(() => {
    paint();
    const box = area.current;
    if (!box || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(paint);
    ro.observe(box);
    return () => ro.disconnect();
  }, [paint]);

  const toMask = (e: React.PointerEvent): Pt => {
    const r = area.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
  };

  const cover = (p: Pt) => {
    if (!glyph) return;
    const G = M / CELL;
    const cx = (p.x * 2) / CELL, cy = (p.y * 2) / CELL, rr = BRUSH / CELL;
    let near = false;
    for (let gy = Math.floor(cy - rr); gy <= Math.ceil(cy + rr); gy++)
      for (let gx = Math.floor(cx - rr); gx <= Math.ceil(cx + rr); gx++) {
        if (gx < 0 || gy < 0 || gx >= G || gy >= G) continue;
        if ((gx - cx) ** 2 + (gy - cy) ** 2 > rr * rr) continue;
        const id = gy * G + gx;
        if (glyph.cells.has(id)) { covered.current.add(id); near = true; }
      }
    off.current.all++;
    if (!near) off.current.off++;
  };

  const finish = () => {
    if (!glyph || won) return;
    const pct = covered.current.size / glyph.total;
    if (pct >= 0.72) {
      setWon(true);
      setHint(false);
      sfx("yay");
      onWin(card.letter);
      void playLetterSound(card.letter).then(() => speakArabic(card.word));
    }
  };

  const onDown = (e: React.PointerEvent) => {
    if (won) return;
    down.current = true;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    const p = toMask(e);
    cover(p);
    setPts([p]);
    sfx("rustle");
  };
  const onMove = (e: React.PointerEvent) => {
    if (!down.current || won) return;
    const p = toMask(e);
    cover(p);
    setPts((prev) => [...prev, p]);
    const o = off.current;
    if (o.all > 25 && o.off / o.all > 0.4) {
      // too much scribbling outside the letter: smooth the sand and nudge
      down.current = false;
      setHint(true);
      sfx("buzz");
      covered.current = new Set(); off.current = { off: 0, all: 0 };
      setPts([]); setStrokes([]);
      return;
    }
    if (glyph && covered.current.size / glyph.total >= 0.72) finish();
  };
  const onUp = () => {
    if (!down.current) return;
    down.current = false;
    setStrokes((s) => (pts.length ? [...s, pts] : s));
    setPts([]);
    finish();
  };

  const clear = () => {
    covered.current = new Set(); off.current = { off: 0, all: 0 };
    setPts([]); setStrokes([]); setWon(false); setHint(false);
    sfx("rustle");
  };
  const go = (d: number) => { sfx("click"); setLi((i) => (i + d + TRACE_CARDS.length) % TRACE_CARDS.length); };
  const progressPct = glyph ? Math.min(100, Math.round((covered.current.size / glyph.total / 0.72) * 100)) : 0;

  return (
    <div className="mt-4 grid gap-4">
      {/* letter strip */}
      <div ref={stripRef} dir="rtl" className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Letters">
        {TRACE_CARDS.map((c, i) => (
          <button
            key={c.letter}
            data-i={i}
            type="button"
            role="tab"
            aria-selected={i === li}
            onClick={() => { sfx("click"); setLi(i); }}
            className={cn(
              "relative grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 font-arabic text-2xl font-bold transition-transform active:translate-y-0.5",
              i === li ? "border-primary bg-primary text-primary-foreground" : "border-foreground/10 bg-card",
            )}
          >
            {c.letter}
            {done.includes(c.letter) && <Check className="absolute -left-1 -top-1 h-4 w-4 rounded-full bg-success p-0.5 text-success-foreground" />}
          </button>
        ))}
      </div>

      {/* tray */}
      <div className="relative mx-auto w-full max-w-[440px]">
        <SandTray variant="sandpaper">
          <div
            ref={area}
            className="absolute inset-0 touch-none select-none"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            aria-label={`Trace the letter ${card.letter}`}
            role="img"
          >
            <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
            {strokes.map((s, i) => <TraceTrail key={i} points={s} done={won} />)}
            <TraceTrail points={pts} done={won} />
            {glyph && !won && strokes.length === 0 && pts.length === 0 && <StartDot x={glyph.start.x} y={glyph.start.y} angle={glyph.angle} />}
          </div>
        </SandTray>
        <StarBurst show={won} />
      </div>

      {/* progress + hint */}
      {!won && (
        <div className="grid gap-2">
          <div className="h-3 overflow-hidden rounded-full bg-foreground/10" aria-hidden>
            <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${progressPct}%` }} />
          </div>
          <p className={cn("text-center text-sm font-bold", hint ? "text-destructive" : "text-muted-foreground")}>
            {hint
              ? <>Stay inside the letter · <span lang="ar" className="font-arabic">امشِ داخل الحرف</span></>
              : <>Start at the glowing dot and trace the whole letter, dots too · <span lang="ar" className="font-arabic">ابدأ من النقطة المضيئة</span></>}
          </p>
        </div>
      )}

      {/* reward card */}
      {won && (
        <div className="grid grid-cols-[auto_1fr] items-center gap-4 rounded-3xl border-2 border-foreground/10 bg-card p-4 shadow-[0_5px_0_var(--neutral-shadow)]">
          <img src={card.img} alt={card.en} className="h-28 w-28 object-contain" />
          <div className="min-w-0">
            <p lang="ar" dir="rtl" className="font-arabic text-4xl font-black leading-tight">
              <span className="text-primary">{card.letter}</span> · {card.word}
            </p>
            <p className="text-lg font-black">{card.en}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <GameButton tone="neutral" className="flex items-center gap-1 px-3 py-2 text-sm" onClick={() => void speakArabic(card.word)}><Volume2 className="h-4 w-4" /> Hear it</GameButton>
              <GameButton tone="sun" className="flex items-center gap-1 px-3 py-2 text-sm" onClick={() => go(1)}>Next letter <ArrowLeft className="h-4 w-4" /></GameButton>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center gap-2">
        <GameButton tone="neutral" className="flex items-center gap-1 px-3 py-2 text-sm" onClick={() => go(-1)} aria-label="Previous letter"><ArrowRight className="h-4 w-4" /></GameButton>
        <GameButton tone="neutral" className="flex items-center gap-1 px-4 py-2 text-sm" onClick={clear}><RotateCcw className="h-4 w-4" /> Smooth the sand</GameButton>
        <GameButton tone="neutral" className="flex items-center gap-1 px-3 py-2 text-sm" onClick={() => go(1)} aria-label="Next letter"><ArrowLeft className="h-4 w-4" /></GameButton>
      </div>
    </div>
  );
}
