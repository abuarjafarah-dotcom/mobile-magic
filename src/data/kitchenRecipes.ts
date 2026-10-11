// Cooking-engine recipe data. The engine (src/components/kitchen/CookingStage.tsx) reads only this file;
// add a dish by adding a Recipe here — never by hard-coding steps in components.
import { kitchenPic } from "@/data/kitchen";

const art = import.meta.glob("@/assets/kitchen/*/*.png", { eager: true, import: "default" }) as Record<string, string>;
/** Kitchen-only art: "cast/hamad-idle", "maqluba/final", "tools/pot-stove". Falls back to ingredient/dish cut-outs. */
export const kart = (key: string) => art[Object.keys(art).find((k) => k.endsWith(`/${key}.png`)) ?? ""] ?? kitchenPic(key);

/** `v` = recorded voice clip ids (src/data/kitchenVoice.ts) played in order for Arabic; text is never read by TTS. */
export type Line = { ar: string; en: string; v?: string[] };
export type Vessel = "bowl" | "board" | "pot" | "dough" | "tray" | "flip" | "plate" | "pan" | "table";
export type Cook = "hamad" | "talal" | "teta";
/** What a vessel holds. Steps can patch it with `after` (e.g. leaves melt into green soup). */
export type VState = { layers: string[]; scatter: { img: string; x: number; y: number; r: number }[]; liquid?: string; cooked?: boolean };
export type Interaction =
  | { kind: "wash"; item: string; taps: number }
  | { kind: "chop"; item: string; result: string; taps: number }
  /** `into` = picture left in the vessel when it differs from what is dragged (e.g. a bowl of leaves → leaves). */
  | { kind: "add"; item: string; into?: string }
  | { kind: "pour"; item: "water" | "olive-oil"; color: string }
  | { kind: "stir"; taps: number }
  | { kind: "knead"; taps: number }
  | { kind: "roll"; taps: number }
  | { kind: "sprinkle"; item: string; taps: number }
  | { kind: "cook"; mode: "simmer" | "fry" | "bake"; seconds: number }
  | { kind: "flip" }
  | { kind: "serve" }
  /** Tap the vessel to lift a (cooked) item out; `show` is the picture that flies out. */
  | { kind: "lift"; item: string; show: string }
  /** Drag the whole contents of another slot (e.g. the small pan) into this vessel; `item` is the layer it leaves. */
  | { kind: "transfer"; from: string; item: string };
export type Step = {
  vessel: Vessel; do: Interaction; say: Line; cheer: Line; who: Cook;
  /** State key when one vessel type is used twice (e.g. a second pot for rice). Defaults to `vessel`. */ slot?: string;
  /** Patch applied to this slot when the step completes (visual transformation). */ after?: Partial<VState>;
};
export type Recipe = {
  id: string; name: Line; dish: string; ingredients: string[]; intro: Line; steps: Step[]; done: Line;
  /** Picture the vessel turns into once cooking finishes (optional). */ cookedArt?: string;
  /** Picture for the recipe-picker card (defaults to dish). */ card?: string;
  /** Characters on the [left, right] of the stage. Defaults to Hamad & Talal. */ cast?: [Cook, Cook];
};

