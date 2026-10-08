import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, ChevronRight, Globe2, Lock, RotateCcw, Star, Volume2 } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import { FamilyCharacter, GameShell, shuffle, useClip } from "@/components/learn/shared";
import { GuideAvatar } from "@/components/arabic/ArabicPath";
import { allGeo, allGeoLessons, continentByKey, geoById, geoPrompts, geoUnits, type ContinentKey, type GeoItem, type GeoLesson, type GeoPromptId, type GeoUnit } from "@/data/geography";
import { MAP_H, MAP_W, continentPaths, countryPaths, oceanPoints, spherePath } from "@/data/geoPaths";
import { geoImages } from "@/data/geoImages";
import { flagImages } from "@/data/flagImages";
import { geoAudio } from "@/data/geoAudio";
import { addUnique, type LearningProgress } from "@/lib/learningProgress";
import { cn } from "@/lib/utils";
import { speakArabic } from "@/lib/arabicVoice";

type Update = (change: (p: LearningProgress) => LearningProgress) => void;
type Lang = LearningProgress["geo"]["lang"];

// Soft, distinct fills per continent (map content colours, not UI theme).
const continentFill: Record<ContinentKey, string> = {
  Africa: "#f2b35e", Asia: "#e8876f", Europe: "#9fb7e8", "North America": "#8fcf8f", "South America": "#c9a2e0", Antarctica: "#f4f4f4", Oceania: "#f5d76e",
};
const CONTINENTS = Object.keys(continentFill) as ContinentKey[];
const labelPos: Record<ContinentKey, [number, number]> = {
  Africa: [530, 290], Asia: [720, 170], Europe: [520, 140], "North America": [230, 160], "South America": [320, 340], Antarctica: [500, 495], Oceania: [860, 360],
};

/* ---------------- audio + names ---------------- */

function useSay(lang: Lang) {
  const { play } = useClip();
  const clip = (key: string, l: "en" | "ar") => geoAudio[`${key}-${l}`] ?? "";
  const say = (key: string, arabicText: string) => {
    if (lang === "both") play(clip(key, "en"), { onEnd: () => { void speakArabic(arabicText); } });
    else if (lang === "ar") void speakArabic(arabicText);
    else play(clip(key, "en"));
  };
  return { sayItem: (i: GeoItem) => say(`geo-${i.id}`, i.ar), sayPrompt: (p: GeoPromptId) => say(`gp-${p}`, geoPrompts[p].ar), play };
}

function Name({ item, lang, className, big }: { item: GeoItem; lang: Lang; className?: string; big?: boolean }) {
  return (
    <span className={cn("grid justify-items-center leading-tight", className)}>
      {lang !== "ar" && <span dir="ltr" className={cn("font-black", big ? "text-3xl" : "text-lg")}>{item.en}</span>}
      {lang !== "en" && <span dir="rtl" lang="ar" className={cn("font-arabic font-bold", big ? "text-4xl" : "text-2xl")}>{item.ar}</span>}
    </span>
  );
}

function PromptText({ id, lang }: { id: GeoPromptId; lang: Lang }) {
  const p = geoPrompts[id];
  return (
    <span className="grid">
      {lang !== "ar" && <span dir="ltr" className="font-black">{p.en}</span>}
      {lang !== "en" && <span dir="rtl" lang="ar" className="font-arabic text-xl font-bold">{p.ar}</span>}
    </span>
  );
}

/* ---------------- visuals ---------------- */

function Picture({ item, className }: { item: GeoItem; className?: string }) {
  const box = cn("grid h-28 w-28 place-items-center overflow-hidden rounded-3xl bg-card shadow-md", className);
  if (item.type === "country") return <div className={box}><CountryShape id={item.id} className="h-4/5 w-4/5" /></div>;
  if (item.type === "continent") return <div className={cn(box, "bg-secondary")}><WorldMap highlight={item.continent} mini /></div>;
  const src = item.image ? geoImages[item.image] : undefined;
  return <div className={box}>{src ? <img src={src} alt="" draggable={false} loading="lazy" className="h-full w-full object-cover" /> : <Globe2 className="h-12 w-12" />}</div>;
}

export function CountryShape({ id, className, outline }: { id: string; className?: string; outline?: boolean }) {
  const c = countryPaths[id];
  if (!c) return null;
  return <svg viewBox="0 0 200 200" className={className} aria-hidden><path d={c.shape} fill={outline ? "none" : "var(--primary)"} stroke="color-mix(in oklab, var(--foreground) 50%, transparent)" strokeWidth={outline ? 3 : 1.5} strokeDasharray={outline ? "6 6" : undefined} strokeLinejoin="round" /></svg>;
}

