// Golden Bead Workshop — Living Numbers. One shell, one shared engine (src/lib/goldenBeads.ts),
// five activities + a free workspace. Own localStorage key (golden-workshop-v1); never gates access.
import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import {
  LearningLanguageSwitch,
  languageDirection,
  useLearningLanguage,
} from "@/lib/learningLanguage";
import { isVoiceOn, setVoiceOn } from "@/lib/voice";
import { cn } from "@/lib/utils";
import { BuildNumber } from "./BuildNumber";
import { HundredSquare, TenBar, ThousandCube, UnitBead } from "./materials";
import { REWARDS, unlocked, useWorkshopProgress, type WorkshopMode } from "./progress";
import {
  Companion,
  Panel,
  REWARD_ART,
  Suggestion,
  WorkshopProvider,
  tx,
  useWorkshop,
} from "./shared";
import room from "@/assets/golden-workshop/workshop-room.webp";
import bowlArt from "@/assets/golden-workshop/bowl.webp";
import discArt from "@/assets/golden-workshop/disc-whole.webp";
import sproutArt from "@/assets/golden-workshop/reward-sprout.webp";

const MultiplicationLab = lazy(() =>
  import("./MultiplicationLab").then((m) => ({ default: m.MultiplicationLab })),
);
const DivisionWorkshop = lazy(() =>
  import("./DivisionWorkshop").then((m) => ({ default: m.DivisionWorkshop })),
);
const FactorGarden = lazy(() =>
  import("./FactorGarden").then((m) => ({ default: m.FactorGarden })),
);
const FractionWorkshop = lazy(() =>
  import("./FractionWorkshop").then((m) => ({ default: m.FractionWorkshop })),
);

export type ActivityId = "build" | "free" | "multiply" | "divide" | "factors" | "fractions";
export type OpenParams = { target?: number; a?: number; b?: number; n?: number; view?: string };

const ACTIVITIES: {
  id: ActivityId;
  ar: string;
  en: string;
  arSub: string;
  enSub: string;
  icon: ReactNode;
  tone: string;
}[] = [
  {
    id: "build",
    ar: "ابنِ عددًا",
    en: "Build a Number",
    arSub: "آحاد وعشرات ومئات وآلاف",
    enSub: "Units, tens, hundreds, thousands",
    icon: (
      <span dir="ltr" className="flex items-end gap-1">
        <ThousandCube s={2.6} />
        <HundredSquare s={3} />
        <TenBar s={3.4} />
        <UnitBead s={10} />
      </span>
    ),
    tone: "from-amber-100 to-amber-200",
  },
  {
    id: "free",
    ar: "مساحة حرّة",
    en: "Free Workspace",
    arSub: "العب وبدّل كما تحب",
    enSub: "Explore and exchange freely",
    icon: (
      <span className="flex items-end gap-0.5">
        {Array.from({ length: 6 }, (_, i) => (
          <UnitBead key={i} s={12} />
        ))}
      </span>
    ),
    tone: "from-yellow-50 to-amber-100",
  },
  {
    id: "multiply",
    ar: "مختبر الضرب",
    en: "Multiplication Lab",
    arSub: "مجموعات ومصفوفات وتوزيع",
    enSub: "Groups, arrays, splitting",
    icon: (
      <span className="grid grid-cols-4 gap-0.5">
        {Array.from({ length: 12 }, (_, i) => (
          <UnitBead key={i} s={9} />
        ))}
      </span>
    ),
    tone: "from-sky-100 to-sky-200",
  },
  {
    id: "divide",
    ar: "ورشة القسمة",
    en: "Division Workshop",
    arSub: "مشاركة وتجميع وباقٍ",
    enSub: "Sharing, grouping, remainders",
    icon: <img src={bowlArt} alt="" className="h-12 w-auto" />,
    tone: "from-orange-50 to-orange-100",
  },
  {
    id: "factors",
    ar: "حديقة العوامل",
    en: "Factor Garden",
    arSub: "عوامل وأعداد أولية",
    enSub: "Factors, primes, multiples",
    icon: <img src={sproutArt} alt="" className="h-12 w-auto" />,
    tone: "from-emerald-50 to-emerald-100",
  },
  {
    id: "fractions",
    ar: "ورشة الكسور",
    en: "Fraction Workshop",
    arSub: "أجزاء متساوية وكسور متكافئة",
    enSub: "Equal parts, equivalence",
    icon: <img src={discArt} alt="" className="h-12 w-auto" />,
    tone: "from-rose-50 to-rose-100",
  },
];

const MODES: { id: WorkshopMode; ar: string; en: string; emoji: string }[] = [
  { id: "discover", ar: "اكتشف", en: "Discover", emoji: "🔍" },
  { id: "figure", ar: "فكّر وحلّ", en: "Figure it out", emoji: "🧩" },
  { id: "master", ar: "أتقن", en: "Master it", emoji: "⭐" },
];

