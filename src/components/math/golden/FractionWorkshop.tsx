// Activity 5 — Fraction Workshop. Every model is generated from integer numerator/denominator pairs
// (src/lib/goldenBeads.ts), so discs, bars, collections and arithmetic always agree exactly.
import { useEffect, useState } from "react";
import { Shuffle } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import {
  addF,
  compare,
  divF,
  equivalent,
  equivalents,
  frac,
  fracText,
  lcm,
  mulF,
  simplify,
  subF,
  toDecimal,
  toMixed,
  toPercent,
  type Fraction,
} from "@/lib/goldenBeads";
import { cn } from "@/lib/utils";
import { UnitBead } from "./materials";
import {
  Panel,
  Segments,
  StepChallenge,
  Stepper,
  Suggestion,
  randInt,
  tx,
  useWorkshop,
  type ChallengeStep,
} from "./shared";
import discArt from "@/assets/golden-workshop/disc-whole.webp";

type View = "explore" | "equivalent" | "compare" | "operate";
type Op = "+" | "−" | "×" | "÷";
const PALETTE = [
  "#93c5fd",
  "#86efac",
  "#f9a8d4",
  "#fde68a",
  "#c4b5fd",
  "#fdba74",
  "#67e8f9",
  "#fca5a5",
  "#bef264",
  "#a5b4fc",
  "#fcd34d",
  "#f0abfc",
];

export function FracLabel({ f, className }: { f: Fraction; className?: string }) {
  if (f.d === 1)
    return <span className={cn("text-3xl font-black tabular-nums", className)}>{f.n}</span>;
  return (
    <span
      dir="ltr"
      className={cn(
        "inline-grid justify-items-center font-black tabular-nums leading-none",
        className,
      )}
      aria-label={`${f.n}/${f.d}`}
    >
      <span className="text-2xl">{f.n}</span>
      <span className="my-0.5 h-1 w-full min-w-6 rounded bg-current" />
      <span className="text-2xl">{f.d}</span>
    </span>
  );
}

