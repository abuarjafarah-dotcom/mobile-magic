// CHOOSE THE CORRECT ENDING (Level 4): مَ + ؟ — hear مَنْ, choose نْ from نْ نَ نِ.
// The endings differ only by their mark. A wrong ending is joined and read aloud (مَنَ) so the
// child hears the difference the sukoon makes, then the target is played again.
import { useMemo, useState } from "react";
import { harakahVariants, nooraniItems, phrases, withMark, type NooraniItem } from "@/data/noorani";
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

export function Ending({ targets, spec, player, onResult, onDone }: ActivityProps) {
  const rounds = useMemo(
    () =>
      roundTargets(
        targets.filter((t) => (t.segments?.length ?? 0) >= 2),
        spec.rounds,
      ).map((t) => {
        const segs = t.segments!.map((id) => nooraniItems[id]!);
        const last = segs[segs.length - 1]!;
        const others = harakahVariants(last, "sukoon").sort(() => Math.random() - 0.5);
        const options = [last, ...others.slice(0, (spec.choices ?? 3) - 1)].sort(
          () => Math.random() - 0.5,
        );
        return { target: t, prefix: segs.slice(0, -1), last, options };
      }),
    [targets, spec.rounds, spec.choices],
  );
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<NooraniItem | null>(null);
  const [missed, setMissed] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [playing, setPlaying] = useState(false);
  const r = useReaction();
  const alive = useAlive();
  const prompt = promptOf(spec, "chooseEnding");
  const cur = rounds[round];

  const play = async (it = cur?.target) => {
    if (!it) return;
    setPlaying(true);
    r.listen();
    await sayItem(it);
    if (alive.current) setPlaying(false);
  };
  useOnMount(() => {
    void sayPhrase(prompt).then(() => {
      if (alive.current) void play();
    });
  });
  if (!cur) return null;

  const pick = async (o: NooraniItem) => {
    if (done || missed.includes(o.id)) return;
    setPicked(o);
    if (o.id === cur.last.id) {
      setDone(true);
      r.right();
      onResult({ itemId: cur.target.id, correct: true, firstTry: missed.length === 0 });
      await sayItem(cur.target);
      if (!alive.current) return;
      await saySuccess(cur.target);
      if (!alive.current) return;
      if (round + 1 >= rounds.length) return onDone();
      setRound(round + 1);
      setPicked(null);
      setMissed([]);
      setDone(false);
      void play(rounds[round + 1]!.target);
    } else {
      if (!missed.length) onResult({ itemId: cur.target.id, correct: false, firstTry: false });
      setMissed([...missed, o.id]);
      r.wrong();
      await sayItem(withMark(cur.target, o.haraka!)); // hear what that ending makes: مَنَ
      if (!alive.current) return;
      await sayEncourage(cur.target);
      if (alive.current) setPicked(null);
    }
  };

  const joined = picked ? withMark(cur.target, picked.haraka!) : null;
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
      <div className="flex justify-center">
        <SoundButton size="md" onPlay={() => void play()} playing={playing} label="Hear it again" />
      </div>
      {/* مَ + ؟  → becomes the joined reading once an ending is chosen */}
      <div className="mt-4 flex min-h-40 items-center justify-center" dir="rtl">
        {joined ? (
          <div
            key={joined.id}
            className={cn(
              "animate-pop-in rounded-[2rem] border-4 bg-card px-8 shadow-xl",
              done ? "border-success" : "border-card opacity-70",
            )}
          >
            <Glyph className="text-[6rem]">{joined.glyph}</Glyph>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {cur.prefix.map((p, i) => (
              <div
                key={i}
                className="grid h-32 w-28 place-items-center rounded-3xl bg-card shadow-md"
              >
                <Glyph className="text-7xl">{p.glyph}</Glyph>
              </div>
            ))}
            <span className="text-4xl font-black text-muted-foreground">+</span>
            <div className="grid h-32 w-28 place-items-center rounded-3xl border-4 border-dashed border-foreground/25 bg-card/40">
              <span className="font-arabic text-6xl font-black text-foreground/30">؟</span>
            </div>
          </div>
        )}
      </div>
      <div dir="rtl" className="mx-auto mt-6 grid w-full max-w-sm grid-cols-3 gap-3">
        {cur.options.map((o) => (
          <button
            key={`${round}-${o.id}`}
            onClick={() => void pick(o)}
            aria-label={o.en}
            className={cn(
              "grid h-28 animate-pop-in place-items-center rounded-3xl border-4 border-card bg-card shadow-[0_6px_0_var(--neutral-shadow)] transition-all active:translate-y-1 active:shadow-none",
              missed.includes(o.id) && "opacity-40",
              done && o.id === cur.last.id && "border-success bg-success/25",
              missed.length >= 2 &&
                !done &&
                o.id === cur.last.id &&
                "ring-4 ring-primary ring-offset-2 ring-offset-background",
            )}
          >
            <Glyph className="text-7xl">{o.glyph}</Glyph>
          </button>
        ))}
      </div>
    </ActivityFrame>
  );
}
