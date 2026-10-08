import { useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, Eye, RotateCcw, Volume2 } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { AnswerChoice, FamilyCharacter, GameShell, SpeechBubble, WordPicture, shuffle, useClip } from "@/components/learn/shared";
import { arabicLetters, arabicStages, arabicSyllables, arabicWords, type ArabicStageId, type ArabicWord } from "@/data/arabic";
import { addUnique, type LearningProgress } from "@/lib/learningProgress";
import { cn } from "@/lib/utils";

type Update = (change: (p: LearningProgress) => LearningProgress) => void;
const letterAudio = (char: string) => arabicLetters.find((l) => l.char === (char === "أ" ? "ا" : char))?.audio ?? "";

export function ReadArabic({ stage, progress, onProgress, onExit }: { stage: ArabicStageId; progress: LearningProgress; onProgress: Update; onExit: () => void }) {
  const info = arabicStages.find((s) => s.id === stage)!;
  const items = stage === 1 ? arabicLetters.length : stage === 2 ? arabicSyllables.length : arabicWords.length;
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const order = useMemo(() => (stage === 2 ? shuffle(arabicSyllables) : arabicWords), [stage]);

  const next = () => {
    if (index + 1 >= items) {
      onProgress((p) => ({ ...p, arabic: { ...p.arabic, stages: addUnique(p.arabic.stages, stage) } }));
      setDone(true);
    } else setIndex(index + 1);
  };
  const learnLetter = (id: string) => onProgress((p) => ({ ...p, arabic: { ...p.arabic, letters: addUnique(p.arabic.letters, id) } }));
  const learnWord = (id: string) => onProgress((p) => ({ ...p, arabic: { ...p.arabic, words: addUnique(p.arabic.words, id) } }));
  const readWord = (id: string) => onProgress((p) => ({ ...p, arabic: { ...p.arabic, read: addUnique(p.arabic.read, id) } }));

  if (done) {
    return (
      <GameShell title={info.title} onExit={onExit}>
        <div className="mt-10 grid justify-items-center gap-5 text-center animate-pop-in">
          <div className="flex items-end gap-3"><FamilyCharacter name="talal" className="animate-hamad-cheer" /><FamilyCharacter name="yousef" size="small" /></div>
          <h2 className="text-3xl font-black">Great reading!</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {arabicWords.filter((w) => progress.arabic.words.includes(w.id)).map((w) => <WordPicture key={w.id} picture={w.picture} className="h-16 w-16 [&_svg]:h-9 [&_svg]:w-9" />)}
          </div>
          <div className="grid w-full grid-cols-2 gap-3">
            <GameButton tone="neutral" className="min-h-16" onClick={onExit}>Home</GameButton>
            <GameButton tone="mint" className="min-h-16" onClick={() => { setIndex(0); setDone(false); }} aria-label="Play again"><RotateCcw className="mx-auto h-6 w-6" /></GameButton>
          </div>
        </div>
      </GameShell>
    );
  }

  const word = order[index] as ArabicWord;
  return (
    <GameShell title={info.title} current={index} total={items} onExit={onExit}>
      {stage === 1 && <LetterRound key={index} letter={arabicLetters[index]!} onLearn={learnLetter} onNext={next} />}
      {stage === 2 && <HarakatRound key={index} target={arabicSyllables.find((s) => s.id === (order[index] as { id: string }).id)!} onNext={next} />}
      {(stage === 3 || stage === 5) && <BuildRound key={index} word={word} listenFirst={stage === 5} onLearn={learnWord} onNext={next} />}
      {stage === 4 && <ChooseRound key={index} word={word} onLearn={learnWord} onNext={next} />}
      {stage === 6 && <ReadRound key={index} word={word} onRead={readWord} onNext={next} />}
    </GameShell>
  );
}

function Guide({ children, cheer }: { children: string; cheer?: boolean }) {
  return (
    <div className="mt-4 flex items-center gap-3">
      <FamilyCharacter name="talal" size="small" className={cheer ? "animate-hamad-cheer" : "animate-hamad-float"} />
      <SpeechBubble>{children}</SpeechBubble>
    </div>
  );
}

function NextButton({ onClick }: { onClick: () => void }) {
  return (
    <GameButton tone="mint" className="mt-auto min-h-16 text-xl animate-pop-in" onClick={onClick}>
      <span className="inline-flex items-center gap-2">Next <ChevronRight className="h-6 w-6" /></span>
    </GameButton>
  );
}