/** Pie of d equal wedges; first k shaded. Tap a wedge to shade up to it. */
export function FractionDisc({
  k,
  d,
  size = 150,
  onPick,
  color = "#f59e0b",
}: {
  k: number;
  d: number;
  size?: number;
  onPick?: (k: number) => void;
  color?: string;
}) {
  const r = size / 2 - 4;
  const c = size / 2;
  const wedge = (i: number) => {
    if (d === 1) return null;
    const a0 = (i / d) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / d) * Math.PI * 2 - Math.PI / 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M${c},${c} L${c + r * Math.cos(a0)},${c + r * Math.sin(a0)} A${r},${r} 0 ${large} 1 ${c + r * Math.cos(a1)},${c + r * Math.sin(a1)} Z`;
  };
  const pick = (i: number) => onPick?.(k === i + 1 ? i : i + 1);
  return (
    <span
      className="relative inline-grid place-items-center"
      style={{ width: size + 16, height: size + 16 }}
    >
      <img
        src={discArt}
        alt=""
        className="absolute inset-0 h-full w-full object-contain opacity-80"
      />
      <svg width={size} height={size} className="relative" role="img" aria-label={`${k}/${d}`}>
        {d === 1 ? (
          <circle
            cx={c}
            cy={c}
            r={r}
            fill={k >= 1 ? color : "#fef3c7"}
            stroke="#7c5a14"
            strokeWidth={2}
            onClick={() => onPick?.(k >= 1 ? 0 : 1)}
            className={onPick ? "cursor-pointer" : ""}
          />
        ) : (
          Array.from({ length: d }, (_, i) => (
            <path
              key={i}
              d={wedge(i)!}
              fill={i < k ? color : "#fef3c7"}
              stroke="#7c5a14"
              strokeWidth={2}
              onClick={() => pick(i)}
              className={onPick ? "cursor-pointer" : ""}
            />
          ))
        )}
      </svg>
    </span>
  );
}

/** Bar of d equal parts; first k shaded. Width fixed so different denominators line up. */
export function FractionBar({
  k,
  d,
  width = 300,
  onPick,
  color = "#f59e0b",
  label,
}: {
  k: number;
  d: number;
  width?: number;
  onPick?: (k: number) => void;
  color?: string;
  label?: string;
}) {
  return (
    <div
      dir="ltr"
      className="flex h-11 max-w-full overflow-hidden rounded-lg border-2 border-amber-900/50 bg-amber-50"
      style={{ width }}
      role="group"
      aria-label={label ?? `${k}/${d}`}
    >
      {Array.from({ length: d }, (_, i) => (
        <button
          key={i}
          type="button"
          disabled={!onPick}
          onClick={() => onPick?.(k === i + 1 ? i : i + 1)}
          aria-label={`${i + 1}/${d}`}
          className={cn(
            "h-full flex-1 border-e-2 border-amber-900/40 last:border-e-0 disabled:cursor-default",
          )}
          style={{ background: i < k ? color : undefined }}
        />
      ))}
    </div>
  );
}

function Facts({ f }: { f: Fraction }) {
  const { lang } = useWorkshop();
  const s = simplify(f);
  const mixed = toMixed(f);
  return (
    <div dir="ltr" className="flex flex-wrap items-center justify-center gap-3 text-sm font-black">
      <FracLabel f={f} className="text-amber-800" />
      {(s.n !== f.n || s.d !== f.d) && (
        <span className="flex items-center gap-1">
          = <FracLabel f={s} className="text-emerald-700" />{" "}
          <span className={cn("text-xs text-muted-foreground", lang === "ar" && "font-arabic")}>
            {tx(lang, "أبسط صورة", "simplest")}
          </span>
        </span>
      )}
      {Math.abs(f.n) >= f.d && f.d !== 1 && mixed.rest.n !== 0 && (
        <span>
          = {mixed.whole} <FracLabel f={mixed.rest} className="text-sm" />
        </span>
      )}
      <span className="rounded-lg bg-background px-2 py-1">= {toDecimal(f)}</span>
      <span className="rounded-lg bg-background px-2 py-1">= {toPercent(f)}</span>
    </div>
  );
}

function FracPicker({
  f,
  onChange,
  label,
  maxD = 12,
}: {
  f: Fraction;
  onChange: (f: Fraction) => void;
  label: string;
  maxD?: number;
}) {
  return (
    <div className="grid justify-items-center gap-1" role="group" aria-label={label}>
      <Stepper
        value={f.n}
        min={0}
        max={f.d}
        onChange={(n) => onChange(frac(n, f.d))}
        label={`${label} ↑`}
      />
      <span className="h-1 w-28 rounded bg-foreground" />
      <Stepper
        value={f.d}
        min={1}
        max={maxD}
        onChange={(d) => onChange(frac(Math.min(f.n, d), d))}
        label={`${label} ↓`}
      />
    </div>
  );
}

export function FractionWorkshop({ initialView }: { initialView?: string }) {
  const { lang, mode, react, discover } = useWorkshop();
  const [view, setView] = useState<View>(
    (["explore", "equivalent", "compare", "operate"] as const).find((v) => v === initialView) ??
      "explore",
  );
  // explore
  const [d, setD] = useState(4);
  const [k, setK] = useState(1);
  const [group, setGroup] = useState(3);
  // equivalent
  const [base, setBase] = useState<Fraction>({ n: 1, d: 2 });
  const [d2, setD2] = useState(4);
  const [k2, setK2] = useState(0);
  // compare / operate
  const [fa, setFa] = useState<Fraction>({ n: 2, d: 3 });
  const [fb, setFb] = useState<Fraction>({ n: 3, d: 4 });
  const [op, setOp] = useState<Op>("+");
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState<Fraction | null>(null);

  useEffect(() => {
    setK((x) => Math.min(x, d));
  }, [d]);
  useEffect(() => {
    setK2(0);
  }, [d2, base.n, base.d]);
  useEffect(() => {
    if (mode === "figure") {
      const dd = [2, 3, 4, 6, 8][randInt(0, 4)]!;
      setTarget({ n: randInt(1, dd - 1), d: dd });
      setD(dd);
      setK(0);
    } else setTarget(null);
    if (mode === "master") {
      const da = randInt(2, 8);
      const db = randInt(2, 8);
      let a = frac(randInt(1, da - 1), da);
      let b = frac(randInt(1, db - 1), db);
      const o = (["+", "−", "×", "÷"] as const)[randInt(0, 3)]!;
      if (o === "−" && compare(a, b) < 0) [a, b] = [b, a]; // keep answers non-negative for the digit pad
      setView("operate");
      setFa(a);
      setFb(b);
      setOp(o);
    }
  }, [mode, round]);

  const cur = frac(k, d);
  // Figure It Out: shade target on the disc
  useEffect(() => {
    if (!target || view !== "explore") return;
    if (k === target.n && d === target.d) {
      discover(`frac:shade:${target.n}/${target.d}`);
      react(
        "celebrate",
        `أحسنت! هذا ${target.n}/${target.d}.`,
        `Yes! That's ${target.n}/${target.d}.`,
        { speak: true, sound: "yay" },
      );
    }
  }, [k, d, target, view, discover, react]);

  const eqMatch = k2 > 0 && equivalent(frac(k2, d2), base);
  useEffect(() => {
    if (!eqMatch) return;
    if (discover(`frac:eq:${base.n}/${base.d}=${k2}/${d2}`))
      react(
        "happy",
        `${base.n}/${base.d} = ${k2}/${d2} — نفس الكمية بقطع مختلفة!`,
        `${base.n}/${base.d} = ${k2}/${d2} — the same amount with different pieces!`,
        { speak: true, sound: "chime" },
      );
    else react("happy", `${base.n}/${base.d} = ${k2}/${d2}`, `${base.n}/${base.d} = ${k2}/${d2}`);
  }, [eqMatch, base, k2, d2, discover, react]);

  let result: Fraction | null = null;
  let opError = false;
  try {
    result =
      op === "+"
        ? addF(fa, fb)
        : op === "−"
          ? subF(fa, fb)
          : op === "×"
            ? mulF(fa, fb)
            : divF(fa, fb);
  } catch {
    opError = true;
  }
  const cmp = compare(fa, fb);
  const common = lcm(fa.d, fb.d);
  const reveal = mode !== "master";
  const steps: ChallengeStep[] = result
    ? [
        {
          ar: `البسط (أبسط صورة) لـ ${fracText(fa)} ${op} ${fracText(fb)}`,
          en: `Top number (simplest form) of ${fracText(fa)} ${op} ${fracText(fb)}`,
          answer: Math.abs(result.n),
        },
        { ar: "المقام", en: "Bottom number", answer: result.d },
      ]
    : [];

  return (
    <div className="grid gap-3">
      <Segments<View>
        value={view}
        onChange={setView}
        label={tx(lang, "الكسور", "Fractions")}
        options={[
          { id: "explore", label: tx(lang, "أجزاء متساوية", "Equal parts") },
          { id: "equivalent", label: tx(lang, "كسور متكافئة", "Equivalent") },
          { id: "compare", label: tx(lang, "قارن ورتّب", "Compare & order") },
          { id: "operate", label: tx(lang, "احسب", "Calculate") },
        ]}
      />

      {view === "explore" && (
        <Panel className="grid justify-items-center gap-3 bg-amber-50/85">
          {target && (
            <p
              className={cn(
                "rounded-xl bg-primary/20 px-3 py-1 text-lg font-black",
                lang === "ar" && "font-arabic",
              )}
            >
              {tx(
                lang,
                `لوّن ${target.n}/${target.d} من القرص`,
                `Shade ${target.n}/${target.d} of the disc`,
              )}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Stepper
              value={d}
              min={1}
              max={12}
              onChange={setD}
              label={tx(lang, "عدد الأجزاء المتساوية", "Equal parts")}
            />
            <Stepper
              value={k}
              min={0}
              max={d}
              onChange={setK}
              label={tx(lang, "الأجزاء الملوّنة", "Shaded parts")}
            />
          </div>
          <FractionDisc k={k} d={d} onPick={setK} />
          <FractionBar k={k} d={d} onPick={setK} />
          <p className={cn("text-center text-sm font-bold", lang === "ar" && "font-arabic")}>
            {d === 1
              ? tx(lang, "قطعة واحدة كاملة = واحد صحيح", "One whole piece = one whole")
              : tx(
                  lang,
                  `قسّمنا الكل إلى ${d} أجزاء متساوية ولوّنا ${k}`,
                  `The whole is cut into ${d} equal parts; ${k} ${k === 1 ? "is" : "are"} shaded`,
                )}
          </p>
          {(mode === "discover" || (target && k === target.n && d === target.d)) && (
            <Facts f={cur} />
          )}
          <div className="grid w-full justify-items-center gap-2 border-t-2 border-dashed border-amber-900/15 pt-2">
            <p className={cn("text-sm font-black", lang === "ar" && "font-arabic")}>
              {tx(
                lang,
                `${k}/${d} من مجموعة ${d * group} خرزة`,
                `${k}/${d} of a collection of ${d * group} beads`,
              )}
            </p>
            <Stepper
              value={group}
              min={1}
              max={6}
              onChange={setGroup}
              label={tx(lang, "خرز في كل جزء", "Beads in each part")}
            />
            <div dir="ltr" className="flex flex-wrap justify-center gap-1.5">
              {Array.from({ length: d }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex flex-wrap justify-center gap-0.5 rounded-xl p-1.5",
                    i < k ? "bg-amber-300" : "bg-background/70",
                  )}
                  style={{ maxWidth: 70 }}
                >
                  {Array.from({ length: group }, (_, j) => (
                    <UnitBead key={j} s={12} className={i < k ? "" : "opacity-50 grayscale"} />
                  ))}
                </span>
              ))}
            </div>
            <p dir="ltr" className="font-black">
              {k}/{d} × {d * group} = {k * group}
            </p>
          </div>
        </Panel>
      )}

      {view === "equivalent" && (
        <Panel className="grid justify-items-center gap-3 bg-amber-50/85">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <FracPicker
              f={base}
              onChange={(f) => setBase(f.n > f.d ? frac(f.d, f.d) : f)}
              label={tx(lang, "الكسر", "Fraction")}
            />
          </div>
          <FractionBar k={base.n} d={base.d} color="#f59e0b" />
          <FractionBar
            k={k2}
            d={d2}
            onPick={setK2}
            color={eqMatch ? "#22c55e" : "#60a5fa"}
            label={tx(lang, "لوّن لتطابق", "Shade to match")}
          />
          <Stepper
            value={d2}
            min={1}
            max={24}
            onChange={setD2}
            label={tx(lang, "قطّع الشريط الثاني إلى", "Cut the second bar into")}
          />
          <p
            className={cn(
              "text-center font-black",
              eqMatch ? "text-emerald-700" : "text-muted-foreground",
              lang === "ar" && "font-arabic",
            )}
            aria-live="polite"
          >
            {eqMatch
              ? `${base.n}/${base.d} = ${k2}/${d2} ✓`
              : equivalents(base, 24).some((e) => e.d === d2)
                ? tx(
                    lang,
                    "لوّن الشريط الأزرق حتى يتساوى مع البرتقالي.",
                    "Shade the blue bar until it lines up with the orange one.",
                  )
                : tx(
                    lang,
                    `لا يمكن عمل ${base.n}/${base.d} بأجزاء من ${d2} — جرّب تقسيمًا آخر.`,
                    `${base.n}/${base.d} can't be made from ${d2}ths — try another cut.`,
                  )}
          </p>
          {mode === "discover" && (
            <p dir="ltr" className="text-sm font-bold">
              {tx(lang, "كسور متكافئة", "Equivalent")}:{" "}
              {equivalents(base, 12).map(fracText).join(" = ")}
            </p>
          )}
        </Panel>
      )}

      {view === "compare" && (
        <Panel className="grid justify-items-center gap-3 bg-amber-50/85">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <FracPicker f={fa} onChange={setFa} label="A" />
            <span className="text-4xl font-black">
              {reveal ? (cmp < 0 ? "<" : cmp > 0 ? ">" : "=") : "?"}
            </span>
            <FracPicker f={fb} onChange={setFb} label="B" />
          </div>
          <FractionBar k={Math.min(fa.n, fa.d)} d={fa.d} color="#f59e0b" />
          <FractionBar k={Math.min(fb.n, fb.d)} d={fb.d} color="#60a5fa" />
          <div
            className="relative h-14 w-[300px] max-w-full"
            dir="ltr"
            aria-label={tx(lang, "خط الأعداد من ٠ إلى ١", "Number line from 0 to 1")}
          >
            <div className="absolute inset-x-0 top-6 h-1 rounded bg-amber-900/60" />
            {[0, 1].map((x) => (
              <span
                key={x}
                className="absolute top-8 -translate-x-1/2 text-xs font-black"
                style={{ left: `${x * 100}%` }}
              >
                {x}
              </span>
            ))}
            {[
              { f: fa, c: "bg-amber-500" },
              { f: simplify(frac(1, 2)), c: "bg-gray-400" },
              { f: fb, c: "bg-sky-500" },
            ].map(({ f, c }, i) => (
              <span
                key={i}
                className={cn(
                  "absolute top-0 -translate-x-1/2 rounded px-1 text-[11px] font-black text-white",
                  c,
                )}
                style={{ left: `${Math.min(1, f.n / f.d) * 100}%` }}
              >
                {fracText(f)}
              </span>
            ))}
          </div>
          {reveal && (
            <p dir="ltr" className="text-sm font-black">
              {tx(lang, "الترتيب", "In order")}:{" "}
              {[fa, frac(1, 2), fb].sort(compare).map(fracText).join(" ≤ ")} ·{" "}
              {tx(lang, "مقام مشترك", "common denominator")} {common}: {fa.n * (common / fa.d)}/
              {common} {tx(lang, "و", "and")} {fb.n * (common / fb.d)}/{common}
            </p>
          )}
        </Panel>
      )}

      {view === "operate" && (
        <Panel className="grid justify-items-center gap-3 bg-amber-50/85">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <FracPicker f={fa} onChange={setFa} label="A" />
            <div className="grid gap-1">
              {(["+", "−", "×", "÷"] as Op[]).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOp(o)}
                  aria-pressed={op === o}
                  className={cn(
                    "h-10 w-10 rounded-xl text-xl font-black",
                    op === o ? "bg-primary" : "bg-card",
                  )}
                >
                  {o}
                </button>
              ))}
            </div>
            <FracPicker f={fb} onChange={setFb} label="B" />
          </div>
          {opError ? (
            <p
              className={cn(
                "rounded-2xl bg-amber-100 p-3 text-center font-bold",
                lang === "ar" && "font-arabic",
              )}
            >
              {tx(
                lang,
                "لا نستطيع القسمة على صفر — كم مرة يدخل «لا شيء» في شيء؟ اختر كسرًا أكبر من صفر.",
                "We can't divide by zero — how many times does “nothing” fit into something? Choose a fraction bigger than zero.",
              )}
            </p>
          ) : (
            result && (
              <>
                <div dir="ltr" className="flex items-center gap-2 text-2xl font-black">
                  <FracLabel f={fa} /> {op} <FracLabel f={fb} /> ={" "}
                  {reveal ? <FracLabel f={result} className="text-emerald-700" /> : "?"}
                </div>
                {(op === "+" || op === "−") && (
                  <div className="grid justify-items-center gap-1">
                    <p dir="ltr" className="text-sm font-bold">
                      {fa.n * (common / fa.d)}/{common} {op} {fb.n * (common / fb.d)}/{common}
                      {reveal
                        ? ` = ${op === "+" ? fa.n * (common / fa.d) + fb.n * (common / fb.d) : fa.n * (common / fa.d) - fb.n * (common / fb.d)}/${common}`
                        : ""}
                    </p>
                    <FractionBar
                      k={Math.min(fa.n * (common / fa.d), common)}
                      d={common}
                      color="#f59e0b"
                    />
                    <FractionBar
                      k={Math.min(fb.n * (common / fb.d), common)}
                      d={common}
                      color="#60a5fa"
                    />
                  </div>
                )}
                {op === "×" && fa.d * fb.d <= 144 && (
                  <div className="grid justify-items-center gap-1">
                    <div
                      dir="ltr"
                      className="grid border-2 border-amber-900/60"
                      style={{
                        gridTemplateColumns: `repeat(${fa.d}, 1fr)`,
                        width: 180,
                        height: 180,
                      }}
                      aria-label={`${fa.d} × ${fb.d}`}
                    >
                      {Array.from({ length: fa.d * fb.d }, (_, i) => {
                        const col = i % fa.d;
                        const row = Math.floor(i / fa.d);
                        const inA = col < fa.n;
                        const inB = row < fb.n;
                        return (
                          <span
                            key={i}
                            className="border border-amber-900/20"
                            style={{
                              background:
                                inA && inB
                                  ? "#22c55e"
                                  : inA
                                    ? "#fde68a"
                                    : inB
                                      ? "#bfdbfe"
                                      : undefined,
                            }}
                          />
                        );
                      })}
                    </div>
                    <p className={cn("text-xs font-bold", lang === "ar" && "font-arabic")}>
                      {tx(
                        lang,
                        `الأخضر: ${fa.n * fb.n} من ${fa.d * fb.d} مربعًا`,
                        `Green: ${fa.n * fb.n} of ${fa.d * fb.d} squares`,
                      )}
                    </p>
                  </div>
                )}
                {op === "÷" && reveal && (
                  <p
                    className={cn("text-center text-sm font-bold", lang === "ar" && "font-arabic")}
                  >
                    {tx(
                      lang,
                      `كم مرة يدخل ${fracText(fb)} في ${fracText(fa)}؟ الجواب ${fracText(result)} — نضرب بمقلوب ${fracText(fb)}.`,
                      `How many ${fracText(fb)}s fit into ${fracText(fa)}? ${fracText(result)} — multiply by the flip of ${fracText(fb)}.`,
                    )}
                  </p>
                )}
                {reveal && <Facts f={result} />}
              </>
            )
          )}
        </Panel>
      )}

      {mode === "discover" ? (
        <Suggestion
          ar="هل تستطيع أن تُظهر النصف بطريقتين؟ جرّب ٢/٤ و٤/٨."
          en="Can you show one-half in two different ways? Try 2/4 and 4/8."
          onTry={() => {
            setView("equivalent");
            setBase({ n: 1, d: 2 });
            setD2(8);
          }}
        />
      ) : mode === "master" && result ? (
        <>
          <StepChallenge
            key={`${fracText(fa)}${op}${fracText(fb)}-${round}`}
            steps={steps}
            discoverKey={`frac:op:${fracText(fa)}${op}${fracText(fb)}`}
            doneAr={`صحيح! النتيجة ${fracText(result)}${result.n < 0 ? " (سالب)" : ""}`}
            doneEn={`Correct! The answer is ${fracText(result)}${result.n < 0 ? " (negative)" : ""}`}
          />
          <div className="flex justify-center">
            <GameButton
              tone="neutral"
              className="min-h-11 px-4 text-sm"
              onClick={() => setRound((r) => r + 1)}
            >
              <Shuffle className="me-1 inline h-4 w-4" />
              {tx(lang, "مسألة جديدة", "New problem")}
            </GameButton>
          </div>
        </>
      ) : mode === "figure" ? (
        <div className="flex justify-center">
          <GameButton
            tone="neutral"
            className="min-h-11 px-4 text-sm"
            onClick={() => {
              setRound((r) => r + 1);
              setView("explore");
            }}
          >
            <Shuffle className="me-1 inline h-4 w-4" />
            {tx(lang, "كسر جديد", "New fraction")}
          </GameButton>
        </div>
      ) : null}
    </div>
  );
}
