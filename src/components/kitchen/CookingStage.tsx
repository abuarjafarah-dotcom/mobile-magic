import { useCallback, useEffect, useRef, useState, type PointerEvent as RPE, type ReactNode } from "react";
import { COOK_RECIPES, ING_NAME, kart, type Cook, type Line, type Recipe, type Step, type Vessel, type VState } from "@/data/kitchenRecipes";
import { INGREDIENTS } from "@/data/kitchen";
import { speakEnglish, stopVoice } from "@/lib/voice";
import { playClips, stopClips } from "@/lib/kitchenClips";

export type Lang = "ar" | "en";
type Pose = "idle" | "stir" | "cheer" | "taste";
type Bit = { id: number; x: number; y: number; img?: string; fx: "bubble" | "spark" | "steam" | "fall" | "chip" };
let uid = 0;

/* ---------- voice: Arabic = recorded ElevenLabs clips only (never TTS); English = device voice ---------- */
export function sayLine(l: Line, lang: Lang, muted: boolean) {
  if (muted) return Promise.resolve();
  if (lang === "ar") return l.v?.length ? playClips(l.v) : Promise.resolve();
  stopClips();
  return speakEnglish(l.en);
}
const ING_CLIP: Record<string, string> = {
  chicken: "chicken", eggplant: "eggplant", "eggplant-sliced": "eggplant", potato: "potato", "potato-cubed": "potato",
  rice: "rice", water: "water", salt: "salt", garlic: "garlic", "garlic-minced": "garlic", onion: "onion", "onion-sliced": "onion",
  parsley: "parsley", lemon: "lemon", "lemon-sliced": "lemon", bread: "bread", "arabic-bread": "bread", cabbage: "malfouf", molokhia: "molokhia",
  "mloukhye/molokhia-leaves": "molokhia", "mloukhye/molokhia-chopped-bowl": "molokhia", "mloukhye/mloukhye-serving-bowl": "molokhia",
  "mloukhye/chicken-raw-pieces": "chicken", "mloukhye/chicken-cooked-pieces": "chicken", "mloukhye/onion-whole": "onion",
  "mloukhye/garlic-head": "garlic", "mloukhye/garlic-chopped": "garlic", "mloukhye/rice-raw-bowl": "rice", "mloukhye/rice-plate": "rice", "mloukhye/lemon-wedges": "lemon",
};
export const ingName = (id: string): Line => ({ ...(ING_NAME[id] ?? { ar: INGREDIENTS[id]?.ar ?? id, en: INGREDIENTS[id]?.en ?? id }), v: ING_CLIP[id] ? [ING_CLIP[id]] : [] });

/* ---------- tiny sound effects ---------- */
let ac: AudioContext | null = null;
function sfx(kind: "plop" | "chop" | "splash" | "chime" | "sizzle" | "whoosh" | "squish", muted: boolean) {
  if (muted || typeof window === "undefined") return;
  try {
    ac ??= new AudioContext(); if (ac.state === "suspended") void ac.resume();
    const t = ac.currentTime, g = ac.createGain(); g.connect(ac.destination);
    if (kind === "chime") {
      [660, 880, 1320].forEach((f, i) => { const o = ac!.createOscillator(), gg = ac!.createGain(); o.frequency.value = f; gg.gain.setValueAtTime(0.12, t + i * 0.1); gg.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.4); o.connect(gg).connect(ac!.destination); o.start(t + i * 0.1); o.stop(t + i * 0.1 + 0.45); });
      return;
    }
    if (kind === "plop" || kind === "squish") {
      const o = ac.createOscillator(); o.frequency.setValueAtTime(kind === "plop" ? 520 : 200, t); o.frequency.exponentialRampToValueAtTime(90, t + 0.18);
      g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2); o.connect(g); o.start(t); o.stop(t + 0.22); return;
    }
    const dur = { chop: 0.07, splash: 0.9, sizzle: 1.4, whoosh: 0.5 }[kind];
    const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(); src.buffer = buf;
    f.type = kind === "sizzle" ? "highpass" : kind === "chop" ? "bandpass" : "lowpass"; f.frequency.value = kind === "sizzle" ? 3000 : kind === "chop" ? 1800 : 900;
    g.gain.value = kind === "chop" ? 0.5 : 0.18; src.connect(f).connect(g); src.start(t);
  } catch { /* audio unavailable */ }
}

