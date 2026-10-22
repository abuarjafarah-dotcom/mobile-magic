import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/explorerSfx";
import { isVoiceOn, setVoiceOn, speak, stopVoice } from "@/lib/voice";
import { BODY_BACKDROP, BODY_LIMBS, BODY_PARTS, BODY_VIEWBOX, INK } from "@/data/humanBiologyBody";
import {
  BRAIN_FIND_ROUNDS,
  BRAIN_NOTE,
  BRAIN_REGIONS,
  KNEE_NOTE,
  KNEE_SAY,
  MEMORY_NOTE,
  PADS,
  SEE_MESSAGE,
  SENSE_FIND_ROUNDS,
  SENSE_FRIENDS,
  TOUCH_MESSAGE,
  WAVE_SAY,
  makeSequence,
  sequenceMatches,
  type BrainRegionId,
  type SenseFriendId,
} from "@/data/brainSenses";

/* ---------------- shared ---------------- */

// Animations are short and respect reduced motion (the .bhl-anim class is switched off for those users).
const CSS = `
@keyframes bhl-pop { 0% { transform: scale(1) } 40% { transform: scale(1.2) } 100% { transform: scale(1) } }
@keyframes bhl-wiggle { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-10px) rotate(-4deg) } 75% { transform: translateX(10px) rotate(4deg) } }
@keyframes bhl-float { 0% { transform: translateY(0) scale(0.6); opacity: 1 } 100% { transform: translateY(-140px) scale(1.3); opacity: 0 } }
@keyframes bhl-kick { 0% { transform: rotate(0deg) } 30% { transform: rotate(-38deg) } 60% { transform: rotate(8deg) } 100% { transform: rotate(0deg) } }
@keyframes bhl-wave { 0%,100% { transform: rotate(0deg) } 50% { transform: rotate(-75deg) } }
@keyframes bhl-glow { 0%,100% { opacity: 0.4 } 50% { opacity: 1 } }
@media (prefers-reduced-motion: reduce) { .bhl-anim { animation: none !important } }
`;

const BIG =
  "min-h-[72px] min-w-[72px] rounded-3xl border-4 border-foreground font-black motion-safe:transition-transform active:scale-95";

function say(text: string) {
  void speak(text, "en");
}

function Anim({
  name,
  run,
  children,
  className,
}: {
  name: string;
  run: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      key={run}
      className={cn("bhl-anim inline-block", className)}
      style={
        run > 0
          ? { animation: `${name} 0.6s ease`, transformBox: "fill-box", transformOrigin: "center" }
          : undefined
      }
    >
      {children}
    </span>
  );
}

function Confetti({ run }: { run: number }) {
  if (run === 0) return null;
  return (
    <div
      key={run}
      className="pointer-events-none fixed inset-x-0 top-1/3 z-10 flex justify-center gap-4 text-5xl"
      aria-hidden="true"
    >
      {["⭐", "🎉", "⭐", "🌟"].map((e, i) => (
        <span
          key={i}
          className="bhl-anim"
          style={{ animation: `bhl-float 1.2s ease ${i * 0.1}s both` }}
        >
          {e}
        </span>
      ))}
    </div>
  );
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
      className="grid h-16 w-16 place-items-center rounded-3xl border-4 border-foreground bg-card"
    >
      {on ? <Volume2 className="h-8 w-8" /> : <VolumeX className="h-8 w-8" />}
    </button>
  );
}

