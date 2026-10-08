import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, Check, Eraser, Lightbulb, RotateCcw, RotateCw, Save, Trash2, Undo2, Volume2, VolumeX } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { brickName, brickVar, copyBuilds, fixPuzzles, freePrompts, numberChallenges, numberStages, type BrickColor, type NumberStage, type Structure } from "@/data/buildingWorld";
import hamadHolding from "@/assets/building/hamad-holding.png";
import hamadPlacing from "@/assets/building/hamad-placing.png";
import hamadPointing from "@/assets/building/hamad-pointing.png";
import hamadThinking from "@/assets/building/hamad-thinking.png";
import hamadCelebrating from "@/assets/building/hamad-celebrating.png";
import talalHolding from "@/assets/building/talal-holding.png";
import talalPlacing from "@/assets/building/talal-placing.png";
import talalPointing from "@/assets/building/talal-pointing.png";
import talalThinking from "@/assets/building/talal-thinking.png";
import talalCelebrating from "@/assets/building/talal-celebrating.png";
import talalWatching from "@/assets/building/talal-watching.png";
import treeImg from "@/assets/building/tree.png";
import flowerImg from "@/assets/building/flower.png";
import doorImg from "@/assets/building/door.png";
import wheelImg from "@/assets/building/wheel.png";
import flagImg from "@/assets/building/flag.png";
import ladderImg from "@/assets/building/ladder.png";
import fenceImg from "@/assets/building/fence.png";
import archImg from "@/assets/building/arch.png";
import houseImg from "@/assets/building/house.png";
import carImg from "@/assets/building/car.png";
import rocketImg from "@/assets/building/rocket.png";
import boatImg from "@/assets/building/boat.png";
import planeImg from "@/assets/building/plane.png";
import bigTreeImg from "@/assets/building/bigtree.png";

type Kid = "hamad" | "talal";
type Mood = "holding" | "placing" | "pointing" | "thinking" | "celebrating" | "watching";
const art: Record<Kid, Record<Mood, string>> = {
  hamad: { holding: hamadHolding, placing: hamadPlacing, pointing: hamadPointing, thinking: hamadThinking, celebrating: hamadCelebrating, watching: hamadHolding },
  talal: { holding: talalHolding, placing: talalPlacing, pointing: talalPointing, thinking: talalThinking, celebrating: talalCelebrating, watching: talalWatching },
};
const COLORS: BrickColor[] = ["R", "B", "Y", "G"];
const STORE = "building-world-v1";
type Progress = { counting: number; addition: number; subtraction: number; place: number; compare: number; copy: number; fix: number; done: string[] };
type Creation = { id: string; name: string; pieces: Piece[] };
type Saved = { progress: Progress; creations: Creation[] };
const emptyProgress: Progress = { counting: 0, addition: 0, subtraction: 0, place: 0, compare: 0, copy: 0, fix: 0, done: [] };

function loadSaved(): Saved {
  try { const raw = localStorage.getItem(STORE); if (raw) { const p = JSON.parse(raw); return { progress: { ...emptyProgress, ...p.progress }, creations: p.creations ?? [] }; } } catch { /* ignore */ }
  return { progress: emptyProgress, creations: [] };
}
function persist(s: Saved) { try { localStorage.setItem(STORE, JSON.stringify(s)); } catch { /* ignore */ } }

// ---------- sound ----------
let soundOn = true;
function tone(f1: number, f2: number, d = 0.12, vol = 0.08) {
  if (!soundOn || typeof window === "undefined" || !window.AudioContext) return;
  const c = new AudioContext(), o = c.createOscillator(), g = c.createGain();
  o.type = "triangle"; o.connect(g); g.connect(c.destination);
  o.frequency.setValueAtTime(f1, c.currentTime); o.frequency.exponentialRampToValueAtTime(f2, c.currentTime + d);
  g.gain.setValueAtTime(vol, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d + 0.05);
  o.start(); o.stop(c.currentTime + d + 0.06);
}
const snap = () => tone(900, 420, 0.06);
const cheer = () => { tone(520, 780, 0.18); setTimeout(() => tone(660, 1040, 0.22), 160); };
const soft = () => tone(360, 300, 0.15, 0.05);
function say(text: string) {
  if (!soundOn || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text.replace("−", "minus").replace("+", "plus")); u.rate = 0.9; window.speechSynthesis.speak(u);
}

// ---------- reusable pieces ----------
export function Block({ color, className = "", style, onClick, label }: { color: BrickColor; className?: string; style?: CSSProperties | undefined; onClick?: (() => void) | undefined; label?: string | undefined }) {
  const s = { ...style, ["--brick" as string]: brickVar[color] } as CSSProperties;
  if (onClick) return <button type="button" aria-label={label ?? `${brickName[color]} block`} onClick={onClick} className={`bw-block touch-manipulation ${className}`} style={s} />;
  return <div aria-hidden className={`bw-block ${className}`} style={s} />;
}

