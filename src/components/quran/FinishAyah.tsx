import { useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, Ear, Eye, Mic, RotateCcw, Volume2 } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { AnswerChoice, FamilyCharacter, GameShell, SpeechBubble, shuffle, useClip } from "@/components/learn/shared";
import { ProgressScene } from "@/components/learn/ProgressScene";
import type { SurahData, SurahVerse } from "@/data/surahs";
import { addUnique, surahProgress, type LearningProgress } from "@/lib/learningProgress";
import { cn } from "@/lib/utils";

export type AyahLevel = 1 | 2 | 3 | 4;
export const ayahLevels: Array<{ id: AyahLevel; title: string; icon: typeof Ear; tone: "sun" | "sky" | "mint" | "berry" }> = [
  { id: 1, title: "Hear & choose", icon: Ear, tone: "sun" },
  { id: 2, title: "Listen only", icon: Volume2, tone: "sky" },
  { id: 3, title: "Missing word", icon: Eye, tone: "mint" },
  { id: 4, title: "Recite", icon: Mic, tone: "berry" },
];

// Waqf/pause marks are kept on screen exactly as in the source text but are never a "word" to guess.
const isMark = (token: string) => /^[\u06D6-\u06ED]+$/.test(token);

function tokenize(verse: SurahVerse) {
  const tokens = verse.arabic.split(/\s+/).filter(Boolean);
  const wordIdx = tokens.map((t, i) => (isMark(t) ? -1 : i)).filter((i) => i >= 0);
  return { tokens, wordIdx };
}

/** Seconds into the ayah audio where word `tokenIndex` begins. */
function wordStart(verse: SurahVerse, tokens: string[], wordIdx: number[], tokenIndex: number, duration: number) {
  const r = wordIdx.indexOf(tokenIndex);
  const timings = verse.wordTimings;
  if (timings && timings.length === wordIdx.length && timings[r]) return (timings[r]![0] ?? 0) / 1000;
  if (timings && r === wordIdx.length - 1 && timings.length) return (timings[timings.length - 1]![0] ?? 0) / 1000;
  const lengths = wordIdx.map((i) => tokens[i]!.length);
  const before = lengths.slice(0, r).reduce((a, b) => a + b, 0);
  const total = lengths.reduce((a, b) => a + b, 0) || 1;
  return (before / total) * duration * 0.96;
}