function Shell({
  title,
  onBack,
  children,
  stars,
}: {
  title: string;
  onBack: () => void;
  children: ReactNode;
  stars?: number;
}) {
  return (
    <section className="mx-auto min-h-dvh w-full max-w-4xl px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(3.5rem,env(safe-area-inset-top))]">
      <style>{CSS}</style>
      <header className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className={cn(BIG, "grid h-16 w-16 place-items-center bg-card text-3xl")}
        >
          <ArrowLeft className="h-8 w-8" />
        </button>
        {stars !== undefined && (
          <p
            className="rounded-3xl border-4 border-foreground bg-card px-4 py-2 text-2xl font-black"
            aria-label={`${stars} stars`}
          >
            ⭐ {stars}
          </p>
        )}
        <VoiceToggle />
      </header>
      <h2 className="mt-4 text-center font-display text-4xl leading-tight">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function GrownUp({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4 text-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="min-h-[44px] font-bold text-muted-foreground underline"
      >
        {open ? "Hide grown-up note" : "Grown-up note"}
      </button>
      {open && (
        <p className="mx-auto mt-2 max-w-xl rounded-2xl bg-card/80 p-3 text-left text-base font-bold">
          {text}
        </p>
      )}
    </div>
  );
}

/** Big tap target with a bounce on each press. */
function Friend({
  emoji,
  label,
  onTap,
  active,
}: {
  emoji: string;
  label: string;
  onTap: () => void;
  active?: boolean;
}) {
  const [run, setRun] = useState(0);
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        setRun((r) => r + 1);
        onTap();
      }}
      className={cn(
        BIG,
        "grid h-28 w-28 place-items-center bg-card text-6xl sm:h-32 sm:w-32",
        active && "bg-yellow-200",
      )}
    >
      <Anim name="bhl-pop" run={run} className="text-6xl">
        {emoji}
      </Anim>
    </button>
  );
}

/* ---------------- top level ---------------- */

type Screen = "home" | "parts" | "message" | "friends" | "knee" | "copy";

export function BrainSensesWorld({ onBack }: { onBack: () => void }) {
  const [screen, setScreen] = useState<Screen>("home");
  const [stars, setStars] = useState(0);
  const [confettiRun, setConfettiRun] = useState(0);

  // Stop narration when moving between games, so voices never overlap.
  useEffect(() => {
    stopVoice();
    return () => stopVoice();
  }, [screen]);

  const star = () => {
    setStars((s) => s + 1);
    setConfettiRun((r) => r + 1);
    sfx("yay");
  };

  const back = () => setScreen("home");
  const props = { stars, onStar: star, onBack: back };

  let body: ReactNode;
  if (screen === "parts") body = <BrainParts {...props} />;
  else if (screen === "message") body = <SendMessage {...props} />;
  else if (screen === "friends") body = <SenseFriends {...props} />;
  else if (screen === "knee") body = <KneeKick {...props} />;
  else if (screen === "copy") body = <CopyMe {...props} />;
  else return <Home onBack={onBack} onOpen={setScreen} stars={stars} />;

  return (
    <>
      <Confetti run={confettiRun} />
      {body}
    </>
  );
}

/* ---------------- home ---------------- */

const GAMES: { id: Screen; title: string; emoji: string; say: string }[] = [
  { id: "parts", title: "Brain Parts", emoji: "🧠", say: "Let's find the brain parts!" },
  {
    id: "message",
    title: "Send a Message",
    emoji: "⚡",
    say: "Let's send a message to the brain!",
  },
  { id: "friends", title: "Sense Friends", emoji: "👀", say: "Let's meet the sense friends!" },
  { id: "knee", title: "Knee Kick", emoji: "🦵", say: "Let's try a knee kick!" },
  { id: "copy", title: "Copy Me", emoji: "🎵", say: "Let's play copy me!" },
];

