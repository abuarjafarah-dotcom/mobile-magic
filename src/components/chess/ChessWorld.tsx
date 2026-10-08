import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

import { ArrowLeft, RotateCcw, Undo2, Sparkles, Star, Check, Volume2, VolumeX } from "lucide-react";
import { speak, stopVoice, isVoiceOn, setVoiceOn, replayVoice, type VoiceLang } from "@/lib/voice";
import { GameButton } from "@/components/game/GameButton";
import { cn } from "@/lib/utils";
import {
  initialState, fromMap, legalMoves, move, status, nameToSq,
  type ChessState, type Color, type Kind, type Piece,
} from "@/lib/chess";
import boardImg from "@/assets/chess/board.jpg";
import hamadThink from "@/assets/chess/hamad-think.png";
import hamadCheer from "@/assets/chess/hamad-cheer.png";
import hamadKing from "@/assets/chess/hamad-king.png";
import wk from "@/assets/chess/w-king.png"; import wq from "@/assets/chess/w-queen.png";
import wr from "@/assets/chess/w-rook.png"; import wb from "@/assets/chess/w-bishop.png";
import wn from "@/assets/chess/w-knight.png"; import wp from "@/assets/chess/w-pawn.png";
import bk from "@/assets/chess/b-king.png"; import bq from "@/assets/chess/b-queen.png";
import br from "@/assets/chess/b-rook.png"; import bb from "@/assets/chess/b-bishop.png";
import bn from "@/assets/chess/b-knight.png"; import bp from "@/assets/chess/b-pawn.png";

const IMG: Record<Color, Record<Kind, string>> = {
  w: { k: wk, q: wq, r: wr, b: wb, n: wn, p: wp },
  b: { k: bk, q: bq, r: br, b: bb, n: bn, p: bp },
};
const NAME: Record<Kind, string> = { p: "Pawn", n: "Knight", b: "Bishop", r: "Rook", q: "Queen", k: "King" };
const STORE = "chess-world-v1";

/* ---------- soft sounds ---------- */
let ctx: AudioContext | null = null;
function tone(kind: "move" | "capture" | "win" | "nudge") {
  try {
    ctx ??= new AudioContext();
    const seq = { move: [520], capture: [440, 330], win: [523, 659, 784], nudge: [260] }[kind];
    seq.forEach((f, i) => {
      const o = ctx!.createOscillator(), g = ctx!.createGain(), t = ctx!.currentTime + i * 0.11;
      o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.08, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(g).connect(ctx!.destination); o.start(t); o.stop(t + 0.2);
    });
  } catch { /* no audio */ }
}

/* ---------- board ---------- */
type BoardProps = {
  state: ChessState;
  onMove: (from: number, to: number) => boolean;
  highlight?: number[];
  onSquareTap?: (i: number) => void;
};

