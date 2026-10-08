// Shared Montessori material set + one manipulation system (drag, tap-to-place, snapping)
// reused by every Bead Garden level. Levels never build their own drag logic.
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { speakArabic } from "@/lib/arabicVoice";
import { speakEnglish } from "@/lib/voice";
import type { LearningLanguage } from "@/lib/learningLanguage";
import { cn } from "@/lib/utils";
import pickBlank from "@/assets/montessori/pick-blank.png";
import symPlus from "@/assets/montessori/sym-plus.png";
import symMinus from "@/assets/montessori/sym-minus.png";
import symTimes from "@/assets/montessori/sym-times.png";
import symDivide from "@/assets/montessori/sym-divide.png";
import symEquals from "@/assets/montessori/sym-equals.png";
import symSq from "@/assets/montessori/sym-sq2.png";
import symCube from "@/assets/montessori/sym-sq3.png";
import symParenL from "@/assets/montessori/sym-paren_l.png";
import symParenR from "@/assets/montessori/sym-paren_r.png";
import apple from "@/assets/montessori/g-apple.png";
import flower from "@/assets/montessori/g-flower.png";
import rose from "@/assets/montessori/g-rose.png";
import sunflower from "@/assets/montessori/g-sunflower.png";
import butterfly from "@/assets/montessori/g-butterfly.png";

export const t = (lang: LearningLanguage, ar: string, en: string) => (lang === "ar" ? ar : en);
export const appleSrc = apple;
export const flowerSrc = sunflower;

// ---------- sound + voice (quiet, never arcade) ----------
let ctx: AudioContext | null = null;
function tone(freq: number, dur: number, vol: number) {
  try {
    ctx ??= new AudioContext();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "sine"; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur);
  } catch { /* audio unavailable */ }
}
export const snapSound = () => tone(520, 0.09, 0.05);
export const successSound = () => { tone(660, 0.25, 0.04); setTimeout(() => tone(880, 0.35, 0.03), 140); };
const arDigits = (n: number) => n.toLocaleString("ar-EG");
const WORDS: Record<string, [string, string]> = { "×": ["ضرب", "times"], "÷": ["تقسيم", "divided by"], "=": ["يساوي", "equals"], "+": ["زائد", "plus"], "−": ["ناقص", "minus"], "²": ["تربيع", "squared"], "³": ["تكعيب", "cubed"] };
export function sayNum(n: number, lang: LearningLanguage) { void (lang === "ar" ? speakArabic(arDigits(n)) : speakEnglish(String(n))); }
export function sayTokens(tokens: Token[], lang: LearningLanguage) {
  const text = tokens.map((x) => (typeof x === "number" ? (lang === "ar" ? arDigits(x) : String(x)) : WORDS[x]?.[lang === "ar" ? 0 : 1] ?? "")).join(" ");
  void (lang === "ar" ? speakArabic(text) : speakEnglish(text));
}
export function sayText(lang: LearningLanguage, ar: string, en: string) { void (lang === "ar" ? speakArabic(ar) : speakEnglish(en)); }

// ---------- materials ----------
export type Op = "×" | "÷" | "=" | "+" | "−" | "²" | "³" | "(" | ")";
export type Token = number | Op;
const OP_IMG: Record<Op, string> = { "×": symTimes, "÷": symDivide, "=": symEquals, "+": symPlus, "−": symMinus, "²": symSq, "³": symCube, "(": symParenL, ")": symParenR };

export function WoodNum({ n, size = 56, faint }: { n: number; size?: number; faint?: boolean }) {
  const digits = String(n).length;
  return (
    <span className={cn("relative inline-block shrink-0 select-none", faint && "opacity-35 grayscale")} style={{ width: size, height: size * 1.29 }}>
      <img src={pickBlank} alt="" draggable={false} className="h-full w-full drop-shadow-md" />
      <span className="absolute inset-x-[12%] top-[6%] grid h-[44%] place-items-center font-black leading-none text-amber-950/85" style={{ fontSize: size * (digits >= 4 ? 0.21 : digits >= 3 ? 0.27 : digits === 2 ? 0.36 : 0.44), textShadow: "0 1px 0 rgba(255,235,200,.6)" }}>
        {n}
      </span>
      <span className="sr-only">{n}</span>
    </span>
  );
}

