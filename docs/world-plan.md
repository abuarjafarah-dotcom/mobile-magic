# Hamad & Talal World: Plan

Status: planning only. No game code has changed. This branch (`hamad-talal-world`) is separate from `main`.

## Audit summary

- Vite + TanStack Start (React 19), Tailwind 4. Client-side only.
- `src/routes/index.tsx` (998 lines) holds a `Screen` union of about 30 values. Games mount by screen name, not by URL.
- Each game stores progress in its own localStorage key (about 22 keys). AGENTS.md requires these to stay separate.
- Data-driven engines already exist: Noorani, Palestinian Kitchen, Seek & Find, Arabic curriculum, Grade 1 Math.
- 100 voice clips are real files in `public/audio/voice/ar/`. 715 `.asset.json` files point to Lovable's CDN (`/__l5e/...`) and have no binaries in the repo.
- Hamad, Talal and Yousef art exists only as cut-outs inside game folders. The top-level character images are Lovable pointers.
- No Supabase code exists in the repo. Per-child sync is not implemented.
- `@lovable.dev/vite-tanstack-config` is a devDependency. `__root.tsx` imports the Lovable error reporter.

## Open decisions

1. Supabase status: is the per-child progress work on another branch, or not started?
2. How does a child choose their profile when the app opens?
3. Lovable cutover date, and whether the 715 CDN pointers need real files first.
4. Does the world map replace the picker, or sit beside it?

## Proposed information architecture

| Location | Existing modules to reuse | Gap |
|---|---|---|
| Home | Palestinian Kitchen, Building World | Pretend play, decorating |
| Masjid | Interactive Quran, Finish the Ayah, Surah and Alaq memorize, Noorani Qaida, More to Explore, Wudu & Salah | Quran coverage limited to selected Juz |
| Garden | Bead Garden, Golden Bead Workshop | Nature exploration game |
| Market | Arabic Learning World, Seek & Find, Harakat Slot Machine | Shopping and counting role-play |
| School | Grade 1 Math, Math Quest, Math Bowling, Arabic curriculum, Geography, Chess | Problem-solving |
| Discovery Lab | Human Biology Lab, Brain & Senses Lab, Science World | Three screens to group under one entry |

The map is picture- and voice-led, since Hamad and Talal cannot read yet. Nothing is locked. Empty locations show art and "coming soon", with no broken links.

## Reuse plan

- Do not rewrite existing games. Register each as `{ id, location, component, progressKey, art, voiceLines }`.
- Keep all existing storage keys. A read-only aggregator reads them for map progress.
- Add one new key, `world-v1`, for a collectibles ledger derived from completions. It never gates access.
- Leave Quran and Islamic content unchanged. New Quran text needs source verification.

## Implementation sequence

1. Decisions above.
2. World map shell: six locations, entry from the picker, no game changes.
3. Activity registry and read-only progress aggregator.
4. Fill Masjid and Discovery Lab first (existing content). Then School.
5. Collectibles ledger (`world-v1`).
6. Garden and Market: new art and game designs.
7. Home: pretend play and decorating.
8. Per-child sync, once decision 1 is settled.

Each step goes on its own branch with a Vercel preview before merging.

## Risks

1. `index.tsx` will grow worse if extended. The map should be a separate module with its own route. Route changes require regenerating `routeTree.gen.ts`.
2. Lovable CDN pointers (715 files) will break after Lovable access ends. Real files need to be in the repo first.
3. Supabase drift: the sync design depends on decision 1.
4. Art production is the schedule risk for Garden and Market.
5. Repo size is 73 MB. Use optimized WebP and lazy loading for new art.
6. Accessibility for pre-readers: voice and picture first.
7. Lovable is still connected per AGENTS.md. Keep changes additive, with no history rewrites.
