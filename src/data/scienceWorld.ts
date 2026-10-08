// Science World content, drawn from the Grade 1 science book (NCCD, part 2, units 3–5).
// Each entry cites the lesson it comes from (see src/data/curriculum/scienceGrade1P2.json).
import { scienceBook } from "@/data/curriculum";

const lessonTitlesEn: Record<string, string> = { "sci-3-3": "Materials and their properties", "sci-3-4": "Classifying materials", "sci-3-5": "Designing solutions", "sci-4-3": "Push, pull, and motion", "sci-4-4": "Magnets", "sci-5-1": "Earth materials", "sci-5-2": "Water", "sci-5-3": "Day and night", "sci-5-4": "The four seasons" };
export const scienceLessonTitle = (id: string, language: "ar" | "en" = "ar") => language === "en" ? lessonTitlesEn[id] ?? "" : scienceBook.units.flatMap((u) => u.lessons).find((l) => l.id === id)?.title ?? "";

// Lessons 3-1…3-4 (chair, bowl, vase, blanket, scarf, rope, bucket; wool/feathers/stone from 3-2) and 4-4 (iron vs aluminium).
export type Thing = { id: string; ar: string; en: string; emoji: string; material: string; materialEn: string; source: "طبيعية" | "مصنوعة"; feel: "ناعم" | "خشن"; magnetic: boolean; absorbs?: boolean; waterproof?: boolean };

// Objects and materials come from units 3–4 of the Grade 1 science book (chair, bowl, vase, blanket, scarf, rope, bucket, wool, leather, feathers, iron, aluminium…)
export const THINGS: Thing[] = [
  { id: "chair", ar: "كُرْسِيٌّ خَشَبِيٌّ", en: "wooden chair", emoji: "🪑", material: "خَشَب", materialEn: "wood", source: "طبيعية", feel: "خشن", magnetic: false },
  { id: "bowl", ar: "وِعاءٌ بِلاسْتيكِيٌّ", en: "plastic bowl", emoji: "🥣", material: "بِلاسْتيك", materialEn: "plastic", source: "مصنوعة", feel: "ناعم", magnetic: false, waterproof: true },
  { id: "vase", ar: "مَزْهَرِيَّةٌ زُجاجِيَّةٌ", en: "glass vase", emoji: "🏺", material: "زُجاج", materialEn: "glass", source: "مصنوعة", feel: "ناعم", magnetic: false, waterproof: true },
  { id: "blanket", ar: "بَطّانِيَّةٌ", en: "blanket", emoji: "🛏️", material: "قُماش", materialEn: "fabric", source: "مصنوعة", feel: "ناعم", magnetic: false, absorbs: true },
  { id: "scarf", ar: "وِشاحٌ", en: "scarf", emoji: "🧣", material: "صوف", materialEn: "wool", source: "طبيعية", feel: "ناعم", magnetic: false, absorbs: true },
  { id: "rope", ar: "حَبْلٌ", en: "rope", emoji: "🪢", material: "لِيف", materialEn: "fiber", source: "طبيعية", feel: "خشن", magnetic: false },
  { id: "bucket", ar: "دَلْوٌ", en: "bucket", emoji: "🪣", material: "بِلاسْتيك", materialEn: "plastic", source: "مصنوعة", feel: "ناعم", magnetic: false, waterproof: true },
  { id: "stone", ar: "حَجَرٌ", en: "stone", emoji: "🪨", material: "صَخْر", materialEn: "rock", source: "طبيعية", feel: "خشن", magnetic: false },
  { id: "feather", ar: "ريشٌ", en: "feather", emoji: "🪶", material: "ريش", materialEn: "feather", source: "طبيعية", feel: "ناعم", magnetic: false },
  { id: "nail", ar: "مِسْمارٌ", en: "nail", emoji: "📌", material: "حَديد", materialEn: "iron", source: "مصنوعة", feel: "ناعم", magnetic: true },
  { id: "key", ar: "مِفْتاحٌ", en: "key", emoji: "🔑", material: "حَديد", materialEn: "iron", source: "مصنوعة", feel: "ناعم", magnetic: true },
  { id: "clip", ar: "مِشْبَكُ وَرَقٍ", en: "paper clip", emoji: "📎", material: "حَديد", materialEn: "iron", source: "مصنوعة", feel: "ناعم", magnetic: true },
  { id: "can", ar: "عُلْبَةُ أَلَمْنيوم", en: "aluminum can", emoji: "🥫", material: "أَلَمْنيوم", materialEn: "aluminum", source: "مصنوعة", feel: "ناعم", magnetic: false, waterproof: true },
  { id: "paper", ar: "وَرَقٌ", en: "paper", emoji: "📄", material: "وَرَق", materialEn: "paper", source: "مصنوعة", feel: "ناعم", magnetic: false, absorbs: true },
  { id: "sponge", ar: "إسْفَنْجَةٌ", en: "sponge", emoji: "🧽", material: "إسْفَنْج", materialEn: "sponge", source: "مصنوعة", feel: "خشن", magnetic: false, absorbs: true },
  { id: "leaf", ar: "وَرَقَةُ شَجَرٍ", en: "leaf", emoji: "🍃", material: "نَبات", materialEn: "plant", source: "طبيعية", feel: "ناعم", magnetic: false },
  { id: "spoon", ar: "مِلْعَقَةٌ حَديدِيَّةٌ", en: "iron spoon", emoji: "🥄", material: "حَديد", materialEn: "iron", source: "مصنوعة", feel: "ناعم", magnetic: true },
  { id: "cup", ar: "كوبٌ", en: "cup", emoji: "☕", material: "خَزَف", materialEn: "ceramic", source: "مصنوعة", feel: "ناعم", magnetic: false, waterproof: true },
  { id: "box", ar: "صُنْدوقٌ كَرْتونِيٌّ", en: "cardboard box", emoji: "📦", material: "كَرْتون", materialEn: "cardboard", source: "مصنوعة", feel: "خشن", magnetic: false, absorbs: true },
  { id: "shirt", ar: "قَميصٌ قُطْنِيٌّ", en: "cotton shirt", emoji: "👕", material: "قُطْن", materialEn: "cotton", source: "طبيعية", feel: "ناعم", magnetic: false, absorbs: true },
  { id: "hat", ar: "قُبَّعَةٌ مِنَ الْقَشِّ", en: "straw hat", emoji: "👒", material: "قَشّ", materialEn: "straw", source: "طبيعية", feel: "خشن", magnetic: false },
  { id: "pencil", ar: "قَلَمُ رَصاصٍ", en: "pencil", emoji: "✏️", material: "خَشَب", materialEn: "wood", source: "مصنوعة", feel: "ناعم", magnetic: false },
  { id: "eraser", ar: "مِمْحاةٌ", en: "eraser", emoji: "🧼", material: "مَطّاط", materialEn: "rubber", source: "مصنوعة", feel: "ناعم", magnetic: false },
];

