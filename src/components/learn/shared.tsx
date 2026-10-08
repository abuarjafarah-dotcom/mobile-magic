import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, DoorClosed, Flower2, Hand, Heart, House, Pencil, UserRound } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import hamadAsset from "@/assets/hamad.jpg.asset.json";
import talalAsset from "@/assets/talal.jpg.asset.json";
import yousefAsset from "@/assets/yousef.jpg.asset.json";
import type { WordPicture as WordPictureId } from "@/data/arabic";
import { cn } from "@/lib/utils";

// The exact approved family photos — the only character artwork used anywhere.
export const familyImages = { hamad: hamadAsset.url, talal: talalAsset.url, yousef: yousefAsset.url };
export type FamilyMember = keyof typeof familyImages;

const CHARACTER_SIZES = {
  small: "h-16 w-16 shrink-0 rounded-2xl border-2 sm:h-[4.5rem] sm:w-[4.5rem]",
  large: "h-32 w-32 rounded-3xl border-4 sm:h-36 sm:w-36",
  hero: "h-40 w-40 rounded-[2rem] border-4 sm:h-48 sm:w-48",
} as const;

export function FamilyCharacter({ name, size = "large", speaking = false, className }: { name: FamilyMember; size?: "small" | "large" | "hero"; speaking?: boolean; className?: string }) {
  return (
    <span className="relative inline-block leading-none">
      <img
        src={familyImages[name]}
        alt={name.charAt(0).toUpperCase() + name.slice(1)}
        draggable={false}
        className={cn(CHARACTER_SIZES[size], "border-card object-cover shadow-xl", speaking && "animate-character-speak", className)}
      />
      {speaking ? (
        <span aria-hidden className="absolute -end-1.5 -top-1.5 grid h-7 w-7 place-items-center rounded-full bg-card text-sm shadow-md">💬</span>
      ) : null}
    </span>
  );
}

export function GameShell({ title, current, total, onExit, children }: { title: string; current?: number; total?: number; onExit: () => void; children: ReactNode }) {
  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 min-[960px]:max-w-4xl min-[960px]:pb-6 min-[960px]:pt-6">
      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 pr-14">
        <GameButton tone="neutral" className="grid h-12 w-12 place-items-center rounded-full p-0" onClick={onExit} aria-label="Back home">
          <ArrowLeft className="h-5 w-5" />
        </GameButton>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-black">{title}</h1>
          {total ? <ProgressBar value={current ?? 0} total={total} /> : null}
        </div>
      </header>
      {children}
    </section>
  );
}

export function ProgressBar({ value, total }: { value: number; total: number }) {
  return (
    <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={total}>
      <div className="h-full rounded-full bg-success transition-[width] duration-700" style={{ width: `${Math.min(100, (value / total) * 100)}%` }} />
    </div>
  );
}

export function AnswerChoice({ children, onClick, state, hint, className, label }: { children: ReactNode; onClick: () => void; state?: "right" | "soft" | null; hint?: boolean; className?: string; label?: string }) {
  return (
    <GameButton
      tone={state === "right" ? "mint" : "neutral"}
      aria-label={label}
      className={cn("min-h-24 w-full px-3 py-4", state === "soft" && "opacity-60", hint && "ring-4 ring-success ring-offset-2 ring-offset-background", className)}
      onClick={onClick}
    >
      {children}
    </GameButton>
  );
}

export function SpeechBubble({ children }: { children: ReactNode }) {
  return <div className="max-w-64 rounded-2xl rounded-bl-sm bg-card px-4 py-3 text-left text-base font-black shadow-sm">{children}</div>;
}

/** Plays one clip at a time; optional start/stop points (seconds) for pausing mid-ayah. */
export function useClip() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);

  const stop = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    audioRef.current?.pause();
    audioRef.current = null;
    setPlaying(false);
  }, []);

  useEffect(() => stop, [stop]);

  const play = useCallback((src: string, options: { from?: (duration: number) => number; stopAt?: (duration: number) => number; onEnd?: () => void } = {}) => {
    stop();
    if (!src) { options.onEnd?.(); return; }
    const audio = new Audio(src);
    audioRef.current = audio;
    setPlaying(true);
    const finish = () => {
      if (audioRef.current !== audio) return;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      audio.pause();
      audioRef.current = null;
      setPlaying(false);
      options.onEnd?.();
    };
    const watch = () => {
      if (audioRef.current !== audio) return;
      if (options.stopAt && audio.duration && audio.currentTime >= options.stopAt(audio.duration)) { finish(); return; }
      frameRef.current = requestAnimationFrame(watch);
    };
    audio.onended = finish;
    audio.onerror = finish;
    audio.onloadedmetadata = () => { if (options.from) audio.currentTime = Math.max(0, options.from(audio.duration) - 0.05); };
    audio.play().then(() => { frameRef.current = requestAnimationFrame(watch); }).catch(finish);
  }, [stop]);

  return { play, stop, playing };
}

export function WordPicture({ picture, className }: { picture: WordPictureId; className?: string }) {
  if (picture === "boy") return <FamilyCharacter name="hamad" className={cn("h-28 w-28", className)} />;
  const icons = { door: DoorClosed, house: House, pencil: Pencil, hand: Hand, girl: Flower2, father: UserRound, mother: Heart } as const;
  const Icon = icons[picture];
  return (
    <div className={cn("grid h-28 w-28 place-items-center rounded-3xl bg-secondary text-secondary-foreground shadow-md", className)}>
      <Icon className="h-16 w-16" strokeWidth={2.2} />
    </div>
  );
}

export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}
