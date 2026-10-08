import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { CLUES, PRAISE, SEEK_SCENES, type SeekMode, type SeekObject, type SeekScene } from "@/data/seekWorld";
import { kart } from "@/data/kitchenRecipes";
import { playSeek, preloadSeek, stopSeek, type Piece } from "@/lib/seekAudio";

const KEY = "seek-find-v1";
type Save = { found: string[]; scenes: string[]; challenges: number; stars: number };
const load = (): Save => { try { return { found: [], scenes: [], challenges: 0, stars: 0, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return { found: [], scenes: [], challenges: 0, stars: 0 }; } };
const store = (s: Save) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ } };
const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
const SET = 6;
const MODES: { id: SeekMode; icon: string }[] = [{ id: "find", icon: "🔎" }, { id: "listen", icon: "👂" }, { id: "describe", icon: "💭" }, { id: "color", icon: "🎨" }];

type Challenge = { targets: string[]; prompt: Piece[]; label: string; reveal: (o: SeekObject) => Piece[] };

function nameOf(o: SeekObject): Piece { return o.nameClip ? { url: o.nameClip, text: o.ar } : { text: o.ar }; }
function askOf(o: SeekObject): Piece[] { return o.ask ? [{ sprite: o.ask }] : [{ sprite: "wenha" }, nameOf(o)]; }

function makeChallenges(scene: SeekScene, mode: SeekMode): Challenge[] {
  const objs = scene.objects;
  if (mode === "find" || mode === "listen") {
    return shuffle(objs).slice(0, SET).map((o) => ({
      targets: [o.id], label: mode === "find" ? `وين ${o.ar}؟` : o.ar,
      prompt: mode === "find" ? askOf(o) : [nameOf(o)],
      reveal: () => [nameOf(o)],
    }));
  }
  const pool = CLUES[mode].filter((c) => objs.some(c.match));
  return shuffle(pool).concat(shuffle(pool)).slice(0, SET).map((c) => ({
    targets: objs.filter(c.match).map((o) => o.id), label: c.ar, prompt: [{ text: c.ar }],
    reveal: (o) => [nameOf(o)],
  }));
}

export function SeekAndFind({ onExit }: { onExit: () => void }) {
  const [scene, setScene] = useState<SeekScene | null>(null);
  useEffect(() => { preloadSeek(); return () => stopSeek(); }, []);
  if (!scene) return <ScenePicker onExit={onExit} onPick={setScene} />;
  return <SeekPlay scene={scene} onBack={() => { stopSeek(); setScene(null); }} />;
}

function ScenePicker({ onExit, onPick }: { onExit: () => void; onPick: (s: SeekScene) => void }) {
  const save = useMemo(load, []);
  return (
    <main className="mx-auto min-h-screen max-w-3xl p-4" dir="rtl">
      <div className="flex items-center justify-between">
        <GameButton tone="neutral" className="h-12 w-12 rounded-full p-0" onClick={onExit} aria-label="Back"><ArrowLeft className="h-6 w-6 rotate-180" /></GameButton>
        <span className="rounded-full bg-card px-4 py-1 text-lg font-black shadow-sm">⭐ {save.stars}</span>
      </div>
      <div className="my-6 flex items-end justify-center gap-3">
        <img src={kart("cast/hamad-idle")} alt="" className="k-breathe h-28 object-contain -scale-x-100" />
        <div className="text-center">
          <span className="text-6xl">🔎</span>
          <h1 lang="ar" className="font-arabic text-4xl font-black">أَدُوِّر وَأَلَاقِي</h1>
        </div>
        <img src={kart("cast/talal-idle")} alt="" className="k-breathe h-28 object-contain" style={{ animationDelay: "1s" }} />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SEEK_SCENES.map((s) => (
          <GameButton key={s.id} tone={s.ready ? "sun" : "neutral"} disabled={!s.ready} className="relative flex min-h-36 flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl p-3"
            onClick={() => { void playSeek([{ sprite: "intro" }, { sprite: "ready" }]); onPick(s); }} aria-label={s.en}>
            {s.bg && <img src={s.bg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />}
            <span className="relative text-5xl">{s.icon}</span>
            <span lang="ar" className="relative font-arabic text-2xl font-black">{s.ar}</span>
            {!s.ready && <span className="relative text-xs font-bold opacity-70">قَرِيبًا</span>}
            {save.scenes.includes(s.id) && <span className="absolute left-2 top-2 rounded-full bg-card px-2 text-sm">✓</span>}
          </GameButton>
        ))}
      </div>
    </main>
  );
}

type Fx = { id: number; x: number; y: number; ok: boolean };