function CharacterReaction({ kid, mood, line }: { kid: Kid; mood: Mood; line?: string }) {
  return (
    <div className="flex items-end gap-2">
      <img src={art[kid][mood]} alt={`${kid === "hamad" ? "Hamad" : "Talal"} ${mood}`} draggable={false} className={`h-32 w-auto shrink-0 object-contain drop-shadow-lg sm:h-40 min-[960px]:h-52 ${mood === "celebrating" ? "animate-bw-bounce" : ""}`} />
      {line && <p className="mb-6 max-w-[14rem] rounded-2xl rounded-bl-none border-2 border-foreground/10 bg-card px-3 py-2 text-sm font-extrabold text-card-foreground shadow-md">{line}</p>}
    </div>
  );
}

function RewardAnimation({ show }: { show: boolean }) {
  if (!show) return null;
  return <div aria-hidden className="pointer-events-none absolute inset-0 z-20 flex items-start justify-center overflow-hidden">{["⭐", "✨", "🌟", "✨", "⭐"].map((s, i) => <span key={i} className="animate-pop-in text-3xl" style={{ marginTop: `${10 + (i % 3) * 14}%`, marginInline: "4%", animationDelay: `${i * 80}ms` }}>{s}</span>)}</div>;
}

function StructureView({ rows, size = "md", bounce, onCell, highlight }: { rows: string[]; size?: "sm" | "md"; bounce?: boolean; onCell?: (r: number, c: number) => void; highlight?: string }) {
  const cols = Math.max(...rows.map((r) => r.length));
  const cell = size === "sm" ? "w-7 h-6 sm:w-8 sm:h-7" : "w-11 h-9 sm:w-14 sm:h-11";
  return (
    <div className={`inline-grid gap-[3px] rounded-2xl bg-[var(--brick-plate)]/40 p-2 pt-3 ${bounce ? "animate-bw-bounce" : ""}`} style={{ gridTemplateColumns: `repeat(${cols}, auto)` }}>
      {rows.flatMap((row, r) => Array.from({ length: cols }, (_, c) => {
        const ch = ((row ?? "")[c] ?? ".") as BrickColor | ".";
        const key = `${r}-${c}`;
        const ring = highlight === key ? "ring-4 ring-primary" : "";
        if (ch === ".") return onCell ? <button key={key} type="button" aria-label={`Empty spot row ${r + 1} column ${c + 1}`} onClick={() => onCell(r, c)} className={`${cell} touch-manipulation rounded-md border-2 border-dashed border-foreground/15 ${ring}`} /> : <div key={key} className={cell} />;
        return <Block key={key + ch} color={ch} className={`${cell} animate-bw-snap ${ring}`} onClick={onCell ? () => onCell(r, c) : undefined} label={`${brickName[ch]} block row ${r + 1} column ${c + 1}`} />;
      }))}
    </div>
  );
}

function ColorPalette({ value, onChange }: { value: BrickColor; onChange: (c: BrickColor) => void }) {
  return <div className="flex flex-wrap justify-center gap-3" role="radiogroup" aria-label="Block color">{COLORS.map((c) => <Block key={c} color={c} label={`Use ${brickName[c]}`} onClick={() => { onChange(c); snap(); }} className={`h-12 w-14 ${value === c ? "ring-4 ring-foreground/60 ring-offset-2" : "opacity-80"}`} />)}</div>;
}

function Shell({ title, onBack, children, sound, onSound }: { title: string; onBack: () => void; children: React.ReactNode; sound: boolean; onSound: () => void }) {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-secondary/40 via-background to-success/25 px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="mx-auto max-w-xl min-[960px]:max-w-6xl">
        <header className="mb-4 flex items-center gap-3">
          <GameButton tone="neutral" className="grid h-12 w-12 place-items-center rounded-full p-0" onClick={onBack} aria-label="Back"><ArrowLeft className="h-6 w-6" /></GameButton>
          <h1 className="flex-1 text-2xl font-black">{title}</h1>
          <GameButton tone="neutral" className="grid h-12 w-12 place-items-center rounded-full p-0" onClick={onSound} aria-label={sound ? "Sound off" : "Sound on"}>{sound ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}</GameButton>
        </header>
        {children}
      </div>
    </main>
  );
}