export function WoodOp({ op, size = 52 }: { op: Op; size?: number }) {
  const small = op === "²" || op === "³";
  const s = small ? size * 0.55 : op === "(" || op === ")" ? size * 0.9 : size;
  return <img src={OP_IMG[op]} alt={op} draggable={false} className="shrink-0 select-none object-contain drop-shadow-md" style={{ width: op === "(" || op === ")" ? s * 0.4 : s, height: s }} />;
}

export function WoodToken({ token, size = 52 }: { token: Token; size?: number }) {
  return typeof token === "number" ? <WoodNum n={token} size={size} /> : <WoodOp op={token} size={size} />;
}

const beadImgs = import.meta.glob("@/assets/beads/bead-*.png", { eager: true, import: "default" }) as Record<string, string>;
const beadFile = (i: number) => Object.entries(beadImgs).find(([k]) => k.endsWith(`/bead-${i}.png`))?.[1] ?? "";
// Montessori chain colours: 2=red, 3=pink, 4=blue, 5=light-blue, 6=purple, 7=white, 8=brown, 9=dark-blue, 10=gold.
// Each chain uses its own numbered bead file for proper Montessori color sequence
const CHAIN_FILE: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10 };
export const chainBeadSrc = (n: number) => beadFile(CHAIN_FILE[n] ?? 1);

/** A bead chain: bead size is constant so a 10-chain is 5× longer (more beads) than a 2-chain, maintaining Montessori visual hierarchy. */
export function Chain({ n, reps = 1, bead = 18, dim }: { n: number; reps?: number; bead?: number; dim?: number }) {
  // IMPORTANT: Do NOT vary bead size based on chain number. Constant bead size is pedagogically critical.
  // Visual difference comes from number of beads, not bead size. A 10-chain is 5× LONGER because it has 5× the beads.
  return (
    <span dir="ltr" className="relative inline-flex shrink-0 items-center" style={{ height: bead }}>
      <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded bg-amber-800/60" aria-hidden />
      {Array.from({ length: n * reps }, (_, i) => (
        <img key={i} src={chainBeadSrc(n)} alt="" draggable={false} className={cn("relative shrink-0 select-none", dim !== undefined && i >= dim && "opacity-25")} style={{ width: bead, height: bead, marginLeft: i > 0 && i % n === 0 ? bead * 0.35 : 0 }} />
      ))}
    </span>
  );
}

export function Apple({ size = 26 }: { size?: number }) {
  return <img src={apple} alt="" draggable={false} className="shrink-0 select-none drop-shadow" style={{ width: size, height: size }} />;
}

// ---------- the one manipulation system ----------
export type Piece = { id: string; kind: string; value: number | string; from?: string };
type DropFn = (piece: Piece, zone: string) => boolean;
type Drag = { piece: Piece; node: ReactNode; x: number; y: number };

export function useWorkMat(onDrop: DropFn) {
  const zones = useRef(new Map<string, HTMLElement>());
  const [drag, setDrag] = useState<Drag | null>(null);
  const [held, setHeld] = useState<Piece | null>(null);
  const [nudge, setNudge] = useState<string | null>(null);
  const dropRef = useRef(onDrop); dropRef.current = onDrop;

  const zone = useCallback((id: string) => (el: HTMLElement | null) => { if (el) zones.current.set(id, el); else zones.current.delete(id); }, []);
  const hit = useCallback((x: number, y: number) => {
    let best: string | null = null; let bestD = Infinity;
    zones.current.forEach((el, id) => {
      const r = el.getBoundingClientRect(); const pad = 18;
      if (x < r.left - pad || x > r.right + pad || y < r.top - pad || y > r.bottom + pad) return;
      const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)) + (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom ? -1000 : 0);
      if (d < bestD) { bestD = d; best = id; }
    });
    return best;
  }, []);
  const drop = useCallback((piece: Piece, z: string | null) => {
    if (z && dropRef.current(piece, z)) { snapSound(); return true; }
    setNudge(piece.id); setTimeout(() => setNudge(null), 380); return false;
  }, []);
  return { zone, hit, drop, drag, setDrag, held, setHeld, nudge };
}
export type WorkMat = ReturnType<typeof useWorkMat>;