function Home({
  onBack,
  onOpen,
  stars,
}: {
  onBack: () => void;
  onOpen: (s: Screen) => void;
  stars: number;
}) {
  return (
    <section className="mx-auto min-h-dvh w-full max-w-4xl px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(3.5rem,env(safe-area-inset-top))]">
      <style>{CSS}</style>
      <header className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to labs"
          className={cn(BIG, "grid h-16 w-16 place-items-center bg-card text-3xl")}
        >
          <ArrowLeft className="h-8 w-8" />
        </button>
        <p className="rounded-3xl border-4 border-foreground bg-card px-4 py-2 text-2xl font-black">
          ⭐ {stars}
        </p>
        <VoiceToggle />
      </header>
      <h2 className="mt-4 text-center font-display text-4xl">Brain and Senses</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => {
              say(g.say);
              onOpen(g.id);
            }}
            className="flex min-h-[150px] flex-col items-center justify-center gap-2 rounded-3xl border-4 border-foreground bg-card p-3 text-center font-black motion-safe:transition-transform active:scale-95"
          >
            <span className="text-6xl" aria-hidden="true">
              {g.emoji}
            </span>
            <span className="text-lg leading-tight">{g.title}</span>
          </button>
        ))}
      </div>
      <p className="mt-6 text-center text-base font-bold text-muted-foreground">
        Tap anything to play. Nothing is locked.
      </p>
    </section>
  );
}

/* ---------------- Brain Parts: tap to pop, then find ---------------- */

const REGION_COLOUR: Record<BrainRegionId, string> = {
  cerebrum: "#e86f74",
  cerebellum: "#7b4fb8",
  brainstem: "#f4a340",
  spinalCord: "#f4ecd8",
};

function BrainPicture({
  onTap,
  popping,
  shake,
}: {
  onTap: (id: BrainRegionId) => void;
  popping: { id: BrainRegionId; run: number } | null;
  shake: number;
}) {
  const part = (id: BrainRegionId, name: string, el: ReactNode) => (
    <g
      role="button"
      aria-label={name}
      tabIndex={0}
      onClick={() => onTap(id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap(id);
        }
      }}
      className="cursor-pointer focus:outline-none"
      style={
        popping?.id === id
          ? { animation: "bhl-pop 0.5s ease", transformBox: "fill-box", transformOrigin: "center" }
          : undefined
      }
      key={`${id}-${popping?.id === id ? popping.run : 0}`}
    >
      {el}
    </g>
  );
  return (
    <div
      key={shake}
      className="bhl-anim"
      style={shake ? { animation: "bhl-wiggle 0.4s ease" } : undefined}
    >
      <svg
        viewBox="0 0 400 330"
        className="mx-auto h-auto w-full max-w-[460px]"
        role="group"
        aria-label="Brain picture. Tap a part."
      >
        <rect
          x="0"
          y="0"
          width="400"
          height="330"
          rx="32"
          fill={BODY_BACKDROP}
          pointerEvents="none"
        />
        {part(
          "spinalCord",
          "Message cord",
          <path
            d="M200 262 L200 318"
            stroke={REGION_COLOUR.spinalCord}
            strokeWidth={16}
            strokeLinecap="round"
            fill="none"
          />,
        )}
        {part(
          "brainstem",
          "Breathing part",
          <path d="M184 196 L216 196 L222 268 L178 268 Z" fill={REGION_COLOUR.brainstem} />,
        )}
        {part(
          "cerebellum",
          "Balance part",
          <ellipse cx="282" cy="224" rx="46" ry="28" fill={REGION_COLOUR.cerebellum} />,
        )}
        {part(
          "cerebrum",
          "Big thinking part",
          <path
            d="M84 150 C78 88 128 48 200 52 C272 56 326 98 322 150 C320 196 280 206 226 204 L142 206 C108 206 88 190 84 150 Z"
            fill={REGION_COLOUR.cerebrum}
          />,
        )}
      </svg>
    </div>
  );
}

