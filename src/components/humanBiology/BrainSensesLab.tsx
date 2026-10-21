import { useEffect, useState, type KeyboardEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isVoiceOn, setVoiceOn, speak, stopVoice } from "@/lib/voice";
import { BODY_BACKDROP, BODY_LIMBS, BODY_PARTS, BODY_VIEWBOX, INK } from "@/data/humanBiologyBody";
import {
  BRAIN_NETWORK_NOTE,
  BRAIN_REGIONS,
  BRAIN_ROLE_DISTRACTORS,
  CHALLENGE_IDS,
  MEMORY_FACTS,
  OBSERVATION_ITEMS,
  REFLEX_COMPARE,
  REFLEX_NOTE,
  REFLEX_STEPS,
  SENSE_SCENARIOS,
  SENSE_STATIONS,
  TOUCH_JOURNEY,
  VISION_JOURNEY,
  makePattern,
  observationQuestion,
  patternMatches,
  rotateOptions,
  type BrainRegionId,
  type Choice,
  type ChallengeId,
  type SignalStage,
} from "@/data/brainSenses";

/* ---------------- progress (own key; never gates access) ---------------- */

const KEY = "brain-senses-lab-v1";

function loadDone(): ChallengeId[] {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(s)
      ? s.filter((id: unknown): id is ChallengeId => CHALLENGE_IDS.includes(id as ChallengeId))
      : [];
  } catch {
    return [];
  }
}

/* ---------------- shared ---------------- */

type Screen = "home" | "control" | "signal" | "senses" | "reflex" | "memory";

function say(text: string) {
  void speak(text, "en");
}

function VoiceToggle() {
  const [on, setOn] = useState(() => (typeof window === "undefined" ? true : isVoiceOn()));
  return (
    <button
      type="button"
      onClick={() => {
        const next = !on;
        setVoiceOn(next);
        setOn(next);
      }}
      aria-pressed={on}
      aria-label={on ? "Turn voice off" : "Turn voice on"}
      className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-foreground bg-card shadow-sm"
    >
      {on ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
    </button>
  );
}

function Header({
  title,
  backLabel,
  onBack,
}: {
  title: string;
  backLabel: string;
  onBack: () => void;
}) {
  return (
    <>
      <header className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-12 items-center gap-2 rounded-2xl border-2 border-foreground bg-card px-4 font-black shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" /> {backLabel}
        </button>
        <VoiceToggle />
      </header>
      <div className="mt-4 text-center">
        <p className="text-sm font-black uppercase text-muted-foreground">Human Biology Lab</p>
        <h2 className="mt-1 font-display text-3xl leading-tight sm:text-4xl">{title}</h2>
      </div>
    </>
  );
}

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-3xl border-2 border-foreground bg-card p-4 shadow-sm sm:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-[48px] rounded-2xl border-2 px-4 py-2 font-black motion-safe:transition-colors",
        active ? "border-foreground bg-foreground text-background" : "border-foreground/40 bg-card",
      )}
    >
      {children}
    </button>
  );
}

function HearButton({ text }: { text: string }) {
  return (
    <button
      type="button"
      onClick={() => say(text)}
      className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl border-2 border-foreground bg-card px-4 font-black"
    >
      <Volume2 className="h-5 w-5" /> Hear it again
    </button>
  );
}

function Placeholder({ file }: { file: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-foreground/40 px-3 py-2 text-sm font-bold text-muted-foreground">
      Placeholder drawing. Detailed artwork is still to come (manifest: {file}).
    </p>
  );
}

/** One question. Wrong answers get gentle feedback and can be retried. Correct answers call onRight. */
function QuizCard({
  prompt,
  choice,
  explanation,
  hint,
  onRight,
}: {
  prompt: string;
  choice: Choice;
  explanation: string;
  hint?: string;
  onRight: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [right, setRight] = useState(false);
  const [hintOn, setHintOn] = useState(false);

  const pick = (i: number) => {
    if (right) return;
    setPicked(i);
    if (i === choice.correctIndex) {
      setRight(true);
      say(explanation);
      onRight();
    }
  };

  return (
    <Panel>
      <p className="font-display text-xl leading-snug">{prompt}</p>
      <div role="group" aria-label="Choices" className="mt-3 grid gap-2">
        {choice.options.map((o, i) => (
          <button
            key={`${o}-${i}`}
            type="button"
            onClick={() => pick(i)}
            aria-pressed={picked === i}
            className={cn(
              "min-h-[56px] rounded-2xl border-2 px-4 py-3 text-left text-lg font-black motion-safe:transition-colors",
              picked === i && !right && "border-destructive bg-destructive/10",
              right && i === choice.correctIndex && "border-emerald-700 bg-emerald-100",
              !(picked === i && !right) &&
                !(right && i === choice.correctIndex) &&
                "border-foreground/40 bg-card",
            )}
          >
            {o}
          </button>
        ))}
      </div>
      <div aria-live="polite" className="mt-3 min-h-[28px] text-base font-bold">
        {right ? (
          <span className="flex items-start gap-2 text-emerald-900">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> {explanation}
          </span>
        ) : picked !== null ? (
          <span className="text-foreground">Not quite. Have another look, then try again.</span>
        ) : null}
      </div>
      {hint && !right && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setHintOn((v) => !v)}
            className="inline-flex min-h-[44px] items-center gap-2 font-black underline"
          >
            <Lightbulb className="h-5 w-5" /> {hintOn ? "Hide hint" : "Show hint"}
          </button>
          {hintOn && <p className="mt-1 text-base font-bold text-muted-foreground">Hint: {hint}</p>}
        </div>
      )}
    </Panel>
  );
}