// ---------- Game 1: Build the Number ----------
function NumberChallengeGame({ onDone }: { onDone: (id: string, stage: NumberStage) => void }) {
  const [stage, setStage] = useState<NumberStage>("count5");
  const list = useMemo(() => numberChallenges.filter((c) => c.stage === stage), [stage]);
  const [i, setI] = useState(0);
  const [count, setCount] = useState(0);
  const [tens, setTens] = useState(0);
  const [state, setState] = useState<"play" | "right" | "try">("play");
  const [hint, setHint] = useState(false);
  const ch = list[i % list.length]!;
  const kid: Kid = i % 2 ? "talal" : "hamad";
  useEffect(() => { setCount(0); setTens(0); setState("play"); setHint(false); say(ch.prompt); }, [ch]);
  const win = () => { setState("right"); cheer(); onDone(ch.id, ch.stage); };
  const check = () => {
    if (ch.kind === "build" && count === ch.target) return win();
    if (ch.kind === "place" && tens * 10 + count === ch.target && count < 10) return win();
    setState("try"); soft(); setHint(true);
  };
  const next = () => setI((n) => n + 1);
  const line = state === "right" ? "Great building!" : state === "try" ? (ch.kind === "place" ? "Try again! Look at the tens and ones." : "Try again! Count carefully.") : ch.prompt;
  const colorAt = (n: number): BrickColor => (ch.kind === "build" && ch.parts ? (n < ch.parts[0] ? "R" : "B") : "Y");

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
        {numberStages.map((s) => <GameButton key={s.id} tone={stage === s.id ? "sky" : "neutral"} className="shrink-0 px-3 py-2 text-sm" role="tab" aria-selected={stage === s.id} onClick={() => { setStage(s.id); setI(0); }}>{s.label}</GameButton>)}
      </div>
      <div className="grid gap-4 min-[960px]:grid-cols-[18rem_1fr]">
        <div className="relative"><CharacterReaction kid={kid} mood={state === "right" ? "celebrating" : state === "try" ? "thinking" : count > 0 ? "placing" : "pointing"} line={line} /></div>
        <section className="relative rounded-3xl border-2 border-foreground/10 bg-card/80 p-4 shadow-md">
          <RewardAnimation show={state === "right"} />
          <p className="text-center text-4xl font-black">{ch.prompt}</p>
          {ch.kind === "compare" ? (
            <div className="mt-4 flex items-end justify-center gap-10">
              {[ch.left, ch.right].map((h, side) => (
                <button key={side} type="button" aria-label={`Tower with ${h} blocks`} className="flex touch-manipulation flex-col-reverse items-center gap-[3px] rounded-2xl p-2 hover:bg-muted" onClick={() => { if (state === "right") return; if (h === Math.max(ch.left, ch.right)) win(); else { setState("try"); soft(); } }}>
                  <span className="mt-1 text-lg font-black">{hint || state === "right" ? h : ""}</span>
                  {Array.from({ length: h }, (_, n) => <Block key={n} color={side ? "B" : "G"} className="h-5 w-12 sm:h-6 sm:w-14" />)}
                </button>
              ))}
            </div>
          ) : (
            <>
              {hint && ch.kind === "build" && ch.parts && <p className="mt-2 text-center font-bold text-muted-foreground">Build {ch.parts[0]} red, then {ch.parts[1]} blue.</p>}
              {hint && ch.kind === "place" && <p className="mt-2 text-center font-bold text-muted-foreground">{ch.target} = {Math.floor(ch.target / 10) * 10} + {ch.target % 10}</p>}
              <div className="mt-4 flex min-h-40 flex-wrap items-end justify-center gap-4 rounded-2xl bg-[var(--brick-plate)]/35 p-3">
                {ch.kind === "place" && (
                  <div className="flex items-end gap-2" aria-label={`${tens} tens`}>
                    {Array.from({ length: tens }, (_, t) => <div key={t} className="flex flex-col-reverse gap-[2px]">{Array.from({ length: 10 }, (_, n) => <Block key={n} color="B" className="h-3 w-7 animate-bw-snap" />)}</div>)}
                  </div>
                )}
                {Array.from({ length: Math.ceil(count / 5) }, (_, col) => (
                  <div key={col} className="flex flex-col-reverse gap-[3px]">
                    {Array.from({ length: Math.min(5, count - col * 5) }, (_, n) => <Block key={n} color={colorAt(col * 5 + n)} className="h-7 w-12 animate-bw-snap" />)}
                  </div>
                ))}
                {count === 0 && tens === 0 && <p className="self-center font-bold text-muted-foreground">Tap a block to start building</p>}
              </div>
              <p className="mt-2 text-center text-lg font-black" aria-live="polite">{ch.kind === "place" ? `${tens} tens + ${count} ones` : `${count} blocks`}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                {ch.kind === "place" && <GameButton tone="sky" className="px-4 py-3" onClick={() => { if (tens < 9) { setTens(tens + 1); snap(); } }}>+ Ten</GameButton>}
                <GameButton tone="sun" className="px-4 py-3" onClick={() => { if (count < 20) { setCount(count + 1); snap(); } }}>{ch.kind === "place" ? "+ One" : "+ Block"}</GameButton>
                <GameButton tone="neutral" className="px-4 py-3" onClick={() => { if (count > 0) setCount(count - 1); else if (tens > 0) setTens(tens - 1); soft(); }}>− Remove</GameButton>
              </div>
            </>
          )}
          <div className="mt-4 flex justify-center gap-3">
            {state === "right" ? <GameButton tone="mint" className="px-6 py-3 text-lg" onClick={next}>Next ▶</GameButton> : ch.kind !== "compare" && <GameButton tone="mint" className="inline-flex items-center gap-2 px-6 py-3 text-lg" onClick={check}><Check className="h-5 w-5" />Done!</GameButton>}
            {state !== "right" && <GameButton tone="neutral" className="inline-flex items-center gap-2 px-4 py-3" onClick={() => setHint(true)}><Lightbulb className="h-5 w-5" />Hint</GameButton>}
          </div>
        </section>
      </div>
    </div>
  );
}