function ChessBoard({ state, onMove, highlight = [], onSquareTap }: BoardProps) {
  const { t, lang } = useChess();
  const ref = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<number | null>(null);
  const [drag, setDrag] = useState<{ from: number; x: number; y: number; moved: boolean } | null>(null);
  const [nudge, setNudge] = useState<number | null>(null);
  const [ghost, setGhost] = useState<{ p: Piece; i: number } | null>(null);
  const prev = useRef(state);

  useEffect(() => {
    // detect captured piece for a gentle fade
    const ids = new Set(state.board.filter(Boolean).map((p) => p!.id));
    const gone = prev.current.board.findIndex((p) => p && !ids.has(p.id));
    if (gone >= 0) { setGhost({ p: prev.current.board[gone]!, i: gone }); setTimeout(() => setGhost(null), 450); }
    prev.current = state;
    setSel(null);
  }, [state]);

  const targets = sel !== null ? legalMoves(state, sel) : [];
  const squareAt = (x: number, y: number) => {
    const r = ref.current!.getBoundingClientRect();
    const f = Math.floor(((x - r.left) / r.width) * 8), k = Math.floor(((y - r.top) / r.height) * 8);
    return f < 0 || f > 7 || k < 0 || k > 7 ? -1 : k * 8 + f;
  };
  const tryMove = (from: number, to: number) => {
    if (to === from) return;
    if (!onMove(from, to)) { setNudge(from); tone("nudge"); void speak(t("illegal"), lang); setTimeout(() => setNudge(null), 420); setSel(null); }
  };

  const down = (e: React.PointerEvent, i: number) => {
    const p = state.board[i];
    if (sel !== null && targets.includes(i)) { tryMove(sel, i); return; }
    if (!p || p.c !== state.turn) { onSquareTap?.(i); if (sel !== null) tryMove(sel, i); return; }
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    if (sel !== i) void speak(t("tryMove", { piece: t(NAME[p.t]) }), lang);
    setSel(i);
    setDrag({ from: i, x: e.clientX, y: e.clientY, moved: false });
  };
  const moveP = (e: React.PointerEvent) => drag && setDrag({ ...drag, x: e.clientX, y: e.clientY, moved: drag.moved || Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6 });
  const up = (e: React.PointerEvent) => {
    if (!drag) return;
    const to = squareAt(e.clientX, e.clientY);
    if (drag.moved) { if (to >= 0 && to !== drag.from) tryMove(drag.from, to); }
    setDrag(null);
  };

  const rect = ref.current?.getBoundingClientRect();
  return (
    <div
      ref={ref}
      className="relative mx-auto aspect-square w-full touch-none select-none overflow-hidden rounded-2xl shadow-[0_10px_0_var(--neutral-shadow)] ring-4 ring-card"
      style={{ backgroundImage: `url(${boardImg})`, backgroundSize: "cover" }}
      onPointerMove={moveP}
      onPointerUp={up}
      onPointerCancel={() => setDrag(null)}
    >
      {Array.from({ length: 64 }, (_, i) => {
        const isT = targets.includes(i), cap = isT && state.board[i];
        return (
          <button
            key={i}
            aria-label={`square ${"abcdefgh"[i % 8]}${8 - Math.floor(i / 8)}`}
            onPointerDown={(e) => down(e, i)}
            className="absolute flex items-center justify-center"
            style={{ left: `${(i % 8) * 12.5}%`, top: `${Math.floor(i / 8) * 12.5}%`, width: "12.5%", height: "12.5%" }}
          >
            {sel === i && <span className="absolute inset-0 bg-primary/45" />}
            {highlight.includes(i) && <span className="absolute inset-1 rounded-lg bg-success/45 animate-pulse" />}
            {isT && !cap && <span className="h-[32%] w-[32%] rounded-full bg-success/70 shadow-md animate-pop-in" />}
            {cap && <span className="absolute inset-[6%] rounded-full border-[5px] border-success/80 animate-pop-in" />}
          </button>
        );
      })}
      {state.board.map((p, i) => p && (() => {
        const dragging = drag?.from === i && drag.moved && rect;
        const style = dragging
          ? { left: drag.x - rect.left - rect.width / 16, top: drag.y - rect.top - rect.height / 16 - rect.height / 40, transition: "none", zIndex: 30, transform: "scale(1.22)" }
          : { left: `${(i % 8) * 12.5}%`, top: `${Math.floor(i / 8) * 12.5}%`, transform: sel === i ? "scale(1.12) translateY(-4%)" : undefined };
        return (
          <img
            key={p.id}
            src={IMG[p.c][p.t]}
            alt={`${p.c === "w" ? "White" : "Black"} ${NAME[p.t]}`}
            draggable={false}
            className={cn("pointer-events-none absolute z-10 h-[12.5%] w-[12.5%] object-contain p-[1.2%] drop-shadow-[0_4px_3px_rgb(0_0_0/0.35)] transition-[left,top,transform] duration-300 ease-out", nudge === i && "animate-verb-shake")}
            style={style}
          />
        );
      })())}
      {ghost && (
        <img src={IMG[ghost.p.c][ghost.p.t]} alt="" className="pointer-events-none absolute z-20 h-[12.5%] w-[12.5%] object-contain p-[1.2%] transition-all duration-500"
          style={{ left: `${(ghost.i % 8) * 12.5}%`, top: `${Math.floor(ghost.i / 8) * 12.5}%`, animation: "chess-vanish 450ms ease-out forwards" }} />
      )}
      <style>{`@keyframes chess-vanish{to{opacity:0;transform:scale(.4) translateY(-20%)}}`}</style>
    </div>
  );
}