/* ---------------- top level ---------------- */

export function BrainSensesWorld({ onBack }: { onBack: () => void }) {
  const [screen, setScreen] = useState<Screen>("home");
  const [done, setDone] = useState<ChallengeId[]>(() =>
    typeof window === "undefined" ? [] : loadDone(),
  );

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(done));
    } catch {
      /* storage unavailable: keep playing without saving */
    }
  }, [done]);

  // Stop narration whenever the child moves to another investigation, so audio never overlaps.
  useEffect(() => {
    stopVoice();
    return () => stopVoice();
  }, [screen]);

  const markDone = (id: ChallengeId) => setDone((d) => (d.includes(id) ? d : [...d, id]));
  const go = (s: Screen) => setScreen(s);

  if (screen === "control") return <ControlRoom onBack={() => go("home")} markDone={markDone} />;
  if (screen === "signal") return <FollowSignal onBack={() => go("home")} markDone={markDone} />;
  if (screen === "senses") return <FiveSenses onBack={() => go("home")} markDone={markDone} />;
  if (screen === "reflex") return <ReflexLab onBack={() => go("home")} markDone={markDone} />;
  if (screen === "memory") return <MemoryLab onBack={() => go("home")} markDone={markDone} />;

  return <BrainHome onBack={onBack} onOpen={go} done={done.length} total={CHALLENGE_IDS.length} />;
}

/* ---------------- home ---------------- */

const INVESTIGATIONS: { id: Screen; title: string; detail: string; emoji: string }[] = [
  {
    id: "control",
    title: "The Brain Control Room",
    detail: "Cerebrum, cerebellum and brainstem",
    emoji: "🧠",
  },
  {
    id: "signal",
    title: "Follow a Signal",
    detail: "From a cold touch to your brain",
    emoji: "⚡",
  },
  {
    id: "senses",
    title: "The Five Senses",
    detail: "Sight, hearing, smell, taste and touch",
    emoji: "👀",
  },
  {
    id: "reflex",
    title: "Reflex Lab",
    detail: "Automatic or chosen? See the difference",
    emoji: "🦵",
  },
  {
    id: "memory",
    title: "Memory and Learning",
    detail: "Patterns, pictures and practice",
    emoji: "🧩",
  },
];

function BrainHome({
  onBack,
  onOpen,
  done,
  total,
}: {
  onBack: () => void;
  onOpen: (s: Screen) => void;
  done: number;
  total: number;
}) {
  return (
    <section className="mx-auto min-h-dvh w-full max-w-5xl px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(3.75rem,env(safe-area-inset-top))] sm:px-6">
      <Header title="Brain and Senses Lab" backLabel="Labs" onBack={onBack} />
      <p className="mt-3 text-center text-base font-bold text-muted-foreground">
        Pick any investigation. You can explore in any order.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {INVESTIGATIONS.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => onOpen(x.id)}
            className="flex min-h-[88px] items-center gap-3 rounded-3xl border-2 border-foreground bg-card p-4 text-left shadow-sm motion-safe:transition-transform active:scale-[0.99]"
          >
            <span className="text-4xl leading-none" aria-hidden="true">
              {x.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-black leading-snug">{x.title}</span>
              <span className="block text-sm font-bold text-muted-foreground">{x.detail}</span>
            </span>
          </button>
        ))}
      </div>
      <p className="mt-6 text-center text-sm font-bold text-muted-foreground">
        Challenges finished: {done} of {total}. Nothing is locked, and no mistake costs anything.
      </p>
    </section>
  );
}

/* ---------------- A. Brain Control Room ---------------- */

const REGION_COLOURS: Record<BrainRegionId, string> = {
  cerebrum: "#e86f74",
  cerebellum: "#7b4fb8",
  brainstem: "#f4a340",
  spinalCord: "#f4ecd8",
};