/* ---------- characters ---------- */
const CAST_NAME: Record<Cook, string> = { hamad: "حمد", talal: "طلال", teta: "تيتا" };
/** Pose picture with graceful fallbacks (taste → cheer → idle) so a missing pose never shows a broken image. */
const castPic = (who: Cook, pose: Pose) => kart(`cast/${who}-${pose}`) || (pose === "taste" ? kart(`cast/${who}-cheer`) : "") || kart(`cast/${who}-idle`);
function Buddy({ who, pose, hop, talking, side }: { who: Cook; pose: Pose; hop: number; talking: boolean; side: "left" | "right" }) {
  const src = castPic(who, pose === "taste" && who === "hamad" ? "cheer" : pose);
  return (
    <div className={`pointer-events-none absolute bottom-2 z-20 h-[24%] min-h-28 max-h-64 ${side === "left" ? "left-1 sm:left-6" : "right-1 sm:right-6"}`}>
      <div key={hop} className={`h-full ${hop ? "k-hop" : ""}`}>
        <img src={src} alt={CAST_NAME[who]} draggable={false}
          className={`h-full w-auto object-contain drop-shadow-[0_6px_8px_oklch(0.2_0.03_60/.35)] ${talking ? "k-talk" : "k-breathe"} ${side === "right" ? "" : "-scale-x-100"}`}
          style={{ animationDelay: side === "left" ? "0s" : "1.1s" }} />
      </div>
    </div>
  );
}

/* ---------- draggable ingredient / tool ---------- */
function DragItem({ img, label, target, onDrop, children }: { img: string; label: string; target: React.RefObject<HTMLDivElement | null>; onDrop: () => void; children?: ReactNode }) {
  const [d, setD] = useState<{ x: number; y: number } | null>(null);
  const start = useRef({ x: 0, y: 0, moved: false });
  const down = (e: RPE) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); start.current = { x: e.clientX, y: e.clientY, moved: false }; setD({ x: 0, y: 0 }); };
  const move = (e: RPE) => { if (!d) return; const x = e.clientX - start.current.x, y = e.clientY - start.current.y; if (Math.hypot(x, y) > 8) start.current.moved = true; setD({ x, y }); };
  const up = (e: RPE) => {
    const r = target.current?.getBoundingClientRect();
    const hit = r && e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
    setD(null); if (hit || !start.current.moved) onDrop();
  };
  return (
    <button type="button" data-k="act" aria-label={label} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => setD(null)}
      className="relative touch-none select-none" style={{ transform: d ? `translate(${d.x}px, ${d.y}px) scale(1.15)` : undefined, transition: d ? "none" : "transform .35s cubic-bezier(.3,1.4,.5,1)", zIndex: d ? 60 : 1 }}>
      {children ? <div className={`h-24 w-32 sm:h-32 sm:w-40 ${d ? "" : "k-glow"}`}>{children}</div>
        : <img src={img} alt="" draggable={false} className={`h-24 w-24 object-contain sm:h-32 sm:w-32 ${d ? "" : "k-glow"}`} />}
      {!d && <span className="k-hint absolute -top-7 left-1/2 -translate-x-1/2 text-3xl" aria-hidden>👇</span>}
    </button>
  );
}

/* ---------- the vessel scene ---------- */
const DOTS: Record<string, string> = { zaatar: "oklch(0.48 0.09 125)", sumac: "oklch(0.42 0.14 20)", sesame: "oklch(0.9 0.05 85)" };
const emptyV = (): VState => ({ layers: [], scatter: [] });

