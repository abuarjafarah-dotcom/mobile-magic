// Activity 3 — Division Workshop: sharing (round-robin dealing), grouping, remainders, long division.
import { useEffect, useState } from "react";
import { RotateCcw, Shuffle } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { dealRoundRobin, divide, formatNumber, longDivision } from "@/lib/goldenBeads";
import { cn } from "@/lib/utils";
import { SmallQuantity, UnitBead } from "./materials";
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
import bowl from "@/assets/golden-workshop/bowl.webp";
import basket from "@/assets/golden-workshop/basket.webp";
import tray from "@/assets/golden-workshop/tray-small.webp";

type View = "share" | "group" | "long";
const DRAW_LIMIT = 150;

function ZeroNote() {
  const { lang } = useWorkshop();
  return (
    <div
      className={cn(
        "rounded-2xl bg-amber-100 p-4 text-center font-bold",
        lang === "ar" && "font-arabic",
      )}
      role="status"
    >
      <p className="text-3xl" aria-hidden>
        🥣❓
      </p>
      <p>
        {tx(
          lang,
          "لا نستطيع المشاركة في ٠ أوعية — لا يوجد أحد ليأخذ الخرز! القسمة على صفر غير ممكنة. اختر ١ أو أكثر.",
          "We can't share into 0 bowls — there's nobody to take the beads! Dividing by zero doesn't work. Choose 1 or more.",
        )}
      </p>
    </div>
  );
}

function Leftover({ n }: { n: number }) {
  const { lang } = useWorkshop();
  if (n <= 0) return null;
  return (
    <div className="grid justify-items-center">
      <div className="relative grid w-32 place-items-center">
        <img src={tray} alt="" className="w-full" />
        <span className="absolute inset-x-3 top-3 flex flex-wrap justify-center gap-0.5">
          {Array.from({ length: Math.min(n, 20) }, (_, i) => (
            <UnitBead key={i} s={11} />
          ))}
        </span>
      </div>
      <p className={cn("text-sm font-black text-amber-800", lang === "ar" && "font-arabic")}>
        {tx(lang, `الباقي ${n}`, `${n} left over`)}
      </p>
    </div>
  );
}

function LongDivisionView({ dividend, divisor }: { dividend: number; divisor: number }) {
  const { lang, mode } = useWorkshop();
  const r = longDivision(dividend, divisor);
  if (!r.ok) return <ZeroNote />;
  const firstUseful = Math.max(
    0,
    r.steps.findIndex((s) => s.digit > 0),
  );
  const reveal = mode === "discover";
  return (
    <div className="grid w-full gap-2">
      <div
        dir="ltr"
        className="mx-auto grid grid-cols-[auto_auto] items-end gap-x-2 font-mono text-2xl font-black"
      >
        <span />
        <span className="border-b-4 border-amber-900/70 px-1 tracking-[0.35em]">
          {reveal
            ? String(r.quotient).padStart(String(dividend).length, " ").replace(/ /g, " ")
            : "?"}
        </span>
        <span className="pt-1">{divisor}</span>
        <span className="border-s-4 border-amber-900/70 px-1 pt-1 tracking-[0.35em]">
          {dividend}
        </span>
      </div>
      <ol className="grid gap-1">
        {r.steps.slice(firstUseful).map((s, i) => (
          <li
            key={i}
            dir={lang === "ar" ? "rtl" : "ltr"}
            className={cn(
              "rounded-xl bg-background/80 px-3 py-1.5 text-sm font-bold",
              lang === "ar" && "font-arabic",
            )}
          >
            {reveal
              ? tx(
                  lang,
                  `${s.current} ÷ ${divisor}: يدخل ${s.digit} مرات (${s.digit} × ${divisor} = ${s.product})، يبقى ${s.remainder}.`,
                  `${s.current} ÷ ${divisor}: goes ${s.digit} time${s.digit === 1 ? "" : "s"} (${s.digit} × ${divisor} = ${s.product}), ${s.remainder} left.`,
                )
              : tx(
                  lang,
                  `الخطوة ${i + 1}: كم مرة يدخل ${divisor} في ${s.current}؟`,
                  `Step ${i + 1}: how many ${divisor}s fit in ${s.current}?`,
                )}
          </li>
        ))}
      </ol>
      {reveal && (
        <p dir="ltr" className="text-center text-lg font-black">
          {formatNumber(dividend)} ÷ {divisor} = {formatNumber(r.quotient)}
          {r.remainder ? ` R ${r.remainder}` : ""}
        </p>
      )}
    </div>
  );
}

