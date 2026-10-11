// Activity 4 — Factor Garden: arrays reveal factor pairs; primes, factorization, multiples, GCF/LCM, squares & cubes.
// Each newly found factor pair plants a flower and counts as a workshop discovery (garden rewards never gate content).
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Shuffle } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import {
  classify,
  factorPairs,
  factors,
  gcd,
  isCube,
  isSquare,
  lcm,
  multiples,
  primeFactorization,
  splitOnce,
} from "@/lib/goldenBeads";
import { cn } from "@/lib/utils";
import { BeadArray, ThousandCube, UnitBead } from "./materials";
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
import flowerArt from "@/assets/golden-workshop/reward-flower.webp";
import sproutArt from "@/assets/golden-workshop/reward-sprout.webp";
import crystalArt from "@/assets/golden-workshop/reward-crystal.webp";

type View = "arrays" | "tree" | "multiples" | "two" | "powers";
const COMPOSITES = [12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48];

function FactorTree({ n }: { n: number }): ReactNode {
  const split = splitOnce(n);
  if (!split)
    return (
      <span className="inline-grid h-10 min-w-10 place-items-center rounded-full bg-emerald-600 px-2 text-lg font-black text-white shadow">
        {n}
      </span>
    );
  return (
    <span className="inline-grid justify-items-center gap-1">
      <span className="inline-grid h-10 min-w-10 place-items-center rounded-xl bg-amber-200 px-2 text-lg font-black shadow">
        {n}
      </span>
      <span className="flex items-start gap-3 border-t-2 border-amber-900/40 pt-1">
        <FactorTree n={split[0]} />
        <FactorTree n={split[1]} />
      </span>
    </span>
  );
}

const sup = (e: number) =>
  e === 1
    ? ""
    : String(e)
        .split("")
        .map((d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)])
        .join("");