// ---------- Game 2: Copy the Build ----------
const emptyRows = (s: Structure) => pad(s.rows).map((r) => ".".repeat(r.length));
function setCell(rows: string[], r: number, c: number, ch: string) { return rows.map((row, i) => (i === r ? row.slice(0, c) + ch + row.slice(c + 1) : row)); }
const pad = (rows: string[]) => { const w = Math.max(...rows.map((r) => r.length)); return rows.map((r) => r.padEnd(w, ".")); };

function CopyBuildChallenge({ onDone }: { onDone: (id: string) => void }) {
  const [i, setI] = useState(0);
  const target = copyBuilds[i % copyBuilds.length]!;
  const goal = pad(target.rows);
  const [rows, setRows] = useState(() => emptyRows(target));
  const [color, setColor] = useState<BrickColor>(goal.join("").replace(/\./g, "")[0] as BrickColor);
  const [state, setState] = useState<"play" | "right" | "try">("play");
  const kid: Kid = i % 2 ? "hamad" : "talal";
  useEffect(() => { setRows(emptyRows(target)); setState("play"); say(`Copy the ${target.name}!`); }, [target]);
  const tap = (r: number, c: number) => { if (state === "right") return; const cur = rows[r]![c]; setRows(setCell(rows, r, c, cur === color ? "." : color)); cur === color ? soft() : snap(); setState("play"); };
  const check = () => {
    if (rows.join() === goal.join()) { setState("right"); cheer(); onDone(target.id); return; }
    setState("try"); soft();
  };
  const placed = rows.join("").replace(/\./g, "").length, needed = goal.join("").replace(/\./g, "").length;
  const line = state === "right" ? "You copied it perfectly!" : state === "try" ? (placed !== needed ? `Look carefully — it needs ${needed} blocks.` : "Look carefully at the colors and spots.") : "Pick a color, then tap a spot.";
  return (
    <div className="grid gap-4 min-[960px]:grid-cols-[18rem_1fr]">
      <CharacterReaction kid={kid} mood={state === "right" ? "celebrating" : state === "try" ? "thinking" : "watching"} line={line} />
      <section className="relative rounded-3xl border-2 border-foreground/10 bg-card/80 p-4 shadow-md">
        <RewardAnimation show={state === "right"} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="text-center"><p className="mb-2 font-black">Copy this: {target.name}</p><StructureView rows={goal} size="sm" bounce={state === "right"} /></div>
          <div className="text-center"><p className="mb-2 font-black">Your build</p><StructureView rows={rows} onCell={tap} bounce={state === "right"} /></div>
        </div>
        <div className="mt-4"><ColorPalette value={color} onChange={setColor} /></div>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {state === "right" ? <GameButton tone="mint" className="px-6 py-3 text-lg" onClick={() => setI(i + 1)}>Next build ▶</GameButton> : <GameButton tone="mint" className="inline-flex items-center gap-2 px-6 py-3 text-lg" onClick={check}><Check className="h-5 w-5" />Done!</GameButton>}
          <GameButton tone="neutral" className="inline-flex items-center gap-2 px-4 py-3" onClick={() => { setRows(emptyRows(target)); setState("play"); }}><RotateCcw className="h-5 w-5" />Start over</GameButton>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">{copyBuilds.map((b, n) => <button key={b.id} type="button" onClick={() => setI(n)} className={`rounded-full px-3 py-1 text-xs font-bold ${n === i % copyBuilds.length ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{b.name}</button>)}</div>
      </section>
    </div>
  );
}

