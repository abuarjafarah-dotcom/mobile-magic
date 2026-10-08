# Mastery World: Audit + Implementation Plan

Status: **audit only, no code changed.** Waiting for "proceed".
Branch: `claude/mastery-world-audit-rbktsz` (this file is the only change on it).
Audit date: 2026-10-08, base commit `ee0fb0f`.

---

## 0. TL;DR: what changes the original brief

1. **The Ahmad Al-Nufais audio already works without credentials.** Every surah in the app uses
   Al-Nufais verse-by-verse MP3s from QUL/Tarteel "recitation 42", plus word-level timings.
   Al-Kahf loads them straight from `https://audio-cdn.tarteel.ai/quran/alnufais/SSSAAA.mp3`.
   Al-Waqi'ah can use the same source and the same player. **No Quran Foundation API, no OAuth,
   no env vars and no server route are needed** unless the 056 files are missing on that CDN.
   I could not check that tonight because the container's network blocks it (see §4).
2. **Surah 56 belongs in `src/data/surahsJuz27.ts`**, which already holds Ar-Rahman (55). It goes
   under the existing "Juz 27" tab. No new tab and no new UI.
3. **A Montessori Bead Garden already exists** (`src/components/math/MontessoriBeadChains.tsx` +
   `montessori/materials.tsx` + `montessori/levels.tsx`). It has one shared drag/tap/snap system
   (`useWorkMat` / `Draggable` / `Zone` / `DragLayer`), wooden numeral and symbol pieces, an
   `EquationWork` builder that only accepts the true equation, and these levels: chain multiples,
   factor families (apples), sharing (apples), squares + cubes 2–10, count, build. **Part 3 extends
   this. It does not rebuild it.**
4. **Cube assets exist for 2–10** (`cube2..10.png`, plus `layer/square/exploded` 6–10), so cubes
   need no new art style.
5. **There is no Supabase in this repo.** All progress lives in `localStorage`:
   `learning-adventure-progress` (Quran etc.) and `bead-garden-v1` (garden growth). I will keep it
   that way. Adding Supabase is out of scope unless you ask for it.
6. **Vercel hosting risk:** 1,664 verse audio URLs (every surah except Al-Kahf), the 19 Explorer verse clips, and the garden
   background use Lovable-hosted paths `/__l5e/assets-v1/...`. Those are served by Lovable's
   hosting. I could not confirm whether they resolve on the Vercel deployment (the Vercel
   connector denied access to deployments). **Please open any Juz 30 surah on the Vercel URL and
   press play.** If it stays silent, that is a separate pre-existing issue (fix: a Vercel rewrite
   or a switch to Tarteel URLs). I will not touch it without your go-ahead.

---

## 1. Quran audit

### 1.1 Architecture
| Piece | Location | Notes |
|---|---|---|
| Single route | `src/routes/index.tsx` | One client route with a `Screen` state machine (`"surah" \| "ayah" \| "memorize" \| …`). No per-surah routes. |
| Juz picker | `QuranPicker` in `index.tsx` (~L498) | Tabs: 30, 29, 28, 27, 22, 15, 3, 1–2. Each tab lists a `SurahData[]`. Each card has *Listen* and *Finish the Ayah* buttons, plus a progress bar showing `done/verses`. |
| Listen & follow | `SurahScreen` in `index.tsx` (~L556) | `<audio>` per verse, auto-advance, word highlight from `wordTimings`, verse-number grid. |
| Finish the Ayah | `src/components/quran/FinishAyah.tsx` | 4 levels (Hear & choose / Listen only / Missing word / Recite). Runs linearly through every verse. Plays the audio up to the missing word using `wordTimings`, then lets the reciter finish. |
| Memorize | `src/components/quran/AlaqMemorize.tsx` | Al-'Alaq only. Has hard-coded `GROUPS` (sections). This is the only "sections" precedent. |
| Parent summary | `index.tsx` (~L881) | Iterates `allSurahs`, so a new surah appears there automatically. |

### 1.2 Surah data model (`src/data/surahs.ts`)
```ts
type SurahVerse = { arabic: string; audio: string; wordTimings?: number[][] };   // [startMs,endMs] per word
type SurahData  = { id; number; name; arabicName; reciter; tone: "berry"|"sun"|"mint"|"sky";
                    scene: "dawn"|"flowers"|"trees"|"foliage"; verses: readonly SurahVerse[] };
```
- Files: `surahs.ts` (Juz 30, 78–114), `surahsJuz29.ts` (67–77), `surahsJuz28.ts` (58),
  `surahsJuz27.ts` (55), `surahsJuz22.ts` (36), `surahsJuz15.ts` (18), `surahsJuz3.ts` (3),
  `surahsJuz1.ts` (2).
