import { createFileRoute } from "@tanstack/react-router";
import {
  Apple,
  ArrowLeft,
  Check,
  ChevronRight,
  CircleDot,
  BookOpen,
  Grid3X3,
  Lightbulb,
  Music2,
  Moon,
  Pause,
  Play,
  Plus,
  Rocket,
  RotateCcw,
  Settings,
  Sparkles,
  Star,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Globe2 } from "lucide-react";
import type { GeoLesson } from "@/data/geography";
const GeoHome = lazy(() => import("@/components/geo/GeoPath").then((m) => ({ default: m.GeoHome })));
const GeoLessonScreen = lazy(() => import("@/components/geo/GeoPath").then((m) => ({ default: m.GeoLessonScreen })));
const IslamicExplorer = lazy(() => import("@/components/explorer/IslamicExplorer").then((m) => ({ default: m.IslamicExplorer })));
const InteractiveQuran = lazy(() => import("@/components/iq/InteractiveQuran").then((m) => ({ default: m.InteractiveQuran })));
const ScienceWorld = lazy(() => import("@/components/science/ScienceWorld").then((m) => ({ default: m.ScienceWorld })));
const BuildingWorld = lazy(() => import("@/components/building/BuildingWorld").then((m) => ({ default: m.BuildingWorld })));
const WuduSalahWorld = lazy(() => import("@/components/explorer/WuduSalah").then((m) => ({ default: m.WuduSalahWorld })));
const ChessWorld = lazy(() => import("@/components/chess/ChessWorld").then((m) => ({ default: m.ChessWorld })));
const SeekAndFind = lazy(() => import("@/components/arabic/SeekAndFind").then((m) => ({ default: m.SeekAndFind })));
const PalestinianKitchen = lazy(() => import("@/components/kitchen/PalestinianKitchen").then((m) => ({ default: m.PalestinianKitchen })));
const MathQuest = lazy(() => import("@/components/math/MathQuest").then((m) => ({ default: m.MathQuest })));
const MontessoriBeadChains = lazy(() => import("@/components/math/MontessoriBeadChains").then((m) => ({ default: m.MontessoriBeadChains })));
const MathBowling = lazy(() => import("@/components/math/MathBowling").then((m) => ({ default: m.MathBowling })));
import { GameButton } from "@/components/game/GameButton";
import { surahs, type SurahData } from "@/data/surahs";
import { juz29Surahs } from "@/data/surahsJuz29";
import { juz27Surahs } from "@/data/surahsJuz27";
import { juz28Surahs } from "@/data/surahsJuz28";
import { juz22Surahs } from "@/data/surahsJuz22";
import { juz15Surahs } from "@/data/surahsJuz15";
import { juz3Surahs } from "@/data/surahsJuz3";
import { juz1Surahs } from "@/data/surahsJuz1";

const allSurahs: readonly SurahData[] = [...surahs, ...juz29Surahs, ...juz28Surahs, ...juz27Surahs, ...juz22Surahs, ...juz15Surahs, ...juz3Surahs, ...juz1Surahs];
import { units, allLessons, type Lesson } from "@/data/arabicCurriculum";
import { FinishAyah } from "@/components/quran/FinishAyah";
import { AlaqMemorize } from "@/components/quran/AlaqMemorize";
import { SurahMemorize } from "@/components/quran/SurahMemorize";
import type { MemoryGroup } from "@/components/quran/SurahMemorize";
import { ArabicLesson, ArabicMap } from "@/components/arabic/ArabicPath";
import { ArabicWorld, ArabicWorldHub } from "@/components/arabic/ArabicWorld";
import { LearningWorld } from "@/components/arabic/LearningWorld";
import { Grade1Home, Grade1Lesson } from "@/components/math/Grade1Math";
import { g1Lessons, type G1Lesson } from "@/data/grade1Math";
import { ProgressScene } from "@/components/learn/ProgressScene";
import { WordPicture } from "@/components/learn/shared";
import { EMPTY_PROGRESS, surahProgress, useLearningProgress, type LearningProgress } from "@/lib/learningProgress";
import hamadAsset from "@/assets/hamad.jpg.asset.json";
import talalAsset from "@/assets/talal.jpg.asset.json";
import yousefAsset from "@/assets/yousef.jpg.asset.json";
import mosqueIcon from "@/assets/salah/mosque-icon.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hamad’s Learning Adventure — Math & Quran" },
      { name: "description", content: "A visual, touch-friendly learning adventure with math games and guided Quran recitation." },
      { property: "og:title", content: "Hamad’s Learning Adventure" },
      { property: "og:description", content: "Practice math, Arabic, and all of Juz Amma verse by verse with Hamad." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MathAdventure,
});

type Screen = "picker" | "home" | "game" | "reward" | "parent" | "surah" | "ayah" | "arabic" | "geo" | "iq" | "aw" | "g1" | "ie" | "bowling" | "quest" | "build" | "lw" | "sci" | "kitchen" | "chess" | "memorize" | "seek" | "beads" | "ws";
type GameMode = "multiplication" | "addition";
type ActivityTab = GameMode | "grade1" | "bowling" | "surah" | "arabic" | "geo" | "iq" | "more";
type Level = 1 | 2 | 3 | 4 | 5;
type TimesTable = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type Stats = { games: number; correct: number; stars: number };
type Problem = { first: number; second: number; answer: number };

const STORAGE_KEY = "math-adventure-progress";
const DEFAULT_STATS: Stats = { games: 0, correct: 0, stars: 0 };
const QUESTIONS = 10;
// Fallback SVG placeholders for character avatars (images not available in self-hosted version)
const characterSvgs = {
  hamad: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23FFD966'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%23F4A460'/%3E%3Crect x='35' y='50' width='30' height='25' fill='%234169E1'/%3E%3C/svg%3E",
  talal: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2390EE90'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%23DEB887'/%3E%3Crect x='35' y='50' width='30' height='25' fill='%23FF6347'/%3E%3C/svg%3E",
  yousef: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23FFB6C1'/%3E%3Ccircle cx='50' cy='35' r='12' fill='%23FDBCB4'/%3E%3Crect x='38' y='50' width='24' height='20' fill='%238A2BE2'/%3E%3C/svg%3E",
};
const characterImages = { hamad: characterSvgs.hamad, talal: characterSvgs.talal, yousef: characterSvgs.yousef };

const levels: Array<{ id: Level; title: string; detail: string; tone: "sun" | "mint" | "sky" | "berry" }> = [
  { id: 1, title: "Little Numbers", detail: "Add up to 5 · Ages 3–4", tone: "sun" },
  { id: 2, title: "Growing Numbers", detail: "Add up to 10 · Ages 4–5", tone: "sky" },
  { id: 3, title: "Big Numbers", detail: "Add up to 20 · Ages 5–6", tone: "mint" },
  { id: 4, title: "Double Digits", detail: "Add without carrying", tone: "berry" },
  { id: 5, title: "Math Master", detail: "Add with carrying", tone: "sun" },
];

const tableTones: Array<"sun" | "mint" | "sky" | "berry"> = ["sun", "sky", "mint", "berry"];

const numberblocksSongs: Partial<Record<TimesTable, { title: string; trackId: string }>> = {
  1: { title: "One Times Table", trackId: "7ocUsYX4bUhEPQWti4OktD" },
  2: { title: "Two Times Table", trackId: "57AQ9UBem5pUN60cTWnqLM" },
  3: { title: "Three Times Table", trackId: "5OzFSPBKFsSGoGfHd2Wwl7" },
  4: { title: "Four Times Table", trackId: "4wM4mkDb740w15ijJSgzvD" },
  5: { title: "Five Times Table", trackId: "1lvdphSvOdJyfRGx7jQ5d2" },
  10: { title: "Ten Times Table", trackId: "70Qgb8tanO2biTMGyGNWdv" },
};

function makeAdditionProblem(level: Level): Problem {
  if (level === 1) {
    const first = 1 + Math.floor(Math.random() * 4);
    const second = 1 + Math.floor(Math.random() * (5 - first));
    return { first, second, answer: first + second };
  }
  if (level === 2) {
    const first = 1 + Math.floor(Math.random() * 7);
    const second = 1 + Math.floor(Math.random() * (10 - first));
    return { first, second, answer: first + second };
  }
  if (level === 3) {
    const first = 1 + Math.floor(Math.random() * 12);
    const second = 1 + Math.floor(Math.random() * (20 - first));
    return { first, second, answer: first + second };
  }
  if (level === 4) {
    const firstTens = 1 + Math.floor(Math.random() * 4);
    const secondTens = 1 + Math.floor(Math.random() * 4);
    const firstOnes = Math.floor(Math.random() * 8);
    const secondOnes = Math.floor(Math.random() * (10 - firstOnes));
    const first = firstTens * 10 + firstOnes;
    const second = secondTens * 10 + secondOnes;
    return { first, second, answer: first + second };
  }
  const firstTens = 2 + Math.floor(Math.random() * 5);
  const secondTens = 1 + Math.floor(Math.random() * 3);
  const firstOnes = 2 + Math.floor(Math.random() * 7);
  const secondOnes = 10 - firstOnes + Math.floor(Math.random() * firstOnes);
  const first = firstTens * 10 + firstOnes;
  const second = secondTens * 10 + secondOnes;
  return { first, second, answer: first + second };
}

