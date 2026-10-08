import { useCallback, useMemo, useState } from "react";
import { ArrowLeft, Languages, PawPrint, Search, Music2, Puzzle, Star, Telescope, BookOpenText, Volume2 } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { FamilyCharacter, ProgressBar, SpeechBubble, shuffle, useClip } from "@/components/learn/shared";
import { animals, scenes, stories, wordById, type QuranStory, type WorldScene, type WorldWord } from "@/data/quranWorld";
import { iqAudio } from "@/data/iqAudio";
import { addUnique, type LearningProgress } from "@/lib/learningProgress";
import { cn } from "@/lib/utils";

type Lang = "ar" | "en";
type IqScreen = "home" | "explore" | "find" | "match" | "animals" | "stories" | "songs";

type IqProps = {
  progress: LearningProgress;
  update: (change: (previous: LearningProgress) => LearningProgress) => void;
  onExit: () => void;
};

function playKey(clip: ReturnType<typeof useClip>, key: string, onEnd?: () => void) {
  const src = iqAudio[key];
  if (src) clip.play(src, onEnd ? { onEnd } : {});
  else onEnd?.();
}

function Shell({ titleAr, titleEn, lang, onBack, children }: { titleAr: string; titleEn: string; lang: Lang; onBack: () => void; children: React.ReactNode }) {
  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 min-[960px]:max-w-4xl min-[960px]:pb-6 min-[960px]:pt-6">
      <header className="flex items-center gap-3">
        <GameButton tone="neutral" className="grid h-12 w-12 shrink-0 place-items-center rounded-full p-0" onClick={onBack} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </GameButton>
        <h1 className="min-w-0 flex-1 truncate text-xl font-black">{lang === "ar" ? titleAr : titleEn}</h1>
      </header>
      {children}
    </section>
  );
}

/** Big tappable word card shown after discovering a word. */
function WordCard({ word, lang, clip, onClose }: { word: WorldWord; lang: Lang; clip: ReturnType<typeof useClip>; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-6 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-xs rounded-3xl bg-card p-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="text-7xl">{word.emoji}</div>
        <p dir="rtl" className="mt-3 text-4xl font-black">{word.arabic}</p>
        <p className="mt-1 text-lg font-bold text-muted-foreground">{word.english}</p>
        <div className="mt-4 flex gap-2">
          <GameButton tone="sky" className="flex-1" onClick={() => playKey(clip, `iq-${word.id}-ar`)}>
            <Volume2 className="h-5 w-5" /> {lang === "ar" ? "اسمع" : "Listen"}
          </GameButton>
          <GameButton tone="neutral" className="flex-1" onClick={onClose}>{lang === "ar" ? "أغلق" : "Close"}</GameButton>
        </div>
      </div>
    </div>
  );
}

function SceneCanvas({ scene, onTapObject, found }: { scene: WorldScene; onTapObject: (word: WorldWord) => void; found?: ReadonlySet<string> }) {
  const positions = ["left-[8%] top-[12%]", "right-[10%] top-[8%]", "left-[16%] bottom-[18%]", "right-[14%] bottom-[24%]"];
  return (
    <div className={cn("relative mt-4 h-72 overflow-hidden rounded-3xl bg-gradient-to-b shadow-inner", scene.sky)}>
      {scene.wordIds.map((id, i) => {
        const word = wordById(id);
        return (
          <button
            key={id}
            type="button"
            aria-label={word.english}
            onClick={() => onTapObject(word)}
            className={cn(
              "absolute grid h-20 w-20 place-items-center rounded-full text-5xl transition-transform active:scale-90",
              positions[i % positions.length],
              found?.has(id) ? "scale-110 drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]" : "hover:scale-110",
            )}
          >
            {word.emoji}
          </button>
        );
      })}
    </div>
  );
}

