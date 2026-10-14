// CHARACTER GAME — River crossing: the child's character hops across the stones by
// tapping the letter that is spoken. Same objective as Listen & Find, played as a story.
import { useMemo, useState } from "react";
import { Volume2 } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { phrases } from "@/data/noorani";
import { sayEncourage, sayItem, sayPhrase, saySuccess } from "@/lib/nooraniAudio";
import { PLAYERS } from "@/lib/nooraniProgress";
import { cn } from "@/lib/utils";
import {
  Ar,
  Burst,
  Glyph,
  Kid,
  choicesFor,
  roundTargets,
  sprite,
  useAlive,
  useOnMount,
  useReaction,
  type ActivityProps,
} from "../ui";

export function CharacterGame({ targets, pool, spec, player, onResult, onDone }: ActivityProps) {
  const rows = useMemo(
    () =>
      roundTargets(targets, spec.rounds).map((t) => ({
        target: t,
        stones: choicesFor(t, pool, spec.choices ?? 3),
      })),
    [targets, pool, spec.rounds, spec.choices],
  );
  const buddy = PLAYERS.find((p) => p !== player) ?? player;
  const [pos, setPos] = useState<{ row: number; col: number }>({ row: -1, col: 1 });
  const [misses, setMisses] = useState<string[]>([]);
  const [splash, setSplash] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [won, setWon] = useState(false);
  const r = useReaction();
  const alive = useAlive();
  const current = rows[pos.row + 1];

  const play = () => {
    if (current) {
      r.listen();
      void sayItem(current.target);
    }
  };
  useOnMount(() => {
    void sayPhrase("characterGame").then(() => {
      if (alive.current && rows[0]) void sayItem(rows[0].target);
    });
  });

  const tap = (rowIndex: number, col: number) => {
    if (busy || won || rowIndex !== pos.row + 1 || !current) return;
    const stone = current.stones[col]!;
    if (stone.id === current.target.id) {
      setBusy(true);
      r.right();
      onResult({ itemId: stone.id, correct: true, firstTry: misses.length === 0 });
      setPos({ row: rowIndex, col });
      setMisses([]);
      void saySuccess(stone).then(() => {
        if (!alive.current) return;
        setBusy(false);
        const nextRow = rows[rowIndex + 1];
        if (nextRow) {
          void sayItem(nextRow.target);
          return;
        }
        setWon(true);
        r.setPose("cheer");
        void sayPhrase("wellDone").then(() => {
          if (alive.current) setTimeout(onDone, 900);
        });
      });
    } else {
      const key = `${rowIndex}-${col}`;
      setSplash(key);
      setTimeout(() => setSplash(null), 700);
      r.wrong();
      if (misses.length === 0)
        onResult({ itemId: current.target.id, correct: false, firstTry: false });
      setMisses([...misses, stone.id]);
      void sayEncourage(current.target);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mt-2 flex items-center justify-between gap-3" dir="rtl">
        <div className="rounded-2xl bg-card px-4 py-2 shadow-sm">
          <Ar className="text-2xl font-black">{phrases.characterGame.ar}</Ar>
        </div>
        <GameButton
          tone="sky"
          onClick={play}
          aria-label="Hear the letter again"
          className="grid h-14 w-14 place-items-center rounded-full p-0"
        >
          <Volume2 className="h-6 w-6" />
        </GameButton>
      </div>

      <div className="relative mx-auto mt-3 w-full max-w-md overflow-hidden rounded-[2rem] border-4 border-card shadow-xl">
        {/* far bank */}
        <div
          className="relative flex h-28 items-end justify-between bg-gradient-to-b from-[oklch(0.86_0.09_140)] to-[oklch(0.76_0.12_145)] px-4 pb-1"
          dir="rtl"
        >
          <Kid who={buddy} pose={won ? "cheer" : "explain"} className="h-24 w-16" />
          {won ? <Kid who={player} pose="cheer" className="h-24 w-16 animate-pop-in" /> : null}
          <img
            src={sprite(won ? "item-gems" : "item-chest")}
            alt=""
            aria-hidden
            className={cn("h-16 w-20 object-contain", won && "animate-pop-in")}
          />
        </div>
        {/* river */}
        <div className="relative bg-gradient-to-b from-[oklch(0.78_0.09_220)] via-[oklch(0.72_0.1_215)] to-[oklch(0.78_0.09_220)] px-3 py-2">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30 [background:repeating-linear-gradient(170deg,transparent_0_18px,oklch(1_0_0/0.5)_18px_20px)]"
          />
          {[...rows.keys()].reverse().map((ri) => {
            const row = rows[ri]!;
            const isNext = ri === pos.row + 1 && !won;
            return (
              <div
                key={ri}
                dir="rtl"
                className={cn(
                  "relative grid grid-cols-3 gap-3 py-1.5 transition-opacity",
                  ri > pos.row + 1 && "opacity-55",
                )}
              >
                {row.stones.map((s, ci) => {
                  const here = pos.row === ri && pos.col === ci && !won;
                  const passed = ri <= pos.row && s.id === row.target.id;
                  return (
                    <button
                      key={ci}
                      onClick={() => tap(ri, ci)}
                      disabled={!isNext}
                      aria-label={s.en}
                      className={cn(
                        "relative grid h-16 place-items-center rounded-[50%] border-b-[6px] border-[oklch(0.45_0.02_60)] bg-gradient-to-b from-[oklch(0.82_0.02_70)] to-[oklch(0.66_0.02_65)] shadow-md transition-transform disabled:cursor-default",
                        isNext && "ring-4 ring-card/70 active:scale-95",
                        splash === `${ri}-${ci}` &&
                          "animate-verb-shake [animation-iteration-count:1]",
                        passed && "from-[oklch(0.85_0.08_150)] to-[oklch(0.7_0.1_150)]",
                      )}
                    >
                      {splash === `${ri}-${ci}` ? (
                        <span
                          aria-hidden
                          className="absolute inset-0 animate-ripple rounded-[50%] bg-card"
                        />
                      ) : null}
                      {here ? (
                        <Kid
                          who={player}
                          pose={r.pose === "think" ? "think" : "cheer"}
                          className="absolute -end-2 -top-9 z-10 h-16 w-11 animate-pop-in"
                        />
                      ) : null}
                      <Glyph className="relative text-5xl leading-none">{s.glyph}</Glyph>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
        {/* near bank */}
        <div className="relative flex h-24 items-start justify-center bg-gradient-to-b from-[oklch(0.76_0.12_145)] to-[oklch(0.86_0.09_140)] pt-1">
          {pos.row === -1 ? <Kid who={player} pose={r.pose} className="h-24 w-16" /> : null}
        </div>
      </div>
      <Burst fire={r.burst} />
    </div>
  );
}