function GardenShelf() {
  const { lang, progress } = useWorkshop();
  const have = unlocked(progress);
  const next = REWARDS.find((r) => progress.found.length < r.at);
  return (
    <Panel className="grid gap-2 bg-emerald-50/85">
      <div className="flex items-center justify-between gap-2">
        <p className={cn("text-sm font-black", lang === "ar" && "font-arabic")}>
          {tx(lang, "حديقة الورشة", "Workshop garden")}
        </p>
        <p
          className={cn("text-xs font-bold text-muted-foreground", lang === "ar" && "font-arabic")}
        >
          {tx(
            lang,
            `${progress.found.length} اكتشاف`,
            `${progress.found.length} discover${progress.found.length === 1 ? "y" : "ies"}`,
          )}
          {next && tx(lang, ` · التالي عند ${next.at}`, ` · next at ${next.at}`)}
        </p>
      </div>
      <div
        dir="ltr"
        className="flex min-h-16 flex-wrap items-end gap-2 rounded-2xl bg-gradient-to-t from-amber-900/25 to-transparent px-2 pb-1"
      >
        {have.length === 0 ? (
          <p
            className={cn(
              "w-full self-center text-center text-xs font-bold text-muted-foreground",
              lang === "ar" && "font-arabic",
            )}
          >
            {tx(
              lang,
              "كل اكتشاف جديد يزرع شيئًا هنا.",
              "Every new discovery grows something here.",
            )}
          </p>
        ) : (
          have.map((r) => (
            <img
              key={r.id}
              src={REWARD_ART[r.id]}
              alt={tx(lang, r.ar, r.en)}
              title={tx(lang, r.ar, r.en)}
              className="h-14 w-auto drop-shadow animate-pop-in"
            />
          ))
        )}
      </div>
    </Panel>
  );
}

function Hub({ open }: { open: (id: ActivityId, p?: OpenParams) => void }) {
  const { lang } = useWorkshop();
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-2 min-[960px]:grid-cols-3">
        {ACTIVITIES.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => open(a.id)}
            className={cn(
              "grid min-h-32 content-between gap-2 rounded-3xl border-2 border-amber-900/10 bg-gradient-to-br p-3 text-start shadow-[0_5px_0_var(--neutral-shadow)] transition-transform active:translate-y-1",
              a.tone,
            )}
          >
            <span className="grid h-14 place-items-start">{a.icon}</span>
            <span>
              <span
                className={cn(
                  "block text-base font-black leading-tight sm:text-lg",
                  lang === "ar" && "font-arabic",
                )}
              >
                {tx(lang, a.ar, a.en)}
              </span>
              <span
                className={cn(
                  "block text-xs font-bold text-muted-foreground",
                  lang === "ar" && "font-arabic",
                )}
              >
                {tx(lang, a.arSub, a.enSub)}
              </span>
            </span>
          </button>
        ))}
      </div>
      <GardenShelf />
    </div>
  );
}

function FreeWorkspace({ open }: { open: (id: ActivityId, p?: OpenParams) => void }) {
  const { lang } = useWorkshop();
  const ideas: { ar: string; en: string; go: () => void }[] = [
    {
      ar: "هل تستطيع أن تبني ٣٧؟",
      en: "Can you build 37?",
      go: () => open("build", { target: 37 }),
    },
    {
      ar: "هل تستطيع أن تُظهر ٤ مجموعات من ٦؟",
      en: "Can you show 4 groups of 6?",
      go: () => open("multiply", { a: 4, b: 6, view: "groups" }),
    },
    {
      ar: "كم مصفوفة مختلفة تصنع من ٢٤؟",
      en: "How many different arrays can you make with 24?",
      go: () => open("factors", { n: 24 }),
    },
    {
      ar: "هل تستطيع أن تُظهر النصف بطريقتين؟",
      en: "Can you show one-half in two different ways?",
      go: () => open("fractions", { view: "equivalent" }),
    },
    {
      ar: "شارك ٢٤ خرزة بين ٤ أوعية.",
      en: "Share 24 beads among 4 bowls.",
      go: () => open("divide", { a: 24, b: 4 }),
    },
  ];
  const [i, setI] = useState(0);
  const idea = ideas[i % ideas.length]!;
  return (
    <div className="grid gap-3">
      <Suggestion ar={idea.ar} en={idea.en} onTry={idea.go} />
      <div className="flex justify-center">
        <button
          type="button"
          className="min-h-10 rounded-xl px-3 text-sm font-bold text-muted-foreground underline"
          onClick={() => setI((x) => x + 1)}
        >
          {tx(lang, "فكرة أخرى", "Another idea")}
        </button>
      </div>
      <BuildNumber free />
    </div>
  );
}

