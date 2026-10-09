import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Volume2 } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { shuffle } from "@/components/learn/shared";
import { cn } from "@/lib/utils";
import { speak, stopVoice, type VoiceLang } from "@/lib/voice";
import {
  ACTIVITIES,
  MAMA,
  PRAISE,
  PRAYERS,
  RAKAH_CYCLE,
  SALAH_VIDEO,
  T,
  TOPICS,
  TRY_AGAIN,
  WUDU_STEPS,
  WUDU_VIDEO,
  arNum,
  buildPrayer,
  type Activity,
  type Bi,
  type Prayer,
  type Step,
  type Topic,
} from "@/data/wuduSalah";
import mamaExplain from "@/assets/salah/mama-explain.webp";
import mamaHint from "@/assets/salah/mama-hint.webp";
import rewardStar from "@/assets/salah/reward-star.webp";
import token from "@/assets/salah/progress-token.webp";
import masjidRoom from "@/assets/salah/masjid-room.webp";
import mosqueIcon from "@/assets/salah/mosque-icon.webp";

type Sfx = "pop" | "click" | "chime" | "yay" | "water" | "warm";
type Props = { play: (k: Sfx) => void; done: readonly string[]; onComplete: (id: string) => void };
type Ctx = Props & { lang: VoiceLang };

/* ---------------- small shared pieces ---------------- */