function makeMultiplicationProblem(table: TimesTable): Problem {
  const multiplier = 1 + Math.floor(Math.random() * 12);
  return { first: table, second: multiplier, answer: table * multiplier };
}

function makeChoices(answer: number, spread: number) {
  const choices = new Set([answer]);
  while (choices.size < 4) {
    const offset = 1 + Math.floor(Math.random() * spread);
    const candidate = Math.max(1, answer + (Math.random() > 0.5 ? offset : -offset));
    choices.add(candidate);
  }
  return [...choices].sort(() => Math.random() - 0.5);
}

function makeAdditionChoices(answer: number, level: Level) {
  return makeChoices(answer, level <= 2 ? 5 : level === 3 ? 10 : 18);
}

function makeMultiplicationChoices(problem: Problem) {
  const choices = new Set([problem.answer]);
  const nearby = [
    problem.first * Math.max(1, problem.second - 1),
    problem.first * Math.min(12, problem.second + 1),
    problem.answer + problem.second,
    Math.max(1, problem.answer - problem.second),
  ].sort(() => Math.random() - 0.5);
  nearby.forEach((choice) => choices.size < 4 && choices.add(choice));
  while (choices.size < 4) choices.add(problem.answer + choices.size + 1);
  return [...choices].sort(() => Math.random() - 0.5);
}

function playTone(kind: "right" | "wrong" | "tap", enabled: boolean) {
  if (!enabled || typeof window === "undefined") return;
  const AudioContextType = window.AudioContext;
  if (!AudioContextType) return;
  const context = new AudioContextType();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.frequency.setValueAtTime(kind === "right" ? 720 : kind === "wrong" ? 300 : 470, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(kind === "right" ? 1050 : kind === "wrong" ? 220 : 620, context.currentTime + 0.18);
  gain.gain.setValueAtTime(kind === "tap" ? 0.07 : 0.15, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.22);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.22);
}

function Character({ name, size = "large", className = "" }: { name: keyof typeof characterImages; size?: "small" | "large"; className?: string }) {
  return (
    <img
      src={characterImages[name]}
      alt={name.charAt(0).toUpperCase() + name.slice(1)}
      draggable={false}
      className={`${size === "large" ? "h-24 w-24 rounded-2xl border-4 sm:h-28 sm:w-28" : "h-12 w-12 shrink-0 rounded-xl border-2"} border-card object-cover shadow-lg ${className}`}
    />
  );
}

