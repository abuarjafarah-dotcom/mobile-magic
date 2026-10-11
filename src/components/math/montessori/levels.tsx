// Bead Garden levels — all built from the shared materials + manipulation system.
import { useMemo, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { GameButton } from "@/components/game/GameButton";
import type { LearningLanguage } from "@/lib/learningLanguage";
import { cn } from "@/lib/utils";
import cube2 from "@/assets/montessori/cube2.png";
import cube3 from "@/assets/montessori/cube3.png";
import cube4 from "@/assets/montessori/cube4.png";
import cube5 from "@/assets/montessori/cube5.png";
import { Layers, Box } from "lucide-react";
import { AgainIcon, Apple, Chain, DragLayer, Draggable, EquationWork, Hint, IconBtn, NextIcon, WoodEquation, WoodNum, WoodOp, Zone, appleSrc, chainBeadSrc, flowerSrc, sayNum, sayText, successSound, t, useBeadSize, useWorkMat, type Token } from "./materials";

type LevelProps = { lang: LearningLanguage; grow: () => void };
const shuffle = <T,>(a: T[]) => { const c = [...a]; for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [c[i], c[j]] = [c[j]!, c[i]!]; } return c; };
/** Instructions are spoken (Hamad & Talal can't read yet); the small text is for grown-ups. */
const Note = ({ children, lang }: { children: string; lang: LearningLanguage }) => <Hint lang={lang} text={children} />;
const Done = () => <span className="text-3xl font-black text-success">✓</span>;

function Picker({ values, value, onChange, render }: { values: number[]; value: number; onChange: (n: number) => void; render?: (n: number) => React.ReactNode }) {
  return (
    <div dir="ltr" className="flex flex-wrap justify-center gap-1.5">
      {values.map((v) => (
        <button key={v} type="button" onClick={() => onChange(v)} className={cn("min-h-11 min-w-11 rounded-full px-2 text-base font-black shadow-sm", v === value ? "bg-primary text-primary-foreground" : "bg-card")}>{render ? render(v) : v}</button>
      ))}
    </div>
  );
}
/** Step dots: a picture or number per step; the step's name is spoken on tap. */
function Steps({ steps, value, onChange, lang, icons }: { steps: [string, string][]; value: number; onChange: (i: number) => void; lang: LearningLanguage; icons?: React.ReactNode[] }) {
  return (
    <div dir="ltr" className="flex flex-wrap items-center justify-center gap-2">
      {steps.map(([ar, en], i) => (
        <button key={i} type="button" aria-label={t(lang, ar, en)} title={t(lang, ar, en)} onClick={() => { onChange(i); sayText(lang, ar, en); }}
          className={cn("grid h-11 min-w-11 place-items-center rounded-full px-2 text-lg font-black shadow-sm transition-transform", i === value ? "scale-110 bg-secondary text-secondary-foreground ring-4 ring-secondary/40" : i < value ? "bg-success/25" : "bg-card")}>
          {icons?.[i] ?? i + 1}
        </button>
      ))}
    </div>
  );
}

// ================= LEVEL 1 — chain multiples =================
const L1_STEPS: [string, string][] = [["مع دليل", "Guided"], ["أكمل", "Recall"], ["رتّب", "Scattered"], ["وحدك", "On your own"], ["المعادلة", "Equation"]];
export function ChainMultiples({ lang, grow }: LevelProps) {
  const [c, setC] = useState(4);
  const [stage, setStage] = useState(0);
  const [k, setK] = useState(0);
  return (
    <div className="grid gap-3">
      <Picker values={[2, 3, 4, 5, 6, 7, 8, 9, 10]} value={c} onChange={(n) => { setC(n); setK((x) => x + 1); sayNum(n, lang); }} render={(n) => <span className="grid justify-items-center gap-0.5 py-1"><span className="text-sm leading-none">{n}</span><Chain n={n} bead={7} /></span>} />
      <Steps steps={L1_STEPS} value={stage} onChange={(s) => { setStage(s); setK((x) => x + 1); }} lang={lang} icons={[1, 2, 3, 4, <WoodOp key="eq" op="=" size={26} />]} />
      <ChainWork key={`${c}-${stage}-${k}`} c={c} stage={stage} lang={lang} grow={grow} onNext={() => setStage((s) => Math.min(4, s + 1))} />
    </div>
  );
}