export const byId = (id: string) => THINGS.find((t) => t.id === id)!;

// Lessons 5-1 (rocks) and 5-2 (water).
export const EARTH: { id: string; img?: string; emoji?: string; ar: string; en: string; fact: string; factEn: string; x: number; y: number }[] = [
  { id: "rock", img: "rocks", ar: "الصُّخورُ", en: "Rocks", fact: "الصُّخورُ قاسِيَةٌ، مِنْها الْكَبيرُ وَمِنْها الصَّغيرُ", factEn: "Rocks are hard. Some are big and some are small.", x: 12, y: 60 },
  { id: "soil", emoji: "🟫", ar: "التُّرْبَةُ", en: "Soil", fact: "تَنْمو النَّباتاتُ في التُّرْبَةِ", factEn: "Plants grow in soil.", x: 45, y: 72 },
  { id: "water", img: "water", ar: "الْماءُ", en: "Water", fact: "الْماءُ في الْأَنْهارِ وَالْبِحارِ وَالْأَمْطارِ", factEn: "Water is found in rivers, seas, and rain.", x: 75, y: 55 },
  { id: "plant", img: "nature", ar: "النَّباتاتُ", en: "Plants", fact: "النَّباتُ يَحْتاجُ إِلى الْماءِ وَالتُّرْبَةِ وَالشَّمْسِ", factEn: "A plant needs water, soil, and sunlight.", x: 30, y: 30 },
  { id: "sun", img: "sun", ar: "الشَّمْسُ", en: "Sun", fact: "الشَّمْسُ تُعْطينا الضَّوْءَ وَالدِّفْءَ", factEn: "The Sun gives us light and warmth.", x: 78, y: 8 },
  { id: "sand", emoji: "🏜️", ar: "الرَّمْلُ", en: "Sand", fact: "الرَّمْلُ حُبَيْباتٌ صَغيرَةٌ مِنَ الصُّخورِ", factEn: "Sand is made of tiny pieces of rock.", x: 58, y: 34 },
];

// Lesson 5-2.
export type WaterItem = { id: string; emoji: string; ar: string; en: string; kind: string } & Partial<Thing>;
export const WATER_ITEMS: WaterItem[] = [
  { id: "sea", emoji: "🌊", ar: "بَحْرٌ", en: "sea", kind: "where" }, { id: "rain", emoji: "🌧️", ar: "مَطَرٌ", en: "rain", kind: "where" }, { id: "river", emoji: "🏞️", ar: "نَهْرٌ", en: "river", kind: "where" },
  { id: "drink", emoji: "🥛", ar: "نَشْرَبُ", en: "drink", kind: "use" }, { id: "wash", emoji: "🧼", ar: "نَغْسِلُ", en: "wash", kind: "use" }, { id: "plants", emoji: "🌱", ar: "نَسْقي النَّباتاتِ", en: "water plants", kind: "use" },
];

// Lesson 5-4.
export const SEASONS = [
  { id: "spring", ar: "الرَّبيعُ", en: "Spring", sky: "🌸", scene: "🌷🌼🦋🌳", items: ["🌷", "🦋"] },
  { id: "summer", ar: "الصَّيْفُ", en: "Summer", sky: "☀️", scene: "🏖️🍉🌞🌴", items: ["🩳", "🕶️", "🍉"] },
  { id: "autumn", ar: "الْخَريفُ", en: "Autumn", sky: "🍂", scene: "🍁🍂🌬️🌳", items: ["🍂", "🧥"] },
  { id: "winter", ar: "الشِّتاءُ", en: "Winter", sky: "❄️", scene: "🌧️⛄☔🧤", items: ["🧣", "☂️", "🧤"] },
] as const;
