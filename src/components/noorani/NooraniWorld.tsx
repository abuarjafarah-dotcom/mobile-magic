// حديقة النور — the Noorani Qaida world inside the Arabic section.
// Home: pick a child, see the Qaida path, start a full session or jump to any station.
// Nothing is locked; mastery only shows progress.
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Play } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { nooraniItems, nooraniLevels, nooraniUnits, type ActivityType, type NooraniSkill, type NooraniUnit } from "@/data/noorani";
import { sayItem, sayPhrase, stopNoorani } from "@/lib/nooraniAudio";
import { MASTERY_STARS, PLAYERS, itemMastery, skillMastery, useNooraniProgress } from "@/lib/nooraniProgress";
import { cn } from "@/lib/utils";
import { ACTIVITY_META, MASTERY_AR, Session } from "./Session";
import { Ar, GUIDE_NAME, Glyph, Guide, KID_NAME, Kid, Stars, sprite } from "./ui";

const STONE_TINTS = ["from-[oklch(0.9_0.07_80)]", "from-[oklch(0.88_0.07_150)]", "from-[oklch(0.88_0.06_225)]", "from-[oklch(0.88_0.07_340)]", "from-[oklch(0.9_0.07_60)]", "from-[oklch(0.88_0.06_190)]"];

export function NooraniWorld({ onExit }: { onExit: () => void }) {
  const { store, me, setPlayer, record, finish } = useNooraniProgress();
  const [open, setOpen] = useState<{ unit: NooraniUnit; skill: NooraniSkill } | null>(null);
  const [run, setRun] = useState<{ unit: NooraniUnit; skill: NooraniSkill; only?: ActivityType } | null>(null);
  const player = store.player;
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => { if (open && window.innerWidth < 960) panel.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [open]);

  if (run) {
    return <Session key={`${run.skill.id}-${run.only ?? "all"}`} unit={run.unit} skill={run.skill} only={run.only} player={player} me={me} record={record} finish={finish} onExit={() => setRun(null)} />;
  }

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 min-[960px]:max-w-5xl">
      <header className="flex items-center gap-3 pr-14">
        <GameButton tone="neutral" className="grid h-12 w-12 place-items-center rounded-full p-0" onClick={() => { stopNoorani(); onExit(); }} aria-label="Back to Arabic">
          <ArrowLeft className="h-5 w-5" />
        </GameButton>
        <div className="min-w-0">
          <Ar className="block text-2xl font-black leading-tight">حَدِيقَةُ النُّور</Ar>
          <span className="block text-xs font-bold text-muted-foreground">Noorani Qaida · القاعدة النورانية</span>
        </div>
      </header>

      {/* Garden hero */}
      <button onClick={() => void sayPhrase("welcome")} aria-label="Welcome" className="relative mt-4 overflow-hidden rounded-[2rem] border-4 border-card shadow-xl">
        <img src={sprite("garden")} alt="" className="h-48 w-full object-cover object-[50%_72%] sm:h-60 min-[960px]:h-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/35 via-transparent to-transparent" />
        <Guide pose="welcome" className="absolute bottom-1 start-2 h-28 w-28 animate-hamad-float sm:h-36 sm:w-36" />
        <Ar className="absolute bottom-3 end-4 text-3xl font-black text-card drop-shadow-lg">{GUIDE_NAME.ar} <span className="text-lg">تُرَحِّبُ بِكَ</span></Ar>
      </button>

      {/* Who is playing? */}
      <div className="mt-4 grid grid-cols-2 gap-3" dir="rtl">
        {PLAYERS.map((p) => (
          <GameButton key={p} tone={p === player ? "sun" : "neutral"} onClick={() => setPlayer(p)} aria-pressed={p === player} className={cn("flex items-center justify-center gap-2 rounded-3xl p-2", p !== player && "opacity-75")}>
            <Kid who={p} pose={p === player ? "thumbs" : "stand"} className="h-20 w-14" />
            <Ar className="text-2xl font-black">{KID_NAME[p].ar}</Ar>
          </GameButton>
        ))}
      </div>

      {/* Qaida path */}
      <div className="mt-6 min-[960px]:grid min-[960px]:grid-cols-[1fr_24rem] min-[960px]:gap-6">
        <div>
          {nooraniUnits.map((unit) => (
            <div key={unit.id}>
              <div className="flex items-baseline justify-between gap-2" dir="rtl">
                <Ar className="text-2xl font-black">{unit.ar}</Ar>
                <span className="text-xs font-bold text-muted-foreground">Level {unit.level} · Qaida lesson {unit.source.lesson}</span>
              </div>
              <div dir="rtl" className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {unit.skills.map((s, i) => {
                  const m = skillMastery(me, s);
                  return (
                    <button
                      key={s.id}
                      onClick={() => setOpen({ unit, skill: s })}
                      className={cn("flex min-h-36 flex-col items-center justify-center gap-1 rounded-[2rem] border-4 border-card bg-gradient-to-b to-card p-3 shadow-[0_6px_0_var(--neutral-shadow)] transition-transform active:translate-y-1 active:shadow-none", STONE_TINTS[i % STONE_TINTS.length], open?.skill.id === s.id && "ring-4 ring-primary")}
                      aria-label={`${s.en} — ${m}`}
                    >
                      <Glyph className="whitespace-nowrap text-[1.7rem] leading-tight sm:text-3xl">{s.ar}</Glyph>
                      <Stars value={MASTERY_STARS[m]} />
                      <Ar className="text-sm font-bold text-muted-foreground">{MASTERY_AR[m]}</Ar>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="mt-6" dir="rtl">
            <Ar className="text-lg font-black text-muted-foreground">الْمُسْتَوَيَاتُ الْقَادِمَة</Ar>
            <div className="mt-2 flex flex-wrap gap-2">
              {nooraniLevels.filter((l) => !l.unitIds.length).map((l) => (
                <span key={l.level} className="rounded-full bg-card/70 px-3 py-1.5 text-sm font-bold text-muted-foreground shadow-sm">
                  {l.level} {l.ar ? <Ar>· {l.ar}</Ar> : null}
                </span>
              ))}
            </div>
            <p dir="ltr" className="mt-2 text-xs font-bold text-muted-foreground">Levels 2–12 will be added from the family’s Qaida PDF — nothing is invented.</p>
          </div>
        </div>

        {/* Skill panel */}
        <div ref={panel} className="mt-6 scroll-mt-4 min-[960px]:mt-0">
          {open ? <SkillPanel unit={open.unit} skill={open.skill} onRun={(only) => setRun({ ...open, ...(only ? { only } : {}) })} me={me} /> : (
            <div className="flex flex-col items-center gap-2 rounded-[2rem] bg-card/70 p-5 text-center shadow-sm">
              <Guide pose="point" className="h-28 w-28" />
              <Ar className="text-xl font-black">اخْتَرْ حَجَرًا لِنَبْدَأ</Ar>
              <span className="text-xs font-bold text-muted-foreground">Pick a stone to start</span>
            </div>
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-xs font-bold text-muted-foreground">
        Stars show progress: ☆ new · ⭐ learning · ⭐⭐ practising · ⭐⭐⭐ mastered. Every stone and station stays open.
      </p>
    </section>
  );
}

function SkillPanel({ unit, skill, onRun, me }: { unit: NooraniUnit; skill: NooraniSkill; onRun: (only?: ActivityType) => void; me: ReturnType<typeof useNooraniProgress>["me"] }) {
  const types = [...new Set(skill.activities.map((a) => a.type))].filter((t) => t !== "build" || skill.itemIds.some((id) => nooraniItems[id]?.build));
  return (
    <div className="animate-pop-in rounded-[2rem] bg-card p-4 shadow-lg" dir="rtl">
      <div className="flex flex-wrap justify-center gap-2">
        {skill.itemIds.map((id) => {
          const it = nooraniItems[id]!;
          return (
            <button key={id} onClick={() => void sayItem(it)} aria-label={it.en} className="flex flex-col items-center rounded-2xl bg-muted px-3 pb-1 pt-0 shadow-sm active:scale-95">
              <Glyph className="text-5xl">{it.glyph}</Glyph>
              <Stars value={MASTERY_STARS[itemMastery(me.items[id])]} className="scale-75" />
            </button>
          );
        })}
      </div>
      <GameButton tone="mint" onClick={() => onRun()} className="mt-4 flex w-full items-center justify-center gap-3 rounded-3xl py-4 text-xl">
        <Play className="h-7 w-7" /><Ar className="text-2xl font-black">هَيَّا نَتَعَلَّم</Ar>
      </GameButton>
      <span className="mt-1 block text-center text-xs font-bold text-muted-foreground" dir="ltr">Full session · {unit.source.en}</span>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {types.map((t) => (
          <button key={t} onClick={() => onRun(t)} className="flex items-center gap-2 rounded-2xl bg-muted p-2 text-start shadow-sm active:scale-95">
            <img src={sprite(ACTIVITY_META[t].art)} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
            <span className="min-w-0">
              <Ar className="block truncate text-base font-black leading-tight">{ACTIVITY_META[t].ar}</Ar>
              <span className="block truncate text-[10px] font-bold text-muted-foreground" dir="ltr">{ACTIVITY_META[t].en}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