/* ---------- language + voice ---------- */
const LANG_KEY = "chess-lang-v1";
const DICT: Record<string, { en: string; ar: string }> = {
  Pawn: { en: "Pawn", ar: "بيدق" }, Knight: { en: "Knight", ar: "حصان" }, Bishop: { en: "Bishop", ar: "فيل" },
  Rook: { en: "Rook", ar: "قلعة" }, Queen: { en: "Queen", ar: "وزير" }, King: { en: "King", ar: "ملك" },
  back: { en: "Back", ar: "رجوع" }, games: { en: "Games", ar: "الألعاب" },
  chess: { en: "Chess", ar: "الشطرنج" }, tagline: { en: "Play, learn and try challenges with Hamad", ar: "العب وتعلم وجرب التحديات مع حمد" },
  play: { en: "Play Chess", ar: "العب الشطرنج" }, learn: { en: "Learn Chess", ar: "تعلم الشطرنج" }, challenges: { en: "Chess Challenges", ar: "تحديات الشطرنج" },
  welcome: { en: "Let's play chess! Choose play, learn, or challenges.", ar: "هيا نلعب الشطرنج! اختر اللعب أو التعلم أو التحديات." },
  illegal: { en: "That piece cannot move there. Try another square.", ar: "لا يمكن لهذه القطعة التحرك إلى هناك. جرب مربعا آخر." },
  tryMove: { en: "Try moving the {piece}.", ar: "حاول تحريك ال{piece}." },
  whiteTurn: { en: "White's turn", ar: "دور الأبيض" }, blackTurn: { en: "Black's turn", ar: "دور الأسود" },
  whiteCheck: { en: "White's king is in check. Keep it safe!", ar: "الملك الأبيض في خطر. احمه!" },
  blackCheck: { en: "Black's king is in check. Keep it safe!", ar: "الملك الأسود في خطر. احمه!" },
  whiteWins: { en: "Checkmate! White wins!", ar: "كش ملك! فاز الأبيض!" }, blackWins: { en: "Checkmate! Black wins!", ar: "كش ملك! فاز الأسود!" },
  stalemate: { en: "Stalemate. It's a draw.", ar: "تعادل! لا أحد يفوز." },
  newGame: { en: "New Game", ar: "لعبة جديدة" }, reset: { en: "Reset", ar: "إعادة" }, undo: { en: "Undo", ar: "تراجع" },
  learnIntro: { en: "Let's learn the pieces.", ar: "هيا نتعلم قطع الشطرنج." },
  "say-p": { en: "The pawn moves forward, and captures diagonally.", ar: "البيدق يتحرك إلى الأمام، ويأكل بشكل مائل." },
  "say-n": { en: "The knight jumps in an L shape.", ar: "الحصان يقفز على شكل حرف ل." },
  "say-b": { en: "The bishop moves diagonally.", ar: "الفيل يتحرك بشكل مائل." },
  "say-r": { en: "The rook moves straight.", ar: "القلعة تتحرك بخط مستقيم." },
  "say-q": { en: "The queen moves straight or diagonally.", ar: "الوزير يتحرك بخط مستقيم أو مائل." },
  "say-k": { en: "The king moves one square at a time.", ar: "الملك يتحرك مربعا واحدا في كل مرة." },
  showMe: { en: "Can you move the {piece}? Drag it or tap it.", ar: "هل تستطيع تحريك ال{piece}؟ اسحبه أو المسه." },
  greatMove: { en: "Great job! Try another square.", ar: "أحسنت! جرب مربعا آخر." },
  nextPiece: { en: "Next piece", ar: "القطعة التالية" }, quiz: { en: "Quiz", ar: "سؤال" }, nextQ: { en: "Next question", ar: "السؤال التالي" },
  yes: { en: "Yes! Great thinking!", ar: "نعم! أحسنت التفكير!" }, almost: { en: "Almost!", ar: "قريب!" },
  "q-b": { en: "Which piece moves diagonally?", ar: "أي قطعة تتحرك بشكل مائل؟" },
  "q-n": { en: "Which piece can jump over other pieces?", ar: "أي قطعة تستطيع القفز فوق القطع الأخرى؟" },
  "q-r": { en: "Which piece moves straight?", ar: "أي قطعة تتحرك بخط مستقيم؟" },
  "q-k": { en: "Which piece moves one square at a time?", ar: "أي قطعة تتحرك مربعا واحدا في كل مرة؟" },
  pickCh: { en: "Pick any challenge. You can play them again anytime!", ar: "اختر أي تحد. يمكنك اللعب مرة أخرى متى شئت!" },
  tryAgain: { en: "Try again", ar: "حاول مرة أخرى" }, next: { en: "Next", ar: "التالي" },
  won: { en: "Wonderful! You did it!", ar: "رائع! لقد نجحت!" }, niceTry: { en: "Nice try!", ar: "محاولة جميلة!" },
  "c0-t": { en: "Find the Knight", ar: "اعثر على الحصان" }, "c0-a": { en: "Which one is the knight?", ar: "أين الحصان؟" }, "c0-h": { en: "The knight looks like a horse.", ar: "الحصان يشبه الفرس." },
  "c1-t": { en: "Move the Knight", ar: "حرك الحصان" }, "c1-a": { en: "Can you move the knight?", ar: "هل تستطيع تحريك الحصان؟" }, "c1-h": { en: "Knights jump in an L. They can hop over the pawns!", ar: "الحصان يقفز على شكل حرف ل، ويستطيع القفز فوق البيادق!" },
  "c2-t": { en: "Find the Rook Move", ar: "حركة القلعة" }, "c2-a": { en: "Where can the rook move? Drag it!", ar: "أين تستطيع القلعة أن تتحرك؟ اسحبها!" }, "c2-h": { en: "The rook moves straight, up or sideways.", ar: "القلعة تتحرك بخط مستقيم، للأعلى أو للجانب." },
  "c3-t": { en: "Capture", ar: "اأكل القطعة" }, "c3-a": { en: "Can you capture the black piece?", ar: "هل تستطيع أكل القطعة السوداء؟" }, "c3-h": { en: "The bishop moves diagonally. Slide it to the black knight!", ar: "الفيل يتحرك بشكل مائل. حركه إلى الحصان الأسود!" },
  "c4-t": { en: "Protect the King", ar: "احم الملك" }, "c4-a": { en: "Your king is in danger! Can you keep it safe?", ar: "ملكك في خطر! هل تستطيع حمايته؟" }, "c4-h": { en: "Step the king off the rook's straight line.", ar: "حرك الملك بعيدا عن خط القلعة." },
  replay: { en: "Hear again", ar: "استمع مرة أخرى" }, voiceOn: { en: "Voice on", ar: "الصوت يعمل" }, voiceOff: { en: "Voice off", ar: "الصوت مغلق" },
};
type T = (k: string, vars?: Record<string, string>) => string;
const Ctx = createContext<{ lang: VoiceLang; t: T; say: (k: string, vars?: Record<string, string>) => void }>({ lang: "en", t: (k) => k, say: () => {} });
const useChess = () => useContext(Ctx);

