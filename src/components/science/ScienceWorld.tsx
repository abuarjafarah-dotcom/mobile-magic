import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import observe from "@/assets/science/observe.png";
import experiment from "@/assets/science/experiment.png";
import sortImg from "@/assets/science/sort.png";
import predict from "@/assets/science/predict.png";
import balance from "@/assets/science/balance.png";
import build from "@/assets/science/build.png";
import push from "@/assets/science/push.png";
import pull from "@/assets/science/pull.png";
import magnet from "@/assets/science/magnet.png";
import materials from "@/assets/science/materials.png";
import woodFoil from "@/assets/science/wood-foil.png";
import water from "@/assets/science/water.png";
import rocks from "@/assets/science/rocks.png";
import sun from "@/assets/science/sun.png";
import moon from "@/assets/science/moon.png";
import day from "@/assets/science/day.png";
import night from "@/assets/science/night.png";
import seasons from "@/assets/science/seasons.png";
import nature from "@/assets/science/nature.png";
import discovery from "@/assets/science/discovery.png";
import hamadPointing from "@/assets/science/hamad-pointing.png";
import hamadThinking from "@/assets/science/hamad-thinking.png";
import hamadCelebrating from "@/assets/science/hamad-celebrating.png";
import hamadDiscovering from "@/assets/science/hamad-discovering.png";
import talalPointing from "@/assets/science/talal-pointing.png";
import talalThinking from "@/assets/science/talal-thinking.png";
import talalCelebrating from "@/assets/science/talal-celebrating.png";
import talalDiscovering from "@/assets/science/talal-discovering.png";

import yousefHappy from "@/assets/science/yousef-happy.png";
import yousefPointing from "@/assets/science/yousef-pointing.png";
import yousefSurprised from "@/assets/science/yousef-surprised.png";
import yousefCelebrating from "@/assets/science/yousef-celebrating.png";
import yousefLooking from "@/assets/science/yousef-looking.png";
import yousefMagnet from "@/assets/science/yousef-magnet.png";
import yousefWatching from "@/assets/science/yousef-watching.png";
import yousefWaving from "@/assets/science/yousef-waving.png";
import scienceMap from "@/assets/science/science-map.jpg.asset.json";
import { THINGS, byId, EARTH, WATER_ITEMS, SEASONS, scienceLessonTitle, type Thing, type WaterItem } from "@/data/scienceWorld";
import { feelName, materialName, scienceText, sourceName, thingName } from "@/data/scienceTranslations";
import { LearningLanguageSwitch, languageDirection, useLearningLanguage, type LearningLanguage } from "@/lib/learningLanguage";
import { speakArabic } from "@/lib/arabicVoice";

/* ---------------- shared helpers ---------------- */

