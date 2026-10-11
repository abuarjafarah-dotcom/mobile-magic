// Golden bead materials, drawn in code from the single supplied golden-bead image.
// Every bar, square and cube is an SVG filled with a bead pattern, so a ten-bar always shows exactly 10 beads,
// a hundred-square exactly 10 × 10, and every visible cube face exactly 10 × 10 — at one DOM node per piece.
import { useId, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { Place } from "@/lib/goldenBeads";
import beadSrc from "@/assets/golden-workshop/unit-bead.webp";

export { beadSrc };

function BeadPattern({ id, s }: { id: string; s: number }) {
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width={s} height={s}>
      <circle cx={s / 2} cy={s / 2} r={s * 0.47} fill="#c99a2e" />
      <image
        href={beadSrc}
        x={s * 0.02}
        y={0}
        width={s * 0.96}
        height={s}
        preserveAspectRatio="xMidYMid meet"
      />
    </pattern>
  );
}

export function UnitBead({
  s = 14,
  className,
  style,
}: {
  s?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <img
      src={beadSrc}
      alt=""
      draggable={false}
      className={cn("shrink-0 select-none drop-shadow-sm", className)}
      style={{ width: s, height: s * 1.1, objectFit: "contain", ...style }}
    />
  );
}

/** Ten beads on a wire. Vertical by default (Montessori layout); horizontal for arrays and bars. */
export function TenBar({
  s = 6,
  horizontal,
  className,
}: {
  s?: number;
  horizontal?: boolean;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const w = horizontal ? s * 10 : s;
  const h = horizontal ? s : s * 10;
  return (
    <svg
      width={w + 2}
      height={h + 2}
      viewBox={`-1 -1 ${w + 2} ${h + 2}`}
      className={cn("shrink-0 drop-shadow-sm", className)}
      aria-hidden
    >
      <defs>
        <BeadPattern id={id} s={s} />
      </defs>
      {horizontal ? (
        <line x1={-1} y1={s / 2} x2={w + 1} y2={s / 2} stroke="#8a6418" strokeWidth={1} />
      ) : (
        <line x1={s / 2} y1={-1} x2={s / 2} y2={h + 1} stroke="#8a6418" strokeWidth={1} />
      )}
      <rect width={w} height={h} fill={`url(#${id})`} />
    </svg>
  );
}

export function HundredSquare({ s = 5, className }: { s?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  const w = s * 10;
  return (
    <svg
      width={w + 2}
      height={w + 2}
      viewBox={`-1 -1 ${w + 2} ${w + 2}`}
      className={cn("shrink-0 drop-shadow-sm", className)}
      aria-hidden
    >
      <defs>
        <BeadPattern id={id} s={s} />
      </defs>
      <rect
        x={-0.5}
        y={-0.5}
        width={w + 1}
        height={w + 1}
        rx={1}
        fill="none"
        stroke="#a87a22"
        strokeWidth={1}
      />
      <rect width={w} height={w} fill={`url(#${id})`} />
    </svg>
  );
}

/** Oblique-projection cube: front, top and side faces each show edge × edge beads (10 for the thousand-cube). */
export function ThousandCube({
  s = 4,
  edge = 10,
  className,
}: {
  s?: number;
  edge?: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const size = s * edge;
  const depth = size * 0.45;
  const k = depth / size;
  return (
    <svg
      width={size + depth + 2}
      height={size + depth + 2}
      viewBox={`-1 -1 ${size + depth + 2} ${size + depth + 2}`}
      className={cn("shrink-0 drop-shadow", className)}
      aria-hidden
    >
      <defs>
        <BeadPattern id={id} s={s} />
      </defs>
      <g transform={`matrix(1 0 ${k} ${-k} 0 ${depth})`}>
        <rect width={size} height={size} fill={`url(#${id})`} />
        <rect width={size} height={size} fill="#fff" opacity={0.12} />
      </g>
      <g transform={`matrix(${k} ${-k} 0 1 ${size} ${depth})`}>
        <rect width={size} height={size} fill={`url(#${id})`} />
        <rect width={size} height={size} fill="#3b2400" opacity={0.22} />
      </g>
      <rect x={0} y={depth} width={size} height={size} fill={`url(#${id})`} />
    </svg>
  );
}

export const PLACE_STYLE: Record<
  Place,
  { ring: string; chip: string; ar: string; en: string; arOne: string; enOne: string }
> = {
  // Classic Montessori place-value colours: units green, tens blue, hundreds red, thousands green.
  thousands: {
    ring: "ring-emerald-600/40",
    chip: "bg-emerald-600 text-white",
    ar: "الآلاف",
    en: "Thousands",
    arOne: "مكعب ألف",
    enOne: "thousand-cube",
  },
  hundreds: {
    ring: "ring-rose-600/40",
    chip: "bg-rose-600 text-white",
    ar: "المئات",
    en: "Hundreds",
    arOne: "مربع مئة",
    enOne: "hundred-square",
  },
  tens: {
    ring: "ring-sky-600/40",
    chip: "bg-sky-600 text-white",
    ar: "العشرات",
    en: "Tens",
    arOne: "عمود عشرة",
    enOne: "ten-bar",
  },
  units: {
    ring: "ring-emerald-600/40",
    chip: "bg-emerald-600 text-white",
    ar: "الآحاد",
    en: "Units",
    arOne: "خرزة",
    enOne: "unit bead",
  },
};

/** One piece of a given place, sized for a mat column. */
export function Piece({ place, scale = 1 }: { place: Place; scale?: number }) {
  if (place === "thousands") return <ThousandCube s={3.6 * scale} />;
  if (place === "hundreds") return <HundredSquare s={4.4 * scale} />;
  if (place === "tens") return <TenBar s={7 * scale} />;
  return <UnitBead s={14 * scale} />;
}

/** Read-only golden bead picture of a number (used by results in other activities). */
export function BeadNumber({
  value,
  scale = 0.8,
  className,
}: {
  value: number;
  scale?: number;
  className?: string;
}) {
  if (value > 9999 || value < 0) return null;
  const th = Math.floor(value / 1000);
  const h = Math.floor(value / 100) % 10;
  const t = Math.floor(value / 10) % 10;
  const u = value % 10;
  return (
    <div
      dir="ltr"
      className={cn("flex flex-wrap items-end justify-center gap-x-3 gap-y-1", className)}
      aria-label={`${value}`}
    >
      {th > 0 && (
        <div className="flex flex-wrap items-end gap-0.5">
          {Array.from({ length: th }, (_, i) => (
            <ThousandCube key={i} s={3.6 * scale} />
          ))}
        </div>
      )}
      {h > 0 && (
        <div className="flex flex-wrap items-end gap-0.5">
          {Array.from({ length: h }, (_, i) => (
            <HundredSquare key={i} s={4.4 * scale} />
          ))}
        </div>
      )}
      {t > 0 && (
        <div className="flex items-end gap-0.5">
          {Array.from({ length: t }, (_, i) => (
            <TenBar key={i} s={5.6 * scale} />
          ))}
        </div>
      )}
      {u > 0 && (
        <div className="grid grid-cols-5 gap-0.5">
          {Array.from({ length: u }, (_, i) => (
            <UnitBead key={i} s={12 * scale} />
          ))}
        </div>
      )}
    </div>
  );
}

/** rows × cols bead array as ONE SVG rect with a bead pattern (any size up to 99 × 99 stays light). */
export function BeadArray({
  rows,
  cols,
  maxWidth = 320,
  maxBead = 26,
  tens = true,
  className,
}: {
  rows: number;
  cols: number;
  maxWidth?: number;
  maxBead?: number;
  tens?: boolean;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  if (rows <= 0 || cols <= 0) return null;
  const s = Math.max(2.5, Math.min(maxBead, maxWidth / cols));
  const w = cols * s;
  const h = rows * s;
  return (
    <svg
      width={w + 2}
      height={h + 2}
      viewBox={`-1 -1 ${w + 2} ${h + 2}`}
      className={cn("max-w-full shrink-0", className)}
      role="img"
      aria-label={`${rows} × ${cols}`}
    >
      <defs>
        <BeadPattern id={id} s={s} />
      </defs>
      <rect width={w} height={h} fill={`url(#${id})`} />
      {tens &&
        Array.from({ length: Math.floor((cols - 1) / 10) }, (_, i) => (
          <line
            key={`c${i}`}
            x1={(i + 1) * 10 * s}
            y1={-1}
            x2={(i + 1) * 10 * s}
            y2={h + 1}
            stroke="#0284c7"
            strokeWidth={1.2}
          />
        ))}
      {tens &&
        Array.from({ length: Math.floor((rows - 1) / 10) }, (_, i) => (
          <line
            key={`r${i}`}
            x1={-1}
            y1={(i + 1) * 10 * s}
            x2={w + 1}
            y2={(i + 1) * 10 * s}
            stroke="#0284c7"
            strokeWidth={1.2}
          />
        ))}
    </svg>
  );
}

/** A quantity shown with place-value pieces: 14 → one ten-bar + four beads (used inside groups/bowls). */
export function SmallQuantity({ n, bead = 12 }: { n: number; bead?: number }) {
  const t = Math.floor(n / 10);
  const u = n % 10;
  return (
    <span dir="ltr" className="inline-flex flex-wrap items-end justify-center gap-0.5">
      {Array.from({ length: t }, (_, i) => (
        <TenBar key={`t${i}`} s={bead * 0.55} />
      ))}
      {u > 0 && (
        <span className="grid grid-cols-5 gap-px">
          {Array.from({ length: u }, (_, i) => (
            <UnitBead key={i} s={bead} />
          ))}
        </span>
      )}
    </span>
  );
}