function LangBar({ lang, setLang }: { lang: VoiceLang; setLang: (l: VoiceLang) => void }) {
  const { t } = useChess();
  const [on, setOn] = useState(true);
  useEffect(() => setOn(isVoiceOn()), []);
  return (
    <div dir="ltr" className="fixed left-1/2 -translate-x-1/2 top-[max(0.75rem,env(safe-area-inset-top))] z-40 flex items-center gap-1 rounded-full bg-card p-1 shadow-[0_4px_0_var(--neutral-shadow)]">
      <button onClick={() => setLang("en")} className={cn("h-10 rounded-full px-3 text-sm font-black", lang === "en" && "bg-primary text-primary-foreground")}>EN</button>
      <button onClick={() => setLang("ar")} className={cn("h-10 rounded-full px-3 font-arabic text-sm font-black", lang === "ar" && "bg-primary text-primary-foreground")}>عربي</button>
      <button aria-label={on ? t("voiceOn") : t("voiceOff")} onClick={() => { setVoiceOn(!on); setOn(!on); }} className="grid h-10 w-10 place-items-center rounded-full">{on ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5 opacity-50" />}</button>
    </div>
  );
}

/* ---------- shell ---------- */
function Shell({ title, onBack, side, children, controls }: { title: string; onBack: () => void; side?: ReactNode; children: ReactNode; controls?: ReactNode }) {
  const { t, lang } = useChess();
  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-3 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(3.75rem,env(safe-area-inset-top))] animate-pop-in">
      <div dir={lang === "ar" ? "rtl" : "ltr"} className="flex items-center gap-3">
        <GameButton tone="neutral" className="flex h-12 items-center gap-1 px-4" onClick={onBack}><ArrowLeft className={cn("h-5 w-5", lang === "ar" && "rotate-180")} /> {t("back")}</GameButton>
        <h1 className={cn("text-2xl font-black", lang === "ar" && "font-arabic")}>{title}</h1>
      </div>
      <div dir="ltr" className="flex flex-1 flex-col items-center gap-4 min-[960px]:flex-row min-[960px]:items-start min-[960px]:justify-center">
        <div className="w-full" style={{ maxWidth: "min(94vw, calc(100dvh - 12rem), 760px)" }}>{children}</div>
        <aside dir={lang === "ar" ? "rtl" : "ltr"} className={cn("flex w-full max-w-md flex-col gap-3 min-[960px]:w-72", lang === "ar" && "font-arabic")}>{side}{controls}</aside>
      </div>
    </section>
  );
}