export function FinishAyah({ surah, progress, onProgress, onExit, sound }: { surah: SurahData; progress: LearningProgress; onProgress: (change: (p: LearningProgress) => LearningProgress) => void; onExit: () => void; sound: boolean }) {
  const [level, setLevel] = useState<AyahLevel | null>(null);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const total = surah.verses.length;
  const saved = surahProgress(progress, surah.id);

  const markDone = (ayah: number) => onProgress((p) => {
    const current = surahProgress(p, surah.id);
    return { ...p, quran: { ...p.quran, [surah.id]: { ...current, completed: addUnique(current.completed, ayah) } } };
  });
  const markLevel = (l: AyahLevel) => onProgress((p) => {
    const current = surahProgress(p, surah.id);
    return { ...p, quran: { ...p.quran, [surah.id]: { ...current, levels: addUnique(current.levels, l) } } };
  });

  if (!level) {
    return (
      <GameShell title="Finish the Ayah" onExit={onExit}>
        <div className="mt-5 flex items-center justify-center gap-4">
          <FamilyCharacter name="hamad" className="animate-hamad-float" />
          <SpeechBubble>Let’s finish the ayahs of <span dir="rtl" lang="ar" className="font-quran text-base">{surah.arabicName}</span> together.</SpeechBubble>
        </div>
        <ProgressScene progress={saved.completed.length / total} scene={surah.scene} className="mt-5" />
        <div className="mt-5 grid grid-cols-2 gap-3">
          {ayahLevels.map((item) => (
            <GameButton key={item.id} tone={item.tone} className="relative grid min-h-32 place-items-center gap-1 p-3" onClick={() => { setLevel(item.id); setIndex(0); setFinished(false); }} aria-label={`Level ${item.id}: ${item.title}`}>
              <item.icon className="h-10 w-10" />
              <span className="text-lg font-black">{item.id}</span>
              <span className="text-xs font-black opacity-75">{item.title}</span>
              {saved.levels.includes(item.id) && <Check className="absolute right-2 top-2 h-5 w-5" />}
            </GameButton>
          ))}
        </div>
      </GameShell>
    );
  }

  if (finished) {
    return (
      <GameShell title="Finish the Ayah" onExit={onExit}>
        <div className="mt-6 grid justify-items-center gap-5 text-center animate-pop-in">
          <ProgressScene progress={1} scene={surah.scene} />
          <div className="flex items-center gap-3"><FamilyCharacter name="hamad" className="animate-hamad-cheer" /><FamilyCharacter name="yousef" size="small" /></div>
          <h2 className="text-3xl font-black">Beautiful, ma sha Allah!</h2>
          <p className="font-bold text-muted-foreground">{surah.name} · Level {level}</p>
          <div className="grid w-full grid-cols-2 gap-3">
            <GameButton tone="neutral" className="min-h-16" onClick={() => setLevel(null)}>Levels</GameButton>
            <GameButton tone="mint" className="min-h-16" onClick={() => { setIndex(0); setFinished(false); }}><RotateCcw className="mx-auto h-6 w-6" /></GameButton>
          </div>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title={`${surah.name.replace("Surah ", "")} · Level ${level}`} current={index} total={total} onExit={() => setLevel(null)}>
      <AyahRound
        key={`${level}-${index}`}
        surah={surah}
        verseIndex={index}
        level={level}
        sound={sound}
        sceneProgress={(index + 1) / total}
        onComplete={() => markDone(index)}
        onNext={() => {
          if (index + 1 >= total) { markLevel(level); setFinished(true); } else setIndex(index + 1);
        }}
      />
    </GameShell>
  );
}

function AyahRound({ surah, verseIndex, level, sceneProgress, onComplete, onNext }: { surah: SurahData; verseIndex: number; level: AyahLevel; sound: boolean; sceneProgress: number; onComplete: () => void; onNext: () => void }) {
  const verse = surah.verses[verseIndex]!;
  const { tokens, wordIdx } = useMemo(() => tokenize(verse), [verse]);
  const target = useMemo(() => {
    if (level === 3 && wordIdx.length > 1) return wordIdx[Math.floor(Math.random() * wordIdx.length)]!;
    return wordIdx[wordIdx.length - 1]!;
  }, [level, wordIdx]);
  const choices = useMemo(() => {
    const answer = tokens[target]!;
    const pool = shuffle(surah.verses.flatMap((v) => tokenize(v).tokens.filter((t) => !isMark(t))).filter((t) => t !== answer));
    const distractors = [...new Set(pool)].slice(0, level === 1 ? 1 : 2);
    return shuffle([answer, ...distractors]);
  }, [surah, tokens, target, level]);
  const { play, playing } = useClip();
  const [solved, setSolved] = useState(false);
  const [hint, setHint] = useState(false);
  const [soft, setSoft] = useState<string[]>([]);
  const [heard, setHeard] = useState(false);

  const playUpToTarget = () => play(verse.audio, { stopAt: (d) => wordStart(verse, tokens, wordIdx, target, d), onEnd: () => setHeard(true) });
  const playFull = () => play(verse.audio, { onEnd: () => setHeard(true) });

  useEffect(() => {
    if (level === 1 || level === 2) playUpToTarget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const complete = () => {
    setSolved(true);
    onComplete();
    if (level !== 4) {
      // Let the reciter finish the ayah from the chosen word onward.
      play(verse.audio, { from: (d) => wordStart(verse, tokens, wordIdx, target, d) });
    }
  };

  const pick = (choice: string) => {
    if (solved) return;
    if (choice === tokens[target]) { complete(); return; }
    setSoft((s) => addUnique(s, choice));
    setHint(true);
    playUpToTarget();
  };

  const showText = level !== 2 || solved;

  return (
    <div className="mt-4 flex flex-1 flex-col gap-4">
      <ProgressScene progress={solved ? sceneProgress : sceneProgress - 1 / surah.verses.length} scene={surah.scene} />
      <div className={cn("rounded-3xl bg-card p-5 shadow-md transition-colors", solved && "ring-4 ring-success")}>
        {showText ? (
          <p dir="rtl" lang="ar" className="font-quran text-center text-3xl leading-[2.4] sm:text-4xl">
            {tokens.map((token, i) => (
              <span key={i}>
                {i === target && level !== 4 && !solved ? (
                  <span className="mx-1 inline-block min-w-20 rounded-xl border-b-4 border-dashed border-primary align-middle">&nbsp;</span>
                ) : (
                  <span className={cn(i === target && solved && "rounded-lg bg-success/30 px-1")}>{token}</span>
                )}{" "}
              </span>
            ))}
            <span className="mx-1 inline-grid h-9 w-9 place-items-center rounded-full border-2 border-primary align-middle font-sans text-sm font-black">{verseIndex + (surah.firstAyah ?? 1)}</span>
          </p>
        ) : (
          <div className="flex justify-center gap-2 py-6" aria-label="Listen to the ayah">
            {wordIdx.map((i) => <span key={i} className={cn("h-4 w-4 rounded-full", i === target ? "bg-primary" : "bg-muted")} />)}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <FamilyCharacter name="hamad" size="small" className={solved ? "animate-hamad-cheer" : ""} />
        <GameButton tone="sky" className="grid h-14 w-14 place-items-center p-0" onClick={level === 4 ? playFull : playUpToTarget} aria-label="Play the ayah">
          <Volume2 className={cn("h-6 w-6", playing && "animate-pulse")} />
        </GameButton>
        <p className="min-w-0 flex-1 text-sm font-black text-muted-foreground">
          {solved ? "Well done!" : level === 4 ? (heard ? "Now you try — say it out loud." : "Listen first, then recite.") : hint ? "Listen again — you can do it." : "Which word comes next?"}
        </p>
      </div>

      {solved ? (
        <GameButton tone="mint" className="mt-auto min-h-16 text-xl animate-pop-in" onClick={onNext}>
          <span className="inline-flex items-center gap-2">Next <ChevronRight className="h-6 w-6" /></span>
        </GameButton>
      ) : level === 4 ? (
        <div className="mt-auto grid grid-cols-2 gap-3">
          <GameButton tone="neutral" className="min-h-20" onClick={playFull} aria-label="Listen again"><RotateCcw className="mx-auto h-7 w-7" /></GameButton>
          <GameButton tone="mint" className="min-h-20" onClick={complete} disabled={!heard} aria-label="I recited it"><Check className="mx-auto h-8 w-8" /></GameButton>
        </div>
      ) : (
        <div className={cn("mt-auto grid gap-3", choices.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
          {choices.map((choice) => (
            <AnswerChoice key={choice} onClick={() => pick(choice)} state={soft.includes(choice) ? "soft" : null} hint={hint && choice === tokens[target]} label={choice}>
              <span dir="rtl" lang="ar" className="font-quran block text-2xl leading-loose sm:text-3xl">{choice}</span>
            </AnswerChoice>
          ))}
        </div>
      )}
    </div>
  );
}