function MathAdventure() {
  const [screen, setScreen] = useState<Screen>("picker");
  const settingsReturnRef = useRef<Screen>("picker");
  const [geoLesson, setGeoLesson] = useState<GeoLesson | null>(null);
  const [homeTab, setHomeTab] = useState<ActivityTab>("multiplication");
  const [mode, setMode] = useState<GameMode>("multiplication");
  const [level, setLevel] = useState<Level>(1);
  const [table, setTable] = useState<TimesTable>(1);
  const [selectedSurah, setSelectedSurah] = useState<SurahData>(() => surahs[0]!);
  const [sound, setSound] = useState(true);
  const [learning, updateLearning] = useLearningProgress();
  const [arabicLesson, setArabicLesson] = useState<Lesson>(allLessons[0]!);
  const [awView, setAwView] = useState("free");
  const [g1Lesson, setG1Lesson] = useState<G1Lesson>(g1Lessons[0]!);
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [roundScore, setRoundScore] = useState(0);
  const [question, setQuestion] = useState(1);
  const [problem, setProblem] = useState(() => makeMultiplicationProblem(1));
  const [choices, setChoices] = useState(() => makeMultiplicationChoices(problem));
  const [picked, setPicked] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"right" | "wrong" | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Partial<Stats>;
      setStats({ games: parsed.games ?? 0, correct: parsed.correct ?? 0, stars: parsed.stars ?? 0 });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const saveStats = (next: Stats) => {
    setStats(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const nextProblem = useCallback((nextMode: GameMode, nextLevel: Level, nextTable: TimesTable) => {
    const next = nextMode === "multiplication" ? makeMultiplicationProblem(nextTable) : makeAdditionProblem(nextLevel);
    setProblem(next);
    setChoices(nextMode === "multiplication" ? makeMultiplicationChoices(next) : makeAdditionChoices(next.answer, nextLevel));
    setPicked(null);
    setFeedback(null);
  }, []);

  const startMultiplication = (nextTable: TimesTable) => {
    setMode("multiplication");
    setTable(nextTable);
    setQuestion(1);
    setRoundScore(0);
    nextProblem("multiplication", level, nextTable);
    setScreen("game");
  };

  const startAddition = (nextLevel: Level) => {
    setMode("addition");
    setLevel(nextLevel);
    setQuestion(1);
    setRoundScore(0);
    nextProblem("addition", nextLevel, table);
    setScreen("game");
  };

  const answer = (choice: number) => {
    if (feedback) return;
    setPicked(choice);
    if (choice !== problem.answer) {
      setFeedback("wrong");
      playTone("wrong", sound);
      timerRef.current = setTimeout(() => {
        setPicked(null);
        setFeedback(null);
      }, 1100);
      return;
    }
    const nextScore = roundScore + 1;
    setRoundScore(nextScore);
    setFeedback("right");
    playTone("right", sound);
    timerRef.current = setTimeout(() => {
      if (question < QUESTIONS) {
        setQuestion((current) => current + 1);
        nextProblem(mode, level, table);
      } else {
        saveStats({ games: stats.games + 1, correct: stats.correct + nextScore, stars: stats.stars + nextScore });
        setScreen("reward");
      }
    }, 850);
  };

  const goHome = () => {
    if (screen === "game" || screen === "reward") setHomeTab(mode);
    setScreen("home");
  };

  const openCategory = (tab: ActivityTab) => {
    setHomeTab(tab);
    setScreen("home");
  };

  const openSettings = () => {
    settingsReturnRef.current = screen;
    setScreen("parent");
  };

  return (
    <main className="min-h-dvh bg-background text-foreground">
      {screen !== "parent" && (
        <div className="fixed right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-30">
          <GameButton tone="neutral" className="grid h-12 w-12 place-items-center rounded-full p-0" onClick={openSettings} aria-label="Parent settings">
            <Settings className="h-5 w-5" />
          </GameButton>
        </div>
      )}
      {screen === "picker" && <GamePicker stats={stats} onOpenCategory={openCategory} onStartIq={() => setScreen("iq")} onStartIe={() => setScreen("ie")} onStartBuild={() => setScreen("build")} onStartScience={() => setScreen("sci")} onStartKitchen={() => setScreen("kitchen")} onStartChess={() => setScreen("chess")} onStartWs={() => setScreen("ws")} />}
      {screen === "chess" && <Suspense fallback={null}><ChessWorld onExit={() => setScreen("picker")} /></Suspense>}
      {screen === "ws" && <Suspense fallback={null}><WuduSalahWorld onExit={() => setScreen("picker")} /></Suspense>}
      {screen === "kitchen" && <Suspense fallback={null}><PalestinianKitchen onExit={() => setScreen("picker")} /></Suspense>}
      {screen === "sci" && <Suspense fallback={null}><ScienceWorld onExit={() => setScreen("picker")} /></Suspense>}
      {screen === "home" && <HomeScreen stats={stats} learning={learning} tab={homeTab} onBack={() => setScreen("picker")} onTab={setHomeTab} onStartBowling={() => setScreen("bowling")} onStartQuest={() => setScreen("quest")} onStartBeads={() => setScreen("beads")} onStartMultiplication={startMultiplication} onStartAddition={startAddition} onStartSurah={(surah) => { setSelectedSurah(surah); setScreen("surah"); }} onStartAyah={(surah) => { setSelectedSurah(surah); setScreen("ayah"); }} onStartMemorize={(surah) => { setSelectedSurah(surah); setScreen("memorize"); }} onStartArabic={(lesson) => { setArabicLesson(lesson); setScreen("arabic"); }} onProgress={updateLearning} onStartGeo={(lesson) => { setGeoLesson(lesson); setScreen("geo"); }} onStartIq={() => setScreen("iq")} onStartIe={() => setScreen("ie")} onOpenArabicWorld={(v) => { if (v === "lw") { setScreen("lw"); return; } if (v === "seek") { setScreen("seek"); return; } setAwView(v); setScreen("aw"); }} onStartG1={(l) => { setG1Lesson(l); setScreen("g1"); }} />}
      {screen === "build" && <Suspense fallback={null}><BuildingWorld onExit={() => setScreen("picker")} /></Suspense>}
      {screen === "beads" && <Suspense fallback={null}><MontessoriBeadChains onExit={goHome} /></Suspense>}
      {screen === "bowling" && <Suspense fallback={null}><MathBowling onExit={goHome} /></Suspense>}
      {screen === "quest" && <Suspense fallback={null}><MathQuest onExit={goHome} /></Suspense>}
      {screen === "g1" && <Grade1Lesson key={g1Lesson.id} lesson={g1Lesson} onProgress={updateLearning} onExit={goHome} />}
      {screen === "surah" && <SurahScreen surah={selectedSurah} onExit={goHome} />}
      {screen === "memorize" && <MemorizeScreen surah={selectedSurah} onExit={goHome} />}
      {screen === "ayah" && <FinishAyah surah={selectedSurah} progress={learning} onProgress={updateLearning} sound={sound} onExit={goHome} />}
      {screen === "geo" && geoLesson && <Suspense fallback={null}><GeoLessonScreen key={geoLesson.id} lesson={geoLesson} progress={learning} onProgress={updateLearning} onExit={goHome} /></Suspense>}
      {screen === "ie" && <Suspense fallback={null}><IslamicExplorer onExit={() => setScreen("picker")} /></Suspense>}
      {screen === "iq" && <Suspense fallback={null}><InteractiveQuran progress={learning} update={updateLearning} onExit={() => setScreen("picker")} /></Suspense>}
      {screen === "seek" && <Suspense fallback={null}><SeekAndFind onExit={goHome} /></Suspense>}
      {screen === "lw" && <LearningWorld onExit={goHome} onOpenWorld={(v) => { setAwView(v); setScreen("aw"); }} />}
      {screen === "aw" && <ArabicWorld key={awView} view={awView} progress={learning} onProgress={updateLearning} onExit={goHome} onStartLesson={(lesson) => { setArabicLesson(lesson); setScreen("arabic"); }} />}
      {screen === "arabic" && <ArabicLesson key={arabicLesson.id} lesson={arabicLesson} progress={learning} onProgress={updateLearning} onExit={goHome} />}
      {screen === "game" && <GameScreen mode={mode} level={level} table={table} question={question} problem={problem} choices={choices} picked={picked} feedback={feedback} sound={sound} onAnswer={answer} onExit={goHome} />}
      {screen === "reward" && <RewardScreen mode={mode} score={roundScore} totalStars={stats.stars} onAgain={() => mode === "multiplication" ? startMultiplication(table) : startAddition(level)} onHome={goHome} />}
      {screen === "parent" && <ParentScreen sound={sound} stats={stats} learning={learning} onToggleSound={() => setSound((value) => !value)} onReset={() => { saveStats(DEFAULT_STATS); updateLearning(() => EMPTY_PROGRESS); }} onClose={() => setScreen(settingsReturnRef.current)} />}
    </main>
  );
}

function MemorizeScreen({ surah, onExit }: { surah: SurahData; onExit: () => void }) {
  const ALAQ_GROUPS: MemoryGroup[] = [
    { from: 1, to: 3 },
    { from: 4, to: 6 },
    { from: 7, to: 9 },
    { from: 10, to: 12 },
    { from: 13, to: 15 },
    { from: 16, to: 19 },
  ];

  const RAHMAN_GROUPS: MemoryGroup[] = [
    { from: 1, to: 6 },
    { from: 7, to: 12 },
    { from: 13, to: 18 },
    { from: 19, to: 24 },
    { from: 25, to: 30 },
    { from: 31, to: 36 },
    { from: 37, to: 42 },
    { from: 43, to: 48 },
    { from: 49, to: 54 },
    { from: 55, to: 60 },
    { from: 61, to: 66 },
    { from: 67, to: 72 },
    { from: 73, to: 78 },
  ];

  const BAYYINAH_GROUPS: MemoryGroup[] = [
    { from: 1, to: 4 },
    { from: 5, to: 8 },
  ];

  let groups: MemoryGroup[] = ALAQ_GROUPS;
  if (surah.id === "rahman") groups = RAHMAN_GROUPS;
  if (surah.id === "bayyinah") groups = BAYYINAH_GROUPS;

  // Use AlaqMemorize for Al-Alaq (backward compatibility with existing videos)
  if (surah.id === "alalaq") {
    return <AlaqMemorize surah={surah} onExit={onExit} />;
  }

  // Use generic SurahMemorize for other surahs
  return <SurahMemorize surah={surah} groups={groups} onExit={onExit} />;
}

function GamePicker({ stats, onOpenCategory, onStartIq, onStartIe, onStartBuild, onStartScience, onStartKitchen, onStartChess, onStartWs }: { onStartKitchen: () => void; onStartChess: () => void; onStartWs: () => void; stats: Stats; onOpenCategory: (tab: ActivityTab) => void; onStartIq: () => void; onStartIe: () => void; onStartBuild: () => void; onStartScience: () => void }) {
  const choices: Array<{ label: string; detail: string; icon: ReactNode; tone: "sun" | "mint" | "sky" | "berry"; action: () => void }> = [
    { label: "Math", detail: "Numbers, tables & bowling", icon: <Grid3X3 className="h-9 w-9" />, tone: "mint", action: () => onOpenCategory("multiplication") },
    { label: "Qur’an", detail: "Listen & finish the ayah", icon: <Moon className="h-9 w-9" />, tone: "berry", action: () => onOpenCategory("surah") },
    { label: "Arabic", detail: "Letters, words & stories", icon: <span lang="ar" className="font-arabic text-4xl leading-none">أ ب</span>, tone: "sun", action: () => onOpenCategory("arabic") },
    { label: "Geography", detail: "Explore our world", icon: <Globe2 className="h-9 w-9" />, tone: "sky", action: () => onOpenCategory("geo") },
    { label: "Interactive Qur’an", detail: "Explore, listen & discover", icon: <Sparkles className="h-9 w-9" />, tone: "berry", action: onStartIq },
    { label: "Wudu & Salah", detail: "الوضوء والصلاة · learn to pray", icon: <img src={mosqueIcon} alt="" className="h-12 w-auto drop-shadow" />, tone: "mint", action: onStartWs },
    { label: "More to Explore", detail: "Mosque, home & stories", icon: <span className="text-4xl leading-none">🕌</span>, tone: "mint", action: onStartIe },
    { label: "Building World", detail: "Build, copy & create", icon: <span className="text-4xl leading-none">🧱</span>, tone: "sun", action: onStartBuild },
    { label: "Science World", detail: "عالم العلوم · test & discover", icon: <span className="text-4xl leading-none">🔬</span>, tone: "sky", action: onStartScience },
    { label: "Palestinian Kitchen", detail: "مطبخنا الفلسطيني · cook & taste", icon: <span className="text-4xl leading-none">🍳</span>, tone: "berry", action: onStartKitchen },
    { label: "Chess", detail: "Play, learn & challenges", icon: <span className="text-4xl leading-none">♟️</span>, tone: "sky", action: onStartChess },
  ];
  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(3.75rem,env(safe-area-inset-top))] sm:px-6 min-[960px]:max-w-6xl min-[960px]:justify-center min-[960px]:py-8">
      <header className="text-center">
        <p className="text-sm font-black uppercase text-muted-foreground">Learn with Hamad &amp; Talal</p>
        <h1 className="mt-1 text-3xl font-black leading-tight sm:text-5xl">Choose an adventure</h1>
        {stats.stars > 0 && <p className="mt-2 inline-flex items-center gap-1 text-sm font-black text-muted-foreground"><Star className="h-4 w-4 fill-primary text-primary" />{stats.stars} stars collected</p>}
      </header>
      <div className="mt-5 grid grid-cols-2 gap-3 min-[960px]:mt-8 min-[960px]:grid-cols-4 min-[960px]:gap-4">
        {choices.map((choice) => (
          <GameButton key={choice.label} tone={choice.tone} className="flex min-h-32 min-w-0 flex-col items-center justify-center gap-2 px-3 py-4 text-center min-[960px]:min-h-44" onClick={choice.action}>
            {choice.icon}
            <span className="text-lg font-black leading-tight min-[960px]:text-xl">{choice.label}</span>
            <span className="text-xs font-bold leading-snug opacity-80 min-[960px]:text-sm">{choice.detail}</span>
          </GameButton>
        ))}
      </div>
    </section>
  );
}