/** A physical manipulative: drag it, or tap it then tap where it goes. */
export function Draggable({ mat, piece, children, className }: { mat: WorkMat; piece: Piece; children: ReactNode; className?: string }) {
  const start = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const dragging = mat.drag?.piece.id === piece.id;
  const held = mat.held?.id === piece.id;
  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={String(piece.value)}
      className={cn("inline-grid touch-none cursor-grab place-items-center rounded-xl transition-transform duration-150", dragging && "opacity-30", held && "-translate-y-1.5 ring-4 ring-primary/60", mat.nudge === piece.id && "animate-[wiggle_0.35s_ease]", className)}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => { e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId); start.current = { x: e.clientX, y: e.clientY, moved: false }; }}
      onPointerMove={(e) => {
        const s = start.current; if (!s) return;
        if (!s.moved && Math.hypot(e.clientX - s.x, e.clientY - s.y) > 7) { s.moved = true; mat.setHeld(null); }
        if (s.moved) mat.setDrag({ piece, node: children, x: e.clientX, y: e.clientY });
      }}
      onPointerUp={(e) => {
        const s = start.current; start.current = null;
        if (s?.moved) { mat.setDrag(null); mat.drop(piece, mat.hit(e.clientX, e.clientY)); }
        else mat.setHeld(held ? null : piece);
      }}
      onPointerCancel={() => { start.current = null; mat.setDrag(null); }}
    >
      {children}
    </span>
  );
}

/** A valid work area. Tapping it places the held piece (or runs onTap). */
export function Zone({ mat, id, children, className, onTap }: { mat: WorkMat; id: string; children?: ReactNode; className?: string; onTap?: (() => void) | undefined }) {
  const over = mat.drag && mat.hit(mat.drag.x, mat.drag.y) === id;
  return (
    <div
      ref={mat.zone(id)}
      className={cn("transition-colors", over && "bg-primary/15 ring-2 ring-primary/50", className)}
      onClick={() => { if (mat.held) { mat.drop(mat.held, id); mat.setHeld(null); } else onTap?.(); }}
    >
      {children}
    </div>
  );
}

/** Floating piece under the finger, kept fully on screen. */
export function DragLayer({ mat }: { mat: WorkMat }) {
  if (!mat.drag) return null;
  const x = Math.min(Math.max(mat.drag.x, 30), window.innerWidth - 30);
  const y = Math.min(Math.max(mat.drag.y, 30), window.innerHeight - 30);
  return <div className="pointer-events-none fixed z-[60] -translate-x-1/2 -translate-y-1/2 scale-110 drop-shadow-2xl" style={{ left: x, top: y }}>{mat.drag.node}</div>;
}