function BrainParts({
  stars,
  onStar,
  onBack,
}: {
  stars: number;
  onStar: () => void;
  onBack: () => void;
}) {
  const [round, setRound] = useState(0);
  const [popping, setPopping] = useState<{ id: BrainRegionId; run: number } | null>(null);
  const [shake, setShake] = useState(0);
  const [explored, setExplored] = useState(false);
  const [wait, setWait] = useState(false);
  const runRef = useRef(0);
  const finished = round >= BRAIN_FIND_ROUNDS.length;

  const tap = (id: BrainRegionId) => {
    runRef.current += 1;
    setPopping({ id, run: runRef.current });
    sfx("pop");
    if (!explored) {
      setExplored(true);
      say("Tap each part to hear what it does!");
    }
    const region = BRAIN_REGIONS.find((r) => r.id === id)!;
    if (wait) return;
    if (!finished) {
      const target = BRAIN_FIND_ROUNDS[round].target;
      if (id === target) {
        setWait(true);
        onStar();
        say("Yes! Great finding!");
        setTimeout(() => {
          setRound((r) => r + 1);
          setWait(false);
        }, 1400);
        return;
      }
      setShake((s) => s + 1);
      say("Almost! Try another part.");
      return;
    }
    say(region.say);
  };

  const region = (id: BrainRegionId) => BRAIN_REGIONS.find((r) => r.id === id)!;

  return (
    <Shell title="Brain Parts" onBack={onBack} stars={stars}>
      <BrainPicture onTap={tap} popping={popping} shake={shake} />
      <div className="mt-5 text-center">
        {!finished ? (
          <>
            <p className="font-display text-3xl">{BRAIN_FIND_ROUNDS[round].ask}</p>
            <button
              type="button"
              onClick={() => say(BRAIN_FIND_ROUNDS[round].ask)}
              className={cn(BIG, "mt-3 bg-card px-6 text-2xl")}
            >
              🔊 Say it again
            </button>
          </>
        ) : (
          <>
            <p className="font-display text-3xl">You found them all! 🎉</p>
            <p className="mt-2 text-xl font-bold">Tap any part to hear about it.</p>
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              {(["cerebrum", "cerebellum", "brainstem", "spinalCord"] as BrainRegionId[]).map(
                (id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => say(region(id).say)}
                    className={cn(BIG, "bg-card px-4 text-lg")}
                  >
                    {region(id).emoji} {region(id).name}
                  </button>
                ),
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setRound(0);
                setExplored(false);
              }}
              className={cn(BIG, "mt-4 bg-card px-6 text-xl")}
            >
              Play again
            </button>
          </>
        )}
      </div>
      <GrownUp text={BRAIN_NOTE} />
    </Shell>
  );
}

/* ---------------- Send a Message: watch the signal travel ---------------- */

const SENSORY_PATH = "M240 300 L228 226 L188 136 L160 130 L150 150 L150 62";
const EYE_PATH = "M132 62 L150 54 L174 60";