function LetterRound({ letter, onLearn, onNext }: { letter: (typeof arabicLetters)[number]; onLearn: (id: string) => void; onNext: () => void }) {
  const { play } = useClip();
  const [tapped, setTapped] = useState(false);
  useEffect(() => { play(letter.audio); }, [letter, play]);
  return (
    <div className="flex flex-1 flex-col gap-5">
      <Guide cheer={tapped}>{tapped ? "Yes! That’s it." : "Listen, then tap the letter."}</Guide>
      <GameButton tone={tapped ? "mint" : "sun"} className="mx-auto grid aspect-square w-full max-w-72 place-items-center" onClick={() => { play(letter.audio); setTapped(true); onLearn(letter.id); }} aria-label={`Letter ${letter.name}`}>
        <span dir="rtl" lang="ar" className="font-arabic text-[9rem] leading-none">{letter.char}</span>
      </GameButton>
      <p className="text-center text-lg font-black text-muted-foreground">{letter.name}</p>
      {tapped && <NextButton onClick={onNext} />}
    </div>
  );
}

const vowelTone = { fatha: "sun", kasra: "sky", damma: "berry" } as const;

function HarakatRound({ target, onNext }: { target: (typeof arabicSyllables)[number]; onNext: () => void }) {
  const { play } = useClip();
  const options = arabicSyllables.filter((s) => s.base === target.base);
  const [solved, setSolved] = useState(false);
  const [hint, setHint] = useState(false);
  useEffect(() => { play(target.audio); }, [target, play]);
  return (
    <div className="flex flex-1 flex-col gap-5">
      <Guide cheer={solved}>{solved ? `Yes — “${target.sound}”!` : "Which sound did you hear?"}</Guide>
      <GameButton tone="sky" className="mx-auto grid h-20 w-20 place-items-center rounded-full p-0" onClick={() => play(target.audio)} aria-label="Hear the sound again"><Volume2 className="h-8 w-8" /></GameButton>
      <div className="grid grid-cols-3 gap-3" dir="rtl">
        {options.map((s) => (
          <GameButton key={s.id} tone={solved && s.id === target.id ? "mint" : vowelTone[s.vowel]} aria-label={s.sound} className={cn("grid aspect-[3/4] place-items-center", hint && s.id === target.id && !solved && "ring-4 ring-success ring-offset-2 ring-offset-background")}
            onClick={() => { play(s.audio); if (solved) return; if (s.id === target.id) setSolved(true); else setHint(true); }}>
            <span lang="ar" className="font-arabic text-7xl leading-none">{s.text}</span>
          </GameButton>
        ))}
      </div>
      {solved && <NextButton onClick={onNext} />}
    </div>
  );
}

function BuildRound({ word, listenFirst, onLearn, onNext }: { word: ArabicWord; listenFirst: boolean; onLearn: (id: string) => void; onNext: () => void }) {
  const { play } = useClip();
  const tiles = useMemo(() => {
    const extra = listenFirst ? arabicLetters.map((l) => l.char).filter((c) => !word.letters.includes(c)).slice(word.id.length % 5, word.id.length % 5 + 1) : [];
    return shuffle([...word.letters, ...extra].map((char, i) => ({ id: i, char })));
  }, [word, listenFirst]);
  const [used, setUsed] = useState<number[]>([]);
  const [hint, setHint] = useState(false);
  const built = used.length;
  const complete = built === word.letters.length;
  useEffect(() => { if (listenFirst) play(word.audio); }, [word, listenFirst, play]);

  const tap = (tile: { id: number; char: string }) => {
    if (complete || used.includes(tile.id)) return;
    if (tile.char !== word.letters[built]) { setHint(true); play(letterAudio(word.letters[built]!)); return; }
    setHint(false);
    const next = [...used, tile.id];
    setUsed(next);
    if (next.length === word.letters.length) { onLearn(word.id); play(word.audio); } else play(letterAudio(tile.char));
  };

  return (
    <div className="flex flex-1 flex-col gap-5">
      <Guide cheer={complete}>{complete ? word.meaning.charAt(0).toUpperCase() + word.meaning.slice(1) + "!" : listenFirst ? "Listen, then build the word." : "Tap the letters in order."}</Guide>
      <div className="flex items-center justify-center gap-4">
        {(!listenFirst || complete) && <WordPicture picture={word.picture} className="animate-pop-in" />}
        {listenFirst && <GameButton tone="sky" className="grid h-16 w-16 place-items-center rounded-full p-0" onClick={() => play(word.audio)} aria-label="Hear the word"><Volume2 className="h-7 w-7" /></GameButton>}
      </div>
      <div className="min-h-32 rounded-3xl bg-card p-4 shadow-md">
        {complete ? (
          <p dir="rtl" lang="ar" className="font-arabic text-center text-8xl leading-snug animate-pop-in">{word.arabic}</p>
        ) : (
          <div dir="rtl" className="flex justify-center gap-3">
            {word.letters.map((char, i) => (
              <span key={i} lang="ar" className={cn("grid h-24 w-20 place-items-center rounded-2xl border-4 border-dashed font-arabic text-6xl", i < built ? "border-success bg-success/20" : "border-border")}>{i < built ? char : ""}</span>
            ))}
          </div>
        )}
      </div>
      {complete ? <NextButton onClick={onNext} /> : (
        <div dir="rtl" className="mt-auto grid grid-cols-3 gap-3">
          {tiles.map((tile) => (
            <GameButton key={tile.id} tone="sun" aria-label={`Letter ${tile.char}`} className={cn("grid aspect-square place-items-center", used.includes(tile.id) && "invisible", hint && tile.char === word.letters[built] && "ring-4 ring-success ring-offset-2 ring-offset-background")} onClick={() => tap(tile)}>
              <span lang="ar" className="font-arabic text-6xl leading-none">{tile.char}</span>
            </GameButton>
          ))}
        </div>
      )}
    </div>
  );
}