export function DivisionWorkshop({
  initialTotal,
  initialGroups,
}: {
  initialTotal?: number;
  initialGroups?: number;
}) {
  const { lang, mode, react, discover, play } = useWorkshop();
  const [totalN, setTotalN] = useState(initialTotal ?? 24);
  const [groups, setGroups] = useState(initialGroups ?? 4);
  const [view, setView] = useState<View>("share");
  const [dealt, setDealt] = useState(0);
  const [round, setRound] = useState(0);
  const result = divide(totalN, groups);
  const drawable = totalN <= DRAW_LIMIT && groups <= 12;

  useEffect(() => {
    if (mode === "discover" || initialTotal !== undefined) return;
    if (mode === "figure") {
      const g = randInt(2, 6);
      setGroups(g);
      setTotalN(g * randInt(2, 8) + randInt(0, g - 1));
      setView("share");
    } else {
      setGroups(randInt(3, 9));
      setTotalN(randInt(100, 999));
      setView("long");
    }
  }, [mode, round, initialTotal]);
  useEffect(() => setDealt(0), [totalN, groups, view]);

  const bowls = dealRoundRobin(Math.min(dealt, result.ok ? totalN - result.remainder : 0), groups);
  const sharable = result.ok ? totalN - result.remainder : 0;
  const finished = result.ok && dealt >= sharable;
  const deal = (n: number) => {
    if (!result.ok) return;
    const next = Math.min(sharable, dealt + n);
    setDealt(next);
    play("pop");
    if (next >= sharable && dealt < sharable) {
      discover(`share:${totalN}/${groups}`);
      react(
        "celebrate",
        result.remainder
          ? `كل وعاء أخذ ${result.quotient}، وبقي ${result.remainder} لا يكفي لجولة أخرى.`
          : `كل وعاء أخذ ${result.quotient} بالتساوي!`,
        result.remainder
          ? `Each bowl got ${result.quotient}, and ${result.remainder} ${result.remainder === 1 ? "is" : "are"} left — not enough for another round.`
          : `Each bowl got ${result.quotient} — perfectly equal!`,
        { speak: true, sound: "chime" },
      );
    }
  };

  const steps: ChallengeStep[] = result.ok
    ? mode === "figure"
      ? [
          {
            ar: `${totalN} ÷ ${groups}: كم في كل وعاء؟`,
            en: `${totalN} ÷ ${groups}: how many in each bowl?`,
            answer: result.quotient,
          },
          { ar: "كم بقي؟", en: "How many are left over?", answer: result.remainder },
        ]
      : [
          {
            ar: `${totalN} ÷ ${groups} = ؟`,
            en: `${totalN} ÷ ${groups} = ?`,
            answer: result.quotient,
          },
          { ar: "والباقي؟", en: "And the remainder?", answer: result.remainder },
        ]
    : [];

  const reveal = mode === "discover" || finished;
  return (
    <div className="grid gap-3">
      <Panel className="grid gap-2">
        <div dir="ltr" className="flex flex-wrap items-center justify-center gap-2">
          <Stepper
            value={totalN}
            min={0}
            max={9999}
            onChange={setTotalN}
            label={tx(lang, "كم خرزة", "How many beads")}
          />
          <span className="text-3xl font-black">÷</span>
          <Stepper
            value={groups}
            min={0}
            max={view === "long" ? 99 : 12}
            onChange={setGroups}
            label={
              view === "group"
                ? tx(lang, "حجم المجموعة", "Group size")
                : tx(lang, "عدد الأوعية", "Number of bowls")
            }
          />
        </div>
        <p
          dir="ltr"
          className="text-center text-3xl font-black tabular-nums text-amber-700"
          aria-live="polite"
        >
          {formatNumber(totalN)} ÷ {groups} ={" "}
          {result.ok
            ? reveal
              ? `${formatNumber(result.quotient)}${result.remainder ? ` R ${result.remainder}` : ""}`
              : "?"
            : "—"}
        </p>
        {result.ok && reveal && (
          <p dir="ltr" className="text-center text-sm font-bold text-muted-foreground">
            {tx(lang, "العلاقة مع الضرب:", "Multiplication link:")} {formatNumber(result.quotient)}{" "}
            × {groups}
            {result.remainder ? ` + ${result.remainder}` : ""} = {formatNumber(totalN)}
          </p>
        )}
        <Segments<View>
          value={view}
          onChange={setView}
          label={tx(lang, "طريقة القسمة", "Way to divide")}
          options={[
            { id: "share", label: tx(lang, "شارك بالتساوي", "Share equally") },
            { id: "group", label: tx(lang, "كوّن مجموعات", "Make groups") },
            { id: "long", label: tx(lang, "القسمة الطويلة", "Long division") },
          ]}
        />
      </Panel>

      <Panel className="grid justify-items-center gap-3 bg-amber-50/85">
        {!result.ok ? (
          <ZeroNote />
        ) : view === "long" ? (
          <LongDivisionView dividend={totalN} divisor={groups} />
        ) : !drawable ? (
          <div className={cn("grid gap-2 text-center font-bold", lang === "ar" && "font-arabic")}>
            <p>
              {tx(
                lang,
                `كمية كبيرة على الرسم (حتى ${DRAW_LIMIT} خرزة و١٢ وعاء). جرّب القسمة الطويلة!`,
                `That's a lot to draw (up to ${DRAW_LIMIT} beads and 12 bowls). Try long division!`,
              )}
            </p>
            <GameButton
              tone="sky"
              className="mx-auto min-h-11 px-4 text-sm"
              onClick={() => setView("long")}
            >
              {tx(lang, "القسمة الطويلة", "Long division")}
            </GameButton>
          </div>
        ) : view === "share" ? (
          <>
            <p className={cn("text-center text-sm font-bold", lang === "ar" && "font-arabic")}>
              {tx(
                lang,
                `وزّع ${totalN} خرزة على ${groups} أوعية — واحدة لكل وعاء في كل جولة.`,
                `Deal ${totalN} beads into ${groups} bowls — one to each bowl every round.`,
              )}
            </p>
            <div dir="ltr" className="flex flex-wrap justify-center gap-2">
              {bowls.map((n, i) => (
                <div key={i} className="relative grid w-24 justify-items-center">
                  <div className="z-10 grid min-h-14 place-items-end pb-1">
                    <SmallQuantity n={n} bead={11} />
                  </div>
                  <img src={bowl} alt="" className="-mt-6 w-24" />
                  <span className="text-sm font-black tabular-nums">{n}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span
                className={cn(
                  "rounded-xl bg-background px-3 py-1 text-sm font-black",
                  lang === "ar" && "font-arabic",
                )}
              >
                {tx(lang, `لم يوزّع بعد: ${totalN - dealt}`, `Still to deal: ${totalN - dealt}`)}
              </span>
              <GameButton
                tone="sun"
                className="min-h-11 px-3 text-sm"
                disabled={finished}
                onClick={() => deal(1)}
              >
                {tx(lang, "خرزة واحدة", "Deal one")}
              </GameButton>
              <GameButton
                tone="sun"
                className="min-h-11 px-3 text-sm"
                disabled={finished}
                onClick={() => deal(groups)}
              >
                {tx(lang, "جولة كاملة", "Deal a round")}
              </GameButton>
              <GameButton
                tone="neutral"
                className="min-h-11 px-3 text-sm"
                disabled={finished}
                onClick={() => deal(totalN)}
              >
                {tx(lang, "وزّع الكل", "Deal all")}
              </GameButton>
              <GameButton
                tone="neutral"
                className="min-h-11 px-3 text-sm"
                onClick={() => setDealt(0)}
              >
                <RotateCcw className="me-1 inline h-4 w-4" />
                {tx(lang, "من جديد", "Start over")}
              </GameButton>
            </div>
            {finished && <Leftover n={result.remainder} />}
          </>
        ) : (
          <>
            <p className={cn("text-center text-sm font-bold", lang === "ar" && "font-arabic")}>
              {tx(
                lang,
                `ضع كل ${groups} خرزات في سلة. كم سلة نملأ؟`,
                `Put ${groups} beads in each basket. How many baskets can we fill?`,
              )}
            </p>
            <div dir="ltr" className="flex flex-wrap justify-center gap-2">
              {Array.from({ length: Math.min(result.quotient, 40) }, (_, i) => (
                <div key={i} className="relative grid w-20 justify-items-center">
                  <div className="z-10 grid min-h-10 place-items-end">
                    <SmallQuantity n={groups} bead={10} />
                  </div>
                  <img src={basket} alt="" className="-mt-4 w-16" />
                </div>
              ))}
            </div>
            {reveal && (
              <p className={cn("text-center font-black", lang === "ar" && "font-arabic")}>
                {tx(
                  lang,
                  `${result.quotient} سلال، في كل سلة ${groups}`,
                  `${result.quotient} baskets of ${groups}`,
                )}
              </p>
            )}
            <Leftover n={result.remainder} />
          </>
        )}
      </Panel>

      {mode === "discover" ? (
        <Suggestion
          ar="جرّب ٢٥ ÷ ٤ — ماذا يحدث للخرزة الأخيرة؟"
          en="Try 25 ÷ 4 — what happens to the last bead?"
          onTry={() => {
            setTotalN(25);
            setGroups(4);
            setView("share");
          }}
        />
      ) : result.ok ? (
        <>
          <StepChallenge
            key={`${totalN}/${groups}-${round}`}
            steps={steps}
            onHint={() => setView(mode === "master" ? "long" : "share")}
            discoverKey={`div:${totalN}/${groups}`}
            doneAr={`أحسنت! ${totalN} ÷ ${groups} = ${result.quotient}${result.remainder ? ` والباقي ${result.remainder}` : ""}`}
            doneEn={`Well done! ${totalN} ÷ ${groups} = ${result.quotient}${result.remainder ? ` remainder ${result.remainder}` : ""}`}
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
      ) : null}
    </div>
  );
}