function ChainWork({ c, stage, lang, grow, onNext }: LevelProps & { c: number; stage: number; onNext: () => void }) {
  const marks = useMemo(() => Array.from({ length: 10 }, (_, i) => c * (i + 1)), [c]);
  const [placed, setPlaced] = useState<Set<number>>(() => {
    if (stage === 1) { const missing = new Set(shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, 4)); return new Set(marks.filter((_, i) => !missing.has(i + 1))); }
    if (stage === 4) return new Set(marks);
    return new Set();
  });
  const [laid, setLaid] = useState(stage === 3 ? 0 : 10);
  const [m, setM] = useState(6);
  const [built, setBuilt] = useState(false);
  const B = useBeadSize();
  const order = useMemo(() => (stage === 0 ? marks : shuffle(marks)), [marks, stage]);
  const complete = stage < 4 && placed.size === 10 && laid === 10;
  const reported = useRef(false);
  if (complete && !reported.current) { reported.current = true; setTimeout(() => { successSound(); grow(); }, 200); }

  const mat = useWorkMat((p, z) => {
    if (p.kind === "chain") { if (z !== "board" || laid >= 10) return false; setLaid(laid + 1); sayNum(c * (laid + 1), lang); return true; }
    if (p.kind === "mark") {
      const v = Number(p.value);
      if (z === "tray") { if (p.from) { setPlaced((s) => { const n = new Set(s); n.delete(v); return n; }); return true; } return false; }
      if (z !== `stop-${v}` || placed.has(v)) return false;
      setPlaced((s) => new Set(s).add(v)); sayNum(v, lang); return true;
    }
    return false;
  });

  return (
    <div className="grid gap-3">
      <Note lang={lang}>{stage === 3 && laid < 10 ? t(lang, `مدّ سلسلة الـ${c} قطعة قطعة`, `Lay out the ${c}-chain, one length at a time`) : stage === 4 ? t(lang, "اختر نقطة توقف، ثم ابنِ المعادلة", "Tap a stopping point, then build its equation") : t(lang, "ضع كل رقم عند نقطة توقفه", "Place each numeral at its stopping point")}</Note>
      <Zone mat={mat} id="board" className="rounded-3xl border-4 border-amber-900/25 bg-amber-100/70 p-3 shadow-inner">
        <div dir="ltr" className="flex flex-wrap items-end justify-center gap-x-1 gap-y-3">
          {marks.slice(0, laid).map((v, i) => (
            <div key={v} className={cn("flex items-end gap-1", stage === 4 && i >= m && "opacity-40")}>
              <span className="mb-4"><Chain n={c} bead={B} /></span>
              <Zone mat={mat} id={`stop-${v}`} className="grid h-[58px] w-11 place-items-center rounded-lg" onTap={stage === 4 ? () => { setM(i + 1); setBuilt(false); sayNum(v, lang); } : undefined}>
                {placed.has(v)
                  ? stage === 4 ? <span className={cn("rounded-lg", i + 1 === m && "ring-4 ring-success")}><WoodNum n={v} size={42} /></span>
                    : <Draggable mat={mat} piece={{ id: `m${v}`, kind: "mark", value: v, from: "stop" }}><WoodNum n={v} size={42} /></Draggable>
                  : <span className="grid h-full w-full place-items-center rounded-lg border-2 border-dashed border-amber-900/30">{stage === 0 && <WoodNum n={v} size={34} faint />}</span>}
              </Zone>
            </div>
          ))}
          {laid === 0 && <span className="py-8 text-4xl text-muted-foreground">⬇</span>}
        </div>
      </Zone>
      {stage < 4 && !complete && (
        <Zone mat={mat} id="tray" className="flex min-h-20 flex-wrap items-end justify-center gap-2 rounded-2xl bg-card/75 p-2">
          {stage === 3 && laid < 10 && <Draggable mat={mat} piece={{ id: "chain", kind: "chain", value: c }}><span className="p-2"><Chain n={c} bead={B} /></span></Draggable>}
          {order.filter((v) => !placed.has(v) && (stage !== 3 || v <= c * laid)).map((v) => (
            <Draggable key={v} mat={mat} piece={{ id: `t${v}`, kind: "mark", value: v }}><WoodNum n={v} size={44} /></Draggable>
          ))}
        </Zone>
      )}
      {complete && (
        <div className="grid justify-items-center gap-2 animate-pop-in">
          <Done />
          <IconBtn label={t(lang, "الخطوة التالية", "Next step")} onClick={onNext}><NextIcon /></IconBtn>
        </div>
      )}
      {stage === 4 && (
        <div className="grid gap-2">
          <div dir="ltr" className="flex items-center justify-center gap-2"><WoodNum n={m} size={40} /><WoodOp op="×" size={34} /><Chain n={c} bead={Math.round(B * 0.7)} /></div>
          {built ? <div className="grid justify-items-center"><WoodEquation tokens={[c, "×", m, "=", c * m]} /></div>
            : <EquationWork key={`${c}-${m}`} tokens={[c, "×", m, "=", c * m]} extras={[c * m + c, "÷"]} lang={lang} onDone={() => { grow(); setBuilt(true); }} />}
        </div>
      )}
      <DragLayer mat={mat} />
    </div>
  );
}

