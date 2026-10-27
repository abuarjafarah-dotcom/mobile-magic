import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type GameButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  tone?: "sun" | "mint" | "sky" | "berry" | "neutral" | "danger";
};

const tones = {
  sun: "bg-primary text-primary-foreground shadow-[4px_4px_0_var(--sun-shadow)]",
  mint: "bg-success text-success-foreground shadow-[4px_4px_0_var(--success-shadow)]",
  sky: "bg-secondary text-secondary-foreground shadow-[4px_4px_0_var(--sky-shadow)]",
  berry: "bg-accent text-accent-foreground shadow-[4px_4px_0_var(--berry-shadow)]",
  neutral: "bg-card text-card-foreground shadow-[4px_4px_0_var(--neutral-shadow)]",
  danger: "bg-destructive text-destructive-foreground shadow-[4px_4px_0_var(--danger-shadow)]",
};

export function GameButton({ className, tone = "sun", children, ...props }: GameButtonProps) {
  return (
    <button
      className={cn(
        "touch-manipulation rounded-2xl border-[3px] border-[var(--ink)] font-extrabold transition-[transform,box-shadow,opacity] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-65",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