function ActivityView({
  id,
  params,
  open,
}: {
  id: ActivityId;
  params: OpenParams;
  open: (id: ActivityId, p?: OpenParams) => void;
}) {
  const { mode } = useWorkshop();
  const key = `${id}-${mode}-${JSON.stringify(params)}`;
  return (
    <Suspense fallback={<p className="p-6 text-center font-black">…</p>}>
      {id === "build" && <BuildNumber key={key} initialTarget={params.target} />}
      {id === "free" && <FreeWorkspace key={key} open={open} />}
      {id === "multiply" && (
        <MultiplicationLab
          key={key}
          initialA={params.a}
          initialB={params.b}
          initialView={params.view}
        />
      )}
      {id === "divide" && (
        <DivisionWorkshop key={key} initialTotal={params.a} initialGroups={params.b} />
      )}
      {id === "factors" && <FactorGarden key={key} initialN={params.n} />}
      {id === "fractions" && <FractionWorkshop key={key} initialView={params.view} />}
    </Suspense>
  );
}

export function GoldenBeadWorkshop({ onExit }: { onExit: () => void }) {
  const [lang, setLang] = useLearningLanguage();
  const [progress, update] = useWorkshopProgress();
  const [activity, setActivity] = useState<{ id: ActivityId; params: OpenParams } | null>(null);
  const [voice, setVoice] = useState(true);
  useEffect(() => setVoice(isVoiceOn()), []);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [activity?.id]);
  const open = (id: ActivityId, params: OpenParams = {}) => setActivity({ id, params });
  const meta = activity && ACTIVITIES.find((a) => a.id === activity.id);
  const mode = progress.mode;

  return (
    <div
      className="min-h-dvh bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(color-mix(in oklab, var(--background) 55%, transparent), color-mix(in oklab, var(--background) 80%, transparent)), url(${room})`,
      }}
    >
      <WorkshopProvider lang={lang} mode={mode} progress={progress} update={update}>
        <section
          dir={languageDirection(lang)}
          className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-3 overflow-x-hidden px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 min-[960px]:max-w-5xl"
        >
          <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 pe-14">
            <GameButton
              tone="neutral"
              className="grid h-12 w-12 place-items-center rounded-full p-0"
              onClick={() => (activity ? setActivity(null) : onExit())}
              aria-label={
                activity
                  ? tx(lang, "العودة إلى الورشة", "Back to the workshop")
                  : tx(lang, "العودة إلى الرياضيات", "Back to Math")
              }
            >
              <ArrowLeft className={cn("h-5 w-5", lang === "ar" && "rotate-180")} />
            </GameButton>
            <div className="min-w-0">
              <p
                className={cn(
                  "truncate text-xs font-black uppercase text-amber-800/80",
                  lang === "ar" && "font-arabic",
                )}
              >
                {tx(lang, "ورشة الخرز الذهبي", "Golden Bead Workshop")}
              </p>
              <h1
                className={cn(
                  "truncate text-xl font-black sm:text-2xl",
                  lang === "ar" && "font-arabic",
                )}
              >
                {meta ? tx(lang, meta.ar, meta.en) : tx(lang, "الأعداد الحيّة", "Living Numbers")}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => {
                setVoiceOn(!voice);
                setVoice(!voice);
              }}
              className="grid h-12 w-12 place-items-center rounded-full bg-card shadow-sm"
              aria-label={
                voice ? tx(lang, "إيقاف الصوت", "Sound off") : tx(lang, "تشغيل الصوت", "Sound on")
              }
              aria-pressed={voice}
            >
              {voice ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5 opacity-50" />}
            </button>
          </header>

          <div className="grid gap-2 min-[960px]:grid-cols-[1fr_auto] min-[960px]:items-center">
            <div
              role="radiogroup"
              aria-label={tx(lang, "طريقة التعلّم", "Learning mode")}
              className="grid grid-cols-3 gap-1 rounded-2xl bg-muted/90 p-1"
            >
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={mode === m.id}
                  onClick={() => update((p) => ({ ...p, mode: m.id }))}
                  className={cn(
                    "min-h-11 rounded-xl px-1 text-xs font-black sm:text-sm",
                    mode === m.id ? "bg-card shadow-sm" : "text-muted-foreground",
                    lang === "ar" && "font-arabic",
                  )}
                >
                  <span aria-hidden>{m.emoji} </span>
                  {tx(lang, m.ar, m.en)}
                </button>
              ))}
            </div>
            <LearningLanguageSwitch language={lang} onChange={setLang} />
          </div>

          <Companion />

          {activity ? (
            <ActivityView id={activity.id} params={activity.params} open={open} />
          ) : (
            <Hub open={open} />
          )}
        </section>
      </WorkshopProvider>
    </div>
  );
}