function SendMessage({
  stars,
  onStar,
  onBack,
}: {
  stars: number;
  onStar: () => void;
  onBack: () => void;
}) {
  const [mode, setMode] = useState<"touch" | "see" | null>(null);
  const [run, setRun] = useState(0);
  const [landed, setLanded] = useState(false);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const start = (m: "touch" | "see") => {
    if (timer) clearTimeout(timer);
    setMode(m);
    setRun((r) => r + 1);
    setLanded(false);
    say(m === "touch" ? TOUCH_MESSAGE.say : SEE_MESSAGE.say);
    const t = setTimeout(() => {
      setLanded(true);
      sfx("chime");
      say(m === "touch" ? TOUCH_MESSAGE.after : SEE_MESSAGE.after);
      onStar();
    }, 2200);
    setTimer(t);
  };

  useEffect(
    () => () => {
      if (timer) clearTimeout(timer);
    },
    [timer],
  );

  const path = mode === "see" ? EYE_PATH : SENSORY_PATH;

  return (
    <Shell title="Send a Message" onBack={onBack} stars={stars}>
      <svg
        viewBox={BODY_VIEWBOX}
        className="mx-auto h-auto w-full max-w-[380px]"
        role="img"
        aria-label="Body picture with a message travelling to the brain"
      >
        <rect x="-100" y="0" width="500" height="520" rx="28" fill={BODY_BACKDROP} />
        {BODY_LIMBS.map((l, i) => (
          <path
            key={`l${i}`}
            d={l.d}
            fill="none"
            stroke={l.color}
            strokeWidth={l.width}
            strokeLinecap="round"
          />
        ))}
        {BODY_PARTS.map((p, i) => (
          <path key={`p${i}`} d={p.d} fill={p.fill} />
        ))}
        {mode && (
          <path
            d={path}
            fill="none"
            stroke={INK}
            strokeOpacity={0.25}
            strokeWidth={3}
            strokeDasharray="6 8"
            strokeLinecap="round"
          />
        )}
        {mode && !landed && (
          <g key={`run-${run}`}>
            <circle r={9} fill="#fff200" stroke={INK} strokeWidth={2}>
              <animateMotion dur="2s" fill="freeze" path={path} />
            </circle>
          </g>
        )}
        {mode && landed && (
          <circle
            cx={path === EYE_PATH ? 174 : 150}
            cy={path === EYE_PATH ? 60 : 56}
            r={12}
            fill="#fff200"
            stroke={INK}
            strokeWidth={2}
          >
            <animate attributeName="r" values="10;20;10" dur="0.9s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => start("touch")}
          className={cn(BIG, "min-h-[120px] bg-card text-2xl")}
        >
          <span className="block text-5xl">{TOUCH_MESSAGE.emoji}</span>
          {TOUCH_MESSAGE.title}
        </button>
        <button
          type="button"
          onClick={() => start("see")}
          className={cn(BIG, "min-h-[120px] bg-card text-2xl")}
        >
          <span className="block text-5xl">{SEE_MESSAGE.emoji}</span>
          {SEE_MESSAGE.title}
        </button>
      </div>
      <GrownUp text={`${TOUCH_MESSAGE.grownUp} ${SEE_MESSAGE.grownUp}`} />
    </Shell>
  );
}

/* ---------------- Five Sense Friends: tap, then find ---------------- */

function SenseFriends({
  stars,
  onStar,
  onBack,
}: {
  stars: number;
  onStar: () => void;
  onBack: () => void;
}) {
  const [round, setRound] = useState(0);
  const [active, setActive] = useState<SenseFriendId | null>(null);
  const [wait, setWait] = useState(false);
  const [shake, setShake] = useState(0);
  const [bright, setBright] = useState(true);
  const finished = round >= SENSE_FIND_ROUNDS.length;

  const tap = (id: SenseFriendId) => {
    const friend = SENSE_FRIENDS.find((f) => f.id === id)!;
    setActive(id);
    sfx("pop");
    if (wait) return;
    if (!finished && id !== SENSE_FIND_ROUNDS[round].target) {
      setShake((s) => s + 1);
      say("Almost! Try another friend.");
      return;
    }
    say(friend.say);
    if (!finished) {
      setWait(true);
      onStar();
      setTimeout(() => {
        setRound((r) => r + 1);
        setWait(false);
        setActive(null);
      }, 2200);
    }
  };

  return (
    <Shell title="Sense Friends" onBack={onBack} stars={stars}>
      <div
        key={shake}
        className="bhl-anim flex flex-wrap justify-center gap-4"
        style={shake ? { animation: "bhl-wiggle 0.4s ease" } : undefined}
      >
        {SENSE_FRIENDS.map((f) => (
          <Friend
            key={f.id}
            emoji={f.emoji}
            label={f.id}
            active={active === f.id}
            onTap={() => tap(f.id)}
          />
        ))}
      </div>
      <div className="mt-6 text-center">
        {!finished ? (
          <>
            <p className="font-display text-3xl">{SENSE_FIND_ROUNDS[round].ask}</p>
            <button
              type="button"
              onClick={() => say(SENSE_FIND_ROUNDS[round].ask)}
              className={cn(BIG, "mt-3 bg-card px-6 text-2xl")}
            >
              🔊 Say it again
            </button>
          </>
        ) : (
          <>
            <p className="font-display text-3xl">Sense friends, all met! 🎉</p>
            <button
              type="button"
              onClick={() => setRound(0)}
              className={cn(BIG, "mt-3 bg-card px-6 text-xl")}
            >
              Play again
            </button>
          </>
        )}
      </div>

      <div className="mx-auto mt-8 max-w-sm rounded-3xl border-4 border-foreground bg-card p-4 text-center">
        <p className="text-xl font-black">Pupil friend 👀</p>
        <svg
          viewBox="0 0 120 120"
          className="mx-auto mt-2 h-32 w-32"
          role="img"
          aria-label={bright ? "Small pupil in bright light" : "Big pupil in the dark"}
        >
          <circle cx="60" cy="60" r="54" fill="#f6f1e7" stroke={INK} strokeWidth="2" />
          <circle cx="60" cy="60" r="40" fill="#4a7fb0" />
          <circle
            cx="60"
            cy="60"
            r={bright ? 10 : 30}
            fill="#1b1b1b"
            style={{ transition: "r 0.8s ease" }}
          />
        </svg>
        <div className="mt-3 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setBright(true);
              say("Bright light! The pupil gets small.");
            }}
            className={cn(BIG, "bg-yellow-200 px-4 text-lg")}
          >
            ☀️ Bright
          </button>
          <button
            type="button"
            onClick={() => {
              setBright(false);
              say("Dark room! The pupil gets big.");
            }}
            className={cn(BIG, "bg-card px-4 text-lg")}
          >
            🌙 Dark
          </button>
        </div>
      </div>
      <GrownUp text={SENSE_FRIENDS.map((f) => f.grownUp).join(" ")} />
    </Shell>
  );
}