// ================= LEVELS 2 & 3 — factor families and sharing =================
type Fam = { tokens: Token[] };
function family(T: number, g: number, s: number, share: boolean): Fam[] {
  const list: Token[][] = share
    ? [[T, "÷", s, "=", g], [s, "×", g, "=", T], [g, "×", s, "=", T], [T, "÷", g, "=", s]]
    : [[g, "×", s, "=", T], [s, "×", g, "=", T], [T, "÷", g, "=", s], [T, "÷", s, "=", g]];
  const seen = new Set<string>();
  return list.filter((x) => { const k = x.join(); if (seen.has(k)) return false; seen.add(k); return true; }).map((tokens) => ({ tokens }));
}

const SHARES: [number, number][] = [[12, 2], [12, 3], [20, 4], [24, 4], [24, 6], [30, 5], [36, 6]];
export function FactorFamilies({ lang, grow, share }: LevelProps & { share?: boolean }) {
  const [T, setT] = useState(24);
  const [sIdx, setSIdx] = useState(3);
  const [k, setK] = useState(0);
  const [found, setFound] = useState<Record<number, string[]>>({});
  const [common, setCommon] = useState(false);
  const total = share ? SHARES[sIdx]![0] : T;
  return (
    <div className="grid gap-3">
      {share
        ? <Picker values={SHARES.map((_, i) => i)} value={sIdx} onChange={(i) => { setSIdx(i); setK((x) => x + 1); }} render={(i) => <span dir="ltr">{SHARES[i]![0]}·{SHARES[i]![1]}</span>} />
        : (
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              <GameButton tone={!common ? "sky" : "neutral"} aria-label={t(lang, "مجموعات متساوية", "Equal groups")} className="grid min-h-14 place-items-center" onClick={() => { setCommon(false); sayText(lang, "مجموعات متساوية", "Equal groups"); }}>
                <span className="flex gap-2">{[0, 1, 2].map((g) => <span key={g} className="flex gap-0.5 rounded-lg bg-amber-100/80 p-1">{[0, 1].map((a) => <Apple key={a} size={16} />)}</span>)}</span>
              </GameButton>
              <GameButton tone={common ? "sky" : "neutral"} aria-label={t(lang, "أين تلتقي السلسلتان؟", "Where chains meet")} className="grid min-h-14 place-items-center" onClick={() => { setCommon(true); sayText(lang, "أين تلتقي السلسلتان؟", "Where do the chains meet?"); }}>
                <span className="grid justify-items-start gap-0.5"><Chain n={3} reps={2} bead={8} /><Chain n={2} reps={3} bead={8} /></span>
              </GameButton>
            </div>
            {!common && <Picker values={[12, 18, 24, 36]} value={T} onChange={(n) => { setT(n); setK((x) => x + 1); }} />}
          </div>
        )}
      {!share && !common && (found[T]?.length ?? 0) > 0 && (
        <div dir="ltr" className="flex flex-wrap justify-center gap-2 text-sm font-black">
          {found[T]!.map((f) => <span key={f} className="rounded-full bg-success/20 px-3 py-1">{f}</span>)}
        </div>
      )}
      {common && !share ? <CommonMultiples lang={lang} grow={grow} />
        : <AppleWork key={`${total}-${sIdx}-${k}-${share}`} T={total} size={share ? SHARES[sIdx]![1] : undefined} lang={lang} grow={grow}
            onFound={(g, s) => setFound((f) => ({ ...f, [T]: Array.from(new Set([...(f[T] ?? []), `${g} × ${s}`, `${s} × ${g}`])) }))}
            onAgain={() => setK((x) => x + 1)} />}
    </div>
  );
}