function Bubble({ img, children }: { img: string; children: ReactNode }) {
  const { t } = useChess();
  return (
    <div className="flex items-end gap-2 rounded-2xl bg-card p-3 shadow-[0_5px_0_var(--neutral-shadow)]">
      <img src={img} alt="Hamad" className="h-24 w-auto shrink-0 object-contain min-[960px]:h-36" />
      <div className="flex-1 pb-2 text-lg font-extrabold leading-snug">{children}</div>
      <button aria-label={t("replay")} onClick={() => void replayVoice()} className="mb-2 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-muted"><Volume2 className="h-5 w-5" /></button>
    </div>
  );
}

/* ---------- play ---------- */
function PlayMode({ onBack }: { onBack: () => void }) {
  const { t, say } = useChess();
  const [hist, setHist] = useState<ChessState[]>([initialState()]);
  const state = hist[hist.length - 1]!;
  const st = status(state);
  const w = state.turn === "w";
  const key = st === "checkmate" ? (w ? "blackWins" : "whiteWins") : st === "stalemate" ? "stalemate" : st === "check" ? (w ? "whiteCheck" : "blackCheck") : (w ? "whiteTurn" : "blackTurn");
  useEffect(() => { if (st === "checkmate") tone("win"); }, [st]);
  useEffect(() => { const id = setTimeout(() => say(key), 350); return () => clearTimeout(id); }, [key, hist.length]); // after move animation
  const onMove = (f: number, to: number) => {
    const r = move(state, f, to); if (!r) return false;
    tone(r.captured ? "capture" : "move"); setHist([...hist, r.state]); return true;
  };
  const reset = () => setHist([initialState()]);
  return (
    <Shell title={`♟️ ${t("play")}`} onBack={onBack}
      side={<Bubble img={st === "checkmate" ? hamadCheer : hamadThink}>
        <span className="flex items-center gap-2"><span className={cn("inline-block h-4 w-4 shrink-0 rounded-full border-2 border-foreground/30", w ? "bg-card" : "bg-foreground")} />{t(key)}</span>
      </Bubble>}
      controls={<div className="grid grid-cols-3 gap-2">
        <GameButton tone="sky" className="h-12 text-sm" onClick={reset}>{t("newGame")}</GameButton>
        <GameButton tone="neutral" className="flex h-12 items-center justify-center gap-1 text-sm" onClick={reset}><RotateCcw className="h-4 w-4" />{t("reset")}</GameButton>
        <GameButton tone="neutral" className="flex h-12 items-center justify-center gap-1 text-sm" disabled={hist.length < 2} onClick={() => setHist(hist.slice(0, -1))}><Undo2 className="h-4 w-4" />{t("undo")}</GameButton>
      </div>}>
      <ChessBoard state={state} onMove={st === "checkmate" || st === "stalemate" ? () => false : onMove} />
    </Shell>
  );
}