- All files are **generated** ("regenerate, don't hand-edit"): Uthmani text from quran.com, audio
  and word timings from QUL/Tarteel recitation 42. **The generator script is not in the repo.**
  It lived on Lovable's side.
- Contract `FinishAyah` relies on: `wordTimings.length === number of non-waqf-mark tokens`
  (marks U+06D6–U+06ED are kept on screen but never asked). If they don't match, it falls back to
  a proportional estimate, which still works but is less accurate.

### 1.3 Audio implementation
- Per-verse MP3, one `<audio>` element (`SurahScreen`) or `useClip()` (`learn/shared.tsx`) with
  `from` / `stopAt` callbacks for partial playback. No chapter-level files and no segment slicing
  are needed.
- Sources in use: `/__l5e/assets-v1/<uuid>/alnufais-SSSAAA.mp3` (Lovable asset store, 1,664
  verses) and `https://audio-cdn.tarteel.ai/quran/alnufais/SSSAAA.mp3` (Al-Kahf, 110 verses).
- **Not used anywhere:** alquran.cloud / Islamic.network, everyayah, the Quran Foundation API.
  There are no `fetch` calls for Quran content at runtime. Everything is static data.

### 1.4 Progress / state
- `src/lib/learningProgress.ts`: `LearningProgress.quran[surahId] = { completed: number[] /* ayah
  indexes */, levels: number[] /* 1–4 */ }`, stored in `localStorage["learning-adventure-progress"]`.
- New surahs need no schema change. Progress is keyed by `id` (`"waqiah"`).
- Nothing is locked. Every level and surah is always open.

### 1.5 Arabic typography
- `--font-quran: "Amiri Quran", "Noto Naskh Arabic"` (Google Fonts, loaded in `__root.tsx`).
  Utility `font-quran`. Every Arabic block uses `dir="rtl" lang="ar"`.
- Text is quran.com `text_uthmani` with full harakat and small-high marks (ۖ ۗ ۚ ۛ ۜ).
  - Some first verses carry a leading space (`" عَمَّ"`). This is a harmless generator artifact,
    and I will reproduce it the same way for consistency.

---

## 2. Bead Garden audit

### 2.1 Routing and entry
- Math tab, then the "📿 Bead Chains" button (`index.tsx` L423), then `screen === "beads"`, which
  lazy-loads `MontessoriBeadChains`. It is the same single route. Mode buttons inside the screen
  pick the activity, and "Clear the work" resets it by bumping a React `key`.
- It is bilingual through `useLearningLanguage()` (`ar`/`en`, saved under `learning-language-v1`).
  Voice uses `speakArabic` (`lib/arabicVoice.ts`) / `speakEnglish` (`lib/voice.ts`).
- Garden growth (`useGardenGrowth`, `bead-garden-v1`) is a counter that grows plants and a
  butterfly in `GardenBed`. It is informational only: no XP, no locks.

### 2.2 Manipulation system (`montessori/materials.tsx`): already "the one system"
- `useWorkMat(onDrop)` → registers drop `Zone`s, finds the nearest zone with an 18px pad, and calls
  `onDrop(piece, zoneId) → boolean`. Rejected drops wiggle (`nudge`). Accepted drops play a soft
  sine "snap" sound.
- `Draggable`: pointer events (`touch-none`, pointer capture). A drag starts after 7px of movement.
  **Tap to pick up, then tap a zone to place it**, which is good for small fingers.
- `DragLayer`: a floating copy under the finger, clamped to the screen.
- `EquationWork`: shuffled wooden tokens plus distractors. Only the correct token snaps into each
  slot. When the equation is complete it plays success, speaks the equation, and calls `onDone`.
- `Chain n reps bead`: a chain drawn from single-bead PNGs with constant bead size, so a 10-chain
  is 5× a 2-chain. It has a gap between repetitions and an optional `dim`.
- **Gaps for the requested "bead-chain system":** pieces are not persistent objects on a free
  work area. Each level keeps its own counters (`laid`, `rows`, `groups[]`). There is no generic
  *duplicate/repeat*, *select*, *remove one chain*, *align* or *per-chain quantity*. That is the
  layer to add (see §5).