const CHEERS = [["shater"], ["mumtaz"], ["wow"], ["tamam"], ["shatrin"], ["ahsantum"], ["m-bravo"], ["mashallah"]];
let ci = 0;
const ICLIP: Record<string, string> = { chicken: "chicken", eggplant: "eggplant", "eggplant-sliced": "eggplant", potato: "potato", "potato-cubed": "potato", rice: "rice", water: "water", garlic: "garlic", "garlic-minced": "garlic", onion: "onion", "onion-sliced": "onion", "lemon-sliced": "lemon", lemon: "lemon", "arabic-bread": "bread", cabbage: "malfouf", molokhia: "molokhia", salt: "salt" };
const n = (id: string) => (ICLIP[id] ? [ICLIP[id]] : []);
/** Default voice for an action, built from the recorded phrases. */
function autoVoice(d: Interaction): string[] {
  switch (d.kind) {
    case "wash": return ["yalla", ...n(d.item)];
    case "chop": return ["cut", ...n(d.item)];
    case "add": return ["hutta", ...n(d.item)];
    case "pour": return ["hutta", ...(d.item === "water" ? ["water"] : [])];
    case "stir": return ["nharrik"];
    case "knead": case "roll": return ["dorak"];
    case "sprinkle": return ["shufu"];
    case "cook": return [d.mode === "bake" ? "oven" : "stove"];
    case "flip": return ["m-n2libha"];
    case "serve": return ["ready"];
    case "lift": return [...n(d.item)];
    case "transfer": return ["hutta"];
    default: return [];
  }
}
const st = (vessel: Vessel, d: Interaction, sayAr: string, sayEn: string, cheerAr: string, cheerEn: string, who: Step["who"] = "hamad", sv?: string[], cv?: string[]): Step =>
  ({ vessel, do: d, say: { ar: sayAr, en: sayEn, v: sv ?? autoVoice(d) }, cheer: { ar: cheerAr, en: cheerEn, v: cv ?? CHEERS[ci++ % CHEERS.length]! }, who });
/** Object-style step builder: [ar, en, clips] tuples, plus optional slot/after. */
const sx = (vessel: Vessel, d: Interaction, say: [string, string, string[]], cheer: [string, string, string[]], who: Cook, o: { slot?: string; after?: Partial<VState> } = {}): Step =>
  ({ vessel, do: d, say: { ar: say[0], en: say[1], v: say[2] }, cheer: { ar: cheer[0], en: cheer[1], v: cheer[2] }, who, ...o });
const V = ["yalla-natbukh"], DONE = ["khalasna", "akl-tayyib", "sahtein-wafia"];