/* ---------- learn ---------- */
const LESSONS: { t: Kind; at: string }[] = [
  { t: "p", at: "d2" }, { t: "n", at: "d4" }, { t: "b", at: "d4" }, { t: "r", at: "d4" }, { t: "q", at: "d4" }, { t: "k", at: "d4" },
];
const QUIZ: Kind[] = ["b", "n", "r", "k"];

function PiecePicker({ onPick, picked, answer }: { onPick: (k: Kind) => void; picked?: Kind | null; answer?: Kind }) {
  const { t } = useChess();
  return (
    <div dir="ltr" className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {(["p", "n", "b", "r", "q", "k"] as Kind[]).map((k) => (
        <button key={k} onClick={() => onPick(k)}
          className={cn("flex flex-col items-center rounded-2xl bg-card p-2 font-extrabold shadow-[0_4px_0_var(--neutral-shadow)] transition-transform active:translate-y-1",
            picked === k && (k === answer ? "ring-4 ring-success" : "ring-4 ring-primary"), answer && picked && picked !== answer && k === answer && "ring-4 ring-success")}>
          <img src={IMG.w[k]} alt="" className="h-16 w-auto object-contain" />{t(NAME[k])}
        </button>
      ))}
    </div>
  );
}

function LearnMode({ onBack }: { onBack: () => void }) {
  const { t, say, lang } = useChess();
  const [li, setLi] = useState(0);
  const [qi, setQi] = useState<number | null>(null);
  const [picked, setPicked] = useState<Kind | null>(null);
  const [happy, setHappy] = useState(false);
  const L = LESSONS[li]!;
  const [state, setState] = useState<ChessState>(() => fromMap({ [L.at]: `w${L.t}` }));
  const piece = t(NAME[L.t]);
  const lessonLine = `${piece}. ${t(`say-${L.t}`)} ${t("showMe", { piece })}`;
  useEffect(() => { setState(fromMap({ [L.at]: `w${L.t}` })); setHappy(false); }, [li]);
  useEffect(() => { if (qi === null) void speak(li === 0 ? `${t("learnIntro")} ${lessonLine}` : lessonLine, lang); }, [li, qi, lang]);
  useEffect(() => { if (qi !== null) say(`q-${QUIZ[qi]}`); }, [qi, lang]);

  if (qi !== null) {
    const a = QUIZ[qi]!;
    const right = picked === a;
    return (
      <Shell title={`📚 ${t("learn")}`} onBack={() => { setQi(null); setPicked(null); }}
        side={<Bubble img={right ? hamadCheer : hamadThink}>{picked == null ? t(`q-${a}`) : right ? `${t("yes")} ⭐` : `${t("almost")} ${t(`say-${a}`)}`}</Bubble>}
        controls={<GameButton tone="sky" className="h-12" onClick={() => { setQi((qi + 1) % QUIZ.length); setPicked(null); }}>{t("nextQ")}</GameButton>}>
        <div dir={lang === "ar" ? "rtl" : "ltr"} className="rounded-3xl bg-card/70 p-4"><p className={cn("mb-3 text-center text-2xl font-black", lang === "ar" && "font-arabic")}>{t(`q-${a}`)}</p>
          <PiecePicker picked={picked} answer={a} onPick={(k) => {
            setPicked(k); tone(k === a ? "win" : "nudge");
            void speak(k === a ? t("yes") : `${t("almost")} ${t(`say-${a}`)}`, lang);
          }} /></div>
      </Shell>
    );
  }

  return (
    <Shell title={`📚 ${t("learn")}`} onBack={onBack}
      side={<>
        <div dir="ltr" className="grid grid-cols-6 gap-1">
          {LESSONS.map((x, i) => (
            <button key={x.t} onClick={() => setLi(i)} className={cn("rounded-xl bg-card p-1 shadow-[0_3px_0_var(--neutral-shadow)]", i === li && "ring-4 ring-primary")}>
              <img src={IMG.w[x.t]} alt={t(NAME[x.t])} className="mx-auto h-10 w-auto object-contain" />
            </button>
          ))}
        </div>
        <Bubble img={happy ? hamadCheer : hamadKing}>
          <span className="block text-2xl font-black">{piece}</span>
          <span className="block">{t(`say-${L.t}`)}</span>
          <span className="mt-1 block text-base text-muted-foreground">{happy ? `${t("greatMove")} ✨` : t("showMe", { piece })}</span>
        </Bubble>
      </>}
      controls={<div className="grid grid-cols-2 gap-2">
        <GameButton tone="mint" className="h-12" onClick={() => setLi((li + 1) % LESSONS.length)}>{t("nextPiece")}</GameButton>
        <GameButton tone="berry" className="h-12" onClick={() => setQi(0)}>{t("quiz")} ❓</GameButton>
      </div>}>
      <ChessBoard state={state} onMove={(f, to) => {
        const r = move(state, f, to); if (!r) return false;
        tone("move"); setHappy(true); say("greatMove"); setState({ ...r.state, turn: "w" }); return true;
      }} />
    </Shell>
  );
}

