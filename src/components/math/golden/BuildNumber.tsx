// Activity 1 — Build a Number (and the free-exploration workspace, which is the same mat without a target).
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Lightbulb, RotateCcw, Shuffle, Undo2 } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import {
  EMPTY_MATERIALS,
  PLACE_VALUE,
  formatNumber,
  fromNumber,
  isCanonical,
  matchesTarget,
  nextPlace,
  prevPlace,
  total,
  type Materials,
  type Place,
} from "@/lib/goldenBeads";
import { cn } from "@/lib/utils";
import { PLACE_STYLE } from "./materials";
import { MatTotal, PlaceValueMat, useMaterials, type MatAction } from "./PlaceValueMat";
import { Panel, WoodTile, randInt, tx, useWorkshop } from "./shared";

const ORDER: Place[] = ["thousands", "hundreds", "tens", "units"];

/** Master It puzzles describe a number in a non-standard way the child must regroup. */
type Puzzle = { target: number; ar: string; en: string };
function makePuzzle(): Puzzle {
  const kinds = [
    () => {
      const th = randInt(1, 8);
      const t = randInt(11, 19);
      const u = randInt(0, 9);
      return {
        target: th * 1000 + t * 10 + u,
        ar: `${th} آلاف و ${t} عشرات و ${u} آحاد`,
        en: `${th} thousands, ${t} tens and ${u} units`,
      };
    },
    () => {
      const h = randInt(11, 19);
      const u = randInt(10, 19);
      return {
        target: h * 100 + u,
        ar: `${h} مئة و ${u} آحاد`,
        en: `${h} hundreds and ${u} units`,
      };
    },
    () => {
      const a = randInt(1, 9) * 1000;
      const b = randInt(0, 9) * 10;
      const c = randInt(1, 9);
      return {
        target: a + b + c,
        ar: `${formatNumber(a)} + ${b} + ${c}`,
        en: `${formatNumber(a)} + ${b} + ${c}`,
      };
    },
    () => {
      const n = randInt(2, 9) * 100 + randInt(1, 9);
      return {
        target: n + 10,
        ar: `عشرة أكثر من ${formatNumber(n)}`,
        en: `ten more than ${formatNumber(n)}`,
      };
    },
    () => {
      const n = randInt(2, 9) * 1000 + randInt(0, 9) * 100;
      return {
        target: n - 100,
        ar: `مئة أقل من ${formatNumber(n)}`,
        en: `one hundred less than ${formatNumber(n)}`,
      };
    },
  ];
  return kinds[randInt(0, kinds.length - 1)]!();
}