export const COOK_RECIPES: Recipe[] = [
  {
    id: "maqluba", name: { ar: "مَقْلوبَة", en: "Maqluba" }, dish: "maqluba/final", cookedArt: "maqluba/pot-full",
    ingredients: ["chicken", "eggplant", "potato", "rice", "water", "pine-nuts"],
    intro: { ar: "أَهْلَيْن حَبيبي! يَلّا نِعْمَل مَقْلوبَة", en: "Hi sweetie! Let's make maqluba!", v: ["m-ahlein", "m-yalla"] },
    done: { ar: "رِيحِتْها طَيْبَة! صَحْتَين وَعافْيَة", en: "It smells so good! Enjoy!", v: ["m-tayyba", "m-sahtein"] },
    steps: [
      st("pot", { kind: "add", item: "chicken" }, "أَوَّل إِشي الْجاج", "First, the chicken", "شاطِر", "Well done", "hamad", ["m-jaj"], ["shater"]),
      st("board", { kind: "chop", item: "eggplant", result: "eggplant-sliced", taps: 4 }, "نْقَطِّع الْبِتِنْجان", "Let's cut the eggplant", "نِقْلي بِالزَّيْت", "We fry it in oil", "talal", ["m-betinjan"], ["m-zeit"]),
      st("pot", { kind: "add", item: "eggplant-sliced" }, "فوق الْجاج", "On top of the chicken", "مُمْتاز", "Great", "hamad", ["m-fo2"], ["mumtaz"]),
      st("board", { kind: "chop", item: "potato", result: "potato-cubed", taps: 4 }, "قَطِّع بَطاطا", "Cut the potato", "هيك تَمام", "That's it", "talal", ["cut", "potato"], ["tamam"]),
      st("pot", { kind: "add", item: "potato-cubed" }, "حُطّ هون بَطاطا", "Put the potato here", "شاطْرين", "Well done", "hamad", ["hutta", "potato"], ["shatrin"]),
      st("bowl", { kind: "wash", item: "rice", taps: 4 }, "يَلّا أَرُزّ", "Wash the rice", "صَحّ", "Right", "talal", ["yalla", "rice"], ["sah"]),
      st("pot", { kind: "add", item: "rice" }, "وْهَلَّأ الرُّزّ", "And now the rice", "واو", "Wow", "hamad", ["m-ruz"], ["wow"]),
      st("pot", { kind: "sprinkle", item: "salt", taps: 3 }, "شْوَيِّة بْهارات", "A little spice", "مُمْتاز", "Great", "talal", ["m-baharat"], ["mumtaz"]),
      st("pot", { kind: "pour", item: "water", color: "oklch(0.8 0.08 230 / .55)" }, "وْمَيّ", "And water", "شاطِر", "Well done", "hamad", ["m-mayy"], ["shater"]),
      st("pot", { kind: "cook", mode: "simmer", seconds: 5 }, "نُطْبُخْها عَلى نار هادْيَة", "We cook it on a low fire", "شو هالرّيحَة الْحِلْوَة! اسْتَوَت", "What a lovely smell! It's cooked", "talal", ["m-nar"], ["m-riha", "m-istawat"]),
      st("flip", { kind: "flip" }, "هات الصّينِيَّة، يَلّا نِقْلِبْها", "Bring the tray, let's flip it", "دُقّ دُقّ دُقّ! ما شاءَ الله", "Knock knock knock! Mashallah", "hamad", ["m-siniyya", "m-n2libha"], ["m-da2", "m-nshil", "m-mashallah"]),
      st("plate", { kind: "sprinkle", item: "pine-nuts", taps: 3 }, "نْزَيِّنْها بِالْمْكَسَّرات", "Decorate it with nuts", "برافو", "Bravo", "talal", ["m-mkassarat"], ["m-bravo"]),
    ],
  },
  {
    id: "musakhan", name: { ar: "مُسَخَّن", en: "Musakhan" }, dish: "dish-musakhan",
    ingredients: ["onion", "olive-oil", "sumac", "chicken", "arabic-bread", "pine-nuts"],
    intro: { ar: "الْيَوْمَ نَطْبُخُ الْمُسَخَّن. بَصَلٌ وَسُمّاقٌ وَخُبْزٌ طابون", en: "Today we make musakhan. Onion, sumac and taboon bread!" , v: [...V, "musakhan", "jahzin"] },
    done: { ar: "مُسَخَّنٌ شَهِيّ! صَحْتَين", en: "Delicious musakhan! Enjoy!" , v: DONE },
    steps: [
      st("board", { kind: "chop", item: "onion", result: "onion-sliced", taps: 5 }, "قَطِّعِ الْبَصَل", "Slice the onion", "حَلَقاتُ بَصَل", "Onion rings", "talal"),
      st("pot", { kind: "pour", item: "olive-oil", color: "oklch(0.82 0.15 95 / .6)" }, "صُبَّ زَيْتَ الزَّيْتونِ فِي الْقِدْر", "Pour olive oil into the pot", "زَيْتٌ ذَهَبِيّ", "Golden oil"),
      st("pot", { kind: "add", item: "onion-sliced" }, "ضَعِ الْبَصَلَ فِي الزَّيْت", "Put the onion in the oil", "بَصَلٌ فِي الْقِدْر", "Onion in the pot", "talal"),
      st("pot", { kind: "cook", mode: "fry", seconds: 4 }, "اِضْغَطْ عَلَى النّار", "Tap the fire", "الْبَصَلُ يَطْبُخ", "The onion is cooking"),
      st("pot", { kind: "stir", taps: 5 }, "حَرِّكِ الْبَصَل", "Stir the onion", "بَصَلٌ ناعِم", "Soft onion", "talal"),
      st("pot", { kind: "sprinkle", item: "sumac", taps: 3 }, "رُشَّ السُّمّاق", "Sprinkle the sumac", "لَوْنٌ أَحْمَر", "A red color"),
      st("tray", { kind: "add", item: "arabic-bread" }, "ضَعِ الْخُبْزَ فِي الصّينِيَّة", "Put the bread on the tray", "خُبْزُ الطّابون", "Taboon bread", "talal"),
      st("tray", { kind: "add", item: "onion-sliced" }, "ضَعِ الْبَصَلَ عَلَى الْخُبْز", "Put the onion on the bread", "بَصَلٌ وَسُمّاق", "Onion and sumac"),
      st("tray", { kind: "add", item: "chicken" }, "ضَعِ الدَّجاجَ فَوْقَ الْبَصَل", "Put the chicken on top", "دَجاجٌ كَبير", "A big chicken", "talal"),
      st("tray", { kind: "cook", mode: "bake", seconds: 4 }, "اِخْبِزْهُ فِي الْفُرْن", "Bake it in the oven", "رائِحَةٌ طَيِّبَة", "It smells so good"),
      st("tray", { kind: "sprinkle", item: "pine-nuts", taps: 3 }, "رُشَّ الصَّنَوْبَر", "Sprinkle the pine nuts", "زينَةٌ جَميلَة", "Pretty topping", "talal"),
      st("plate", { kind: "serve" }, "قَدِّمِ الْمُسَخَّن", "Serve the musakhan", "مُسَخَّنٌ جاهِز", "Musakhan is ready"),
    ],
  },
  {
    id: "manakish", name: { ar: "مَناقيش", en: "Manaqish" }, dish: "dish-manakish",
    ingredients: ["flour", "water", "olive-oil", "zaatar", "sesame"],
    intro: { ar: "هَيّا نَعْجِنُ وَنَخْبِزُ مَناقيشَ الزَّعْتَر", en: "Let's knead and bake za'atar manaqish!" , v: [...V, "manakish", "jahzin"] },
    done: { ar: "مَناقيشُ ساخِنَة! صَحْتَين", en: "Hot manaqish! Enjoy!" , v: DONE },
    steps: [
      st("bowl", { kind: "add", item: "flour" }, "ضَعِ الطَّحينَ فِي الْوِعاء", "Put the flour in the bowl", "طَحينٌ أَبْيَض", "White flour", "talal"),
      st("bowl", { kind: "pour", item: "water", color: "oklch(0.85 0.06 230 / .5)" }, "صُبَّ الْماءَ عَلَى الطَّحين", "Pour water on the flour", "نَخْلِطُ الْآن", "Now we mix"),
      st("bowl", { kind: "stir", taps: 4 }, "اُخْلُطِ الطَّحينَ وَالْماء", "Mix the flour and water", "صارَ عَجينًا", "It became dough", "talal"),
      st("dough", { kind: "knead", taps: 6 }, "اِعْجِنِ الْعَجين", "Knead the dough", "عَجينٌ طَرِيّ", "Soft dough"),
      st("dough", { kind: "roll", taps: 4 }, "اُفْرُدِ الْعَجين", "Roll out the dough", "دائِرَةٌ كَبيرَة", "A big circle", "talal"),
      st("dough", { kind: "pour", item: "olive-oil", color: "oklch(0.82 0.15 95 / .45)" }, "صُبَّ زَيْتَ الزَّيْتون", "Pour the olive oil", "زَيْتٌ لامِع", "Shiny oil"),
      st("dough", { kind: "sprinkle", item: "zaatar", taps: 4 }, "رُشَّ الزَّعْتَر", "Sprinkle the za'atar", "أَخْضَرُ جَميل", "Lovely green", "talal"),
      st("dough", { kind: "sprinkle", item: "sesame", taps: 2 }, "رُشَّ السِّمْسِم", "Sprinkle the sesame", "حُبوبٌ صَغيرَة", "Tiny seeds"),
      st("dough", { kind: "cook", mode: "bake", seconds: 4 }, "اِخْبِزْها فِي الْفُرْن", "Bake it in the oven", "الْمَناقيشُ اسْتَوَت", "The manaqish are baked", "talal"),
      st("plate", { kind: "serve" }, "قَدِّمِ الْمَناقيش", "Serve the manaqish", "مَناقيشُ جاهِزَة", "Manaqish are ready"),
    ],
  },
  {
    // Palestinian mloukhye with Teta: chicken broth → leaves → garlic-coriander tasha → rice → family table.
    // Every stage is data; reorder or drop steps here to match a family variation.
    id: "molokhia", name: { ar: "مْلوخِيَّة", en: "Mloukhye" }, dish: "mloukhye/table", card: "dish-molokhia-dish", cast: ["teta", "hamad"],
    ingredients: ["molokhia", "garlic", "coriander", "chicken", "water", "olive-oil", "rice", "lemon"],
    intro: { ar: "أَهْلَيْن حَبايْبي! يَلّا نُطْبُخ مْلوخِيَّة مَع تيتا", en: "Hi my loves! Let's cook mloukhye with Teta!", v: ["m-ahlein", "yalla-natbukh", "molokhia"] },
    done: { ar: "ريحِتْها طَيْبَة! صَحْتَين وَعافْيَة", en: "It smells wonderful! Sahtein!", v: ["m-tayyba", "sahtein-wafia"] },
    steps: [
      // 1 · get the leaves ready
      sx("bowl", { kind: "add", item: "molokhia" }, ["حُطّ وَرَق الْمْلوخِيَّة بِالْوْعا", "Put the mloukhye leaves in the bowl", ["hutta", "molokhia"]], ["شاطِر", "Well done", ["shater"]], "teta"),
      sx("bowl", { kind: "wash", item: "molokhia", taps: 4 }, ["يَلّا نِغْسِل الْوَرَق", "Let's wash the leaves", ["yalla", "molokhia"]], ["وَرَق نْضيف", "Clean leaves!", ["tamam"]], "hamad"),
      sx("board", { kind: "chop", item: "molokhia", result: "molokhia-chopped", taps: 4 }, ["نْقَطِّع الْمْلوخِيَّة", "Chop the leaves", ["cut", "molokhia"]], ["مُمْتاز", "Great", ["mumtaz"]], "teta"),
      sx("board", { kind: "chop", item: "garlic", result: "garlic-minced", taps: 4 }, ["وْهَلَّأ الثّوم", "Now the garlic", ["cut", "garlic"]], ["ثوم ناعِم", "Tiny garlic!", ["shatrin"]], "hamad"),
      // 2 · broth — the chicken cooks all the way through before anything else
      sx("pot", { kind: "add", item: "chicken" }, ["أَوَّل إِشي الْجاج", "First, the chicken", ["m-jaj"]], ["واو", "Wow", ["wow"]], "teta"),
      sx("pot", { kind: "pour", item: "water", color: "oklch(0.8 0.08 230 / .55)" }, ["وْمَيّ", "And water", ["m-mayy"]], ["تَمام", "Good", ["tamam"]], "hamad"),
      sx("pot", { kind: "cook", mode: "simmer", seconds: 6 }, ["نُطْبُخ الْجاج عَلى نار هادْيَة لَحَدّ ما يِسْتْوي", "Cook the chicken gently until it's fully done", ["m-nar"]], ["شو هالرّيحَة! الْجاج اسْتَوى", "What a smell! The chicken is cooked", ["m-riha"]], "teta",
        { after: { liquid: "oklch(0.84 0.11 88 / .75)" } }),
      sx("pot", { kind: "lift", item: "chicken", show: "chicken-cooked" }, ["طَلِّع الْجاج عَالصَّحْن", "Lift the chicken onto a plate", ["chicken"]], ["بِنوكْلو مَع الرُّزّ", "We'll eat it with the rice", ["shater"]], "hamad",
        { after: { cooked: false } }),
      // 3 · the mloukhye goes into the broth
      sx("pot", { kind: "add", item: "molokhia-chopped", into: "molokhia" }, ["حُطّ الْمْلوخِيَّة بِالْمَرَق", "Add the mloukhye to the broth", ["hutta", "molokhia"]], ["واو", "Wow", ["wow"]], "teta"),
      sx("pot", { kind: "stir", taps: 5 }, ["نْحَرِّك، نْحَرِّك", "Stir, stir!", ["nharrik"]], ["صارَت خَضْرا", "It turned green!", ["m-mashallah"]], "hamad",
        { after: { layers: [], liquid: "oklch(0.47 0.12 138 / .92)" } }),
      // 4 · tasha: garlic + coriander in oil in the small pan
      sx("pan", { kind: "pour", item: "olive-oil", color: "oklch(0.82 0.15 95 / .7)" }, ["بِالْمِقْلايَة شْوَيِّة زيت", "A little oil in the small pan", ["m-zeit"]], ["تَمام", "Good", ["tamam"]], "teta"),
      sx("pan", { kind: "add", item: "garlic-minced" }, ["حُطّ الثّوم", "Add the garlic", ["hutta", "garlic"]], ["شاطِر", "Well done", ["shater"]], "hamad"),
      sx("pan", { kind: "add", item: "coriander" }, ["وِالْكُزْبَرَة", "And the coriander", ["hutta"]], ["مُمْتاز", "Great", ["mumtaz"]], "teta"),
      sx("pan", { kind: "stir", taps: 4 }, ["حَرِّك بِشْويش", "Stir gently", ["harrikha"]], ["صار لونو ذَهَبي", "It's turning golden", ["wow"]], "hamad",
        { after: { cooked: true } }),
      sx("pot", { kind: "transfer", from: "pan", item: "garlic-minced" }, ["كُبّ الطَّشَّة عَالْمْلوخِيَّة", "Pour the garlic and coriander into the mloukhye", ["hutta"]], ["تْشْشْش! سْمِعْتو؟", "Tssss! Did you hear it?", ["isma3u"]], "teta"),
      sx("pot", { kind: "stir", taps: 4 }, ["حَرِّكْها", "Stir it", ["harrikha"]], ["اسْتَوَت الْمْلوخِيَّة", "The mloukhye is ready", ["m-istawat"]], "hamad",
        { after: { layers: [], liquid: "oklch(0.4 0.11 136 / .96)" } }),
      // 5 · rice in its own pot
      sx("pot", { kind: "add", item: "rice" }, ["وْهَلَّأ الرُّزّ", "And now the rice", ["m-ruz"]], ["شاطِر", "Well done", ["shater"]], "teta", { slot: "rice-pot" }),
      sx("pot", { kind: "pour", item: "water", color: "oklch(0.8 0.08 230 / .55)" }, ["وْمَيّ", "And water", ["m-mayy"]], ["تَمام", "Good", ["tamam"]], "hamad", { slot: "rice-pot" }),
      sx("pot", { kind: "cook", mode: "simmer", seconds: 4 }, ["عَلى نار هادْيَة", "On a low fire", ["m-nar"]], ["الرُّزّ شِرِب الْمَيّ", "The rice drank up the water", ["wow"]], "teta",
        { slot: "rice-pot", after: { cooked: false, liquid: undefined } }),
      // 6 · serve at the family table
      sx("table", { kind: "add", item: "mloukhye-bowl" }, ["نْغَرِّف الْمْلوخِيَّة بِالزِّبْدِيَّة", "Ladle the mloukhye into a bowl", ["hutta", "molokhia"]], ["مُمْتاز", "Great", ["mumtaz"]], "hamad"),
      sx("table", { kind: "add", item: "rice" }, ["وِالرُّزّ جَنْبْها", "Rice next to it", ["rice"]], ["شاطِر", "Well done", ["shater"]], "teta"),
      sx("table", { kind: "add", item: "chicken-cooked" }, ["وِالْجاج الْمِسْتْوي", "And the cooked chicken", ["chicken"]], ["واو", "Wow", ["wow"]], "hamad"),
      sx("table", { kind: "add", item: "lemon-sliced" }, ["شْوَيِّة لَيْمون", "A little lemon", ["lemon"]], ["برافو", "Bravo", ["m-bravo"]], "teta"),
    ],
  },
  {
    id: "malfouf", name: { ar: "مَلْفوف", en: "Malfouf" }, dish: "dish-malfouf",
    ingredients: ["cabbage", "rice", "meat", "garlic", "lemon", "water"],
    intro: { ar: "نَلُفُّ وَرَقَ الْمَلْفوفِ مِثْلَ الْأَصابِع", en: "We roll cabbage leaves like little fingers!" , v: [...V, "malfouf", "jahzin"] },
    done: { ar: "مَلْفوفٌ لَذيذ! صَحْتَين", en: "Yummy malfouf! Enjoy!" , v: DONE },
    steps: [
      st("bowl", { kind: "wash", item: "cabbage", taps: 4 }, "اِغْسِلِ الْمَلْفوف", "Wash the cabbage", "وَرَقٌ نَظيف", "Clean leaves", "talal"),
      st("bowl", { kind: "add", item: "rice" }, "ضَعِ الْأَرُزَّ فِي الْوِعاء", "Put the rice in the bowl", "أَرُزّ", "Rice"),
      st("bowl", { kind: "add", item: "meat" }, "أَضِفِ اللَّحْم", "Add the meat", "لَحْمٌ وَأَرُزّ", "Meat and rice", "talal"),
      st("bowl", { kind: "stir", taps: 5 }, "اُخْلُطِ الْحَشْوَة", "Mix the filling", "حَشْوَةٌ جاهِزَة", "The filling is ready"),
      st("board", { kind: "roll", taps: 5 }, "لُفَّ وَرَقَ الْمَلْفوف", "Roll the cabbage leaves", "أَصابِعُ مَلْفوف", "Cabbage rolls", "talal"),
      st("pot", { kind: "add", item: "grape-leaves" }, "رَتِّبِ الْمَلْفوفَ فِي الْقِدْر", "Line up the rolls in the pot", "صَفٌّ مُرَتَّب", "A neat row"),
      st("pot", { kind: "add", item: "garlic" }, "ضَعِ الثّومَ بَيْنَها", "Tuck the garlic in", "ثومٌ طَيِّب", "Tasty garlic", "talal"),
      st("pot", { kind: "pour", item: "water", color: "oklch(0.8 0.08 230 / .55)" }, "صُبَّ الْماء", "Pour the water", "الْماءُ يُغَطّيه", "Water covers it"),
      st("pot", { kind: "cook", mode: "simmer", seconds: 5 }, "اِضْغَطْ عَلَى النّار وَنَتْرُكُهُ يَطْبُخ", "Tap the fire and let it simmer", "الْمَلْفوفُ اسْتَوى", "The malfouf is cooked", "talal"),
      st("plate", { kind: "sprinkle", item: "lemon-sliced", taps: 2 }, "اِعْصُرِ اللَّيْمون", "Squeeze the lemon", "حامِضٌ لَذيذ", "Yummy and sour"),
      st("plate", { kind: "serve" }, "قَدِّمِ الْمَلْفوف", "Serve the malfouf", "مَلْفوفٌ جاهِز", "Malfouf is ready", "talal"),
    ],
  },
];

export const ING_NAME: Record<string, Line> = {
  "eggplant-sliced": { ar: "باذِنْجان", en: "Eggplant" }, "potato-cubed": { ar: "بَطاطا", en: "Potato" },
  "onion-sliced": { ar: "بَصَل", en: "Onion" }, "garlic-minced": { ar: "ثوم", en: "Garlic" },
  "arabic-bread": { ar: "خُبْزُ الطّابون", en: "Taboon bread" }, "grape-leaves": { ar: "أَصابِعُ مَلْفوف", en: "Cabbage rolls" },
  "lemon-sliced": { ar: "لَيْمون", en: "Lemon" },
  "molokhia-chopped": { ar: "مْلوخِيَّة مْقَطَّعَة", en: "Chopped mloukhye" }, "chicken-cooked": { ar: "جاج مِسْتْوي", en: "Cooked chicken" },
  "mloukhye-bowl": { ar: "زِبْدِيَّة مْلوخِيَّة", en: "Bowl of mloukhye" }, coriander: { ar: "كُزْبَرَة", en: "Coriander" },
  molokhia: { ar: "مْلوخِيَّة", en: "Mloukhye leaves" },
};