function BrainSide({
  selected,
  onPick,
}: {
  selected: BrainRegionId | null;
  onPick: (id: BrainRegionId) => void;
}) {
  const ring = (id: BrainRegionId) =>
    selected === id ? { stroke: INK, strokeWidth: 4 } : { stroke: "none" };
  const key = (id: BrainRegionId) => (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onPick(id);
    }
  };
  const group = (id: BrainRegionId, name: string, children: ReactNode) => (
    <g
      role="button"
      aria-label={name}
      aria-pressed={selected === id}
      tabIndex={0}
      onClick={() => onPick(id)}
      onKeyDown={key(id)}
      className="cursor-pointer focus:outline-none"
    >
      <title>{name}</title>
      {children}
    </g>
  );
  return (
    <svg
      viewBox="0 0 400 330"
      className="mx-auto h-auto w-full max-w-[420px]"
      role="group"
      aria-label="Side view of the brain. Tap a region to learn about it."
    >
      <rect
        x="0"
        y="0"
        width="400"
        height="330"
        rx="28"
        fill={BODY_BACKDROP}
        pointerEvents="none"
      />
      {group(
        "spinalCord",
        "Spinal cord",
        <path
          d="M200 262 L200 318"
          stroke={selected === "spinalCord" ? INK : REGION_COLOURS.spinalCord}
          strokeWidth={selected === "spinalCord" ? 16 : 12}
          strokeLinecap="round"
          fill="none"
        />,
      )}
      {group(
        "brainstem",
        "Brainstem",
        <path
          d="M184 196 L216 196 L222 268 L178 268 Z"
          fill={REGION_COLOURS.brainstem}
          {...ring("brainstem")}
        />,
      )}
      {group(
        "cerebellum",
        "Cerebellum",
        <ellipse
          cx="282"
          cy="224"
          rx="46"
          ry="28"
          fill={REGION_COLOURS.cerebellum}
          {...ring("cerebellum")}
        />,
      )}
      {group(
        "cerebrum",
        "Cerebrum",
        <path
          d="M84 150 C78 88 128 48 200 52 C272 56 326 98 322 150 C320 196 280 206 226 204 L142 206 C108 206 88 190 84 150 Z"
          fill={REGION_COLOURS.cerebrum}
          {...ring("cerebrum")}
        />,
      )}
      <path
        d="M120 120 C150 96 200 92 236 110"
        stroke="#ffffff"
        strokeOpacity={0.35}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        pointerEvents="none"
      />
    </svg>
  );
}

