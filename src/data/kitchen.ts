// Palestinian Kitchen data. UI components read from here; never hard-code recipes in components.
const pics = import.meta.glob("@/assets/kitchen/*.png", { eager: true, import: "default" }) as Record<string, string>;
export const kitchenPic = (name: string) => pics[Object.keys(pics).find((k) => k.endsWith(`/${name}.png`)) ?? ""] ?? "";

export type Ingredient = { id: string; ar: string; en: string };
export const INGREDIENTS: Record<string, Ingredient> = Object.fromEntries(([
  ["rice", "أَرُزّ", "Rice"], ["eggplant", "باذِنْجان", "Eggplant"], ["potato", "بَطاطا", "Potato"], ["onion", "بَصَل", "Onion"],
  ["garlic", "ثوم", "Garlic"], ["tomato", "طَماطِم", "Tomato"], ["chicken", "دَجاج", "Chicken"], ["meat", "لَحْم", "Meat"],
  ["molokhia", "مُلوخِيَّة", "Molokhia"], ["cabbage", "مَلْفوف", "Cabbage"], ["flour", "طَحين", "Flour"], ["water", "ماء", "Water"],
  ["olive-oil", "زَيْتُ الزَّيْتون", "Olive oil"], ["zaatar", "زَعْتَر", "Za'atar"], ["sumac", "سُمّاق", "Sumac"], ["salt", "مِلْح", "Salt"],
  ["pepper", "فُلْفُل", "Pepper"], ["cheese", "جُبْنَة", "Cheese"], ["bread", "خُبْز", "Bread"], ["lemon", "لَيْمون", "Lemon"],
  ["olives", "زَيْتون", "Olives"], ["cucumber", "خِيار", "Cucumber"], ["parsley", "بَقْدونِس", "Parsley"], ["mint", "نَعْناع", "Mint"],
  ["carrot", "جَزَر", "Carrot"], ["chickpeas", "حُمُّص", "Chickpeas"], ["laban", "لَبَن", "Yogurt"], ["tahini", "طَحينَة", "Tahini"],
  ["pine-nuts", "صَنَوْبَر", "Pine nuts"], ["lentils", "عَدَس", "Lentils"], ["sesame", "سِمْسِم", "Sesame"],
] as const).map(([id, ar, en]) => [id, { id, ar, en }]));

export type Recipe = { id: string; ar: string; en: string; dish: string; ingredients: string[]; intro: string };
export const RECIPES: Recipe[] = [
  { id: "maqluba", ar: "مَقْلوبَة", en: "Maqluba", dish: "dish-maqluba", ingredients: ["rice", "eggplant", "potato", "chicken", "onion", "pine-nuts", "salt"], intro: "نَقْلِبُ الْقِدْرَ فَتَظْهَرُ الْمَقْلوبَة!" },
  { id: "manakish", ar: "مَناقيش", en: "Manakish", dish: "dish-manakish", ingredients: ["flour", "water", "zaatar", "olive-oil", "cheese", "sesame"], intro: "نَعْجِنُ الْعَجينَ وَنَضَعُ الزَّعْتَر." },
  { id: "molokhia", ar: "مُلوخِيَّة", en: "Molokhia", dish: "dish-molokhia-dish", ingredients: ["molokhia", "chicken", "garlic", "lemon", "rice", "water"], intro: "مُلوخِيَّةٌ خَضْراءُ مَعَ الْأَرُزّ." },
  { id: "musakhan", ar: "مُسَخَّن", en: "Musakhan", dish: "dish-musakhan", ingredients: ["bread", "chicken", "onion", "sumac", "olive-oil", "pine-nuts"], intro: "خُبْزٌ وَبَصَلٌ وَسُمّاقٌ وَدَجاج." },
  { id: "malfouf", ar: "مَلْفوف", en: "Stuffed cabbage", dish: "dish-malfouf", ingredients: ["cabbage", "rice", "meat", "garlic", "lemon", "tomato"], intro: "نَلُفُّ وَرَقَ الْمَلْفوفِ بِالْأَرُزّ." },
  { id: "lentil-soup", ar: "شوربَةُ عَدَس", en: "Lentil soup", dish: "dish-lentil-soup", ingredients: ["lentils", "onion", "carrot", "water", "lemon", "salt"], intro: "شوربَةٌ دافِئَةٌ لِلْعائِلَة." },
];