function AppleWork({ T, size, lang, grow, onFound, onAgain }: LevelProps & { T: number; size?: number | undefined; onFound: (g: number, s: number) => void; onAgain: () => void }) {
  const share = size !== undefined;
  const B = useBeadSize();
  const [groups, setGroups] = useState<number[]>(share ? [0] : [0, 0]);
  const pile = T - groups.reduce((a, b) => a + b, 0);
  const equal = pile === 0 && groups.every((x) => x === groups[0]) && groups.length > 0;
  const [phase, setPhase] = useState<"group" | "chain" | "equation">("group");
  const [verified, setVerified] = useState<number | null>(null);
  const [eqI, setEqI] = useState(0);
  const g = groups.length; const s = groups[0] ?? 0;
  const fam = useMemo(() => family(T, g, s, share), [T, g, s, share]);
  const verifiable = [s, g].some((n) => n >= 2 && n <= 10);

  const addTo = (i: number) => {
    if (pile <= 0 || (share && groups[i]! >= size)) return false;
    setGroups((gs) => gs.map((x, k) => (k === i ? x + 1 : x))); return true;
  };
  const mat = useWorkMat((p, z) => {
    if (p.kind === "apple") {
      const from = p.from ? Number(p.from) : null;
      if (z === "pile") { if (from === null) return false; setGroups((gs) => gs.map((x, k) => (k === from ? x - 1 : x))); return true; }
      if (z === "new" && share) { if (from !== null) return false; if (pile <= 0) return false; setGroups((gs) => [...gs, 1]); return true; }
      if (z.startsWith("g-")) {
        const i = Number(z.slice(2)); if (i === from) return false;
        if (share && groups[i]! >= size) return false;
        if (from === null) return addTo(i);
        setGroups((gs) => gs.map((x, k) => (k === i ? x + 1 : k === from ? x - 1 : x))); return true;
      }
      return false;
    }
    if (p.kind === "chain" && z === "verify") {
      const n = Number(p.value);
      if (n !== s && n !== g) return false;
      setVerified(n); sayNum(T, lang); successSound(); return true;
    }
    return false;
  });

  const finishGrouping = () => { onFound(g, s); grow(); setPhase(verifiable ? "chain" : "equation"); sayText(lang, `${g} مجموعات، في كل مجموعة ${s}`, `${g} groups of ${s}`); };

  return (
    <div className="grid gap-3">
      {phase === "group" && (
        <>
          <Note lang={lang}>{share ? t(lang, `شارك ${T} تفاحة في مجموعات من ${size}`, `Share ${T} apples into groups of ${size}`) : t(lang, `هل تستطيع أن تصنع مجموعات متساوية من ${T} تفاحة؟`, `Can you make equal groups with ${T} apples?`)}</Note>
          <Zone mat={mat} id="pile" className="flex min-h-16 flex-wrap justify-center gap-1 rounded-2xl bg-card/70 p-2">
            {Array.from({ length: pile }, (_, i) => <Draggable key={`p${i}`} mat={mat} piece={{ id: `p${i}`, kind: "apple", value: 1 }}><Apple size={36} /></Draggable>)}
            {pile === 0 && <Done />}
          </Zone>
          <div className="flex flex-wrap justify-center gap-2">
            {groups.map((n, i) => (
              <Zone key={i} mat={mat} id={`g-${i}`} onTap={() => addTo(i)} className={cn("relative flex min-h-28 w-32 flex-wrap content-start justify-center gap-0.5 rounded-2xl border-4 border-amber-900/25 bg-amber-100/80 p-1.5 pb-6 shadow-inner", share && n === size && "border-success/60")}>
                {Array.from({ length: n }, (_, a) => <Draggable key={a} mat={mat} piece={{ id: `g${i}-${a}`, kind: "apple", value: 1, from: String(i) }}><Apple size={26} /></Draggable>)}
                <span className="absolute bottom-0.5 inset-x-0 text-center text-lg font-black leading-none text-amber-950/70">{n}</span>
              </Zone>
            ))}
            {share && pile > 0 && groups.every((n) => n === size) && (
              <Zone mat={mat} id="new" className="grid min-h-24 w-28 place-items-center rounded-2xl border-4 border-dashed border-amber-900/30 text-3xl text-muted-foreground">+</Zone>
            )}
          </div>
          {!share && (
            <div className="flex justify-center gap-2">
              <IconBtn tone="neutral" label={t(lang, "صينية أقل", "One less tray")} disabled={g <= 1} onClick={() => setGroups((gs) => gs.slice(0, -1))}><span className="text-2xl font-black">−</span><span className="h-5 w-7 rounded-md border-[3px] border-amber-900/40 bg-amber-100" /></IconBtn>
              <span className="grid min-w-10 place-items-center text-3xl font-black">{g}</span>
              <IconBtn tone="neutral" label={t(lang, "صينية أكثر", "One more tray")} disabled={g >= 12} onClick={() => setGroups((gs) => [...gs, 0])}><span className="text-2xl font-black">+</span><span className="h-5 w-7 rounded-md border-[3px] border-amber-900/40 bg-amber-100" /></IconBtn>
            </div>
          )}
          {pile === 0 && !equal && <Note lang={lang}>{t(lang, "بعض المجموعات أكبر من غيرها… حرّك التفاح", "Some groups are bigger… move the apples")}</Note>}
          {equal && <div className="grid justify-items-center animate-pop-in"><IconBtn label={t(lang, `${g} مجموعات من ${s}`, `${g} groups of ${s}`)} onClick={finishGrouping}><span dir="ltr" className="text-2xl font-black">{g} × {s}</span><span className="text-2xl">✓</span></IconBtn></div>}
        </>
      )}

      {phase === "chain" && (
        <>
          <div dir="ltr" className="flex flex-wrap justify-center gap-1.5">{groups.map((n, i) => <span key={i} className="flex flex-wrap justify-center gap-0.5 rounded-xl bg-amber-100/80 p-1" style={{ width: Math.min(n, 6) * 16 + 8 }}>{Array.from({ length: n }, (_, a) => <img key={a} src={appleSrc} alt="" className="h-4 w-4" />)}</span>)}</div>
          <Note lang={lang}>{t(lang, "أيّ سلسلة تُظهر هذه المجموعات؟ ضعها على اللوح", "Which chain shows these groups? Lay it on the board")}</Note>
          <Zone mat={mat} id="verify" className="grid min-h-20 place-items-center rounded-3xl border-4 border-amber-900/25 bg-amber-100/70 p-3 shadow-inner">
            {verified ? (
              <div dir="ltr" className="flex flex-wrap items-end justify-center gap-1">
                {Array.from({ length: T / verified }, (_, i) => (
                  <span key={i} className="flex items-end gap-0.5"><span className="mb-3"><Chain n={verified} bead={Math.round(B * 0.75)} /></span><WoodNum n={verified * (i + 1)} size={32} /></span>
                ))}
              </div>
            ) : <span className="text-4xl text-muted-foreground">⬇</span>}
          </Zone>
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-card/75 p-2">
            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <Draggable key={n} mat={mat} piece={{ id: `c${n}`, kind: "chain", value: n }}><span className="p-1.5"><Chain n={n} bead={Math.round(B * 0.5)} /></span></Draggable>)}
          </div>
          {verified && <div className="grid justify-items-center gap-2 animate-pop-in"><Note lang={lang}>{t(lang, `${T / verified} مرات ${verified} = ${T}`, `${T / verified} lengths of ${verified} make ${T}`)}</Note><IconBtn label={t(lang, "ابنِ المعادلة", "Build the equation")} onClick={() => setPhase("equation")}><WoodOp op="=" size={30} /><NextIcon /></IconBtn></div>}
        </>
      )}

      {phase === "equation" && (
        <>
          <div className="grid justify-items-center gap-2">
            {fam.slice(0, eqI).map((f) => <WoodEquation key={f.tokens.join()} tokens={f.tokens} size={30} />)}
          </div>
          {eqI < fam.length ? (
            <>
              <Note lang={lang}>{eqI === 0 ? t(lang, "ابنِ ما صنعته بالقطع الخشبية", "Build what you made with the wooden pieces") : t(lang, "نفس العائلة… ابنِ علاقة أخرى", "Same family… build another relationship")}</Note>
              <EquationWork key={eqI} tokens={fam[eqI]!.tokens} extras={["+"]} lang={lang} onDone={() => { grow(); setTimeout(() => setEqI((x) => x + 1), 900); }} />
            </>
          ) : (
            <div className="grid justify-items-center gap-2 animate-pop-in">
              <Done />
              <IconBtn label={share ? t(lang, "شارك مرة أخرى", "Share again") : t(lang, "جد طريقة أخرى", "Find another way")} onClick={onAgain}><AgainIcon /><NextIcon /></IconBtn>
            </div>
          )}
        </>
      )}
      <DragLayer mat={mat} />
    </div>
  );
}

