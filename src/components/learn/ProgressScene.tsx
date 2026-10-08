import type { SurahScene } from "@/data/surahs";
import { Scene } from "./Scene";
import { cn } from "@/lib/utils";

type Props = { progress: number; scene: SurahScene; className?: string };

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const reveal = (progress: number, at: number) => ({
  opacity: progress >= at ? 1 : 0,
  transform: progress >= at ? "translateY(0) scale(1)" : "translateY(12px) scale(.75)",
  transition: "opacity 900ms ease, transform 900ms ease",
});

export function ProgressScene({ progress, scene, className }: Props) {
  const p = clamp(progress);
  if (scene === "dawn") return className ? <Scene progress={p} className={className} /> : <Scene progress={p} />;
  return (
    <svg viewBox="0 0 320 180" className={cn("w-full overflow-hidden rounded-3xl shadow-md", className)} role="img" aria-label={scene === "flowers" ? "A meadow blooming as you learn" : scene === "trees" ? "A woodland growing as you learn" : "An autumn tree changing as you learn"}>
      <rect width="320" height="180" className="fill-secondary" />
      <circle cx="270" cy="34" r="22" className="fill-primary" opacity=".82" />
      <path d="M0 132 Q72 105 148 132 T320 125 V180 H0Z" className="fill-success" />
      {scene === "flowers" && <Flowers progress={p} />}
      {scene === "trees" && <Trees progress={p} />}
      {scene === "foliage" && <Foliage progress={p} />}
    </svg>
  );
}

function Flowers({ progress }: { progress: number }) {
  const flowers = [[35,145],[65,132],[92,151],[124,126],[154,146],[188,130],[220,150],[252,127],[286,145]] as const;
  return <g>{flowers.map(([x,y],i) => <g key={x} style={reveal(progress, (i + 1) / (flowers.length + 1))}><path d={`M${x} ${y + 18} Q${x - 3} ${y + 8} ${x} ${y}`} fill="none" className="stroke-success-foreground" strokeWidth="3" strokeLinecap="round"/><circle cx={x} cy={y} r="5" className={i % 2 ? "fill-accent" : "fill-primary"}/><circle cx={x-5} cy={y+1} r="4" className="fill-card"/><circle cx={x+5} cy={y+1} r="4" className="fill-card"/><circle cx={x} cy={y-5} r="4" className="fill-card"/></g>)}</g>;
}

function Trees({ progress }: { progress: number }) {
  const trees = [[38,132,.7],[84,122,.9],[140,130,.75],[198,113,1.05],[260,127,.82],[300,118,.95]] as const;
  return <g>{trees.map(([x,y,size],i) => <g key={x} style={{...reveal(progress,(i+1)/(trees.length+1)),transformOrigin:`${x}px ${y+45}px`}}><rect x={x-4*size} y={y} width={8*size} height={45*size} rx="3" className="fill-foreground" opacity=".58"/><circle cx={x} cy={y} r={24*size} style={{ fill: "var(--success-shadow)" }}/><circle cx={x-14*size} cy={y+10*size} r={17*size} className="fill-success"/><circle cx={x+15*size} cy={y+8*size} r={18*size} className="fill-success"/></g>)}</g>;
}

function Foliage({ progress }: { progress: number }) {
  const leaves = [[142,62],[174,49],[202,66],[126,86],[160,81],[194,91],[223,86],[107,105],[145,109],[184,112],[217,110],[243,103]] as const;
  return <g><path d="M166 165 Q164 112 172 72 M168 116 Q142 94 121 88 M170 101 Q199 78 222 75" fill="none" className="stroke-foreground" strokeWidth="12" strokeLinecap="round" opacity=".65"/>{leaves.map(([x,y],i) => { const fallen=progress >= (i+1)/(leaves.length+1); return <ellipse key={`${x}-${y}`} cx={fallen ? 72 + i*15 : x} cy={fallen ? 160 - (i%3)*4 : y} rx="9" ry="5" transform={`rotate(${i%2 ? 28 : -24} ${fallen ? 72+i*15 : x} ${fallen ? 160-(i%3)*4 : y})`} className={i%3===0 ? "fill-primary" : i%3===1 ? "fill-accent" : "fill-destructive"} style={{transition:"cx 1.2s ease, cy 1.2s ease"}}/>})}</g>;
}