/* ---------------- Knee Kick: a reflex and a choice ---------------- */

function KneeKick({
  stars,
  onStar,
  onBack,
}: {
  stars: number;
  onStar: () => void;
  onBack: () => void;
}) {
  const [kick, setKick] = useState(0);
  const [wave, setWave] = useState(0);

  return (
    <Shell title="Knee Kick" onBack={onBack} stars={stars}>
      <div className="mx-auto max-w-sm rounded-3xl border-4 border-foreground bg-card p-4">
        <svg
          viewBox="0 0 300 300"
          className="mx-auto h-auto w-full"
          role="img"
          aria-label="A leg picture"
        >
          <rect x="0" y="0" width="300" height="300" rx="24" fill={BODY_BACKDROP} />
          {/* arm (rotates when you wave) */}
          <g
            style={{
              transformOrigin: "220px 70px",
              transformBox: "view-box",
              transform: `rotate(${wave % 2 ? -70 : 0}deg)`,
              transition: "transform 0.6s ease",
            }}
          >
            <line
              x1="220"
              y1="70"
              x2="220"
              y2="150"
              stroke="#2f7f86"
              strokeWidth="22"
              strokeLinecap="round"
            />
          </g>
          <line
            x1="150"
            y1="30"
            x2="150"
            y2="150"
            stroke={INK}
            strokeWidth="22"
            strokeLinecap="round"
          />
          <g
            key={kick}
            style={
              kick
                ? {
                    animation: "bhl-kick 0.7s ease",
                    transformBox: "view-box",
                    transformOrigin: "150px 150px",
                  }
                : undefined
            }
          >
            <line
              x1="150"
              y1="150"
              x2="150"
              y2="270"
              stroke={INK}
              strokeWidth="22"
              strokeLinecap="round"
            />
          </g>
          <circle cx="150" cy="150" r="12" fill="#e86f74" stroke={INK} strokeWidth="2" />
        </svg>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => {
            setKick((k) => k + 1);
            sfx("pop");
            say(KNEE_SAY);
            onStar();
          }}
          className={cn(BIG, "min-h-[120px] bg-card text-2xl")}
        >
          <span className="block text-5xl">🦵</span>
          Tap the knee!
        </button>
        <button
          type="button"
          onClick={() => {
            setWave((w) => w + 1);
            sfx("chime");
            say(WAVE_SAY);
            onStar();
          }}
          className={cn(BIG, "min-h-[120px] bg-card text-2xl")}
        >
          <span className="block text-5xl">👋</span>
          Wave hello!
        </button>
      </div>
      <GrownUp text={KNEE_NOTE} />
    </Shell>
  );
}

