<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the math game as a single client-side route with reusable game controls; this preserves the fast, uninterrupted round flow on mobile.
- Keep complete surahs under their starting Juz with verse-level audio in the same activity flow; this preserves consistent, uninterrupted mobile playback.
- Stream licensed Numberblocks songs through Spotify embeds only; this preserves official playback rights without copying copyrighted audio into the project.
- Juz Amma (78–114) in src/data/surahs.ts is generated from QUL/Tarteel recitation 42 (Al-Nufais) + quran.com Uthmani text; regenerate rather than hand-edit to keep text, audio and timings aligned.
- Arabic path lives as data in src/data/arabicCurriculum.ts (units/items/exercise kinds) with one lesson engine in src/components/arabic/ArabicPath.tsx; audio URLs keyed `unit-item` in src/data/arabicCurriculumAudio.ts so clips can be swapped for real recordings.

- Interactive Quran (Explore tab) lives in src/components/iq/InteractiveQuran.tsx with data in src/data/quranWorld.ts and AI voice map src/data/iqAudio.ts (keys iq-<id>-ar/en, iq-q-<id>-ar/en, iq-story*); it is separate from the memorization Quran tab by design.
- Arabic ++ uses src/data/arabicWorld.ts and arabicWorldAudio.ts; all non-Qur’an Arabic voice-over shares src/lib/arabicVoice.ts (mapped clips, then ar-SA at 0.8); progress uses `aw:` keys and never gates access.
- Grade 1 Math (Jordanian NCCD units 6–11) is data in src/data/grade1Math.ts rendered by one engine in src/components/math/Grade1Math.tsx, shown as a third Math sub-tab; progress in LearningProgress.g1.done is informational only.
- More to Explore (5 Islamic spaces) lives in src/components/explorer/IslamicExplorer.tsx with verses in src/data/islamicExplorerVerses.ts (generated from quran.com + Tarteel Al-Nufais); it keeps its own localStorage key so it never touches other sections' progress.
- Keep Math Bowling isolated; reflow at 960px. First screen is a compact picker; categories open in-route.
- Building World lives in src/components/building/BuildingWorld.tsx with challenge data in src/data/buildingWorld.ts and cut-out art in src/assets/building/; it uses its own localStorage key (building-world-v1) so it never touches other progress.

- Textbook JSON in src/data/curriculum/ is generated and never hand-edited; curated letter extras stay in letterExtras.ts so source text remains faithful.
- Science World (🔬 عالم العلوم) lives in src/components/science/ScienceWorld.tsx with cut-out art in src/assets/science/; own localStorage key science-world-v1 so it never touches other progress.
- Chess lives in src/components/chess/ChessWorld.tsx with a pure rules engine in src/lib/chess.ts and cut-outs in src/assets/chess/; own localStorage key chess-world-v1 so it never touches other progress.
- Palestinian Kitchen: one engine in src/components/kitchen/CookingStage.tsx reads dishes from src/data/kitchenRecipes.ts (step = vessel + interaction + voice lines); add dishes as data only, never new engines.
- Kitchen Arabic voice = recorded ElevenLabs phrase clips (src/data/kitchenVoice.ts, played by src/lib/kitchenClips.ts) referenced by id in each Line.v; never TTS, so Arabic never reads UI text or punctuation.
- Seek & find (أدور وألاقي) is one engine in src/components/arabic/SeekAndFind.tsx reading scenes from src/data/seekWorld.ts (background, % hotspot boxes, tags/colors, audio-sprite keys); add scenes as data only. Own localStorage key seek-find-v1.
- Wudu & Salah (Mosque space → الوضوء والصلاة) is one engine in src/components/explorer/WuduSalah.tsx reading src/data/wuduSalah.ts (steps, buildPrayer(rakahs), prayers, all AR/EN copy, Mama lines); art is transparent WebP cut-outs in src/assets/salah/. Drop src/assets/salah/salah-video.mp4 in and it is picked up automatically. Progress uses the Explorer key islamic-explorer-v1 (ws-* ids).