function TargetDigits({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const { lang } = useWorkshop();
  const digits = fromNumber(value);
  const set = (p: Place, d: number) =>
    onChange(value + (((d + 10) % 10) - digits[p]) * PLACE_VALUE[p]);
  return (
    <div
      dir="ltr"
      className="flex justify-center gap-1.5"
      role="group"
      aria-label={tx(lang, "اختر العدد", "Choose the number")}
    >
      {ORDER.map((p) => (
        <div key={p} className="grid justify-items-center gap-0.5">
          <button
            type="button"
            onClick={() => set(p, digits[p] + 1)}
            className="grid h-9 w-12 place-items-center rounded-lg bg-card shadow-sm"
            aria-label={tx(
              lang,
              `زِد ${PLACE_STYLE[p].ar}`,
              `More ${PLACE_STYLE[p].en.toLowerCase()}`,
            )}
          >
            <ChevronUp className="h-5 w-5" />
          </button>
          <WoodTile size={52}>{digits[p]}</WoodTile>
          <button
            type="button"
            onClick={() => set(p, digits[p] - 1)}
            className="grid h-9 w-12 place-items-center rounded-lg bg-card shadow-sm"
            aria-label={tx(
              lang,
              `أنقص ${PLACE_STYLE[p].ar}`,
              `Fewer ${PLACE_STYLE[p].en.toLowerCase()}`,
            )}
          >
            <ChevronDown className="h-5 w-5" />
          </button>
          <span
            className={cn(
              "rounded px-1 text-[10px] font-black",
              PLACE_STYLE[p].chip,
              lang === "ar" && "font-arabic",
            )}
          >
            {tx(lang, PLACE_STYLE[p].ar, PLACE_STYLE[p].en)}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Next helpful move toward the target (for Figure It Out hints). */
function nextHint(m: Materials, target: number): { place: Place; ar: string; en: string } | null {
  const want = fromNumber(target);
  for (const p of ORDER) {
    if (m[p] > 9 && nextPlace(p))
      return {
        place: p,
        ar: `في عمود ${PLACE_STYLE[p].ar} ${m[p]} قطعة. بدّل عشرة منها بقطعة واحدة أكبر.`,
        en: `The ${PLACE_STYLE[p].en} column has ${m[p]} pieces. Exchange ten of them for one bigger piece.`,
      };
  }
  for (const p of ORDER) {
    const diff = want[p] - m[p];
    if (diff > 0)
      return {
        place: p,
        ar: `تحتاج ${diff} ${PLACE_STYLE[p].arOne} أخرى في عمود ${PLACE_STYLE[p].ar}.`,
        en: `You need ${diff} more ${PLACE_STYLE[p].enOne}${diff > 1 ? "s" : ""} in the ${PLACE_STYLE[p].en} column.`,
      };
    if (diff < 0) {
      const down = prevPlace(p);
      return {
        place: p,
        ar: `في عمود ${PLACE_STYLE[p].ar} قطع زيادة. أزل ${-diff}${down ? " أو فكّ واحدة" : ""}.`,
        en: `There ${-diff > 1 ? "are" : "is"} ${-diff} extra in the ${PLACE_STYLE[p].en} column. Take ${-diff > 1 ? "them" : "it"} away${down ? " or break one apart" : ""}.`,
      };
    }
  }
  return null;
}

export function BuildNumber({ free, initialTarget }: { free?: boolean; initialTarget?: number }) {
  const { lang, mode, react, discover, play } = useWorkshop();
  const mat = useMaterials();
  const [target, setTarget] = useState<number>(initialTarget ?? 37);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [highlight, setHighlight] = useState<Place | null>(null);
  const solvedRef = useRef<number | null>(null);
  const solved = !free && matchesTarget(mat.m, target);
  const sameAmountOnly = !free && !solved && total(mat.m) === target;

  // Master It: start with a regrouping puzzle.
  useEffect(() => {
    if (free || initialTarget !== undefined) return;
    if (mode === "master") {
      const p = makePuzzle();
      setPuzzle(p);
      setTarget(p.target);
    } else setPuzzle(null);
  }, [mode, free, initialTarget]);

  useEffect(() => {
    if (!solved) {
      solvedRef.current = null;
      return;
    }
    if (solvedRef.current === target) return;
    solvedRef.current = target;
    const fresh = discover(`built:${target}`);
    react(
      "celebrate",
      `رائع! بنيت ${formatNumber(target)} — الخرز والرقم متطابقان.`,
      `Wonderful! You built ${formatNumber(target)} — the beads match the numeral.`,
      { speak: true, sound: "yay" },
    );
    if (!fresh) play("chime");
  }, [solved, target, discover, react, play]);

  const onAction = (a: MatAction, before: Materials) => {
    const after = mat.apply(a);
    if (!after) return;
    setHighlight(null);
    if (a.type === "up") {
      const up = nextPlace(a.place)!;
      discover(`exchange:${a.place}-up`);
      react(
        "surprised",
        `عشر قطع من ${PLACE_STYLE[a.place].ar} صارت ${PLACE_STYLE[up].arOne} واحدًا! المجموع ما زال ${formatNumber(total(after))}.`,
        `Ten ${PLACE_STYLE[a.place].en.toLowerCase()} became one ${PLACE_STYLE[up].enOne}! Still ${formatNumber(total(after))} in all.`,
        { sound: "chime", speak: true },
      );
    } else if (a.type === "down") {
      const down = prevPlace(a.place)!;
      discover(`exchange:${a.place}-down`);
      react(
        "happy",
        `فككت ${PLACE_STYLE[a.place].arOne} إلى عشر قطع من ${PLACE_STYLE[down].ar}. نفس الكمية!`,
        `You broke one ${PLACE_STYLE[a.place].enOne} into ten ${PLACE_STYLE[down].en.toLowerCase()}. Same amount!`,
        { sound: "clink" },
      );
    } else if (
      a.type === "add" &&
      after[a.place] === 10 &&
      before[a.place] === 9 &&
      nextPlace(a.place)
    ) {
      react(
        "surprised",
        `صار في عمود ${PLACE_STYLE[a.place].ar} عشر قطع! يمكنك تبديلها بقطعة أكبر.`,
        `You have ten ${PLACE_STYLE[a.place].en.toLowerCase()}! You can exchange them.`,
        { speak: true },
      );
    }
  };

  const newNumber = () => {
    mat.reset(EMPTY_MATERIALS);
    if (mode === "master") {
      const p = makePuzzle();
      setPuzzle(p);
      setTarget(p.target);
      return;
    }
    const max = mode === "discover" ? 99 : 999;
    setTarget(randInt(mode === "discover" ? 1 : 10, max));
    react("curious", "عدد جديد! ابدأ بأكبر قطعة.", "A new number! Start with the biggest pieces.");
  };

  const hint = () => {
    const h = nextHint(mat.m, target);
    if (!h) return;
    setHighlight(h.place);
    react("thinking", h.ar, h.en, { speak: true });
  };

  return (
    <div className="grid gap-3">
      {!free && (
        <Panel className="grid gap-2">
          {puzzle ? (
            <div className="text-center">
              <p
                className={cn(
                  "text-sm font-black text-muted-foreground",
                  lang === "ar" && "font-arabic",
                )}
              >
                {tx(
                  lang,
                  "لغز: ابنِ هذا العدد بأقل عدد من القطع",
                  "Puzzle: build this number the standard way",
                )}
              </p>
              <p className={cn("text-2xl font-black", lang === "ar" && "font-arabic")}>
                {tx(lang, puzzle.ar, puzzle.en)}
              </p>
            </div>
          ) : (
            <>
              <p
                className={cn(
                  "text-center text-sm font-black text-muted-foreground",
                  lang === "ar" && "font-arabic",
                )}
              >
                {tx(lang, "العدد الذي سنبنيه", "Number to build")}
              </p>
              <TargetDigits
                value={target}
                onChange={(n) => {
                  setTarget(n);
                  setHighlight(null);
                }}
              />
            </>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            <GameButton tone="neutral" className="min-h-11 px-3 text-sm" onClick={newNumber}>
              <Shuffle className="me-1 inline h-4 w-4" />
              {tx(lang, "عدد مفاجئ", "Surprise me")}
            </GameButton>
            <GameButton
              tone="sky"
              className="min-h-11 px-3 text-sm"
              onClick={hint}
              disabled={solved}
            >
              <Lightbulb className="me-1 inline h-4 w-4" />
              {tx(lang, "ساعدني", "Help me")}
            </GameButton>
          </div>
        </Panel>
      )}

      <Panel className="grid gap-3 bg-amber-50/85">
        <MatTotal m={mat.m} />
        {!free && (
          <div className="flex items-center justify-center gap-3 text-center" aria-live="polite">
            <span className="rounded-xl bg-background px-3 py-1 text-sm font-black">
              {tx(lang, "الهدف", "Goal")}:{" "}
              <span dir="ltr">{puzzle ? "?" : formatNumber(target)}</span>
            </span>
            {solved ? (
              <span className="rounded-xl bg-success px-3 py-1 text-sm font-black text-success-foreground">
                ✓ {tx(lang, "متطابق", "Match")}
              </span>
            ) : sameAmountOnly ? (
              <span
                className={cn(
                  "rounded-xl bg-amber-200 px-3 py-1 text-sm font-black",
                  lang === "ar" && "font-arabic",
                )}
              >
                {tx(
                  lang,
                  "نفس الكمية — بدّل لتطابق الأرقام",
                  "Same amount — exchange to match the digits",
                )}
              </span>
            ) : null}
          </div>
        )}
        <PlaceValueMat m={mat.m} onAction={onAction} highlight={highlight} />
        <div className="flex flex-wrap justify-center gap-2">
          <GameButton
            tone="neutral"
            className="min-h-11 px-3 text-sm"
            onClick={mat.undo}
            disabled={!mat.canUndo}
          >
            <Undo2 className="me-1 inline h-4 w-4" />
            {tx(lang, "تراجع", "Undo")}
          </GameButton>
          <GameButton
            tone="neutral"
            className="min-h-11 px-3 text-sm"
            onClick={() => {
              mat.reset();
              setHighlight(null);
            }}
          >
            <RotateCcw className="me-1 inline h-4 w-4" />
            {tx(lang, "امسح السجادة", "Clear the mat")}
          </GameButton>
          {solved && (
            <GameButton tone="mint" className="min-h-11 px-4 text-sm" onClick={newNumber}>
              {tx(lang, "عدد آخر", "Another number")}
            </GameButton>
          )}
          {free && !isCanonical(mat.m) && (
            <span
              className={cn(
                "self-center text-xs font-bold text-amber-800",
                lang === "ar" && "font-arabic",
              )}
            >
              {tx(
                lang,
                "عمود فيه ١٠ أو أكثر — جرّب التبديل!",
                "A column has 10 or more — try exchanging!",
              )}
            </span>
          )}
        </div>
      </Panel>
    </div>
  );
}
