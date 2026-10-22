import { useEffect, useState, type KeyboardEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrainSensesWorld } from "./BrainSensesLab";
import { isVoiceOn, setVoiceOn, speak, stopVoice } from "@/lib/voice";
import {
  LABS,
  ORGANS,
  ORGAN_IDS,
  organById,
  type OrganEntry,
  type OrganId,
} from "@/data/humanBiology";
import {
  BODY_BACKDROP,
  BODY_LIMBS,
  BODY_PARTS,
  BODY_VIEWBOX,
  INK,
  ORGAN_DRAW_ORDER,
  ORGAN_SHAPES,
  type Shape,
  CALLOUTS,
} from "@/data/humanBiologyBody";

/* ---------------- progress (own key; never gates access) ---------------- */

const KEY = "human-biology-lab-v1";
type Save = { explored: OrganId[]; correct: number };

function loadSave(): Save {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "{}");
    const explored = Array.isArray(s.explored)
      ? s.explored.filter((id: unknown): id is OrganId => ORGAN_IDS.includes(id as OrganId))
      : [];
    return { explored, correct: Number(s.correct) || 0 };
  } catch {
    return { explored: [], correct: 0 };
  }
}

/* ---------------- top level ---------------- */

export function HumanBiologyWorld({ onExit }: { onExit: () => void }) {
  const [view, setView] = useState<"labs" | "atlas" | "brain">("labs");
  const [save, setSave] = useState<Save>(() =>
    typeof window === "undefined" ? { explored: [], correct: 0 } : loadSave(),
  );

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(save));
    } catch {
      /* storage unavailable: keep playing without saving */
    }
  }, [save]);

  useEffect(() => () => stopVoice(), []);

  if (view === "atlas") {
    return <AnatomyAtlas save={save} setSave={setSave} onBack={() => setView("labs")} />;
  }
  if (view === "brain") {
    return <BrainSensesWorld onBack={() => setView("labs")} />;
  }
  return <LabHub onExit={onExit} onOpen={(id) => setView(id === "brain" ? "brain" : "atlas")} />;
}

/* ---------------- shared bits ---------------- */

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

function say(text: string) {
  void speak(text, "en");
}

/* ---------------- lab hub ---------------- */

