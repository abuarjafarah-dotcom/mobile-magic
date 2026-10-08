// Maps curriculum content to the uploaded Gemini art sheets. Cells are counted left→right, top→bottom.
// IMPORTANT: sheets marked `bakedCheckerboard` are flat JPEGs with the checkerboard painted in — they have no
// transparency. Never show those cells directly; they need real transparent PNG exports (or a careful cut-out) first.
import s3070 from "@/assets/curriculum/sheet-3070.jpeg.asset.json";
import s3072 from "@/assets/curriculum/sheet-3072.jpeg.asset.json";
import s3076 from "@/assets/curriculum/sheet-3076.jpeg.asset.json";
import s3080 from "@/assets/curriculum/sheet-3080.jpeg.asset.json";
import activityIcons from "@/assets/curriculum/activity-icons-transparent.png";
import characterPoses from "@/assets/curriculum/character-poses-transparent.png";
import letterArt from "@/assets/curriculum/letter-art-transparent.png";
import progressIcons from "@/assets/curriculum/progress-icons-transparent.png";
import rewards from "@/assets/curriculum/rewards-transparent.png";
import scienceIcons from "@/assets/curriculum/science-icons-transparent.png";
import vocabularyObjects from "@/assets/curriculum/vocabulary-objects-transparent.png";

export type Sheet = { id: string; url: string; bakedCheckerboard: boolean; cols: number; cells: string[]; note?: string };

export const sheets: Record<string, Sheet> = {
  "sheet-3078": { id: "sheet-3078", url: letterArt, bakedCheckerboard: false, cols: 5, note: "Transparent cut-outs. Cell 23 repeats ل; cell 27 looks like و rather than هـ.",
    cells: ["ا","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","ل?","م","ن","ه","و?","و","ي"] },
  "sheet-3075": { id: "sheet-3075", url: vocabularyObjects, bakedCheckerboard: false, cols: 5, note: "Transparent object cut-outs. Milk is mapped to حليب only.",
    cells: ["بطة","بطيخ","باب","بيت","بقرة","علم","كتاب","بوظة","بالون","خبز","حليب","بيضة","إجاص","قيثارة","كاميرا","جرس","هدية","طائرة ورقية","تاج","فرشاة"] },
  "sheet-3077": { id: "sheet-3077", url: scienceIcons, bakedCheckerboard: false, cols: 5, note: "Transparent science cut-outs; mapped by what is drawn.",
    cells: ["observe","experiment","sort","predict","predict-2","compare-balance","build","push","pull","push-pull-hand","magnet","materials","materials-wood-foil","water","rocks","sun","moon","day","night","night-2","seasons","nature","discovery"] },
  "sheet-3071": { id: "sheet-3071", url: activityIcons, bakedCheckerboard: false, cols: 5,
    cells: ["letter","vocabulary","reading","listening","speaking","writing","sentence","question-answer","game","story","story-completed","completed","current","discovery","reward"] },
  "sheet-3079": { id: "sheet-3079", url: progressIcons, bakedCheckerboard: false, cols: 4, note: "Transparent alternate node set; duplicate of 3071 styles.",
    cells: ["letter","vocabulary","reading","listening","speaking","writing","sentence","question-answer","game","story","completed","current","current-2","discovery","reward"] },
  "sheet-3073": { id: "sheet-3073", url: rewards, bakedCheckerboard: false, cols: 3,
    cells: ["golden-star","crescent-moon","flower","butterfly","bird","leaf","treasure-chest","glowing-letter","rainbow-sparkle","lantern","lantern-2","discovery-badge","map-marker-complete"] },
  "sheet-3074": { id: "sheet-3074", url: characterPoses, bakedCheckerboard: false, cols: 5, note: "Transparent poses. Rows 1–2 Hamad, rows 3–4 Talal. No Yousef poses.",
    cells: ["hamad-walking","hamad-pointing","hamad-map","hamad-celebrating","hamad-discovering","hamad-reading","hamad-listening","hamad-thinking","hamad-waving","hamad-exploring",
            "talal-walking","talal-pointing","talal-map","talal-celebrating","talal-discovering","talal-reading","talal-listening","talal-thinking","talal-waving","talal-exploring"] },
  "sheet-3076": { id: "sheet-3076", url: s3076.url, bakedCheckerboard: false, cols: 3, note: "Opaque scene backgrounds — safe to crop and use as backdrops.",
    cells: ["home","kitchen","garden","farm","animal-world","fruit-garden","market","beach","beach-2","ocean","mountain","mountain-2","park-2","park","school","bedroom","sky-night","transport"] },
  "sheet-3070": { id: "sheet-3070", url: s3070.url, bakedCheckerboard: false, cols: 1, cells: ["arabic-world-map"] },
  "sheet-3072": { id: "sheet-3072", url: s3072.url, bakedCheckerboard: false, cols: 1, cells: ["adventure-path-map"] },
  "sheet-3080": { id: "sheet-3080", url: s3080.url, bakedCheckerboard: false, cols: 1, note: "Letter-ب scene; some printed labels are misspelled (e.g. دبذوب, ربدة) and must not be used as text.", cells: ["ba-scene"] },
};

/** Existing single-file character art already used in the app (transparent PNG cut-outs live in src/assets/building). */
export const characters = {
  hamad: { portrait: "@/assets/hamad.jpg.asset.json", poses: ["celebrating", "holding", "placing", "pointing", "thinking"] },
  talal: { portrait: "@/assets/talal.jpg.asset.json", poses: ["celebrating", "holding", "placing", "pointing", "thinking", "watching"] },
  yousef: { portrait: "@/assets/yousef.jpg.asset.json", poses: [] as string[] },
} as const;

export const cellOf = (sheetId: string, label: string) => {
  const s = sheets[sheetId];
  const cell = s ? s.cells.indexOf(label) : -1;
  return s && cell >= 0 ? { sheet: s, cell, row: Math.floor(cell / s.cols), col: cell % s.cols } : null;
};
