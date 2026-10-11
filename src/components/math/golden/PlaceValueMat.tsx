// The shared golden-bead work mat: supply shelf + Thousands | Hundreds | Tens | Units columns.
// All state changes go through the pure engine in src/lib/goldenBeads.ts, so the pieces, the column
// counts and the displayed total are always derived from the same Materials value.
import { useCallback, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Minus, Plus } from "lucide-react";
import { DragLayer, Draggable, Zone, useWorkMat } from "@/components/math/montessori/materials";
import {
  EMPTY_MATERIALS,
  PLACES,
  add,
  canAdd,
  canExchangeDown,
  canExchangeUp,
  canRemove,
  exchangeDown,
  exchangeUp,
  formatNumber,
  nextPlace,
  prevPlace,
  remove,
  total,
  type Materials,
  type Place,
} from "@/lib/goldenBeads";
import { cn } from "@/lib/utils";
import { PLACE_STYLE, Piece } from "./materials";
import { tx, useWorkshop } from "./shared";
import traySmall from "@/assets/golden-workshop/tray-small.webp";
import woodPanel from "@/assets/golden-workshop/wood-panel.webp";

export type MatAction = { type: "add" | "remove" | "up" | "down"; place: Place };
const ORDER: Place[] = ["thousands", "hundreds", "tens", "units"]; // written order, left → right

/** Materials state with undo. */
export function useMaterials(initial: Materials = EMPTY_MATERIALS) {
  const [stack, setStackState] = useState<Materials[]>([initial]);
  const ref = useRef(stack);
  const setStack = useCallback((s: Materials[]) => {
    ref.current = s;
    setStackState(s);
  }, []);
  const m = stack[stack.length - 1]!;
  /** Applies a legal action and returns the new materials, or null when the engine refuses it. */
  const apply = useCallback(
    (a: MatAction): Materials | null => {
      const s = ref.current;
      const cur = s[s.length - 1]!;
      const ok =
        a.type === "add"
          ? canAdd(cur, a.place)
          : a.type === "remove"
            ? canRemove(cur, a.place)
            : a.type === "up"
              ? canExchangeUp(cur, a.place)
              : canExchangeDown(cur, a.place);
      if (!ok) return null;
      const next =
        a.type === "add"
          ? add(cur, a.place)
          : a.type === "remove"
            ? remove(cur, a.place)
            : a.type === "up"
              ? exchangeUp(cur, a.place)
              : exchangeDown(cur, a.place);
      setStack([...s.slice(-60), next]);
      return next;
    },
    [setStack],
  );
  const undo = useCallback(() => {
    const s = ref.current;
    if (s.length > 1) setStack(s.slice(0, -1));
  }, [setStack]);
  const reset = useCallback((to: Materials = EMPTY_MATERIALS) => setStack([to]), [setStack]);
  return { m, apply, undo, reset, canUndo: stack.length > 1 };
}

type Props = {
  m: Materials;
  onAction: (a: MatAction, before: Materials) => void;
  highlight?: Place | null;
  locked?: boolean;
};