function ChooseRound({ word, onLearn, onNext }: { word: ArabicWord; onLearn: (id: string) => void; onNext: () => void }) {
  const { play } = useClip();
  const choices = useMemo(() => shuffle([word, ...shuffle(arabicWords.filter((w) => w.id !== word.id)).slice(0, 2)]), [word]);
  const [solved, setSolved] = useState(false);
  const [soft, setSoft] = useState<string[]>([]);
  return (
    <div className="flex flex-1 flex-col gap-5">
      <Guide cheer={solved}>{solved ? "You read it!" : "Which word is the picture?"}</Guide>
      <WordPicture picture={word.picture} className="mx-auto h-40 w-40 [&_svg]:h-24 [&_svg]:w-24" />
      <div className="mt-auto grid gap-3">
        {choices.map((c) => (
          <AnswerChoice key={c.id} label={c.plain} state={solved && c.id === word.id ? "right" : soft.includes(c.id) ? "soft" : null} hint={soft.length > 0 && !solved && c.id === word.id}
            onClick={() => { if (solved) return; play(c.audio); if (c.id === word.id) { setSolved(true); onLearn(word.id); } else setSoft((s) => addUnique(s, c.id)); }}>
            <span dir="rtl" lang="ar" className="font-arabic text-5xl leading-snug">{c.plain}</span>
          </AnswerChoice>
        ))}
      </div>
      {solved && <NextButton onClick={onNext} />}
    </div>
  );
}

function ReadRound({ word, onRead, onNext }: { word: ArabicWord; onRead: (id: string) => void; onNext: () => void }) {
  const { play } = useClip();
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="flex flex-1 flex-col gap-5">
      <Guide cheer={revealed}>{revealed ? "Did you say it like that?" : "Try to read it yourself!"}</Guide>
      <div className="rounded-3xl bg-card p-6 shadow-md">
        <p dir="rtl" lang="ar" className="font-arabic text-center text-8xl leading-snug">{word.arabic}</p>
      </div>
      {revealed && <WordPicture picture={word.picture} className="mx-auto animate-pop-in" />}
      {!revealed ? (
        <GameButton tone="sky" className="mt-auto min-h-20" onClick={() => { setRevealed(true); play(word.audio); onRead(word.id); }} aria-label="Hear the word">
          <span className="inline-flex items-center gap-2 text-xl"><Eye className="h-7 w-7" /><Volume2 className="h-7 w-7" /></span>
        </GameButton>
      ) : (
        <div className="mt-auto grid grid-cols-2 gap-3">
          <GameButton tone="neutral" className="min-h-20" onClick={() => play(word.audio)} aria-label="Hear again"><RotateCcw className="mx-auto h-7 w-7" /></GameButton>
          <GameButton tone="mint" className="min-h-20" onClick={onNext} aria-label="Next word"><Check className="mx-auto h-8 w-8" /></GameButton>
        </div>
      )}
    </div>
  );
}
