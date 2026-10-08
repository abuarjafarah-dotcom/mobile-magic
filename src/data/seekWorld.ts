import kitchenBg from "@/assets/seek/seek-kitchen.jpg.asset.json";
import voice from "@/assets/seek/seek-voice.mp3.asset.json";
import { KITCHEN_VOICE } from "@/data/kitchenVoice";

/** One master recording used as an audio sprite: [start, end] seconds. */
export const SEEK_SPRITE_URL = voice.url;
export const SEEK_SPRITE: Record<string, [number, number]> = {
  intro: [0, 1.7], ready: [1.94, 2.6], "yalla-dawwer": [2.88, 3.93], "dawwer-mneeh": [4.14, 5.05],
  wenha: [5.28, 5.85], shater: [6.08, 6.92], mumtaz: [7.06, 7.99], la2ataha: [8.16, 8.84], bravo: [9.0, 10.07],
  "q-apple": [10.33, 11.27], "q-tomato": [11.5, 12.41], "q-cucumber": [12.63, 13.51], "q-eggplant": [13.7, 14.73],
  "q-onion": [14.95, 15.8], "q-garlic": [16.0, 16.79], "q-lemon": [17.03, 17.94], "q-olives": [18.16, 19.06],
  "q-bread": [19.3, 20.15], "q-egg": [20.34, 21.11], "q-spoon": [21.32, 22.17], "q-fork": [22.39, 23.23],
  "q-knife": [23.43, 24.36], "q-cup": [24.58, 25.27], "q-plate": [25.61, 26.39], "q-pot": [26.6, 27.45],
  mashallah: [45.92, 48.15], "another": [48.35, 49.84], "next-round": [50.12, 51.6], "again": [51.84, 53.2],
};

export type Box = { x: number; y: number; w: number; h: number }; // % of the image, centre-based
export type SeekObject = {
  id: string; ar: string; en: string; boxes: Box[];
  /** sprite key for "وين ...؟"; or a recorded clip URL for the name only */
  ask?: string | undefined; nameClip?: string | undefined;
  colors: string[]; tags: string[]; difficulty: 1 | 2 | 3;
};
export type SeekMode = "find" | "listen" | "describe" | "color";
export type Clue = { id: string; ar: string; match: (o: SeekObject) => boolean };
export type SeekScene = { id: string; ar: string; en: string; icon: string; bg: string; ratio: number; objects: SeekObject[]; ready: boolean };

const o = (id: string, ar: string, en: string, boxes: Box[], colors: string[], tags: string[], difficulty: 1 | 2 | 3, extra: Partial<SeekObject> = {}): SeekObject =>
  ({ id, ar, en, boxes, colors, tags, difficulty, ask: `q-${id}`, ...extra });