export type ActionType = "drag" | "tap" | "wash" | "cut" | "pour" | "stir" | "sprinkle" | "knead" | "roll" | "arrange" | "serve";
export type ToolId = "bowl" | "board" | "knife" | "pot" | "pan" | "spoon" | "tray" | "stove" | "oven" | "water-tap" | "spices" | "rolling-pin" | "dough";
export const TOOLS: Record<string, { id: string; ar: string; en: string; icon: string }> = Object.fromEntries(([
  ["bowl", "وِعاء", "Bowl", "🥣"], ["board", "لَوْحُ التَّقْطيع", "Cutting board", "🪵"], ["knife", "سِكّين", "Knife", "🔪"],
  ["pot", "قِدْر", "Pot", "🍲"], ["pan", "مِقْلاة", "Pan", "🍳"], ["spoon", "مِلْعَقَة", "Spoon", "🥄"], ["tray", "صينِيَّة", "Tray", "🍽️"],
  ["stove", "موقِد", "Stove", "🔥"], ["oven", "فُرْن", "Oven", "♨️"], ["water-tap", "حَنَفِيَّة", "Tap", "🚰"],
  ["spices", "بَهارات", "Spices", "🧂"], ["rolling-pin", "شَوْبَك", "Rolling pin", "🥖"], ["dough", "عَجين", "Dough", "🫓"],
] as const).map(([id, ar, en, icon]) => [id, { id, ar, en, icon }]));

/** One step = one action on one thing. `ar` is the short instruction (TTS hook); `done` is what the child sees after. */
export type Step = { phase: "prep" | "cook" | "serve"; action: ActionType; target: string; tool?: ToolId; ar: string; en: string; done: string };
const s = (phase: Step["phase"], action: ActionType, target: string, tool: ToolId | undefined, ar: string, en: string, done: string): Step => ({ phase, action, target, ...(tool ? { tool } : {}), ar, en, done });