function HomeScreen({ onStartQuest, onStartBeads, onBack, stats, learning, tab, onTab, onStartBowling, onStartMultiplication, onStartAddition, onStartSurah, onStartAyah, onStartMemorize, onStartArabic, onProgress, onStartGeo, onStartIq, onStartIe, onOpenArabicWorld, onStartG1 }: { onStartQuest: () => void; onStartBeads: () => void; onBack: () => void; onStartIe: () => void; onStartG1: (lesson: G1Lesson) => void; onStartBowling: () => void; onOpenArabicWorld: (view: string) => void; onProgress: (change: (p: LearningProgress) => LearningProgress) => void; onStartGeo: (lesson: GeoLesson) => void; onStartIq: () => void; stats: Stats; learning: LearningProgress; tab: ActivityTab; onTab: (mode: ActivityTab) => void; onStartMultiplication: (table: TimesTable) => void; onStartAddition: (level: Level) => void; onStartSurah: (surah: SurahData) => void; onStartAyah: (surah: SurahData) => void; onStartMemorize?: (surah: SurahData) => void; onStartArabic: (lesson: Lesson) => void }) {
  const isMath = tab === "multiplication" || tab === "addition" || tab === "grade1" || tab === "bowling";
  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(4.5rem,env(safe-area-inset-top))] sm:px-6 min-[960px]:max-w-6xl min-[960px]:pb-8 min-[960px]:pt-8">
      <header className="relative px-12 text-center sm:px-14">
        <GameButton tone="neutral" className="absolute left-0 top-0 grid h-12 w-12 place-items-center rounded-full p-0" onClick={onBack} aria-label="Back to all games"><ArrowLeft className="h-5 w-5" /></GameButton>
        <p className="text-sm font-black uppercase text-muted-foreground">Learn with Hamad</p>
        <h1 className="mt-1 text-3xl font-black leading-tight sm:text-5xl">Learning Adventure</h1>
      </header>
      <div className="mt-4 flex items-center justify-center gap-4">
        <Character name={tab === "arabic" ? "talal" : "hamad"} className="animate-hamad-float" />
        <div className="max-w-52 rounded-2xl rounded-bl-sm bg-card px-4 py-3 text-left text-sm font-black shadow-sm">
          {tab === "multiplication" ? "Pick a times table and let’s build equal groups!" : tab === "addition" ? "Ready to add numbers together?" : tab === "bowling" ? "Take turns, solve, and bowl together!" : tab === "grade1" ? "هيا نتعلم رياضيات الصف الأول!" : tab === "arabic" ? "هيا نتعلم العربية!" : tab === "geo" ? "Let’s explore the world! · هيا نكتشف العالم" : tab === "more" ? "Visit the mosque, home, garden and market!" : tab === "iq" ? "اكتشف • استمع • أنشد • تعلّم · Explore, listen, sing, discover!" : "Let’s listen and learn the Quran together."}
        </div>
      </div>
      {stats.stars > 0 && (
        <div className="mx-auto mt-4 flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-black shadow-sm">
          <Star className="h-5 w-5 fill-primary text-primary" /> {stats.stars} stars collected
        </div>
      )}
      {isMath && (
        <div className="mt-5 grid grid-cols-2 gap-2" role="tablist" aria-label="Choose a math game">
          <GameButton tone={tab === "multiplication" ? "sky" : "neutral"} className="min-h-12 text-sm" onClick={() => onTab("multiplication")} role="tab" aria-selected={tab === "multiplication"}>
            <span className="inline-flex items-center gap-2"><X className="h-4 w-4" />Multiplication</span>
          </GameButton>
          <GameButton tone={tab === "addition" ? "sky" : "neutral"} className="min-h-12 text-sm" onClick={() => onTab("addition")} role="tab" aria-selected={tab === "addition"}>
            <span className="inline-flex items-center gap-2"><Plus className="h-4 w-4" />Addition</span>
          </GameButton>
          <GameButton tone={tab === "grade1" ? "sky" : "neutral"} className="min-h-12 text-sm" onClick={() => onTab("grade1")} role="tab" aria-selected={tab === "grade1"}>
            <span lang="ar" className="font-arabic font-black">الصف الأول</span>
          </GameButton>
          <GameButton tone={tab === "bowling" ? "sky" : "neutral"} className="min-h-12 text-sm" onClick={onStartBowling} role="tab" aria-selected={tab === "bowling"}>
            <span className="inline-flex items-center gap-2">🎳 Math Bowling</span>
          </GameButton>
          <GameButton tone="berry" className="min-h-12 text-sm" onClick={onStartQuest}>
            <span className="inline-flex items-center gap-2">🌟 Math Quest · 8 levels</span>
          </GameButton>
          <GameButton tone="neutral" className="min-h-12 text-sm" onClick={onStartBeads}>
            <span className="inline-flex items-center gap-2">📿 Bead Chains</span>
          </GameButton>
        </div>
      )}
      {tab === "bowling" ? (
        <div className="mt-6" role="tabpanel"><GameButton tone="mint" className="flex min-h-40 w-full flex-col items-center justify-center gap-2 rounded-3xl p-6" onClick={onStartBowling}><span className="text-5xl">🎳</span><span className="text-2xl font-black">Talal &amp; Hamad&apos;s Math Bowling</span><span className="text-sm font-bold opacity-80">10 cooperative rounds · Take turns and bowl!</span></GameButton></div>
      ) : tab === "grade1" ? (
        <div className="mt-6" role="tabpanel"><Grade1Home progress={learning} onStart={onStartG1} /></div>
      ) : tab === "multiplication" ? (
        <div className="mt-6" role="tabpanel">
          <h2 className="mb-3 text-lg font-black">Choose a times table</h2>
          <div className="grid grid-cols-3 gap-3 min-[960px]:grid-cols-6">
            {Array.from({ length: 12 }, (_, index) => (index + 1) as TimesTable).map((item) => (
              <GameButton key={item} tone={tableTones[(item - 1) % tableTones.length] ?? "sun"} className="aspect-square w-full text-2xl" onClick={() => onStartMultiplication(item)} aria-label={`Play the ${item} times table`}>
                <span><span className="block text-xs font-black opacity-70">TABLE</span>{item}×</span>
              </GameButton>
            ))}
          </div>
        </div>
      ) : tab === "addition" ? (
        <div className="mt-6" role="tabpanel">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-black">Choose an addition level</h2>
            <div className="flex -space-x-2" aria-label="Addition helpers"><Character name="hamad" size="small" /><Character name="talal" size="small" /><Character name="yousef" size="small" /></div>
          </div>
           <div className="grid gap-3 min-[960px]:grid-cols-2">
            {levels.map((item) => (
              <GameButton key={item.id} tone={item.tone} className="grid min-h-20 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left" onClick={() => onStartAddition(item.id)}>
                <LevelIcon level={item.id} />
                <span className="min-w-0"><span className="block truncate text-lg font-black">{item.title}</span><span className="block text-sm font-bold opacity-75">{item.detail}</span></span>
                <ChevronRight className="h-6 w-6 shrink-0" />
              </GameButton>
            ))}
          </div>
        </div>
      ) : tab === "geo" ? (
        <div className="mt-6" role="tabpanel">
          <Suspense fallback={<p className="text-center font-bold">…</p>}><GeoHome progress={learning} onProgress={onProgress} onStart={onStartGeo} /></Suspense>
        </div>
      ) : tab === "arabic" ? (
        <div className="mt-6" role="tabpanel">
          <GameButton tone="berry" className="mb-4 flex min-h-32 w-full flex-col items-center justify-center gap-1 rounded-3xl p-5" onClick={() => onOpenArabicWorld("lw")}>
            <span className="text-4xl">🗺️ 📚 🔤</span>
            <span lang="ar" dir="rtl" className="font-arabic text-3xl font-black">عالم العربية</span>
            <span className="text-sm font-bold opacity-80">Letter worlds • Adventure map • My Grade 1 book</span>
          </GameButton>
          <ArabicWorldHub progress={learning} onOpen={onOpenArabicWorld} path={<ArabicMap progress={learning} onStart={onStartArabic} />} />
        </div>
      ) : tab === "more" ? (
        <div className="mt-6" role="tabpanel">
          <GameButton tone="mint" className="flex min-h-40 w-full flex-col items-center justify-center gap-2 rounded-3xl p-6" onClick={onStartIe}>
            <span className="text-4xl">🕌 🏠 🌳 🛒 📜</span>
            <span className="text-2xl font-black">More to Explore</span>
            <span lang="ar" dir="rtl" className="font-arabic text-xl font-black">المزيد للاستكشاف</span>
            <span className="text-sm font-bold opacity-80">Mosque • Home • Garden • Market • Value stories</span>
          </GameButton>
        </div>
      ) : tab === "iq" ? (
        <div className="mt-6" role="tabpanel">
          <GameButton tone="berry" className="flex min-h-40 w-full flex-col items-center justify-center gap-2 rounded-3xl p-6" onClick={onStartIq}>
            <Sparkles className="h-10 w-10" />
            <span className="text-2xl font-black">🌙 Interactive Qur’an</span>
            <span lang="ar" dir="rtl" className="font-arabic text-xl font-black">القرآن التفاعلي</span>
            <span className="text-sm font-bold opacity-80">Explore • Listen • Sing • Discover · اكتشف • استمع • أنشد • تعلّم</span>
          </GameButton>
          <p className="mt-3 text-center text-xs font-bold text-muted-foreground">{learning.iq.stars.length} discoveries collected · A playful world — memorization practice stays in the Qur’an tab</p>
        </div>
      ) : (
        <QuranPicker learning={learning} onStartSurah={onStartSurah} onStartAyah={onStartAyah} onStartMemorize={onStartMemorize} />
      )}
    </section>
  );
}

