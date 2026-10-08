import { cn } from "@/lib/utils";

/** Peaceful night-to-dawn landscape that gently fills in as `progress` (0–1) grows. No figures are depicted. */
export function Scene({ progress, className }: { progress: number; className?: string }) {
  const p = Math.max(0, Math.min(1, progress));
  const show = (at: number) => ({ opacity: p >= at ? 1 : 0, transition: "opacity 1.4s ease, transform 1.4s ease" });
  const sunY = 150 - p * 90;
  return (
    <svg viewBox="0 0 320 180" className={cn("w-full overflow-hidden rounded-3xl shadow-md", className)} role="img" aria-label="A peaceful sky that brightens as you learn">
      <rect width="320" height="180" style={{ fill: "var(--secondary)" }} />
      <rect width="320" height="180" style={{ fill: "var(--foreground)", opacity: 0.75 * (1 - p), transition: "opacity 1.4s ease" }} />
      <g style={{ ...show(0), opacity: 1 - p * 0.8 }}>
        {[[30, 30], [80, 18], [140, 40], [200, 22], [260, 36], [295, 14], [110, 70], [240, 66]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={2} style={{ fill: "var(--card)" }} />
        ))}
        <circle cx="270" cy="40" r="14" style={{ fill: "var(--card)" }} />
        <circle cx="276" cy="36" r="12" style={{ fill: "var(--foreground)", opacity: 0.75 * (1 - p) + 0.1 }} />
      </g>
      <circle cx="160" cy={sunY} r="26" style={{ fill: "var(--primary)", transition: "cy 1.4s ease" }} />
      <path d="M0 150 L60 95 L110 140 L170 85 L230 140 L280 100 L320 135 L320 180 L0 180Z" style={{ fill: "var(--sky-shadow)", ...show(0.25) }} />
      <path d="M0 160 Q80 135 160 158 T320 152 L320 180 L0 180Z" style={{ fill: "var(--success)", ...show(0.45) }} />
      <g style={show(0.65)}>
        {[[50, 150], [255, 146]].map(([x, y]) => (
          <g key={x}>
            <rect x={(x ?? 0) - 2} y={(y ?? 0) - 16} width="4" height="16" style={{ fill: "var(--foreground)", opacity: 0.6 }} />
            <circle cx={x} cy={(y ?? 0) - 22} r="11" style={{ fill: "var(--success-shadow)" }} />
          </g>
        ))}
      </g>
      <g style={show(0.8)} fill="none" strokeWidth="2.5" strokeLinecap="round">
        <path d="M95 60 q6 -6 12 0 q6 -6 12 0" style={{ stroke: "var(--foreground)" }} />
        <path d="M200 50 q5 -5 10 0 q5 -5 10 0" style={{ stroke: "var(--foreground)" }} />
      </g>
      <g style={show(0.95)}>
        {[120, 140, 180, 205].map((x) => (
          <circle key={x} cx={x} cy={165} r="4" style={{ fill: "var(--accent)" }} />
        ))}
      </g>
    </svg>
  );
}
