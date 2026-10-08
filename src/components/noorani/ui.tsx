// Shared visuals for the Noorani world: character sprites, big Arabic glyphs, sound
// buttons, celebration bursts and mastery stars. Activity engines compose these.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { stopNoorani } from "@/lib/nooraniAudio";
import { Volume2 } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import {
  harakahVariants,
  phrases,
  withMark,
  type ActivitySpec,
  type Haraka,
  type NooraniItem,
  type NooraniSkill,
  type PhraseId,
} from "@/data/noorani";
import type { PlayerId, Result } from "@/lib/nooraniProgress";
import { cn } from "@/lib/utils";

const art = import.meta.glob("../../assets/noorani/*.webp", {
  eager: true,
  import: "default",
}) as Record<string, string>;
export const sprite = (name: string) => art[`../../assets/noorani/${name}.webp`] ?? "";

export type Pose =
  "stand" | "listen" | "cheer" | "think" | "thumbs" | "point" | "wow" | "read" | "explain";
export type GuidePose =
  | "listen"
  | "point"
  | "think"
  | "cheer"
  | "encourage"
  | "read"
  | "sign"
  | "wow"
  | "thumbs"
  | "welcome";

/** Which uploaded pose sheet belongs to which boy — swap here if needed. */
export const KID_SHEET: Record<PlayerId, string> = { hamad: "hamad", talal: "talal" };
export const KID_NAME: Record<PlayerId, { ar: string; en: string }> = {
  hamad: { ar: "حَمَد", en: "Hamad" },
  talal: { ar: "طَلَال", en: "Talal" },
};
export const GUIDE_NAME = { ar: "نُور", en: "Noor" };

export function Kid({
  who,
  pose = "stand",
  className,
  bounce,
}: {
  who: PlayerId;
  pose?: Pose;
  className?: string;
  bounce?: boolean;
}) {
  return (
    <img
      src={sprite(`${KID_SHEET[who]}-${pose}`)}
      alt={KID_NAME[who].en}
      draggable={false}
      className={cn(
        "pointer-events-none select-none object-contain drop-shadow-[0_8px_10px_rgb(0_0_0/0.18)]",
        bounce && "animate-pop-in",
        className,
      )}
    />
  );
}

export function Guide({ pose = "welcome", className }: { pose?: GuidePose; className?: string }) {
  return (
    <img
      src={sprite(`guide-${pose}`)}
      alt={GUIDE_NAME.en}
      draggable={false}
      className={cn(
        "pointer-events-none select-none object-contain drop-shadow-[0_8px_12px_rgb(0_0_0/0.15)]",
        className,
      )}
    />
  );
}

export const Ar = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span dir="rtl" lang="ar" className={cn("font-arabic", className)}>
    {children}
  </span>
);

/** Large, harakah-friendly Arabic glyph. Amiri Quran first for Qaida-style shapes. */
// Amiri Quran's ascent/descent are lopsided, so a letter's ink sits well below the middle
// of its line box (tailed letters like ح ج ع most of all). We measure the real ink with a
// canvas and nudge it so the visible letter is centred. Offsets are in em, cached per text.
const inkCache = new Map<string, number>();
let measureCtx: CanvasRenderingContext2D | null = null;

