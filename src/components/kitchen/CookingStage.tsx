import { useCallback, useEffect, useRef, useState, type PointerEvent as RPE, type ReactNode } from "react";
import { COOK_RECIPES, ING_NAME, kart, type Line, type Recipe, type Step, type Vessel } from "@/data/kitchenRecipes";
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
function Buddy({ who, pose, hop, talking, side }: { who: "hamad" | "talal"; pose: Pose; hop: number; talking: boolean; side: "left" | "right" }) {
  const src = kart(`cast/${who}-${pose === "taste" && who === "hamad" ? "cheer" : pose}`);
  return (
    <div className={`pointer-events-none absolute bottom-2 z-20 h-[24%] min-h-28 max-h-64 ${side === "left" ? "left-1 sm:left-6" : "right-1 sm:right-6"}`}>
      <div key={hop} className={`h-full ${hop ? "k-hop" : ""}`}>
        <img src={src} alt={who === "hamad" ? "حمد" : "طلال"} draggable={false}
          className={`h-full w-auto object-contain drop-shadow-[0_6px_8px_oklch(0.2_0.03_60/.35)] ${talking ? "k-talk" : "k-breathe"} ${side === "right" ? "" : "-scale-x-100"}`}
          style={{ animationDelay: side === "left" ? "0s" : "1.1s" }} />
      </div>
    </div>
  );
}

/* ---------- draggable ingredient / tool ---------- */
function DragItem({ img, label, target, onDrop }: { img: string; label: string; target: React.RefObject<HTMLDivElement | null>; onDrop: () => void }) {
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
      <img src={img} alt="" draggable={false} className={`h-24 w-24 object-contain sm:h-32 sm:w-32 ${d ? "" : "k-glow"}`} />
      {!d && <span className="k-hint absolute -top-7 left-1/2 -translate-x-1/2 text-3xl" aria-hidden>👇</span>}
    </button>
  );
}

