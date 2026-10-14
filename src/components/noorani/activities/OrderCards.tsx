// ORDER the syllable cards to make one reading (Level 3). One engine, three data variants:
//   together — cards sit in written order; tap them the way Arabic is read (right → left).
//   first    — the joined writing is shown; cards are shuffled; decode which syllable comes first.
//   listen   — only the sound is given; build it from shuffled cards plus look-alike extras
//              (one differs only by its harakah, so the vowel must really be heard).
// When complete, the cards close together and become the joined reading, which is then spoken.
import { useMemo, useState } from "react";
import { harakahVariants, nooraniItems, phrases, type NooraniItem } from "@/data/noorani";
import { sayEncourage, sayItem, sayPhrase, saySuccess } from "@/lib/nooraniAudio";
import { cn } from "@/lib/utils";
import {
  ActivityFrame,
  Glyph,
  SoundButton,
  promptOf,
  roundTargets,
  useAlive,
  useOnMount,
  useReaction,
  type ActivityProps,
} from "../ui";

type Card = { key: string; item: NooraniItem };
const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

export function OrderCards({ targets, spec, player, onResult, onDone }: ActivityProps) {
  const variant = spec.variant ?? "together";
  const rounds = useMemo(() => roundTargets(targets, spec.rounds), [targets, spec.rounds]);
  const [round, setRound] = useState(0);
  const [filled, setFilled] = useState<Card[]>([]);
  const [shake, setShake] = useState<string | null>(null);
  const [missed, setMissed] = useState(false);
  const [joined, setJoined] = useState(false);
  const [playing, setPlaying] = useState(false);
  const r = useReaction();
  const alive = useAlive();
  const prompt = promptOf(
    spec,
    variant === "first" ? "whichFirst" : variant === "listen" ? "listenBuild" : "readTogetherCards",
  );
  const target = rounds[round]!;
  const segs = useMemo(() => (target.segments ?? []).map((id) => nooraniItems[id]!), [target]);

  const cards = useMemo<Card[]>(() => {
    const own = segs.map((s, i) => ({ key: `s${i}`, item: s }));
    if (variant === "together") return own;
    if (variant === "first") return shuffle(own);
    // listen: + a one-harakah-apart twin of a segment + a syllable from another reading
    const twin = shuffle(harakahVariants(segs[Math.floor(Math.random() * segs.length)]!))[0];
    const other = shuffle(
      targets
        .flatMap((t) => (t.segments ?? []).map((id) => nooraniItems[id]!))
        .filter((x) => !segs.some((s) => s.id === x.id)),
    )[0];
    const extras = [twin, other].filter(
      (x): x is NooraniItem => Boolean(x) && !segs.some((s) => s.id === x!.id),
    );
    return shuffle([...own, ...extras.map((e, i) => ({ key: `x${i}`, item: e }))]);
  }, [segs, variant, targets]);

  const playTarget = async () => {
    setPlaying(true);
    r.listen();
    await sayItem(target);
    if (alive.current) setPlaying(false);
  };
  useOnMount(() => {
    void sayPhrase(prompt).then(() => {
      if (alive.current && variant === "listen") void playTarget();
    });
  });

  const tap = async (c: Card) => {
    if (joined || filled.some((f) => f.key === c.key)) return;
    const need = segs[filled.length]!;
    if (c.item.id === need.id) {
      const now = [...filled, c];
      setFilled(now);
      r.listen();
      await sayItem(c.item);
      if (!alive.current) return;
      if (now.length < segs.length) return;
      // complete → close the gap, then show and speak the joined reading
      setJoined(true);
      r.right();
      onResult({ itemId: target.id, correct: true, firstTry: !missed });
      await new Promise((res) => setTimeout(res, 650));
      if (!alive.current) return;
      await sayItem(target);
      if (!alive.current) return;
      await saySuccess(target);
      if (!alive.current) return;
      if (round + 1 >= rounds.length) {
        onDone();
        return;
      }
      setRound(round + 1);
      setFilled([]);
      setJoined(false);
      setMissed(false);
      if (variant === "listen")
        setTimeout(() => {
          if (alive.current) void sayItem(rounds[round + 1]!);
        }, 300);
    } else {
      setShake(c.key);
      setTimeout(() => setShake(null), 500);
      r.wrong();
      if (!missed) {
        setMissed(true);
        onResult({ itemId: target.id, correct: false, firstTry: false });
      }
      void (variant === "listen" ? sayEncourage(target) : sayPhrase("again"));
    }
  };

  const showWritten = variant === "first" || joined;
  return (
    <ActivityFrame
      who={player}
      pose={r.pose}
      instruction={phrases[prompt].ar}
      hint={phrases[prompt].en ?? ""}
      burst={r.burst}
      round={round}
      total={rounds.length}
    >
      {variant === "listen" && !joined ? (
        <div className="mb-3 flex justify-center">
          <SoundButton onPlay={() => void playTarget()} playing={playing} label="Hear it again" />
        </div>
      ) : null}
      {showWritten ? (
        <div className="mb-3 flex justify-center">
          <div
            key={`${round}-${joined}`}
            className={cn(
              "relative rounded-[2rem] bg-card px-6 shadow-md",
              joined && "animate-pop-in",
            )}
          >
            <Glyph className="text-7xl sm:text-8xl">{target.glyph}</Glyph>
            {joined ? (
              <span
                aria-hidden
                className="absolute inset-x-5 bottom-2 h-1.5 animate-blend-sweep rounded-full bg-secondary"
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {/* slots, filled right → left in reading order; they close up when complete */}
      <div
        dir="rtl"
        className={cn(
          "mx-auto flex justify-center transition-[gap] duration-500",
          joined ? "gap-0" : "gap-3",
        )}
      >
        {segs.map((_, i) => {
          const f = filled[i];
          return (
            <div
              key={i}
              className={cn(
                "grid h-24 w-24 place-items-center border-4 transition-all duration-500 sm:h-28 sm:w-28",
                f
                  ? "border-success/60 bg-success/15"
                  : "border-dashed border-foreground/20 bg-card/40",
                joined ? "rounded-none first:rounded-s-3xl last:rounded-e-3xl" : "rounded-3xl",
              )}
            >
              {f ? (
                <Glyph className="animate-pop-in text-6xl">{f.item.glyph}</Glyph>
              ) : (
                <span className="font-arabic text-2xl font-black text-foreground/25">
                  {["١", "٢", "٣", "٤"][i]}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* cards to tap */}
      <div
        dir="rtl"
        className={cn(
          "mx-auto mt-6 grid w-full max-w-md gap-3",
          cards.length > 3 ? "grid-cols-3" : cards.length === 3 ? "grid-cols-3" : "grid-cols-2",
        )}
      >
        {cards.map((c) => {
          const used = filled.some((f) => f.key === c.key);
          return (
            <button
              key={`${round}-${c.key}`}
              onClick={() => void tap(c)}
              disabled={used || joined}
              aria-label={c.item.en}
              className={cn(
                "grid h-24 animate-pop-in place-items-center rounded-3xl border-4 border-card bg-card shadow-[0_6px_0_var(--neutral-shadow)] transition-all active:translate-y-1 active:shadow-none disabled:opacity-25",
                shake === c.key && "animate-verb-shake [animation-iteration-count:1]",
              )}
            >
              <Glyph className="text-6xl">{c.item.glyph}</Glyph>
            </button>
          );
        })}
      </div>
    </ActivityFrame>
  );
}