function inkOffsetEm(text: string, family: string, weight: string): number | null {
  const key = `${family}|${weight}|${text}`;
  const hit = inkCache.get(key);
  if (hit !== undefined) return hit;
  if (typeof document === "undefined") return null;
  measureCtx ??= document.createElement("canvas").getContext("2d");
  if (!measureCtx) return null;
  measureCtx.font = `${weight} 100px ${family}`;
  measureCtx.direction = "rtl";
  const m = measureCtx.measureText(text);
  if (!m.fontBoundingBoxAscent && !m.fontBoundingBoxDescent) return null;
  const contentMid = (m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2;
  const inkMid = (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
  const em = (inkMid - contentMid) / 100;
  return em;
}

/**
 * Big Arabic glyph, optically centred in whatever box holds it.
 * `centerOn` pins the centring to another text so stacked layers (letter + harakah)
 * and letters that gain a mark stay put; pass `false` to turn centring off.
 */
export function Glyph({
  children,
  className,
  centerOn,
}: {
  children: ReactNode;
  className?: string;
  centerOn?: string | false;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [dy, setDy] = useState(0);
  const text = centerOn === false ? null : (centerOn ?? (typeof children === "string" ? children : null));

  useEffect(() => {
    const el = ref.current;
    if (!el || !text) {
      setDy(0);
      return;
    }
    let live = true;
    const measure = (final: boolean) => {
      if (!live) return;
      const cs = getComputedStyle(el);
      const em = inkOffsetEm(text, cs.fontFamily, cs.fontWeight);
      if (em === null) return;
      // Only cache once the web font is in, so fallback-font numbers never stick.
      if (final) inkCache.set(`${cs.fontFamily}|${cs.fontWeight}|${text}`, em);
      setDy(em);
    };
    measure(false);
    void document.fonts?.ready.then(() => measure(true));
    return () => {
      live = false;
    };
  }, [text]);

  return (
    <span
      ref={ref}
      dir="rtl"
      lang="ar"
      style={dy ? { translate: `0 ${dy.toFixed(3)}em` } : undefined}
      className={cn(
        "font-quran inline-block leading-[1.5] [font-feature-settings:'kern'] select-none",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SoundButton({
  onPlay,
  playing,
  label = "Listen",
  size = "lg",
  className,
}: {
  onPlay: () => void;
  playing?: boolean;
  label?: string;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <GameButton
      tone="sky"
      aria-label={label}
      onClick={onPlay}
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full p-0",
        size === "lg" ? "h-20 w-20" : "h-14 w-14",
        className,
      )}
    >
      {playing ? (
        <span aria-hidden className="absolute inset-0 animate-ripple rounded-full bg-secondary" />
      ) : null}
      <Volume2 className={cn("relative", size === "lg" ? "h-9 w-9" : "h-6 w-6")} />
    </GameButton>
  );
}

export function Burst({ fire }: { fire: number }) {
  if (!fire) return null;
  const bits = ["✨", "⭐", "🌸", "💎", "🌼", "✨"];
  return (
    <div
      key={fire}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-1/3 z-50 flex justify-center gap-3"
    >
      {bits.map((b, i) => (
        <span key={i} className="animate-bloom text-4xl" style={{ animationDelay: `${i * 60}ms` }}>
          {b}
        </span>
      ))}
    </div>
  );
}

export function Stars({
  value,
  of = 3,
  className,
}: {
  value: number;
  of?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} aria-label={`${value} of ${of} stars`}>
      {Array.from({ length: of }, (_, i) => (
        <span
          key={i}
          className={cn("text-lg leading-none", i < value ? "" : "opacity-25 grayscale")}
        >
          ⭐
        </span>
      ))}
    </span>
  );
}

/** A kid sprite that reacts to the activity's last answer. */
export function useReaction() {
  const [pose, setPose] = useState<Pose>("listen");
  const [burst, setBurst] = useState(0);
  const right = () => {
    setPose(Math.random() > 0.5 ? "cheer" : "thumbs");
    setBurst((b) => b + 1);
  };
  const wrong = () => setPose("think");
  const listen = () => setPose("listen");
  return { pose, burst, right, wrong, listen, setPose };
}

export type ActivityProps = {
  skill: NooraniSkill;
  spec: ActivitySpec;
  targets: NooraniItem[]; // what this activity practises
  pool: NooraniItem[]; // everything the child has met so far (distractors)
  player: PlayerId;
  onResult: (r: Omit<Result, "skillId" | "activity">) => void;
  onDone: () => void;
};

/**
 * Distractors. Syllables and blends get alternatives that differ by exactly one harakah, so only
 * decoding the marks wins. Letters get look/sound-alikes the child has met, then anything else.
 */
export function choicesFor(
  target: NooraniItem,
  pool: NooraniItem[],
  n: number,
  mark?: Haraka,
): NooraniItem[] {
  if (target.haraka || target.segments) {
    const variants = harakahVariants(target, mark).sort(() => Math.random() - 0.5);
    // With a contrast mark (Level 4: sukoon) the mark's twin always appears: بَ ↔ بْ.
    if (mark && target.haraka) {
      const twin = target.haraka === mark ? withMark(target, "fatha") : withMark(target, mark);
      variants.sort((a, b) => (a.id === twin.id ? -1 : b.id === twin.id ? 1 : 0));
    }
    return [target, ...variants.slice(0, n - 1)].sort(() => Math.random() - 0.5);
  }
  // Letters only compete with letters, and never with a second item that sounds the same (two ya forms).
  const others = pool.filter(
    (p) => p.id !== target.id && p.say !== target.say && !p.haraka && !p.segments,
  );
  const alike = others
    .filter((p) => target.confusable?.includes(p.id))
    .sort(() => Math.random() - 0.5);
  const rest = others.filter((p) => !alike.includes(p)).sort(() => Math.random() - 0.5);
  return [target, ...[...alike, ...rest].slice(0, n - 1)].sort(() => Math.random() - 0.5);
}

/** Round order that never repeats the same target twice in a row. */
export function roundTargets(targets: NooraniItem[], rounds: number): NooraniItem[] {
  const out: NooraniItem[] = [];
  let bag: NooraniItem[] = [];
  while (out.length < rounds && targets.length) {
    if (!bag.length) bag = [...targets].sort(() => Math.random() - 0.5);
    const next = bag.shift()!;
    if (out.length && out[out.length - 1]!.id === next.id && targets.length > 1) {
      bag.push(next);
      continue;
    }
    out.push(next);
  }
  return out;
}

/** False once the activity unmounts — guards audio chains so nothing speaks after leaving. */
export function useAlive() {
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      stopNoorani();
    };
  }, []);
  return alive;
}

/** Calls fn once after mount (used to auto-play the first sound). */
export function useOnMount(fn: () => void) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const t = setTimeout(fn, 350);
    return () => clearTimeout(t);
  }, []);
}