export const KITCHEN_OBJECTS: SeekObject[] = [
  o("tomato", "بَنْدُورَة", "Tomato", [{ x: 46.5, y: 64, w: 8, h: 12 }], ["red"], ["veg"], 1),
  o("cucumber", "خِيَار", "Cucumber", [{ x: 54.5, y: 71, w: 13, h: 11 }], ["green"], ["veg"], 1),
  o("eggplant", "بَاذِنْجَان", "Eggplant", [{ x: 60, y: 65, w: 15, h: 9 }], ["purple"], ["veg"], 1),
  o("onion", "بَصَل", "Onion", [{ x: 61.6, y: 73.5, w: 6, h: 11 }], ["purple"], ["veg"], 2),
  o("garlic", "ثُوم", "Garlic", [{ x: 65.3, y: 72, w: 5, h: 9 }], ["white"], ["veg"], 2),
  o("lemon", "لَيْمُون", "Lemon", [{ x: 68.2, y: 70.3, w: 6, h: 9 }], ["yellow"], ["fruit"], 1),
  o("olives", "زَيْتُون", "Olives", [{ x: 82, y: 80, w: 21, h: 15 }], ["green", "black"], ["food"], 1),
  o("apple", "تُفَّاحَة", "Apple", [{ x: 56.5, y: 46.5, w: 5, h: 8 }, { x: 68, y: 86, w: 7, h: 12 }, { x: 4, y: 22.5, w: 5, h: 7 }], ["red"], ["fruit"], 1),
  o("bread", "خُبْز", "Bread", [{ x: 91.5, y: 56, w: 12, h: 11 }], ["brown"], ["food"], 1),
  o("egg", "بَيْضَة", "Egg", [{ x: 58.8, y: 48.8, w: 4, h: 6 }, { x: 80, y: 91.5, w: 7, h: 8 }], ["white"], ["food"], 2),
  o("spoon", "مِلْعَقَة", "Spoon", [{ x: 98, y: 33, w: 3.5, h: 18 }, { x: 83, y: 41, w: 8, h: 10 }], ["silver"], ["tool", "eat"], 3),
  o("fork", "شَوْكَة", "Fork", [{ x: 95, y: 33, w: 3.5, h: 18 }], ["silver"], ["tool", "eat"], 3),
  o("knife", "سِكِّينَة", "Knife", [{ x: 92.6, y: 33, w: 3.5, h: 20 }], ["silver"], ["tool"], 3),
  o("cup", "كُوب", "Cup", [{ x: 16.7, y: 62, w: 6.5, h: 8 }], ["white"], ["drink"], 2),
  o("plate", "صَحْن", "Plate", [{ x: 18.5, y: 68.5, w: 11, h: 7 }], ["white"], ["eat"], 2),
  o("pot", "طَنْجَرَة", "Cooking pot", [{ x: 77, y: 47.5, w: 16, h: 13 }], ["orange"], ["cook"], 1),
  o("salt", "مِلْح", "Salt", [{ x: 48.3, y: 38.5, w: 4.5, h: 9 }], ["white"], ["food"], 3, { ask: undefined, nameClip: KITCHEN_VOICE["salt"] }),
  o("oil", "زَيْت", "Oil", [{ x: 65.4, y: 41, w: 7, h: 16 }], ["silver"], ["cook"], 2, { ask: undefined }),
  o("rice", "أَرُزّ", "Rice", [{ x: 54.9, y: 41, w: 9, h: 9 }, { x: 63, y: 23, w: 4, h: 9 }], ["white"], ["food"], 2, { ask: undefined, nameClip: KITCHEN_VOICE["rice"] }),
  o("chicken", "دَجَاج", "Chicken", [{ x: 20.5, y: 90, w: 14, h: 13 }], ["pink"], ["food"], 1, { ask: undefined, nameClip: KITCHEN_VOICE["chicken"] }),
];

export const CLUES: Record<"describe" | "color", Clue[]> = {
  describe: [
    { id: "cook", ar: "دَوِّر عَلَى إِشِي بِنُطْبُخ فِيه", match: (x) => x.tags.includes("cook") },
    { id: "drink", ar: "دَوِّر عَلَى إِشِي بِنِشْرَب فِيه", match: (x) => x.tags.includes("drink") },
    { id: "fruit", ar: "دَوِّر عَلَى فَاكْهَة", match: (x) => x.tags.includes("fruit") },
    { id: "veg", ar: "دَوِّر عَلَى خُضْرَة", match: (x) => x.tags.includes("veg") },
    { id: "eat", ar: "دَوِّر عَلَى إِشِي بِنُوكُل فِيه", match: (x) => x.tags.includes("eat") },
  ],
  color: [
    { id: "red", ar: "دَوِّر عَلَى إِشِي أَحْمَر", match: (x) => x.colors.includes("red") },
    { id: "green", ar: "دَوِّر عَلَى إِشِي أَخْضَر", match: (x) => x.colors.includes("green") },
    { id: "yellow", ar: "دَوِّر عَلَى إِشِي أَصْفَر", match: (x) => x.colors.includes("yellow") },
    { id: "purple", ar: "دَوِّر عَلَى إِشِي بَنَفْسَجِي", match: (x) => x.colors.includes("purple") },
    { id: "white", ar: "دَوِّر عَلَى إِشِي أَبْيَض", match: (x) => x.colors.includes("white") },
  ],
};

export const SEEK_SCENES: SeekScene[] = [
  { id: "kitchen", ar: "الْمَطْبَخ", en: "Kitchen", icon: "🍳", bg: kitchenBg.url, ratio: 1376 / 768, objects: KITCHEN_OBJECTS, ready: true },
  { id: "home", ar: "الْبَيْت", en: "Home", icon: "🏠", bg: "", ratio: 1376 / 768, objects: [], ready: false },
  { id: "market", ar: "السُّوق", en: "Market", icon: "🛒", bg: "", ratio: 1376 / 768, objects: [], ready: false },
  { id: "garden", ar: "الْحَدِيقَة", en: "Garden", icon: "🌳", bg: "", ratio: 1376 / 768, objects: [], ready: false },
  { id: "school", ar: "الْمَدْرَسَة", en: "School", icon: "🏫", bg: "", ratio: 1376 / 768, objects: [], ready: false },
];

export const PRAISE = ["shater", "mumtaz", "la2ataha", "bravo", "mashallah"];