function QuranPicker({ learning, onStartSurah, onStartAyah, onStartMemorize }: { learning: LearningProgress; onStartSurah: (s: SurahData) => void; onStartAyah: (s: SurahData) => void; onStartMemorize?: ((s: SurahData) => void) | undefined }) {
  const [juz, setJuz] = useState<1 | 3 | 15 | 22 | 27 | 28 | 29 | 30>(30);
  const list = juz === 30 ? surahs : juz === 29 ? juz29Surahs : juz === 28 ? juz28Surahs : juz === 27 ? juz27Surahs : juz === 22 ? juz22Surahs : juz === 15 ? juz15Surahs : juz === 3 ? juz3Surahs : juz1Surahs;
  const tabs = [
    { id: 30 as const, label: "Juz 30", ar: "جزء عمّ" },
    { id: 29 as const, label: "Juz 29", ar: "جزء تبارك" },
    { id: 28 as const, label: "Juz 28", ar: "المجادلة" },
    { id: 27 as const, label: "Juz 27", ar: "الجزء ٢٧" },
    { id: 22 as const, label: "Juz 22", ar: "يس" },
    { id: 15 as const, label: "Juz 15", ar: "الكهف" },
    { id: 3 as const, label: "Juz 3", ar: "آل عمران" },
    { id: 1 as const, label: "Juz 1–2", ar: "البقرة" },
  ];
  return (
    <div className="mt-6" role="tabpanel">
      <div className="mb-3 grid grid-cols-2 gap-2 min-[960px]:grid-cols-7" role="tablist" aria-label="Choose a Juz">
        {tabs.map((t) => (
          <GameButton key={t.id} tone={juz === t.id ? "berry" : "neutral"} className="min-h-14" onClick={() => setJuz(t.id)} role="tab" aria-selected={juz === t.id}>
            <span className="inline-flex items-center gap-2">{t.label} <span lang="ar" dir="rtl" className="font-arabic font-black">{t.ar}</span></span>
          </GameButton>
        ))}
      </div>
      <p className="mb-3 text-center text-sm font-bold text-muted-foreground">{list.length} {list.length === 1 ? "surah" : "surahs"} · Ahmad Al-Nufais — pick any surah</p>
      <div className="grid gap-3 min-[960px]:grid-cols-2">
        {list.map((surah) => {
          const done = surahProgress(learning, surah.id).completed.length;
          return (
            <div key={surah.id} className="rounded-3xl bg-card p-3 shadow-md">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-primary text-sm font-black">{surah.number}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-black">{surah.name.replace("Surah ", "")}</h2>
                  <p className="text-xs font-bold text-muted-foreground">{done}/{surah.verses.length} verses</p>
                </div>
                <p dir="rtl" lang="ar" className="font-quran shrink-0 text-xl">{surah.arabicName}</p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-success transition-all" style={{ width: `${(done / surah.verses.length) * 100}%` }} /></div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <GameButton tone="neutral" className="min-h-12" onClick={() => onStartSurah(surah)}>
                  <span className="inline-flex items-center gap-2"><Play className="h-5 w-5 fill-current" />Listen</span>
                </GameButton>
                <GameButton tone={surah.tone} className="min-h-12" onClick={() => onStartAyah(surah)}>
                  <span className="inline-flex items-center gap-2"><Sparkles className="h-5 w-5" />Finish the Ayah</span>
                </GameButton>
              </div>
              {(surah.id === "alalaq" || surah.id === "rahman" || surah.id === "bayyinah") && onStartMemorize && (
                <GameButton tone="sun" className="mt-2 min-h-12 w-full" onClick={() => onStartMemorize(surah)}>
                  <span className="inline-flex items-center gap-2"><Sparkles className="h-5 w-5" />Memorize with pictures</span>
                </GameButton>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SurahScreen({ surah, onExit }: { surah: SurahData; onExit: () => void }) {
  const [verse, setVerse] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playVerse = (index: number) => {
    const nextVerse = surah.verses[index];
    if (!nextVerse) return;
    setVerse(index);
    setProgress(0);
    setPlaying(true);
    requestAnimationFrame(() => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.load();
      void audio.play().catch(() => setPlaying(false));
    });
  };

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 min-[960px]:max-w-6xl min-[960px]:pb-6 min-[960px]:pt-6">
      <header className="flex items-center justify-between gap-3">
        <GameButton tone="neutral" className="grid h-12 w-12 place-items-center rounded-full p-0" onClick={onExit} aria-label="Back to activities"><ArrowLeft className="h-5 w-5" /></GameButton>
         <div className="text-center"><p className="text-xs font-black uppercase text-muted-foreground">Listen & follow</p><h1 className="text-2xl font-black">{surah.name}</h1></div>
        <div className="w-12" />
      </header>

      <div className="mt-5 flex items-end justify-center gap-3">
        <Character name="hamad" className={playing ? "animate-hamad-cheer" : "animate-hamad-float"} />
        <div className="mb-2 max-w-56 rounded-2xl rounded-bl-sm bg-card px-4 py-3 text-sm font-black shadow-sm">{playing ? "Follow each glowing word with me." : "Tap play when you’re ready."}</div>
      </div>

       <div className="mt-5 max-h-[52dvh] overflow-y-auto rounded-3xl bg-card p-3 shadow-md min-[960px]:max-h-[58dvh] min-[960px]:p-5" dir="rtl" lang="ar" aria-label={`${surah.name} Arabic text`}>
         {surah.verses.map((item, verseIndex) => {
          const isActive = verseIndex === verse;
          const words = item.arabic.split(" ");
           const currentTimeMs = (audioRef.current?.currentTime ?? 0) * 1000;
           const timedWord = item.wordTimings?.findIndex(([start, end]) => currentTimeMs >= (start ?? 0) && currentTimeMs <= (end ?? 0));
           const activeWord = timedWord !== undefined && timedWord >= 0 ? timedWord : Math.min(words.length - 1, Math.floor(progress * words.length));
          return (
            <div
              key={item.arabic}
              className={`rounded-2xl px-3 py-2 text-center text-[1.35rem] font-bold leading-[2] transition-all duration-300 sm:text-2xl ${isActive ? "bg-muted ring-2 ring-primary" : "text-muted-foreground"}`}
              aria-current={isActive ? "true" : undefined}
              onClick={() => playVerse(verseIndex)}
            >
              {words.map((word, wordIndex) => (
                <span key={`${word}-${wordIndex}`} className={`mx-0.5 inline-block rounded-md px-1 transition-all duration-200 ${isActive && playing && wordIndex === activeWord ? "scale-110 bg-primary text-primary-foreground" : isActive && wordIndex < activeWord && progress > 0 ? "text-success" : isActive ? "text-foreground" : ""}`}>{word}</span>
              ))}
              <span className={`mr-1 inline-grid h-7 w-7 place-items-center rounded-full border-2 text-sm ${isActive ? "border-primary text-foreground" : "border-border"}`}>{verseIndex + 1}</span>
            </div>
          );
        })}
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-[width] duration-150" style={{ width: `${progress * 100}%` }} /></div>
      </div>

      <audio
        ref={audioRef}
         src={surah.verses[verse]?.audio}
        preload="auto"
        onTimeUpdate={(event) => { const audio = event.currentTarget; setProgress(audio.duration ? audio.currentTime / audio.duration : 0); }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
         onEnded={() => { if (verse < surah.verses.length - 1) playVerse(verse + 1); else { setPlaying(false); setProgress(1); } }}
      />

      <div className="mt-5 flex items-center justify-center gap-3">
        <GameButton tone="neutral" className="grid h-14 w-14 place-items-center rounded-full p-0" onClick={() => playVerse(Math.max(0, verse - 1))} disabled={verse === 0} aria-label="Previous verse"><ArrowLeft className="h-6 w-6" /></GameButton>
        <GameButton tone="berry" className="grid h-20 w-20 place-items-center rounded-full p-0" onClick={togglePlayback} aria-label={playing ? "Pause recitation" : "Play recitation"}>{playing ? <Pause className="h-8 w-8 fill-current" /> : <Play className="ml-1 h-8 w-8 fill-current" />}</GameButton>
         <GameButton tone="neutral" className="grid h-14 w-14 place-items-center rounded-full p-0" onClick={() => playVerse(Math.min(surah.verses.length - 1, verse + 1))} disabled={verse === surah.verses.length - 1} aria-label="Next verse"><ChevronRight className="h-6 w-6" /></GameButton>
      </div>

       <div className="mt-5 grid grid-cols-10 gap-1.5" aria-label="Choose a verse">
         {surah.verses.map((item, index) => <GameButton key={item.arabic} tone={index === verse ? "sun" : "neutral"} className="aspect-square min-h-0 w-full p-0 text-sm" onClick={() => playVerse(index)} aria-label={`Play verse ${index + 1}`}>{index + 1}</GameButton>)}
      </div>
       <p className="mt-4 text-center text-xs font-bold text-muted-foreground">Recitation by {surah.reciter}</p>
    </section>
  );
}

function GameScreen({ mode, level, table, question, problem, choices, picked, feedback, sound, onAnswer, onExit }: { mode: GameMode; level: Level; table: TimesTable; question: number; problem: Problem; choices: number[]; picked: number | null; feedback: "right" | "wrong" | null; sound: boolean; onAnswer: (choice: number) => void; onExit: () => void }) {
  const progress = (question / QUESTIONS) * 100;
  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 min-[960px]:max-w-5xl min-[960px]:pb-6 min-[960px]:pt-6">
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 pr-14">
        <GameButton tone="neutral" className="grid h-11 w-11 place-items-center rounded-full p-0" onClick={onExit} aria-label="Leave game"><ArrowLeft className="h-5 w-5" /></GameButton>
        <div className="min-w-0">
          <div className="flex items-center justify-between text-xs font-black"><span>Question {question} of {QUESTIONS}</span><span>{mode === "multiplication" ? `${table}× table` : `Level ${level}`}</span></div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-success transition-[width] duration-300" style={{ width: `${progress}%` }} /></div>
        </div>
        <div className="flex items-center gap-1 font-black"><Star className="h-5 w-5 fill-primary text-primary" />{question - 1}</div>
      </header>
      {mode === "multiplication" && <NumberblocksSong table={table} />}
      <div className="flex min-h-0 flex-1 flex-col min-[960px]:grid min-[960px]:grid-cols-[minmax(0,1.35fr)_minmax(18rem,.65fr)] min-[960px]:items-center min-[960px]:gap-6">
        {mode === "multiplication" ? (
          <MultiplicationQuestion problem={problem} feedback={feedback} sound={sound} />
        ) : (
          <AdditionQuestion level={level} question={question} problem={problem} feedback={feedback} />
        )}
        <AnswerChoices choices={choices} picked={picked} feedback={feedback} onAnswer={onAnswer} />
      </div>
    </section>
  );
}

function NumberblocksSong({ table }: { table: TimesTable }) {
  const song = numberblocksSongs[table];
  if (!song) return null;

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border-2 border-foreground/10 bg-card shadow-sm" aria-label={`Numberblocks ${song.title} song`}>
      <div className="flex items-center gap-2 px-3 py-2 text-xs font-black">
        <Music2 className="h-4 w-4 text-success" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">Numberblocks · {song.title}</span>
        <span className="text-muted-foreground">Spotify</span>
      </div>
      <iframe
        key={song.trackId}
        title={`Play Numberblocks ${song.title} on Spotify`}
        src={`https://open.spotify.com/embed/track/${song.trackId}?utm_source=generator&theme=0&autoplay=1`}
        width="100%"
        height="80"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="eager"
        className="block border-0"
      />
    </div>
  );
}

function MultiplicationQuestion({ problem, feedback, sound }: { problem: Problem; feedback: "right" | "wrong" | null; sound: boolean }) {
  const [revealedGroups, setRevealedGroups] = useState(0);
  const [hintStep, setHintStep] = useState(0);
  const [pep, setPep] = useState(0);
  const pepTalk = ["Let’s build equal groups!", "You’ve got this!", "Count the jumps with me!", "Math power activated!"];

  useEffect(() => {
    setRevealedGroups(0);
    setHintStep(0);
    setPep(0);
  }, [problem.first, problem.second]);

  const coachText = feedback === "right" ? "Yes! That’s multiplication magic!" : feedback === "wrong" ? "Almost! Count the groups once more." : revealedGroups > 0 ? `${revealedGroups} group${revealedGroups === 1 ? "" : "s"} = ${revealedGroups * problem.first}` : pepTalk[pep];

  const tapHamad = () => {
    setPep((current) => (current + 1) % pepTalk.length);
    playTone("tap", sound);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mt-4 flex items-center gap-3">
        <GameButton tone="neutral" className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl p-0 ${feedback === "right" ? "animate-hamad-cheer" : ""}`} onClick={tapHamad} aria-label="Tap Hamad for encouragement">
          <img src={characterImages.hamad} alt="Hamad" draggable={false} className="h-full w-full object-cover" />
          <Sparkles className="absolute right-1 top-1 h-5 w-5 fill-primary text-primary" />
        </GameButton>
        <p className="min-h-16 flex-1 rounded-2xl rounded-bl-sm bg-card px-4 py-3 text-sm font-black shadow-sm">{coachText}</p>
      </div>
      <div className="my-auto py-3">
        {hintStep > 0 ? (
          <MultiplicationHint problem={problem} step={hintStep} onStep={setHintStep} />
        ) : (
          <>
            <div className="text-center"><p className="text-5xl font-black tabular-nums">{problem.first} × {problem.second} = ?</p><p className="mt-1 text-sm font-bold text-muted-foreground">{problem.second} equal groups of {problem.first}</p></div>
            <EqualGroups problem={problem} revealedGroups={revealedGroups} onReveal={(count) => { setRevealedGroups(count); playTone("tap", sound); }} />
            {!feedback && <GameButton tone="sky" className="mx-auto mt-3 min-h-11 px-5" onClick={() => setHintStep(1)} aria-label="Show a step-by-step multiplication hint"><span className="inline-flex items-center gap-2"><Lightbulb className="h-5 w-5" />Show me</span></GameButton>}
          </>
        )}
      </div>
    </div>
  );
}

function EqualGroups({ problem, revealedGroups, onReveal }: { problem: Problem; revealedGroups: number; onReveal: (count: number) => void }) {
  return (
    <div className="mt-4 grid max-h-64 grid-cols-3 gap-2 overflow-y-auto rounded-2xl bg-card p-3 shadow-md" aria-label={`${problem.second} groups of ${problem.first}`}>
      {Array.from({ length: problem.second }, (_, groupIndex) => {
        const groupNumber = groupIndex + 1;
        const revealed = groupNumber <= revealedGroups;
        return (
          <GameButton key={groupNumber} tone={revealed ? "mint" : "neutral"} className="min-h-20 p-2 shadow-none" onClick={() => onReveal(groupNumber)} aria-label={`Count group ${groupNumber}, total ${groupNumber * problem.first}`}>
            <span className="grid grid-cols-4 place-items-center gap-1">
              {Array.from({ length: problem.first }, (_, dot) => <span key={dot} className="h-2.5 w-2.5 rounded-full bg-current opacity-70" />)}
            </span>
            <span className="mt-1 block text-xs font-black tabular-nums">{revealed ? groupNumber * problem.first : `group ${groupNumber}`}</span>
          </GameButton>
        );
      })}
    </div>
  );
}

function MultiplicationHint({ problem, step, onStep }: { problem: Problem; step: number; onStep: (step: number) => void }) {
  const lastStep = 4;
  const repeated = Array.from({ length: problem.second }, () => problem.first).join(" + ");
  return (
    <div className="w-full rounded-3xl bg-card p-4 shadow-md" role="region" aria-label={`Multiplication hint, step ${step} of ${lastStep}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-secondary-foreground"><Lightbulb className="h-5 w-5" /></span><div><p className="font-black">Build it with Hamad</p><p className="text-xs font-bold text-muted-foreground">Step {step} of {lastStep}</p></div></div>
        <GameButton tone="neutral" className="grid h-10 w-10 place-items-center rounded-full p-0" onClick={() => onStep(0)} aria-label="Close hint"><X className="h-4 w-4" /></GameButton>
      </div>
      {step === 1 && (
        <div className="animate-pop-in mt-4 text-center"><p className="font-black">Make {problem.second} equal groups</p><div className="mt-3 flex flex-wrap justify-center gap-2">{Array.from({ length: problem.second }, (_, group) => <div key={group} className="grid h-14 w-14 grid-cols-4 place-items-center rounded-xl bg-secondary/40 p-2">{Array.from({ length: problem.first }, (_, dot) => <CircleDot key={dot} className="h-3 w-3 text-secondary-foreground" />)}</div>)}</div></div>
      )}
      {step === 2 && (
        <div className="animate-pop-in mt-4 text-center"><p className="font-black">Add the same number each time</p><p className="mt-4 break-words text-2xl font-black tabular-nums text-accent">{repeated}</p></div>
      )}
      {step === 3 && (
        <div className="animate-pop-in mt-4"><p className="text-center font-black">Jump by {problem.first}</p><div className="mt-5 flex overflow-x-auto pb-3"><div className="flex min-w-max items-end px-2">{Array.from({ length: problem.second + 1 }, (_, index) => <div key={index} className="flex items-center"><div className="text-center"><div className={`mx-auto h-4 w-4 rounded-full ${index === problem.second ? "bg-success" : "bg-primary"}`} /><span className="mt-1 block min-w-8 text-xs font-black tabular-nums">{index * problem.first}</span></div>{index < problem.second && <div className="mb-5 h-1 w-5 bg-border" />}</div>)}</div></div></div>
      )}
      {step === 4 && (
        <div className="animate-pop-in mt-5 text-center"><Star className="mx-auto h-12 w-12 fill-primary text-primary" /><p className="mt-2 text-5xl font-black tabular-nums">{problem.answer}</p><p className="mt-1 text-lg font-black">{problem.first} × {problem.second} = {problem.answer}</p></div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <GameButton tone="neutral" className="min-h-11 px-3" onClick={() => onStep(step === 1 ? 0 : step - 1)}>{step === 1 ? "Close" : "Back"}</GameButton>
        {step < lastStep ? <GameButton tone="mint" className="min-h-11 px-3" onClick={() => onStep(step + 1)}><span className="inline-flex items-center gap-1">Next <ChevronRight className="h-5 w-5" /></span></GameButton> : <GameButton tone="mint" className="min-h-11 px-3" onClick={() => onStep(0)}>I got it!</GameButton>}
      </div>
    </div>
  );
}

function AdditionQuestion({ level, question, problem, feedback }: { level: Level; question: number; problem: Problem; feedback: "right" | "wrong" | null }) {
  const character = question <= 4 ? "hamad" : question <= 7 ? "talal" : "yousef";
  const [hintStep, setHintStep] = useState(0);
  useEffect(() => setHintStep(0), [problem.first, problem.second]);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mt-5 flex items-center gap-3"><Character name={character} size="small" /><p className="rounded-2xl rounded-bl-sm bg-card px-4 py-3 text-sm font-black shadow-sm">{feedback === "right" ? "Brilliant! You got it!" : feedback === "wrong" ? "So close — try again!" : "What is the answer?"}</p></div>
      <div className="my-auto flex flex-col items-center py-4">
        {level >= 4 && hintStep > 0 ? <AdditionHint problem={problem} step={hintStep} onStep={setHintStep} /> : level <= 3 ? <div className="w-full rounded-3xl bg-card p-4 text-center shadow-md"><ObjectRow count={problem.first} level={level} /><div className="my-1 text-3xl font-black text-muted-foreground">+</div><ObjectRow count={problem.second} level={level} /></div> : <div className="grid min-h-52 w-full place-items-center rounded-3xl bg-card shadow-md"><p className="text-6xl font-black tabular-nums">{problem.first} + {problem.second}</p></div>}
        {hintStep === 0 && <p className="mt-4 text-4xl font-black tabular-nums">{problem.first} + {problem.second} = ?</p>}
        {level >= 4 && hintStep === 0 && !feedback && <GameButton tone="sky" className="mt-4 min-h-12 px-5" onClick={() => setHintStep(1)} aria-label="Show a step-by-step addition hint"><span className="inline-flex items-center gap-2"><Lightbulb className="h-5 w-5" />Hint</span></GameButton>}
      </div>
    </div>
  );
}

function AnswerChoices({ choices, picked, feedback, onAnswer }: { choices: number[]; picked: number | null; feedback: "right" | "wrong" | null; onAnswer: (choice: number) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {choices.map((choice) => {
        const selected = picked === choice;
        const tone = selected && feedback === "right" ? "mint" : selected && feedback === "wrong" ? "berry" : "neutral";
        return <GameButton key={choice} tone={tone} disabled={feedback === "right"} onClick={() => onAnswer(choice)} className="min-h-16 text-3xl tabular-nums" aria-label={`Answer ${choice}`}>{selected && feedback === "right" ? <span className="inline-flex items-center gap-2"><Check className="h-7 w-7" />{choice}</span> : choice}</GameButton>;
      })}
    </div>
  );
}

function AdditionHint({ problem, step, onStep }: { problem: Problem; step: number; onStep: (step: number) => void }) {
  const firstTens = Math.floor(problem.first / 10);
  const secondTens = Math.floor(problem.second / 10);
  const firstOnes = problem.first % 10;
  const secondOnes = problem.second % 10;
  const onesTotal = firstOnes + secondOnes;
  const carriedTen = Math.floor(onesTotal / 10);
  const answerOnes = onesTotal % 10;
  const answerTens = firstTens + secondTens + carriedTen;
  const lastStep = 4;
  return (
    <div className="w-full rounded-3xl bg-card p-4 shadow-md" role="region" aria-label={`Addition hint, step ${step} of ${lastStep}`}>
      <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-secondary-foreground"><Lightbulb className="h-5 w-5" /></span><div><p className="font-black">Let’s build the answer</p><p className="text-xs font-bold text-muted-foreground">Step {step} of {lastStep}</p></div></div><GameButton tone="neutral" className="grid h-10 w-10 place-items-center rounded-full p-0" onClick={() => onStep(0)} aria-label="Close hint"><X className="h-4 w-4" /></GameButton></div>
      {step === 1 && <div className="animate-pop-in mt-4"><p className="text-center text-base font-black">Split each number into tens and ones</p><div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center"><PlaceValue number={problem.first} /><span className="text-2xl font-black">+</span><PlaceValue number={problem.second} /></div></div>}
      {step === 2 && <div className="animate-pop-in mt-4 text-center"><p className="text-base font-black">Add the ones first</p><p className="mt-3 text-4xl font-black tabular-nums"><span className="text-accent">{firstOnes}</span> + <span className="text-accent">{secondOnes}</span> = {onesTotal}</p>{carriedTen > 0 && <p className="mx-auto mt-3 max-w-xs rounded-2xl bg-primary px-3 py-2 text-sm font-black text-primary-foreground">{onesTotal} ones make 1 new ten and {answerOnes} ones.</p>}</div>}
      {step === 3 && <div className="animate-pop-in mt-4 text-center"><p className="text-base font-black">{carriedTen ? "Carry the new ten" : "Now add the tens"}</p><p className="mt-3 text-4xl font-black tabular-nums">{firstTens} + {secondTens}{carriedTen ? " + 1" : ""} = {answerTens}</p><p className="mt-2 text-sm font-bold text-muted-foreground">That gives us {answerTens} tens.</p></div>}
      {step === 4 && <div className="animate-pop-in mt-4 text-center"><p className="text-base font-black">Put the tens and ones together</p><p className="mt-2 text-5xl font-black tabular-nums"><span className="text-secondary-foreground">{answerTens}</span><span className="text-accent">{answerOnes}</span></p><p className="mt-1 text-lg font-black tabular-nums">{problem.first} + {problem.second} = {problem.answer}</p></div>}
      <div className="mt-4 grid grid-cols-2 gap-3"><GameButton tone="neutral" className="min-h-11 px-3" onClick={() => onStep(step === 1 ? 0 : step - 1)}>{step === 1 ? "Close" : "Back"}</GameButton>{step < lastStep ? <GameButton tone="mint" className="min-h-11 px-3" onClick={() => onStep(step + 1)}><span className="inline-flex items-center gap-1">Next <ChevronRight className="h-5 w-5" /></span></GameButton> : <GameButton tone="mint" className="min-h-11 px-3" onClick={() => onStep(0)}>I got it!</GameButton>}</div>
    </div>
  );
}

function PlaceValue({ number }: { number: number }) {
  return <div className="overflow-hidden rounded-2xl border-2 border-foreground/10"><p className="bg-muted py-1 text-2xl font-black tabular-nums">{number}</p><div className="grid grid-cols-2 text-xs font-black"><div className="bg-secondary/40 px-1 py-2"><span className="block text-xl tabular-nums">{Math.floor(number / 10)}</span>tens</div><div className="bg-accent/20 px-1 py-2"><span className="block text-xl tabular-nums">{number % 10}</span>ones</div></div></div>;
}

function LevelIcon({ level }: { level: Level }) {
  const className = "h-8 w-8 shrink-0";
  if (level === 1) return <Apple className={className} aria-hidden="true" />;
  if (level === 2) return <Star className={className} aria-hidden="true" />;
  if (level === 3) return <Moon className={className} aria-hidden="true" />;
  if (level === 4) return <Rocket className={className} aria-hidden="true" />;
  return <Sparkles className={className} aria-hidden="true" />;
}

function ObjectRow({ count, level }: { count: number; level: Level }) {
  return <div className="flex min-h-14 flex-wrap items-center justify-center gap-1.5" aria-label={`${count} objects`}>{Array.from({ length: count }, (_, index) => { const className = count > 12 ? "h-5 w-5" : "h-7 w-7"; if (level === 1) return <Apple key={index} className={`${className} fill-accent/30 text-accent`} aria-hidden="true" />; if (level === 2) return <Star key={index} className={`${className} fill-primary text-primary`} aria-hidden="true" />; return <span key={index} className={`${count > 12 ? "h-4 w-4" : "h-5 w-5"} rounded-md bg-secondary shadow-sm`} aria-hidden="true" />; })}</div>;
}

function RewardScreen({ mode, score, totalStars, onAgain, onHome }: { mode: GameMode; score: number; totalStars: number; onAgain: () => void; onHome: () => void }) {
  const stars = useMemo(() => Array.from({ length: score }), [score]);
  return (
    <section className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center overflow-hidden px-5 py-[max(2rem,env(safe-area-inset-bottom))] text-center min-[960px]:max-w-3xl">
      {Array.from({ length: 8 }, (_, index) => <Star key={index} className="animate-float-star absolute bottom-0 h-8 w-8 fill-primary text-primary" style={{ left: `${8 + index * 12}%`, animationDelay: `${index * 0.2}s` }} aria-hidden="true" />)}
      <div className="animate-pop-in relative z-10">
        {mode === "multiplication" ? <Character name="hamad" className="animate-hamad-cheer" /> : <div className="flex justify-center -space-x-3"><Character name="hamad" /><Character name="talal" /><Character name="yousef" /></div>}
        <h1 className="mt-6 text-5xl font-black">Wonderful!</h1><p className="mt-2 text-lg font-bold text-muted-foreground">You finished all {QUESTIONS} questions.</p>
        <div className="my-6 flex min-h-16 flex-wrap justify-center gap-1">{stars.length ? stars.map((_, index) => <Star key={index} className="h-9 w-9 fill-primary text-primary" />) : <p className="font-bold">Practice makes progress!</p>}</div>
        <p className="text-2xl font-black">{score} stars this round</p><p className="mt-1 text-sm font-bold text-muted-foreground">{totalStars} stars collected in all</p>
        <div className="mt-8 grid gap-3"><GameButton tone="mint" className="min-h-16 px-8 text-xl" onClick={onAgain}><span className="inline-flex items-center gap-2"><RotateCcw className="h-5 w-5" />Play again</span></GameButton><GameButton tone="neutral" className="min-h-14 px-8" onClick={onHome}>Choose another game</GameButton></div>
      </div>
    </section>
  );
}

function ParentScreen({ sound, stats, learning, onToggleSound, onReset, onClose }: { sound: boolean; stats: Stats; learning: LearningProgress; onToggleSound: () => void; onReset: () => void; onClose: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const accuracy = stats.games ? Math.round((stats.correct / (stats.games * QUESTIONS)) * 100) : 0;
  return (
    <section className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 min-[960px]:max-w-6xl min-[960px]:pb-8 min-[960px]:pt-8">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4"><div className="min-w-0"><p className="text-sm font-black uppercase text-muted-foreground">Grown-ups only</p><h1 className="truncate text-3xl font-black">Parent settings</h1></div><GameButton tone="neutral" className="grid h-12 w-12 shrink-0 place-items-center rounded-full p-0" onClick={onClose} aria-label="Close settings"><X className="h-5 w-5" /></GameButton></header>
      <div className="mt-7 grid gap-4 min-[960px]:grid-cols-2 min-[960px]:items-start">
        <div className="rounded-2xl bg-card p-5 shadow-sm"><div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4"><div className="min-w-0"><h2 className="font-black">Sound effects</h2><p className="text-sm font-bold text-muted-foreground">Answer feedback during play</p></div><GameButton tone={sound ? "mint" : "neutral"} className="grid h-12 w-14 shrink-0 place-items-center p-0" onClick={onToggleSound} aria-label={sound ? "Turn sound off" : "Turn sound on"}>{sound ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}</GameButton></div></div>
        <div><h2 className="mb-3 text-lg font-black">Progress</h2><div className="grid grid-cols-2 gap-3"><Stat label="Games played" value={stats.games} /><Stat label="Correct answers" value={stats.correct} /><Stat label="Stars earned" value={stats.stars} /><Stat label="Accuracy" value={`${accuracy}%`} /></div></div>
        <div className="min-[960px]:col-span-2"><h2 className="mb-3 text-lg font-black">Qur’an</h2><div className="grid grid-cols-2 gap-3 min-[960px]:grid-cols-4">{allSurahs.map((s) => { const sp = surahProgress(learning, s.id); return <Stat key={s.id} label={`${s.name.replace("Surah ", "")} · ${sp.levels.length}/4 levels`} value={`${sp.completed.length}/${s.verses.length}`} />; })}<Stat label="Surahs started" value={allSurahs.filter((s) => surahProgress(learning, s.id).completed.length > 0).length} /><Stat label="Memorization" value={`${Math.round((allSurahs.reduce((a, s) => a + surahProgress(learning, s.id).completed.length, 0) / allSurahs.reduce((a, s) => a + s.verses.length, 0)) * 100)}%`} /></div></div>
        <div><h2 className="mb-3 text-lg font-black">Arabic</h2><div className="grid grid-cols-2 gap-3"><Stat label="Arabic level" value={`${Math.max(1, ...units.filter((u) => learning.arabic.lessons.includes(`${u.id}-1`)).map((u) => u.level))} / 12`} /><Stat label="Lessons completed" value={`${learning.arabic.lessons.length} / ${allLessons.length}`} /><Stat label="Arabic ++ words explored" value={`${learning.arabic.learned.filter((k) => k.startsWith("aw:w:")).length}`} /><Stat label="Arabic ++ verbs / sentences" value={`${learning.arabic.learned.filter((k) => k.startsWith("aw:v:")).length} / ${learning.arabic.learned.filter((k) => k.startsWith("aw:s:")).length}`} /><Stat label="Arabic ++ stars" value={`${learning.arabic.learned.filter((k) => k.startsWith("aw:star")).length}`} />{units.map((u) => <Stat key={u.id} label={`${u.en} learned`} value={`${learning.arabic.learned.filter((k) => k.startsWith(`${u.id}:`)).length} / ${u.items.length}`} />)}</div><p className="mt-2 text-xs font-bold text-muted-foreground">To review, tap any finished lesson on the Arabic map, or use the review button. Voices are AI-made and can be replaced with real recordings.</p><p dir="rtl" lang="ar" className="mt-2 font-arabic text-sm text-muted-foreground">{units.flatMap((u) => u.items.filter((i) => learning.arabic.learned.includes(`${u.id}:${i.id}`)).map((i) => `${i.ar} (${i.en})`)).join(" · ")}</p></div>
<div><h2 className="mb-3 text-lg font-black">Interactive Qur’an</h2><div className="grid grid-cols-2 gap-3"><Stat label="Words discovered" value={learning.iq.stars.length} /><Stat label="Language" value={learning.iq.lang === "ar" ? "العربية" : "English"} /></div><p className="mt-2 text-xs font-bold text-muted-foreground">Voices are AI-made and can be replaced with real recordings. Animal references are verified surah mentions only.</p></div>
        <div><h2 className="mb-3 text-lg font-black">Geography</h2><div className="grid grid-cols-2 gap-3"><Stat label="Lessons completed" value={learning.geo.lessons.length} /><Stat label="Things learned" value={learning.geo.learned.length} /></div><p className="mt-2 text-xs font-bold text-muted-foreground">Maps use real Natural Earth boundaries. Continent country counts are approximate and vary by convention. Voices are AI-made.</p></div>
        <div className="rounded-2xl bg-card p-5 shadow-sm"><h2 className="font-black">Reset progress</h2><p className="mt-1 text-sm font-bold text-muted-foreground">This removes all saved stars and scores on this device.</p>{!confirm ? <GameButton tone="danger" className="mt-4 min-h-13 w-full px-4" onClick={() => setConfirm(true)}>Clear progress</GameButton> : <div className="mt-4 grid grid-cols-2 gap-3"><GameButton tone="neutral" className="min-h-13" onClick={() => setConfirm(false)}>Cancel</GameButton><GameButton tone="danger" className="min-h-13" onClick={() => { onReset(); setConfirm(false); }}>Yes, clear</GameButton></div>}</div>
        <div className="rounded-2xl bg-secondary p-5 text-secondary-foreground"><h2 className="font-black">Safe independent play</h2><p className="mt-1 text-sm font-bold opacity-80">No ads or tracking. Progress stays on this device.</p></div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return <div className="rounded-2xl bg-card p-4 shadow-sm"><p className="text-sm font-bold text-muted-foreground">{label}</p><p className="mt-1 text-3xl font-black tabular-nums">{value}</p></div>;
}