/* ---------------- Copy Me: listen, then copy ---------------- */

let noteCtx: AudioContext | null = null;
function playNote(freq: number) {
  try {
    noteCtx ??= new AudioContext();
    const c = noteCtx;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.15, c.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.5);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.55);
  } catch {
    /* audio unavailable */
  }
}

function CopyMe({
  stars,
  onStar,
  onBack,
}: {
  stars: number;
  onStar: () => void;
  onBack: () => void;
}) {
  const [length, setLength] = useState(2);
  const [seed, setSeed] = useState(1);
  const [phase, setPhase] = useState<"listen" | "copy" | "yes" | "oops">("listen");
  const [showIdx, setShowIdx] = useState(-1);
  const [input, setInput] = useState<number[]>([]);
  const [flash, setFlash] = useState<number | null>(null);
  const seq = useMemo(() => makeSequence(length, seed), [length, seed]);

  // Light and sound each pad in turn while listening.
  useEffect(() => {
    if (phase !== "listen") return;
    if (showIdx < 0) {
      const t = setTimeout(() => setShowIdx(0), 600);
      return () => clearTimeout(t);
    }
    if (showIdx >= seq.length) {
      const t = setTimeout(() => {
        setFlash(null);
        setPhase("copy");
        say("Your turn! Copy me.");
      }, 500);
      return () => clearTimeout(t);
    }
    setFlash(seq[showIdx]);
    playNote(PADS[seq[showIdx]].freq);
    const t = setTimeout(() => {
      setFlash(null);
      setShowIdx((i) => i + 1);
    }, 700);
    return () => clearTimeout(t);
  }, [phase, showIdx, seq]);

  const listen = (nextSeed: number, len: number) => {
    setSeed(nextSeed);
    setLength(len);
    setInput([]);
    setShowIdx(-1);
    setPhase("listen");
    say("Listen carefully!");
  };

  const tap = (i: number) => {
    if (phase !== "copy") return;
    playNote(PADS[i].freq);
    setFlash(i);
    setTimeout(() => setFlash(null), 250);
    const next = [...input, i];
    setInput(next);
    if (next.length === seq.length) {
      if (sequenceMatches(seq, next)) {
        setPhase("yes");
        onStar();
        sfx("yay");
        say("You did it! Super copying!");
        setTimeout(() => listen(seed + 1, Math.min(4, length + 1)), 1800);
      } else {
        setPhase("oops");
        say("Oops! Let's listen again.");
        setTimeout(() => listen(seed, length), 1800);
      }
    }
  };

  const message =
    phase === "listen"
      ? "Listen and watch!"
      : phase === "copy"
        ? "Your turn! Tap the colours."
        : phase === "yes"
          ? "Yes! 🎉"
          : "Oops! Let's try again.";

  return (
    <Shell title="Copy Me" onBack={onBack} stars={stars}>
      <p className="text-center text-2xl font-black" aria-live="polite">
        {message}
      </p>
      <div className="mx-auto mt-5 grid max-w-sm grid-cols-2 gap-4">
        {PADS.map((p, i) => (
          <button
            key={p.name}
            type="button"
            aria-label={p.name}
            onClick={() => tap(i)}
            disabled={phase !== "copy"}
            className="aspect-square min-h-[120px] rounded-3xl border-4 border-foreground motion-safe:transition-transform active:scale-95 disabled:cursor-default"
            style={{
              background: p.colour,
              filter: flash === i ? "brightness(1.35)" : "none",
              transform: flash === i ? "scale(1.06)" : "scale(1)",
            }}
          />
        ))}
      </div>
      {phase === "listen" && showIdx < 0 && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => listen(seed, length)}
            className={cn(BIG, "bg-card px-6 text-xl")}
          >
            Start
          </button>
        </div>
      )}
      <GrownUp text={MEMORY_NOTE} />
    </Shell>
  );
}