// ---------- Game 3: Fix the Build ----------
function FixBuildChallenge({ onDone }: { onDone: (id: string) => void }) {
  const [i, setI] = useState(0);
  const p = fixPuzzles[i % fixPuzzles.length]!;
  const [rows, setRows] = useState<string[]>([]);
  const [picked, setPicked] = useState<BrickColor | null>(null);
  const [state, setState] = useState<"play" | "right" | "try">("play");
  const kid: Kid = i % 2 ? "talal" : "hamad";
  useEffect(() => { setRows(p.kind === "repair" ? pad(p.broken) : []); setPicked(null); setState("play"); say(p.prompt); }, [p]);
  const win = () => { setState("right"); cheer(); onDone(p.id); };
  const tapRepair = (r: number, c: number) => {
    if (p.kind !== "repair" || state === "right") return;
    const goal = pad(p.target);
    if (rows[r]![c] === goal[r]![c]) { setState("try"); soft(); return; }
    const nr = setCell(rows, r, c, goal[r]![c]!); setRows(nr); snap(); setState("play");
    if (nr.join() === goal.join()) win();
  };
  const line = state === "right" ? "Fixed! Well done!" : state === "try" ? "Look carefully. Which block fits?" : p.prompt;
  return (
    <div className="grid gap-4 min-[960px]:grid-cols-[18rem_1fr]">
      <CharacterReaction kid={kid} mood={state === "right" ? "celebrating" : state === "try" ? "thinking" : "pointing"} line={line} />
      <section className="relative rounded-3xl border-2 border-foreground/10 bg-card/80 p-4 text-center shadow-md">
        <RewardAnimation show={state === "right"} />
        <p className="text-2xl font-black">{p.prompt}</p>
        {p.kind === "pattern" ? (
          <>
            <div className="mt-5 flex flex-wrap items-end justify-center gap-2">
              {p.seq.map((s, n) => s === "?" ? (picked && state === "right" ? <Block key={n} color={picked} className="h-12 w-14 animate-bw-snap" /> : <div key={n} className="grid h-12 w-14 place-items-center rounded-lg border-4 border-dashed border-foreground/30 text-2xl font-black">?</div>) : <Block key={n} color={s} className={`h-12 w-14 ${state === "right" ? "animate-bw-bounce" : ""}`} />)}
            </div>
            <p className="mt-5 font-bold text-muted-foreground">Pick a block:</p>
            <div className="mt-2 flex justify-center gap-4">{p.options.map((o) => <Block key={o} color={o} label={`Choose ${brickName[o]}`} className="h-14 w-16" onClick={() => { if (state === "right") return; setPicked(o); if (o === p.answer) win(); else { setState("try"); soft(); } }} />)}</div>
          </>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><p className="mb-2 font-black">It should look like</p><StructureView rows={pad(p.target)} size="sm" /></div>
            <div><p className="mb-2 font-black">Tap to fix</p><StructureView rows={rows} onCell={tapRepair} bounce={state === "right"} /></div>
          </div>
        )}
        {state === "right" && <GameButton tone="mint" className="mt-5 px-6 py-3 text-lg" onClick={() => setI(i + 1)}>Next puzzle ▶</GameButton>}
      </section>
    </div>
  );
}

// ---------- Game 4: Free Build ----------
type PieceKind = "brick1" | "brick2" | "tree" | "flower" | "door" | "wheel" | "flag" | "ladder" | "fence" | "bridge" | "arch" | "house" | "car" | "rocket" | "boat" | "plane" | "bigtree";
type Piece = { id: string; kind: PieceKind; x: number; y: number; w: number; h: number; color: BrickColor };
const stickers: { kind: PieceKind; img: string; label: string; w: number; h: number }[] = [
  { kind: "door", img: doorImg, label: "Door", w: 1, h: 2 }, { kind: "tree", img: treeImg, label: "Tree", w: 1, h: 2 }, { kind: "flower", img: flowerImg, label: "Flower", w: 1, h: 1 },
  { kind: "wheel", img: wheelImg, label: "Wheel", w: 1, h: 1 }, { kind: "flag", img: flagImg, label: "Flag", w: 1, h: 2 }, { kind: "ladder", img: ladderImg, label: "Ladder", w: 1, h: 2 },
  { kind: "fence", img: fenceImg, label: "Fence", w: 2, h: 1 }, { kind: "arch", img: archImg, label: "Arch", w: 2, h: 1 },
  { kind: "house", img: houseImg, label: "House", w: 3, h: 3 }, { kind: "car", img: carImg, label: "Car", w: 3, h: 2 }, { kind: "boat", img: boatImg, label: "Boat", w: 3, h: 2 },
  { kind: "plane", img: planeImg, label: "Plane", w: 3, h: 2 }, { kind: "rocket", img: rocketImg, label: "Rocket", w: 2, h: 3 }, { kind: "bigtree", img: bigTreeImg, label: "Big tree", w: 2, h: 3 },
];
const stickerOf = (k: PieceKind) => stickers.find((s) => s.kind === k);
const COLS = 10, ROWS = 8;

