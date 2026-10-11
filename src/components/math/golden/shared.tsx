// Shared workshop context, companion, sounds and small wooden controls used by every activity.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Minus, Plus } from "lucide-react";
import { sfx, type Sfx } from "@/lib/explorerSfx";
import { isVoiceOn, speak } from "@/lib/voice";
import type { LearningLanguage } from "@/lib/learningLanguage";
import { cn } from "@/lib/utils";
import { REWARDS, type RewardId, type WorkshopMode, type WorkshopProgress } from "./progress";
import blokoCurious from "@/assets/golden-workshop/bloko-curious.webp";
import blokoThinking from "@/assets/golden-workshop/bloko-thinking.webp";
import blokoSurprised from "@/assets/golden-workshop/bloko-surprised.webp";
import blokoHappy from "@/assets/golden-workshop/bloko-happy.webp";
import blokoCelebrate from "@/assets/golden-workshop/bloko-celebrate.webp";
import tileBlank from "@/assets/golden-workshop/tile-blank.webp";
import sprout from "@/assets/golden-workshop/reward-sprout.webp";
import flower from "@/assets/golden-workshop/reward-flower.webp";
import stones from "@/assets/golden-workshop/reward-stones.webp";
import appleTree from "@/assets/golden-workshop/reward-apple-tree.webp";
import bridge from "@/assets/golden-workshop/reward-bridge.webp";
import crystal from "@/assets/golden-workshop/reward-crystal.webp";
import dog from "@/assets/golden-workshop/friend-dog.webp";
import turtle from "@/assets/golden-workshop/friend-turtle.webp";
import worm from "@/assets/golden-workshop/friend-worm.webp";
import bloom from "@/assets/golden-workshop/friend-bloom.webp";
import shell from "@/assets/golden-workshop/friend-shell.webp";
import plusFriend from "@/assets/golden-workshop/friend-plus.webp";
import spriteFriend from "@/assets/golden-workshop/friend-sprite.webp";
import arch from "@/assets/golden-workshop/friend-arch.webp";

export const tx = (lang: LearningLanguage, ar: string, en: string) => (lang === "ar" ? ar : en);
export const REWARD_ART: Record<RewardId, string> = {
  sprout,
  flower,
  stones,
  "apple-tree": appleTree,
  bridge,
  crystal,
  dog,
  turtle,
  worm,
  bloom,
  shell,
  plus: plusFriend,
  sprite: spriteFriend,
  arch,
};

// ───────────── companion ─────────────
export type Mood = "curious" | "thinking" | "surprised" | "happy" | "celebrate";
const MOOD_ART: Record<Mood, string> = {
  curious: blokoCurious,
  thinking: blokoThinking,
  surprised: blokoSurprised,
  happy: blokoHappy,
  celebrate: blokoCelebrate,
};
type Say = { mood: Mood; ar: string; en: string; key: number };

type WorkshopCtx = {
  lang: LearningLanguage;
  mode: WorkshopMode;
  progress: WorkshopProgress;
  /** Companion reaction (+ optional spoken line and sound). */
  react: (mood: Mood, ar: string, en: string, opts?: { speak?: boolean; sound?: Sfx }) => void;
  /** Record a discovery; returns true the first time. May unlock a garden reward. */
  discover: (key: string) => boolean;
  play: (s: Sfx) => void;
  say: Say;
};
const Ctx = createContext<WorkshopCtx | null>(null);
export function useWorkshop() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useWorkshop must be used inside <WorkshopProvider>");
  return c;
}

