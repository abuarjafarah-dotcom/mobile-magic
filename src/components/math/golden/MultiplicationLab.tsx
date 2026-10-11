// Activity 2 — Multiplication Lab: equal groups, arrays, commutativity, and the distributive split.
import { useEffect, useMemo, useState } from "react";
import { Shuffle } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { formatNumber, partialProducts, placeParts, repeatedAddition } from "@/lib/goldenBeads";
import { cn } from "@/lib/utils";
import { BeadArray, BeadNumber, SmallQuantity } from "./materials";
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

type View = "groups" | "array" | "split" | "turn";
const PART_COLORS = [
  "#fde68a",
  "#bae6fd",
  "#bbf7d0",
  "#fecdd3",
  "#ddd6fe",
  "#fed7aa",
  "#a5f3fc",
  "#fbcfe8",
  "#d9f99d",
];

/** Area model: each factor split by place value; every block labelled with its partial product. */
export function AreaSplit({
  a,
  b,
  maxWidth = 320,
  reveal = true,
}: {
  a: number;
  b: number;
  maxWidth?: number;
  reveal?: boolean;
}) {
  const rowsParts = placeParts(a);
  const colParts = placeParts(b);
  const scale = Math.min(maxWidth / Math.max(b, 1), 220 / Math.max(a, 1), 26);
  const W = b * scale;
  const H = a * scale;
  let y = 0;
  return (
    <svg
      width={W + 40}
      height={H + 28}
      viewBox={`-36 -24 ${W + 40} ${H + 28}`}
      className="max-w-full"
      role="img"
      aria-label={`${a} × ${b}`}
    >
      {(() => {
        let x = 0;
        return colParts.map((c, j) => {
          const el = (
            <text
              key={`ct${j}`}
              x={x + (c * scale) / 2}
              y={-8}
              textAnchor="middle"
              className="fill-sky-700 text-[12px] font-black"
            >
              {c}
            </text>
          );
          x += c * scale;
          return el;
        });
      })()}
      {rowsParts.map((r, i) => {
        const rowY = y;
        y += r * scale;
        let x = 0;
        return (
          <g key={`r${i}`}>
            <text
              x={-8}
              y={rowY + (r * scale) / 2 + 4}
              textAnchor="end"
              className="fill-rose-700 text-[12px] font-black"
            >
              {r}
            </text>
            {colParts.map((c, j) => {
              const cx = x;
              x += c * scale;
              const w = c * scale;
              const h = r * scale;
              const label = reveal ? formatNumber(r * c) : `${r}×${c}`;
              const fs = Math.max(8, Math.min(14, Math.min(w, h) / 2.4));
              return (
                <g key={`b${i}-${j}`}>
                  <rect
                    x={cx}
                    y={rowY}
                    width={w}
                    height={h}
                    fill={PART_COLORS[(i * colParts.length + j) % PART_COLORS.length]}
                    stroke="#7c5a14"
                    strokeWidth={1}
                  />
                  {w > 16 && h > 12 && (
                    <text
                      x={cx + w / 2}
                      y={rowY + h / 2 + fs / 3}
                      textAnchor="middle"
                      fontSize={fs}
                      className="fill-amber-950 font-black"
                    >
                      {label}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

export function MultiplicationLab({
  initialA,
  initialB,
  initialView,
}: {
  initialA?: number;
  initialB?: number;
  initialView?: string;
}) {
  const { lang, mode, react, discover } = useWorkshop();
  const [a, setA] = useState(initialA ?? 12);
  const [b, setB] = useState(initialB ?? 14);
  const [view, setView] = useState<View>(
    (["groups", "array", "split", "turn"] as const).find((v) => v === initialView) ??
      (initialA ? "groups" : "split"),
  );
  const [round, setRound] = useState(0);
  const { parts, total } = useMemo(() => partialProducts(a, b), [a, b]);

  // Challenges in guided / mastery modes
  useEffect(() => {
    if (mode === "discover" || initialA !== undefined) return;
    if (mode === "figure") {
      setA(randInt(11, 19));
      setB(randInt(3, 15));
      setView("split");
    } else {
      setA(randInt(12, 48));
      setB(randInt(13, 39));
      setView("array");
    }
  }, [mode, round, initialA]);

  useEffect(() => {
    if (mode !== "discover") return;
    const t = window.setTimeout(() => {
      if (discover(`array:${Math.min(a, b)}x${Math.max(a, b)}`) && a > 1 && b > 1)
        react(
          "happy",
          `${a} × ${b} = ${formatNumber(a * b)}`,
          `${a} × ${b} = ${formatNumber(a * b)}`,
        );
    }, 1200);
    return () => window.clearTimeout(t);
  }, [a, b, mode, discover, react]);

  const steps: ChallengeStep[] =
    mode === "figure"
      ? [
          ...parts
            .filter((p) => p.product > 0)
            .map((p) => ({ ar: `${p.a} × ${p.b}`, en: `${p.a} × ${p.b}`, answer: p.product })),
          { ar: `${a} × ${b} = المجموع`, en: `${a} × ${b} = total`, answer: total },
        ]
      : [{ ar: `${a} × ${b}`, en: `${a} × ${b}`, answer: total }];

  const showGroups = a <= 12 && b <= 30;
  return (
    <div className="grid gap-3">
      <Panel className="grid gap-2">
        <div dir="ltr" className="flex flex-wrap items-center justify-center gap-2">
          <Stepper
            value={a}
            min={0}
            max={99}
            onChange={setA}
            label={tx(lang, "العدد الأول", "First factor")}
          />
          <span className="text-3xl font-black">×</span>
          <Stepper
            value={b}
            min={0}
            max={99}
            onChange={setB}
            label={tx(lang, "العدد الثاني", "Second factor")}
          />
        </div>
        <p
          dir="ltr"
          className="text-center text-4xl font-black tabular-nums text-amber-700"
          aria-live="polite"
        >
          {a} × {b} = {mode === "discover" ? formatNumber(total) : "?"}
        </p>
        <Segments<View>
          value={view}
          onChange={setView}
          label={tx(lang, "طريقة العرض", "View")}
          options={[
            { id: "groups", label: tx(lang, "مجموعات متساوية", "Equal groups") },
            { id: "array", label: tx(lang, "مصفوفة", "Array") },
            { id: "split", label: tx(lang, "قسّم بالمنازل", "Split by place") },
            { id: "turn", label: tx(lang, "اقلبها", "Turn it") },
          ]}
        />
      </Panel>

      <Panel className="grid justify-items-center gap-3 overflow-hidden bg-amber-50/85">
        {view === "groups" &&
          (showGroups ? (
            <>
              <div dir="ltr" className="flex flex-wrap justify-center gap-2">
                {Array.from({ length: a }, (_, i) => (
                  <div
                    key={i}
                    className="grid min-h-16 min-w-16 place-items-center rounded-[40%] border-4 border-amber-700/30 bg-gradient-to-b from-amber-100 to-amber-300/70 p-2 shadow-inner"
                  >
                    <SmallQuantity n={b} />
                  </div>
                ))}
              </div>
              <p dir="ltr" className="text-center text-base font-black text-muted-foreground">
                {a === 0
                  ? "0"
                  : `${repeatedAddition(a, b)} = ${mode === "discover" ? formatNumber(total) : "?"}`}
              </p>
              <p className={cn("text-center text-sm font-bold", lang === "ar" && "font-arabic")}>
                {tx(lang, `${a} مجموعات، في كل مجموعة ${b}`, `${a} groups of ${b}`)}
              </p>
            </>
          ) : (
            <p className={cn("text-center font-bold", lang === "ar" && "font-arabic")}>
              {tx(
                lang,
                "مجموعات كثيرة جدًا للرسم — جرّب المصفوفة أو التقسيم بالمنازل.",
                "Too many groups to draw — try the Array or Split by place view.",
              )}
            </p>
          ))}

        {view === "array" && (
          <>
            <BeadArray rows={a} cols={b} />
            <p className={cn("text-center text-sm font-bold", lang === "ar" && "font-arabic")}>
              {tx(
                lang,
                `${a} صفوف، في كل صف ${b}. الخطوط الزرقاء كل عشرة.`,
                `${a} rows of ${b}. Blue lines mark every ten.`,
              )}
            </p>
          </>
        )}

        {view === "split" && (
          <>
            <AreaSplit a={a} b={b} reveal={mode === "discover"} />
            <ul dir="ltr" className="grid w-full max-w-sm gap-1">
              {parts.map((p, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-xl px-3 py-1 text-base font-black"
                  style={{ background: PART_COLORS[i % PART_COLORS.length] }}
                >
                  <span>
                    {p.a} × {p.b}
                  </span>
                  <span className="tabular-nums">
                    {mode === "discover" ? formatNumber(p.product) : "?"}
                  </span>
                </li>
              ))}
            </ul>
            {mode === "discover" && (
              <p dir="ltr" className="text-center text-lg font-black">
                {parts.map((p) => formatNumber(p.product)).join(" + ")} = {formatNumber(total)}
              </p>
            )}
          </>
        )}

        {view === "turn" && (
          <>
            <div dir="ltr" className="flex flex-wrap items-center justify-center gap-4">
              <div className="grid justify-items-center gap-1">
                <BeadArray rows={a} cols={b} maxWidth={150} maxBead={16} />
                <span className="font-black">
                  {a} × {b}
                </span>
              </div>
              <span className="text-2xl font-black">=</span>
              <div className="grid justify-items-center gap-1">
                <BeadArray rows={b} cols={a} maxWidth={150} maxBead={16} />
                <span className="font-black">
                  {b} × {a}
                </span>
              </div>
            </div>
            <p className={cn("text-center text-sm font-bold", lang === "ar" && "font-arabic")}>
              {tx(
                lang,
                "اقلب المصفوفة: نفس الخرز، نفس الناتج.",
                "Turn the array: same beads, same answer.",
              )}
            </p>
          </>
        )}

        {mode === "discover" && total <= 9999 && total > 0 && (
          <div className="grid justify-items-center gap-1 border-t-2 border-dashed border-amber-900/15 pt-2">
            <p
              className={cn(
                "text-xs font-black text-muted-foreground",
                lang === "ar" && "font-arabic",
              )}
            >
              {tx(lang, "الناتج بالخرز الذهبي", "The answer in golden beads")}
            </p>
            <BeadNumber value={total} />
          </div>
        )}
      </Panel>

      {mode === "discover" ? (
        <Suggestion
          ar="هل يتغير الناتج إذا قلبت المصفوفة؟ جرّب «اقلبها»."
          en="Does the answer change if you turn the array? Try “Turn it”."
          onTry={() => setView("turn")}
        />
      ) : (
        <>
          <StepChallenge
            key={`${a}x${b}-${round}`}
            steps={steps}
            onHint={() => setView("split")}
            discoverKey={`mult:${a}x${b}`}
            doneAr={`أحسنت! ${a} × ${b} = ${formatNumber(total)}`}
            doneEn={`Well done! ${a} × ${b} = ${formatNumber(total)}`}
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
      )}
    </div>
  );
}