function FreeBuild({ creations, onSave }: { creations: Creation[]; onSave: (c: Creation) => void }) {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [history, setHistory] = useState<Piece[][]>([]);
  const [tool, setTool] = useState<PieceKind | "erase">("brick2");
  const [color, setColor] = useState<BrickColor>("R");
  const [vertical, setVertical] = useState(false);
  const [prompt, setPrompt] = useState(0);
  const [note, setNote] = useState("");
  const drag = useRef<{ kind: PieceKind | "move"; pieceId?: string } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const kid: Kid = prompt % 2 ? "talal" : "hamad";

  const commit = (next: Piece[]) => { setHistory((h) => [...h.slice(-30), pieces]); setPieces(next); };
  const sizeOf = (kind: PieceKind) => kind === "brick1" ? { w: 1, h: 1 } : kind === "brick2" ? (vertical ? { w: 1, h: 2 } : { w: 2, h: 1 }) : { w: stickerOf(kind)!.w, h: stickerOf(kind)!.h };
  const fits = (x: number, y: number, w: number, h: number, ignore?: string) => x >= 0 && y >= 0 && x + w <= COLS && y + h <= ROWS && !pieces.some((p) => p.id !== ignore && x < p.x + p.w && p.x < x + w && y < p.y + p.h && p.y < y + h);
  const at = (x: number, y: number) => pieces.find((p) => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h);
  const place = (kind: PieceKind, x: number, y: number) => {
    const { w, h } = sizeOf(kind);
    const px = Math.min(x, COLS - w), py = Math.min(y, ROWS - h);
    if (!fits(px, py, w, h)) { setNote("That spot is full — try another!"); soft(); return; }
    commit([...pieces, { id: crypto.randomUUID(), kind, x: px, y: py, w, h, color }]); snap(); setNote("");
  };
  const tapCell = (x: number, y: number) => {
    const hit = at(x, y);
    if (tool === "erase") { if (hit) { commit(pieces.filter((p) => p !== hit)); soft(); } return; }
    if (hit && (hit.kind === "brick1" || hit.kind === "brick2") && tool === hit.kind) { commit(pieces.map((p) => (p === hit ? { ...p, color } : p))); snap(); return; }
    if (hit) { setNote("Drag a piece to move it, or use the eraser."); return; }
    place(tool, x, y);
  };
  const cellFromPoint = (cx: number, cy: number) => {
    const g = gridRef.current?.getBoundingClientRect(); if (!g) return null;
    const x = Math.floor(((cx - g.left) / g.width) * COLS), y = Math.floor(((cy - g.top) / g.height) * ROWS);
    return x >= 0 && y >= 0 && x < COLS && y < ROWS ? { x, y } : null;
  };
  useEffect(() => {
    const up = (e: PointerEvent) => {
      const d = drag.current; drag.current = null; if (!d) return;
      const cell = cellFromPoint(e.clientX, e.clientY); if (!cell) return;
      if (d.kind === "move" && d.pieceId) {
        const p = pieces.find((q) => q.id === d.pieceId); if (!p || (p.x === cell.x && p.y === cell.y)) return;
        const nx = Math.min(cell.x, COLS - p.w), ny = Math.min(cell.y, ROWS - p.h);
        if (fits(nx, ny, p.w, p.h, p.id)) { commit(pieces.map((q) => (q.id === p.id ? { ...q, x: nx, y: ny } : q))); snap(); }
      } else if (d.kind !== "move") place(d.kind, cell.x, cell.y);
    };
    window.addEventListener("pointerup", up); return () => window.removeEventListener("pointerup", up);
  });
  const pal = (kind: PieceKind) => ({ onPointerDown: () => { drag.current = { kind }; setTool(kind); } });
  const cellPct = { w: 100 / COLS, h: 100 / ROWS };

  return (
    <div className="grid gap-4 min-[960px]:grid-cols-[1fr_20rem]">
      <section className="rounded-3xl border-2 border-foreground/10 bg-card/80 p-3 shadow-md">
        <div className="mb-2 flex items-center justify-between gap-2">
          <button type="button" className="rounded-full bg-muted px-3 py-2 text-sm font-extrabold" onClick={() => { setPrompt((prompt + 1) % freePrompts.length); say(freePrompts[(prompt + 1) % freePrompts.length] ?? ""); }}>💡 {freePrompts[prompt]}</button>
        </div>
        <div ref={gridRef} className="relative w-full touch-none select-none overflow-hidden rounded-2xl bg-gradient-to-b from-secondary/30 to-secondary/10" style={{ aspectRatio: `${COLS} / ${ROWS}` }}>
          <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
            {Array.from({ length: COLS * ROWS }, (_, n) => <button key={n} type="button" aria-label={`Build spot ${(n % COLS) + 1}, ${Math.floor(n / COLS) + 1}`} className="border border-foreground/5" onClick={() => tapCell(n % COLS, Math.floor(n / COLS))} />)}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[3%] bg-[var(--brick-plate)]" />
          {pieces.map((p) => {
            const st = stickerOf(p.kind);
            const box: CSSProperties = { left: `${p.x * cellPct.w}%`, top: `${p.y * cellPct.h}%`, width: `${p.w * cellPct.w}%`, height: `${p.h * cellPct.h}%` };
            return (
              <div key={p.id} className="absolute p-[2px] animate-bw-snap" style={box} onPointerDown={(e) => { if (tool === "erase") return; e.preventDefault(); drag.current = { kind: "move", pieceId: p.id }; }} onClick={() => { if (tool === "erase") { commit(pieces.filter((q) => q.id !== p.id)); soft(); } }}>
                {st ? <img src={st.img} alt={st.label} draggable={false} className="h-full w-full object-contain drop-shadow" /> : <Block color={p.color} className="h-full w-full" />}
              </div>
            );
          })}
        </div>
        {note && <p className="mt-2 text-center text-sm font-bold text-muted-foreground" aria-live="polite">{note}</p>}
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <GameButton tone="neutral" className="inline-flex items-center gap-1 px-3 py-2 text-sm" onClick={() => { const prev = history[history.length - 1]; if (prev) { setPieces(prev); setHistory(history.slice(0, -1)); soft(); } }}><Undo2 className="h-4 w-4" />Undo</GameButton>
          <GameButton tone={tool === "erase" ? "berry" : "neutral"} className="inline-flex items-center gap-1 px-3 py-2 text-sm" onClick={() => setTool("erase")}><Eraser className="h-4 w-4" />Remove</GameButton>
          <GameButton tone="neutral" className="inline-flex items-center gap-1 px-3 py-2 text-sm" onClick={() => { if (pieces.length) commit([]); }}><Trash2 className="h-4 w-4" />Clear</GameButton>
          <GameButton tone="neutral" className="inline-flex items-center gap-1 px-3 py-2 text-sm" onClick={() => { setPieces([]); setHistory([]); setTool("brick2"); setPrompt(0); setNote(""); }}><RotateCcw className="h-4 w-4" />Start over</GameButton>
          <GameButton tone="mint" className="inline-flex items-center gap-1 px-3 py-2 text-sm" onClick={() => { if (!pieces.length) { setNote("Build something first!"); return; } onSave({ id: crypto.randomUUID(), name: `Creation ${creations.length + 1}`, pieces }); cheer(); setNote("Saved! ⭐"); }}><Save className="h-4 w-4" />Save</GameButton>
        </div>
      </section>
      <aside className="space-y-3">
        <CharacterReaction kid={kid} mood={pieces.length > 6 ? "celebrating" : pieces.length ? "placing" : "holding"} line={pieces.length > 6 ? "Wow, I love it!" : "Tap or drag pieces to build!"} />
        <div className="rounded-3xl border-2 border-foreground/10 bg-card/80 p-3 shadow-md">
          <p className="mb-2 text-sm font-black">Blocks</p>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" {...pal("brick1")} onClick={() => setTool("brick1")} aria-label="Small block" className={`touch-none rounded-xl p-1 ${tool === "brick1" ? "ring-4 ring-primary" : ""}`}><Block color={color} className="h-9 w-9" /></button>
            <button type="button" {...pal("brick2")} onClick={() => setTool("brick2")} aria-label="Long block" className={`touch-none rounded-xl p-1 ${tool === "brick2" ? "ring-4 ring-primary" : ""}`}><Block color={color} className={vertical ? "h-16 w-9" : "h-9 w-16"} /></button>
            <GameButton tone="neutral" className="inline-flex items-center gap-1 px-3 py-2 text-xs" onClick={() => setVertical(!vertical)} aria-label="Rotate long block"><RotateCw className="h-4 w-4" />Turn</GameButton>
          </div>
          <div className="mt-3"><ColorPalette value={color} onChange={setColor} /></div>
          <p className="mb-2 mt-4 text-sm font-black">Special pieces</p>
          <div className="grid grid-cols-5 gap-2">
            {stickers.map((s) => <button key={s.kind} type="button" {...pal(s.kind)} onClick={() => setTool(s.kind)} aria-label={s.label} className={`touch-none rounded-xl bg-muted/50 p-1 ${tool === s.kind ? "ring-4 ring-primary" : ""}`}><img src={s.img} alt="" draggable={false} className="aspect-square w-full object-contain" /></button>)}
          </div>
        </div>
        {creations.length > 0 && (
          <div className="rounded-3xl border-2 border-foreground/10 bg-card/80 p-3 shadow-md">
            <p className="mb-2 text-sm font-black">Saved creations</p>
            <div className="flex flex-wrap gap-2">{creations.map((c) => <GameButton key={c.id} tone="neutral" className="px-3 py-2 text-xs" onClick={() => { commit(c.pieces); snap(); }}>{c.name}</GameButton>)}</div>
          </div>
        )}
      </aside>
    </div>
  );
}