// ---------- equation construction (shared by all levels) ----------
let uid = 0;
/** Child physically lays wooden pieces into slots; only the true relationship snaps in. */
export function EquationWork({ tokens, extras = [], lang, onDone, size = 50 }: { tokens: Token[]; extras?: Token[]; lang: LearningLanguage; onDone?: () => void; size?: number }) {
  const pieces = useMemo(() => {
    const all = [...tokens, ...extras].map((v) => ({ id: `eq${uid++}`, kind: typeof v === "number" ? "num" : "op", value: v }));
    for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [all[i], all[j]] = [all[j]!, all[i]!]; }
    return all;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens.join(" ")]);
  const [slots, setSlots] = useState<(string | null)[]>(() => tokens.map(() => null));
  const done = slots.every(Boolean);
  const reported = useRef(false);
  useEffect(() => {
    if (done && !reported.current) { reported.current = true; successSound(); sayTokens(tokens, lang); onDone?.(); }
  }, [done, tokens, lang, onDone]);
  const mat = useWorkMat((p, z) => {
    if (z === "eq-tray") { setSlots((s) => s.map((x) => (x === p.id ? null : x))); return true; }
    const i = Number(z.replace("eq-", ""));
    if (slots[i] || tokens[i] !== p.value) return false;
    setSlots((s) => s.map((x, k) => (k === i ? p.id : x === p.id ? null : x)));
    if (typeof p.value === "number") sayNum(p.value, lang);
    return true;
  });
  const byId = (id: string) => pieces.find((p) => p.id === id)!;
  return (
    <div className="grid gap-3">
      <div dir="ltr" className="flex flex-wrap items-center justify-center gap-1.5 rounded-3xl border-4 border-amber-900/20 bg-amber-50/80 p-3 shadow-inner">
        {tokens.map((tok, i) => {
          const sup = tok === "²" || tok === "³";
          const id = slots[i];
          return (
            <Zone key={i} mat={mat} id={`eq-${i}`} className={cn("grid place-items-center rounded-xl", sup ? "-ms-2 self-start" : "", !id && "border-2 border-dashed border-amber-900/30 bg-background/50")}>
              <span className="grid place-items-center" style={{ minWidth: sup ? size * 0.55 : size, minHeight: sup ? size * 0.55 : size * 1.1 }}>
                {id ? <Draggable mat={mat} piece={byId(id)}><WoodToken token={tok} size={size} /></Draggable> : null}
              </span>
            </Zone>
          );
        })}
      </div>
      {!done && (
        <Zone mat={mat} id="eq-tray" className="flex min-h-20 flex-wrap items-end justify-center gap-2 rounded-2xl bg-card/70 p-2">
          {pieces.filter((p) => !slots.includes(p.id)).map((p) => (
            <Draggable key={p.id} mat={mat} piece={p}><WoodToken token={p.value as Token} size={size} /></Draggable>
          ))}
        </Zone>
      )}
      <DragLayer mat={mat} />
    </div>
  );
}

/** Built equation, shown as the same wooden pieces (never plain text). */
export function WoodEquation({ tokens, size = 34 }: { tokens: Token[]; size?: number }) {
  return (
    <span dir="ltr" className="inline-flex items-center gap-1">
      {tokens.map((tok, i) => <span key={i} className={tok === "²" || tok === "³" ? "-ms-1.5 self-start" : ""}><WoodToken token={tok} size={size} /></span>)}
    </span>
  );
}

// ---------- garden progression ----------
const KEY = "bead-garden-v1";
export function useGardenGrowth(): [number, () => void] {
  const [g, setG] = useState(0);
  useEffect(() => { setG(Number(localStorage.getItem(KEY) ?? 0) || 0); }, []);
  const grow = useCallback(() => setG((x) => { const n = x + 1; localStorage.setItem(KEY, String(n)); return n; }), []);
  return [g, grow];
}
const PLANTS = [flower, rose, sunflower, flower, rose, sunflower, flower, rose, sunflower, flower];
export function GardenBed({ growth }: { growth: number }) {
  return (
    <div dir="ltr" className="relative flex h-20 items-end justify-around overflow-hidden rounded-2xl bg-gradient-to-t from-amber-900/50 to-transparent px-2" aria-label={`garden ${growth}`}>
      {PLANTS.map((src, i) => {
        const stage = Math.max(0, Math.min(3, growth - i * 3 + 1)); // each plant matures over three works
        return <img key={i} src={src} alt="" draggable={false} className="origin-bottom transition-all duration-1000" style={{ height: [14, 30, 48, 66][stage], opacity: stage === 0 ? 0.35 : 1, filter: stage === 0 ? "grayscale(1)" : undefined }} />;
      })}
      {growth >= 12 && <img src={butterfly} alt="" className="absolute right-6 top-1 h-9 animate-[float_4s_ease-in-out_infinite]" />}
    </div>
  );
}