function LabHub({ onExit, onOpen }: { onExit: () => void; onOpen: (id: string) => void }) {
  return (
    <section className="mx-auto min-h-dvh w-full max-w-5xl px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(3.75rem,env(safe-area-inset-top))] sm:px-6">
      <header className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex h-12 items-center gap-2 rounded-2xl border-2 border-foreground bg-card px-4 font-black shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" /> Home
        </button>
        <VoiceToggle />
      </header>
      <div className="mt-5 text-center">
        <p className="text-sm font-black uppercase text-muted-foreground">
          Learn with Hamad &amp; Talal
        </p>
        <h1 className="mt-1 font-display text-4xl leading-tight sm:text-5xl">Human Biology Lab</h1>
        <p className="mt-2 text-base font-bold text-muted-foreground">
          Explore the body. Tap a lab to begin.
        </p>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 min-[960px]:grid-cols-3">
        {LABS.map((lab) => {
          const ready = lab.status === "ready";
          const body = (
            <>
              <span className="text-4xl leading-none" aria-hidden="true">
                {lab.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-black leading-snug">{lab.title}</span>
                <span className="block text-sm font-bold text-muted-foreground">{lab.detail}</span>
              </span>
              {ready ? (
                <ArrowRight className="h-6 w-6 shrink-0" aria-hidden="true" />
              ) : (
                <span className="shrink-0 rounded-full border border-foreground/30 px-3 py-1 text-xs font-black text-muted-foreground">
                  Coming soon
                </span>
              )}
            </>
          );
          return ready ? (
            <button
              key={lab.id}
              type="button"
              onClick={() => onOpen(lab.id)}
              className="flex min-h-[88px] items-center gap-3 rounded-3xl border-2 border-foreground bg-card p-4 text-left shadow-sm motion-safe:transition-transform active:scale-[0.99]"
            >
              {body}
            </button>
          ) : (
            <div
              key={lab.id}
              aria-disabled="true"
              className="flex min-h-[88px] items-center gap-3 rounded-3xl border-2 border-dashed border-foreground/30 bg-card/60 p-4 text-left"
            >
              {body}
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-center text-sm font-bold text-muted-foreground">
        Coming-soon labs are planned. They are not built yet, and nothing is locked.
      </p>
    </section>
  );
}

/* ---------------- body diagram ---------------- */

function ShapeEl({ shape, color, selected }: { shape: Shape; color: string; selected: boolean }) {
  const fillColor = shape.color ?? color;
  if (shape.kind === "ellipse") {
    return (
      <ellipse
        cx={shape.cx}
        cy={shape.cy}
        rx={shape.rx}
        ry={shape.ry}
        fill={fillColor}
        fillOpacity={0.92}
        stroke={selected ? INK : "none"}
        strokeWidth={2.5}
      />
    );
  }
  if (shape.kind === "fill") {
    return <path d={shape.d} fill={fillColor} stroke={selected ? INK : "none"} strokeWidth={2.5} />;
  }
  return (
    <>
      <path
        d={shape.d}
        fill="none"
        stroke="transparent"
        strokeWidth={Math.max(shape.width, 14)}
        strokeLinecap="round"
        pointerEvents="stroke"
      />
      <path
        d={shape.d}
        fill="none"
        stroke={fillColor}
        strokeWidth={shape.width + (selected ? 1.5 : 0)}
        strokeLinecap="round"
        strokeLinejoin="round"
        pointerEvents="none"
      />
    </>
  );
}

function Callout({ id }: { id: OrganId }) {
  const k = CALLOUTS[id];
  return (
    <g>
      <line
        pointerEvents="none"
        x1={k.lx}
        y1={k.ly}
        x2={k.ax}
        y2={k.ay}
        stroke={INK}
        strokeWidth={1.2}
      />
      <circle pointerEvents="none" cx={k.ax} cy={k.ay} r={2.6} fill={INK} />
      <text
        x={k.tx}
        y={k.ty}
        textAnchor={k.anchor}
        fontSize={17}
        fontWeight={900}
        fill={INK}
        letterSpacing="0.6"
      >
        {k.text}
      </text>
    </g>
  );
}

function OrganHotspot({
  id,
  selected,
  dim,
  interactive,
  onPick,
}: {
  id: OrganId;
  selected: boolean;
  dim: boolean;
  interactive: boolean;
  onPick: (id: OrganId) => void;
}) {
  const { color, shapes } = ORGAN_SHAPES[id];
  const name = organById(id).name;
  const onKey = (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onPick(id);
    }
  };
  return (
    <g
      role={interactive ? "button" : undefined}
      aria-label={interactive ? name : undefined}
      aria-pressed={interactive ? selected : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? () => onPick(id) : undefined}
      onKeyDown={interactive ? onKey : undefined}
      className={cn(
        "motion-safe:transition-opacity",
        interactive && "cursor-pointer focus:outline-none",
        dim ? "opacity-40" : "opacity-100",
      )}
    >
      <title>{name}</title>
      {shapes.map((s, i) => (
        <ShapeEl key={i} shape={s} color={color} selected={selected} />
      ))}
      <Callout id={id} />
    </g>
  );
}

function BodyDiagram({
  selected,
  interactive,
  onPick,
}: {
  selected: OrganId | null;
  interactive: boolean;
  onPick: (id: OrganId) => void;
}) {
  return (
    <svg
      viewBox={BODY_VIEWBOX}
      role="group"
      aria-label="Simplified front view of the body. Tap an organ to learn about it."
      className="mx-auto h-auto w-full max-w-[380px] select-none"
    >
      <rect
        x={-100}
        y={0}
        width={500}
        height={520}
        rx={28}
        fill={BODY_BACKDROP}
        pointerEvents="none"
      />
      {BODY_LIMBS.map((l, i) => (
        <path
          key={`limb-${i}`}
          d={l.d}
          fill="none"
          stroke={l.color}
          strokeWidth={l.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          pointerEvents="none"
        />
      ))}
      {BODY_PARTS.map((p, i) => (
        <path key={`part-${i}`} d={p.d} fill={p.fill} pointerEvents="none" />
      ))}
      {ORGAN_DRAW_ORDER.map((id) => (
        <OrganHotspot
          key={id}
          id={id}
          selected={selected === id}
          dim={selected !== null && selected !== id}
          interactive={interactive}
          onPick={onPick}
        />
      ))}
    </svg>
  );
}

/* ---------------- atlas ---------------- */

type Mode = "discover" | "investigate";
type Tab = "explore" | "challenge";
type Feedback = { ok: boolean; text: string } | null;

function pickOther(current: OrganId | null): OrganId {
  const pool = ORGAN_IDS.filter((id) => id !== current);
  return pool[Math.floor(Math.random() * pool.length)];
}

function AnatomyAtlas({
  save,
  setSave,
  onBack,
}: {
  save: Save;
  setSave: (fn: (s: Save) => Save) => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<Tab>("explore");
  const [selected, setSelected] = useState<OrganId | null>(null);
  const [mode, setMode] = useState<Mode>("discover");

  // Find-the-organ challenge state
  const [findTarget, setFindTarget] = useState<OrganId>(() => pickOther(null));
  const [findSolved, setFindSolved] = useState(false);

  const [attempts, setAttempts] = useState(0);
  const [hintOpen, setHintOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const interactiveDiagram = true;
  const organ = selected ? organById(selected) : null;

  const markExplored = (id: OrganId) => {
    setSave((s) => (s.explored.includes(id) ? s : { ...s, explored: [...s.explored, id] }));
  };
  const addCorrect = () => setSave((s) => ({ ...s, correct: s.correct + 1 }));

  const resetFeedback = () => {
    setAttempts(0);
    setHintOpen(false);
    setFeedback(null);
  };

  const switchTab = (next: Tab) => {
    setTab(next);
    stopVoice();
    resetFeedback();
  };

  const tapOrgan = (id: OrganId) => {
    if (tab === "challenge") {
      if (findSolved) return;
      if (id === findTarget) {
        const name = organById(id).name;
        setFindSolved(true);
        setFeedback({ ok: true, text: `Yes! That is the ${name}.` });
        addCorrect();
        say(`Yes! That is the ${name}.`);
      } else {
        setAttempts((n) => n + 1);
        const wrongName = organById(id).name;
        const msg = `That is the ${wrongName}. Look for the ${organById(findTarget).name}, and try again.`;
        setFeedback({ ok: false, text: msg });
        say(msg);
      }
      return;
    }
    if (tab === "explore") {
      setSelected(id);
      setMode("discover");
      markExplored(id);
      say(organById(id).narration);
    }
  };

  const nextFind = () => {
    setFindTarget((cur) => pickOther(cur));
    setFindSolved(false);
    resetFeedback();
  };

  useEffect(() => {
    if (tab === "challenge" && !findSolved) {
      say(`Find the ${organById(findTarget).name}.`);
    }
    // Speak only when the target changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [findTarget, tab]);

  return (
    <section className="mx-auto min-h-dvh w-full max-w-6xl px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(3.5rem,env(safe-area-inset-top))] sm:px-6">
      <header className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-12 items-center gap-2 rounded-2xl border-2 border-foreground bg-card px-4 font-black shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" /> Labs
        </button>
        <div className="text-center">
          <p className="text-xs font-black uppercase text-muted-foreground">Human Biology Lab</p>
          <h1 className="font-display text-2xl leading-tight sm:text-3xl">Anatomy Atlas</h1>
        </div>
        <VoiceToggle />
      </header>

      <div
        role="tablist"
        aria-label="Atlas mode"
        className="mx-auto mt-4 grid max-w-md grid-cols-2 gap-2 rounded-2xl border-2 border-foreground bg-card p-1"
      >
        {(["explore", "challenge"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => switchTab(t)}
            className={cn(
              "h-12 rounded-xl text-base font-black",
              tab === t ? "bg-foreground text-background" : "text-foreground",
            )}
          >
            {t === "explore" ? "Explore" : "Challenge"}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 min-[960px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] min-[960px]:items-start">
        <div className="rounded-3xl border-2 border-foreground bg-[#dcefe6] p-4">
          <BodyDiagram
            selected={tab === "explore" ? selected : null}
            interactive={interactiveDiagram}
            onPick={tapOrgan}
          />
          {tab === "explore" && (
            <div className="mt-3 flex flex-wrap justify-center gap-2" aria-label="Organ list">
              {ORGANS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => tapOrgan(o.id)}
                  aria-pressed={selected === o.id}
                  className={cn(
                    "inline-flex min-h-12 items-center gap-2 rounded-2xl border-2 px-3 text-base font-black",
                    selected === o.id
                      ? "border-foreground bg-foreground text-background"
                      : "border-foreground/40 bg-background",
                  )}
                >
                  <span aria-hidden="true">{o.emoji}</span>
                  {o.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0">
          {tab === "explore" ? (
            <ExplorePanel
              organ={organ}
              mode={mode}
              setMode={setMode}
              onClear={() => setSelected(null)}
              explored={save.explored}
            />
          ) : (
            <ChallengePanel
              findTarget={organById(findTarget)}
              findSolved={findSolved}
              onNextFind={nextFind}
              attempts={attempts}
              hintOpen={hintOpen}
              onToggleHint={() => setHintOpen((h) => !h)}
              feedback={feedback}
              correct={save.correct}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function ExplorePanel({
  organ,
  mode,
  setMode,
  onClear,
  explored,
}: {
  organ: OrganEntry | null;
  mode: Mode;
  setMode: (m: Mode) => void;
  onClear: () => void;
  explored: OrganId[];
}) {
  if (!organ) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-foreground/40 bg-card/70 p-6 text-center">
        <p className="font-display text-2xl">Tap an organ</p>
        <p className="mt-2 font-bold text-muted-foreground">
          Touch a part of the body, or pick one from the list. Discover what it does and where it
          is.
        </p>
        <p className="mt-3 text-sm font-bold text-muted-foreground">
          Explored: {explored.length} of {ORGANS.length}
        </p>
      </div>
    );
  }
  const text = mode === "discover" ? organ.discover : organ.investigate;
  return (
    <article
      aria-live="polite"
      className="rounded-3xl border-2 border-foreground bg-card p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-black uppercase text-muted-foreground">{organ.category}</p>
          <h2 className="font-display text-3xl leading-tight">
            <span aria-hidden="true" className="mr-2">
              {organ.emoji}
            </span>
            {organ.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex h-12 shrink-0 items-center gap-2 rounded-2xl border-2 border-foreground px-3 font-black"
        >
          <RotateCcw className="h-5 w-5" /> Whole body
        </button>
      </div>

      <div
        role="group"
        aria-label="Explanation level"
        className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-background p-1"
      >
        {(["discover", "investigate"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            className={cn(
              "h-12 rounded-xl text-base font-black capitalize",
              mode === m ? "bg-foreground text-background" : "",
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <p className="mt-4 text-lg font-bold leading-relaxed">{text}</p>

      <dl className="mt-5 grid gap-3 text-base">
        <div>
          <dt className="text-sm font-black uppercase text-muted-foreground">Where it is</dt>
          <dd className="font-bold">{organ.location}</dd>
        </div>
        <div>
          <dt className="text-sm font-black uppercase text-muted-foreground">Works with</dt>
          <dd className="font-bold">{organ.systems.join(", ")}</dd>
        </div>
      </dl>

      <div className="mt-5 rounded-2xl bg-background p-4">
        <p className="text-sm font-black uppercase text-muted-foreground">Try this</p>
        <p className="mt-1 font-bold">{organ.activity}</p>
      </div>

      <button
        type="button"
        onClick={() => say(organ.narration)}
        className="mt-5 inline-flex h-12 items-center gap-2 rounded-2xl border-2 border-foreground px-4 font-black"
      >
        <Volume2 className="h-5 w-5" /> Hear it again
      </button>
    </article>
  );
}

function ChallengePanel(props: {
  findTarget: OrganEntry;
  findSolved: boolean;
  onNextFind: () => void;
  attempts: number;
  hintOpen: boolean;
  onToggleHint: () => void;
  feedback: Feedback;
  correct: number;
}) {
  const { findSolved, attempts, hintOpen, onToggleHint, feedback, correct } = props;
  const showHint = attempts >= 1 || hintOpen;

  return (
    <div className="rounded-3xl border-2 border-foreground bg-card p-5 sm:p-6">
      <p className="text-sm font-black uppercase text-muted-foreground">Tap the body</p>
      <p className="mt-1 font-display text-3xl leading-tight">Find the {props.findTarget.name}</p>
      <button
        type="button"
        onClick={() => say(`Find the ${props.findTarget.name}.`)}
        className="mt-3 inline-flex h-12 items-center gap-2 rounded-2xl border-2 border-foreground px-4 font-black"
      >
        <Volume2 className="h-5 w-5" /> Hear it again
      </button>

      <div aria-live="polite" className="mt-4 min-h-[3rem]">
        {feedback && (
          <p
            className={cn(
              "flex items-start gap-2 rounded-2xl border-2 p-3 font-bold",
              feedback.ok
                ? "border-foreground bg-background"
                : "border-foreground/40 bg-background",
            )}
          >
            {feedback.ok && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />}
            <span>{feedback.text}</span>
          </p>
        )}
      </div>

      {showHint && !findSolved && (
        <p className="mt-2 flex items-start gap-2 text-base font-bold">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>Hint: {props.findTarget.hint}</span>
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!findSolved && (
          <button
            type="button"
            onClick={onToggleHint}
            className="inline-flex h-12 items-center gap-2 rounded-2xl border-2 border-foreground px-4 font-black"
          >
            <Lightbulb className="h-5 w-5" /> {hintOpen ? "Hide hint" : "Show hint"}
          </button>
        )}
        {findSolved && (
          <button
            type="button"
            onClick={props.onNextFind}
            className="inline-flex h-12 items-center gap-2 rounded-2xl border-2 border-foreground bg-foreground px-4 font-black text-background"
          >
            Next <ArrowRight className="h-5 w-5" />
          </button>
        )}
        <span className="ml-auto text-sm font-bold text-muted-foreground">
          Correct so far: {correct}
        </span>
      </div>
    </div>
  );
}
