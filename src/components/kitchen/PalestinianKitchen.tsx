import { useEffect, useState } from "react";
import { ArrowLeft, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";
import bg from "@/assets/kitchen/kitchen-bg.jpg.asset.json";
import { COOK_RECIPES, kart, type Recipe } from "@/data/kitchenRecipes";
import { kitchenPic } from "@/data/kitchen";
import { CookingStage, sayLine, type Lang } from "@/components/kitchen/CookingStage";
import { replayVoice, stopVoice } from "@/lib/voice";
import { replayClips } from "@/lib/kitchenClips";

const KEY = "kitchen-world-v1";
type Saved = { cooked?: string[]; lang?: Lang; muted?: boolean; seen?: string[] };

export function PalestinianKitchen({ onExit }: { onExit: () => void }) {
  const [open, setOpen] = useState<Recipe | null>(null);
  const [run, setRun] = useState(0);
  const [cooked, setCooked] = useState<string[]>([]);
  const [lang, setLang] = useState<Lang>("ar");
  const [muted, setMuted] = useState(false);
  useEffect(() => {
    try { const d = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Saved; setCooked(d.cooked ?? []); setLang(d.lang ?? "ar"); setMuted(!!d.muted); } catch { /* ignore */ }
    return () => stopVoice();
  }, []);
  const save = (p: Saved) => { try { const d = JSON.parse(localStorage.getItem(KEY) ?? "{}"); localStorage.setItem(KEY, JSON.stringify({ ...d, ...p })); } catch { /* ignore */ } };
  const markCooked = (id: string) => setCooked((c) => { const n = c.includes(id) ? c : [...c, id]; save({ cooked: n }); return n; });
  const pick = (r: Recipe) => { stopVoice(); setOpen(r); setRun((x) => x + 1); };
  const ar = lang === "ar";

  return (
    <section dir={ar ? "rtl" : "ltr"} lang={lang} className="relative flex min-h-dvh w-full flex-col overflow-hidden">
      <img src={bg.url} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-background/30" />
      <header dir="ltr" className="relative z-40 flex items-center gap-2 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pr-16">
        <GameButton tone="neutral" className="grid h-12 w-12 shrink-0 place-items-center rounded-full p-0" onClick={() => { stopVoice(); if (open) setOpen(null); else onExit(); }} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </GameButton>
        <div className="min-w-0 flex-1 truncate rounded-2xl bg-card/85 px-3 py-2 text-center font-black">
          {open ? (ar ? open.name.ar : open.name.en) : ar ? "مَطْبَخُنا الْفِلَسْطيني" : "Palestinian Kitchen"}
        </div>
        <GameButton tone="sky" className="h-12 shrink-0 rounded-full px-3 text-sm" onClick={() => { const l = ar ? "en" : "ar"; setLang(l); save({ lang: l }); stopVoice(); }} aria-label="Language">
          {ar ? "EN" : "عربي"}
        </GameButton>
        <GameButton tone="neutral" className="grid h-12 w-12 shrink-0 place-items-center rounded-full p-0" onClick={() => { const m = !muted; setMuted(m); save({ muted: m }); if (m) stopVoice(); }} aria-label={muted ? "Unmute" : "Mute"}>
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </GameButton>
        {open && (
          <GameButton tone="sun" className="grid h-12 w-12 shrink-0 place-items-center rounded-full p-0" onClick={() => { if (!muted) void (ar ? replayClips() : replayVoice()); }} aria-label="Replay">
            <RotateCcw className="h-5 w-5" />
          </GameButton>
        )}
      </header>

      {open ? (
        <CookingStage key={`${open.id}-${run}-${lang}`} recipe={open} lang={lang} muted={muted} onDone={() => markCooked(open.id)} />
      ) : (
        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pb-6">
          <div className="mt-3 flex items-end justify-center gap-2">
            <img src={kart("cast/hamad-idle")} alt="" className="k-breathe h-32 object-contain -scale-x-100" />
            <button type="button" onClick={() => void sayLine({ ar: "يلا نطبخ", en: "What shall we cook today?", v: ["yalla-natbukh", "jahzin"] }, lang, muted)}
              className="mb-6 rounded-3xl bg-card px-4 py-2 text-xl font-black shadow-md">{ar ? "ماذا نَطْبُخُ الْيَوْم؟" : "What shall we cook?"}</button>
            <img src={kart("cast/talal-idle")} alt="" className="k-breathe h-32 object-contain" style={{ animationDelay: "1s" }} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {COOK_RECIPES.map((r) => (
              <button key={r.id} type="button" onClick={() => pick(r)}
                className="relative flex min-h-40 flex-col items-center justify-end gap-1 rounded-3xl border-2 border-foreground/10 bg-card/90 p-3 shadow-[0_5px_0_var(--neutral-shadow)] transition-transform active:translate-y-1">
                {cooked.includes(r.id) && <span className="absolute start-2 top-2 text-2xl" aria-label="cooked">⭐</span>}
                <img src={kitchenPic(`dish-${r.id}`) || kart(r.dish)} alt="" draggable={false} className="h-24 w-full object-contain drop-shadow-lg sm:h-32" />
                <span className="text-xl font-black">{ar ? r.name.ar : r.name.en}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