/** Arabic first (RTL, shaped), English underneath — the Explorer convention. */
function BiText({
  t,
  size = "md",
  className,
}: {
  t: Bi;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const ar = { sm: "text-base", md: "text-xl", lg: "text-2xl", xl: "text-3xl" }[size];
  const en = { sm: "text-xs", md: "text-sm", lg: "text-base", xl: "text-lg" }[size];
  return (
    <span className={cn("grid gap-0.5", className)}>
      <span
        lang="ar"
        dir="rtl"
        className={cn("block font-arabic font-black leading-snug [text-align:inherit]", ar)}
      >
        {t.ar}
      </span>
      <span lang="en" dir="ltr" className={cn("block font-bold opacity-80", en)}>
        {t.en}
      </span>
    </span>
  );
}

const say = (t: Bi, lang: VoiceLang) => {
  void speak(lang === "ar" ? t.ar : t.en, lang);
};

function Mama({ line, worried, lang }: { line: Bi; worried?: boolean; lang: VoiceLang }) {
  return (
    <button
      type="button"
      onClick={() => say(line, lang)}
      className="flex w-full items-end gap-2 text-start"
      aria-label={`${T.mama.en}: ${line.en}`}
    >
      <img
        src={worried ? mamaHint : mamaExplain}
        alt=""
        draggable={false}
        className="h-24 w-auto shrink-0 drop-shadow-md sm:h-28"
      />
      <span className="relative mb-3 flex-1 rounded-2xl bg-card px-4 py-3 shadow-sm">
        <span className="mb-1 flex items-center gap-1 text-xs font-black text-muted-foreground">
          <span lang="ar" dir="rtl" className="font-arabic">
            {T.mama.ar}
          </span>{" "}
          · {T.mama.en} <Volume2 className="h-3.5 w-3.5" />
        </span>
        <BiText t={line} size="sm" />
      </span>
    </button>
  );
}

function Tokens({ n, total }: { n: number; total: number }) {
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-1"
      aria-label={`${n} / ${total}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <img
          key={i}
          src={token}
          alt=""
          className={cn("h-6 w-6 transition", i < n ? "animate-pop-in" : "opacity-25 grayscale")}
        />
      ))}
    </div>
  );
}

function Pose({ step, className }: { step: Step; className?: string }) {
  return (
    <img
      src={step.img}
      alt={step.title.en}
      draggable={false}
      className={cn("mx-auto h-56 w-auto object-contain drop-shadow-lg sm:h-64", className)}
    />
  );
}

function Praise({ t }: { t: Bi | null }) {
  if (!t) return null;
  return (
    <p className="animate-pop-in rounded-2xl bg-success px-4 py-2 text-center text-success-foreground">
      <BiText t={t} size="sm" />
    </p>
  );
}

function Win({
  text,
  onAgain,
  onDone,
  play,
}: {
  text: Bi;
  onAgain: () => void;
  onDone: () => void;
  play: Props["play"];
}) {
  useEffect(() => {
    play("yay");
  }, [play]);
  return (
    <div className="mt-6 grid place-items-center gap-4 text-center">
      <img src={rewardStar} alt="" className="animate-hamad-cheer h-36 w-36 drop-shadow-xl" />
      <BiText t={text} size="lg" />
      <div className="grid w-full grid-cols-2 gap-3">
        <GameButton tone="mint" className="min-h-14" onClick={onAgain}>
          <BiText t={T.again} size="sm" />
        </GameButton>
        <GameButton tone="sun" className="min-h-14" onClick={onDone}>
          <BiText t={T.done} size="sm" />
        </GameButton>
      </div>
    </div>
  );
}

function VideoCard({ src, poster }: { src: string | null; poster: string }) {
  if (!src) {
    return (
      <div
        className="grid aspect-video w-full place-items-center overflow-hidden rounded-3xl bg-card shadow-md"
        style={{ backgroundImage: `url(${masjidRoom})`, backgroundSize: "cover" }}
      >
        <div className="grid place-items-center gap-1 rounded-2xl bg-card/90 px-4 py-3 text-center">
          <img src={poster} alt="" className="h-20 w-auto" />
          <BiText t={T.videoSoon} size="sm" />
        </div>
      </div>
    );
  }
  // Never autoplays with sound: the child starts it with the native controls (play/pause/replay).
  return (
    <video
      src={src}
      poster={poster}
      controls
      playsInline
      preload="metadata"
      className="aspect-video w-full rounded-3xl bg-black object-contain shadow-md"
    />
  );
}

/* ---------------- activities ---------------- */

function Learn({ topic, ctx, onFinish }: { topic: Topic; ctx: Ctx; onFinish: () => void }) {
  const [prayer, setPrayer] = useState<Prayer>(PRAYERS[0]!);
  const steps = useMemo<(Step & { rakah?: number })[]>(
    () => (topic === "wudu" ? [...WUDU_STEPS] : buildPrayer(prayer.rakahs)),
    [topic, prayer],
  );
  const [i, setI] = useState(-1); // -1 = the video card
  const step = i >= 0 ? steps[i]! : null;
  const go = (n: number) => {
    ctx.play("pop");
    if (n >= steps.length) {
      ctx.onComplete(`ws-learn-${topic}`);
      onFinish();
      return;
    }
    setI(n);
    const s = steps[n];
    if (s) say({ ar: `${s.title.ar}. ${s.how.ar}`, en: `${s.title.en}. ${s.how.en}` }, ctx.lang);
  };
  useEffect(() => () => stopVoice(), []);
  return (
    <div className="grid gap-4">
      {topic === "salah" && (
        <div className="grid gap-2">
          <BiText t={T.pickPrayer} size="sm" className="text-center" />
          <div className="grid grid-cols-5 gap-2">
            {PRAYERS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPrayer(p);
                  setI(-1);
                  ctx.play("click");
                }}
                className={cn(
                  "grid min-h-16 place-items-center rounded-2xl bg-card p-1 text-center font-black shadow transition active:scale-95",
                  p.id === prayer.id &&
                    "bg-secondary text-secondary-foreground ring-4 ring-secondary/40",
                )}
              >
                <span className="text-xl">{p.e}</span>
                <span lang="ar" dir="rtl" className="font-arabic text-sm leading-tight">
                  {p.name.ar}
                </span>
                <span className="text-[10px]">{p.name.en}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {step === null ? (
        <div className="grid gap-3">
          <VideoCard
            src={topic === "wudu" ? WUDU_VIDEO : SALAH_VIDEO}
            poster={topic === "wudu" ? WUDU_STEPS[2]!.img : RAKAH_CYCLE[0]!.img}
          />
          <p className="text-center">
            <BiText t={T.videoNote} size="sm" />
          </p>
          <GameButton tone="sun" className="min-h-16 text-lg" onClick={() => go(0)}>
            <span className="flex items-center justify-center gap-2">
              <BiText t={T.stepOf} size="sm" /> <span>{arNum(1)}</span>
              <ArrowRight className="h-5 w-5 rtl:rotate-180" />
            </span>
          </GameButton>
        </div>
      ) : (
        <div key={i} className="animate-pop-in grid gap-3 rounded-3xl bg-card p-4 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-black text-muted-foreground">
            <span>
              <span lang="ar" dir="rtl" className="font-arabic">
                {T.stepOf.ar} {arNum(i + 1)} {T.of.ar} {arNum(steps.length)}
              </span>{" "}
              · {T.stepOf.en} {i + 1} {T.of.en} {steps.length}
            </span>
            {step.rakah && (
              <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
                <span lang="ar" dir="rtl" className="font-arabic">
                  {T.rakahOf.ar} {arNum(step.rakah)} {T.of.ar} {arNum(prayer.rakahs)}
                </span>{" "}
                · {T.rakahOf.en} {step.rakah}/{prayer.rakahs}
              </span>
            )}
            {step.kind === "heart" && (
              <span className="rounded-full bg-accent px-3 py-1 text-accent-foreground">
                💗{" "}
                <span lang="ar" dir="rtl" className="font-arabic">
                  {T.heart.ar}
                </span>{" "}
                · {T.heart.en}
              </span>
            )}
            {step.kind === "say" && step.say && (
              <span className="rounded-full bg-primary px-3 py-1 text-primary-foreground">
                🗣️{" "}
                <span lang="ar" dir="rtl" className="font-arabic">
                  {T.sayIt.ar}
                </span>{" "}
                · {T.sayIt.en}
              </span>
            )}
          </div>
          <Pose step={step} />
          {step.say && (
            <p
              lang="ar"
              dir="rtl"
              className="text-center font-arabic text-3xl font-black text-primary"
            >
              {step.say.ar}
            </p>
          )}
          <BiText t={step.title} size="xl" className="text-center" />
          <BiText t={step.how} size="md" className="text-center" />
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2">
            <GameButton
              tone="neutral"
              className="min-h-14"
              disabled={i < 0}
              onClick={() => (i === 0 ? setI(-1) : go(i - 1))}
              aria-label={T.back.en}
            >
              <ArrowLeft className="mx-auto h-6 w-6 rtl:rotate-180" />
            </GameButton>
            <GameButton
              tone="sky"
              className="grid min-h-14 w-14 place-items-center p-0"
              onClick={() =>
                say(
                  {
                    ar: `${step.title.ar}. ${step.how.ar}`,
                    en: `${step.title.en}. ${step.how.en}`,
                  },
                  ctx.lang,
                )
              }
              aria-label={T.hear.en}
            >
              <Volume2 className="h-6 w-6" />
            </GameButton>
            <GameButton tone="sun" className="min-h-14" onClick={() => go(i + 1)}>
              <BiText t={i === steps.length - 1 ? T.done : T.next} size="sm" />
            </GameButton>
          </div>
          <Tokens n={i + 1} total={steps.length} />
        </div>
      )}
    </div>
  );
}

/** Tap the picture cards in order; wrong taps never undo what's placed. */
function Arrange({
  topic,
  ctx,
  onWin,
  setMama,
}: {
  topic: Topic;
  ctx: Ctx;
  onWin: () => void;
  setMama: (b: Bi | null) => void;
}) {
  const target = useMemo(
    () => (topic === "wudu" ? WUDU_STEPS.filter((s) => s.kind === "body") : [...RAKAH_CYCLE]),
    [topic],
  );
  const tiles = useMemo(() => shuffle(target), [target]);
  const [placed, setPlaced] = useState<Step[]>([]);
  const [used, setUsed] = useState<string[]>([]);
  const [shake, setShake] = useState<string | null>(null);
  const [praise, setPraise] = useState<Bi | null>(null);
  const tap = (s: Step) => {
    const want = target[placed.length]!;
    // Twin poses share a picture (standing/rising, 1st/2nd sujud): either card is right.
    if (s.id === want.id || s.img === want.img) {
      ctx.play("pop");
      setMama(null);
      setUsed((u) => [...u, s.id]);
      const next = [...placed, want];
      setPlaced(next);
      setPraise(PRAISE[next.length % PRAISE.length]!);
      if (next.length === target.length) {
        ctx.onComplete(`ws-arrange-${topic}`);
        setTimeout(onWin, 700);
      }
    } else {
      ctx.play("click");
      setShake(s.id);
      setTimeout(() => setShake(null), 500);
      setPraise(null);
      setMama(want.hint);
      say(want.hint, ctx.lang);
    }
  };
  return (
    <div className="grid gap-3">
      <p className="rounded-2xl bg-card px-4 py-3 text-center shadow-sm">
        <BiText t={topic === "wudu" ? T.arrangeWudu : T.arrangeSalah} size="sm" />
      </p>
      {topic === "wudu" && (
        <p className="rounded-2xl bg-accent/20 px-3 py-2 text-center">
          <BiText t={T.arrangeReady} size="sm" />
        </p>
      )}
      <div
        dir="rtl"
        className="flex min-h-20 flex-wrap items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border bg-card/50 p-2"
      >
        {placed.map((s, k) => (
          <span key={s.id} className="animate-pop-in relative">
            <img src={s.img} alt={s.title.en} className="h-16 w-auto" />
            <span className="absolute -top-1 start-0 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">
              {arNum(k + 1)}
            </span>
          </span>
        ))}
        {placed.length < target.length && <span className="text-3xl opacity-30">…</span>}
      </div>
      <Praise t={praise} />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {tiles.map((s) => {
          const isUsed = used.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              disabled={isUsed}
              onClick={() => tap(s)}
              className={cn(
                "grid min-h-32 place-items-center gap-1 rounded-2xl bg-card p-2 text-center shadow transition active:scale-95",
                isUsed && "opacity-30",
                shake === s.id && "animate-verb-shake",
              )}
            >
              <img src={s.img} alt="" className="h-20 w-auto object-contain" />
              <BiText t={s.title} size="sm" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** One step at a time: hear it, pick the matching picture. Intention/Bismillah/words are "say it" taps. */
function Practice({
  topic,
  ctx,
  onWin,
  setMama,
}: {
  topic: Topic;
  ctx: Ctx;
  onWin: () => void;
  setMama: (b: Bi | null) => void;
}) {
  const steps = topic === "wudu" ? WUDU_STEPS : RAKAH_CYCLE;
  const [i, setI] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [praise, setPraise] = useState<Bi | null>(null);
  const step = steps[i]!;
  const options = useMemo(() => {
    const others = shuffle(steps.filter((s) => s.img !== step.img && s.kind === "body")).slice(
      0,
      2,
    );
    return shuffle([step, ...others]);
  }, [step, steps]);
  useEffect(() => {
    say({ ar: step.how.ar, en: step.how.en }, ctx.lang);
    setWrong(null);
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => stopVoice(), []);
  const advance = () => {
    ctx.play("chime");
    setMama(null);
    setPraise(PRAISE[i % PRAISE.length]!);
    setTimeout(() => {
      setPraise(null);
      if (i + 1 >= steps.length) {
        ctx.onComplete(`ws-practice-${topic}`);
        onWin();
      } else setI(i + 1);
    }, 900);
  };
  const pick = (s: Step) => {
    if (s.id === step.id) {
      advance();
      return;
    }
    ctx.play("click");
    setWrong(s.id);
    setTimeout(() => setWrong(null), 500);
    setMama(TRY_AGAIN);
    say(TRY_AGAIN, ctx.lang);
  };
  return (
    <div className="grid gap-3">
      <Tokens n={i} total={steps.length} />
      <div
        key={i}
        className="animate-pop-in grid gap-2 rounded-3xl bg-card p-4 text-center shadow-md"
      >
        <BiText t={step.title} size="lg" />
        <BiText t={step.how} size="sm" />
        <GameButton
          tone="sky"
          className="mx-auto grid h-12 w-12 place-items-center rounded-full p-0"
          onClick={() => say(step.how, ctx.lang)}
          aria-label={T.hear.en}
        >
          <Volume2 className="h-5 w-5" />
        </GameButton>
      </div>
      <Praise t={praise} />
      {step.kind === "body" ? (
        <>
          <p className="text-center">
            <BiText t={T.pickPicture} size="sm" />
          </p>
          <div className="grid grid-cols-3 gap-2">
            {options.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => pick(s)}
                aria-label={s.title.en}
                className={cn(
                  "grid min-h-36 place-items-center rounded-2xl bg-card p-2 shadow transition active:scale-95",
                  wrong === s.id && "animate-verb-shake",
                )}
              >
                <img src={s.img} alt="" className="h-32 w-auto object-contain" />
              </button>
            ))}
          </div>
        </>
      ) : (
        <GameButton
          tone={step.kind === "heart" ? "berry" : "sun"}
          className="min-h-24 text-lg"
          onClick={() => {
            if (step.say) say(step.say, ctx.lang);
            advance();
          }}
        >
          <span className="grid place-items-center gap-1">
            <span className="text-3xl">{step.kind === "heart" ? "💗" : "🗣️"}</span>
            {step.say ? <BiText t={step.say} size="lg" /> : <BiText t={T.heart} size="md" />}
          </span>
        </GameButton>
      )}
    </div>
  );
}

type Round = { kind: "name" | "next"; show: Step; answer: Step; options: Step[] };
function makeRounds(topic: Topic): Round[] {
  const seq = topic === "wudu" ? WUDU_STEPS.filter((s) => s.kind === "body") : [...RAKAH_CYCLE];
  // Only poses with a unique picture can be asked about without ambiguity.
  const unique = seq.filter((s) => seq.filter((x) => x.img === s.img).length === 1);
  const names = shuffle(unique)
    .slice(0, 3)
    .map<Round>((s) => ({
      kind: "name",
      show: s,
      answer: s,
      options: shuffle([s, ...shuffle(seq.filter((x) => x.img !== s.img)).slice(0, 2)]),
    }));
  const nexts = shuffle(unique.filter((s) => seq.indexOf(s) < seq.length - 1))
    .slice(0, 3)
    .map<Round>((s) => {
      const ans = seq[seq.indexOf(s) + 1]!;
      return {
        kind: "next",
        show: s,
        answer: ans,
        options: shuffle([
          ans,
          ...shuffle(seq.filter((x) => x.id !== ans.id && x.id !== s.id)).slice(0, 2),
        ]),
      };
    });
  return shuffle([...names, ...nexts]);
}

function Identify({
  topic,
  ctx,
  onWin,
  setMama,
}: {
  topic: Topic;
  ctx: Ctx;
  onWin: () => void;
  setMama: (b: Bi | null) => void;
}) {
  const rounds = useMemo(() => makeRounds(topic), [topic]);
  const [r, setR] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [praise, setPraise] = useState<Bi | null>(null);
  const round = rounds[r]!;
  const q = round.kind === "name" ? T.whatDoing : T.whatNext;
  useEffect(() => {
    say(q, ctx.lang);
  }, [r]); // eslint-disable-line react-hooks/exhaustive-deps
  const pick = (s: Step) => {
    if (s.id === round.answer.id) {
      ctx.play("chime");
      setMama(null);
      setPraise(PRAISE[r % PRAISE.length]!);
      setTimeout(() => {
        setPraise(null);
        if (r + 1 >= rounds.length) {
          ctx.onComplete(`ws-identify-${topic}`);
          onWin();
        } else setR(r + 1);
      }, 900);
    } else {
      ctx.play("click");
      setWrong(s.id);
      setTimeout(() => setWrong(null), 500);
      const hint = round.kind === "next" ? round.answer.hint : TRY_AGAIN;
      setMama(hint);
      say(hint, ctx.lang);
    }
  };
  return (
    <div className="grid gap-3">
      <Tokens n={r} total={rounds.length} />
      <div
        key={r}
        className="animate-pop-in grid gap-2 rounded-3xl bg-card p-4 text-center shadow-md"
      >
        <BiText t={q} size="lg" />
        <Pose step={round.show} className="h-48 sm:h-56" />
        {round.kind === "next" && <BiText t={round.show.title} size="sm" className="opacity-80" />}
      </div>
      <Praise t={praise} />
      <div className="grid gap-2">
        {round.options.map((s) => (
          <GameButton
            key={s.id}
            tone="neutral"
            className={cn("min-h-16 px-4", wrong === s.id && "animate-verb-shake")}
            onClick={() => pick(s)}
          >
            <BiText t={s.title} size="md" />
          </GameButton>
        ))}
      </div>
    </div>
  );
}

function RakahChallenge({
  ctx,
  onWin,
  setMama,
}: {
  ctx: Ctx;
  onWin: () => void;
  setMama: (b: Bi | null) => void;
}) {
  const order = useMemo(() => shuffle(PRAYERS), []);
  const [r, setR] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);
  const [reveal, setReveal] = useState(false);
  const p = order[r]!;
  const answerLine: Bi = {
    ar: `صَلَاةُ ${p.name.ar} ${T.has.ar} ${arNum(p.rakahs)} ${p.rakahs === 2 ? "رَكْعَتَان" : T.rakahs.ar}`,
    en: `${p.name.en} ${T.has.en} ${p.rakahs} ${T.rakahs.en}`,
  };
  const question: Bi = { ar: `${T.howMany.ar} ${p.name.ar}؟`, en: `${T.howMany.en} ${p.name.en}?` };
  useEffect(() => {
    say(question, ctx.lang);
    setReveal(false);
  }, [r]); // eslint-disable-line react-hooks/exhaustive-deps
  const pick = (n: number) => {
    if (n === p.rakahs) {
      ctx.play("chime");
      setMama(null);
      setReveal(true);
      say(answerLine, ctx.lang);
      setTimeout(() => {
        if (r + 1 >= order.length) {
          ctx.onComplete("ws-rakah");
          onWin();
        } else setR(r + 1);
      }, 1800);
    } else {
      // Gentle correction: show the right count, let the child tap it.
      ctx.play("click");
      setWrong(n);
      setTimeout(() => setWrong(null), 500);
      const line: Bi = {
        ar: `${TRY_AGAIN.ar}. عُدَّ مَعِي: ${answerLine.ar}`,
        en: `${TRY_AGAIN.en}. Count with me: ${answerLine.en}`,
      };
      setMama(line);
      say(line, ctx.lang);
    }
  };
  return (
    <div className="grid gap-3">
      <Tokens n={r} total={order.length} />
      <div
        key={r}
        className="animate-pop-in grid place-items-center gap-2 rounded-3xl bg-card p-5 text-center shadow-md"
      >
        <span className="text-6xl">{p.e}</span>
        <p lang="ar" dir="rtl" className="font-arabic text-4xl font-black">
          {p.name.ar}
        </p>
        <p className="text-lg font-black">{p.name.en}</p>
        <BiText t={question} size="md" />
        {reveal && (
          <div className="animate-pop-in grid gap-2">
            <div className="flex justify-center gap-1">
              {Array.from({ length: p.rakahs }, (_, k) => (
                <img
                  key={k}
                  src={token}
                  alt=""
                  className="animate-pop-in h-10 w-10"
                  style={{ animationDelay: `${k * 150}ms` }}
                />
              ))}
            </div>
            <BiText t={answerLine} size="sm" />
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[2, 3, 4].map((n) => (
          <GameButton
            key={n}
            tone="sky"
            disabled={reveal}
            className={cn("grid min-h-24 place-items-center", wrong === n && "animate-verb-shake")}
            onClick={() => pick(n)}
            aria-label={`${n} ${T.rakahs.en}`}
          >
            <span lang="ar" dir="rtl" className="font-arabic text-4xl leading-none">
              {arNum(n)}
            </span>
            <span className="text-sm">
              {n} {T.rakahs.en}
            </span>
          </GameButton>
        ))}
      </div>
    </div>
  );
}

/* ---------------- shell ---------------- */

export function WuduSalah({ play, done, onComplete }: Props) {
  const [topic, setTopic] = useState<Topic>("wudu");
  const [activity, setActivity] = useState<Activity | null>(null);
  const [round, setRound] = useState(0);
  const [won, setWon] = useState(false);
  const [lang, setLang] = useState<VoiceLang>("ar");
  const [mamaLine, setMamaLine] = useState<Bi | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [doneIds, setDoneIds] = useState<string[]>(() => [...done]);
  const complete = (id: string) => {
    onComplete(id);
    setDoneIds((d) => (d.includes(id) ? d : [...d, id]));
  };
  useEffect(() => () => stopVoice(), []);
  useEffect(() => {
    topRef.current?.scrollIntoView({ block: "start" });
  }, [activity, won]);

  const ctx: Ctx = { play, done: doneIds, onComplete: complete, lang };
  const open = (a: Activity) => {
    play("pop");
    setActivity(a);
    setWon(false);
    setMamaLine(null);
    setRound((x) => x + 1);
  };
  const exit = () => {
    stopVoice();
    setActivity(null);
    setWon(false);
    setMamaLine(null);
  };
  const restart = () => {
    setWon(false);
    setMamaLine(null);
    setRound((x) => x + 1);
  };
  const effTopic: Topic = activity === "rakah" ? "salah" : topic;
  const winText = activity === "rakah" ? T.winRakah : effTopic === "wudu" ? T.winWudu : T.winSalah;
  const isDone = (a: Activity, t: Topic) =>
    doneIds.includes(a === "rakah" ? "ws-rakah" : `ws-${a}-${t}`);
  const key = `${activity}-${effTopic}-${round}`;

  return (
    <div ref={topRef} className="mt-4 grid scroll-mt-4 gap-4">
      <div className="flex items-center justify-between gap-2 pe-14">
        {activity ? (
          <GameButton
            tone="neutral"
            className="flex min-h-12 items-center gap-2 px-3"
            onClick={exit}
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            <BiText t={T.activities} size="sm" />
          </GameButton>
        ) : (
          <span className="flex items-center gap-2">
            <img src={mosqueIcon} alt="" className="h-12 w-auto" />
            <BiText t={T.game} size="md" />
          </span>
        )}
        <div
          role="group"
          title={T.voice.en}
          aria-label={T.voice.en}
          className="flex shrink-0 items-center rounded-full bg-card p-1 shadow-sm"
        >
          <Volume2 className="mx-1.5 h-4 w-4 text-muted-foreground" aria-hidden />
          {(["ar", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={lang === l}
              onClick={() => {
                setLang(l);
                play("click");
              }}
              className={cn(
                "min-h-10 min-w-11 rounded-full px-2.5 text-sm font-black transition",
                lang === l && "bg-secondary text-secondary-foreground",
              )}
            >
              {l === "ar" ? (
                <span lang="ar" dir="rtl" className="font-arabic">
                  عربي
                </span>
              ) : (
                "EN"
              )}
            </button>
          ))}
        </div>
      </div>

      {activity === null && (
        <>
          <Mama line={MAMA.learn[topic]} lang={lang} />
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(TOPICS) as Topic[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTopic(t);
                  play("water");
                }}
                aria-pressed={topic === t}
                className={cn(
                  "bg-space-mosque grid min-h-20 place-items-center rounded-3xl px-3 py-2 text-primary-foreground shadow-md transition active:scale-95",
                  topic !== t && "opacity-55 saturate-50",
                )}
              >
                <span className="text-3xl">{TOPICS[t].e}</span>
                <BiText t={TOPICS[t].title} size="md" />
              </button>
            ))}
          </div>
          <div className="grid gap-3 min-[960px]:grid-cols-2">
            {ACTIVITIES.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => open(a.id)}
                className="flex min-h-20 items-center gap-4 rounded-3xl bg-card px-5 py-3 text-left shadow-md transition active:scale-95"
              >
                <span className="text-4xl">{a.e}</span>
                <BiText t={a.title} size="md" className="flex-1" />
                <span className="hidden text-end text-xs font-bold text-muted-foreground sm:block">
                  <span lang="ar" dir="rtl" className="block font-arabic">
                    {a.detail.ar}
                  </span>
                  {a.detail.en}
                </span>
                {isDone(a.id, a.id === "rakah" ? "salah" : topic) && (
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-success text-success-foreground">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {activity && (
        <>
          <div className="flex items-center justify-center gap-2 text-center">
            <span className="text-3xl">{ACTIVITIES.find((a) => a.id === activity)!.e}</span>
            <BiText t={ACTIVITIES.find((a) => a.id === activity)!.title} size="lg" />
            <span className="rounded-full bg-card px-3 py-1 text-sm font-black shadow-sm">
              {TOPICS[effTopic].e}{" "}
              <span lang="ar" dir="rtl" className="font-arabic">
                {TOPICS[effTopic].title.ar}
              </span>
            </span>
          </div>
          {!won && (
            <Mama
              line={mamaLine ?? MAMA[activity][effTopic]}
              worried={mamaLine !== null}
              lang={lang}
            />
          )}
          {won ? (
            <Win text={winText} play={play} onAgain={restart} onDone={exit} />
          ) : (
            <div key={key}>
              {activity === "learn" && (
                <Learn topic={effTopic} ctx={ctx} onFinish={() => setWon(true)} />
              )}
              {activity === "arrange" && (
                <Arrange
                  topic={effTopic}
                  ctx={ctx}
                  onWin={() => setWon(true)}
                  setMama={setMamaLine}
                />
              )}
              {activity === "practice" && (
                <Practice
                  topic={effTopic}
                  ctx={ctx}
                  onWin={() => setWon(true)}
                  setMama={setMamaLine}
                />
              )}
              {activity === "identify" && (
                <Identify
                  topic={effTopic}
                  ctx={ctx}
                  onWin={() => setWon(true)}
                  setMama={setMamaLine}
                />
              )}
              {activity === "rakah" && (
                <RakahChallenge ctx={ctx} onWin={() => setWon(true)} setMama={setMamaLine} />
              )}
              {activity !== "learn" && (
                <GameButton
                  tone="neutral"
                  className="mt-4 flex min-h-12 w-full items-center justify-center gap-2"
                  onClick={restart}
                >
                  <RotateCcw className="h-4 w-4" />
                  <BiText t={T.startOver} size="sm" />
                </GameButton>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