const KEY = "science-world-v1";
type Save = { done: string[]; stars: number };
const load = (): Save => { try { return { done: [], stars: 0, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return { done: [], stars: 0 }; } };

function say(text: string, language: LearningLanguage = "ar") {
  try {
    if (language === "ar") { void speakArabic(text); return; }
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US"; u.rate = 0.9;
    window.speechSynthesis.speak(u);
  } catch { /* ignore */ }
}

const ScienceLanguageContext = createContext<LearningLanguage>("ar");
function useScienceLanguage() {
  const language = useContext(ScienceLanguageContext);
  return { language, t: (text: string) => scienceText(text, language), name: (item: { ar: string; en: string }) => thingName(item, language), speak: (text: string) => say(text, language) };
}

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

function Art({ src, className, alt = "" }: { src: string; className?: string; alt?: string }) {
  return <img src={src} alt={alt} draggable={false} loading="lazy" decoding="async" className={cn("pointer-events-none select-none object-contain drop-shadow-md", className)} />;
}

const OBJ_ART = import.meta.glob("@/assets/science/objects/*.png", { eager: true, import: "default" }) as Record<string, string>;
const objArt = (id?: string) => (id ? Object.entries(OBJ_ART).find(([k]) => k.endsWith(`/${id}.png`))?.[1] : undefined);

function Pic({ id, emoji, className }: { id?: string | undefined; emoji?: string | undefined; className: string }) {
  const src = objArt(id);
  return src ? <Art src={src} className={className} /> : <span className={cn("leading-none", className.includes("h-24") ? "text-8xl" : className.includes("h-16") ? "text-6xl" : className.includes("h-12") ? "text-4xl" : "text-3xl")}>{emoji}</span>;
}

function Guide({ pose, text }: { pose: string; text: string }) {
  const { language, speak } = useScienceLanguage();
  return (
    <div className="flex items-end gap-3" dir={languageDirection(language)}>
      <Art src={pose} className="h-24 w-auto shrink-0 sm:h-32" />
       <button onClick={() => speak(text)} className="mb-2 flex-1 rounded-3xl bg-card px-4 py-3 text-start text-lg font-bold text-foreground shadow-md">
        {text} <span aria-hidden>🔊</span>
      </button>
    </div>
  );
}

function Shell({ title, onBack, children }: { title: string; onBack: () => void; children: ReactNode }) {
  const { language, t } = useScienceLanguage();
  return (
    <main className="min-h-dvh bg-background px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="mx-auto max-w-4xl">
         <header className="mb-4 flex items-center justify-between gap-3 pr-14" dir={languageDirection(language)}>
          <h1 className="text-2xl font-black text-foreground sm:text-3xl">{title}</h1>
           <button onClick={onBack} className="rounded-full bg-card px-5 py-3 text-lg font-bold text-foreground shadow-md">{t("رُجوع ←")}</button>
        </header>
        {children}
      </div>
    </main>
  );
}

function Tile({ onClick, img, emoji, label, active, done, className }: { onClick?: () => void; img?: string | undefined; emoji?: string; label: string; active?: boolean; done?: boolean; className?: string }) {
  const { language } = useScienceLanguage();
  return (
    <button onClick={onClick} className={cn("relative flex flex-col items-center justify-center gap-2 rounded-3xl bg-card p-3 text-center font-bold text-foreground shadow-md transition active:scale-95", active && "ring-4 ring-primary", className)}>
      {done && <span className="absolute left-2 top-2 text-xl">⭐</span>}
      {img ? <Art src={img} className="h-16 w-16 sm:h-20 sm:w-20" /> : <span className="text-5xl leading-none">{emoji}</span>}
       <span className="text-base leading-tight sm:text-lg" dir={languageDirection(language)}>{label}</span>
    </button>
  );
}

function Burst({ show }: { show: boolean }) {
  if (!show) return null;
  return <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center gap-2"><Art src={hamadCelebrating} className="h-56 w-auto animate-bounce" /><Art src={yousefCelebrating} className="h-56 w-auto animate-bounce" /></div>;
}

/* ---------------- curriculum-based content ---------------- */


/* ---------------- drag-or-tap sorting engine ---------------- */

type Bin = { id: string; label: string; img?: string; emoji?: string };
function SortBoard({ items, bins, answer, onFinish, reveal }: { items: Thing[]; bins: Bin[]; answer: (t: Thing) => string; onFinish: () => void; reveal?: (t: Thing, bin: string) => string }) {
  const { language, t: translate, name, speak } = useScienceLanguage();
  const [left, setLeft] = useState(items);
  const [held, setHeld] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, string[]>>({});
  const [shake, setShake] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const binRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [note, setNote] = useState("");

  useEffect(() => { setLeft(items); setPlaced({}); }, [items]);

  function drop(id: string, bin: string) {
    const t = left.find((x) => x.id === id); if (!t) return;
    if (answer(t) === bin) {
      const next = left.filter((x) => x.id !== id);
      setLeft(next); setPlaced((p) => ({ ...p, [bin]: [...(p[bin] ?? []), id] })); setHeld(null);
       const n = reveal ? reveal(t, bin) : `${translate("أَحْسَنْتَ!")} ${name(t)}`; setNote(n); speak(n);
      if (!next.length) setTimeout(onFinish, 700);
    } else {
       setShake(id); setTimeout(() => setShake(null), 500); setNote(translate("لِنُجَرِّبْ مَرَّةً أُخْرى 🤔")); speak(translate("لِنُجَرِّبْ مَرَّةً أُخْرى"));
    }
  }
  function binAt(x: number, y: number) {
    return Object.entries(binRefs.current).find(([, el]) => { if (!el) return false; const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; })?.[0];
  }

  return (
     <div className="select-none" dir={languageDirection(language)}>
      <div className="mb-4 flex min-h-28 flex-wrap justify-center gap-3 rounded-3xl bg-muted p-3">
        {left.map((t) => (
          <button key={t.id}
             onClick={() => { setHeld(t.id); speak(name(t)); }}
            onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); setDrag({ id: t.id, x: e.clientX, y: e.clientY }); }}
            onPointerMove={(e) => drag?.id === t.id && setDrag({ id: t.id, x: e.clientX, y: e.clientY })}
            onPointerUp={(e) => { if (drag?.id === t.id) { const b = binAt(e.clientX, e.clientY); setDrag(null); if (b) drop(t.id, b); } }}
            style={{ touchAction: "none", opacity: drag?.id === t.id ? 0.3 : 1 }}
            className={cn("flex w-24 flex-col items-center rounded-2xl bg-card p-2 font-bold text-foreground shadow transition", held === t.id && "ring-4 ring-primary scale-105", shake === t.id && "animate-pulse ring-4 ring-destructive")}>
            <Pic id={t.id} emoji={t.emoji} className="h-12 w-12" />
             <span className="text-sm leading-tight">{name(t)}</span>
          </button>
        ))}
         {!left.length && <p className="self-center text-xl font-bold text-foreground">{translate("🎉 رائِع!")}</p>}
      </div>
      {drag && <div className="pointer-events-none fixed z-40 -translate-x-1/2 -translate-y-1/2 text-6xl" style={{ left: drag.x, top: drag.y }}><Pic id={drag.id} emoji={byId(drag.id)?.emoji ?? items.find((i) => i.id === drag.id)?.emoji} className="h-16 w-16" /></div>}
       <p className="mb-3 min-h-7 text-center text-lg font-bold text-foreground">{note || translate(held ? "الْمِسْ سَلَّةً لِتَضَعَهُ فيها" : "اسْحَبِ الشَّيْءَ أَوِ الْمِسْهُ ثُمَّ الْمِسِ السَّلَّةَ")}</p>
      <div className={cn("grid gap-3", bins.length > 2 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2")}>
        {bins.map((b) => (
          <div key={b.id} ref={(el) => { binRefs.current[b.id] = el; }} onClick={() => held && drop(held, b.id)}
            className={cn("min-h-40 cursor-pointer rounded-3xl border-4 border-dashed border-primary/50 bg-card p-3 text-center shadow-inner", held && "border-primary")}>
            {b.img ? <Art src={b.img} className="mx-auto h-14 w-14" /> : <div className="text-4xl">{b.emoji}</div>}
            <p className="text-lg font-black text-foreground">{b.label}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-1 text-3xl">{(placed[b.id] ?? []).map((id) => <Pic key={id} id={id} emoji={items.find((i) => i.id === id)?.emoji} className="h-9 w-9" />)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- WORLD 1: المادة في حياتنا ---------------- */

function MaterialDetective({ onDone }: { onDone: () => void }) {
  const { language, t, name, speak } = useScienceLanguage();
  const pool = useMemo(() => shuffle(THINGS).slice(0, 8), []);
  const [picked, setPicked] = useState<Thing | null>(null);
  const [seen, setSeen] = useState<string[]>([]);
  const [tool, setTool] = useState<"look" | "touch" | "source" | null>(null);
  const [quiz, setQuiz] = useState<Thing | null>(null);
  const [fb, setFb] = useState("");

  function examine(t: Thing) { setPicked(t); setTool(null); speak(name(t)); if (!seen.includes(t.id)) setSeen((s) => [...s, t.id]); }
  function useTool(k: "look" | "touch" | "source") {
    if (!picked) return; setTool(k);
    const txt = language === "ar" ? (k === "look" ? `مَصْنوعٌ مِنَ الْ${picked.material}` : k === "touch" ? `مَلْمَسُهُ ${picked.feel}` : `مادَّةٌ ${picked.source}`) : (k === "look" ? `Made of ${materialName(picked, language)}` : k === "touch" ? `It feels ${feelName(picked.feel, language)}` : `A ${sourceName(picked.source, language)} material`);
    speak(txt);
  }
  if (quiz) {
    return (
       <div className="space-y-4" dir={languageDirection(language)}>
         <Guide pose={yousefSurprised} text={t("هَلْ تَتَذَكَّرُ؟ ما مَلْمَسُ هذا الشَّيْءِ؟")} />
        <div className="flex justify-center"><Pic id={quiz.id} emoji={quiz.emoji} className="h-24 w-24" /></div>
         <p className="text-center text-2xl font-black text-foreground">{name(quiz)}</p>
        <div className="grid grid-cols-2 gap-3">
          {(["ناعم", "خشن"] as const).map((f) => (
             <Tile key={f} emoji={f === "ناعم" ? "🪶" : "🪨"} label={feelName(f, language)} onClick={() => {
               if (f === quiz.feel) { setFb(language === "ar" ? "أَحْسَنْتَ! 🌟" : "Well done! 🌟"); speak(t("أَحْسَنْتَ!")); setTimeout(onDone, 800); } else { setFb(t("الْمِسْهُ مَرَّةً أُخْرى بِأَداةِ اللَّمْسِ ✋")); setQuiz(null); setPicked(quiz); }
            }} />
          ))}
        </div>
        <p className="text-center text-lg font-bold text-foreground">{fb}</p>
      </div>
    );
  }
  return (
     <div className="space-y-4" dir={languageDirection(language)}>
       <Guide pose={hamadPointing} text={t(picked ? "اسْتَخْدِمْ أَدَواتِ الْمُحَقِّقِ لِتَفْحَصَهُ" : "الْمِسْ شَيْئًا لِتَفْحَصَهُ")} />
      <div className="grid grid-cols-4 gap-2">
        {pool.map((t) => <button key={t.id} onClick={() => examine(t)} className={cn("rounded-2xl bg-card p-2 text-4xl shadow", picked?.id === t.id && "ring-4 ring-primary", seen.includes(t.id) && "opacity-80")}><Pic id={t.id} emoji={t.emoji} className="mx-auto h-12 w-12" /></button>)}
      </div>
      {picked && (
        <section className="rounded-3xl bg-card p-4 shadow-lg">
          <div className="flex items-center justify-center gap-4">
            <span className={cn("inline-block transition", tool === "look" && "scale-125", tool === "touch" && "rotate-6")}><Pic id={picked.id} emoji={picked.emoji} className="h-24 w-24" /></span>
             <p className="text-2xl font-black text-foreground">{name(picked)}</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
             <Tile img={observe} label={t("أُلاحِظُ")} active={tool === "look"} onClick={() => useTool("look")} />
             <Tile emoji="✋" label={t("أَلْمِسُ")} active={tool === "touch"} onClick={() => useTool("touch")} />
             <Tile img={nature} label={t("مِنْ أَيْنَ؟")} active={tool === "source"} onClick={() => useTool("source")} />
          </div>
          {tool && <p className="mt-3 rounded-2xl bg-muted p-3 text-center text-xl font-bold text-foreground">
             {tool === "look" && <>{language === "ar" ? "مَصْنوعٌ مِنَ" : "Made of"}: {materialName(picked, language)}</>}
             {tool === "touch" && <>{language === "ar" ? "مَلْمَسُهُ" : "Feels"}: {feelName(picked.feel, language)}</>}
             {tool === "source" && <>{language === "ar" ? "مادَّةٌ" : "Material"} {sourceName(picked.source, language)} {picked.source === "طبيعية" ? "🌳" : "🏭"}</>}
          </p>}
        </section>
      )}
       {seen.length >= 3 && <button onClick={() => { const id = shuffle(seen)[0]; if (id) setQuiz(byId(id)); }} className="w-full rounded-full bg-primary py-4 text-xl font-black text-primary-foreground shadow-lg">{t("🔍 تَحَدّي الْمُحَقِّقِ")}</button>}
    </div>
  );
}

function SortingLab({ onDone }: { onDone: () => void }) {
  const { language, t } = useScienceLanguage();
  const [stage, setStage] = useState(0);
  const stages = useMemo(() => [
     { q: t("طَبيعِيَّةٌ أَمْ مَصْنوعَةٌ؟"), items: shuffle(THINGS).slice(0, 4), bins: [{ id: "طبيعية", label: t("مَوادُّ طَبيعِيَّةٌ"), img: nature }, { id: "مصنوعة", label: t("مَوادُّ مَصْنوعَةٌ"), img: build }], answer: (t: Thing) => t.source },
     { q: t("ناعِمٌ أَمْ خَشِنٌ؟"), items: shuffle(THINGS).slice(0, 6), bins: [{ id: "ناعم", label: t("ناعِمٌ"), emoji: "🪶" }, { id: "خشن", label: t("خَشِنٌ"), emoji: "🪨" }], answer: (t: Thing) => t.feel },
    { q: t("صَنِّفْ بِحَسَبِ نَوْعِ الْمادَّةِ"), items: shuffle(THINGS.filter((t) => ["خَشَب", "بِلاسْتيك", "حَديد"].includes(t.material))).slice(0, 7),
       bins: [{ id: "خَشَب", label: t("خَشَبٌ"), emoji: "🪵" }, { id: "بِلاسْتيك", label: t("بِلاسْتيكٌ"), emoji: "🧴" }, { id: "حَديد", label: t("حَديدٌ"), emoji: "⚙️" }], answer: (t: Thing) => t.material },
  ], [language]);
  const s = stages[stage]!;
  return (
    <div className="space-y-3">
       <Guide pose={talalPointing} text={language === "ar" ? `الْمُسْتَوى ${stage + 1}: ${s.q}` : `Level ${stage + 1}: ${s.q}`} />
      <SortBoard key={stage} items={s.items} bins={s.bins} answer={s.answer} onFinish={() => stage < stages.length - 1 ? setStage(stage + 1) : onDone()} />
    </div>
  );
}

function DesignLab({ onDone }: { onDone: () => void }) {
  const { language, t, speak } = useScienceLanguage();
  // Lesson 3-5: Farah's umbrella has a hole — which material fixes it?
  const options = ["paper", "blanket", "bowl", "sponge"].map(byId);
  const [chosen, setChosen] = useState<Thing | null>(null);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<null | boolean>(null);
  function test() {
    if (!chosen) return; setTesting(true); setResult(null);
    setTimeout(() => { const ok = !!chosen.waterproof; setResult(ok); setTesting(false); speak(ok ? (language === "ar" ? "رائِعٌ! بَقِيَتْ فَرَحُ جافَّةً" : "Great! Farah stayed dry.") : (language === "ar" ? "أَوْه! تَسَرَّبَ الْماءُ. جَرِّبْ مادَّةً أُخْرى" : "Oh! The water leaked through. Try another material.")); if (ok) setTimeout(onDone, 1400); }, 1800);
  }
  return (
    <div className="space-y-4" dir={languageDirection(language)}>
      <Guide pose={hamadThinking} text={t("مِظَلَّةُ فَرَحَ مَثْقوبَةٌ! أَتَوَقَّعُ: أَيُّ الْمَوادِّ أَفْضَلُ لِإِصْلاحِها؟")} />
      <section className="relative h-64 overflow-hidden rounded-3xl bg-muted shadow-inner">
        {(testing || result !== null) && Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="absolute text-2xl" style={{ left: `${(i * 53) % 95}%`, top: `${(i * 29) % 30}%`, animation: `sci-rain 0.9s ${i * 0.08}s linear infinite` }}>💧</span>
        ))}
        <div className="absolute left-1/2 top-12 -translate-x-1/2 text-center">
          <div className="relative text-[7rem] leading-none">☂️
            <span className="absolute left-1/2 top-6 -translate-x-1/2 text-4xl">{chosen ? chosen.emoji : "🕳️"}</span>
          </div>
          <div className="text-5xl">{result === false ? "😣" : result ? "😄" : "🧒"}</div>
        </div>
        {result === false && <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-4xl">💦💦</span>}
      </section>
      <div className="grid grid-cols-4 gap-2">
        {options.map((o) => <Tile key={o.id} img={objArt(o.id)} emoji={o.emoji} label={materialName(o, language)} active={chosen?.id === o.id} onClick={() => { setChosen(o); setResult(null); speak(materialName(o, language)); }} />)}
      </div>
      <button disabled={!chosen || testing} onClick={test} className="w-full rounded-full bg-primary py-4 text-xl font-black text-primary-foreground shadow-lg disabled:opacity-50">{t("🌧️ أَخْتَبِرُ الْحَلَّ")}</button>
      {result === false && <p className="text-center text-lg font-bold text-foreground">{t("هذِهِ الْمادَّةُ تَمْتَصُّ الْماءَ. جَرِّبْ مَرَّةً أُخْرى!")}</p>}
      {result && <p className="text-center text-xl font-black text-foreground">{t("🌟 الْبِلاسْتيكُ لا يَسْمَحُ لِلْماءِ بِالْمُرورِ!")}</p>}
    </div>
  );
}

/* ---------------- WORLD 2: القوة والحركة ---------------- */

function MotionLab({ onDone }: { onDone: () => void }) {
  const { language, t, speak } = useScienceLanguage();
  const [mode, setMode] = useState<"push" | "pull">("push");
  const [force, setForce] = useState(2);
  const [prediction, setPrediction] = useState<"near" | "far" | null>(null);
  const [pos, setPos] = useState(0);
  const [ran, setRan] = useState(0);
  const target = force * 18;
  function go() {
    setPos(0); requestAnimationFrame(() => setTimeout(() => setPos(target), 30));
    const far = force >= 3; const ok = prediction === (far ? "far" : "near");
    speak(language === "ar" ? `${mode === "push" ? "دَفَعْتَ" : "سَحَبْتَ"} الْعَرَبَةَ. ${ok ? "تَوَقُّعُكَ صَحيحٌ!" : "لاحِظْ ماذا حَدَثَ"}` : `You ${mode === "push" ? "pushed" : "pulled"} the cart. ${ok ? "Your prediction was right!" : "Look what happened."}`);
    setRan((r) => r + 1); if (ran >= 2) setTimeout(onDone, 1800);
  }
  return (
    <div className="space-y-4" dir={languageDirection(language)}>
      <Guide pose={yousefWatching} text={t("ماذا سَيَحْدُثُ لِلْعَرَبَةِ إِذا غَيَّرْنا الْقُوَّةَ؟")} />
      <div className="grid grid-cols-2 gap-3">
        <Tile img={push} label={t("دَفْعٌ")} active={mode === "push"} onClick={() => { setMode("push"); speak(t("دَفْعٌ")); }} />
        <Tile img={pull} label={t("سَحْبٌ")} active={mode === "pull"} onClick={() => { setMode("pull"); speak(t("سَحْبٌ")); }} />
      </div>
      <section className="relative h-40 overflow-hidden rounded-3xl bg-muted shadow-inner">
        <div className="absolute bottom-6 left-0 right-0 h-2 bg-foreground/20" />
        <div className="absolute bottom-7 transition-all duration-[1500ms] ease-out" style={{ right: `${4 + pos}%` }}>
          <div className="flex items-end">{mode === "pull" && <span className="text-5xl">🧒</span>}<span className="text-6xl">🛒</span>{mode === "push" && <span className="text-5xl">🧒</span>}</div>
        </div>
      </section>
      <label className="block rounded-3xl bg-card p-4 shadow">
        <span className="text-lg font-bold text-foreground">{t("الْقُوَّةُ")}: {"💪".repeat(force)}</span>
        <input type="range" min={1} max={5} value={force} onChange={(e) => { setForce(+e.target.value); setPrediction(null); setPos(0); }} className="mt-2 w-full accent-primary" />
      </label>
      <p className="text-center text-lg font-bold text-foreground">{t("أَتَوَقَّعُ: كَمْ سَتَتَحَرَّكُ الْعَرَبَةُ؟")}</p>
      <div className="grid grid-cols-2 gap-3">
        <Tile emoji="🐢" label={t("مَسافَةٌ قَصيرَةٌ")} active={prediction === "near"} onClick={() => setPrediction("near")} />
        <Tile emoji="🚀" label={t("مَسافَةٌ بَعيدَةٌ")} active={prediction === "far"} onClick={() => setPrediction("far")} />
      </div>
      <button disabled={!prediction} onClick={go} className="w-full rounded-full bg-primary py-4 text-xl font-black text-primary-foreground shadow-lg disabled:opacity-50">{t("▶️ أُجَرِّبُ")}</button>
      {pos > 0 && <p className="text-center text-lg font-bold text-foreground">{t("كُلَّما زادَتِ الْقُوَّةُ، تَحَرَّكَتِ الْعَرَبَةُ أَبْعَدَ وَأَسْرَعَ.")}</p>}
    </div>
  );
}

function MagnetLab({ onDone }: { onDone: () => void }) {
  const { language, t: tr, name, speak } = useScienceLanguage();
  const pool = useMemo(() => shuffle(THINGS.filter((t) => ["حَديد", "أَلَمْنيوم", "خَشَب", "بِلاسْتيك", "وَرَق", "ريش", "مَطّاط"].includes(t.material))).slice(0, 6), []);
  const [i, setI] = useState(0);
  const [guess, setGuess] = useState<boolean | null>(null);
  const [tested, setTested] = useState(false);
  const [results, setResults] = useState<Thing[]>([]);
  const t = pool[i];
  if (!t) {
    return (
      <div className="space-y-4" dir={languageDirection(language)}>
        <Guide pose={hamadCelebrating} text={tr("الْآنَ صَنِّفْ ما اكْتَشَفْتَهُ!")} />
        <SortBoard items={results} bins={[{ id: "yes", label: tr("يَجْذِبُها الْمِغْناطيسُ"), img: magnet }, { id: "no", label: tr("لا يَجْذِبُها الْمِغْناطيسُ"), emoji: "🚫" }]} answer={(x) => (x.magnetic ? "yes" : "no")} onFinish={onDone} />
      </div>
    );
  }
  return (
    <div className="space-y-4" dir={languageDirection(language)}>
      <Guide pose={tested ? yousefWatching : yousefMagnet} text={tr(tested ? (t.magnetic ? "انْجَذَبَ! إِنَّهُ مادَّةٌ مِغْناطيسِيَّةٌ" : "لَمْ يَنْجَذِبْ") : "هَلْ سَيَجْذِبُ الْمِغْناطيسُ هذا الشَّيْءَ؟")} />
      <section className="relative flex h-56 items-center justify-between overflow-hidden rounded-3xl bg-muted px-6 shadow-inner">
        <Art src={magnet} className={cn("h-28 w-28 transition-transform duration-700", tested && "-translate-x-2")} />
        <div className={cn("text-center transition-all duration-700", tested && t.magnetic ? "translate-x-[-9rem] sm:translate-x-[-18rem]" : tested ? "rotate-3" : "")}>
          <div className="flex justify-center"><Pic id={t.id} emoji={t.emoji} className="h-24 w-24" /></div>
          <p className="font-bold text-foreground">{name(t)}</p>
        </div>
      </section>
      {!tested ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Tile emoji="🧲" label={tr("نَعَمْ، سَيَجْذِبُهُ")} active={guess === true} onClick={() => setGuess(true)} />
            <Tile emoji="🚫" label={tr("لا، لَنْ يَجْذِبَهُ")} active={guess === false} onClick={() => setGuess(false)} />
          </div>
          <button disabled={guess === null} onClick={() => { setTested(true); speak(tr(t.magnetic ? "انْجَذَبَ" : "لَمْ يَنْجَذِبْ")); }} className="w-full rounded-full bg-primary py-4 text-xl font-black text-primary-foreground shadow-lg disabled:opacity-50">{tr("🧲 أَخْتَبِرُ")}</button>
        </>
      ) : (
        <>
          <p className="text-center text-xl font-bold text-foreground">{tr(guess === t.magnetic ? "🌟 تَوَقُّعُكَ صَحيحٌ!" : "🔎 اكْتَشَفْتَ شَيْئًا جَديدًا!")} ({materialName(t, language)})</p>
          <button onClick={() => { setResults((r) => [...r, t]); setI(i + 1); setGuess(null); setTested(false); }} className="w-full rounded-full bg-secondary py-4 text-xl font-black text-secondary-foreground shadow-lg">{tr("التّالي ←")}</button>
        </>
      )}
    </div>
  );
}

/* ---------------- WORLD 3: الأرض والشمس ---------------- */


const EARTH_IMG: Record<string, string> = { rocks, water, nature, sun };

function EarthExplorer({ onDone }: { onDone: () => void }) {
  const { language, speak } = useScienceLanguage();
  const [found, setFound] = useState<string[]>([]);
  const [open, setOpen] = useState<(typeof EARTH)[number] | null>(null);
  return (
    <div className="space-y-4" dir={languageDirection(language)}>
      <Guide pose={hamadDiscovering} text={language === "ar" ? `اكْتَشِفِ الْأَرْضَ! وَجَدْتَ ${found.length} مِنْ ${EARTH.length}` : `Explore Earth! You found ${found.length} of ${EARTH.length}`} />
      <section className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted shadow-inner">
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-secondary/40" />
        {EARTH.map((e) => (
          <button key={e.id} onClick={() => { setOpen(e); speak(`${language === "ar" ? e.ar : e.en}. ${language === "ar" ? e.fact : e.factEn}`); if (!found.includes(e.id)) { const n = [...found, e.id]; setFound(n); if (n.length === EARTH.length) setTimeout(onDone, 1500); } }}
            className={cn("absolute flex h-20 w-20 items-center justify-center rounded-full transition hover:scale-110", !found.includes(e.id) && "animate-pulse")} style={{ left: `${e.x}%`, top: `${e.y}%` }}>
            {e.img ? <Art src={EARTH_IMG[e.img]!} className="h-16 w-16" /> : <span className="text-5xl">{e.emoji}</span>}
            {found.includes(e.id) && <span className="absolute -top-1 left-0 text-lg">⭐</span>}
          </button>
        ))}
      </section>
      {open && <p className="rounded-3xl bg-card p-4 text-center text-xl font-bold text-foreground shadow"><b>{language === "ar" ? open.ar : open.en}:</b> {language === "ar" ? open.fact : open.factEn}</p>}
    </div>
  );
}


function WaterWorld({ onDone }: { onDone: () => void }) {
  const { language, t } = useScienceLanguage();
  const [level, setLevel] = useState(0);
  return (
    <div className="space-y-4" dir={languageDirection(language)}>
      <Guide pose={yousefPointing} text={t("أَيْنَ نَجِدُ الْماءَ؟ وَكَيْفَ نَسْتَخْدِمُهُ؟")} />
      <section className="relative mx-auto h-44 w-32 overflow-hidden rounded-b-3xl border-4 border-foreground/30 bg-card">
        <div className="absolute inset-x-0 bottom-0 bg-primary/60 transition-all duration-700" style={{ height: `${level}%` }} />
        <Art src={water} className="absolute inset-x-0 top-2 mx-auto h-12 w-12" />
      </section>
      <SortBoard items={WATER_ITEMS as unknown as Thing[]} bins={[{ id: "where", label: t("أَيْنَ نَجِدُهُ؟"), img: water }, { id: "use", label: t("كَيْفَ نَسْتَخْدِمُهُ؟"), emoji: "🚰" }]}
        answer={(item) => (item as unknown as WaterItem).kind} reveal={(item) => { setLevel((l) => Math.min(100, l + 17)); const w = item as unknown as WaterItem; return `${t("أَحْسَنْتَ!")} ${language === "ar" ? w.ar : w.en}`; }} onFinish={onDone} />
    </div>
  );
}

function DayNight({ onDone }: { onDone: () => void }) {
  const { language, t: tr, speak } = useScienceLanguage();
  const [t, setT] = useState(20);
  const isDay = t < 50;
  const last = useRef(isDay);
  const [flips, setFlips] = useState(0);
  useEffect(() => { if (last.current !== isDay) { last.current = isDay; speak(language === "ar" ? (isDay ? "النَّهارُ. الشَّمْسُ تُضيءُ السَّماءَ" : "اللَّيْلُ. نَرى الْقَمَرَ وَالنُّجومَ") : (isDay ? "Daytime. The Sun lights the sky." : "Nighttime. We see the Moon and stars.")); setFlips((f) => { if (f + 1 === 3) setTimeout(onDone, 1500); return f + 1; }); } }, [isDay, language, onDone]);
  const arc = (p: number) => ({ left: `${p}%`, top: `${60 - Math.sin((p / 100) * Math.PI) * 50}%` });
  return (
    <div className="space-y-4" dir={languageDirection(language)}>
      <Guide pose={isDay ? hamadPointing : talalThinking} text={tr("حَرِّكِ الشَّمْسَ عَبْرَ السَّماءِ وَشاهِدْ ما يَحْدُثُ")} />
      <section className={cn("relative aspect-[16/10] overflow-hidden rounded-3xl shadow-inner transition-colors duration-700", isDay ? "bg-primary/25" : "bg-foreground")}>
        {!isDay && Array.from({ length: 16 }).map((_, i) => <span key={i} className="absolute animate-pulse text-sm" style={{ left: `${(i * 37) % 95}%`, top: `${(i * 23) % 50}%` }}>✨</span>)}
        <div className="absolute h-20 w-20 -translate-x-1/2" style={arc(isDay ? t * 2 : (t - 50) * 2)}><Art src={isDay ? sun : moon} className="h-20 w-20" /></div>
        <div className="absolute inset-x-0 bottom-0 flex h-1/4 items-end justify-around bg-secondary/60 pb-2 text-4xl">
          <span>🏠</span><span>{isDay ? "🧒" : "😴"}</span><span>🌳</span>
        </div>
      </section>
      <input type="range" min={0} max={99} value={t} onChange={(e) => setT(+e.target.value)} className="w-full accent-primary" aria-label={tr("الْوَقْتُ")} />
      <div className="grid grid-cols-2 gap-3">
        <Tile img={day} label={tr("النَّهارُ")} active={isDay} onClick={() => setT(25)} />
        <Tile img={night} label={tr("اللَّيْلُ")} active={!isDay} onClick={() => setT(75)} />
      </div>
      <p className="text-center text-lg font-bold text-foreground">{tr(isDay ? "☀️ في النَّهارِ نَرى الشَّمْسَ، وَالسَّماءُ مُضيئَةٌ." : "🌙 في اللَّيْلِ نَرى الْقَمَرَ وَالنُّجومَ، وَالسَّماءُ مُظْلِمَةٌ.")}</p>
    </div>
  );
}


function FourSeasons({ onDone }: { onDone: () => void }) {
  const { language, t, speak } = useScienceLanguage();
  const [s, setS] = useState(0);
  const [visited, setVisited] = useState<number[]>([0]);
  const cur = SEASONS[s]!;
  const items = useMemo(() => shuffle(SEASONS.flatMap((x) => x.items.map((e, k) => ({ id: `${x.id}-${k}`, emoji: e, ar: x.ar, en: x.en, season: x.id })))).slice(0, 8), []);
  const [sorting, setSorting] = useState(false);
  if (sorting) {
    return (
      <div className="space-y-4" dir={languageDirection(language)}>
        <Guide pose={talalPointing} text={t("ضَعْ كُلَّ شَيْءٍ في فَصْلِهِ")} />
        <SortBoard items={items as unknown as Thing[]} bins={SEASONS.map((x) => ({ id: x.id, label: language === "ar" ? x.ar : x.en, emoji: x.sky }))} answer={(item) => (item as unknown as { season: string }).season} reveal={(item) => `${t("أَحْسَنْتَ!")} ${language === "ar" ? item.ar : (item as unknown as { en: string }).en}`} onFinish={onDone} />
      </div>
    );
  }
  return (
    <div className="space-y-4" dir={languageDirection(language)}>
      <Guide pose={yousefLooking} text={t("الْمِسِ الشَّجَرَةَ لِتَتَغَيَّرَ الْفُصولُ")} />
      <button onClick={() => { const n = (s + 1) % 4; setS(n); speak(language === "ar" ? SEASONS[n]!.ar : SEASONS[n]!.en); setVisited((v) => (v.includes(n) ? v : [...v, n])); }} className="relative block aspect-[16/10] w-full overflow-hidden rounded-3xl bg-muted shadow-inner">
        <span className="absolute right-6 top-4 text-6xl">{cur.sky}</span>
        <Art src={seasons} className={cn("absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 transition-transform duration-700", s % 2 && "rotate-12")} />
        <span className="absolute inset-x-0 bottom-3 text-center text-5xl tracking-widest">{cur.scene}</span>
      </button>
      <p className="text-center text-3xl font-black text-foreground">{language === "ar" ? cur.ar : cur.en}</p>
      <div className="grid grid-cols-4 gap-2">{SEASONS.map((x, k) => <Tile key={x.id} emoji={x.sky} label={language === "ar" ? x.ar : x.en} active={k === s} done={visited.includes(k)} onClick={() => { setS(k); speak(language === "ar" ? x.ar : x.en); setVisited((v) => (v.includes(k) ? v : [...v, k])); }} />)}</div>
      {visited.length === 4 && <button onClick={() => setSorting(true)} className="w-full rounded-full bg-primary py-4 text-xl font-black text-primary-foreground shadow-lg">{t("🧺 لُعْبَةُ الْفُصولِ")}</button>}
    </div>
  );
}

/* ---------------- world map ---------------- */

type Act = { id: string; ar: string; en: string; img: string; lesson?: string; C: (p: { onDone: () => void }) => ReactNode };
const WORLDS: { id: string; ar: string; en: string; img: string; pose: string; acts: Act[] }[] = [
  { id: "matter", ar: "الْمادَّةُ في حَياتِنا", en: "Matter in our lives", img: materials, pose: hamadPointing, acts: [
    { id: "detective", lesson: "sci-3-3", ar: "الْمُحَقِّقُ في الْمَوادِّ", en: "Material detective", img: observe, C: MaterialDetective },
    { id: "sorting", lesson: "sci-3-4", ar: "مُخْتَبَرُ التَّصْنيفِ", en: "Sorting lab", img: sortImg, C: SortingLab },
    { id: "design", lesson: "sci-3-5", ar: "مُخْتَبَرُ التَّصْميمِ", en: "Design lab", img: build, C: DesignLab },
  ] },
  { id: "force", ar: "الْقُوَّةُ وَالْحَرَكَةُ", en: "Force and motion", img: push, pose: talalPointing, acts: [
    { id: "motion", lesson: "sci-4-3", ar: "مُخْتَبَرُ الْحَرَكَةِ", en: "Motion lab", img: pull, C: MotionLab },
    { id: "magnet", lesson: "sci-4-4", ar: "مُخْتَبَرُ الْمِغْناطيسِ", en: "Magnet lab", img: magnet, C: MagnetLab },
  ] },
  { id: "earth", ar: "الْأَرْضُ وَالشَّمْسُ", en: "Earth and Sun", img: sun, pose: yousefWaving, acts: [
    { id: "earthx", lesson: "sci-5-1", ar: "مُسْتَكْشِفُ الْأَرْضِ", en: "Earth explorer", img: rocks, C: EarthExplorer },
    { id: "water", lesson: "sci-5-2", ar: "عالَمُ الْماءِ", en: "Water world", img: water, C: WaterWorld },
    { id: "daynight", lesson: "sci-5-3", ar: "اللَّيْلُ وَالنَّهارُ", en: "Day and night", img: day, C: DayNight },
    { id: "seasons", lesson: "sci-5-4", ar: "الْفُصولُ الْأَرْبَعَةُ", en: "The four seasons", img: seasons, C: FourSeasons },
  ] },
];
const ALL_ACTS = WORLDS.flatMap((w) => w.acts);

export function ScienceWorld({ onExit }: { onExit: () => void }) {
  const [language, setLanguage] = useLearningLanguage();
  const [save, setSave] = useState<Save>({ done: [], stars: 0 });
  const [world, setWorld] = useState<string | null>(null);
  const [act, setAct] = useState<string | null>(null);
  const [challenge, setChallenge] = useState(false);
  const [party, setParty] = useState(false);
  useEffect(() => setSave(load()), []);

  function finish(id: string) {
    const next = { done: save.done.includes(id) ? save.done : [...save.done, id], stars: save.stars + 1 };
    setSave(next); try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
    setParty(true); say(language === "ar" ? "أَحْسَنْتَ يا عالِمُ!" : "Well done, scientist!", language); setTimeout(() => setParty(false), 1600);
    if (challenge) setTimeout(() => setAct(shuffle(ALL_ACTS.filter((a) => a.id !== id))[0]!.id), 1700);
    else setTimeout(() => setAct(null), 1700);
  }

  const style = <style>{`@keyframes sci-rain{from{transform:translateY(0)}to{transform:translateY(260px)}}`}</style>;

  if (act) {
    const a = ALL_ACTS.find((x) => x.id === act)!;
    const C = a.C;
    return <ScienceLanguageContext.Provider value={language}><Shell title={`${challenge ? (language === "ar" ? "🔬 تَحَدٍّ: " : "🔬 Challenge: ") : ""}${language === "ar" ? a.ar : a.en}`} onBack={() => { setAct(null); setChallenge(false); }}>{style}<div className="mb-4"><LearningLanguageSwitch language={language} onChange={setLanguage} /></div><C key={a.id} onDone={() => finish(a.id)} /><Burst show={party} /></Shell></ScienceLanguageContext.Provider>;
  }
  if (world) {
    const w = WORLDS.find((x) => x.id === world)!;
    return (
      <ScienceLanguageContext.Provider value={language}><Shell title={language === "ar" ? w.ar : w.en} onBack={() => setWorld(null)}>
        <div className="mb-4"><LearningLanguageSwitch language={language} onChange={setLanguage} /></div>
        <Guide pose={w.pose} text={language === "ar" ? `مَرْحَبًا في ${w.ar}! اخْتَرْ تَجْرِبَةً` : `Welcome to ${w.en}! Choose an experiment.`} />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {w.acts.map((a) => <div key={a.id} className="flex flex-col gap-1"><Tile img={a.img} label={language === "ar" ? a.ar : a.en} done={save.done.includes(a.id)} onClick={() => setAct(a.id)} className="min-h-40" />{a.lesson && <p className="text-center text-sm font-bold text-muted-foreground" dir={languageDirection(language)}>📖 {scienceLessonTitle(a.lesson, language)}</p>}</div>)}
        </div>
      </Shell></ScienceLanguageContext.Provider>
    );
  }
  return (
    <ScienceLanguageContext.Provider value={language}><Shell title={scienceText("🔬 عالَمُ الْعُلومِ", language)} onBack={onExit}>
      <div className="mb-4"><LearningLanguageSwitch language={language} onChange={setLanguage} /></div>
      <section className="relative mb-5 overflow-hidden rounded-3xl bg-card shadow-lg" dir={languageDirection(language)}>
        <img src={scienceMap.url} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="relative flex items-end justify-between p-4">
          <Art src={hamadCelebrating} className="h-32 w-auto sm:h-44" />
          <Art src={yousefHappy} className="h-32 w-auto sm:h-44" />
          <div className="flex-1 px-2 text-center">
            <p className="rounded-2xl bg-card/85 px-2 py-1 text-2xl font-black text-foreground sm:text-3xl">{scienceText("مَرْحَبًا يا عالِمُ صَغيرُ!", language)}</p>
            <p className="mt-1 text-lg font-bold text-foreground">⭐ {save.stars} · 🧪 {save.done.length}/{ALL_ACTS.length}</p>
          </div>
          <Art src={talalCelebrating} className="h-32 w-auto sm:h-44" />
        </div>
      </section>
      <div className="relative grid gap-4 sm:grid-cols-3">
        {WORLDS.map((w, i) => (
          <button key={w.id} onClick={() => { setWorld(w.id); say(language === "ar" ? w.ar : w.en, language); }} className={cn("flex flex-col items-center gap-2 rounded-3xl p-5 shadow-lg transition active:scale-95", ["bg-primary/20", "bg-secondary/40", "bg-accent/40"][i])}>
            <Art src={w.img} className="h-28 w-28 animate-[bounce_3s_ease-in-out_infinite]" />
            <span className="text-2xl font-black text-foreground" dir={languageDirection(language)}>{language === "ar" ? w.ar : w.en}</span>
            <span className="text-sm font-bold text-muted-foreground">{w.acts.filter((a) => save.done.includes(a.id)).length}/{w.acts.length}</span>
          </button>
        ))}
      </div>
      <button onClick={() => { setChallenge(true); setAct(shuffle(ALL_ACTS)[0]!.id); }} className="mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-primary py-4 text-2xl font-black text-primary-foreground shadow-lg">
        <Art src={discovery} className="h-12 w-12" /> {scienceText("تَحَدِّياتُ الْعُلومِ", language)}
      </button>
      <div className="mt-4 flex justify-center gap-3 opacity-80"><Art src={experiment} className="h-12 w-12" /><Art src={predict} className="h-12 w-12" /><Art src={balance} className="h-12 w-12" /><Art src={woodFoil} className="h-12 w-12" /></div>
    </Shell></ScienceLanguageContext.Provider>
  );
}