/* ---------- challenges ---------- */
type Ch = { pos?: Record<string, string>; pickAnswer?: Kind; win?: (from: number, to: number, captured: boolean) => boolean };
const CHALLENGES: Ch[] = [
  { pickAnswer: "n" },
  { pos: { d4: "wn", c3: "wp", e3: "wp" }, win: (f) => f === nameToSq("d4") },
  { pos: { a1: "wr", c1: "wp" }, win: (f) => f === nameToSq("a1") },
  { pos: { b2: "wb", f6: "bn", h1: "wk", h8: "bk" }, win: (_f, _t, c) => c },
  { pos: { e1: "wk", e8: "br", a8: "bk" }, win: () => true },
];

function ChallengeMode({ onBack }: { onBack: () => void }) {
  const { t, say, lang } = useChess();
  const [done, setDone] = useState<number[]>(() => { try { return JSON.parse(localStorage.getItem(STORE) || "{}").done ?? []; } catch { return []; } });
  const [ci, setCi] = useState<number | null>(null);
  const [state, setState] = useState<ChessState | null>(null);
  const [fb, setFb] = useState<"win" | "try" | null>(null);
  const [tries, setTries] = useState(0);
  const [picked, setPicked] = useState<Kind | null>(null);
  const start = (i: number) => { setCi(i); setFb(null); setPicked(null); setState(CHALLENGES[i]!.pos ? fromMap(CHALLENGES[i]!.pos!) : null); };
  const win = () => {
    setFb("win"); tone("win");
    if (ci !== null && !done.includes(ci)) { const d = [...done, ci]; setDone(d); localStorage.setItem(STORE, JSON.stringify({ done: d })); }
  };
  const nope = () => { setFb("try"); setTries((n) => n + 1); };
  useEffect(() => {
    if (ci === null) { say("pickCh"); return; }
    if (fb === "win") say("won");
    else if (fb === "try") void speak(`${t("niceTry")} ${t(`c${ci}-h`)}`, lang);
    else say(`c${ci}-a`);
  }, [ci, fb, tries, lang]);

  if (ci === null) {
    return (
      <Shell title={`⭐ ${t("challenges")}`} onBack={onBack} side={<Bubble img={hamadThink}>{t("pickCh")}</Bubble>}>
        <div className="grid gap-3 sm:grid-cols-2">
          {CHALLENGES.map((_c, i) => (
            <GameButton key={i} tone={done.includes(i) ? "mint" : "neutral"} className={cn("flex min-h-20 items-center justify-between px-5 text-lg", lang === "ar" ? "font-arabic text-right" : "text-left")} onClick={() => start(i)}>
              <span dir={lang === "ar" ? "rtl" : "ltr"}>{i + 1}. {t(`c${i}-t`)}</span>
              {done.includes(i) ? <span className="flex items-center gap-1"><Star className="h-6 w-6 fill-primary text-primary" /><Check className="h-5 w-5" /></span> : <Star className="h-6 w-6 opacity-30" />}
            </GameButton>
          ))}
        </div>
      </Shell>
    );
  }
  const C = CHALLENGES[ci]!;
  return (
    <Shell title={`⭐ ${t(`c${ci}-t`)}`} onBack={() => setCi(null)}
      side={<Bubble img={fb === "win" ? hamadCheer : hamadThink}>
        {fb === "win" ? <span className="flex items-center gap-1 animate-pop-in"><Sparkles className="h-5 w-5 text-primary" />{t("won")}</span> : fb === "try" ? `${t("niceTry")} ${t(`c${ci}-h`)}` : t(`c${ci}-a`)}
      </Bubble>}
      controls={<div className="grid grid-cols-2 gap-2">
        <GameButton tone="neutral" className="h-12" onClick={() => start(ci)}>{t("tryAgain")}</GameButton>
        <GameButton tone="sky" className="h-12" onClick={() => start((ci + 1) % CHALLENGES.length)}>{t("next")} ⭐</GameButton>
      </div>}>
      {C.pickAnswer ? (
        <div dir={lang === "ar" ? "rtl" : "ltr"} className="rounded-3xl bg-card/70 p-4"><p className={cn("mb-3 text-center text-2xl font-black", lang === "ar" && "font-arabic")}>{t(`c${ci}-a`)}</p>
          <PiecePicker picked={picked} answer={C.pickAnswer} onPick={(k) => { setPicked(k); if (k === C.pickAnswer) win(); else { nope(); tone("nudge"); } }} /></div>
      ) : state && (
        <ChessBoard state={state} onMove={(f, to) => {
          if (fb === "win") return false;
          const r = move(state, f, to);
          if (!r) { nope(); return false; }
          tone(r.captured ? "capture" : "move");
          setState({ ...r.state, turn: "w" });
          if (C.win!(f, to, !!r.captured)) win(); else nope();
          return true;
        }} />
      )}
    </Shell>
  );
}