export function WorkshopProvider({
  lang,
  mode,
  progress,
  update,
  children,
}: {
  lang: LearningLanguage;
  mode: WorkshopMode;
  progress: WorkshopProgress;
  update: (f: (p: WorkshopProgress) => WorkshopProgress) => void;
  children: ReactNode;
}) {
  const [say, setSay] = useState<Say>({
    mood: "curious",
    ar: "أهلًا! أنا بلوكو. هيا نلعب بالخرز الذهبي!",
    en: "Hi! I'm Bloko. Let's play with golden beads!",
    key: 0,
  });
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const langRef = useRef(lang);
  langRef.current = lang;
  const play = useCallback((s: Sfx) => {
    if (isVoiceOn()) sfx(s);
  }, []);
  const react = useCallback<WorkshopCtx["react"]>(
    (mood, ar, en, opts) => {
      setSay((prev) => ({ mood, ar, en, key: prev.key + 1 }));
      if (opts?.sound) play(opts.sound);
      if (opts?.speak) void speak(langRef.current === "ar" ? ar : en, langRef.current);
    },
    [play],
  );
  const discover = useCallback(
    (key: string) => {
      const p = progressRef.current;
      if (p.found.includes(key)) return false;
      const next = { ...p, found: [...p.found, key] };
      progressRef.current = next;
      update(() => next);
      const reward = REWARDS.find((r) => r.at === next.found.length);
      if (reward) {
        window.setTimeout(() => {
          setSay((prev) => ({
            mood: "celebrate",
            ar: `اكتشاف جديد! ظهر في الحديقة ${reward.ar}.`,
            en: `New discovery! ${reward.en[0]!.toUpperCase()}${reward.en.slice(1)} appeared in the garden.`,
            key: prev.key + 1,
          }));
          play("chime");
        }, 900);
      }
      return true;
    },
    [update, play],
  );
  const value = useMemo(
    () => ({ lang, mode, progress, react, discover, play, say }),
    [lang, mode, progress, react, discover, play, say],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Bloko sits beside the work, never on top of it. */
export function Companion({ className }: { className?: string }) {
  const { say, lang } = useWorkshop();
  return (
    <div className={cn("flex items-end gap-2", className)} aria-live="polite">
      <img
        key={say.key}
        src={MOOD_ART[say.mood]}
        alt=""
        draggable={false}
        className="h-20 w-auto shrink-0 select-none drop-shadow-md sm:h-24"
        style={{
          animation: say.mood === "celebrate" ? "k-hop 0.9s ease-out" : "k-wiggle 0.6s ease-out",
        }}
      />
      <p
        dir={lang === "ar" ? "rtl" : "ltr"}
        className={cn(
          "relative mb-3 min-w-0 flex-1 rounded-2xl rounded-bl-sm bg-card/95 px-3 py-2 text-sm font-black leading-snug shadow-sm sm:text-base",
          lang === "ar" && "font-arabic",
        )}
      >
        {tx(lang, say.ar, say.en)}
      </p>
    </div>
  );
}

// ───────────── small controls ─────────────
/** A wooden number tile (uses the supplied blank tile art; the numeral is crisp text). */
export function WoodTile({
  children,
  className,
  size = 48,
  active,
}: {
  children: ReactNode;
  className?: string;
  size?: number;
  active?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center font-black text-amber-950",
        active && "drop-shadow-[0_0_6px_var(--primary)]",
        className,
      )}
      style={{ width: size, height: size * 0.76, fontSize: size * 0.42 }}
    >
      <img
        src={tileBlank}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full select-none object-fill"
      />
      <span className="relative leading-none">{children}</span>
    </span>
  );
}

/** − value + stepper with big touch targets; keyboard arrows work on the value. */
export function Stepper({
  value,
  min,
  max,
  onChange,
  label,
  step = 1,
  className,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
  step?: number;
  className?: string;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-2xl bg-card/90 p-1 shadow-sm",
        className,
      )}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className="grid h-11 w-11 place-items-center rounded-xl bg-muted font-black disabled:opacity-40"
        onClick={() => onChange(clamp(value - step))}
        disabled={value <= min}
        aria-label={`${label} −`}
      >
        <Minus className="h-5 w-5" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        aria-label={label}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v)) onChange(clamp(Math.round(v)));
        }}
        className="h-11 w-16 rounded-xl bg-background text-center text-xl font-black tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        className="grid h-11 w-11 place-items-center rounded-xl bg-muted font-black disabled:opacity-40"
        onClick={() => onChange(clamp(value + step))}
        disabled={value >= max}
        aria-label={`${label} +`}
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-3xl border-2 border-amber-900/10 bg-card/85 p-3 shadow-sm backdrop-blur-sm sm:p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Segmented choice (views inside an activity). */
export function Segments<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { id: T; label: ReactNode }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap justify-center gap-1.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "min-h-11 rounded-2xl border-2 border-foreground/10 px-3 text-sm font-black shadow-[0_3px_0_var(--neutral-shadow)] transition-transform active:translate-y-0.5",
            value === o.id ? "bg-secondary text-secondary-foreground" : "bg-card",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Optional, dismissible idea — never required to continue. */
export function Suggestion({ ar, en, onTry }: { ar: string; en: string; onTry?: () => void }) {
  const { lang } = useWorkshop();
  const [hidden, setHidden] = useState(false);
  useEffect(() => setHidden(false), [ar, en]);
  if (hidden) return null;
  return (
    <div className="flex items-center gap-2 rounded-2xl border-2 border-dashed border-amber-700/30 bg-amber-50/80 px-3 py-2 text-sm font-bold">
      <span aria-hidden>💡</span>
      <span className={cn("min-w-0 flex-1", lang === "ar" && "font-arabic")}>
        {tx(lang, ar, en)}
      </span>
      {onTry && (
        <button
          type="button"
          className="min-h-10 rounded-xl bg-primary px-3 font-black text-primary-foreground"
          onClick={onTry}
        >
          {tx(lang, "جرّب", "Try")}
        </button>
      )}
      <button
        type="button"
        className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground"
        onClick={() => setHidden(true)}
        aria-label={tx(lang, "إخفاء", "Hide")}
      >
        ✕
      </button>
    </div>
  );
}