function Flag({ id, className }: { id: string; className?: string }) {
  return <img src={flagImages[id]} alt="" draggable={false} className={cn("rounded-md border border-border object-cover shadow-sm", className)} />;
}

type Tap = { x: number; y: number; continent?: ContinentKey };
function WorldMap({ highlight, country, labels, lang = "both", onTap, marker, mini, dim, svgRef }: { highlight?: ContinentKey | ContinentKey[] | undefined; country?: string | undefined; labels?: boolean; lang?: Lang; onTap?: (t: Tap) => void; marker?: [number, number] | null; mini?: boolean; dim?: boolean; svgRef?: React.RefObject<SVGSVGElement | null> }) {
  const lit = highlight ? (Array.isArray(highlight) ? highlight : [highlight]) : [];
  const localRef = useRef<SVGSVGElement>(null);
  const ref = svgRef ?? localRef;
  const toSvg = (e: React.PointerEvent) => {
    const m = ref.current!.getScreenCTM()!.inverse();
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m);
    return { x: p.x, y: p.y };
  };
  return (
    <svg ref={ref} viewBox={`0 0 ${MAP_W} ${MAP_H}`} className={cn("w-full select-none", !mini && "rounded-3xl shadow-md")} role={onTap ? "application" : "img"} aria-label="World map"
      onPointerUp={onTap ? (e) => { const pt = toSvg(e); const c = (e.target as Element).getAttribute("data-continent") as ContinentKey | null; onTap({ ...pt, ...(c ? { continent: c } : {}) }); } : undefined}>
      <path d={spherePath} fill="#bfe3f5" />
      {CONTINENTS.map((k) => (
        <path key={k} d={continentPaths[k]} data-continent={k} fill={lit.length && !lit.includes(k) ? (dim ? "#e6e1d6" : continentFill[k]) : continentFill[k]}
          opacity={lit.length && !lit.includes(k) ? 0.45 : 1} stroke={lit.includes(k) ? "#7a4a12" : "#ffffff"} strokeWidth={lit.includes(k) ? 2.5 : 0.6} className={cn(onTap && "cursor-pointer")} />
      ))}
      {country && countryPaths[country] && <path d={countryPaths[country].world} fill="#d9342b" stroke="#7a1d18" strokeWidth={1.5} pointerEvents="none" />}
      {country && countryPaths[country] && <circle cx={countryPaths[country].cx} cy={countryPaths[country].cy} r={mini ? 40 : 24} fill="none" stroke="#d9342b" strokeWidth={mini ? 8 : 4} pointerEvents="none" />}
      {labels && CONTINENTS.map((k) => {
        const it = continentByKey(k);
        return <text key={k} x={labelPos[k][0]} y={labelPos[k][1]} textAnchor="middle" fontSize="22" fontWeight="800" fill="#3a2a14" stroke="#fff" strokeWidth="4" paintOrder="stroke" pointerEvents="none">{lang === "ar" ? it.ar : it.en.replace("Australia / ", "")}</text>;
      })}
      {marker && <g pointerEvents="none"><circle cx={marker[0]} cy={marker[1]} r="18" fill="var(--primary)" stroke="#fff" strokeWidth="4" /></g>}
    </svg>
  );
}

/* ---------------- home ---------------- */

// All lessons are open access — no sequential locking.
export const isGeoUnlocked = (_progress: LearningProgress, _id: string) => true;

export function LangToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  const opts: { id: Lang; label: ReactNode }[] = [{ id: "en", label: "English" }, { id: "ar", label: <span lang="ar" className="font-arabic text-base">العربية</span> }, { id: "both", label: <span>EN + <span lang="ar" className="font-arabic">ع</span></span> }];
  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Language">
      {opts.map((o) => <GameButton key={o.id} tone={lang === o.id ? "sky" : "neutral"} className="min-h-12 text-sm" onClick={() => onChange(o.id)} role="radio" aria-checked={lang === o.id}>{o.label}</GameButton>)}
    </div>
  );
}

