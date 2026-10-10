/**
 * Code-drawn art for the Harakat Slot Machine and Finger Tracing games.
 *
 * Everything here is SVG/CSS so it stays sharp on any screen, weighs almost
 * nothing and animates directly. Letters and harakat are ALWAYS real text
 * (never baked into images) so every word renders correctly.
 *
 *   <SlotMachine reels={["كَ","تَ","بَ"]} spinning={s} />   brass cabinet + 3 reels (RTL: reels[0] is the right-most window)
 *   <Lever pulled={p} onPull={...} />                        animated pull lever
 *   <StarBurst show={won} />                                 stars + coins win burst
 *   <SandTray>…</SandTray>                                   Montessori sand tray (wood frame, grainy sand)
 *   <TraceTrail points={pts} />                              glowing finger trail + sparkles
 *   <StartDot x={..} y={..} angle={..} />                    pulsing "start here" marker with direction arrow
 */
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------------- shared keyframes (injected once) ---------------- */

const CSS = `
@keyframes pa-pulse { 0%{transform:scale(.6);opacity:.9} 100%{transform:scale(1.9);opacity:0} }
@keyframes pa-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
@keyframes pa-twinkle { 0%,100%{opacity:.35;transform:scale(.8)} 50%{opacity:1;transform:scale(1.15)} }
@keyframes pa-fly { 0%{transform:translate(0,0) scale(.3) rotate(0);opacity:0} 15%{opacity:1} 100%{transform:translate(var(--dx),var(--dy)) scale(1) rotate(var(--rot));opacity:0} }
@keyframes pa-spark { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(var(--dx),var(--dy)) scale(0);opacity:0} }
@keyframes pa-glow { 0%,100%{filter:drop-shadow(0 0 2px #ffd36b)} 50%{filter:drop-shadow(0 0 8px #ffd36b)} }
@keyframes pa-land { 0%{transform:translateY(-8%)} 60%{transform:translateY(3%)} 100%{transform:translateY(0)} }
@media (prefers-reduced-motion: reduce) {
  .pa-anim, .pa-anim * { animation: none !important; transition: none !important; }
}`;
let cssInjected = false;
function useArtCss() {
  useEffect(() => {
    if (cssInjected || typeof document === "undefined") return;
    const el = document.createElement("style");
    el.dataset.playArt = "";
    el.textContent = CSS;
    document.head.appendChild(el);
    cssInjected = true;
  }, []);
}
const sid = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, "");

/* ---------------- 8-point star (khatam) used across the set ---------------- */

function khatamPath(cx: number, cy: number, r: number) {
  // two overlapping squares → classic 8-point star outline
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI / 8) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.72;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

/* ================================================================
   SLOT MACHINE — brass cabinet with three reel windows
   ================================================================ */

const W = 360;
const H = 250;
const WINDOWS = [
  { x: 244, y: 82, w: 84, h: 112 }, // right  → reels[0] (first letter, RTL)
  { x: 138, y: 82, w: 84, h: 112 }, // middle → reels[1]
  { x: 32, y: 82, w: 84, h: 112 }, //  left   → reels[2]
];

/** Letters + harakat the reels blur through while spinning (decorative only). */
const BLUR_POOL = ["بَ", "تِ", "سُ", "مَ", "لِ", "رُ", "دَ", "كِ", "نُ", "جَ", "فِ", "قُ", "هَ", "وِ", "عُ", "يَ"];