export const RECIPE_STEPS: Record<string, Step[]> = {
  maqluba: [
    s("prep", "wash", "rice", "bowl", "اِغْسِلِ الْأَرُزّ.", "Wash the rice.", "الْأَرُزُّ نَظيف!"),
    s("prep", "cut", "eggplant", "knife", "قَطِّعِ الْباذِنْجان.", "Cut the eggplant.", "شَرائِحُ باذِنْجان!"),
    s("prep", "cut", "potato", "knife", "قَطِّعِ الْبَطاطا.", "Cut the potato.", "بَطاطا مُقَطَّعَة!"),
    s("cook", "arrange", "chicken", "pot", "رَتِّبِ الدَّجاجَ فِي الْقِدْر.", "Arrange the chicken in the pot.", "طَبَقَةٌ أولى!"),
    s("cook", "pour", "water", "pot", "صُبَّ الْماء.", "Pour the water.", "الْقِدْرُ يَغْلي!"),
    s("serve", "serve", "pine-nuts", "tray", "اِقْلِبِ الْقِدْرَ وَزَيِّنْ بِالصَّنَوْبَر.", "Flip the pot and add pine nuts.", "مَقْلوبَةٌ لَذيذَة!"),
  ],
  manakish: [
    s("prep", "pour", "flour", "bowl", "ضَعِ الطَّحينَ فِي الْوِعاء.", "Put flour in the bowl.", "طَحينٌ أَبْيَض!"),
    s("prep", "pour", "water", "bowl", "صُبَّ الْماء.", "Pour the water.", "نَخْلِطُ!"),
    s("prep", "knead", "dough", undefined, "اِعْجِنِ الْعَجين.", "Knead the dough.", "عَجينٌ طَرِيّ!"),
    s("cook", "roll", "dough", "rolling-pin", "اُفْرُدِ الْعَجين.", "Roll the dough.", "دائِرَةٌ كَبيرَة!"),
    s("cook", "sprinkle", "zaatar", undefined, "رُشَّ الزَّعْتَرَ وَالزَّيْت.", "Sprinkle za'atar and oil.", "أَخْضَرُ جَميل!"),
    s("serve", "serve", "zaatar", "oven", "اِخْبِزْ فِي الْفُرْن.", "Bake in the oven.", "مَناقيشُ ساخِنَة!"),
  ],
  molokhia: [
    s("prep", "wash", "molokhia", "bowl", "اِغْسِلِ الْمُلوخِيَّة.", "Wash the molokhia.", "أَوْراقٌ نَظيفَة!"),
    s("prep", "cut", "garlic", "knife", "قَطِّعِ الثّوم.", "Chop the garlic.", "ثومٌ صَغير!"),
    s("cook", "pour", "water", "pot", "صُبَّ الْماءَ فِي الْقِدْر.", "Pour water in the pot.", "الْماءُ يَغْلي!"),
    s("cook", "stir", "molokhia", "spoon", "حَرِّكِ الْمُلوخِيَّة.", "Stir the molokhia.", "رائِحَةٌ طَيِّبَة!"),
    s("serve", "serve", "rice", "tray", "قَدِّمْها مَعَ الْأَرُزِّ وَاللَّيْمون.", "Serve with rice and lemon.", "مُلوخِيَّةٌ جاهِزَة!"),
  ],
  musakhan: [
    s("prep", "cut", "onion", "knife", "قَطِّعِ الْبَصَل.", "Slice the onion.", "حَلَقاتُ بَصَل!"),
    s("cook", "pour", "olive-oil", "pan", "صُبَّ زَيْتَ الزَّيْتون.", "Pour the olive oil.", "زَيْتٌ ذَهَبِيّ!"),
    s("cook", "stir", "onion", "pan", "حَرِّكِ الْبَصَل.", "Stir the onion.", "بَصَلٌ ناعِم!"),
    s("cook", "sprinkle", "sumac", undefined, "رُشَّ السُّمّاق.", "Sprinkle the sumac.", "لَوْنٌ أَحْمَر!"),
    s("serve", "arrange", "bread", "tray", "ضَعِ الدَّجاجَ عَلى الْخُبْز.", "Put the chicken on the bread.", "مُسَخَّنٌ شَهِيّ!"),
  ],
  malfouf: [
    s("prep", "wash", "cabbage", "bowl", "اِغْسِلِ الْمَلْفوف.", "Wash the cabbage.", "وَرَقٌ نَظيف!"),
    s("prep", "stir", "rice", "bowl", "اُخْلُطِ الْأَرُزَّ وَاللَّحْم.", "Mix rice and meat.", "حَشْوَةٌ جاهِزَة!"),
    s("cook", "roll", "cabbage", undefined, "لُفَّ وَرَقَ الْمَلْفوف.", "Roll the cabbage leaves.", "أَصابِعُ مَلْفوف!"),
    s("cook", "arrange", "cabbage", "pot", "رَتِّبْها فِي الْقِدْر.", "Arrange them in the pot.", "صَفٌّ مُرَتَّب!"),
    s("serve", "sprinkle", "lemon", "tray", "أَضِفِ الثّومَ وَاللَّيْمون.", "Add garlic and lemon.", "مَلْفوفٌ لَذيذ!"),
  ],
  "lentil-soup": [
    s("prep", "wash", "lentils", "bowl", "اِغْسِلِ الْعَدَس.", "Wash the lentils.", "عَدَسٌ نَظيف!"),
    s("prep", "cut", "carrot", "knife", "قَطِّعِ الْجَزَر.", "Cut the carrot.", "جَزَرٌ صَغير!"),
    s("cook", "drag", "onion", "pot", "ضَعِ الْبَصَلَ فِي الْقِدْر.", "Put the onion in the pot.", "فِي الْقِدْر!"),
    s("cook", "pour", "water", "pot", "صُبَّ الْماء.", "Pour the water.", "الْقِدْرُ يَغْلي!"),
    s("cook", "stir", "lentils", "spoon", "حَرِّكِ الشّوربَة.", "Stir the soup.", "شوربَةٌ ناعِمَة!"),
    s("serve", "sprinkle", "lemon", "bowl", "اِعْصُرِ اللَّيْمونَ وَقَدِّم.", "Squeeze lemon and serve.", "شوربَةٌ دافِئَة!"),
  ],
};