export function GeoHome({ progress, onProgress, onStart }: { progress: LearningProgress; onProgress: Update; onStart: (l: GeoLesson) => void }) {
  const lang = progress.geo.lang;
  const { sayItem } = useSay(lang);
  const done = progress.geo.lessons;
  const current = allGeoLessons.find((l) => !done.includes(l.id));
  const [picked, setPicked] = useState<ContinentKey | null>(null);
  return (
    <div className="grid gap-4">
      <div className="text-center">
        <h2 className="text-2xl font-black">Explore the World</h2>
        <p dir="rtl" lang="ar" className="font-arabic text-2xl font-bold">اكتشف العالم</p>
      </div>
      <LangToggle lang={lang} onChange={(l) => onProgress((p) => ({ ...p, geo: { ...p.geo, lang: l } }))} />
      <div>
        <WorldMap labels highlight={picked ?? undefined} lang={lang} onTap={(t) => { if (t.continent) { setPicked(t.continent); sayItem(continentByKey(t.continent)); } }} />
        <p className="mt-1 text-center text-xs font-bold text-muted-foreground">Tap a continent to hear its name</p>
      </div>
      <ol className="grid gap-4 min-[960px]:grid-cols-2">
        {geoUnits.map((u) => {
          const lessons = allGeoLessons.filter((l) => l.unit === u.id);
          return (
            <li key={u.id} className="rounded-3xl bg-card/70 p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <GuideAvatar who={u.guide} />
                <div className="min-w-0 flex-1">
                  <p className="font-black leading-tight">{u.level}. {u.en}</p>
                  <p dir="rtl" lang="ar" className="font-arabic text-xl font-bold leading-tight">{u.ar}</p>
                </div>
                {lessons.every((l) => done.includes(l.id)) && <Check className="h-7 w-7 text-success" />}
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {lessons.map((l, i) => {
                  const fin = done.includes(l.id), open = isGeoUnlocked(progress, l.id), cur = current?.id === l.id;
                  return (
                    <GameButton key={l.id} tone={fin ? "mint" : cur ? u.tone : "neutral"} disabled={!open} onClick={() => onStart(l)} aria-label={`${u.en} ${l.review && !u.mixed ? "review" : `lesson ${i + 1}`}${fin ? " done" : open ? "" : " locked"}`}
                      className={cn("grid h-16 w-16 place-items-center rounded-full p-0", i % 2 === 1 && "translate-y-3", cur && "ring-4 ring-primary ring-offset-2 ring-offset-background")}>
                      {fin ? <Check className="h-7 w-7" /> : !open ? <Lock className="h-5 w-5 opacity-60" /> : l.review && !u.mixed ? <RotateCcw className="h-6 w-6" /> : <span className="text-xl font-black">{i + 1}</span>}
                    </GameButton>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------------- lesson engine ---------------- */

type Kind = "learn" | "pickVisual" | "pickWord" | "continentTap" | "count" | "oceanTap" | "animalMap" | "habitat" | "place" | "flagPick" | "countryFlag" | "shapePick" | "trace" | "whereContinent" | "translate" | "match";
type Ex = { kind: Kind; item: GeoItem; options: GeoItem[]; labels: boolean };

const kindsFor = (i: GeoItem, bilingual: boolean): Kind[] => {
  if (bilingual) return ["translate"];
  switch (i.type) {
    case "basic": return ["pickVisual", "pickWord"];
    case "continent": return ["continentTap", "count", "pickWord"];
    case "ocean": return ["oceanTap"];
    case "animal": return ["animalMap", "habitat", "pickWord"];
    case "habitat": case "climate": case "landform": return ["pickVisual", "pickWord", "match"];
    case "country": return ["place", "flagPick", "countryFlag", "shapePick", "whereContinent", ...(i.trace ? (["trace"] as Kind[]) : [])];
  }
};

function makeExercises(unit: GeoUnit, lesson: GeoLesson): Ex[] {
  const out: Ex[] = [];
  const labels = !lesson.review && lesson.index === 0;
  if (!lesson.review) lesson.items.forEach((item) => out.push({ kind: "learn", item, options: [], labels }));
  const count = lesson.review ? 10 : Math.max(6, lesson.items.length * 2);
  let targets: GeoItem[] = [];
  const used: Record<string, number> = {};
  for (let n = 0; n < count; n++) {
    if (!targets.length) targets = shuffle(lesson.items);
    const item = targets.pop()!;
    const kinds = kindsFor(item, !!unit.bilingual);
    const k = kinds[(used[item.id] = (used[item.id] ?? -1) + 1) % kinds.length]!;
    const same = allGeo.filter((g) => g.type === item.type && g.id !== item.id);
    const pool = lesson.items.filter((g) => g.type === item.type && g.id !== item.id);
    const others = shuffle(pool.length >= 2 ? pool : same).slice(0, k === "match" ? 2 : 2);
    out.push({ kind: k, item, options: shuffle([item, ...others]), labels });
  }
  return out;
}

export function GeoLessonScreen({ lesson, progress, onProgress, onExit }: { lesson: GeoLesson; progress: LearningProgress; onProgress: Update; onExit: () => void }) {
  const unit = geoUnits.find((u) => u.id === lesson.unit)!;
  const [seed, setSeed] = useState(0);
  const exercises = useMemo(() => makeExercises(unit, lesson), [unit, lesson, seed]);
  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone] = useState(false);
  const lang = progress.geo.lang;
  const { sayPrompt } = useSay(lang);

  const next = () => {
    if (index + 1 < exercises.length) { setIndex(index + 1); return; }
    onProgress((p) => ({ ...p, geo: { ...p.geo, lessons: addUnique(p.geo.lessons, lesson.id), learned: lesson.items.reduce((a, i) => addUnique(a, i.id), p.geo.learned) } }));
    sayPrompt("great");
    setDone(true);
  };

  if (done) {
    const stars = mistakes === 0 ? 3 : mistakes <= 3 ? 2 : 1;
    return (
      <GameShell title={unit.en} onExit={onExit}>
        <div className="mt-10 grid justify-items-center gap-5 text-center animate-pop-in">
          <div className="flex items-end gap-3"><GuideAvatar who={unit.guide} size="large" className="animate-hamad-cheer" /><FamilyCharacter name="yousef" size="small" /></div>
          <PromptText id="great" lang={lang} />
          <div className="flex gap-2">{[1, 2, 3].map((s) => <Star key={s} className={cn("h-12 w-12", s <= stars ? "fill-primary text-primary" : "text-muted")} />)}</div>
          <div className="grid w-full grid-cols-2 gap-3">
            <GameButton tone="neutral" className="min-h-16" onClick={onExit}>Map</GameButton>
            <GameButton tone="mint" className="min-h-16" onClick={() => { setSeed((s) => s + 1); setIndex(0); setMistakes(0); setDone(false); }} aria-label="Play again"><RotateCcw className="mx-auto h-6 w-6" /></GameButton>
          </div>
        </div>
      </GameShell>
    );
  }
  const ex = exercises[index]!;
  const props = { ex, unit, lang, onNext: next, onMiss: () => setMistakes((m) => m + 1) };
  const k = `${seed}-${index}`;
  return (
    <GameShell title={unit.en} current={index} total={exercises.length} onExit={onExit}>
      {ex.kind === "learn" ? <LearnEx key={k} {...props} /> :
        ex.kind === "place" ? <PlaceEx key={k} {...props} /> :
        ex.kind === "trace" ? <TraceEx key={k} {...props} /> :
        ex.kind === "match" ? <MatchEx key={k} {...props} /> :
        ["continentTap", "oceanTap", "animalMap", "whereContinent"].includes(ex.kind) ? <MapTapEx key={k} {...props} /> :
        <ChoiceEx key={k} {...props} />}
    </GameShell>
  );
}

type P = { ex: Ex; unit: GeoUnit; lang: Lang; onNext: () => void; onMiss: () => void };

function Guide({ unit, lang, id, solved, children }: { unit: GeoUnit; lang: Lang; id: GeoPromptId; solved?: boolean; children?: ReactNode }) {
  return (
    <div className="mt-4 flex items-center gap-3">
      <GuideAvatar who={unit.guide} className={solved ? "animate-hamad-cheer" : "animate-hamad-float"} />
      <div className="rounded-2xl rounded-bl-sm bg-card px-4 py-2 shadow-sm"><PromptText id={solved ? "great" : id} lang={lang} />{children}</div>
    </div>
  );
}
const NextBtn = ({ onClick }: { onClick: () => void }) => <GameButton tone="mint" className="mt-auto min-h-16 animate-pop-in" onClick={onClick} aria-label="Next"><ChevronRight className="mx-auto h-8 w-8" /></GameButton>;
const ringHint = "ring-4 ring-success ring-offset-2 ring-offset-background";

function Chip({ children }: { children: ReactNode }) { return <span className="rounded-full bg-muted px-3 py-1 text-sm font-bold">{children}</span>; }
function Bi({ en, ar, lang }: { en: string; ar: string; lang: Lang }) {
  return <>{lang !== "ar" && <span dir="ltr">{en}</span>}{lang === "both" && " · "}{lang !== "en" && <span dir="rtl" lang="ar" className="font-arabic">{ar}</span>}</>;
}

function LearnEx({ ex, unit, lang, onNext }: P) {
  const { sayItem } = useSay(lang);
  const it = ex.item;
  useEffect(() => { sayItem(it); }, [it.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const animalsOf = (ids?: string[]) => (ids ?? []).map((id) => geoById(id)).filter(Boolean) as GeoItem[];
  return (
    <div className="flex flex-1 flex-col gap-4">
      <Guide unit={unit} lang={lang} id="tap" />
      <GameButton tone="neutral" className="grid place-items-center gap-3 p-4" onClick={() => sayItem(it)} aria-label="Hear it">
        {it.type === "continent" ? <WorldMap highlight={it.continent} dim /> :
          it.type === "ocean" ? <WorldMap marker={oceanPoints[it.id] ?? null} /> :
          it.type === "country" ? (
            <div className="grid w-full gap-3">
              <div className="flex items-center justify-center gap-4"><Flag id={it.id} className="h-16 w-24" /><CountryShape id={it.id} className="h-24 w-24" /></div>
              <WorldMap highlight={it.continent} country={it.id} />
            </div>
          ) : <Picture item={it} className="h-44 w-44" />}
        <Name item={it} lang={lang} big />
        <Volume2 className="h-6 w-6 text-muted-foreground" />
      </GameButton>
      <div className="flex flex-wrap justify-center gap-2 text-center">
        {it.countries && <Chip><Bi en={`About ${it.countries.count} countries`} ar={it.countries.count ? `حوالي ${it.countries.count} دولة` : "لا توجد دول"} lang={lang} /></Chip>}
        {it.capital && <Chip><Bi en={`Capital: ${it.capital.en}`} ar={`العاصمة: ${it.capital.ar}`} lang={lang} /></Chip>}
        {it.type === "country" && it.continent && <Chip><Bi en={continentByKey(it.continent).en} ar={continentByKey(it.continent).ar} lang={lang} /></Chip>}
        {it.neighbors !== undefined && <Chip><Bi en={`${it.neighbors} neighbors`} ar={`${it.neighbors} دول مجاورة`} lang={lang} /></Chip>}
        {it.climate?.map((c) => { const g = geoById(c); return g ? <Chip key={c}><Bi en={g.en} ar={g.ar} lang={lang} /></Chip> : null; })}
        {it.landforms?.map((l) => <Chip key={l.en}><Bi en={l.en} ar={l.ar} lang={lang} /></Chip>)}
        {it.continents && it.type === "animal" && it.continents.length < 7 && it.continents.map((c) => <Chip key={c}><Bi en={continentByKey(c).en} ar={continentByKey(c).ar} lang={lang} /></Chip>)}
        {it.fact && <p className="w-full text-sm font-bold text-muted-foreground"><Bi en={it.fact.en} ar={it.fact.ar} lang={lang} /></p>}
        {it.countries?.note && <p className="w-full text-xs text-muted-foreground">{it.countries.note}</p>}
      </div>
      {animalsOf(it.animals).length > 0 && <div className="flex justify-center gap-2">{animalsOf(it.animals).map((a) => <Picture key={a.id} item={a} className="h-16 w-16 rounded-2xl" />)}</div>}
      {it.type === "animal" && <WorldMap highlight={it.continents} dim />}
      <NextBtn onClick={onNext} />
    </div>
  );
}

function ChoiceEx({ ex, unit, lang, onNext, onMiss }: P) {
  const { sayItem, sayPrompt } = useSay(lang);
  const it = ex.item;
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<string[]>([]);
  const k = ex.kind;
  const countOpts = useMemo(() => {
    const n = it.countries?.count ?? 0;
    return shuffle([...new Set([n, ...shuffle([0, 12, 14, 23, 44, 49, 54].filter((x) => x !== n)).slice(0, 2)])]);
  }, [it]);
  const habitatOpts = useMemo(() => {
    const right = geoById(it.habitat?.[0] ?? "")!;
    const others = shuffle(allGeo.filter((g) => g.type === "habitat" && !(it.habitat ?? []).includes(g.id))).slice(0, 2);
    return shuffle([right, ...others]);
  }, [it]);
  const prompt: GeoPromptId = k === "flagPick" || k === "shapePick" ? "country" : k === "countryFlag" ? "flag" : k === "count" ? "howMany" : k === "habitat" ? "habitat" : k === "translate" ? "translate" : it.type === "climate" ? "climate" : k === "pickWord" ? "whatIs" : "which";
  useEffect(() => { if (k === "pickVisual" || k === "count") sayItem(it); else sayPrompt(prompt); }, [it.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const choose = (right: boolean, id: string, after?: () => void) => {
    if (solved) return;
    if (right) { setSolved(true); after ? after() : sayItem(it); } else { setWrong((w) => addUnique(w, id)); onMiss(); sayPrompt("again"); }
  };
  const translateTo: "en" | "ar" = useMemo(() => (Math.random() < 0.5 ? "en" : "ar"), []);
  const hint = (right: boolean) => wrong.length > 0 && !solved && right && ringHint;
  const tone = (right: boolean) => (solved && right ? "mint" : "neutral");

  return (
    <div className="flex flex-1 flex-col gap-5">
      <Guide unit={unit} lang={lang} id={prompt} solved={solved}>
        {k === "count" && <Name item={it} lang={lang} />}
      </Guide>
      <div className="flex justify-center">
        {k === "pickWord" && (it.type === "continent" ? <WorldMap highlight={it.continent} dim /> : <Picture item={it} className="h-44 w-44" />)}
        {k === "pickVisual" && <GameButton tone="neutral" className="px-6 py-3" onClick={() => sayItem(it)} aria-label="Hear it"><Name item={it} lang={lang} big /></GameButton>}
        {k === "flagPick" && <Flag id={it.id} className="h-28 w-44" />}
        {(k === "countryFlag" || k === "shapePick") && <div className="grid h-44 w-44 place-items-center rounded-3xl bg-card shadow-md"><CountryShape id={it.id} className="h-36 w-36" /></div>}
        {k === "count" && <WorldMap highlight={it.continent} dim />}
        {k === "habitat" && <Picture item={it} className="h-40 w-40" />}
        {k === "translate" && <GameButton tone="neutral" className="px-6 py-3" onClick={() => sayItem(it)} aria-label="Hear it"><Name item={it} lang={translateTo === "en" ? "ar" : "en"} big /></GameButton>}
      </div>
      <div className={cn("mt-auto grid gap-3", (k === "pickVisual" || k === "countryFlag" || k === "habitat") ? "grid-cols-3" : "grid-cols-1")}>
        {k === "count" ? countOpts.map((n) => (
          <GameButton key={n} tone={tone(n === it.countries?.count)} className={cn("min-h-16 text-3xl", wrong.includes(String(n)) && "opacity-40", hint(n === it.countries?.count))} onClick={() => choose(n === it.countries?.count, String(n))}>{n}</GameButton>
        )) : k === "habitat" ? habitatOpts.map((h) => {
          const right = (it.habitat ?? []).includes(h.id);
          return <GameButton key={h.id} tone={tone(right)} className={cn("grid gap-1 p-2", wrong.includes(h.id) && "opacity-40", hint(right))} onClick={() => choose(right, h.id)} aria-label={h.en}><Picture item={h} className="aspect-square h-auto w-full shadow-none" /><Name item={h} lang={lang} className="[&_span]:text-sm" /></GameButton>;
        }) : ex.options.map((o) => {
          const right = o.id === it.id;
          const cls = cn(wrong.includes(o.id) && "opacity-40", hint(right));
          if (k === "pickVisual") return <GameButton key={o.id} tone={tone(right)} className={cn("aspect-square p-2", cls)} onClick={() => choose(right, o.id)} aria-label={o.en}><Picture item={o} className="h-full w-full shadow-none" /></GameButton>;
          if (k === "countryFlag") return <GameButton key={o.id} tone={tone(right)} className={cn("grid place-items-center p-3", cls)} onClick={() => choose(right, o.id)} aria-label={`Flag of ${o.en}`}><Flag id={o.id} className="aspect-[3/2] w-full" /></GameButton>;
          return <GameButton key={o.id} tone={tone(right)} className={cn("min-h-20", cls)} onClick={() => choose(right, o.id)} aria-label={o.en}><Name item={o} lang={k === "translate" ? translateTo : lang} /></GameButton>;
        })}
      </div>
      {solved && (k === "flagPick" || k === "countryFlag" || k === "shapePick") && <WorldMap highlight={it.continent} country={it.id} />}
      {solved && <NextBtn onClick={onNext} />}
    </div>
  );
}

function MapTapEx({ ex, unit, lang, onNext, onMiss }: P) {
  const { sayItem, sayPrompt } = useSay(lang);
  const it = ex.item;
  const [solved, setSolved] = useState(false);
  const [bad, setBad] = useState<[number, number] | null>(null);
  const [tries, setTries] = useState(0);
  const k = ex.kind;
  const targets: ContinentKey[] = k === "animalMap" ? it.continents ?? [] : it.continent ? [it.continent] : [];
  const ocean = k === "oceanTap" ? oceanPoints[it.id] : undefined;
  useEffect(() => { sayItem(it); }, [it.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const tap = (t: Tap) => {
    if (solved) return;
    const right = ocean ? Math.hypot(t.x - ocean[0], t.y - ocean[1]) < 110 : !!t.continent && targets.includes(t.continent);
    if (right) { setSolved(true); setBad(null); sayItem(it); }
    else { setBad([t.x, t.y]); setTries((n) => n + 1); onMiss(); sayPrompt("again"); }
  };
  return (
    <div className="flex flex-1 flex-col gap-5">
      <Guide unit={unit} lang={lang} id={k === "animalMap" ? "lives" : "where"} solved={solved} />
      <div className="flex items-center justify-center gap-4">
        {k === "animalMap" && <Picture item={it} className="h-24 w-24" />}
        {k === "whereContinent" && <><Flag id={it.id} className="h-14 w-20" /><CountryShape id={it.id} className="h-20 w-20" /></>}
        <GameButton tone="neutral" className="px-4" onClick={() => sayItem(it)} aria-label="Hear it"><Name item={it} lang={lang} /></GameButton>
      </div>
      <WorldMap labels={ex.labels} lang={lang} onTap={tap} marker={solved && ocean ? ocean : bad} highlight={solved || tries >= 2 ? (ocean ? undefined : targets) : undefined} country={solved && it.type === "country" ? it.id : undefined} />
      {tries >= 2 && !solved && ocean && <p className="text-center text-sm font-bold text-muted-foreground">Look for the big blue water near the dot.</p>}
      {tries >= 2 && !solved && ocean && <WorldMap marker={ocean} mini />}
      {solved && <NextBtn onClick={onNext} />}
    </div>
  );
}

function PlaceEx({ ex, unit, lang, onNext, onMiss }: P) {
  const { sayItem, sayPrompt } = useSay(lang);
  const it = ex.item;
  const c = countryPaths[it.id]!;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [solved, setSolved] = useState(false);
  const [bad, setBad] = useState<[number, number] | null>(null);
  const [tries, setTries] = useState(0);
  useEffect(() => { sayPrompt("place"); }, [it.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const drop = (clientX: number, clientY: number) => {
    const svg = svgRef.current; if (!svg || solved) return;
    const r = svg.getBoundingClientRect();
    if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) return;
    const p = new DOMPoint(clientX, clientY).matrixTransform(svg.getScreenCTM()!.inverse());
    const radius = tries >= 2 ? 90 : 55;
    if (Math.hypot(p.x - c.cx, p.y - c.cy) < radius) { setSolved(true); setBad(null); sayItem(it); }
    else { setBad([p.x, p.y]); setTries((n) => n + 1); onMiss(); sayPrompt("again"); }
  };
  return (
    <div className="flex flex-1 flex-col gap-4">
      <Guide unit={unit} lang={lang} id="place" solved={solved} />
      <div className="flex items-center justify-center gap-3">
        <div className={cn("grid h-28 w-28 touch-none place-items-center rounded-3xl bg-card shadow-md", !solved && "cursor-grab", drag && "opacity-30")}
          onPointerDown={(e) => { if (solved) return; (e.target as Element).setPointerCapture?.(e.pointerId); setDrag({ x: e.clientX, y: e.clientY }); }}
          onPointerMove={(e) => drag && setDrag({ x: e.clientX, y: e.clientY })}
          onPointerUp={(e) => { if (drag) { drop(e.clientX, e.clientY); setDrag(null); } }} aria-label={`Drag ${it.en}`}>
          <CountryShape id={it.id} className="h-24 w-24" />
        </div>
        <GameButton tone="neutral" className="px-4" onClick={() => sayItem(it)} aria-label="Hear it"><Name item={it} lang={lang} /></GameButton>
      </div>
      <WorldMap svgRef={svgRef} labels={ex.labels} lang={lang} marker={bad} country={solved ? it.id : undefined} highlight={tries >= 2 || solved ? it.continent : undefined}
        onTap={(t) => { if (drag) return; const svg = svgRef.current!; const m = svg.getScreenCTM()!; const pt = new DOMPoint(t.x, t.y).matrixTransform(m); drop(pt.x, pt.y); }} />
      <p className="text-center text-xs font-bold text-muted-foreground">Drag the shape — or just tap the map</p>
      {drag && <div className="pointer-events-none fixed z-50 h-24 w-24 -translate-x-1/2 -translate-y-1/2" style={{ left: drag.x, top: drag.y }}><CountryShape id={it.id} className="h-full w-full drop-shadow-lg" /></div>}
      {solved && <div className="flex justify-center"><Flag id={it.id} className="h-12 w-18" /></div>}
      {solved && <NextBtn onClick={onNext} />}
    </div>
  );
}

function TraceEx({ ex, unit, lang, onNext }: P) {
  const { sayItem, sayPrompt } = useSay(lang);
  const it = ex.item;
  const svgRef = useRef<SVGSVGElement>(null);
  const outline = useRef<SVGPathElement>(null);
  const [lines, setLines] = useState<{ x: number; y: number }[][]>([]);
  const [onPath, setOnPath] = useState(0);
  const drawing = useRef(false);
  const needed = 380;
  const complete = onPath >= needed;
  useEffect(() => { sayPrompt("trace"); }, [it.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (complete) sayItem(it); }, [complete]); // eslint-disable-line react-hooks/exhaustive-deps
  const at = (e: React.PointerEvent) => { const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svgRef.current!.getScreenCTM()!.inverse()); return { x: p.x, y: p.y }; };
  return (
    <div className="flex flex-1 flex-col gap-4">
      <Guide unit={unit} lang={lang} id="trace" solved={complete}><Name item={it} lang={lang} /></Guide>
      <svg ref={svgRef} viewBox="0 0 200 200" className="w-full touch-none rounded-3xl bg-card shadow-md"
        onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); drawing.current = true; setLines((l) => [...l, [at(e)]]); }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const pt = at(e);
          setLines((l) => {
            const last = l[l.length - 1]!; const prev = last[last.length - 1]!;
            const d = Math.hypot(pt.x - prev.x, pt.y - prev.y);
            // Only count movement near the real border (gentle: wide tolerance).
            const near = outline.current?.isPointInStroke?.(new DOMPoint(pt.x, pt.y)) ?? true;
            if (near) setOnPath((v) => v + d);
            return [...l.slice(0, -1), [...last, pt]];
          });
        }}
        onPointerUp={() => { drawing.current = false; }} onPointerCancel={() => { drawing.current = false; }}>
        <path d={countryPaths[it.id]!.shape} fill={complete ? "color-mix(in oklab, var(--success) 35%, transparent)" : "var(--muted)"} stroke="var(--muted-foreground)" strokeWidth="2" strokeDasharray="5 5" />
        <path ref={outline} d={countryPaths[it.id]!.shape} fill="none" stroke="transparent" strokeWidth="22" />
        {lines.map((l, i) => <polyline key={i} points={l.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />)}
      </svg>
      <div className="h-3 overflow-hidden rounded-full bg-muted"><div className="h-full bg-success transition-[width]" style={{ width: `${Math.min(100, (onPath / needed) * 100)}%` }} /></div>
      {complete ? <NextBtn onClick={onNext} /> : <GameButton tone="neutral" className="mt-auto" onClick={() => { setLines([]); setOnPath(0); }} aria-label="Clear"><RotateCcw className="mx-auto h-6 w-6" /></GameButton>}
    </div>
  );
}

function MatchEx({ ex, unit, lang, onNext, onMiss }: P) {
  const { sayItem } = useSay(lang);
  const left = ex.options;
  const right = useMemo(() => shuffle(ex.options), [ex]);
  const [sel, setSel] = useState<string | null>(null);
  const [paired, setPaired] = useState<string[]>([]);
  const [bad, setBad] = useState<string | null>(null);
  const complete = paired.length === left.length;
  return (
    <div className="flex flex-1 flex-col gap-5">
      <Guide unit={unit} lang={lang} id="match" solved={complete} />
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-3">{left.map((o) => (
          <GameButton key={o.id} tone={paired.includes(o.id) ? "mint" : sel === o.id ? "sun" : "neutral"} disabled={paired.includes(o.id)} onClick={() => setSel(o.id)} className="aspect-square p-2" aria-label={`Picture ${o.en}`}><Picture item={o} className="h-full w-full shadow-none" /></GameButton>
        ))}</div>
        <div className="grid gap-3">{right.map((o) => (
          <GameButton key={o.id} tone={paired.includes(o.id) ? "mint" : "neutral"} disabled={paired.includes(o.id)} className={cn("p-2", bad === o.id && "opacity-40")} aria-label={`Word ${o.en}`}
            onClick={() => { if (!sel) return; if (sel === o.id) { setPaired((p) => [...p, o.id]); setSel(null); sayItem(o); } else { setBad(o.id); onMiss(); setTimeout(() => setBad(null), 500); } }}>
            <Name item={o} lang={lang} />
          </GameButton>
        ))}</div>
      </div>
      {complete && <NextBtn onClick={onNext} />}
    </div>
  );
}