export function RoundDots({ value, total }: { value: number; total: number }) {
  return (
    <div className="flex justify-center gap-1.5" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-2.5 w-2.5 rounded-full transition-colors",
            i < value ? "bg-success" : i === value ? "bg-primary" : "bg-muted",
          )}
        />
      ))}
    </div>
  );
}

/** Activity frame: buddy character + instruction on top, round dots, centred play area. */
export function ActivityFrame({
  who,
  pose,
  instruction,
  hint,
  children,
  burst,
  round,
  total,
}: {
  who: PlayerId;
  pose: Pose;
  instruction: string;
  hint?: string;
  children: ReactNode;
  burst: number;
  round?: number;
  total?: number;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mt-3 flex items-end gap-3" dir="rtl">
        <Kid
          who={who}
          pose={pose}
          className="h-36 w-24 shrink-0 sm:h-40 sm:w-28"
          bounce
          key={pose}
        />
        <div className="mb-4 rounded-2xl rounded-br-sm bg-card px-4 py-2 shadow-sm">
          <Ar className="block text-2xl font-black leading-snug sm:text-3xl">{instruction}</Ar>
          {hint ? (
            <span dir="ltr" className="block text-xs font-bold text-muted-foreground">
              {hint}
            </span>
          ) : null}
        </div>
      </div>
      {total && total > 1 ? (
        <div className="mt-1">
          <RoundDots value={round ?? 0} total={total} />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col justify-center pb-6">{children}</div>
      <Burst fire={burst} />
    </div>
  );
}

/** The spec's instruction phrase (data) or the engine's default. */
export function promptOf(spec: ActivitySpec, fallback: PhraseId): PhraseId {
  return spec.prompt && spec.prompt in phrases ? (spec.prompt as PhraseId) : fallback;
}

/**
 * A syllable with its harakah emphasised: the whole syllable is drawn in the accent colour and
 * gently pulsing, the bare letter is drawn on top of it — so only the mark stands out, and it can
 * never drift away from its letter (both layers share one font, size and position).
 */
export function MarkedGlyph({
  item,
  className,
  pulse = true,
  emphasis = true,
}: {
  item: NooraniItem;
  className?: string;
  pulse?: boolean;
  emphasis?: boolean;
}) {
  if (!emphasis || !item.haraka || !item.letter)
    return <Glyph className={className}>{item.glyph}</Glyph>;
  const bare = item.glyph.replace(/[\u064B-\u0652]/g, "");
  return (
    <span className={cn("relative inline-grid", className)} aria-label={item.glyph}>
      <Glyph
        className={cn(
          "col-start-1 row-start-1 text-accent [text-shadow:0_0_0.08em_var(--accent)]",
          pulse && "animate-[mark-pulse_1.6s_ease-in-out_infinite]",
        )}
        centerOn={bare}
      >
        {item.glyph}
      </Glyph>
      <Glyph className="col-start-1 row-start-1 text-foreground" centerOn={bare}>{bare}</Glyph>
    </span>
  );
}

/** A harakah on its own: it sits on a faint tatweel so it has something to attach to, and only the mark is coloured (an opaque
 *  copy of the tatweel is drawn on top of the coloured one). */
export function MarkOnly({ mark, className }: { mark: string; className?: string }) {
  return (
    <span className={cn("relative inline-grid", className)} aria-hidden>
      <Glyph className="col-start-1 row-start-1 text-accent" centerOn={"\u0640"}>{`\u0640${mark}`}</Glyph>
      <Glyph className="col-start-1 row-start-1 text-[color:var(--border)]" centerOn={"\u0640"}>{"\u0640"}</Glyph>
    </span>
  );
}

/** A harakah on its own, sitting on a tatweel so it always has something to attach to. */
export const markGlyph = (mark: string) => `\u0640${mark}`;