function SeekPlay({ scene, onBack }: { scene: SeekScene; onBack: () => void }) {
  const [mode, setMode] = useState<SeekMode>("find");
  const [list, setList] = useState(() => makeChallenges(scene, "find"));
  const [idx, setIdx] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const [fx, setFx] = useState<Fx[]>([]);
  const [busy, setBusy] = useState(false);
  const [cheer, setCheer] = useState(false);
  const [party, setParty] = useState(false);
  const [muted, setMuted] = useState(false);
  const [view, setView] = useState({ s: 1, x: 0, y: 0 });
  const wrap = useRef<HTMLDivElement>(null);
  const ptrs = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ moved: 0, dist: 0, sx: 0, sy: 0, vs: 1, vx: 0, vy: 0 });
  const fxId = useRef(0);
  const ch = list[idx];

  const say = (p: Piece[]) => { if (!muted) return playSeek(p); stopSeek(); return Promise.resolve(); };

  useEffect(() => {
    const s = load(); if (!s.scenes.includes(scene.id)) store({ ...s, scenes: [...s.scenes, scene.id] });
  }, [scene.id]);
  useEffect(() => { if (ch && !party) { const t = setTimeout(() => void say(ch.prompt), idx === 0 ? 2600 : 300); return () => clearTimeout(t); } return undefined; }, [ch, party]); // eslint-disable-line react-hooks/exhaustive-deps

  const newSet = (m: SeekMode) => { setMode(m); setList(makeChallenges(scene, m)); setIdx(0); setParty(false); setBusy(false); };

  const clamp = (v: { s: number; x: number; y: number }) => {
    const r = wrap.current?.getBoundingClientRect(); const s = Math.min(3, Math.max(1, v.s));
    if (!r) return { s, x: 0, y: 0 };
    const mx = (r.width * (s - 1)) / 2, my = (r.height * (s - 1)) / 2;
    return { s, x: Math.min(mx, Math.max(-mx, v.x)), y: Math.min(my, Math.max(-my, v.y)) };
  };

  const down = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current; g.moved = ptrs.current.size > 1 ? 99 : 0; g.sx = e.clientX; g.sy = e.clientY; g.vs = view.s; g.vx = view.x; g.vy = view.y;
    if (ptrs.current.size === 2) { const [a, b] = [...ptrs.current.values()]; g.dist = Math.hypot(a!.x - b!.x, a!.y - b!.y); }
  };
  const move = (e: React.PointerEvent) => {
    if (!ptrs.current.has(e.pointerId)) return;
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (ptrs.current.size === 2) { const [a, b] = [...ptrs.current.values()]; setView(clamp({ s: g.vs * (Math.hypot(a!.x - b!.x, a!.y - b!.y) / (g.dist || 1)), x: g.vx, y: g.vy })); return; }
    const dx = e.clientX - g.sx, dy = e.clientY - g.sy; g.moved = Math.max(g.moved, Math.hypot(dx, dy));
    if (g.moved > 10 && view.s > 1) setView(clamp({ s: view.s, x: g.vx + dx, y: g.vy + dy }));
  };
  const up = (e: React.PointerEvent) => {
    const had = ptrs.current.delete(e.pointerId);
    if (!had || gesture.current.moved > 10 || ptrs.current.size > 0) return;
    const img = wrap.current?.querySelector("[data-scene]")?.getBoundingClientRect(); if (!img) return;
    tap(((e.clientX - img.left) / img.width) * 100, ((e.clientY - img.top) / img.height) * 100);
  };
  const wheel = (e: React.WheelEvent) => setView((v) => clamp({ ...v, s: v.s * (e.deltaY < 0 ? 1.15 : 0.87) }));

  const hit = (o: SeekObject, x: number, y: number, pad: number) => o.boxes.some((b) => Math.abs(x - b.x) <= b.w / 2 + pad && Math.abs(y - b.y) <= b.h / 2 + pad);

  function tap(x: number, y: number) {
    if (busy || !ch || party) return;
    const pad = 2.5 / view.s;
    const hitObj = scene.objects.find((o) => ch.targets.includes(o.id) && hit(o, x, y, pad));
    const id = ++fxId.current;
    if (!hitObj) {
      setFx((f) => [...f, { id, x, y, ok: false }]);
      setTimeout(() => setFx((f) => f.filter((q) => q.id !== id)), 900);
      void say([{ sprite: Math.random() < 0.5 ? "wenha" : "dawwer-mneeh" }]);
      return;
    }
    const b = hitObj.boxes.find((q) => Math.abs(x - q.x) <= q.w / 2 + pad && Math.abs(y - q.y) <= q.h / 2 + pad)!;
    setFx((f) => [...f, { id, x: b.x, y: b.y, ok: true }]);
    setTimeout(() => setFx((f) => f.filter((q) => q.id !== id)), 1400);
    setFound((f) => f.includes(hitObj.id) ? f : [...f, hitObj.id]);
    setBusy(true); setCheer(true);
    const s = load(); store({ ...s, found: s.found.includes(`${scene.id}:${hitObj.id}`) ? s.found : [...s.found, `${scene.id}:${hitObj.id}`], challenges: s.challenges + 1 });
    void say([{ sprite: PRAISE[Math.floor(Math.random() * PRAISE.length)]! }, ...ch.reveal(hitObj)]).then(() => {
      setTimeout(() => {
        setCheer(false);
        if (idx + 1 >= list.length) {
          setParty(true); setBusy(false);
          const s2 = load(); store({ ...s2, stars: s2.stars + 1 });
          void say([{ sprite: "mashallah" }, { sprite: "next-round" }]);
        } else { setIdx(idx + 1); setBusy(false); }
      }, 700);
    });
  }

  const foundBoxes = scene.objects.filter((o) => found.includes(o.id));

  return (
    <main className="flex h-[100dvh] flex-col bg-background" dir="rtl">
      <header className="flex items-center gap-2 p-2 pr-16">
        <GameButton tone="neutral" className="h-11 w-11 shrink-0 rounded-full p-0" onClick={onBack} aria-label="Back"><ArrowLeft className="h-5 w-5 rotate-180" /></GameButton>
        <GameButton tone="sun" className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-3" onClick={() => ch && void say(ch.prompt)} aria-label="Hear again">
          <span className="text-2xl">🔎</span><Volume2 className="h-5 w-5" />
          <span lang="ar" className="truncate font-arabic text-base font-bold opacity-70">{party ? "" : ch?.label}</span>
        </GameButton>
        <GameButton tone="neutral" className="h-11 w-11 shrink-0 rounded-full p-0" onClick={() => { setMuted((m) => !m); stopSeek(); }} aria-label={muted ? "Sound on" : "Sound off"}>{muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}</GameButton>
      </header>
      <div className="flex items-center justify-center gap-1 px-2 pb-1">
        {MODES.map((m) => (
          <button key={m.id} onClick={() => newSet(m.id)} aria-label={m.id} className={`h-9 w-11 rounded-full text-xl transition ${mode === m.id ? "bg-primary/20 ring-2 ring-primary" : "opacity-60"}`}>{m.icon}</button>
        ))}
        <span className="mx-2 flex gap-1">{list.map((_, i) => <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < idx || party ? "bg-primary" : i === idx ? "bg-primary/50" : "bg-muted"}`} />)}</span>
      </div>

      <div ref={wrap} className="relative flex-1 touch-none select-none overflow-hidden" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={(e) => ptrs.current.delete(e.pointerId)} onWheel={wheel}
        onDoubleClick={() => setView((v) => clamp(v.s > 1 ? { s: 1, x: 0, y: 0 } : { ...v, s: 2 }))}>
        <div className="flex h-full w-full items-center justify-center transition-transform duration-75" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})` }}>
          <div data-scene className="relative max-h-full w-full" style={{ aspectRatio: String(scene.ratio), maxWidth: `calc((100dvh - 7rem) * ${scene.ratio})` }}>
            <img src={scene.bg} alt="" draggable={false} className="h-full w-full rounded-2xl object-cover" />
            {foundBoxes.flatMap((o) => o.boxes.map((b, i) => (
              <span key={`${o.id}${i}`} className="seek-found pointer-events-none absolute rounded-full" style={{ left: `${b.x - b.w / 2}%`, top: `${b.y - b.h / 2}%`, width: `${b.w}%`, height: `${b.h}%` }} />
            )))}
            {fx.map((f) => f.ok ? (
              <span key={f.id} className="pointer-events-none absolute" style={{ left: `${f.x}%`, top: `${f.y}%` }}>
                {Array.from({ length: 10 }, (_, i) => <span key={i} className="seek-spark absolute text-xl" style={{ "--a": `${i * 36}deg` } as React.CSSProperties}>✨</span>)}
              </span>
            ) : (
              <span key={f.id} className="seek-ripple pointer-events-none absolute h-14 w-14 rounded-full border-4 border-card/80" style={{ left: `${f.x}%`, top: `${f.y}%` }} />
            ))}
          </div>
        </div>

        <img src={kart(`cast/hamad-${cheer || party ? "cheer" : "idle"}`)} alt="" className={`pointer-events-none absolute bottom-1 left-1 h-[16%] max-h-28 object-contain -scale-x-100 ${cheer || party ? "seek-hop" : "k-breathe"}`} />
        <img src={kart(`cast/talal-${cheer || party ? "cheer" : "idle"}`)} alt="" className={`pointer-events-none absolute bottom-1 right-1 h-[16%] max-h-28 object-contain ${cheer || party ? "seek-hop" : "k-breathe"}`} style={{ animationDelay: ".3s" }} />

        {party && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center">
            <div className="flex items-center gap-3 rounded-full bg-card/95 px-4 py-2 shadow-lg">
              <span className="text-3xl">⭐🎉</span>
              <GameButton tone="berry" className="rounded-full px-5 text-2xl" onClick={() => { newSet(mode); void say([{ sprite: "again" }]); }} aria-label="Play again">🔁</GameButton>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