// ---------- Home ----------
type View = "home" | "number" | "copy" | "fix" | "free";
function ProgressIndicator({ p, saved }: { p: Progress; saved: number }) {
  const items = [["Counting", p.counting], ["Addition", p.addition], ["Take away", p.subtraction], ["Tens & ones", p.place], ["Copy builds", p.copy], ["Fix puzzles", p.fix], ["Creations saved", saved]] as const;
  return <div className="flex flex-wrap justify-center gap-2">{items.map(([l, v]) => <span key={l} className="rounded-full bg-card px-3 py-1 text-xs font-bold shadow-sm">{l}: {v}</span>)}</div>;
}

export function BuildingWorld({ onExit }: { onExit: () => void }) {
  const [view, setView] = useState<View>("home");
  const [data, setData] = useState<Saved>({ progress: emptyProgress, creations: [] });
  const [sound, setSound] = useState(true);
  useEffect(() => { setData(loadSaved()); return () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); }; }, []);
  useEffect(() => { soundOn = sound; }, [sound]);
  const update = (fn: (s: Saved) => Saved) => setData((s) => { const n = fn(s); persist(n); return n; });
  const mark = (id: string, field: keyof Omit<Progress, "done">) => update((s) => s.progress.done.includes(id) ? s : { ...s, progress: { ...s.progress, [field]: s.progress[field] + 1, done: [...s.progress.done, id] } });
  const onNumber = (id: string, stage: NumberStage) => { const g = numberStages.find((s) => s.id === stage)!.group; mark(id, g === "counting" ? "counting" : g === "addition" ? "addition" : g === "subtraction" ? "subtraction" : g === "place" ? "place" : "compare"); };
  const titles: Record<View, string> = { home: "🧱 Building World", number: "Build the Number", copy: "Copy the Build", fix: "Fix the Build", free: "Free Build" };
  const cards: { v: View; icon: string; label: string; sub: string; tone: "sun" | "sky" | "berry" | "mint" }[] = [
    { v: "number", icon: "🔢", label: "Build the Number", sub: "Count, add and take away with blocks", tone: "sun" },
    { v: "copy", icon: "🏠", label: "Copy the Build", sub: "Look closely and build the same", tone: "sky" },
    { v: "fix", icon: "🔧", label: "Fix the Build", sub: "Find the missing or wrong block", tone: "berry" },
    { v: "free", icon: "✨", label: "Free Build", sub: "Build anything you imagine", tone: "mint" },
  ];
  return (
    <Shell title={titles[view]} onBack={view === "home" ? onExit : () => setView("home")} sound={sound} onSound={() => setSound(!sound)}>
      {view === "home" && (
        <div className="space-y-5">
          <div className="flex items-end justify-center gap-2">
            <img src={hamadHolding} alt="Hamad holding a block" className="h-40 w-auto object-contain drop-shadow-lg min-[960px]:h-56" draggable={false} />
            <img src={talalHolding} alt="Talal holding a block" className="h-36 w-auto object-contain drop-shadow-lg min-[960px]:h-52" draggable={false} />
          </div>
          <p className="text-center text-lg font-extrabold">Let’s build together! Pick any game.</p>
          <div className="grid gap-3 sm:grid-cols-2 min-[960px]:grid-cols-4">
            {cards.map((c) => <GameButton key={c.v} tone={c.tone} className="flex min-h-32 flex-col items-center justify-center gap-1 rounded-3xl p-4" onClick={() => setView(c.v)}><span className="text-4xl">{c.icon}</span><span className="text-xl font-black">{c.label}</span><span className="text-xs font-bold opacity-80">{c.sub}</span></GameButton>)}
          </div>
          <ProgressIndicator p={data.progress} saved={data.creations.length} />
        </div>
      )}
      {view === "number" && <NumberChallengeGame onDone={onNumber} />}
      {view === "copy" && <CopyBuildChallenge onDone={(id) => mark(id, "copy")} />}
      {view === "fix" && <FixBuildChallenge onDone={(id) => mark(id, "fix")} />}
      {view === "free" && <FreeBuild creations={data.creations} onSave={(c) => update((s) => ({ ...s, creations: [...s.creations, c].slice(-12) }))} />}
    </Shell>
  );
}