### 2.3 Assets (all reused, no new art needed)
| Asset | Files |
|---|---|
| Garden background | `montessori/bead-garden.jpg.asset.json` (Lovable-hosted `/__l5e/` URL) |
| Beads (single, 140×140) | `beads/bead-1..10.png`, standard bead-stair colours: 1 red, 2 green, 3 pink, 4 yellow, 5 light blue, 6 purple, 7 white, 8 brown, 9 navy, 10 gold |
| Wooden numerals | `pick-blank.png` with the digit rendered on top (`WoodNum`) |
| Wooden symbols | `sym-plus/minus/times/divide/equals/sq2/sq3/paren_l/paren_r.png` |
| Garden items | `g-apple`, `g-flower`, `g-rose`, `g-sunflower`, `g-butterfly` |
| Squares | built from chains for 2–5; `square6..10.png` |
| Cubes | `cube2..10.png` (bead-cube photo style), `layer6..10.png`, `exploded6..10.png` |
| Work board | CSS only (`border-amber-900/25 bg-amber-100/70 shadow-inner`). There is no image. I will reuse the CSS. |
| Counters | **None as a separate asset.** Apples act as counters, and single beads can too. |

### 2.4 ⚠️ Colour inconsistency (needs your call)
- `Chain` / cubes use `CHAIN_FILE`: **2 red, 3 light blue, 4 pink, 5 yellow**, 6 purple, 7 white,
  8 brown, 9 navy, 10 gold. The cube art was drawn in this palette (cube2 red, cube3 light blue,
  cube4 pink, cube5 yellow).
- Count/Build modes use `bead-n` directly, which is the standard Montessori palette (2 green,
  3 pink, 4 yellow, 5 light blue).
- So a "3" is pink in Count and light blue in Chain multiples and Cubes.
- **Recommendation:** keep `CHAIN_FILE` for every chain, square and cube in the new work, because
  it matches the existing cube art and "keep existing colours" was the rule. Leave Count/Build
  as they are. Changing either palette would force a cube art redo or change a working mode.

### 2.5 Existing levels vs. requested progression
| Requested | Exists today? | Gap |
|---|---|---|
| 1. Repeated groups (4 groups of 3, then 4 × 3 = 12, beads stay) | Partly: Chain multiples shows skip-counting stops on a chain | No "lay N separate groups of K, see the total, then build the equation" with beads |
| 2. Why 3 × 4 = 4 × 3 | No (the family list shows both equations as text pieces) | Need the same beads re-grouped or rotated |
| 3. Factor families with the same beads | With **apples**, plus a chain check | Need a bead version where the same array lights up as rows and as columns for ×, ×, ÷, ÷ |
| 4. Division: 12 into 3 equal groups, 4 each (partitive) | "Sharing" is *quotative* (groups **of** size s, with apples) | Need partitive dealing: one bead per tray in turn |
| 5. Arrays | Only as squares | Need r × c rectangles from repeated chains |
| 6. Squares 2×2–5×5 | Yes (2–10, then ² piece) | Add a visible square outline and the side labels; default to 2–5 |
| 7. Cubes 2³–5³ | Yes (2–10 cube images, then ³ piece) | Make "side × side × side" explicit for 2–5 by stacking n squares (6–10 already do layers) |