/** On-screen digit pad for answers (no keyboard needed on phones). */
export function AnswerPad({
  onSubmit,
  label,
  maxDigits = 5,
  resetKey,
}: {
  onSubmit: (n: number) => void;
  label: string;
  maxDigits?: number;
  resetKey?: string | number;
}) {
  const { lang } = useWorkshop();
  const [v, setV] = useState("");
  useEffect(() => setV(""), [resetKey]);
  const press = (d: string) => setV((s) => (s.length >= maxDigits ? s : s === "0" ? d : s + d));
  return (
    <div className="grid justify-items-center gap-2" role="group" aria-label={label}>
      <output
        className="grid h-14 min-w-36 place-items-center rounded-2xl border-4 border-amber-900/15 bg-background px-4 text-3xl font-black tabular-nums"
        aria-live="polite"
      >
        {v || "?"}
      </output>
      <div dir="ltr" className="grid grid-cols-5 gap-1.5">
        {"1234567890".split("").map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => press(d)}
            className="grid h-12 w-12 place-items-center rounded-xl bg-card text-xl font-black shadow-[0_3px_0_var(--neutral-shadow)] active:translate-y-0.5"
          >
            {d}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setV((s) => s.slice(0, -1))}
          className="min-h-11 rounded-xl bg-muted px-4 font-black"
        >
          ⌫
        </button>
        <button
          type="button"
          disabled={!v}
          onClick={() => onSubmit(Number(v))}
          className="min-h-11 rounded-xl bg-success px-5 font-black text-success-foreground shadow-[0_3px_0_var(--success-shadow)] disabled:opacity-50"
        >
          {tx(lang, "تحقّق", "Check")}
        </button>
      </div>
    </div>
  );
}

export const randInt = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

export type ChallengeStep = { ar: string; en: string; answer: number };
/** Guided steps answered on the digit pad. Wrong answers get a gentle nudge, never a penalty. */
export function StepChallenge({
  steps,
  onDone,
  onHint,
  doneAr,
  doneEn,
  discoverKey,
}: {
  steps: ChallengeStep[];
  onDone?: () => void;
  onHint?: () => void;
  doneAr: string;
  doneEn: string;
  discoverKey?: string;
}) {
  const { lang, react, discover } = useWorkshop();
  const [i, setI] = useState(0);
  const [tries, setTries] = useState(0);
  const step = steps[i];
  const submit = (n: number) => {
    if (!step) return;
    if (n === step.answer) {
      setTries(0);
      if (i + 1 >= steps.length) {
        setI(i + 1);
        if (discoverKey) discover(discoverKey);
        react("celebrate", doneAr, doneEn, { speak: true, sound: "yay" });
        onDone?.();
      } else {
        setI(i + 1);
        react("happy", "صحيح! الخطوة التالية.", "Yes! Next step.", { sound: "pop" });
      }
    } else {
      setTries((t) => t + 1);
      react(
        "thinking",
        tries >= 1 ? "انظر إلى الصورة وعدّ معي — خذ وقتك." : "ليس بعد. جرّب مرة ثانية!",
        tries >= 1
          ? "Look at the picture and count with me — take your time."
          : "Not yet. Try again!",
        { sound: "click" },
      );
      if (tries >= 1) onHint?.();
    }
  };
  return (
    <Panel className="grid gap-2">
      <ol className="grid gap-1">
        {steps.map((s, k) => (
          <li
            key={k}
            className={cn(
              "flex items-center justify-between gap-2 rounded-xl px-3 py-1.5 text-lg font-black",
              k === i
                ? "bg-primary/20 ring-2 ring-primary"
                : k < i
                  ? "bg-success/20"
                  : "opacity-50",
              lang === "ar" && "font-arabic",
            )}
          >
            <span dir="auto">{tx(lang, s.ar, s.en)}</span>
            <span className="tabular-nums">{k < i ? `${s.answer} ✓` : "?"}</span>
          </li>
        ))}
      </ol>
      {step ? (
        <AnswerPad onSubmit={submit} label={tx(lang, step.ar, step.en)} resetKey={i} />
      ) : (
        <p
          className={cn(
            "text-center text-lg font-black text-success-foreground",
            lang === "ar" && "font-arabic",
          )}
        >
          {tx(lang, doneAr, doneEn)}
        </p>
      )}
    </Panel>
  );
}