const PAIRS: [number, number][] = [[3, 4], [2, 3], [4, 6], [2, 5]];
function CommonMultiples({ lang, grow }: LevelProps) {
  const [pi, setPi] = useState(0);
  const [a, b] = PAIRS[pi]!;
  const L = 36;
  const [marks, setMarks] = useState<number[]>([]);
  const target = Array.from({ length: L }, (_, i) => i + 1).filter((n) => n % a === 0 && n % b === 0);
  const done = target.every((n) => marks.includes(n));
  const mat = useWorkMat((p, z) => {
    const n = Number(z.replace("cm-", ""));
    if (!z.startsWith("cm-") || n % a || n % b || marks.includes(n)) return false;
    const next = [...marks, n]; setMarks(next); sayNum(n, lang);
    if (target.every((x) => next.includes(x))) { successSound(); grow(); }
    return true;
  });
  const B = useBeadSize();
  const W = Math.max(13, Math.round(B * 0.62));
  const Row = ({ n }: { n: number }) => (
    <div className="flex">{Array.from({ length: L }, (_, i) => (
      <span key={i} className="relative grid place-items-center" style={{ width: W, height: W + 14 }}>
        <span className="absolute inset-x-0 top-[6px] h-[2px] bg-amber-800/50" />
        <img src={chainBeadSrc(n)} alt="" draggable={false} className="absolute top-0" style={{ width: W, height: W }} />
        {(i + 1) % n === 0 && <span className="absolute bottom-0 text-[10px] font-black">{i + 1}</span>}
      </span>
    ))}</div>
  );
  return (
    <div className="grid gap-3">
      <Picker values={PAIRS.map((_, i) => i)} value={pi} onChange={(i) => { setPi(i); setMarks([]); }} render={(i) => <span dir="ltr" className="grid justify-items-start gap-0.5 py-1"><Chain n={PAIRS[i]![0]} bead={7} /><Chain n={PAIRS[i]![1]} bead={7} /></span>} />
      <Note lang={lang}>{t(lang, `ضع زهرة حيث تتوقف السلسلتان معًا`, `Plant a flower where both chains stop together`)}</Note>
      <div dir="ltr" className="overflow-x-auto rounded-3xl border-4 border-amber-900/25 bg-amber-100/70 p-3 shadow-inner">
        <div className="mx-auto w-max">
          <Row n={a} />
          <Row n={b} />
          <div className="mt-1 flex">{Array.from({ length: L }, (_, i) => (
            <Zone key={i} mat={mat} id={`cm-${i + 1}`} className="grid place-items-end justify-center rounded" >
              <span className="grid place-items-center" style={{ width: W, height: 28 }}>{marks.includes(i + 1) ? <img src={flowerSrc} alt={String(i + 1)} className="h-7 w-auto max-w-none animate-pop-in" /> : <span className="h-1 w-1 rounded-full bg-amber-900/30" />}</span>
            </Zone>
          ))}</div>
        </div>
      </div>
      <div className="flex justify-center">
        {!done ? <Draggable mat={mat} piece={{ id: "flower", kind: "marker", value: "flower" }}><img src={flowerSrc} alt="flower" className="h-16 drop-shadow-md" /></Draggable>
          : <div className="grid justify-items-center gap-2 animate-pop-in"><div dir="ltr" className="flex gap-1">{target.map((n) => <WoodNum key={n} n={n} size={40} />)}</div><IconBtn label={t(lang, "سلسلتان أخريان", "Two other chains")} onClick={() => { setPi((pi + 1) % PAIRS.length); setMarks([]); }}><NextIcon /></IconBtn></div>}
      </div>
      <DragLayer mat={mat} />
    </div>
  );
}
// ================= LEVEL 4 — squares and cubes =================
const big = import.meta.glob("@/assets/montessori/{cube,square,layer,exploded}*.png", { eager: true, import: "default" }) as Record<string, string>;
const mImg = (kind: string, n: number) => Object.entries(big).find(([k]) => k.endsWith(`/${kind}${n}.png`))?.[1] ?? "";
const CUBES: Record<number, string> = { 2: cube2, 3: cube3, 4: cube4, 5: cube5, 6: mImg("cube", 6), 7: mImg("cube", 7), 8: mImg("cube", 8), 9: mImg("cube", 9), 10: mImg("cube", 10) };
const L4_STEPS: [string, string][] = [["المربع", "Square"], ["²", "²"], ["المكعب", "Cube"], ["³", "³"]];
export function SquaresCubes({ lang, grow }: LevelProps) {
  const [n, setN] = useState(4);
  const [step, setStep] = useState(0);
  const [k, setK] = useState(0);
  const [rows, setRows] = useState(0);
  const [eqDone, setEqDone] = useState<Record<string, boolean>>({});
  const [rot, setRot] = useState({ x: -12, y: 20 });
  const [layers, setLayers] = useState(false);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const cubeN = Math.min(10, Math.max(2, n));
  // Chains 6-10 have layer assets; chains 2-5 show individual layers as chains for now
  // All chains follow same flow: show whole cube → button to explode/lift layers
  const reset = (nn = n, s = step) => { setN(nn); setStep(s); setRows(0); setEqDone({}); setLayers(false); setK((x) => x + 1); };
  const mat = useWorkMat((p, z) => {
    if (p.kind !== "chain" || z !== "square" || rows >= n) return false;
    const r = rows + 1; setRows(r); sayNum(n * r, lang);
    if (r === n) { successSound(); grow(); }
    return true;
  });
  const markDone = (key: string) => { setEqDone((d) => ({ ...d, [key]: true })); grow(); };
  // Constant bead size across all chains 2-10 (pedagogy: visual difference comes from chain LENGTH, not bead size)
  const bead = useBeadSize();
  const onCubeMove = (e: RPointerEvent) => { if (!drag.current) return; const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y; drag.current = { x: e.clientX, y: e.clientY }; setRot((r) => ({ x: Math.max(-35, Math.min(35, r.x - dy * 0.4)), y: Math.max(-40, Math.min(40, r.y + dx * 0.4)) })); };

  return (
    <div className="grid gap-3">
      <Picker values={[2, 3, 4, 5, 6, 7, 8, 9, 10]} value={step >= 2 ? cubeN : n} onChange={(v) => reset(v)} />
      <Steps steps={L4_STEPS} value={step} onChange={(s) => reset(s >= 2 ? cubeN : n, s)} lang={lang} icons={[
        <span key="sq" className="grid grid-cols-3 gap-px">{Array.from({ length: 9 }, (_, i) => <img key={i} src={chainBeadSrc(3)} alt="" className="h-2 w-2" />)}</span>,
        <WoodOp key="2" op="²" size={40} />,
        <img key="cu" src={cube3} alt="" className="h-7 w-7 object-contain" />,
        <WoodOp key="3" op="³" size={40} />,
      ]} />

      {step <= 1 && (
        <>
          <Note lang={lang}>{rows < n ? t(lang, `ضع ${n} سلاسل من ${n} في صفوف`, `Lay ${n} chains of ${n} in rows`) : t(lang, `${n} صفوف من ${n} تصنع مربعًا`, `${n} rows of ${n} make a square`)}</Note>
          <Zone mat={mat} id="square" className="grid min-h-28 place-items-center rounded-3xl border-4 border-amber-900/25 bg-amber-100/70 p-4 shadow-inner">
            <div dir="ltr" className="grid gap-1">
              {Array.from({ length: n }, (_, r) => (
                <div key={`${k}-${r}`} className={cn("flex items-center gap-2", r >= rows && "opacity-20")}>
                  <span className={r < rows ? "animate-pop-in" : ""}><Chain n={n} bead={bead} /></span>
                  {r < rows && <WoodNum n={n * (r + 1)} size={34} />}
                </div>
              ))}
            </div>
          </Zone>
          {rows < n && <div className="flex justify-center"><Draggable mat={mat} piece={{ id: "sq-chain", kind: "chain", value: n }}><span className="rounded-2xl bg-card/80 p-3"><Chain n={n} bead={bead} /></span></Draggable></div>}
          {rows === n && step === 0 && (eqDone["mul"] ? <div className="grid justify-items-center gap-2"><WoodEquation tokens={[n, "×", n, "=", n * n]} /><IconBtn label={t(lang, "قطعة جديدة: تربيع", "A new piece: squared")} onClick={() => setStep(1)}><WoodOp op="²" size={44} /><NextIcon /></IconBtn></div>
            : <EquationWork key={`m${n}${k}`} tokens={[n, "×", n, "=", n * n]} extras={["+"]} lang={lang} onDone={() => markDone("mul")} />)}
          {rows === n && step === 1 && (
            <div className="grid justify-items-center gap-2">
              <WoodEquation tokens={[n, "×", n, "=", n * n]} size={30} />
              {eqDone["sq"] ? <><WoodEquation tokens={[n, "²", "=", n * n]} /><IconBtn label={t(lang, "إلى المكعب", "On to the cube")} onClick={() => reset(cubeN, 2)}><img src={CUBES[cubeN]} alt="" className="h-8 w-8 object-contain" /><NextIcon /></IconBtn></>
                : <div className="w-full"><Note lang={lang}>{t(lang, `${n} مضروبًا في نفسه يُكتب بقطعة ²`, `${n} times itself is written with the ² piece`)}</Note><EquationWork key={`s${n}${k}`} tokens={[n, "²", "=", n * n]} extras={["³"]} lang={lang} onDone={() => markDone("sq")} /></div>}
            </div>
          )}
          {rows < n && step === 1 && <Note lang={lang}>{t(lang, "ابنِ المربع أولًا", "Build the square first")}</Note>}
        </>
      )}

      {step >= 2 && (
        <>
          <Note lang={lang}>{layers ? t(lang, `${cubeN} طبقات من ${cubeN * cubeN} تصنع مكعبًا من ${cubeN ** 3}`, `${cubeN} layers of ${cubeN * cubeN} make a cube of ${cubeN ** 3}`) : t(lang, "حرّك المكعب لتراه من كل الجهات", "Turn the cube to see every side")}</Note>
          <div className="grid place-items-center rounded-3xl border-4 border-amber-900/25 bg-amber-100/70 p-4 shadow-inner" style={{ perspective: 700 }}>
            {!layers ? (
              <img src={CUBES[cubeN]} alt={`${cubeN}×${cubeN}×${cubeN}`} draggable={false}
                className="h-56 w-auto touch-none sm:h-72 select-none drop-shadow-xl transition-transform duration-75 animate-pop-in"
                style={{ transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)` }}
                onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY }; }}
                onPointerMove={onCubeMove} onPointerUp={() => { drag.current = null; }} />
            ) : (
              <div dir="ltr" className="flex flex-wrap items-center justify-center gap-3">
                {Array.from({ length: cubeN }, (_, l) => (
                  <div key={l} className="grid justify-items-center gap-1 animate-pop-in" style={{ animationDelay: `${l * 120}ms` }}>
                    <div className="grid gap-0.5 rounded-lg bg-background/60 p-1">{Array.from({ length: cubeN }, (_, r) => <Chain key={r} n={cubeN} bead={Math.round(bead * (cubeN > 6 ? 0.45 : 0.6))} />)}</div>
                    {/* Display running total of cubes in exploded view */}
                    <WoodNum n={cubeN * cubeN * (l + 1)} size={28} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-center">
            <IconBtn tone="sky" label={layers ? t(lang, "المكعب كاملاً", "Whole cube") : t(lang, "افصل الطبقات", "Lift the layers")} onClick={() => { setLayers((x) => !x); if (!layers) sayText(lang, `${cubeN} طبقات`, `${cubeN} layers`); }}>{layers ? <Box className="h-7 w-7" /> : <><Layers className="h-7 w-7" /><span className="text-xl font-black">{cubeN}</span></>}</IconBtn>
          </div>
          {step === 2 && (eqDone["cmul"] ? <div className="grid justify-items-center gap-2"><WoodEquation tokens={[cubeN, "×", cubeN, "×", cubeN, "=", cubeN ** 3]} size={30} /><IconBtn label={t(lang, "قطعة جديدة: تكعيب", "A new piece: cubed")} onClick={() => setStep(3)}><WoodOp op="³" size={44} /><NextIcon /></IconBtn></div>
            : <EquationWork key={`c${cubeN}${k}`} tokens={[cubeN, "×", cubeN, "×", cubeN, "=", cubeN ** 3]} extras={[cubeN * cubeN]} size={cubeN >= 10 ? 38 : 42} lang={lang} onDone={() => markDone("cmul")} />)}
          {step === 3 && (
            <div className="grid justify-items-center gap-2">
              <WoodEquation tokens={[cubeN, "×", cubeN, "×", cubeN, "=", cubeN ** 3]} size={26} />
              {eqDone["cube"] ? <><WoodEquation tokens={[cubeN, "³", "=", cubeN ** 3]} /><IconBtn label={t(lang, "مكعب آخر", "Another cube")} onClick={() => reset(cubeN === 10 ? 2 : cubeN + 1, 2)}><NextIcon /></IconBtn></>
                : <div className="w-full"><EquationWork key={`q${cubeN}${k}`} tokens={[cubeN, "³", "=", cubeN ** 3]} extras={["²", cubeN * cubeN]} lang={lang} onDone={() => markDone("cube")} /></div>}
            </div>
          )}
        </>
      )}
      <DragLayer mat={mat} />
    </div>
  );
}