/** Small frying pan on a burner, drawn in code. Contents turn golden once `cooked`. */
export function PanArt({ v, heat }: { v: VState; heat: boolean }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute bottom-[4%] left-[22%] h-[14%] w-[48%] rounded-[50%] bg-[oklch(0.35_0.02_60)]" />
      {heat && <div className="absolute inset-x-[30%] bottom-[2%] flex justify-center gap-1 text-2xl" aria-hidden>{["🔥", "🔥", "🔥"].map((f, i) => <span key={i} style={{ animation: `k-flame .5s ${i * 0.15}s infinite` }}>{f}</span>)}</div>}
      <div className="absolute right-[2%] top-[44%] h-[9%] w-[30%] -rotate-6 rounded-full bg-[oklch(0.3_0.02_60)] shadow-md" />
      <div className="absolute left-[10%] top-[22%] h-[62%] w-[68%] rounded-[50%] bg-[oklch(0.28_0.015_60)] shadow-[inset_0_-10px_0_oklch(0.2_0.01_60),0_8px_14px_oklch(0.2_0.03_60/.35)]">
        <div className="absolute inset-[9%] overflow-hidden rounded-[50%] bg-[oklch(0.36_0.015_60)]">
          {v.liquid && <div className="absolute inset-0 transition-colors duration-700" style={{ background: v.liquid }} />}
          {v.layers.map((l, i) => (
            <img key={i} src={kart(l)} alt="" draggable={false} className="k-drop absolute h-[70%] w-auto object-contain"
              style={{ left: `${10 + ((i * 31) % 50)}%`, top: `${12 + (i % 2) * 14}%`, filter: v.cooked ? "sepia(.7) saturate(1.6) brightness(1.05)" : undefined, transition: "filter .8s" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
const TABLE_SPOTS = [{ l: 30, b: 22, h: 52 }, { l: 6, b: 16, h: 40 }, { l: 62, b: 16, h: 40 }, { l: 44, b: 4, h: 26 }];
function TableArt({ v }: { v: VState }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-x-[2%] bottom-[2%] top-[18%] rounded-[2rem] bg-[linear-gradient(170deg,oklch(0.62_0.08_60),oklch(0.5_0.08_55))] shadow-[inset_0_-12px_0_oklch(0.42_0.07_50),0_10px_20px_oklch(0.2_0.03_60/.3)]" />
      <div className="absolute inset-x-[2%] top-[42%] h-[18%] bg-[repeating-linear-gradient(90deg,oklch(0.45_0.17_25)_0_14px,oklch(0.25_0.03_30)_14px_18px,oklch(0.45_0.17_25)_18px_30px,oklch(0.85_0.05_80)_30px_33px)] opacity-90" />
      {v.layers.map((l, i) => { const p = TABLE_SPOTS[i % TABLE_SPOTS.length]!; return (
        <img key={i} src={kart(l)} alt="" draggable={false} className="k-drop absolute w-auto object-contain drop-shadow-[0_6px_6px_oklch(0.2_0.03_60/.35)]"
          style={{ left: `${p.l}%`, bottom: `${p.b}%`, height: `${p.h}%`, zIndex: i === 0 ? 1 : 2 }} />
      ); })}
    </div>
  );
}

/** Gas ring under a pot/pan picture; flames only while cooking. */
function Burner({ heat }: { heat: boolean }) {
  return (<>
    <div className="absolute bottom-[2%] left-[26%] h-[8%] w-[48%] rounded-[50%] border-[5px] border-[oklch(0.38_0.01_60)] bg-[oklch(0.38_0.01_60/.25)]" />
    {heat && <div className="absolute inset-x-[30%] bottom-[3%] z-10 flex justify-center gap-1 text-3xl" aria-hidden>{["🔥", "🔥", "🔥"].map((f, i) => <span key={i} style={{ animation: `k-flame .5s ${i * 0.15}s infinite` }}>{f}</span>)}</div>}
  </>);
}

function VesselArt({ vessel, recipe, v, step, count, heat, anim, served }: { vessel: Vessel; recipe: Recipe; v: VState; step: Step | undefined; count: number; heat: boolean; anim: string; served: boolean }) {
  const layers = (
    <div className="absolute inset-x-[20%] top-[14%] h-[30%]">
      {v.liquid && <div className="absolute inset-x-0 bottom-0 h-[70%] rounded-[50%] transition-colors duration-700" style={{ background: v.liquid }} />}
      {v.layers.map((l, i) => (
        <img key={i} src={kart(l)} alt="" draggable={false} className="k-drop absolute h-[90%] w-auto object-contain"
          style={{ left: `${8 + ((i * 23) % 56)}%`, bottom: `${10 + i * 6}%`, filter: v.cooked ? "sepia(.5) saturate(1.3) brightness(.9)" : undefined }} />
      ))}
    </div>
  );
  const scatter = v.scatter.map((s, i) => DOTS[s.img] ? <span key={i} className="absolute h-2 w-2 rounded-full" style={{ left: `${s.x}%`, top: `${s.y + 10}%`, background: DOTS[s.img], animation: "k-fall .6s ease-in both" }} /> : <img key={i} src={kart(s.img)} alt="" className="absolute h-[14%] w-auto object-contain" style={{ left: `${s.x}%`, top: `${s.y}%`, transform: `rotate(${s.r}deg)`, animation: "k-fall .6s ease-in both" }} />);
  const wrap = (children: ReactNode) => <div className={`relative aspect-[10/7] w-full ${anim}`}>{children}{scatter}</div>;
  if (v.art && (vessel === "pot" || vessel === "pan" || vessel === "bowl")) return wrap(<>
    {vessel !== "bowl" && <Burner heat={heat || vessel === "pan"} />}
    <img key={v.art} src={kart(v.art)} alt="" draggable={false} className={`absolute inset-x-0 top-0 h-[90%] w-full object-contain ${vessel === "pan" ? "scale-[1.06]" : ""}`} style={{ animation: "k-pop .45s ease-out both" }} />
  </>);

  if (vessel === "board") {
    const d = step?.do; const it = d?.kind === "chop" ? (count >= d.taps ? d.result : d.item) : d?.kind === "roll" ? "cabbage" : "";
    return wrap(<>
      <img src={kart("tools/board")} alt="" className="absolute inset-0 h-full w-full object-contain" draggable={false} />
      {it && <img key={it + (d?.kind === "chop" && count >= d.taps ? "done" : "")} src={kart(d?.kind === "roll" && count >= d.taps ? "grape-leaves" : it)} alt="" className="k-drop absolute left-[28%] top-[12%] h-[62%] w-[44%] object-contain" style={{ transform: d?.kind === "roll" ? `scale(${1 - count * 0.08}, ${1})` : undefined }} />}
      {d?.kind === "chop" && count < d.taps && <span key={count} className="absolute right-[14%] top-[2%] text-6xl sm:text-7xl" style={{ animation: "k-chop .35s ease-in-out" }} aria-hidden>🔪</span>}
    </>);
  }
  if (vessel === "bowl") return wrap(<>
    <img src={kart("tools/bowl")} alt="" className="absolute inset-0 h-full w-full object-contain" draggable={false} />
    {step?.do.kind === "wash" && !v.layers.includes(step.do.item) && <img key={`w${count}`} src={kart(step.do.item)} alt="" className="absolute left-[32%] top-[8%] h-[40%] w-[36%] object-contain" style={{ animation: "k-wiggle .4s" }} />}
    <div key={step?.do.kind === "wash" ? `l${count}` : "still"} className="absolute inset-0" style={step?.do.kind === "wash" && count ? { animation: "k-wiggle .4s" } : undefined}>{layers}</div>
  </>);
  if (vessel === "dough" || vessel === "tray") {
    const d = step?.do;
    const kneads = recipe.steps.filter((s) => s.vessel === "dough" && s.do.kind === "knead").length ? true : false;
    const flat = vessel === "tray" ? 1 : d?.kind === "knead" ? 0 : d?.kind === "roll" ? Math.min(1, count / d.taps) : 1;
    const squish = d?.kind === "knead" ? (count % 2 ? "scale(1.18,.82)" : "scale(.9,1.1)") : "";
    const baked = v.cooked;
    return wrap(<>
      <div className="absolute inset-x-[6%] bottom-[6%] h-[60%] rounded-[50%] bg-[oklch(0.72_0.03_250)] shadow-[inset_0_-10px_0_oklch(0.55_0.03_250)]" />
      {vessel === "dough" && kneads && (
        <div className="absolute rounded-[50%] transition-all duration-300"
          style={{ width: `${34 + flat * 46}%`, height: `${40 - flat * 12}%`, left: `${50 - (34 + flat * 46) / 2}%`, top: `${54 - (40 - flat * 12) / 2}%`, transform: squish || undefined,
            background: baked ? "radial-gradient(circle at 40% 35%, oklch(0.82 0.1 75), oklch(0.62 0.13 55))" : "radial-gradient(circle at 40% 35%, oklch(0.97 0.02 85), oklch(0.86 0.05 80))",
            boxShadow: "inset 0 -8px 12px oklch(0.5 0.08 60 / .25)" }}>
          {v.liquid && <div className="absolute inset-[8%] rounded-[50%]" style={{ background: v.liquid }} />}
        </div>
      )}
      {layers}
    </>);
  }
  if (vessel === "pan") return wrap(<PanArt v={v} heat />);
  if (vessel === "table") return wrap(<TableArt v={v} />);
  if (vessel === "flip") return wrap(<img src={kart("maqluba/pot-full")} alt="" className="absolute inset-0 h-full w-full object-contain" draggable={false} />);
  if (vessel === "plate") return wrap(<img key={served ? "s" : "p"} src={kart(recipe.dish)} alt="" className={`absolute inset-0 h-full w-full object-contain ${served ? "k-hop" : "k-drop"}`} draggable={false} />);
  // pot
  return wrap(<>
    <img src={kart(v.cooked && recipe.cookedArt ? recipe.cookedArt : "tools/pot-stove")} alt="" className="absolute inset-0 h-full w-full object-contain transition-opacity" draggable={false} />
    {!(v.cooked && recipe.cookedArt) && layers}
    {heat && <div className="absolute inset-x-[30%] bottom-[2%] flex justify-center gap-1 text-3xl" aria-hidden>{["🔥", "🔥", "🔥"].map((f, i) => <span key={i} style={{ animation: `k-flame .5s ${i * 0.15}s infinite` }}>{f}</span>)}</div>}
  </>);
}

/* ---------- engine ---------- */
export function CookingStage({ recipe, lang, muted, onDone }: { recipe: Recipe; lang: Lang; muted: boolean; onDone: () => void }) {
  const n = recipe.steps.length;
  const [i, setI] = useState(-1);
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [vs, setVs] = useState<Record<string, VState>>(() => Object.fromEntries(Object.entries(recipe.start ?? {}).map(([k, p]) => [k, { ...emptyV(), ...p }])));
  const [film, setFilm] = useState(false);
  const [bits, setBits] = useState<Bit[]>([]);
  const [heat, setHeat] = useState(0); // 0 off, 0..1 progress
  const [anim, setAnim] = useState("");
  const [served, setServed] = useState(false);
  const [pose, setPose] = useState<Record<Cook, Pose> & { hop: Record<Cook, number> }>({ hamad: "idle", talal: "idle", teta: "idle", hop: { hamad: 0, talal: 0, teta: 0 } });
  const [talking, setTalking] = useState<Cook | null>(null);
  const [heard, setHeard] = useState<string[]>([]);
  const target = useRef<HTMLDivElement>(null);
  const cookRef = useRef(-1);
  const step = i >= 0 && i < n ? recipe.steps[i] : undefined;
  const vessel: Vessel = step?.vessel ?? (i >= n ? "plate" : "pot");
  const slot = step?.slot ?? vessel;
  const v = vs[slot] ?? emptyV();
  const [left, right] = recipe.cast ?? ["hamad", "talal"];
  const L = (l: Line) => (lang === "ar" ? l.ar : l.en);

  const talk = useCallback(async (l: Line, who: Cook) => { setTalking(who); await sayLine(l, lang, muted); setTalking(null); }, [lang, muted]);
  const react = (who: Cook, p: Pose = "cheer") => setPose((s) => ({ ...s, [who]: p, hop: { ...s.hop, [who]: s.hop[who] + 1 } }));
  const burst = (fx: Bit["fx"], k: number, img?: string) => {
    const nb: Bit[] = Array.from({ length: k }, () => ({ id: ++uid, x: 25 + Math.random() * 50, y: 20 + Math.random() * 40, fx, ...(img ? { img } : {}) }));
    setBits((b) => [...b, ...nb]); setTimeout(() => setBits((b) => b.filter((x) => !nb.includes(x))), 1600);
  };
  const patch = (fn: (s: VState) => VState, key: string = slot) => setVs((all) => ({ ...all, [key]: fn(all[key] ?? emptyV()) }));

  // speak each step once it appears
  useEffect(() => {
    setCount(0); setAnim(""); setHeat(0); setPose((s) => ({ ...s, hamad: "idle", talal: "idle", teta: "idle" }));
    if (i === -1) void talk(recipe.intro, left);
    else if (step) void talk(step.say, step.who);
    else if (i >= n) { setPose((s) => ({ ...s, [left]: "cheer", [right]: "cheer", hop: { ...s.hop, [left]: s.hop[left] + 1, [right]: s.hop[right] + 1 } })); sfx("chime", muted); burst("spark", 14); void talk(recipe.done, right).then(() => setPose((s) => ({ ...s, [left]: "taste" }))); onDone(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);
  useEffect(() => () => stopVoice(), []);

  const finish = async () => {
    if (!step) return; setBusy(true); sfx("chime", muted); burst("spark", 8); react(step.who);
    if (step.after) { const a = step.after; patch((s) => ({ ...s, ...a })); }
    const other = step.who === left ? right : left; setTimeout(() => react(other), 250);
    const t0 = Date.now(); await talk(step.cheer, step.who);
    await new Promise((r) => setTimeout(r, Math.max(300, 1300 - (Date.now() - t0))));
    setBusy(false); setI((x) => x + 1);
  };

  const tapVessel = () => {
    if (!step || busy) return; const d = step.do; const c = count + 1;
    const need = "taps" in d ? d.taps : 1;
    if (d.kind === "wash") { sfx("splash", muted); burst("bubble", 5); }
    else if (d.kind === "chop") { sfx("chop", muted); burst("chip", 3, d.item); }
    else if (d.kind === "stir") { sfx("plop", muted); setAnim(""); requestAnimationFrame(() => setAnim("k-stirring")); burst("bubble", 3); setPose((s) => ({ ...s, [step.who]: "stir" })); }
    else if (d.kind === "knead" || d.kind === "roll") { sfx("squish", muted); react(step.who, "stir"); }
    else if (d.kind === "sprinkle") { sfx("whoosh", muted); patch((s) => ({ ...s, scatter: [...s.scatter, ...Array.from({ length: DOTS[d.item] ? 18 : 4 }, () => ({ img: d.item, x: 25 + Math.random() * 45, y: 15 + Math.random() * 35, r: Math.random() * 360 }))] })); }
    else if (d.kind === "flip") { sfx("whoosh", muted); setBusy(true); setAnim("[animation:k-flip_.9s_ease-in-out_both]"); setTimeout(() => { setBusy(false); setI((x) => x + 1); }, 1000); setVs((a) => ({ ...a, plate: emptyV() })); react("hamad"); react("talal"); void talk(step.cheer, step.who); return; }
    else if (d.kind === "serve") { sfx("plop", muted); setServed(true); }
    else if (d.kind === "lift") { sfx("whoosh", muted); burst("spark", 1, d.show); patch((s) => ({ ...s, layers: s.layers.filter((l) => l !== d.item) })); react(step.who); }
    else return;
    setCount(c); if (c >= need) void finish();
  };

  const dropItem = () => {
    if (!step || busy) return; const d = step.do;
    if (d.kind === "add") { sfx("plop", muted); patch((s) => ({ ...s, layers: [...s.layers, d.into ?? d.item] })); void finish(); }
    if (d.kind === "transfer") { sfx("sizzle", muted); burst("steam", 4); setVs((all) => ({ ...all, [d.from]: emptyV(), [slot]: { ...(all[slot] ?? emptyV()), layers: [...(all[slot]?.layers ?? []), d.item] } })); void finish(); }
    if (d.kind === "pour") { sfx("splash", muted); setBusy(true); setAnim("pour"); setTimeout(() => { patch((s) => ({ ...s, liquid: d.color })); setAnim(""); setBusy(false); void finish(); }, 1300); }
  };

  const light = () => {
    // cookRef guards double-taps: heat only updates on the first tick, so a quick second tap used to start a second timer and skip a step
    if (!step || step.do.kind !== "cook" || heat || busy || cookRef.current === i) return;
    cookRef.current = i; setHeat(0.01);
    const secs = step.do.seconds, mode = step.do.mode, during = step.do.during; sfx("sizzle", muted);
    if (during) patch((s) => ({ ...s, art: during })); setPose((s) => ({ ...s, [step.who]: "stir" }));
    const t0 = Date.now();
    const tick = setInterval(() => {
      const p = Math.min(1, (Date.now() - t0) / (secs * 1000)); setHeat(Math.max(0.01, p));
      burst(mode === "fry" ? "spark" : "steam", mode === "bake" ? 1 : 2); if (mode !== "bake") burst("bubble", 1);
      if (Math.random() < 0.3) sfx(mode === "simmer" ? "plop" : "sizzle", muted);
      if (p >= 1) { clearInterval(tick); patch((s) => ({ ...s, cooked: true })); void finish(); }
    }, 450);
  };

  const d = step?.do;
  const tapKinds = ["wash", "chop", "stir", "knead", "roll", "sprinkle", "flip", "serve", "lift"];
  const tapping = !!d && tapKinds.includes(d.kind);
  const progress = d && "taps" in d ? count / d.taps : heat;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* progress dots */}
      <div className={`flex justify-center px-4 pt-1 ${n > 14 ? "gap-1" : "gap-1.5"}`} aria-hidden>
        {recipe.steps.map((_, k) => <span key={k} className={`${n > 14 ? "h-2" : "h-2.5"} rounded-full transition-all ${k < i ? `${n > 14 ? "w-2" : "w-2.5"} bg-success` : k === i ? "w-6 bg-primary" : `${n > 14 ? "w-2" : "w-2.5"} bg-card/80`}`} />)}
      </div>

      {/* instruction bubble */}
      <div className="mx-auto mt-2 w-[min(92%,640px)] rounded-3xl border-2 border-foreground/10 bg-card/95 px-4 py-3 text-center shadow-lg" dir={lang === "ar" ? "rtl" : "ltr"}>
        <p className={`font-black text-foreground ${lang === "ar" ? "text-2xl leading-relaxed sm:text-3xl" : "text-xl sm:text-2xl"}`}>
          {i === -1 ? L(recipe.name) : step ? L(step.say) : L(recipe.done)}
        </p>
      </div>

      {/* stage */}
      <div className="relative mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-[18%] sm:px-[20%]">
        {i === -1 ? (
          <div className="grid w-full grid-cols-3 gap-2 sm:gap-4">
            {recipe.ingredients.map((id) => (
              <button key={id} type="button" onClick={() => { setHeard((h) => h.includes(id) ? h : [...h, id]); sfx("plop", muted); void talk(ingName(id), heard.length % 2 ? "talal" : "hamad"); }}
                className={`k-drop flex flex-col items-center rounded-3xl bg-card/85 p-2 shadow-md transition active:scale-95 ${heard.includes(id) ? "ring-4 ring-success" : ""}`}>
                <img src={kart(id)} alt="" className="h-16 w-16 object-contain sm:h-24 sm:w-24" draggable={false} />
                <span className="text-sm font-black sm:text-lg">{L(ingName(id))}</span>
              </button>
            ))}
          </div>
        ) : (
          <div ref={target} role={tapping ? "button" : undefined} aria-label={step ? L(step.say) : undefined} onClick={tapping ? tapVessel : undefined}
            className={`relative w-full touch-manipulation select-none ${tapping ? "cursor-pointer" : ""} ${vessel === "dough" && heat ? "rounded-3xl shadow-[0_0_60px_20px_oklch(0.75_0.18_50/.6)]" : ""}`}>
            <div className={anim === "k-stirring" ? "[animation:k-wiggle_.4s]" : anim.startsWith("[") ? anim : ""}>
              <VesselArt vessel={vessel} recipe={recipe} v={v} step={step} count={count} heat={heat > 0 && (vessel === "pot" || vessel === "pan")} anim="" served={served} />
            </div>
            {d?.kind === "stir" && <span key={count} className="pointer-events-none absolute left-1/2 top-[8%] text-6xl" style={{ animation: "k-wiggle .4s" }} aria-hidden>🥄</span>}
            {vessel === "tray" && heat > 0 && <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[0_0_70px_24px_oklch(0.75_0.18_50/.6)]" />}
            {anim === "pour" && d?.kind === "pour" && (
              <div className="pointer-events-none absolute left-[46%] -top-[34%] z-30">
                <img src={kart(d.item)} alt="" className="h-24 w-24 origin-bottom-left object-contain sm:h-32 sm:w-32" style={{ animation: "k-tilt .5s ease-out both" }} />
                <div className="absolute left-[18%] top-[70%] h-40 w-3 origin-top rounded-full" style={{ background: d.color, animation: "k-pour .4s .45s ease-in both" }} />
              </div>
            )}
            {bits.map((b) => (
              <span key={b.id} className="pointer-events-none absolute z-30" style={{ left: `${b.x}%`, top: `${b.y}%`, animation: `${b.fx === "bubble" ? "k-bubble" : b.fx === "steam" ? "k-steam" : b.fx === "spark" ? "k-spark" : "k-fall"} 1.4s ease-out both` }}>
                {b.img ? <img src={kart(b.img)} alt="" className={`${b.fx === "spark" ? "h-24 w-24" : "h-8 w-8"} object-contain`} style={{ animation: b.fx === "spark" ? "k-lift 1.4s ease-out both" : "k-spark 1s both" }} />
                  : b.fx === "bubble" ? <span className="block h-4 w-4 rounded-full border-2 border-card bg-card/40" />
                  : b.fx === "steam" ? <span className="block h-10 w-10 rounded-full bg-card/70 blur-md" />
                  : <span className="text-2xl">✨</span>}
              </span>
            ))}
            {tapping && !busy && count === 0 && d?.kind !== "flip" && <span className="k-hint pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 text-5xl" aria-hidden>👆</span>}
          </div>
        )}
      </div>

      {/* tray: the one thing to use now */}
      <div className="relative z-30 flex min-h-36 items-center justify-center gap-4 pb-4">
        {i === -1 && (
          <button type="button" onClick={() => setI(0)} className={`k-glow whitespace-nowrap rounded-full bg-primary py-4 text-3xl ${recipe.video ? "px-7" : "px-10"} font-black text-primary-foreground shadow-[0_6px_0_var(--sun-shadow)] active:translate-y-1`}>
            {lang === "ar" ? "هَيّا نَطْبُخ" : "Let's cook"} ▶
          </button>
        )}
        {i === -1 && recipe.video && (
          <button type="button" onClick={() => { stopVoice(); setFilm(true); }} aria-label={lang === "ar" ? "شوف تيتا" : "Watch Teta"}
            className="relative h-16 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-card shadow-lg active:scale-95">
            {recipe.video.poster && <img src={recipe.video.poster} alt="" className="absolute inset-0 h-full w-full object-cover" />}
            <span className="absolute inset-0 grid place-items-center bg-foreground/25 text-3xl text-card" aria-hidden>▶</span>
          </button>
        )}
        {d && (d.kind === "add" || d.kind === "pour") && !busy && anim !== "pour" && <DragItem key={i} img={kart(d.item)} label={L(ingName(d.item))} target={target} onDrop={dropItem} />}
        {d?.kind === "transfer" && !busy && <DragItem key={i} img="" label={L(step!.say)} target={target} onDrop={dropItem}><div className="relative h-full w-full">{vs[d.from]?.art ? <img src={kart(vs[d.from]!.art!)} alt="" draggable={false} className="h-full w-full object-contain" /> : <PanArt v={vs[d.from] ?? emptyV()} heat={false} />}</div></DragItem>}
        {d?.kind === "sprinkle" && <img src={kart(d.item)} alt="" className="h-20 w-20 object-contain k-hint" />}
        {d?.kind === "cook" && (
          <button type="button" data-k="act" onClick={light} disabled={heat > 0} aria-label={L(step!.say)}
            className={`relative h-24 w-24 rounded-full border-4 border-card bg-destructive text-5xl shadow-[0_6px_0_var(--danger-shadow)] active:translate-y-1 ${heat ? "" : "k-glow"}`}>
            {d.mode === "bake" ? "♨️" : "🔥"}
          </button>
        )}
        {(progress > 0 && progress < 1) && <div className="absolute bottom-1 left-1/2 h-3 w-48 -translate-x-1/2 overflow-hidden rounded-full bg-card/70"><div className="h-full bg-success transition-all" style={{ width: `${progress * 100}%` }} /></div>}
      </div>

      {film && recipe.video && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/80 p-3" onClick={() => setFilm(false)}>
          <video poster={recipe.video.poster} autoPlay playsInline controls muted={muted} onEnded={() => setFilm(false)}
            className="max-h-[80dvh] w-full max-w-3xl rounded-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <source src={recipe.video.src} type="video/mp4" />
            {recipe.video.webm && <source src={recipe.video.webm} type="video/webm" />}
          </video>
          <button type="button" onClick={() => setFilm(false)} aria-label="Close" className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] grid h-12 w-12 place-items-center rounded-full bg-card text-2xl font-black shadow-lg">✕</button>
        </div>
      )}
      <Buddy who={left} side="left" pose={pose[left]} hop={pose.hop[left]} talking={talking === left} />
      <Buddy who={right} side="right" pose={pose[right]} hop={pose.hop[right]} talking={talking === right} />
    </div>
  );
}

export { COOK_RECIPES };