/* ---------- menu ---------- */
export function ChessWorld({ onExit }: { onExit: () => void }) {
  const [mode, setMode] = useState<"menu" | "play" | "learn" | "ch">("menu");
  const [lang, setLangState] = useState<VoiceLang>("en");
  useEffect(() => { const l = localStorage.getItem(LANG_KEY); if (l === "ar" || l === "en") setLangState(l); return () => stopVoice(); }, []);
  const setLang = (l: VoiceLang) => { setLangState(l); localStorage.setItem(LANG_KEY, l); };
  const t: T = (k, vars) => {
    let s = DICT[k]?.[lang] ?? k;
    for (const [a, b] of Object.entries(vars ?? {})) s = s.replace(`{${a}}`, b);
    return s;
  };
  const say = (k: string, vars?: Record<string, string>) => void speak(t(k, vars), lang);
  useEffect(() => { if (mode === "menu") say("welcome"); }, [mode, lang]);

  let body: ReactNode;
  if (mode === "play") body = <PlayMode onBack={() => setMode("menu")} />;
  else if (mode === "learn") body = <LearnMode onBack={() => setMode("menu")} />;
  else if (mode === "ch") body = <ChallengeMode onBack={() => setMode("menu")} />;
  else body = (
    <section dir={lang === "ar" ? "rtl" : "ltr"} className={cn("mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-4 px-4 pb-6 pt-[max(3.75rem,env(safe-area-inset-top))] animate-pop-in", lang === "ar" && "font-arabic")}>
      <GameButton tone="neutral" className="flex h-12 w-fit items-center gap-1 px-4" onClick={onExit}><ArrowLeft className={cn("h-5 w-5", lang === "ar" && "rotate-180")} /> {t("games")}</GameButton>
      <div className="flex items-end justify-center gap-4">
        <img src={hamadKing} alt="Hamad holding a king" className="h-40 w-auto object-contain animate-hamad-float" />
        <div className="pb-4"><h1 className="text-4xl font-black">♟️ {t("chess")}</h1><p className="text-lg font-bold text-muted-foreground">{t("tagline")}</p></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <GameButton tone="sun" className="min-h-28 text-2xl" onClick={() => setMode("play")}>♟️ {t("play")}</GameButton>
        <GameButton tone="mint" className="min-h-28 text-2xl" onClick={() => setMode("learn")}>📚 {t("learn")}</GameButton>
        <GameButton tone="berry" className="min-h-28 text-2xl" onClick={() => setMode("ch")}>⭐ {t("challenges")}</GameButton>
      </div>
    </section>
  );
  return (
    <Ctx.Provider value={{ lang, t, say }}>
      <LangBar lang={lang} setLang={setLang} />
      {body}
    </Ctx.Provider>
  );
}