function ControlRoom({
  onBack,
  markDone,
}: {
  onBack: () => void;
  markDone: (id: ChallengeId) => void;
}) {
  const [sel, setSel] = useState<BrainRegionId | null>(null);
  const [mode, setMode] = useState<"discover" | "investigate">("discover");
  const [showInjury, setShowInjury] = useState(false);
  const region = BRAIN_REGIONS.find((r) => r.id === sel) ?? null;

  const pick = (id: BrainRegionId) => {
    setSel(id);
    setMode("discover");
    setShowInjury(false);
    say(BRAIN_REGIONS.find((r) => r.id === id)!.narration);
  };

  const matchable = BRAIN_REGIONS.filter((r) => r.id !== "spinalCord");

  return (
    <section className="mx-auto min-h-dvh w-full max-w-5xl px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(3.75rem,env(safe-area-inset-top))] sm:px-6">
      <Header title="The Brain Control Room" backLabel="Investigations" onBack={onBack} />
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <BrainSide selected={sel} onPick={pick} />
          <Placeholder file="brain-senses/brain-side.webp" />
          <div className="flex flex-wrap gap-2" aria-label="Regions">
            {BRAIN_REGIONS.map((r) => (
              <Pill key={r.id} active={sel === r.id} onClick={() => pick(r.id)}>
                {r.emoji} {r.name}
              </Pill>
            ))}
          </div>
          <p className="text-base font-bold text-muted-foreground">{BRAIN_NETWORK_NOTE}</p>
        </div>

        <div className="space-y-3">
          {region ? (
            <Panel>
              <div className="flex flex-wrap gap-2">
                <Pill active={mode === "discover"} onClick={() => setMode("discover")}>
                  Discover
                </Pill>
                <Pill active={mode === "investigate"} onClick={() => setMode("investigate")}>
                  Investigate
                </Pill>
              </div>
              <h3 className="mt-4 font-display text-2xl">{region.name}</h3>
              <p className="mt-2 text-lg font-bold leading-relaxed">
                {mode === "discover" ? region.discover : region.investigate}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <HearButton text={mode === "discover" ? region.discover : region.investigate} />
                <button
                  type="button"
                  onClick={() => setShowInjury((v) => !v)}
                  className="min-h-[48px] rounded-2xl border-2 border-foreground/40 px-4 font-black"
                >
                  {showInjury ? "Hide" : "What if this area is hurt?"}
                </button>
              </div>
              {showInjury && (
                <p className="mt-3 rounded-2xl bg-muted/50 p-3 text-base font-bold">
                  {region.injury}
                </p>
              )}
            </Panel>
          ) : (
            <Panel>
              <p className="font-display text-xl">Tap a part of the brain</p>
              <p className="mt-2 text-lg font-bold text-muted-foreground">
                Tap the cerebrum, cerebellum or brainstem to learn what each one does. You can
                explore in any order.
              </p>
            </Panel>
          )}

          <div className="space-y-3">
            <p className="text-sm font-black uppercase text-muted-foreground">
              Challenge: match each part to its job
            </p>
            {matchable.map((r, i) => (
              <QuizCard
                key={r.id}
                prompt={`Which job belongs to the ${r.name.toLowerCase()}?`}
                choice={rotateOptions(r.mainRole, BRAIN_ROLE_DISTRACTORS[r.id], i + 1)}
                explanation={`${r.name}: ${r.mainRole}.`}
                hint={r.discover}
                onRight={() => markDone(`control-match-${r.id}` as ChallengeId)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- B. Follow a Signal ---------------- */

const SENSORY_PATH = "M240 300 L228 226 L188 136 L160 130 L150 150";
const SPINE_PATH = "M150 150 L150 62";
const MOTOR_PATH = "M150 62 L150 150 L160 130 L188 136 L228 226 L240 300";
const OPTIC_PATH = "M132 62 L150 54 L174 60";

/** Path and marker positions for each stage of each journey. */
function stageVisual(journey: "touch" | "vision", stage: SignalStage, index: number) {
  if (journey === "touch") {
    if (stage.stop === "skin") return { path: null, pulse: { x: 240, y: 300 } };
    if (stage.stop === "nerve") return { path: SENSORY_PATH, pulse: null };
    if (stage.stop === "spine") return { path: SPINE_PATH, pulse: null };
    if (stage.stop === "brain") return { path: null, pulse: { x: 150, y: 56 } };
    return { path: MOTOR_PATH, pulse: null };
  }
  void index;
  if (stage.stop === "skin" || stage.stop === "nerve")
    return { path: null, pulse: { x: 132, y: 62 } };
  if (stage.stop === "spine") return { path: OPTIC_PATH, pulse: null };
  return { path: null, pulse: { x: 174, y: 60 } };
}

function SignalBody({ visual, cycle }: { visual: ReturnType<typeof stageVisual>; cycle: number }) {
  return (
    <svg
      viewBox={BODY_VIEWBOX}
      className="mx-auto h-auto w-full max-w-[380px]"
      role="img"
      aria-label="Body diagram showing the path of the signal"
    >
      {BODY_LIMBS.map((l, i) => (
        <path
          key={`l${i}`}
          d={l.d}
          fill="none"
          stroke={l.color}
          strokeWidth={l.width}
          strokeLinecap="round"
          pointerEvents="none"
        />
      ))}
      {BODY_PARTS.map((p, i) => (
        <path key={`p${i}`} d={p.d} fill={p.fill} pointerEvents="none" />
      ))}
      {visual.path && (
        <path
          d={visual.path}
          fill="none"
          stroke={INK}
          strokeOpacity={0.35}
          strokeWidth={3}
          strokeDasharray="6 6"
          strokeLinecap="round"
        />
      )}
      {visual.path && (
        <g key={`m-${cycle}-${visual.path}`}>
          <circle r={7} fill="#fff200" stroke={INK} strokeWidth={2}>
            <animateMotion dur="1.6s" fill="freeze" path={visual.path} />
          </circle>
        </g>
      )}
      {visual.pulse && (
        <circle
          key={`p-${cycle}`}
          cx={visual.pulse.x}
          cy={visual.pulse.y}
          r={8}
          fill="#fff200"
          stroke={INK}
          strokeWidth={2}
        >
          <animate attributeName="r" values="8;15;8" dur="1.2s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}

function FollowSignal({
  onBack,
  markDone,
}: {
  onBack: () => void;
  markDone: (id: ChallengeId) => void;
}) {
  const [journey, setJourney] = useState<"touch" | "vision">("touch");
  const [stage, setStage] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [order, setOrder] = useState<number[]>([]);
  const [wrongTap, setWrongTap] = useState(false);
  const stages = journey === "touch" ? TOUCH_JOURNEY : VISION_JOURNEY;
  const current = stages[stage];
  const visual = stageVisual(journey, current, stage);

  // Shuffled order for the sequencing challenge (fixed so it is the same each time).
  const SHUFFLED = [2, 4, 0, 3, 1];
  const ordering = SHUFFLED.filter((i) => i < TOUCH_JOURNEY.length);

  const switchJourney = (j: "touch" | "vision") => {
    setJourney(j);
    setStage(0);
    setCycle((c) => c + 1);
    stopVoice();
  };

  const tapOrder = (i: number) => {
    const expected = TOUCH_JOURNEY.map((_, k) => k)[order.length];
    if (i === expected) {
      const next = [...order, i];
      setOrder(next);
      setWrongTap(false);
      if (next.length === TOUCH_JOURNEY.length) markDone("signal-order");
    } else {
      setWrongTap(true);
    }
  };

  const remaining = TOUCH_JOURNEY.length - order.length;

  return (
    <section className="mx-auto min-h-dvh w-full max-w-5xl px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(3.75rem,env(safe-area-inset-top))] sm:px-6">
      <Header title="Follow a Signal" backLabel="Investigations" onBack={onBack} />
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Pill active={journey === "touch"} onClick={() => switchJourney("touch")}>
              Cold touch
            </Pill>
            <Pill active={journey === "vision"} onClick={() => switchJourney("vision")}>
              Seeing a colour
            </Pill>
          </div>
          <SignalBody visual={visual} cycle={cycle} />
          <Placeholder file="brain-senses/signal-body.webp (shares the Atlas body for now)" />
        </div>

        <div className="space-y-3">
          <Panel>
            <p className="text-sm font-black uppercase text-muted-foreground">
              Stage {stage + 1} of {stages.length}
            </p>
            <h3 className="mt-1 font-display text-2xl">{current.title}</h3>
            <p className="mt-2 text-lg font-bold leading-relaxed">{current.text}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStage((s) => Math.max(0, s - 1))}
                disabled={stage === 0}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl border-2 border-foreground bg-card px-4 font-black disabled:opacity-40"
              >
                <ChevronLeft className="h-5 w-5" /> Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (stage < stages.length - 1) setStage((s) => s + 1);
                  setCycle((c) => c + 1);
                }}
                disabled={stage >= stages.length - 1}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl border-2 border-foreground bg-foreground px-4 font-black text-background disabled:opacity-40"
              >
                Next <ChevronRight className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setStage(0);
                  setCycle((c) => c + 1);
                }}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl border-2 border-foreground/40 px-4 font-black"
              >
                <RotateCcw className="h-5 w-5" /> Replay journey
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <HearButton text={current.text} />
            </div>
          </Panel>

          {journey === "vision" && (
            <p className="rounded-2xl bg-muted/50 p-3 text-base font-bold">
              The eye does not make a finished picture that is sent to the brain. The brain uses the
              signals to work out what you see.
            </p>
          )}

          <Panel>
            <p className="font-display text-xl">Challenge: put the cold-touch stages in order</p>
            <p className="mt-1 text-base font-bold text-muted-foreground">
              Tap the stages from first to last.{" "}
              {remaining === 0 ? "Well done!" : `${remaining} to go.`}
            </p>
            <div className="mt-3 grid gap-2">
              {ordering.map((i) => {
                const done = order.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={done}
                    onClick={() => tapOrder(i)}
                    className={cn(
                      "min-h-[52px] rounded-2xl border-2 px-4 py-2 text-left text-lg font-black",
                      done ? "border-emerald-700 bg-emerald-100" : "border-foreground/40 bg-card",
                    )}
                  >
                    {done ? `${order.indexOf(i) + 1}. ` : ""}
                    {TOUCH_JOURNEY[i].title}
                  </button>
                );
              })}
            </div>
            <div aria-live="polite" className="mt-2 min-h-[24px] text-base font-bold">
              {wrongTap
                ? "Not that one yet. Think about which stage comes next."
                : remaining === 0
                  ? "Nice work. You followed the whole signal."
                  : ""}
            </div>
            {order.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setOrder([]);
                  setWrongTap(false);
                }}
                className="mt-1 inline-flex min-h-[44px] items-center gap-2 font-black underline"
              >
                <RotateCcw className="h-4 w-4" /> Start the order again
              </button>
            )}
          </Panel>

          <QuizCard
            prompt="Which two structures work together for seeing?"
            choice={rotateOptions("Eyes and brain", ["Ears and knees", "Nose and elbows"], 1)}
            explanation="The eyes detect light, and the brain interprets the signals."
            hint="Think about what detects light and what makes sense of the signals."
            onRight={() => markDone("signal-together")}
          />
        </div>
      </div>
    </section>
  );
}

/* ---------------- C. The Five Senses ---------------- */

function PupilDemo() {
  const [light, setLight] = useState(30);
  const pupil = 8 + (1 - light / 100) * 26;
  return (
    <Panel>
      <p className="font-display text-xl">Pupil demo: change the light</p>
      <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row sm:items-center">
        <svg
          viewBox="0 0 120 120"
          className="h-36 w-36 shrink-0"
          role="img"
          aria-label={`Pupil size ${Math.round(pupil)} units`}
        >
          <circle cx="60" cy="60" r="54" fill="#f6f1e7" stroke={INK} strokeWidth="2" />
          <circle cx="60" cy="60" r="40" fill="#4a7fb0" />
          <circle cx="60" cy="60" r={pupil} fill="#1b1b1b" />
        </svg>
        <div className="w-full">
          <label htmlFor="light" className="block text-lg font-black">
            Light level: {light < 35 ? "dim" : light > 70 ? "bright" : "medium"}
          </label>
          <input
            id="light"
            type="range"
            min={0}
            max={100}
            value={light}
            onChange={(e) => setLight(Number(e.target.value))}
            className="mt-2 h-12 w-full"
          />
          <p className="mt-2 text-base font-bold">
            In dim light the pupil opens wider to let in more light. In bright light it gets smaller
            so less light gets in.
          </p>
        </div>
      </div>
    </Panel>
  );
}

function FiveSenses({
  onBack,
  markDone,
}: {
  onBack: () => void;
  markDone: (id: ChallengeId) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<"discover" | "investigate">("discover");
  const [openStructure, setOpenStructure] = useState<number | null>(null);
  const [scenario, setScenario] = useState(0);
  const station = SENSE_STATIONS[idx];

  const choose = (i: number) => {
    setIdx(i);
    setMode("discover");
    setOpenStructure(null);
    say(SENSE_STATIONS[i].narration);
  };

  const sc = SENSE_SCENARIOS[scenario];
  const scenarioStation = SENSE_STATIONS.find((s) => s.id === sc.sense)!;
  const scenarioChoice = rotateOptions(
    scenarioStation.name,
    SENSE_STATIONS.filter((s) => s.id !== sc.sense)
      .slice(0, 2)
      .map((s) => s.name),
    scenario,
  );

  return (
    <section className="mx-auto min-h-dvh w-full max-w-5xl px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(3.75rem,env(safe-area-inset-top))] sm:px-6">
      <Header title="The Five Senses" backLabel="Investigations" onBack={onBack} />
      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Senses">
        {SENSE_STATIONS.map((s, i) => (
          <Pill key={s.id} active={idx === i} onClick={() => choose(i)}>
            {s.emoji} {s.name}
          </Pill>
        ))}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          {station.id === "vision" && <PupilDemo />}
          <Placeholder file={`brain-senses/senses-${station.id}.webp`} />
          <Panel>
            <div className="flex flex-wrap gap-2">
              <Pill active={mode === "discover"} onClick={() => setMode("discover")}>
                Discover
              </Pill>
              <Pill active={mode === "investigate"} onClick={() => setMode("investigate")}>
                Investigate
              </Pill>
            </div>
            <h3 className="mt-4 font-display text-2xl">{station.name}</h3>
            <p className="mt-2 text-lg font-bold leading-relaxed">
              {mode === "discover" ? station.discover : station.investigate}
            </p>
            <div className="mt-3">
              <HearButton text={mode === "discover" ? station.discover : station.investigate} />
            </div>
          </Panel>
        </div>

        <div className="space-y-3">
          <Panel>
            <p className="font-display text-xl">Tap a part to explore</p>
            <div className="mt-3 grid gap-2">
              {station.structures.map((s, i) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setOpenStructure(openStructure === i ? null : i)}
                  aria-expanded={openStructure === i}
                  className={cn(
                    "min-h-[52px] rounded-2xl border-2 px-4 py-2 text-left text-lg font-black",
                    openStructure === i
                      ? "border-foreground bg-muted/50"
                      : "border-foreground/40 bg-card",
                  )}
                >
                  {s.name}
                  {openStructure === i && (
                    <span className="mt-1 block text-base font-bold">{s.text}</span>
                  )}
                </button>
              ))}
            </div>
          </Panel>

          <QuizCard
            key={station.id}
            prompt={station.question.prompt}
            choice={station.question.choice}
            explanation={station.question.explanation}
            onRight={() => markDone(`senses-${station.id}` as ChallengeId)}
          />

          <Panel>
            <p className="font-display text-xl">Challenge: which sense is it?</p>
            <p className="mt-2 text-lg font-bold">{sc.scenario}</p>
            <div className="mt-2">
              <QuizCard
                key={`scenario-${scenario}`}
                prompt="Which sense picks this up?"
                choice={scenarioChoice}
                explanation={`${scenarioStation.name} picks this up.`}
                onRight={() => {
                  if (scenario === SENSE_SCENARIOS.length - 1) markDone("senses-identify");
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setScenario((s) => (s + 1) % SENSE_SCENARIOS.length)}
              className="mt-2 inline-flex min-h-[48px] items-center gap-2 rounded-2xl border-2 border-foreground/40 px-4 font-black"
            >
              Next example <ChevronRight className="h-5 w-5" />
            </button>
          </Panel>
        </div>
      </div>
    </section>
  );
}

/* ---------------- D. Reflex Lab ---------------- */

function ReflexLab({
  onBack,
  markDone,
}: {
  onBack: () => void;
  markDone: (id: ChallengeId) => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const kicked = step >= 3;
  const lowerAngle = kicked ? 28 : 0;

  const answer = (i: number, automatic: boolean) => {
    const correct = REFLEX_COMPARE[i].automatic === automatic;
    setAnswers((a) => {
      const next = { ...a, [i]: correct };
      if (REFLEX_COMPARE.every((_, k) => next[k] === true)) markDone("reflex-compare");
      return next;
    });
  };

  return (
    <section className="mx-auto min-h-dvh w-full max-w-5xl px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(3.75rem,env(safe-area-inset-top))] sm:px-6">
      <Header title="Reflex Lab" backLabel="Investigations" onBack={onBack} />
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <Panel>
            <svg
              viewBox="0 0 300 300"
              className="mx-auto h-auto w-full max-w-[280px]"
              role="img"
              aria-label={`Simulated knee reflex, step ${step} of 4`}
            >
              <rect x="0" y="0" width="300" height="300" rx="24" fill={BODY_BACKDROP} />
              <line
                x1="150"
                y1="30"
                x2="150"
                y2="150"
                stroke={INK}
                strokeWidth="18"
                strokeLinecap="round"
              />
              <g
                style={{
                  transform: `rotate(${lowerAngle}deg)`,
                  transformOrigin: "150px 150px",
                  transition: "transform 450ms ease",
                }}
              >
                <line
                  x1="150"
                  y1="150"
                  x2="150"
                  y2="268"
                  stroke={INK}
                  strokeWidth="18"
                  strokeLinecap="round"
                />
              </g>
              <circle cx="150" cy="150" r="10" fill="#e86f74" stroke={INK} strokeWidth="2" />
              {step >= 2 && (
                <circle cx="150" cy="90" r="14" fill="#fff200" stroke={INK} strokeWidth="2" />
              )}
              {step >= 1 && (
                <text x="170" y="95" fontSize="16" fontWeight="800" fill={INK}>
                  spinal cord
                </text>
              )}
              {step >= 1 && (
                <text x="160" y="150" fontSize="14" fontWeight="800" fill={INK}>
                  knee
                </text>
              )}
            </svg>
          </Panel>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(4, s + 1))}
              disabled={step >= 4}
              className="inline-flex min-h-[52px] items-center gap-2 rounded-2xl border-2 border-foreground bg-foreground px-4 font-black text-background disabled:opacity-40"
            >
              Simulate the tap
            </button>
            <button
              type="button"
              onClick={() => setStep(0)}
              className="inline-flex min-h-[52px] items-center gap-2 rounded-2xl border-2 border-foreground/40 px-4 font-black"
            >
              <RotateCcw className="h-5 w-5" /> Reset
            </button>
          </div>
          <Panel>
            <p className="text-sm font-black uppercase text-muted-foreground">
              {step === 0 ? "Press the button to start" : `Step ${step} of 4`}
            </p>
            {step > 0 && (
              <>
                <h3 className="mt-1 font-display text-2xl">{REFLEX_STEPS[step - 1].title}</h3>
                <p className="mt-2 text-lg font-bold leading-relaxed">
                  {REFLEX_STEPS[step - 1].text}
                </p>
              </>
            )}
          </Panel>
          <p className="rounded-2xl bg-muted/50 p-3 text-base font-bold">{REFLEX_NOTE}</p>
        </div>

        <div className="space-y-3">
          <Panel>
            <p className="font-display text-xl">Challenge: automatic or a choice?</p>
            <div className="mt-3 space-y-3">
              {REFLEX_COMPARE.map((c, i) => {
                const a = answers[i];
                return (
                  <div key={c.action} className="rounded-2xl border-2 border-foreground/30 p-3">
                    <p className="text-lg font-black">{c.action}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => answer(i, true)}
                        className={cn(
                          "min-h-[48px] rounded-2xl border-2 px-4 font-black",
                          a === true &&
                            REFLEX_COMPARE[i].automatic &&
                            "border-emerald-700 bg-emerald-100",
                          "border-foreground/40",
                        )}
                      >
                        Automatic
                      </button>
                      <button
                        type="button"
                        onClick={() => answer(i, false)}
                        className={cn(
                          "min-h-[48px] rounded-2xl border-2 px-4 font-black",
                          a === true &&
                            !REFLEX_COMPARE[i].automatic &&
                            "border-emerald-700 bg-emerald-100",
                          "border-foreground/40",
                        )}
                      >
                        A choice
                      </button>
                    </div>
                    {a !== undefined && (
                      <p aria-live="polite" className="mt-2 text-base font-bold">
                        {a
                          ? `Yes. ${c.why}`
                          : "Not quite. Think about whether you could choose to stop it."}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>
    </section>
  );
}

/* ---------------- E. Memory and Learning ---------------- */

const TILE_COLOURS = [
  "#e86f74",
  "#f4a340",
  "#fff200",
  "#3fa35b",
  "#4a7fb0",
  "#7b4fb8",
  "#e86fb0",
  "#2f7f86",
  "#c97f57",
];

function PatternMemory({
  onAttempt,
  markDone,
}: {
  onAttempt: (length: number, ok: boolean) => void;
  markDone: (id: ChallengeId) => void;
}) {
  const [length, setLength] = useState(3);
  const [seed, setSeed] = useState(1);
  const [phase, setPhase] = useState<"idle" | "show" | "input" | "ok" | "wrong">("idle");
  const [showIdx, setShowIdx] = useState(0);
  const [input, setInput] = useState<number[]>([]);
  const pattern = makePattern(length, seed);

  // Light each tile in turn, then hand over to the child.
  useEffect(() => {
    if (phase !== "show") return;
    if (showIdx >= pattern.length) {
      setPhase("input");
      return;
    }
    const t = setTimeout(() => setShowIdx((i) => i + 1), 700);
    return () => clearTimeout(t);
  }, [phase, showIdx, pattern.length]);

  const lit = phase === "show" && showIdx < pattern.length ? pattern[showIdx] : null;

  const start = (newSeed: boolean) => {
    if (newSeed) setSeed((s) => s + 1);
    setInput([]);
    setShowIdx(0);
    setPhase("show");
  };

  const tap = (i: number) => {
    if (phase !== "input") return;
    const next = [...input, i];
    setInput(next);
    if (next.length === pattern.length) {
      const ok = patternMatches(pattern, next);
      setPhase(ok ? "ok" : "wrong");
      onAttempt(length, ok);
      if (ok) {
        say("You remembered the whole pattern. Mistakes help learning too, so keep practising.");
        if (length >= 4) markDone("memory-pattern");
      }
    }
  };

  const message =
    phase === "show"
      ? "Watch the tiles light up in order."
      : phase === "input"
        ? `Tap the tiles in the same order. ${input.length} of ${pattern.length} so far.`
        : phase === "ok"
          ? "You remembered the whole pattern! Try a longer one."
          : phase === "wrong"
            ? "Not this time, and that is part of learning. Watch it again and try once more."
            : "Press start to see a pattern.";

  return (
    <Panel>
      <p className="font-display text-xl">Pattern Memory</p>
      <p className="mt-1 text-lg font-bold" aria-live="polite">
        {message}
      </p>
      <div
        className="mx-auto mt-4 grid max-w-[300px] grid-cols-3 gap-2"
        role="group"
        aria-label="Pattern tiles"
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => tap(i)}
            disabled={phase !== "input"}
            aria-label={`Tile ${i + 1}`}
            className="aspect-square min-h-[64px] rounded-2xl border-2 border-foreground motion-safe:transition-opacity disabled:cursor-default"
            style={{
              background: TILE_COLOURS[i],
              opacity: lit === i ? 1 : phase === "show" ? 0.25 : 0.7,
            }}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(phase === "idle" || phase === "ok") && (
          <button
            type="button"
            onClick={() => {
              if (phase === "ok") setLength((l) => Math.min(6, l + 1));
              start(true);
            }}
            className="min-h-[52px] rounded-2xl border-2 border-foreground bg-foreground px-4 font-black text-background"
          >
            {phase === "ok" ? "Next, a longer pattern" : "Start"}
          </button>
        )}
        {phase === "wrong" && (
          <button
            type="button"
            onClick={() => start(false)}
            className="min-h-[52px] rounded-2xl border-2 border-foreground bg-foreground px-4 font-black text-background"
          >
            Watch it again
          </button>
        )}
        <p className="self-center text-sm font-bold text-muted-foreground">
          Pattern length: {length}
        </p>
      </div>
    </Panel>
  );
}

function ObservationMemory({ markDone }: { markDone: (id: ChallengeId) => void }) {
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<"look" | "ask">("look");
  const scene = OBSERVATION_ITEMS.filter((_, i) => (i + round) % 3 !== 0).slice(0, 5);

  useEffect(() => {
    if (phase !== "look") return;
    const t = setTimeout(() => setPhase("ask"), 6000);
    return () => clearTimeout(t);
  }, [phase, round]);

  const q = observationQuestion(scene, round);

  return (
    <div className="space-y-3">
      <Panel>
        <p className="font-display text-xl">Observation Memory</p>
        {phase === "look" ? (
          <>
            <p className="mt-1 text-lg font-bold">Look carefully. It will hide in a few seconds.</p>
            <div
              className="mt-3 flex flex-wrap justify-center gap-3 text-5xl"
              role="img"
              aria-label="Scene to remember"
            >
              {scene.map((s, i) => (
                <span key={i}>{s}</span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPhase("ask")}
              className="mt-4 min-h-[48px] rounded-2xl border-2 border-foreground px-4 font-black"
            >
              Hide the scene
            </button>
          </>
        ) : (
          <p className="mt-1 text-lg font-bold">The scene is hidden. Which one was in it?</p>
        )}
      </Panel>
      {phase === "ask" && (
        <QuizCard
          key={round}
          prompt="Which of these was in the scene?"
          choice={{ options: q.options, correctIndex: q.correctIndex }}
          explanation={`Yes, ${q.answer} was in the scene.`}
          hint="Try to picture the scene. Which item stood out?"
          onRight={() => markDone("memory-observation")}
        />
      )}
      {phase === "ask" && (
        <button
          type="button"
          onClick={() => {
            setRound((r) => r + 1);
            setPhase("look");
          }}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl border-2 border-foreground/40 px-4 font-black"
        >
          New scene <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

function MemoryLab({
  onBack,
  markDone,
}: {
  onBack: () => void;
  markDone: (id: ChallengeId) => void;
}) {
  const [tab, setTab] = useState<"pattern" | "observation" | "practice">("pattern");
  const [attempts, setAttempts] = useState<{ length: number; ok: boolean }[]>([]);

  return (
    <section className="mx-auto min-h-dvh w-full max-w-5xl px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(3.75rem,env(safe-area-inset-top))] sm:px-6">
      <Header title="Memory and Learning" backLabel="Investigations" onBack={onBack} />
      <div className="mt-5 flex flex-wrap gap-2">
        <Pill active={tab === "pattern"} onClick={() => setTab("pattern")}>
          Pattern Memory
        </Pill>
        <Pill active={tab === "observation"} onClick={() => setTab("observation")}>
          Observation Memory
        </Pill>
        <Pill active={tab === "practice"} onClick={() => setTab("practice")}>
          Practice Changes Performance
        </Pill>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          {tab === "pattern" && (
            <PatternMemory
              onAttempt={(length, ok) => setAttempts((a) => [...a, { length, ok }])}
              markDone={markDone}
            />
          )}
          {tab === "observation" && <ObservationMemory markDone={markDone} />}
          {tab === "practice" && (
            <Panel>
              <p className="font-display text-xl">Practice Changes Performance</p>
              <p className="mt-2 text-lg font-bold">
                Each try is practice. Your results can change as you practise, and this is a normal
                part of learning.
              </p>
              <p className="mt-2 text-base font-bold text-muted-foreground">
                These notes show your own practice. They do not measure intelligence.
              </p>
            </Panel>
          )}
        </div>
        <div className="space-y-3">
          <Panel>
            <p className="font-display text-xl">Things to know about memory</p>
            <ul className="mt-3 space-y-2 text-base font-bold leading-relaxed">
              {MEMORY_FACTS.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </Panel>
          {tab === "practice" && (
            <Panel>
              <p className="font-black">Your Pattern Memory tries</p>
              {attempts.length === 0 ? (
                <p className="mt-2 text-base font-bold text-muted-foreground">
                  Try a pattern first, then come back here to compare.
                </p>
              ) : (
                <ol className="mt-2 space-y-1 text-base font-bold">
                  {attempts.map((a, i) => (
                    <li key={i}>
                      Try {i + 1}: length {a.length} {a.ok ? "remembered" : "not this time"}
                    </li>
                  ))}
                </ol>
              )}
              {attempts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAttempts([])}
                  className="mt-3 inline-flex min-h-[44px] items-center gap-2 font-black underline"
                >
                  <RotateCcw className="h-4 w-4" /> Clear these notes
                </button>
              )}
            </Panel>
          )}
        </div>
      </div>
    </section>
  );
}