/* ---------- the vessel scene ---------- */
const DOTS: Record<string, string> = { zaatar: "oklch(0.48 0.09 125)", sumac: "oklch(0.42 0.14 20)", sesame: "oklch(0.9 0.05 85)" };
type VState = { layers: string[]; scatter: { img: string; x: number; y: number; r: number }[]; liquid?: string; cooked?: boolean };
const emptyV = (): VState => ({ layers: [], scatter: [] });

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
    {step?.do.kind === "wash" && <img key={count} src={kart(step.do.item)} alt="" className="absolute left-[32%] top-[8%] h-[40%] w-[36%] object-contain" style={{ animation: "k-wiggle .4s" }} />}
    {layers}
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
  const [vs, setVs] = useState<Record<string, VState>>({});
  const [bits, setBits] = useState<Bit[]>([]);
  const [heat, setHeat] = useState(0); // 0 off, 0..1 progress
  const [anim, setAnim] = useState("");
  const [served, setServed] = useState(false);
  const [pose, setPose] = useState<{ hamad: Pose; talal: Pose; hop: { hamad: number; talal: number } }>({ hamad: "idle", talal: "idle", hop: { hamad: 0, talal: 0 } });
  const [talking, setTalking] = useState<"hamad" | "talal" | null>(null);
  const [heard, setHeard] = useState<string[]>([]);
  const target = useRef<HTMLDivElement>(null);
  const step = i >= 0 && i < n ? recipe.steps[i] : undefined;
  const vessel: Vessel = step?.vessel ?? (i >= n ? "plate" : "pot");
  const v = vs[vessel] ?? emptyV();
  const L = (l: Line) => (lang === "ar" ? l.ar : l.en);

  const talk = useCallback(async (l: Line, who: "hamad" | "talal") => { setTalking(who); await sayLine(l, lang, muted); setTalking(null); }, [lang, muted]);
  const react = (who: "hamad" | "talal", p: Pose = "cheer") => setPose((s) => ({ ...s, [who]: p, hop: { ...s.hop, [who]: s.hop[who] + 1 } }));
  const burst = (fx: Bit["fx"], k: number, img?: string) => {
    const nb: Bit[] = Array.from({ length: k }, () => ({ id: ++uid, x: 25 + Math.random() * 50, y: 20 + Math.random() * 40, fx, ...(img ? { img } : {}) }));
    setBits((b) => [...b, ...nb]); setTimeout(() => setBits((b) => b.filter((x) => !nb.includes(x))), 1600);
  };
  const patch = (fn: (s: VState) => VState, key: Vessel = vessel) => setVs((all) => ({ ...all, [key]: fn(all[key] ?? emptyV()) }));

  // speak each step once it appears
  useEffect(() => {
    setCount(0); setAnim(""); setHeat(0); setPose((s) => ({ ...s, hamad: "idle", talal: "idle" }));
    if (i === -1) void talk(recipe.intro, "hamad");
    else if (step) void talk(step.say, step.who);
    else if (i >= n) { setPose((s) => ({ hamad: "cheer", talal: "cheer", hop: { hamad: s.hop.hamad + 1, talal: s.hop.talal + 1 } })); sfx("chime", muted); burst("spark", 14); void talk(recipe.done, "talal").then(() => setPose((s) => ({ ...s, talal: "taste" }))); onDone(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);
  useEffect(() => () => stopVoice(), []);

  const finish = async () => {
    if (!step) return; setBusy(true); sfx("chime", muted); burst("spark", 8); react(step.who);
    const other = step.who === "hamad" ? "talal" : "hamad"; setTimeout(() => react(other), 250);
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
    else return;
    setCount(c); if (c >= need) void finish();
  };

  const dropItem = () => {
    if (!step || busy) return; const d = step.do;
    if (d.kind === "add") { sfx("plop", muted); patch((s) => ({ ...s, layers: [...s.layers, d.item] })); void finish(); }
    if (d.kind === "pour") { sfx("splash", muted); setBusy(true); setAnim("pour"); setTimeout(() => { patch((s) => ({ ...s, liquid: d.color })); setAnim(""); setBusy(false); void finish(); }, 1300); }
  };

  const light = () => {
    if (!step || step.do.kind !== "cook" || heat || busy) return;
    const secs = step.do.seconds, mode = step.do.mode; sfx("sizzle", muted); setPose((s) => ({ ...s, hamad: "stir" }));
    const t0 = Date.now();
    const tick = setInterval(() => {
      const p = Math.min(1, (Date.now() - t0) / (secs * 1000)); setHeat(Math.max(0.01, p));
      burst(mode === "fry" ? "spark" : "steam", mode === "bake" ? 1 : 2); if (mode !== "bake") burst("bubble", 1);
      if (Math.random() < 0.3) sfx(mode === "simmer" ? "plop" : "sizzle", muted);
      if (p >= 1) { clearInterval(tick); patch((s) => ({ ...s, cooked: true })); void finish(); }
    }, 450);
  };

  const d = step?.do;
  const tapKinds = ["wash", "chop", "stir", "knead", "roll", "sprinkle", "flip", "serve"];
  const tapping = !!d && tapKinds.includes(d.kind);
  const progress = d && "taps" in d ? count / d.taps : heat;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* progress dots */}
      <div className="flex justify-center gap-1.5 px-4 pt-1" aria-hidden>
        {recipe.steps.map((_, k) => <span key={k} className={`h-2.5 rounded-full transition-all ${k < i ? "w-2.5 bg-success" : k === i ? "w-6 bg-primary" : "w-2.5 bg-card/80"}`} />)}
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
              <VesselArt vessel={vessel} recipe={recipe} v={v} step={step} count={count} heat={heat > 0 && vessel === "pot"} anim="" served={served} />
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
                {b.img ? <img src={kart(b.img)} alt="" className="h-8 w-8 object-contain" style={{ animation: "k-spark 1s both" }} />
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
      <div className="relative z-30 flex min-h-36 items-center justify-center gap-6 pb-4">
        {i === -1 && (
          <button type="button" onClick={() => setI(0)} className="k-glow rounded-full bg-primary px-10 py-4 text-3xl font-black text-primary-foreground shadow-[0_6px_0_var(--sun-shadow)] active:translate-y-1">
            {lang === "ar" ? "هَيّا نَطْبُخ" : "Let's cook"} ▶
          </button>
        )}
        {d && (d.kind === "add" || d.kind === "pour") && !busy && anim !== "pour" && <DragItem key={i} img={kart(d.item)} label={L(ingName(d.item))} target={target} onDrop={dropItem} />}
        {d?.kind === "sprinkle" && <img src={kart(d.item)} alt="" className="h-20 w-20 object-contain k-hint" />}
        {d?.kind === "cook" && (
          <button type="button" data-k="act" onClick={light} disabled={heat > 0} aria-label={L(step!.say)}
            className={`relative h-24 w-24 rounded-full border-4 border-card bg-destructive text-5xl shadow-[0_6px_0_var(--danger-shadow)] active:translate-y-1 ${heat ? "" : "k-glow"}`}>
            {d.mode === "bake" ? "♨️" : "🔥"}
          </button>
        )}
        {(progress > 0 && progress < 1) && <div className="absolute bottom-1 left-1/2 h-3 w-48 -translate-x-1/2 overflow-hidden rounded-full bg-card/70"><div className="h-full bg-success transition-all" style={{ width: `${progress * 100}%` }} /></div>}
      </div>

      <Buddy who="hamad" side="left" pose={pose.hamad} hop={pose.hop.hamad} talking={talking === "hamad"} />
      <Buddy who="talal" side="right" pose={pose.talal} hop={pose.hop.talal} talking={talking === "talal"} />
    </div>
  );
}

export { COOK_RECIPES };