export function SlotMachine({
  reels,
  spinning,
  highlight,
  onReelTap,
  className,
}: {
  /** One string per reel, letter + haraka, in reading order (reels[0] = first letter, shown on the right). */
  reels: readonly string[];
  spinning: boolean;
  /** Index of the reel to glow (e.g. the syllable Mama is sounding). */
  highlight?: number;
  /** Build mode: tap a reel to stop/advance it. */
  onReelTap?: (i: number) => void;
  className?: string;
}) {
  useArtCss();
  const id = sid(useId());
  return (
    <div className={cn("pa-anim relative w-full select-none", className)} style={{ aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={`${id}brass`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f7d98b" />
            <stop offset=".35" stopColor="#d9a441" />
            <stop offset=".7" stopColor="#b07a22" />
            <stop offset="1" stopColor="#7d5314" />
          </linearGradient>
          <linearGradient id={`${id}rim`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff2c4" />
            <stop offset=".5" stopColor="#c8902e" />
            <stop offset="1" stopColor="#6b4410" />
          </linearGradient>
          <linearGradient id={`${id}panel`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1f6f6a" />
            <stop offset="1" stopColor="#0f4643" />
          </linearGradient>
          <linearGradient id={`${id}glass`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity=".35" />
            <stop offset=".18" stopColor="#000" stopOpacity="0" />
            <stop offset=".82" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity=".35" />
          </linearGradient>
          <pattern id={`${id}geo`} width="28" height="28" patternUnits="userSpaceOnUse">
            <path d={khatamPath(14, 14, 11)} fill="none" stroke="#e9c46a" strokeOpacity=".35" strokeWidth="1.2" />
            <circle cx="14" cy="14" r="2.2" fill="#e9c46a" fillOpacity=".35" />
          </pattern>
          <filter id={`${id}shadow`} x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#3b2607" floodOpacity=".35" />
          </filter>
        </defs>

        {/* cabinet body with arched crest */}
        <g filter={`url(#${id}shadow)`}>
          <path
            d={`M14 60 Q14 46 28 46 L130 46 Q150 6 180 6 Q210 6 230 46 L332 46 Q346 46 346 60 L346 226 Q346 240 332 240 L28 240 Q14 240 14 226 Z`}
            fill={`url(#${id}brass)`}
            stroke={`url(#${id}rim)`}
            strokeWidth="3"
          />
        </g>
        {/* crest medallion */}
        <circle cx="180" cy="34" r="20" fill={`url(#${id}panel)`} stroke="#fff2c4" strokeWidth="2" />
        <path d={khatamPath(180, 34, 14)} fill="#f7d98b" stroke="#7d5314" strokeWidth="1" />
        <circle cx="180" cy="34" r="4" fill={`url(#${id}panel)`} />

        {/* teal inlay panel with geometric pattern */}
        <rect x="24" y="62" width="312" height="154" rx="12" fill={`url(#${id}panel)`} />
        <rect x="24" y="62" width="312" height="154" rx="12" fill={`url(#${id}geo)`} />
        <rect x="24" y="62" width="312" height="154" rx="12" fill="none" stroke="#fff2c4" strokeOpacity=".7" strokeWidth="1.5" />

        {/* reel windows: brass bezel + cream reel face */}
        {WINDOWS.map((w, i) => (
          <g key={i}>
            <rect x={w.x - 6} y={w.y - 6} width={w.w + 12} height={w.h + 12} rx="14" fill={`url(#${id}rim)`} />
            <rect x={w.x} y={w.y} width={w.w} height={w.h} rx="9" fill="#fffaf0" />
          </g>
        ))}

        {/* rivets */}
        {[30, 330].flatMap((x) => [58, 226].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#fff2c4" stroke="#7d5314" strokeWidth=".8" />))}

        {/* payline arrows */}
        <path d="M18 138 l8 -6 v12 Z" fill="#c0392b" />
        <path d="M342 138 l-8 -6 v12 Z" fill="#c0392b" />
      </svg>

      {/* reels (HTML so Arabic shaping + harakat are perfect) */}
      {WINDOWS.map((w, i) => (
        <Reel
          key={i}
          value={reels[i] ?? ""}
          spinning={spinning}
          stopDelay={i * 380}
          glow={highlight === i}
          onTap={onReelTap ? () => onReelTap(i) : undefined}
          style={{ left: `${(w.x / W) * 100}%`, top: `${(w.y / H) * 100}%`, width: `${(w.w / W) * 100}%`, height: `${(w.h / H) * 100}%` }}
        />
      ))}

      {/* glass shading over the reels */}
      <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={`${id}shine`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".55" />
            <stop offset=".4" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {WINDOWS.map((w, i) => (
          <g key={i}>
            <rect x={w.x} y={w.y} width={w.w} height={w.h} rx="9" fill={`url(#${id}glass)`} />
            <path d={`M${w.x + 6} ${w.y + 6} h${w.w * 0.45} l-${w.w * 0.3} ${w.h * 0.35} h-${w.w * 0.15} Z`} fill={`url(#${id}shine)`} />
          </g>
        ))}
      </svg>
    </div>
  );
}

function Reel({
  value,
  spinning,
  stopDelay,
  glow,
  onTap,
  style,
}: {
  value: string;
  spinning: boolean;
  stopDelay: number;
  glow: boolean;
  onTap?: () => void;
  style: React.CSSProperties;
}) {
  // Each reel keeps spinning a little longer than the one before it (right → left), then lands.
  const [rolling, setRolling] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (spinning) {
      setRolling(true);
      return;
    }
    if (!rolling) return;
    const t = setTimeout(() => setRolling(false), stopDelay);
    return () => clearTimeout(t);
  }, [spinning, stopDelay, rolling]);
  useEffect(() => {
    if (!rolling) return;
    const iv = setInterval(() => setTick((n) => n + 1), 70);
    return () => clearInterval(iv);
  }, [rolling]);

  const shown = rolling ? BLUR_POOL[(tick + stopDelay) % BLUR_POOL.length] : value;
  const Tag = onTap ? "button" : "div";
  return (
    <Tag
      type={onTap ? "button" : undefined}
      onClick={onTap}
      aria-label={rolling ? undefined : value}
      className={cn(
        "absolute flex items-center justify-center overflow-hidden rounded-[10%] transition-shadow",
        glow && "shadow-[inset_0_0_0_3px_#e9c46a,0_0_18px_#ffd36b]",
        onTap && "cursor-pointer active:scale-[.97]",
      )}
      style={style}
    >
      <span
        key={rolling ? `r${tick}` : `v${value}`}
        lang="ar"
        dir="rtl"
        className={cn(
          "font-arabic font-black leading-none text-[#3b2607]",
          rolling ? "opacity-70 blur-[1.5px]" : "animate-[pa-land_.35s_ease-out]",
        )}
        style={{ fontSize: "clamp(1.75rem, 9vw, 3.5rem)" }}
      >
        {shown}
      </span>
    </Tag>
  );
}

/* ================================================================
   LEVER — brass rod with a red ball; slides down when pulled
   ================================================================ */

export function Lever({
  pulled,
  onPull,
  disabled,
  className,
}: {
  pulled: boolean;
  onPull?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  useArtCss();
  const id = sid(useId());
  const ease = "transform .32s cubic-bezier(.3,1.6,.5,1)";
  return (
    <button
      type="button"
      onClick={onPull}
      disabled={disabled}
      aria-label="Pull the lever · اسحب الذراع"
      className={cn("pa-anim relative block touch-manipulation disabled:opacity-60", className)}
      style={{ aspectRatio: "70 / 250" }}
    >
      <svg viewBox="0 0 70 250" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`${id}rod`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7d5314" />
            <stop offset=".45" stopColor="#f7d98b" />
            <stop offset="1" stopColor="#8a5c18" />
          </linearGradient>
          <radialGradient id={`${id}ball`} cx=".35" cy=".3" r=".75">
            <stop offset="0" stopColor="#ff9a8a" />
            <stop offset=".45" stopColor="#d83a2c" />
            <stop offset="1" stopColor="#7a140c" />
          </radialGradient>
          <linearGradient id={`${id}base`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f7d98b" />
            <stop offset="1" stopColor="#7d5314" />
          </linearGradient>
        </defs>
        {/* slot plate */}
        <rect x="22" y="120" width="26" height="110" rx="13" fill="#3b2607" opacity=".85" />
        {/* rod: anchored at the base, shortens as the knob comes down */}
        <g style={{ transformBox: "fill-box", transformOrigin: "50% 100%", transform: pulled ? "scaleY(.28)" : "scaleY(1)", transition: ease }}>
          <rect x="31" y="40" width="8" height="180" rx="4" fill={`url(#${id}rod)`} />
        </g>
        {/* knob */}
        <g style={{ transform: pulled ? "translateY(130px)" : "translateY(0)", transition: ease }}>
          <circle cx="35" cy="34" r="22" fill={`url(#${id}ball)`} stroke="#5a0e08" strokeWidth="1.5" />
          <ellipse cx="28" cy="25" rx="7" ry="4.5" fill="#fff" opacity=".55" />
        </g>
        {/* pivot housing */}
        <rect x="12" y="214" width="46" height="30" rx="10" fill={`url(#${id}base)`} stroke="#6b4410" strokeWidth="1.5" />
        <circle cx="35" cy="229" r="5" fill="#fff2c4" stroke="#6b4410" />
      </svg>
    </button>
  );
}

/* ================================================================
   STAR BURST — gold stars + coins fly out from the centre on a win
   ================================================================ */

export function StarBurst({ show, count = 14, className }: { show: boolean; count?: number; className?: string }) {
  useArtCss();
  const [runId, setRunId] = useState(0);
  const prev = useRef(show);
  useEffect(() => {
    if (show && !prev.current) setRunId((n) => n + 1);
    prev.current = show;
  }, [show]);
  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const d = 90 + Math.random() * 70;
        return {
          coin: i % 3 === 2,
          dx: `${Math.cos(a) * d}px`,
          dy: `${Math.sin(a) * d - 20}px`,
          rot: `${(Math.random() * 2 - 1) * 260}deg`,
          delay: Math.random() * 0.15,
          size: 22 + Math.random() * 16,
        };
      }),
    // new random spread each burst
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [runId, count],
  );
  if (!show) return null;
  return (
    <div key={runId} className={cn("pa-anim pointer-events-none absolute inset-0 grid place-items-center overflow-visible", className)} aria-hidden>
      {bits.map((b, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            ["--dx" as string]: b.dx,
            ["--dy" as string]: b.dy,
            ["--rot" as string]: b.rot,
            width: b.size,
            height: b.size,
            animation: `pa-fly 1.1s ${b.delay}s cubic-bezier(.2,.7,.3,1) both`,
          }}
        >
          {b.coin ? <Coin /> : <GoldStar />}
        </span>
      ))}
    </div>
  );
}

export function GoldStar({ className }: { className?: string }) {
  const id = sid(useId());
  return (
    <svg viewBox="0 0 40 40" className={cn("h-full w-full", className)} aria-hidden>
      <defs>
        <radialGradient id={`${id}g`} cx=".4" cy=".35" r=".7">
          <stop offset="0" stopColor="#fff6c9" />
          <stop offset=".5" stopColor="#ffcf3f" />
          <stop offset="1" stopColor="#e08a00" />
        </radialGradient>
      </defs>
      <path d="M20 2 L25 14 L38 15 L28 24 L31 37 L20 30 L9 37 L12 24 L2 15 L15 14 Z" fill={`url(#${id}g)`} stroke="#b36b00" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export function Coin({ className }: { className?: string }) {
  const id = sid(useId());
  return (
    <svg viewBox="0 0 40 40" className={cn("h-full w-full", className)} aria-hidden>
      <defs>
        <radialGradient id={`${id}c`} cx=".4" cy=".35" r=".75">
          <stop offset="0" stopColor="#fff2c4" />
          <stop offset=".55" stopColor="#e2a83a" />
          <stop offset="1" stopColor="#8a5c18" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill={`url(#${id}c)`} stroke="#6b4410" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="13" fill="none" stroke="#fff2c4" strokeOpacity=".7" />
      <path d={khatamPath(20, 20, 8)} fill="#fff2c4" fillOpacity=".8" />
    </svg>
  );
}

/* ================================================================
   SAND TRAY — Montessori tracing surface (wood frame + fine sand)
   ================================================================ */

export function SandTray({ children, className }: { children?: ReactNode; className?: string }) {
  const id = sid(useId());
  return (
    <div className={cn("relative aspect-square w-full overflow-hidden rounded-[6%] shadow-xl", className)}>
      <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={`${id}wood`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c08552" />
            <stop offset=".5" stopColor="#9a6233" />
            <stop offset="1" stopColor="#6e4120" />
          </linearGradient>
          <pattern id={`${id}grain`} width="400" height="18" patternUnits="userSpaceOnUse">
            <path d="M0 9 Q100 4 200 9 T400 9" fill="none" stroke="#5a3418" strokeOpacity=".25" strokeWidth="1.2" />
            <path d="M0 15 Q120 12 240 15 T400 14" fill="none" stroke="#e0b083" strokeOpacity=".2" />
          </pattern>
          <radialGradient id={`${id}sand`} cx=".45" cy=".4" r=".8">
            <stop offset="0" stopColor="#f6e2b8" />
            <stop offset=".7" stopColor="#e9cc94" />
            <stop offset="1" stopColor="#d7b273" />
          </radialGradient>
          <filter id={`${id}grit`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="7" result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 .45  0 0 0 0 .33  0 0 0 0 .16  0 0 0 .9 -.35" />
          </filter>
          <filter id={`${id}inner`} x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        {/* wooden frame */}
        <rect width="400" height="400" fill={`url(#${id}wood)`} />
        <rect width="400" height="400" fill={`url(#${id}grain)`} />
        {/* sand bed */}
        <rect x="26" y="26" width="348" height="348" rx="14" fill={`url(#${id}sand)`} />
        <rect x="26" y="26" width="348" height="348" rx="14" filter={`url(#${id}grit)`} opacity=".9" />
        {/* soft raked ripples */}
        {[90, 150, 250, 310].map((y, i) => (
          <path key={y} d={`M40 ${y} Q120 ${y - 8 + i * 3} 200 ${y} T360 ${y}`} fill="none" stroke="#c9a364" strokeOpacity=".22" strokeWidth="3" strokeLinecap="round" />
        ))}
        {/* inner shadow where sand meets frame */}
        <rect x="26" y="26" width="348" height="348" rx="14" fill="none" stroke="#5a3418" strokeOpacity=".45" strokeWidth="10" filter={`url(#${id}inner)`} />
        <rect x="24" y="24" width="352" height="352" rx="15" fill="none" stroke="#4a2a12" strokeOpacity=".6" strokeWidth="2" />
      </svg>
      <div className="absolute inset-[6.5%]">{children}</div>
    </div>
  );
}

/* ================================================================
   TRACE TRAIL — glowing path behind the finger, sparkles at the tip
   ================================================================ */

export type Pt = { x: number; y: number };

/** Points are in a 0–100 coordinate space (percent of the tracing area). */
export function TraceTrail({ points, done = false, className }: { points: readonly Pt[]; done?: boolean; className?: string }) {
  useArtCss();
  const id = sid(useId());
  if (points.length === 0) return null;
  const d = points.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
  const tip = points[points.length - 1];
  return (
    <svg viewBox="0 0 100 100" className={cn("pa-anim pointer-events-none absolute inset-0 h-full w-full overflow-visible", className)} aria-hidden>
      <defs>
        <filter id={`${id}blur`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>
      {/* groove pressed into the sand */}
      <path d={d} fill="none" stroke="#a8803f" strokeOpacity=".55" strokeWidth="5.2" strokeLinecap="round" strokeLinejoin="round" />
      {/* glow */}
      <path d={d} fill="none" stroke={done ? "#7ee081" : "#ffd36b"} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${id}blur)`} opacity=".9" />
      {/* bright core */}
      <path d={d} fill="none" stroke="#fffbe8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      {!done && <Sparkles x={tip.x} y={tip.y} seed={points.length} />}
    </svg>
  );
}

function Sparkles({ x, y, seed }: { x: number; y: number; seed: number }) {
  // a fresh little puff every few points as the finger moves
  const bits = useMemo(() => {
    let s = seed * 9301 + 49297;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    return Array.from({ length: 5 }, () => ({ dx: (rnd() * 2 - 1) * 6, dy: (rnd() * 2 - 1) * 6, r: 0.5 + rnd() * 0.9, delay: rnd() * 0.2 }));
  }, [Math.floor(seed / 3)]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <g key={Math.floor(seed / 3)} transform={`translate(${x} ${y})`}>
      <circle r="2.2" fill="#fffbe8" style={{ animation: "pa-glow 0.8s ease-in-out infinite" }} />
      {bits.map((b, i) => (
        <g key={i} style={{ ["--dx" as string]: `${b.dx}px`, ["--dy" as string]: `${b.dy}px`, animation: `pa-spark .6s ${b.delay}s ease-out both` }}>
          <path d={`M0 ${-b.r * 2} L${b.r * 0.5} 0 L0 ${b.r * 2} L${-b.r * 0.5} 0 Z M${-b.r * 2} 0 L0 ${b.r * 0.5} L${b.r * 2} 0 L0 ${-b.r * 0.5} Z`} fill="#ffe08a" />
        </g>
      ))}
    </g>
  );
}

/* ================================================================
   START DOT — pulsing glow + star, with an arrow showing direction
   ================================================================ */

/** x, y in the same 0–100 space as TraceTrail; angle in degrees (0 = right, 90 = down). */
export function StartDot({ x, y, angle, label, className }: { x: number; y: number; angle?: number; label?: number; className?: string }) {
  useArtCss();
  return (
    <svg viewBox="0 0 100 100" className={cn("pa-anim pointer-events-none absolute inset-0 h-full w-full overflow-visible", className)} aria-hidden>
      <g transform={`translate(${x} ${y})`}>
        <circle r="4.5" fill="#4cc9f0" opacity=".5" style={{ transformBox: "fill-box", transformOrigin: "center", animation: "pa-pulse 1.4s ease-out infinite" }} />
        <circle r="4.5" fill="#4cc9f0" opacity=".5" style={{ transformBox: "fill-box", transformOrigin: "center", animation: "pa-pulse 1.4s .7s ease-out infinite" }} />
        <circle r="3.6" fill="#ffffff" stroke="#1d8fb8" strokeWidth=".9" />
        {label != null ? (
          <text textAnchor="middle" dominantBaseline="central" fontSize="4" fontWeight="900" fill="#1d6f8f" fontFamily="Nunito, system-ui">
            {label}
          </text>
        ) : (
          <path d={khatamPath(0, 0, 2.4)} fill="#f4b400" />
        )}
        {angle != null && (
          <g transform={`rotate(${angle})`}>
            <g style={{ animation: "pa-bob 1s ease-in-out infinite" }}>
              <path d="M7 0 L12 0 M12 0 L9.5 -2.2 M12 0 L9.5 2.2" stroke="#1d8fb8" strokeWidth="1.3" strokeLinecap="round" fill="none" />
            </g>
          </g>
        )}
      </g>
    </svg>
  );
}
