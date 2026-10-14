// SOUND ↔ SYMBOL (Level 5). Rounds alternate:
//   sound → symbol: hear a syllable, choose its mark alone (ـً ـٍ ـٌ).
//   symbol → sound: see one mark alone, play three sounds (same letter, each tanween), choose.
// The marks are shown on their own so the ear and eye must link the ending to the symbol itself.
import { useMemo, useState } from "react";
import { Check, Ear, Eye, Volume2 } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { MARK, TANWEEN, phrases, withMark, type Haraka, type NooraniItem } from "@/data/noorani";
import { sayEncourage, sayItem, sayPhrase, saySuccess } from "@/lib/nooraniAudio";
import { cn } from "@/lib/utils";
import {
  ActivityFrame,
  Glyph,
  MarkOnly,
  SoundButton,
  promptOf,
  roundTargets,
  useAlive,
  useOnMount,
  useReaction,
  type ActivityProps,
} from "../ui";

const NUMS = ["١", "٢", "٣", "٤"];
const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

export function SymbolSound({ targets, spec, player, onResult, onDone }: ActivityProps) {
  const marks: Haraka[] = Array.isArray(spec.mark) ? spec.mark : TANWEEN;
  const rounds = useMemo(
    () =>
      roundTargets(
        targets.filter((t) => t.haraka && marks.includes(t.haraka)),
        spec.rounds,
      ).map((t) => ({
        target: t,
        marks: shuffle(marks),
        sounds: shuffle(marks.map((h) => withMark(t, h))),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [targets, spec.rounds],
  );
  const [round, setRound] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [lit, setLit] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const [playing, setPlaying] = useState(false);
  const r = useReaction();
  const alive = useAlive();
  const prompt = promptOf(spec, "soundSymbol");
  const cur = rounds[round];
  const soundFirst = round % 2 === 0;

  const play = async (it?: NooraniItem) => {
    if (!it) return;
    setPlaying(true);
    r.listen();
    await sayItem(it);
    if (alive.current) setPlaying(false);
  };
  useOnMount(() => {
    void sayPhrase(prompt).then(() => {
      if (alive.current && rounds[0]) void play(rounds[0].target);
    });
  });
  if (!cur) return null;

  const win = async () => {
    setSolved(true);
    r.right();
    onResult({ itemId: cur.target.id, correct: true, firstTry: missed.length === 0 });
    await sayItem(cur.target);
    if (!alive.current) return;
    await saySuccess(cur.target);
    if (!alive.current) return;
    if (round + 1 >= rounds.length) return onDone();
    const next = round + 1;
    setRound(next);
    setMissed([]);
    setSel(null);
    setSolved(false);
    if (next % 2 === 0) void play(rounds[next]!.target);
  };
  const miss = (key: string) => {
    if (!missed.length) onResult({ itemId: cur.target.id, correct: false, firstTry: false });
    setMissed((m) => [...m, key]);
    r.wrong();
  };

  // sound → symbol
  const pickMark = async (h: Haraka) => {
    if (solved || missed.includes(h)) return;
    if (h === cur.target.haraka) return win();
    miss(h);
    await sayEncourage(cur.target);
  };
  // symbol → sound
  const hear = async (i: number) => {
    if (solved) return;
    setSel(i);
    setLit(i);
    r.listen();
    await sayItem(cur.sounds[i]!);
    if (alive.current) setLit((x) => (x === i ? null : x));
  };
  const confirm = async () => {
    if (sel === null || solved) return;
    const pick = cur.sounds[sel]!;
    if (pick.id === cur.target.id) return win();
    miss(pick.id);
    setSel(null);
    await sayPhrase("again");
  };

  return (
    <ActivityFrame
      who={player}
      pose={r.pose}
      instruction={phrases[prompt].ar}
      hint={soundFirst ? "Listen, then choose the mark" : "Look at the mark, then choose its sound"}
      burst={r.burst}
      round={round}
      total={rounds.length}
    >
      <div className="mb-3 flex justify-center">
        <span
          className="inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 text-sm font-black shadow-sm"
          dir="rtl"
        >
          {soundFirst ? <Ear className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="font-arabic" lang="ar">
            {soundFirst ? "اسْمَعْ ← الْعَلَامَة" : "الْعَلَامَة ← اسْمَعْ"}
          </span>
        </span>
      </div>

      {soundFirst ? (
        <div className="flex flex-col items-center">
          <SoundButton
            onPlay={() => void play(cur.target)}
            playing={playing}
            label="Hear it again"
          />
          {solved ? (
            <div className="mt-4 animate-pop-in rounded-[2rem] bg-card px-6 shadow-md">
              <Glyph className="text-7xl">{cur.target.glyph}</Glyph>
            </div>
          ) : null}
          <div dir="rtl" className="mt-6 grid w-full max-w-sm grid-cols-3 gap-3">
            {cur.marks.map((h) => (
              <button
                key={`${round}-${h}`}
                onClick={() => void pickMark(h)}
                aria-label={`Mark ${h}`}
                className={cn(
                  "grid h-32 animate-pop-in place-items-center rounded-3xl border-4 border-card bg-card shadow-[0_6px_0_var(--neutral-shadow)] transition-all active:translate-y-1 active:shadow-none",
                  missed.includes(h) && "opacity-40",
                  solved && h === cur.target.haraka && "border-success bg-success/25",
                  missed.length >= 2 &&
                    !solved &&
                    h === cur.target.haraka &&
                    "ring-4 ring-primary ring-offset-2 ring-offset-background",
                )}
              >
                <MarkOnly mark={MARK[h]} className="text-8xl leading-[1.2]" centered />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div
            key={round}
            className="grid h-44 w-44 animate-pop-in place-items-center rounded-[2.5rem] border-4 border-card bg-card shadow-xl"
          >
            <MarkOnly
              mark={MARK[cur.target.haraka!]}
              className="text-[8rem] leading-none"
              centered
            />
          </div>
          {solved ? (
            <Glyph className="mt-2 animate-pop-in text-6xl">{cur.target.glyph}</Glyph>
          ) : null}
          <div dir="rtl" className="mt-5 grid w-full max-w-sm grid-cols-3 gap-3">
            {cur.sounds.map((o, i) => (
              <button
                key={`${round}-${o.id}`}
                onClick={() => void hear(i)}
                aria-label={`Sound ${i + 1}`}
                className={cn(
                  "relative flex h-24 flex-col items-center justify-center gap-1 rounded-3xl border-4 bg-card shadow-[0_5px_0_var(--neutral-shadow)] transition-all active:translate-y-1 active:shadow-none",
                  sel === i ? "border-secondary bg-secondary/25" : "border-card",
                  missed.includes(o.id) && "opacity-40",
                  solved && o.id === cur.target.id && "border-success bg-success/25",
                )}
              >
                {lit === i ? (
                  <span
                    aria-hidden
                    className="absolute inset-0 animate-ripple rounded-3xl bg-secondary/40"
                  />
                ) : null}
                <Volume2 className="relative h-8 w-8" />
                <span className="relative font-arabic text-xl font-black text-foreground/60">
                  {NUMS[i]}
                </span>
              </button>
            ))}
          </div>
          <GameButton
            tone="mint"
            disabled={sel === null || solved}
            onClick={() => void confirm()}
            aria-label="This one"
            className="mt-5 grid h-20 w-20 place-items-center rounded-full p-0"
          >
            <Check className="h-10 w-10" />
          </GameButton>
        </div>
      )}
    </ActivityFrame>
  );
}