export function PlaceValueMat({ m, onAction, highlight, locked }: Props) {
  const { lang, react, play } = useWorkshop();
  const style = (p: Place) => PLACE_STYLE[p];
  const mat = useWorkMat((piece, zone) => {
    if (locked) return false;
    const kind = piece.kind as Place;
    if (zone === "shelf") {
      if (!piece.from) return false;
      if (!canRemove(m, kind)) return false;
      onAction({ type: "remove", place: kind }, m);
      return true;
    }
    const target = zone.replace("col-", "") as Place;
    if (piece.from === target) return true; // dropped back where it was
    if (target !== kind) {
      react(
        "thinking",
        `${style(kind).arOne} يسكن في عمود ${style(kind).ar}.`,
        `A ${style(kind).enOne} lives in the ${style(kind).en} column.`,
        { sound: "click" },
      );
      return false;
    }
    if (!canAdd(m, kind)) {
      react(
        "thinking",
        "العمود ممتلئ — جرّب أن تبادل عشرة بواحدة أكبر.",
        "That column is full — try exchanging ten for one bigger piece.",
        { sound: "click" },
      );
      return false;
    }
    onAction({ type: "add", place: kind }, m);
    return true;
  });

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-2">
      {/* Supply shelf */}
      <Zone mat={mat} id="shelf" className="rounded-2xl bg-amber-100/60 p-1.5">
        <div dir="ltr" className="grid grid-cols-4 gap-1">
          {ORDER.map((p) => (
            <div key={p} className="relative grid place-items-center">
              <img
                src={traySmall}
                alt=""
                draggable={false}
                className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto w-full max-w-24 select-none opacity-90"
              />
              <div className="relative grid min-h-16 place-items-end pb-2 pt-1">
                <Draggable
                  mat={mat}
                  piece={{
                    id: `supply-${p}`,
                    kind: p,
                    value: tx(lang, style(p).arOne, style(p).enOne),
                  }}
                  className="p-1"
                >
                  <Piece place={p} scale={0.85} />
                </Draggable>
              </div>
            </div>
          ))}
        </div>
        <p
          className={cn(
            "text-center text-xs font-bold text-amber-900/70",
            lang === "ar" && "font-arabic",
          )}
        >
          {tx(
            lang,
            "اسحب قطعة إلى عمودها — أو المسها ثم المس العمود",
            "Drag a piece to its column — or tap it, then tap the column",
          )}
        </p>
      </Zone>

      {/* Columns */}
      <div dir="ltr" className="grid grid-cols-4 gap-1 sm:gap-2">
        {ORDER.map((p) => {
          const count = m[p];
          const over = count > 9;
          return (
            <div
              key={p}
              className={cn(
                "grid min-w-0 grid-rows-[auto_1fr_auto] gap-1 rounded-2xl",
                highlight === p && "ring-4 ring-primary",
              )}
            >
              <div className="grid justify-items-center gap-0.5 pt-1">
                <span
                  className={cn(
                    "w-full truncate rounded-lg px-1 py-0.5 text-center text-[11px] font-black sm:text-sm",
                    style(p).chip,
                    lang === "ar" && "font-arabic",
                  )}
                >
                  {tx(lang, style(p).ar, style(p).en)}
                </span>
                <span
                  className={cn(
                    "grid h-9 min-w-9 place-items-center rounded-xl px-1 text-2xl font-black tabular-nums",
                    over ? "animate-pulse bg-amber-300 text-amber-950" : "bg-background",
                  )}
                  aria-label={`${tx(lang, style(p).ar, style(p).en)}: ${count}`}
                >
                  {count}
                </span>
              </div>
              <Zone
                mat={mat}
                id={`col-${p}`}
                onTap={undefined}
                className="relative min-h-44 overflow-hidden rounded-xl border-2 border-amber-900/20 p-1 shadow-inner"
              >
                <img
                  src={woodPanel}
                  alt=""
                  draggable={false}
                  className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover opacity-80"
                />
                <div
                  className={cn(
                    "relative",
                    p === "units"
                      ? "mx-auto grid w-fit grid-cols-5 gap-0.5"
                      : cn(
                          "flex flex-wrap content-start justify-center",
                          p === "tens" ? "gap-[3px]" : "gap-1",
                        ),
                  )}
                >
                  {Array.from({ length: count }, (_, i) => (
                    <Draggable
                      key={`${p}-${i}`}
                      mat={mat}
                      piece={{
                        id: `${p}-${i}`,
                        kind: p,
                        value: tx(lang, style(p).arOne, style(p).enOne),
                        from: p,
                      }}
                      className={cn(i >= 10 && "opacity-95")}
                    >
                      <span className={cn("block", i >= 10 && "rounded ring-2 ring-amber-400/80")}>
                        <Piece place={p} />
                      </span>
                    </Draggable>
                  ))}
                </div>
              </Zone>
              <div className="grid gap-1">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    disabled={locked || !canRemove(m, p)}
                    onClick={() => onAction({ type: "remove", place: p }, m)}
                    className="grid h-11 place-items-center rounded-xl bg-card font-black shadow-[0_3px_0_var(--neutral-shadow)] disabled:opacity-35"
                    aria-label={tx(lang, `أزل ${style(p).arOne}`, `Remove a ${style(p).enOne}`)}
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    disabled={locked || !canAdd(m, p)}
                    onClick={() => {
                      onAction({ type: "add", place: p }, m);
                      play("pop");
                    }}
                    className="grid h-11 place-items-center rounded-xl bg-card font-black shadow-[0_3px_0_var(--neutral-shadow)] disabled:opacity-35"
                    aria-label={tx(lang, `أضف ${style(p).arOne}`, `Add a ${style(p).enOne}`)}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                {!nextPlace(p) && <span className="min-h-11" aria-hidden />}
                {nextPlace(p) && (
                  <button
                    type="button"
                    disabled={locked || !canExchangeUp(m, p)}
                    onClick={() => onAction({ type: "up", place: p }, m)}
                    className={cn(
                      "flex min-h-11 items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-black leading-tight shadow-[0_3px_0_var(--neutral-shadow)] disabled:opacity-35 sm:text-xs",
                      canExchangeUp(m, p) ? "bg-primary text-primary-foreground" : "bg-card",
                    )}
                    aria-label={tx(
                      lang,
                      `بدّل ١٠ ${style(p).ar} بـ ${style(nextPlace(p)!).arOne}`,
                      `Exchange 10 ${style(p).en.toLowerCase()} for 1 ${style(nextPlace(p)!).enOne}`,
                    )}
                  >
                    10
                    <ArrowUp className="h-3.5 w-3.5" />1
                  </button>
                )}
                {!prevPlace(p) && <span className="min-h-11" aria-hidden />}
                {prevPlace(p) && (
                  <button
                    type="button"
                    disabled={locked || !canExchangeDown(m, p)}
                    onClick={() => onAction({ type: "down", place: p }, m)}
                    className="flex min-h-11 items-center justify-center gap-0.5 rounded-xl bg-card px-1 text-[11px] font-black leading-tight shadow-[0_3px_0_var(--neutral-shadow)] disabled:opacity-35 sm:text-xs"
                    aria-label={tx(
                      lang,
                      `فكّ ${style(p).arOne} إلى ١٠ ${style(prevPlace(p)!).ar}`,
                      `Break 1 ${style(p).enOne} into 10 ${style(prevPlace(p)!).en.toLowerCase()}`,
                    )}
                  >
                    1<ArrowDown className="h-3.5 w-3.5" />
                    10
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <DragLayer mat={mat} />
    </div>
  );
}

/** Big numeral + expanded form, always computed from the materials. */
export function MatTotal({ m }: { m: Materials }) {
  const { lang } = useWorkshop();
  const n = total(m);
  const parts = PLACES.slice()
    .reverse()
    .map((p) => ({
      p,
      v: m[p] * ({ units: 1, tens: 10, hundreds: 100, thousands: 1000 } as const)[p],
    }))
    .filter((x) => x.v > 0);
  return (
    <div className="grid justify-items-center gap-1 text-center">
      <p className="text-5xl font-black tabular-nums text-amber-700 sm:text-6xl" aria-live="polite">
        {formatNumber(n)}
      </p>
      <p
        dir="ltr"
        className="flex flex-wrap justify-center gap-x-1 text-sm font-bold text-muted-foreground"
      >
        {parts.length === 0 ? (
          <span className={cn(lang === "ar" && "font-arabic")}>
            {tx(lang, "لا شيء بعد — صفر", "Nothing yet — zero")}
          </span>
        ) : (
          parts.map((x, i) => (
            <span key={x.p}>
              {i > 0 && "+ "}
              {formatNumber(x.v)}
            </span>
          ))
        )}
        {parts.length > 1 && <span>= {formatNumber(n)}</span>}
      </p>
    </div>
  );
}