export function FactorGarden({ initialN }: { initialN?: number }) {
  const { lang, mode, react, discover } = useWorkshop();
  const [n, setN] = useState(initialN ?? 24);
  const [m, setM] = useState(18);
  const [rowLen, setRowLen] = useState(5);
  const [view, setView] = useState<View>("arrays");
  const [found, setFound] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const pairs = useMemo(() => factorPairs(n), [n]);
  const kind = classify(n);
  const allFound = n > 0 && pairs.every(([a]) => found.includes(a));

  useEffect(() => {
    setFound([]);
    setRowLen(Math.min(5, Math.max(1, n)));
  }, [n]);
  useEffect(() => {
    if (mode === "discover" || initialN !== undefined) return;
    if (mode === "figure") {
      setN(COMPOSITES[randInt(0, COMPOSITES.length - 1)]!);
      setView("arrays");
    } else {
      setN(randInt(12, 99));
      setM(randInt(6, 60));
      setView("two");
    }
  }, [mode, round, initialN]);

  const fullRows = Math.floor(n / rowLen);
  const extra = n % rowLen;
  const fits = n > 0 && extra === 0;

  useEffect(() => {
    if (!fits) return;
    const a = Math.min(rowLen, n / rowLen);
    if (found.includes(a)) return;
    const t = window.setTimeout(() => {
      setFound((f) => (f.includes(a) ? f : [...f, a]));
      discover(`pair:${n}:${a}`);
      react(
        "happy",
        `${rowLen} في كل صف، ${fullRows} صفوف — مستطيل كامل! ${Math.min(rowLen, fullRows)} × ${Math.max(rowLen, fullRows)} = ${n}`,
        `${fullRows} rows of ${rowLen} — a perfect rectangle! ${Math.min(rowLen, fullRows)} × ${Math.max(rowLen, fullRows)} = ${n}`,
        { sound: "chime" },
      );
    }, 350);
    return () => window.clearTimeout(t);
  }, [fits, rowLen, n, fullRows, found, discover, react]);

  useEffect(() => {
    if (!allFound || found.length === 0) return;
    const t = window.setTimeout(() => {
      if (kind === "prime")
        react(
          "surprised",
          `${n} له زوج واحد فقط: ١ × ${n}. إنه عدد أوّلي!`,
          `${n} has only one pair: 1 × ${n}. It's a prime number!`,
          { speak: true, sound: "chime" },
        );
      else if (kind === "composite")
        react(
          "celebrate",
          `وجدت كل الأزواج! ${n} عدد مؤلَّف له ${factors(n).length} عوامل.`,
          `You found every pair! ${n} is composite, with ${factors(n).length} factors.`,
          { speak: true, sound: "yay" },
        );
      else
        react("thinking", "العدد ١ ليس أوّليًا ولا مؤلَّفًا.", "1 is neither prime nor composite.");
    }, 1400);
    return () => window.clearTimeout(t);
  }, [allFound, kind, n, found.length, react]);

  const pf = primeFactorization(n);
  const steps: ChallengeStep[] =
    mode === "master"
      ? [
          {
            ar: `كم زوج عوامل للعدد ${n}؟`,
            en: `How many factor pairs does ${n} have?`,
            answer: pairs.length,
          },
          {
            ar: `القاسم المشترك الأكبر لـ ${n} و ${m}`,
            en: `Greatest common factor of ${n} and ${m}`,
            answer: gcd(n, m),
          },
          {
            ar: `المضاعف المشترك الأصغر لـ ${n} و ${m}`,
            en: `Least common multiple of ${n} and ${m}`,
            answer: lcm(n, m),
          },
        ]
      : [];

  const commonF = factors(n).filter((x) => factors(m).includes(x));
  const L = lcm(n, m);
  return (
    <div className="grid gap-3">
      <Panel className="grid gap-2">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Stepper
            value={n}
            min={1}
            max={100}
            onChange={setN}
            label={tx(lang, "العدد", "Number")}
          />
          {view === "two" && (
            <>
              <span className="font-black">&amp;</span>
              <Stepper
                value={m}
                min={1}
                max={100}
                onChange={setM}
                label={tx(lang, "العدد الثاني", "Second number")}
              />
            </>
          )}
        </div>
        <Segments<View>
          value={view}
          onChange={setView}
          label={tx(lang, "استكشف", "Explore")}
          options={[
            { id: "arrays", label: tx(lang, "مصفوفات", "Arrays") },
            { id: "tree", label: tx(lang, "شجرة العوامل", "Factor tree") },
            { id: "multiples", label: tx(lang, "مضاعفات", "Multiples") },
            { id: "two", label: tx(lang, "عددان", "Two numbers") },
            { id: "powers", label: tx(lang, "مربعات ومكعبات", "Squares & cubes") },
          ]}
        />
      </Panel>

      {view === "arrays" && (
        <>
          <Panel className="grid justify-items-center gap-2 bg-amber-50/85">
            <p className={cn("text-center text-sm font-bold", lang === "ar" && "font-arabic")}>
              {tx(
                lang,
                `رتّب ${n} خرزة في صفوف متساوية. كم خرزة في كل صف؟`,
                `Arrange ${n} beads in equal rows. How many in each row?`,
              )}
            </p>
            <Stepper
              value={rowLen}
              min={1}
              max={n}
              onChange={setRowLen}
              label={tx(lang, "في كل صف", "In each row")}
            />
            <div dir="ltr" className="grid justify-items-start gap-0.5">
              {fullRows > 0 && (
                <BeadArray rows={fullRows} cols={rowLen} maxWidth={300} maxBead={22} tens={false} />
              )}
              {extra > 0 && (
                <span className="flex gap-0 ps-px">
                  {Array.from({ length: extra }, (_, i) => (
                    <UnitBead
                      key={i}
                      s={Math.max(2.5, Math.min(22, 300 / rowLen))}
                      className="opacity-70"
                    />
                  ))}
                </span>
              )}
            </div>
            <p
              className={cn(
                "text-center font-black",
                fits ? "text-emerald-700" : "text-amber-800",
                lang === "ar" && "font-arabic",
              )}
              aria-live="polite"
            >
              {fits
                ? tx(
                    lang,
                    `${fullRows} × ${rowLen} = ${n} ✓ مستطيل`,
                    `${fullRows} × ${rowLen} = ${n} ✓ rectangle`,
                  )
                : tx(
                    lang,
                    `${fullRows} صفوف كاملة وتبقى ${extra} — ليس مستطيلًا`,
                    `${fullRows} full rows and ${extra} left over — not a rectangle`,
                  )}
            </p>
          </Panel>
          <Panel className="grid gap-2 bg-emerald-50/85">
            <p className={cn("text-sm font-black", lang === "ar" && "font-arabic")}>
              {tx(lang, `أزواج عوامل ${n}`, `Factor pairs of ${n}`)}
            </p>
            <div dir="ltr" className="flex flex-wrap gap-2">
              {pairs.map(([a, b]) => {
                const got = found.includes(a);
                return (
                  <div
                    key={a}
                    className={cn(
                      "grid w-24 justify-items-center rounded-2xl p-1",
                      got ? "bg-emerald-100" : "bg-amber-900/10",
                    )}
                  >
                    <img
                      src={got ? flowerArt : sproutArt}
                      alt=""
                      className={cn("h-12 w-auto", !got && "opacity-40 grayscale")}
                    />
                    <span className="text-sm font-black">
                      {got || (mode === "discover" && allFound) ? `${a} × ${b}` : "? × ?"}
                    </span>
                  </div>
                );
              })}
            </div>
            <p
              className={cn(
                "text-sm font-bold text-muted-foreground",
                lang === "ar" && "font-arabic",
              )}
            >
              {tx(
                lang,
                `وجدت ${found.length} من ${pairs.length}`,
                `Found ${found.length} of ${pairs.length}`,
              )}
              {allFound &&
                ` · ${kind === "prime" ? tx(lang, "عدد أوّلي", "prime") : kind === "composite" ? tx(lang, "عدد مؤلَّف", "composite") : tx(lang, "ليس أوّليًا ولا مؤلَّفًا", "neither prime nor composite")}`}
            </p>
            {allFound && (
              <p dir="ltr" className="text-sm font-black">
                {tx(lang, "العوامل", "Factors")}: {factors(n).join(", ")}
              </p>
            )}
          </Panel>
        </>
      )}

      {view === "tree" && (
        <Panel className="grid justify-items-center gap-3 overflow-x-auto bg-amber-50/85">
          {n < 2 ? (
            <p className={cn("font-bold", lang === "ar" && "font-arabic")}>
              {tx(lang, "العدد ١ ليس له عوامل أوّلية.", "1 has no prime factors.")}
            </p>
          ) : (
            <>
              <div dir="ltr">
                <FactorTree n={n} />
              </div>
              <p dir="ltr" className="text-2xl font-black">
                {n} = {pf.map(([p, e]) => `${p}${sup(e)}`).join(" × ")}
              </p>
              <p
                className={cn(
                  "text-sm font-bold text-muted-foreground",
                  lang === "ar" && "font-arabic",
                )}
              >
                {tx(
                  lang,
                  "الدوائر الخضراء أعداد أوّلية — لا تنقسم أكثر.",
                  "Green circles are primes — they can't split any further.",
                )}
              </p>
            </>
          )}
        </Panel>
      )}

      {view === "multiples" && (
        <Panel className="grid gap-2 bg-amber-50/85">
          <p className={cn("text-sm font-bold", lang === "ar" && "font-arabic")}>
            {tx(
              lang,
              `مضاعفات ${n} حتى ١٠٠ (تقفز ${n} كل مرة)`,
              `Multiples of ${n} up to 100 (jumping by ${n})`,
            )}
          </p>
          <div dir="ltr" className="grid grid-cols-10 gap-0.5">
            {Array.from({ length: 100 }, (_, i) => i + 1).map((x) => (
              <span
                key={x}
                className={cn(
                  "grid aspect-square place-items-center rounded text-[10px] font-black sm:text-xs",
                  x % n === 0
                    ? "bg-amber-400 text-amber-950"
                    : "bg-background/70 text-muted-foreground",
                )}
              >
                {x}
              </span>
            ))}
          </div>
          <p dir="ltr" className="text-sm font-black">
            {multiples(n, 10).join(", ")}, …
          </p>
        </Panel>
      )}

      {view === "two" && (
        <Panel className="grid gap-2 bg-amber-50/85">
          <div dir="ltr" className="grid gap-1 text-sm font-bold">
            <p>
              {tx(lang, `عوامل ${n}`, `Factors of ${n}`)}:{" "}
              {factors(n).map((x) => (
                <span
                  key={x}
                  className={cn(
                    "me-1 inline-block rounded px-1",
                    commonF.includes(x) && "bg-emerald-200",
                    mode === "discover" && x === gcd(n, m) && "ring-2 ring-emerald-700",
                  )}
                >
                  {x}
                </span>
              ))}
            </p>
            <p>
              {tx(lang, `عوامل ${m}`, `Factors of ${m}`)}:{" "}
              {factors(m).map((x) => (
                <span
                  key={x}
                  className={cn(
                    "me-1 inline-block rounded px-1",
                    commonF.includes(x) && "bg-emerald-200",
                    mode === "discover" && x === gcd(n, m) && "ring-2 ring-emerald-700",
                  )}
                >
                  {x}
                </span>
              ))}
            </p>
            {mode === "discover" && (
              <p className="text-base font-black">
                GCF ({n}, {m}) = {gcd(n, m)}
              </p>
            )}
          </div>
          <div dir="ltr" className="grid gap-1 text-sm font-bold">
            <p>
              {tx(lang, `مضاعفات ${n}`, `Multiples of ${n}`)}:{" "}
              {multiples(n, Math.min(12, L / n)).map((x) => (
                <span
                  key={x}
                  className={cn("me-1 inline-block rounded px-1", x % m === 0 && "bg-sky-200")}
                >
                  {x}
                </span>
              ))}
            </p>
            <p>
              {tx(lang, `مضاعفات ${m}`, `Multiples of ${m}`)}:{" "}
              {multiples(m, Math.min(12, L / m)).map((x) => (
                <span
                  key={x}
                  className={cn("me-1 inline-block rounded px-1", x % n === 0 && "bg-sky-200")}
                >
                  {x}
                </span>
              ))}
            </p>
            {mode === "discover" && (
              <p className="text-base font-black">
                LCM ({n}, {m}) = {L}
              </p>
            )}
          </div>
          <p
            className={cn(
              "text-xs font-bold text-muted-foreground",
              lang === "ar" && "font-arabic",
            )}
          >
            {tx(
              lang,
              "الأخضر: عوامل مشتركة · الأزرق: أول مضاعف مشترك",
              "Green: common factors · Blue: first common multiple",
            )}
          </p>
        </Panel>
      )}

      {view === "powers" && (
        <Panel className="grid justify-items-center gap-3 bg-amber-50/85">
          {isSquare(n) ? (
            <>
              <BeadArray
                rows={Math.round(Math.sqrt(n))}
                cols={Math.round(Math.sqrt(n))}
                maxWidth={200}
                maxBead={22}
                tens={false}
              />
              <p dir="ltr" className="text-xl font-black">
                {Math.round(Math.sqrt(n))}² = {n} · {tx(lang, "عدد مربّع", "a square number")}
              </p>
            </>
          ) : (
            <p className={cn("text-center font-bold", lang === "ar" && "font-arabic")}>
              {tx(
                lang,
                `${n} ليس مربّعًا. المربعات القريبة: ${Math.floor(Math.sqrt(n)) ** 2} و ${Math.ceil(Math.sqrt(n)) ** 2}`,
                `${n} isn't a square. Nearby squares: ${Math.floor(Math.sqrt(n)) ** 2} and ${Math.ceil(Math.sqrt(n)) ** 2}`,
              )}
            </p>
          )}
          {isCube(n) && (
            <>
              <ThousandCube
                edge={Math.round(Math.cbrt(n))}
                s={Math.min(14, 60 / Math.round(Math.cbrt(n)))}
              />
              <p dir="ltr" className="flex items-center gap-2 text-xl font-black">
                {Math.round(Math.cbrt(n))}³ = {n} · {tx(lang, "عدد مكعّب", "a cube number")}{" "}
                <img src={crystalArt} alt="" className="h-8" />
              </p>
            </>
          )}
          <p dir="ltr" className="text-sm font-bold text-muted-foreground">
            {tx(lang, "مربعات", "Squares")}: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100 ·{" "}
            {tx(lang, "مكعبات", "Cubes")}: 1, 8, 27, 64
          </p>
        </Panel>
      )}

      {mode === "discover" ? (
        <Suggestion
          ar="كم مصفوفة مختلفة تصنع من ٢٤؟ ثم جرّب ١٣."
          en="How many different arrays can you make with 24? Then try 13."
          onTry={() => {
            setN(n === 24 ? 13 : 24);
            setView("arrays");
          }}
        />
      ) : mode === "figure" ? (
        <>
          <Suggestion
            key={n}
            ar={`اعثر على كل أزواج عوامل ${n}. ابدأ بصف من ١، ثم ٢، ثم ٣…`}
            en={`Find every factor pair of ${n}. Start with rows of 1, then 2, then 3…`}
          />
          <div className="flex justify-center">
            <GameButton
              tone="neutral"
              className="min-h-11 px-4 text-sm"
              onClick={() => setRound((r) => r + 1)}
            >
              <Shuffle className="me-1 inline h-4 w-4" />
              {tx(lang, "عدد جديد", "New number")}
            </GameButton>
          </div>
        </>
      ) : (
        <>
          <StepChallenge
            key={`${n}-${m}-${round}`}
            steps={steps}
            onHint={() => setView("two")}
            discoverKey={`fg:${n}:${m}`}
            doneAr="ممتاز! أتقنت العوامل والمضاعفات."
            doneEn="Excellent! You mastered factors and multiples."
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