### 2.6 Build / tooling baseline
- `vite build` **passes** on the current `main` (installed with npm; `bun install` fails because
  `bun.lock` points at Lovable's private npm mirror, which returns 403).
- The build output target is **Cloudflare** (nitro preset from `@lovable.dev/vite-tanstack-config`:
  `wrangler.json`). I need to confirm how Vercel builds it. This only matters if a server route is
  ever needed (QF fallback).
- No `tsconfig.json` is committed, so `tsc --noEmit` can't run standalone. Vite/oxc still catches
  syntax and import errors. ESLint shows about 619 pre-existing prettier-format errors, which I
  will not reformat.

---

## 3. Which surah/audio APIs are used

| Source | Used? | For what |
|---|---|---|
| quran.com API v4 (`text_uthmani`) | At generation time only | Arabic text of every surah |
| QUL / Tarteel recitation 42 | At generation time + runtime CDN | Al-Nufais verse MP3s + word timings |
| Lovable asset store `/__l5e/` | Runtime | Copies of the Tarteel MP3s for 1,664 verses |
| alquran.cloud / Islamic.network | **No** | |
| everyayah | **No** | |
| Quran Foundation (OAuth) API | **No** | |

Al-Nufais is **not** listed among alquran.cloud audio editions or everyayah's standard reciter set,
as far as I know. I couldn't re-check tonight, and it doesn't matter because Tarteel already serves him.

---

## 4. Blockers found tonight

- **The container network policy blocks** `api.quran.com`, `api.alquran.cloud`, `everyayah.com`,
  `audio-cdn.tarteel.ai`, `qul.tarteel.ai` (proxy returns 403 / DNS fails). I could not fetch the
  Waqi'ah text, verify that `056001–056096.mp3` exist, or pull timings.
  **To unblock step 3 tomorrow:** in the cloud environment settings (session title bar →
  environment → Edit → Network access), add these to *Allowed domains*:
  `api.quran.com`, `audio-cdn.tarteel.ai`, `qul.tarteel.ai` (optionally `api.qurancdn.com`,
  `api.quran.foundation`, `api.alquran.cloud` for fallbacks).
  Docs: https://code.claude.com/docs/en/cloud-environments#network-access
- Vercel deployment access was denied to the connector (403), so I could not test the `/__l5e/` URLs on Vercel.

---

## 5. Implementation plan (after "proceed")

### Step 3: Surah Al-Waqi'ah (56), 96 ayahs
1. Add a **dev-only generator** `scripts/gen-surah.mjs`. It is not bundled; Node ≥ 18 runs it with
   `node scripts/gen-surah.mjs 56 27`. It:
   - fetches `GET https://api.quran.com/api/v4/verses/by_chapter/56?fields=text_uthmani&words=false&per_page=50&page=1..2`
   - fetches recitation-42 word segments from QUL (same source as the existing files)
   - builds `audio = https://audio-cdn.tarteel.ai/quran/alnufais/056AAA.mp3` (the same pattern as
     Al-Kahf; I can't upload into the Lovable asset store from git)
   - **asserts**: exactly 96 verses; `verse_key` runs 56:1…56:96 in order; every text is
     non-empty; `HEAD` on all 96 MP3s returns 200 `audio/mpeg`; timings count equals the non-mark
     token count (any mismatch is logged per ayah, and the player falls back as it does today)
   - prints the `SurahData` literal, which gets inserted into `surahsJuz27.ts` after Ar-Rahman. The
     header comment is updated to "Juz 27: Ar-Rahman (55), Al-Waqi'ah (56) …".
   - The script is committed so future surahs can be regenerated instead of hand-edited.
2. Entry: `{ id: "waqiah", number: 56, name: "Surah Al-Waqi'ah", arabicName: "سورة الواقعة",
   reciter: "Ahmad Al-Nufais", tone: "sun", scene: "dawn", verses: [...] }`.
3. **Sections (~7).** Option A (recommended): add an **optional** `sections?: readonly { from:
   number; to: number }[]` field to `SurahData`. Only Waqi'ah sets it, so other surahs behave
   exactly as before. `FinishAyah` then shows a section row above the existing 4 level buttons,
   built from the existing `GameButton` styling. If no section is chosen, it runs the whole surah
   as today. Choosing a section limits `index` to `[from-1, to-1]`. Progress stays per-ayah
   (`completed`), and a section shows ✓ when all its ayahs are complete. Nothing is locked.
   `SurahScreen` (Listen) stays unchanged: the full surah with the verse grid.
   Thematic split (12+14+14+16+18+8+14 = 96):
   | # | Ayahs | Theme |
   |---|---|---|
   | 1 | 1–12 | The Event and the three groups |
   | 2 | 13–26 | The foremost |
   | 3 | 27–40 | Companions of the right |
   | 4 | 41–56 | Companions of the left |
   | 5 | 57–74 | Signs: creation, seed, water, fire |
   | 6 | 75–82 | The oath by the stars and the Qur'an |
   | 7 | 83–96 | The final moment and the three outcomes |
   Option B: no sections, a linear 96-ayah run like Al-Kahf and Al-Baqarah (zero UI change).
   **→ Please pick A or B.**
4. Nothing else changes: the Juz 27 tab now lists 2 surahs, and the parent summary and progress
   pick the new surah up automatically.

### Step 4: Reciter audio
- Primary: the Tarteel CDN pattern above (no credentials). This is "existing source fits existing
  player", so it is the path the brief prefers.
- **Fallback, only if the 056 files are missing on Tarteel:** Quran Foundation API.
  - Resolve the reciter with `GET /content/api/v4/resources/chapter_reciters` (filter on
    "Nufais"/"النفيس"). That is a *chapter-reciter* ID, not a `/resources/recitations` ID. If he
    also exists in `/resources/recitations` (verse audio), prefer that, because the player is per-verse.
  - If only chapter audio exists: `GET /chapter_recitations/{reciterId}/56?segments=true`, then
    store each verse's `[from,to]` ms. `useClip` already supports `from`/`stopAt`, so per-ayah
    playback becomes a slice of one file. If there are no segments, **stop and report.**
  - Server-only route (TanStack Start server route, e.g. `src/routes/api/qf-audio.ts`): reads
    `process.env.QF_CLIENT_ID` / `QF_CLIENT_SECRET`, runs the OAuth client-credentials flow, caches
    the token in module memory until `expires_in − 60s`, and responds with
    `Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800`.
    Never a `VITE_` prefix, and nothing secret reaches the client. No child login.
  - Env vars you would add in Vercel (Production + Preview): `QF_CLIENT_ID`, `QF_CLIENT_SECRET`,
    and possibly `QF_ENV=production`. You get them from https://api-docs.quran.com/ ("Request
    access", Quran Foundation API client). I will confirm the nitro/Vercel preset before building this.

### Step 5: Bead-chain system (extends `materials.tsx`, still one system)
New file `src/components/math/montessori/beadMat.tsx`, built on `useWorkMat`/`Draggable`/`Zone`/`DragLayer`:
- `useBeadMat()`: state `chains: { id; n; group; selected }[]`, with actions `add(n, group?)`,
  `repeat(id)` (duplicate the selected chain), `remove(id)` (drag back to the tray, or the ✕ on a
  selected chain), `select(id)`, `reset()`, `moveTo(id, group)`.
- `<BeadWorkArea>`: an amber CSS board. Chains **snap into aligned rows** (an array layout) or into
  **group trays** (a group layout). Each chain shows a small `WoodNum` quantity, and the board
  shows a running total as a `WoodNum` (hidden until the step reveals it).
- `<BeadTray>`: draggable chains 2–10 (`Chain`, `CHAIN_FILE` colours) and loose single beads.
- Large targets: chains rendered at least 44px tall including padding, zone pad 18px (existing),
  tap-to-place kept. `touch-none` only on the pieces, so the page can still scroll.
- Optional `orientation: "rows" | "cols"` with a CSS rotate transition for the commutativity step.

### Step 6: Groups + multiplication (new modes in the *existing* mode bar)
- **Groups** (`"groups"`): the prompt shows the chain to use (e.g. a 3-chain) and how many groups
  (wooden numeral 4). The child drags a 3-chain into the first tray, then presses *repeat* or
  drags again into the next trays (GROUP → REPEATED GROUPS). After 4 trays the total is revealed:
  the beads stay and a WoodNum 12 appears (TOTAL). Then `EquationWork [4,"×",3,"=",12]` (EQUATION).
  Wrong chains don't snap.
- **Multiply / turn it** (`"turn"`): start from the 4 × 3 layout and tap ↻. The *same beads*
  rotate into 3 rows of 4, and the total 12 stays visible. The child builds both equations.
- The mode list gets two entries, placed in progression order before the existing ones. Existing
  modes keep their behaviour.

### Step 7: Factor families, division, arrays, squares, cubes
- **Families (beads)**: inside the existing "Factor families" mode, add a *Beads* toggle next to the
  current "Equal groups / Where chains meet" toggle. The apple flow stays untouched. A 3 × 4 bead
  array is shown. Building `3×4` highlights rows, `4×3` highlights columns, `12÷3` lifts the beads
  into 3 trays, and `12÷4` lifts them into 4 trays: the same beads, animated between layouts. All
  four equations go through `EquationWork` (no multiple choice).
- **Division (partitive)**: inside the existing "Sharing" mode, add a *Share into N groups* toggle;
  the current quotative apple flow stays. 12 loose beads sit in the tray with 3 trays. The child
  deals one bead at a time (drag or tap); a tray won't accept a bead while it has more than the
  others (fair dealing). When the pile is empty, each tray shows a WoodNum 4 (TOTAL → EQUAL GROUPS).
  Then `EquationWork [12,"÷",3,"=",4]`, followed by the reverse `[3,"×",4,"=",12]`.
- **Arrays** (`"arrays"` mode): pick r × c from a small set (2×3, 3×4, 2×5, 4×5, 3×6). The child
  drags c-chains into r rows, and they snap into a rectangle with side labels r and c (wooden
  numerals on the edges). Then total, then `EquationWork [r,"×",c,"=",r*c]`.
- **Squares**: keep `SquaresCubes`. Default to n = 4, add a dashed square frame around the rows
  plus side numerals on the top and left edges, and put 2–5 first in the picker (6–10 stay).
  SIDE × SIDE → SQUARE → ².
- **Cubes**: keep the existing flow. For 2–5, add the same stack-the-squares step that 6–10
  already have: n squares of n × n chains stack into `cube{n}.png`. SIDE × SIDE × SIDE → CUBE → ³.
  The existing assets cover everything, so no new art style is needed.
- No XP, coins, locks, worksheets or new menus. `grow()` stays the only reward (plants).

### Step 8: Build + test
- `vite build`; fix any type or runtime errors; run eslint on changed files only.
- Playwright (preinstalled Chromium) at 390×844 and 1280×800: Quran picker → Juz 27 →
  Al-Waqi'ah → Listen plays ayah 1 → Finish the Ayah level 1 on a section → progress saves;
  spot-check An-Naba, Al-Kahf and Ar-Rahman still play; Bead Garden: every mode loads, drag and
  tap-place work with mouse and touch emulation, Clear the work resets, Count/Build unchanged.

### Step 9: Fix regressions only

### Files I expect to touch
- `src/data/surahsJuz27.ts` (append generated Waqi'ah)
- `src/data/surahs.ts` (type only: optional `sections`, if Option A)
- `src/components/quran/FinishAyah.tsx` (section row, if Option A)
- `scripts/gen-surah.mjs` (new, dev-only)
- `src/components/math/montessori/beadMat.tsx` (new)
- `src/components/math/montessori/levels.tsx` (new Groups/Turn/Arrays levels, bead toggles, square
  frame, 2–5 cube stacking)
- `src/components/math/MontessoriBeadChains.tsx` (mode list entries only)
- `AGENTS.md` (one line each for the Waqi'ah generator and the bead mat), `roadmap.md` (ticks)
- Fallback only: `src/routes/api/qf-audio.ts` (+ a client call in the Waqi'ah data path)

**Not touched:** other surahs' data, `SurahScreen`, `AlaqMemorize`, Arabic/Science/Kitchen/Chess/
Building/Explorer/Seek, Math Bowling, Math Quest, Grade 1 Math, Count/Build modes, `learningProgress.ts`.

---

## 6. Decisions I need from you
1. **Sections for Al-Waqi'ah:** Option A (optional `sections`, a section row in Finish the Ayah;
   recommended) or B (linear, no UI change)?
2. **Bead colours:** keep `CHAIN_FILE` (matches the cube art; recommended), or switch every chain to
   standard Montessori colours (that means redrawing or retinting cube2–10)?
3. **Network:** allow `api.quran.com`, `audio-cdn.tarteel.ai`, `qul.tarteel.ai` in the environment
   so I can generate and verify the 96 ayahs. Without that I cannot do step 3 honestly (no text
   from memory).
4. **Vercel `/__l5e/` audio:** does Juz 30 audio play on your Vercel URL? If not, do you want that
   fixed (separate change)?

---

## 7. Manual phone touch checklist (for after implementation)
- [ ] Qur'an → Juz 27 → Al-Waqi'ah shows 96 verses and plays ayah 1 in Al-Nufais's voice; the verse grid jumps to 50 and 96
- [ ] Words glow in time with the recitation while listening
- [ ] Finish the Ayah: pick a section, then level 1; the blank word, choices and reciter finishing the ayah all work; leaving and returning keeps the ✓
- [ ] An-Naba, Al-Kahf and Ar-Rahman still play and keep their progress
- [ ] Bead Garden: drag a chain with a finger and drop it; tap a chain, then tap a tray; both place it
- [ ] A wrong chain wiggles back; repeat duplicates; dragging back to the tray removes; Clear the work resets
- [ ] Groups 4 × 3 → total 12 stays with the beads visible → wooden equation snaps
- [ ] ↻ turns 4 × 3 into 3 × 4 with the same beads
- [ ] Share 12 into 3 → 4 each → 12 ÷ 3 = 4
- [ ] Arrays, square 2–5 frame, cube 2–5 stacking
- [ ] The page still scrolls when you swipe on empty space, and nothing is cut off in portrait or landscape
- [ ] Arabic/English switch flips text and voice
