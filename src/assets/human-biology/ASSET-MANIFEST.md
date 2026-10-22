# Human Biology Lab — Asset Manifest

Status: **no artwork is in the repo yet.** The Anatomy Atlas currently uses a
schematic front-view body drawn in code (`src/data/humanBiologyBody.ts`). Its
organ shapes sit at approximate real locations, so the tap targets land on the
right structures. It is not a finished anatomical illustration.

Filenames below are fixed. **Wiring note:** the engine does not read this
folder yet. Art and animation files will only appear once they are imported
in the code (see the sections below). Nothing breaks while the folder is empty.

## 1. Body illustration (replaces the schematic)

| Filename | Purpose | Spec |
|---|---|---|
| `body-front.webp` | Full front-view body, transparent background | Portrait, approx. 1000 × 2000 px, transparent PNG/WebP |
| `layer-skeleton.webp` | Skeleton layer, aligned to `body-front.webp` | Same canvas size, transparent |
| `layer-lungs.webp` | Lungs layer | Same canvas size, transparent |
| `layer-heart.webp` | Heart layer | Same canvas size, transparent |
| `layer-stomach.webp` | Stomach layer | Same canvas size, transparent |
| `layer-small-intestine.webp` | Small intestine layer | Same canvas size, transparent |
| `layer-brain.webp` | Brain layer | Same canvas size, transparent |

**Replacement path:** when the layers are ready, switch the Atlas from
`humanBiologyBody.ts` shapes to the layered images. Keep the organ ids
(`brain`, `heart`, `lungs`, `stomach`, `smallIntestine`, `skeleton`) and
update the hotspot coordinates in `humanBiologyBody.ts`. Hotspot coordinates live
in data, not in the renderer.

## 2. Animations (optional, per organ)

The data field is `animation` on each organ in `src/data/humanBiology.ts`. It
is **not played yet**: the engine does not render animations in this version.
Add the files and the playback step when they exist.

| Organ | Filename | Content |
|---|---|---|
| Brain | `brain-signals.mp4` | Nerve signals travelling along neurons |
| Heart | `heart-pump.mp4` | Four chambers, blood flow through pulmonary and systemic circuits |
| Lungs | `lungs-breathing.mp4` | Breathing and gas exchange at the alveoli |
| Stomach | `stomach-churn.mp4` | Churning and mixing of food |
| Small intestine | `small-intestine-absorption.mp4` | Villi absorbing nutrients into blood and lymph |
| Skeleton | `skeleton-movement.mp4` | Muscles pulling on bones at joints |

Spec: MP4 H.264, 720p, under 10 seconds, looping, no sound (narration is separate).

## 3. Audio narration

Narration uses the shared device English voice (`src/lib/voice.ts`), so no audio
files are required. Narration text for each organ is in the `narration` field.

## 4. Not yet built

- Animation playback (see section 2).
- Layered-art hotspots (section 1).
- Four other labs: Digestion, Oxygen and Blood, Brain and Senses, Movement, and
  Cells and Experiments. Each shows as "Coming soon" with no content behind it.
- Book-derived content. The Dr. Ranj book has not been used as a source. Content
  is general physiology and needs expert review before publication.

## 5. Brain and Senses Lab (ages about 3 to 4½: play, not quizzes)

Status key: **missing** = no file in the repo. A simple drawing is shown until the artwork exists.
The engine does not read these paths yet. Replacing a file will not change the game logic.

| Asset ID | Expected path | Used in | Dimensions | Status | Tap targets |
|---|---|---|---|---|---|
| `brain-side` | `src/assets/human-biology/brain-senses/brain-side.webp` | Brain Parts | 1000 × 825, transparent | **missing** (drawn placeholder) | Four parts in `BrainPicture` (`BrainSensesLab.tsx`) |
| `senses-friends` | `src/assets/human-biology/brain-senses/senses-friends.webp` | Sense Friends | 1000 × 1000, transparent | **missing** (emoji placeholder) | Five friends: eye, ear, nose, tongue, hand |
| `signal-body` | `src/assets/human-biology/brain-senses/signal-body.webp` | Send a Message | 1000 × 2000, transparent | **missing** (uses the Atlas body shapes) | Paths `SENSORY_PATH` and `EYE_PATH` in `BrainSensesLab.tsx` |
| `knee-leg` | `src/assets/human-biology/brain-senses/knee-leg.webp` | Knee Kick | 1000 × 1000, transparent | **missing** (drawn placeholder) | Knee button and wave button |

**Audio is placeholder.** All narration uses the device English voice through `speak()` in `src/lib/voice.ts`, which is the robotic voice the spec asks us to avoid. The Kitchen game's Farah recordings exist as `KITCHEN_VOICE` clips, but they are hosted on Lovable URLs and only cover Kitchen phrases. New recordings for this lab are needed. Sound effects come from `sfx()` in `src/lib/explorerSfx.ts`, and the Copy Me notes are synthesized in the component.