export function InteractiveQuran({ progress, update, onExit }: IqProps) {
  const [screen, setScreen] = useState<IqScreen>("home");
  const [lang, setLang] = useState<Lang>(progress.iq.lang);
  const [scene, setScene] = useState<WorldScene>(scenes[0]!);
  const [story, setStory] = useState<QuranStory>(stories[0]!);
  const clip = useClip();

  const stars = progress.iq.stars;
  const earnStar = useCallback((id: string) => {
    update((p) => ({ ...p, iq: { ...p.iq, stars: addUnique(p.iq.stars, id) } }));
  }, [update]);
  const switchLang = useCallback(() => {
    const next: Lang = lang === "ar" ? "en" : "ar";
    setLang(next);
    update((p) => ({ ...p, iq: { ...p.iq, lang: next } }));
  }, [lang, update]);

  const langToggle = (
    <GameButton tone="neutral" className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full px-4 py-2 text-sm" onClick={switchLang}>
      <Languages className="h-4 w-4" /> {lang === "ar" ? "English" : "عربي"}
    </GameButton>
  );

  if (screen === "explore") return <>{langToggle}<ExploreScene scene={scene} lang={lang} clip={clip} stars={stars} earnStar={earnStar} onBack={() => setScreen("home")} /></>;
  if (screen === "find") return <>{langToggle}<FindWord lang={lang} clip={clip} earnStar={earnStar} onBack={() => setScreen("home")} /></>;
  if (screen === "match") return <>{langToggle}<MatchIt lang={lang} clip={clip} earnStar={earnStar} onBack={() => setScreen("home")} /></>;
  if (screen === "animals") return <>{langToggle}<AnimalDiscovery lang={lang} clip={clip} earnStar={earnStar} onBack={() => setScreen("home")} /></>;
  if (screen === "stories") return <>{langToggle}<StoryPlayer story={story} lang={lang} clip={clip} earnStar={earnStar} onBack={() => setScreen("home")} /></>;
  if (screen === "songs") return <>{langToggle}<SingAlong lang={lang} clip={clip} onBack={() => setScreen("home")} /></>;

  const destinations = [
    { id: "explore" as const, icon: Telescope, titleAr: "استكشف الطبيعة", titleEn: "Nature Explorer", emoji: "🌳" },
    { id: "find" as const, icon: Search, titleAr: "أين الكلمة؟", titleEn: "Find the Word", emoji: "🔎" },
    { id: "match" as const, icon: Puzzle, titleAr: "طابق الكلمات", titleEn: "Match It", emoji: "🧩" },
    { id: "animals" as const, icon: PawPrint, titleAr: "حيوانات القرآن", titleEn: "Qur'an Animals", emoji: "🐪" },
    { id: "stories" as const, icon: BookOpenText, titleAr: "قصص العائلة", titleEn: "Family Stories", emoji: "🎭" },
    { id: "songs" as const, icon: Music2, titleAr: "أنشودة الكلمات", titleEn: "Word Sing-Along", emoji: "🎵" },
  ];

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 min-[960px]:max-w-5xl min-[960px]:pb-6 min-[960px]:pt-6">
      {langToggle}
      <header className="flex items-center gap-3">
        <GameButton tone="neutral" className="grid h-12 w-12 shrink-0 place-items-center rounded-full p-0" onClick={onExit} aria-label="Back home">
          <ArrowLeft className="h-5 w-5" />
        </GameButton>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-black">{lang === "ar" ? "القرآن التفاعلي 🌙" : "Interactive Qur'an 🌙"}</h1>
          <p className="text-xs font-bold text-muted-foreground">{lang === "ar" ? "اكتشف • استمع • أنشد • تعلّم" : "Explore • Listen • Sing • Discover"}</p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-card px-3 py-1.5 text-sm font-black shadow-sm">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {stars.length}
        </div>
      </header>

      <div className="mt-4 flex items-center gap-3 rounded-3xl bg-card p-3 shadow-sm">
        <FamilyCharacter name="hamad" className="animate-hamad-float" speaking={clip.playing} />
        <SpeechBubble>{lang === "ar" ? "هيا نكتشف كلمات القرآن معًا!" : "Let's discover Qur'an words together!"}</SpeechBubble>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 min-[960px]:grid-cols-3">
        {destinations.map((d) => (
          <GameButton
            key={d.id}
            tone="neutral"
            className="flex min-h-28 flex-col items-center justify-center gap-1 rounded-3xl p-3"
            onClick={() => {
              if (d.id === "explore") setScene(scenes[Math.floor(Math.random() * scenes.length)]!);
              if (d.id === "stories") setStory(stories[Math.floor(Math.random() * stories.length)]!);
              setScreen(d.id);
            }}
          >
            <span className="text-4xl">{d.emoji}</span>
            <span className="text-sm font-black">{lang === "ar" ? d.titleAr : d.titleEn}</span>
          </GameButton>
        ))}
      </div>

      <div className="mt-4 rounded-3xl bg-card p-4 shadow-sm">
        <p className="text-sm font-black">{lang === "ar" ? "مشاهد للاستكشاف" : "Scenes to explore"}</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {scenes.map((s) => (
            <GameButton key={s.id} tone="neutral" className="flex flex-col items-center gap-1 rounded-2xl p-2 text-xs font-black" onClick={() => { setScene(s); setScreen("explore"); }}>
              <span className="text-2xl">{s.emoji}</span>
              {lang === "ar" ? s.titleAr : s.titleEn}
            </GameButton>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExploreScene({ scene, lang, clip, stars, earnStar, onBack }: { scene: WorldScene; lang: Lang; clip: ReturnType<typeof useClip>; stars: readonly string[]; earnStar: (id: string) => void; onBack: () => void }) {
  const [card, setCard] = useState<WorldWord | null>(null);
  const found = useMemo(() => new Set(scene.wordIds.filter((id) => stars.includes(id))), [scene, stars]);
  return (
    <Shell titleAr={scene.titleAr} titleEn={scene.titleEn} lang={lang} onBack={onBack}>
      <p className="mt-3 text-sm font-bold text-muted-foreground">{lang === "ar" ? "اضغط على الأشياء لتسمع كلماتها!" : "Tap the objects to hear their words!"}</p>
      <SceneCanvas
        scene={scene}
        found={found}
        onTapObject={(word) => {
          setCard(word);
          earnStar(word.id);
          playKey(clip, `iq-${word.id}-ar`);
        }}
      />
      <div className="mt-3 flex items-center gap-3 rounded-3xl bg-card p-3 shadow-sm">
        <FamilyCharacter name="talal" speaking={clip.playing} />
        <SpeechBubble>{lang === "ar" ? `${found.size} من ${scene.wordIds.length} كلمات!` : `${found.size} of ${scene.wordIds.length} words!`}</SpeechBubble>
      </div>
      {card ? <WordCard word={card} lang={lang} clip={clip} onClose={() => setCard(null)} /> : null}
    </Shell>
  );
}

function FindWord({ lang, clip, earnStar, onBack }: { lang: Lang; clip: ReturnType<typeof useClip>; earnStar: (id: string) => void; onBack: () => void }) {
  const [round, setRound] = useState(0);
  const [cheer, setCheer] = useState(false);
  const [scene, target] = useMemo(() => {
    const s = scenes[round % scenes.length]!;
    const id = s.wordIds[Math.floor(Math.random() * s.wordIds.length)]!;
    return [s, wordById(id)] as const;
  }, [round]);

  const ask = useCallback(() => {
    playKey(clip, lang === "ar" ? `iq-q-${target.id}-ar` : `iq-q-${target.id}-en`);
  }, [clip, lang, target]);

  return (
    <Shell titleAr="أين الكلمة؟" titleEn="Find the Word" lang={lang} onBack={onBack}>
      <div className="mt-3 flex items-center gap-3 rounded-3xl bg-card p-3 shadow-sm">
        <FamilyCharacter name="hamad" speaking={clip.playing} />
        <SpeechBubble>{lang === "ar" ? `أَيْنَ ${target.arabic}؟` : `Where is the ${target.english}?`}</SpeechBubble>
        <GameButton tone="sky" className="grid h-11 w-11 shrink-0 place-items-center rounded-full p-0" onClick={ask} aria-label="Hear the question">
          <Volume2 className="h-5 w-5" />
        </GameButton>
      </div>
      <SceneCanvas
        scene={scene}
        onTapObject={(word) => {
          if (word.id === target.id) {
            setCheer(true);
            earnStar(word.id);
            playKey(clip, "iq-cheer-ar", () => {
              setCheer(false);
              setRound((r) => r + 1);
            });
          } else {
            playKey(clip, `iq-${word.id}-ar`);
          }
        }}
      />
      {cheer ? (
        <div className="mt-3 rounded-3xl bg-success/15 p-4 text-center">
          <p className="text-2xl font-black text-success">{lang === "ar" ? "أَحْسَنْتَ! 🎉" : "Great job! 🎉"}</p>
          <p dir="rtl" className="mt-1 text-xl font-black">{target.arabic} — {target.english}</p>
        </div>
      ) : null}
    </Shell>
  );
}

function MatchIt({ lang, clip, earnStar, onBack }: { lang: Lang; clip: ReturnType<typeof useClip>; earnStar: (id: string) => void; onBack: () => void }) {
  const [round, setRound] = useState(0);
  const [selectedPic, setSelectedPic] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const roundWords = useMemo(() => {
    const all = scenes.flatMap((s) => s.wordIds).map(wordById);
    const start = (round * 4) % all.length;
    const picked = Array.from({ length: 4 }, (_, i) => all[(start + i) % all.length]!);
    return { pics: shuffle(picked), labels: shuffle(picked) };
  }, [round]);

  const tryMatch = (wordId: string) => {
    if (!selectedPic) return;
    if (selectedPic === wordId) {
      const next = [...matched, wordId];
      setMatched(next);
      setSelectedPic(null);
      earnStar(wordId);
      playKey(clip, `iq-${wordId}-ar`);
      if (next.length === 4) {
        setTimeout(() => { setMatched([]); setRound((r) => r + 1); }, 1200);
      }
    } else {
      setSelectedPic(null);
    }
  };

  return (
    <Shell titleAr="طابق الكلمات" titleEn="Match It" lang={lang} onBack={onBack}>
      <p className="mt-3 text-sm font-bold text-muted-foreground">{lang === "ar" ? "اضغط الصورة ثم الكلمة الصحيحة!" : "Tap a picture, then its word!"}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="grid gap-3">
          {roundWords.pics.map((w) => (
            <GameButton
              key={w.id}
              tone={matched.includes(w.id) ? "mint" : selectedPic === w.id ? "sky" : "neutral"}
              className="grid min-h-20 place-items-center rounded-3xl text-4xl"
              onClick={() => !matched.includes(w.id) && setSelectedPic(w.id)}
            >
              {w.emoji}
            </GameButton>
          ))}
        </div>
        <div className="grid gap-3">
          {roundWords.labels.map((w) => (
            <GameButton
              key={w.id}
              tone={matched.includes(w.id) ? "mint" : "neutral"}
              className="grid min-h-20 place-items-center rounded-3xl text-xl font-black"
              onClick={() => tryMatch(w.id)}
            >
              <span dir="rtl">{w.arabic}</span>
            </GameButton>
          ))}
        </div>
      </div>
      <div className="mt-4"><ProgressBar value={matched.length} total={4} /></div>
    </Shell>
  );
}

function AnimalDiscovery({ lang, clip, earnStar, onBack }: { lang: Lang; clip: ReturnType<typeof useClip>; earnStar: (id: string) => void; onBack: () => void }) {
  return (
    <Shell titleAr="حيوانات القرآن" titleEn="Qur'an Animals" lang={lang} onBack={onBack}>
      <p className="mt-3 text-sm font-bold text-muted-foreground">{lang === "ar" ? "اضغط على حيوان لتسمع اسمه!" : "Tap an animal to hear its name!"}</p>
      <div className="mt-4 grid gap-3">
        {animals.map((a) => (
          <GameButton
            key={a.id}
            tone="neutral"
            className="flex items-center gap-3 rounded-3xl p-3 text-start"
            onClick={() => { earnStar(a.id); playKey(clip, `iq-${a.id}-ar`); }}
          >
            <span className="text-5xl">{a.emoji}</span>
            <span className="min-w-0 flex-1">
              <span dir="rtl" className="block text-xl font-black">{a.arabic} <span className="text-sm font-bold text-muted-foreground" dir="ltr">{a.english}</span></span>
              <span className="mt-0.5 block text-xs font-bold text-muted-foreground">{lang === "ar" ? a.refAr : a.refEn}</span>
            </span>
            <Volume2 className="h-5 w-5 shrink-0 text-muted-foreground" />
          </GameButton>
        ))}
      </div>
    </Shell>
  );
}

function StoryPlayer({ story, lang, clip, earnStar, onBack }: { story: QuranStory; lang: Lang; clip: ReturnType<typeof useClip>; earnStar: (id: string) => void; onBack: () => void }) {
  const [line, setLine] = useState(0);
  const [phase, setPhase] = useState<"lines" | "tap" | "done">("lines");
  const target = wordById(story.tapWordId);
  const current = story.lines[line];

  const next = useCallback(() => {
    if (line + 1 < story.lines.length) {
      const n = line + 1;
      setLine(n);
      playKey(clip, story.lines[n]!.audioKey);
    } else {
      setPhase("tap");
      playKey(clip, lang === "ar" ? `iq-q-${target.id}-ar` : `iq-q-${target.id}-en`);
    }
  }, [clip, lang, line, story, target]);

  return (
    <Shell titleAr={story.titleAr} titleEn={story.titleEn} lang={lang} onBack={onBack}>
      <div className={cn("relative mt-4 flex h-64 flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-b p-4 shadow-inner", story.sky)}>
        <span className="absolute left-[12%] top-[10%] text-6xl">{story.emoji}</span>
        <span className="absolute right-[14%] top-[22%] text-4xl opacity-80">✨</span>
        {phase === "tap" ? (
          <button
            type="button"
            aria-label={target.english}
            className="absolute left-1/2 top-1/3 -translate-x-1/2 animate-bounce text-7xl"
            onClick={() => { earnStar(target.id); playKey(clip, `iq-${target.id}-ar`); setPhase("done"); }}
          >
            {target.emoji}
          </button>
        ) : null}
        <div className="flex items-end justify-between">
          <FamilyCharacter name="hamad" className="animate-hamad-float" speaking={phase === "lines" && current?.speaker === "hamad"} />
          <FamilyCharacter name="talal" className="animate-hamad-float" speaking={phase === "lines" && current?.speaker === "talal"} />
        </div>
      </div>

      {phase === "lines" && current ? (
        <div className="mt-3 flex items-center gap-3 rounded-3xl bg-card p-3 shadow-sm">
          <FamilyCharacter name={current.speaker} speaking={clip.playing} />
          <div className="min-w-0 flex-1">
            <p dir="rtl" className="text-right text-lg font-black">{current.ar}</p>
            <p className="text-xs font-bold text-muted-foreground">{current.en}</p>
          </div>
        </div>
      ) : null}
      {phase === "tap" ? (
        <div className="mt-3 rounded-3xl bg-card p-4 text-center shadow-sm">
          <p dir="rtl" className="text-lg font-black">{story.tapPromptAr}</p>
          <p className="text-sm font-bold text-muted-foreground">{story.tapPromptEn}</p>
        </div>
      ) : null}
      {phase === "done" ? (
        <div className="mt-3 rounded-3xl bg-success/15 p-4 text-center">
          <p className="text-2xl font-black text-success">{lang === "ar" ? "رَائِعٌ! 🎉" : "Wonderful! 🎉"}</p>
          <p dir="rtl" className="mt-1 text-xl font-black">{target.arabic} — {target.english}</p>
        </div>
      ) : null}

      <div className="mt-4 flex gap-2">
        {phase === "lines" ? (
          <>
            <GameButton tone="sky" className="flex-1" onClick={() => playKey(clip, current!.audioKey)}>
              <Volume2 className="h-5 w-5" /> {lang === "ar" ? "اسمع" : "Listen"}
            </GameButton>
            <GameButton tone="sun" className="flex-1" onClick={next}>{lang === "ar" ? "التالي" : "Next"}</GameButton>
          </>
        ) : (
          <GameButton tone="sun" className="flex-1" onClick={() => { setLine(0); setPhase("lines"); playKey(clip, story.lines[0]!.audioKey); }}>
            {lang === "ar" ? "العب مرة أخرى" : "Play again"}
          </GameButton>
        )}
      </div>
    </Shell>
  );
}

function SingAlong({ lang, clip, onBack }: { lang: Lang; clip: ReturnType<typeof useClip>; onBack: () => void }) {
  const [active, setActive] = useState<string | null>(null);
  const singWords = ["najm", "qamar", "shams", "maa", "shajara", "nur"].map(wordById);

  const sing = useCallback((word: WorldWord) => {
    setActive(word.id);
    // Echo style: play the word three times with a beat gap, like a chant.
    playKey(clip, `iq-${word.id}-ar`, () => {
      setTimeout(() => playKey(clip, `iq-${word.id}-ar`, () => {
        setTimeout(() => playKey(clip, `iq-${word.id}-ar`, () => setActive(null)), 450);
      }), 450);
    });
  }, [clip]);

  return (
    <Shell titleAr="أنشودة الكلمات" titleEn="Word Sing-Along" lang={lang} onBack={onBack}>
      <div className="mt-3 flex items-center gap-3 rounded-3xl bg-card p-3 shadow-sm">
        <FamilyCharacter name="yousef" className="animate-hamad-float" speaking={active !== null} />
        <SpeechBubble>{lang === "ar" ? "اضغط كلمة ورددها معي ثلاث مرات!" : "Tap a word and echo it with me three times!"}</SpeechBubble>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {singWords.map((w) => (
          <GameButton
            key={w.id}
            tone={active === w.id ? "sun" : "neutral"}
            className={cn("flex min-h-28 flex-col items-center justify-center gap-1 rounded-3xl p-3", active === w.id && "animate-pulse")}
            onClick={() => sing(w)}
          >
            <span className="text-4xl">{w.emoji}</span>
            <span dir="rtl" className="text-xl font-black">{w.arabic}</span>
            <span className="text-xs font-bold text-muted-foreground">{w.english}</span>
          </GameButton>
        ))}
      </div>
      <p className="mt-4 text-center text-xs font-bold text-muted-foreground">
        {lang === "ar" ? "🎵 ردد مع الصوت: نَجْم… نَجْم… نَجْم!" : "🎵 Echo the voice: say it three times!"}
      </p>
    </Shell>
  );
}
