// Geography & World Explorer. Add countries/animals/etc. as data here — the lesson engine builds every exercise from it.
// Map shapes come from Natural Earth (real boundaries) in geoPaths.ts; audio keys are `geo-${id}-en` / `geo-${id}-ar`.
import type { Guide } from "./arabicCurriculum";

export type ContinentKey = "Africa" | "Asia" | "Europe" | "North America" | "South America" | "Antarctica" | "Oceania";
export type GeoType = "basic" | "continent" | "ocean" | "animal" | "climate" | "habitat" | "country" | "landform";
export type GeoItem = {
  id: string;
  type: GeoType;
  en: string;
  ar: string; // standard Arabic name (with light vowels only where helpful)
  image?: string; // key into geoImages / animalImages
  continent?: ContinentKey; // for continent items: its map key; for countries: where it is
  continents?: ContinentKey[]; // animals: every continent where it lives naturally
  habitat?: string[]; // animals: habitat ids
  countries?: { count: number; note: string }; // continents
  climate?: string[]; // climate ids
  animals?: string[]; // animal ids
  landforms?: { en: string; ar: string }[];
  capital?: { en: string; ar: string };
  neighbors?: number;
  fact?: { en: string; ar: string };
  region?: { en: string; ar: string };
  trace?: boolean;
};

const basics: GeoItem[] = [
  { id: "earth", type: "basic", en: "Earth", ar: "الأرض", image: "earth", fact: { en: "Our home planet.", ar: "كوكبنا الذي نعيش عليه." } },
  { id: "land", type: "basic", en: "Land", ar: "اليابسة", image: "land", fact: { en: "Where we walk.", ar: "حيث نمشي." } },
  { id: "water", type: "basic", en: "Water", ar: "الماء", image: "ocean", fact: { en: "Most of Earth is water!", ar: "معظم الأرض ماء!" } },
  { id: "map", type: "basic", en: "Map", ar: "خريطة", image: "map", fact: { en: "A picture of places.", ar: "صورة للأماكن." } },
];

const note = "Counts vary depending on whether territories and partly recognized states are included.";
const continents: GeoItem[] = [
  { id: "africa", type: "continent", en: "Africa", ar: "أفريقيا", continent: "Africa", countries: { count: 54, note }, climate: ["hot", "dry", "tropical", "desert"], animals: ["lion", "elephant", "giraffe", "camel"], landforms: [{ en: "Sahara Desert", ar: "الصحراء الكبرى" }, { en: "Nile River", ar: "نهر النيل" }] },
  { id: "asia", type: "continent", en: "Asia", ar: "آسيا", continent: "Asia", countries: { count: 49, note }, climate: ["hot", "cold", "tropical", "desert"], animals: ["panda", "tiger", "elephant", "camel"], landforms: [{ en: "Himalaya Mountains", ar: "جبال الهيمالايا" }, { en: "Arabian Desert", ar: "صحراء العرب" }] },
  { id: "europe", type: "continent", en: "Europe", ar: "أوروبا", continent: "Europe", countries: { count: 44, note }, climate: ["temperate", "cold", "rainy"], animals: ["bear", "rabbit", "horse"], landforms: [{ en: "Alps Mountains", ar: "جبال الألب" }, { en: "Danube River", ar: "نهر الدانوب" }] },
  { id: "northamerica", type: "continent", en: "North America", ar: "أمريكا الشمالية", continent: "North America", countries: { count: 23, note }, climate: ["cold", "temperate", "hot"], animals: ["bear", "polarbear", "horse"], landforms: [{ en: "Rocky Mountains", ar: "جبال روكي" }, { en: "Great Lakes", ar: "البحيرات العظمى" }] },
  { id: "southamerica", type: "continent", en: "South America", ar: "أمريكا الجنوبية", continent: "South America", countries: { count: 12, note: "12 sovereign countries." }, climate: ["tropical", "rainy", "hot"], animals: ["llama", "monkey", "bird"], landforms: [{ en: "Amazon Rainforest", ar: "غابة الأمازون" }, { en: "Andes Mountains", ar: "جبال الأنديز" }] },
  { id: "antarctica", type: "continent", en: "Antarctica", ar: "القارة القطبية الجنوبية", continent: "Antarctica", countries: { count: 0, note: "No countries — scientists visit research stations." }, climate: ["polar", "cold", "snowy"], animals: ["penguin"], landforms: [{ en: "Ice sheet", ar: "غطاء جليدي" }] },
  { id: "oceania", type: "continent", en: "Australia / Oceania", ar: "أستراليا / أوقيانوسيا", continent: "Oceania", countries: { count: 14, note }, climate: ["hot", "dry", "tropical"], animals: ["kangaroo", "koala"], landforms: [{ en: "Great Barrier Reef", ar: "الحاجز المرجاني العظيم" }, { en: "Outback desert", ar: "صحراء أستراليا" }] },
];

const oceans: GeoItem[] = [
  { id: "pacific", type: "ocean", en: "Pacific Ocean", ar: "المحيط الهادئ", image: "ocean", fact: { en: "The biggest ocean.", ar: "أكبر محيط." } },
  { id: "atlantic", type: "ocean", en: "Atlantic Ocean", ar: "المحيط الأطلسي", image: "ocean", fact: { en: "Between the Americas and Africa and Europe.", ar: "بين الأمريكتين وأفريقيا وأوروبا." } },
  { id: "indian", type: "ocean", en: "Indian Ocean", ar: "المحيط الهندي", image: "ocean", fact: { en: "The warmest ocean.", ar: "أدفأ محيط." } },
  { id: "southern", type: "ocean", en: "Southern Ocean", ar: "المحيط الجنوبي", image: "antarctic", fact: { en: "Around Antarctica.", ar: "حول القارة القطبية الجنوبية." } },
  { id: "arctic", type: "ocean", en: "Arctic Ocean", ar: "المحيط المتجمد الشمالي", image: "arctic", fact: { en: "The smallest and coldest ocean.", ar: "أصغر وأبرد محيط." } },
];

const A = (id: string, en: string, ar: string, continents: ContinentKey[], habitat: string[], fact: NonNullable<GeoItem["fact"]>): GeoItem => ({ id, type: "animal", en, ar, image: id, continents, habitat, fact });
const animals: GeoItem[] = [
  A("lion", "Lion", "الأسد", ["Africa", "Asia"], ["savanna"], { en: "Most live in Africa; a few in India (Asia).", ar: "يعيش معظمه في أفريقيا وقليل في الهند." }),
  A("elephant", "Elephant", "الفيل", ["Africa", "Asia"], ["savanna", "forest"], { en: "Lives in Africa and Asia.", ar: "الفيل يعيش في أفريقيا وآسيا." }),
  A("giraffe", "Giraffe", "الزرافة", ["Africa"], ["savanna"], { en: "The tallest animal.", ar: "أطول حيوان." }),
  A("kangaroo", "Kangaroo", "الكنغر", ["Oceania"], ["grassland", "desert"], { en: "Hops across Australia.", ar: "يقفز في أستراليا." }),
  A("koala", "Koala", "الكوالا", ["Oceania"], ["forest"], { en: "Eats eucalyptus leaves in Australia.", ar: "يأكل أوراق الكينا في أستراليا." }),
  A("panda", "Giant panda", "الباندا العملاقة", ["Asia"], ["forest", "mountains"], { en: "Lives in the mountains of China.", ar: "تعيش في جبال الصين." }),
  A("tiger", "Tiger", "النمر", ["Asia"], ["forest", "rainforest"], { en: "Lives in Asian forests.", ar: "يعيش في غابات آسيا." }),
  A("camel", "Camel", "الجمل", ["Africa", "Asia"], ["desert"], { en: "Crosses hot deserts.", ar: "يعبر الصحراء الحارة." }),
  A("polarbear", "Polar bear", "الدب القطبي", ["North America", "Europe", "Asia"], ["arctic"], { en: "Lives in the Arctic, near the North Pole.", ar: "يعيش في المنطقة القطبية الشمالية." }),
  A("penguin", "Emperor penguin", "البطريق الإمبراطور", ["Antarctica"], ["antarctic"], { en: "Lives in Antarctica. Other penguins live in southern lands too.", ar: "يعيش في القارة القطبية الجنوبية." }),
  A("llama", "Llama", "اللاما", ["South America"], ["mountains"], { en: "Lives in the Andes mountains.", ar: "تعيش في جبال الأنديز." }),
  A("fish", "Fish", "السمكة", ["Africa", "Asia", "Europe", "North America", "South America", "Oceania", "Antarctica"], ["ocean"], { en: "Fish live in oceans everywhere.", ar: "تعيش الأسماك في كل المحيطات." }),
];

const H = (id: string, en: string, ar: string): GeoItem => ({ id, type: "habitat", en, ar, image: id });
const habitats: GeoItem[] = [
  H("desert", "Desert", "الصحراء"), H("rainforest", "Rainforest", "الغابة المطيرة"), H("savanna", "Savanna", "السافانا"),
  H("arctic", "Arctic", "القطب الشمالي"), H("antarctic", "Antarctic", "القطب الجنوبي"), H("ocean", "Ocean", "المحيط"),
  H("mountains", "Mountains", "الجبال"), H("grassland", "Grassland", "الأراضي العشبية"), H("forest", "Forest", "الغابة"),
];

const Cl = (id: string, en: string, ar: string, image: string): GeoItem => ({ id, type: "climate", en, ar, image });
const climates: GeoItem[] = [
  Cl("hot", "Hot", "حار", "hot"), Cl("cold", "Cold", "بارد", "cold"), Cl("dry", "Dry", "جاف", "dry"), Cl("rainy", "Rainy", "ممطر", "rainy"),
  Cl("snowy", "Snowy", "مثلج", "snowy"), Cl("desert", "Desert", "صحراوي", "desert"), Cl("tropical", "Tropical", "استوائي", "rainforest"),
  Cl("temperate", "Temperate", "معتدل", "forest"), Cl("polar", "Polar", "قطبي", "arctic"),
];

const Lf = (id: string, en: string, ar: string, image = id): GeoItem => ({ id, type: "landform", en, ar, image });
const landforms: GeoItem[] = [
  Lf("mountain", "Mountain", "جبل"), Lf("range", "Mountain range", "سلسلة جبلية"), Lf("desertland", "Desert", "صحراء", "desert"),
  Lf("river", "River", "نهر"), Lf("lake", "Lake", "بحيرة"), Lf("oceanland", "Ocean", "محيط", "ocean"), Lf("sea", "Sea", "بحر"),
  Lf("island", "Island", "جزيرة"), Lf("valley", "Valley", "وادٍ"), Lf("waterfall", "Waterfall", "شلال"), Lf("volcano", "Volcano", "بركان"),
  Lf("peninsula", "Peninsula", "شبه جزيرة"),
];

type C = Omit<GeoItem, "type">;
const Co = (c: C): GeoItem => ({ ...c, type: "country" });
const me = { en: "Middle East", ar: "الشرق الأوسط" };
const countries: GeoItem[] = [
  Co({ id: "ps", en: "Palestine", ar: "فلسطين", continent: "Asia", region: me, capital: { en: "Jerusalem", ar: "القدس" }, neighbors: 3, climate: ["hot", "dry"], animals: ["camel"], landforms: [{ en: "Dead Sea", ar: "البحر الميت" }, { en: "Jordan River", ar: "نهر الأردن" }], fact: { en: "Home of Al-Aqsa Mosque.", ar: "فيها المسجد الأقصى." }, trace: true }),
  Co({ id: "jo", en: "Jordan", ar: "الأردن", continent: "Asia", region: me, capital: { en: "Amman", ar: "عمّان" }, neighbors: 5, climate: ["hot", "dry", "desert"], animals: ["camel"], landforms: [{ en: "Wadi Rum desert", ar: "وادي رم" }, { en: "Dead Sea", ar: "البحر الميت" }], fact: { en: "Petra is carved into pink rock.", ar: "البتراء منحوتة في الصخر الوردي." }, trace: true }),
  Co({ id: "sa", en: "Saudi Arabia", ar: "السعودية", continent: "Asia", region: me, capital: { en: "Riyadh", ar: "الرياض" }, neighbors: 7, climate: ["hot", "dry", "desert"], animals: ["camel"], landforms: [{ en: "Empty Quarter desert", ar: "الربع الخالي" }], fact: { en: "Makkah and Madinah are here.", ar: "فيها مكة المكرمة والمدينة المنورة." }, trace: true }),
  Co({ id: "eg", en: "Egypt", ar: "مصر", continent: "Africa", region: { en: "North Africa", ar: "شمال أفريقيا" }, capital: { en: "Cairo", ar: "القاهرة" }, neighbors: 4, climate: ["hot", "dry", "desert"], animals: ["camel"], landforms: [{ en: "Nile River", ar: "نهر النيل" }, { en: "Sahara Desert", ar: "الصحراء الكبرى" }], fact: { en: "The pyramids are in Egypt.", ar: "الأهرامات في مصر." }, trace: true }),
  Co({ id: "lb", en: "Lebanon", ar: "لبنان", continent: "Asia", region: me, capital: { en: "Beirut", ar: "بيروت" }, neighbors: 2, climate: ["temperate", "rainy"], animals: ["bird"], landforms: [{ en: "Lebanon Mountains", ar: "جبال لبنان" }], fact: { en: "The cedar tree is on its flag.", ar: "شجرة الأرز على علمه." } }),
  Co({ id: "tr", en: "Türkiye", ar: "تركيا", continent: "Asia", region: { en: "Between Europe and Asia", ar: "بين أوروبا وآسيا" }, capital: { en: "Ankara", ar: "أنقرة" }, neighbors: 8, climate: ["temperate", "snowy"], animals: ["bear"], landforms: [{ en: "Bosphorus strait", ar: "مضيق البوسفور" }], fact: { en: "It is in both Europe and Asia.", ar: "تقع في أوروبا وآسيا." } }),
  Co({ id: "gb", en: "United Kingdom", ar: "المملكة المتحدة", continent: "Europe", region: { en: "Western Europe", ar: "غرب أوروبا" }, capital: { en: "London", ar: "لندن" }, neighbors: 1, climate: ["rainy", "temperate"], animals: ["rabbit"], landforms: [{ en: "Islands", ar: "جزر" }], fact: { en: "It is made of islands.", ar: "تتكون من جزر." } }),
  Co({ id: "fr", en: "France", ar: "فرنسا", continent: "Europe", region: { en: "Western Europe", ar: "غرب أوروبا" }, capital: { en: "Paris", ar: "باريس" }, neighbors: 8, climate: ["temperate"], animals: ["horse"], landforms: [{ en: "Alps Mountains", ar: "جبال الألب" }], fact: { en: "The Eiffel Tower is in Paris.", ar: "برج إيفل في باريس." } }),
  Co({ id: "it", en: "Italy", ar: "إيطاليا", continent: "Europe", region: { en: "Southern Europe", ar: "جنوب أوروبا" }, capital: { en: "Rome", ar: "روما" }, neighbors: 6, climate: ["temperate", "hot"], animals: ["bird"], landforms: [{ en: "Peninsula", ar: "شبه جزيرة" }, { en: "Volcanoes", ar: "براكين" }], fact: { en: "It is shaped like a boot.", ar: "شكلها يشبه الحذاء." }, trace: true }),
  Co({ id: "es", en: "Spain", ar: "إسبانيا", continent: "Europe", region: { en: "Southern Europe", ar: "جنوب أوروبا" }, capital: { en: "Madrid", ar: "مدريد" }, neighbors: 4, climate: ["hot", "dry"], animals: ["bird"], landforms: [{ en: "Iberian Peninsula", ar: "شبه الجزيرة الأيبيرية" }], fact: { en: "Al-Andalus was here long ago.", ar: "كانت الأندلس هنا قديمًا." } }),
  Co({ id: "in", en: "India", ar: "الهند", continent: "Asia", region: { en: "South Asia", ar: "جنوب آسيا" }, capital: { en: "New Delhi", ar: "نيودلهي" }, neighbors: 6, climate: ["hot", "rainy", "tropical"], animals: ["tiger", "elephant"], landforms: [{ en: "Himalaya Mountains", ar: "جبال الهيمالايا" }, { en: "Ganges River", ar: "نهر الغانج" }], fact: { en: "Tigers live in India.", ar: "النمور تعيش في الهند." }, trace: true }),
  Co({ id: "cn", en: "China", ar: "الصين", continent: "Asia", region: { en: "East Asia", ar: "شرق آسيا" }, capital: { en: "Beijing", ar: "بكين" }, neighbors: 14, climate: ["temperate", "cold", "hot"], animals: ["panda"], landforms: [{ en: "Yangtze River", ar: "نهر اليانغتسي" }], fact: { en: "The Great Wall is very long.", ar: "سور الصين العظيم طويل جدًا." } }),
  Co({ id: "jp", en: "Japan", ar: "اليابان", continent: "Asia", region: { en: "East Asia", ar: "شرق آسيا" }, capital: { en: "Tokyo", ar: "طوكيو" }, neighbors: 0, climate: ["temperate", "snowy"], animals: ["monkey"], landforms: [{ en: "Mount Fuji volcano", ar: "بركان جبل فوجي" }, { en: "Islands", ar: "جزر" }], fact: { en: "Japan is made of islands.", ar: "اليابان مكونة من جزر." } }),
  Co({ id: "au", en: "Australia", ar: "أستراليا", continent: "Oceania", region: { en: "Oceania", ar: "أوقيانوسيا" }, capital: { en: "Canberra", ar: "كانبرا" }, neighbors: 0, climate: ["hot", "dry", "tropical"], animals: ["kangaroo", "koala"], landforms: [{ en: "Outback desert", ar: "صحراء أستراليا" }], fact: { en: "It is a country and a continent.", ar: "هي دولة وقارة." }, trace: true }),
  Co({ id: "br", en: "Brazil", ar: "البرازيل", continent: "South America", region: { en: "South America", ar: "أمريكا الجنوبية" }, capital: { en: "Brasília", ar: "برازيليا" }, neighbors: 10, climate: ["tropical", "rainy"], animals: ["monkey", "bird"], landforms: [{ en: "Amazon River", ar: "نهر الأمازون" }], fact: { en: "Most of the Amazon rainforest is here.", ar: "معظم غابة الأمازون هنا." } }),
  Co({ id: "mx", en: "Mexico", ar: "المكسيك", continent: "North America", region: { en: "North America", ar: "أمريكا الشمالية" }, capital: { en: "Mexico City", ar: "مكسيكو سيتي" }, neighbors: 3, climate: ["hot", "dry"], animals: ["bird"], landforms: [{ en: "Volcanoes", ar: "براكين" }], fact: { en: "It has deserts and rainforests.", ar: "فيها صحارى وغابات مطيرة." } }),
  Co({ id: "ca", en: "Canada", ar: "كندا", continent: "North America", region: { en: "North America", ar: "أمريكا الشمالية" }, capital: { en: "Ottawa", ar: "أوتاوا" }, neighbors: 1, climate: ["cold", "snowy"], animals: ["polarbear", "bear"], landforms: [{ en: "Rocky Mountains", ar: "جبال روكي" }, { en: "Many lakes", ar: "بحيرات كثيرة" }], fact: { en: "It has more lakes than any country.", ar: "فيها بحيرات أكثر من أي دولة." } }),
  Co({ id: "us", en: "United States", ar: "الولايات المتحدة", continent: "North America", region: { en: "North America", ar: "أمريكا الشمالية" }, capital: { en: "Washington, D.C.", ar: "واشنطن" }, neighbors: 2, climate: ["temperate", "hot", "cold"], animals: ["bear"], landforms: [{ en: "Grand Canyon", ar: "الأخدود العظيم" }, { en: "Mississippi River", ar: "نهر المسيسيبي" }], fact: { en: "It has 50 states.", ar: "فيها 50 ولاية." }, trace: true }),
  Co({ id: "za", en: "South Africa", ar: "جنوب أفريقيا", continent: "Africa", region: { en: "Southern Africa", ar: "جنوب القارة الأفريقية" }, capital: { en: "Pretoria", ar: "بريتوريا" }, neighbors: 6, climate: ["temperate", "dry"], animals: ["lion", "penguin"], landforms: [{ en: "Table Mountain", ar: "جبل الطاولة" }], fact: { en: "Penguins live on its beaches!", ar: "البطاريق تعيش على شواطئها!" } }),
  Co({ id: "ke", en: "Kenya", ar: "كينيا", continent: "Africa", region: { en: "East Africa", ar: "شرق أفريقيا" }, capital: { en: "Nairobi", ar: "نيروبي" }, neighbors: 5, climate: ["hot", "tropical"], animals: ["lion", "giraffe", "elephant"], landforms: [{ en: "Mount Kenya", ar: "جبل كينيا" }, { en: "Savanna", ar: "السافانا" }], fact: { en: "Famous for savanna animals.", ar: "مشهورة بحيوانات السافانا." } }),
];

export const geoItems = { basics, continents, oceans, animals, habitats, climates, landforms, countries };
export const allGeo: GeoItem[] = Object.values(geoItems).flat();
export const geoById = (id: string) => allGeo.find((i) => i.id === id);
export const continentByKey = (k: ContinentKey) => continents.find((c) => c.continent === k)!;

export type GeoUnit = { id: string; level: number; en: string; ar: string; guide: Guide; tone: "sun" | "sky" | "mint" | "berry"; items: GeoItem[]; chunk: number; mixed?: boolean; bilingual?: boolean };
export const geoUnits: GeoUnit[] = [
  { id: "world", level: 1, en: "My World", ar: "عالمي", guide: "baba", tone: "sky", items: basics, chunk: 4 },
  { id: "continents", level: 2, en: "Continents", ar: "القارات", guide: "baba", tone: "sun", items: continents, chunk: 4 },
  { id: "oceans", level: 3, en: "Oceans", ar: "المحيطات", guide: "hamad", tone: "sky", items: oceans, chunk: 5 },
  { id: "animals", level: 4, en: "Animals & habitats", ar: "الحيوانات", guide: "talal", tone: "mint", items: [...animals, ...habitats], chunk: 5 },
  { id: "climate", level: 5, en: "Climate", ar: "المناخ", guide: "mama", tone: "berry", items: climates, chunk: 5 },
  { id: "countries", level: 6, en: "Countries & flags", ar: "الدول والأعلام", guide: "hamad", tone: "sun", items: countries, chunk: 4 },
  { id: "landforms", level: 7, en: "Landforms", ar: "التضاريس", guide: "yousef", tone: "mint", items: landforms, chunk: 4 },
  { id: "explorer", level: 8, en: "World Explorer", ar: "مستكشف العالم", guide: "hamad", tone: "sky", items: [...continents, ...countries, ...animals.slice(0, 11)], chunk: 99, mixed: true },
  { id: "bilingual", level: 9, en: "Bilingual Explorer", ar: "المستكشف ثنائي اللغة", guide: "mama", tone: "berry", items: [...continents, ...climates, ...landforms, ...animals.slice(0, 11)], chunk: 99, mixed: true, bilingual: true },
  { id: "challenge", level: 10, en: "World Challenge", ar: "تحدي مستكشف العالم", guide: "baba", tone: "sun", items: allGeo.filter((i) => i.type !== "basic"), chunk: 99, mixed: true },
];

export type GeoLesson = { id: string; unit: string; index: number; review: boolean; items: GeoItem[] };
export function geoUnitLessons(u: GeoUnit): GeoLesson[] {
  if (u.mixed) return [1, 2].map((n) => ({ id: `${u.id}-${n}`, unit: u.id, index: n - 1, review: true, items: u.items }));
  const out: GeoLesson[] = [];
  for (let i = 0; i < u.items.length; i += u.chunk) {
    const items = u.items.slice(i, i + u.chunk);
    if (items.length < 2 && out.length) { out[out.length - 1]!.items.push(...items); continue; }
    out.push({ id: `${u.id}-${out.length + 1}`, unit: u.id, index: out.length, review: false, items });
  }
  out.push({ id: `${u.id}-review`, unit: u.id, index: out.length, review: true, items: u.items });
  return out;
}
export const allGeoLessons = geoUnits.flatMap(geoUnitLessons);

export const geoPrompts = {
  where: { en: "Where is it?", ar: "أين تقع؟" },
  which: { en: "Which one?", ar: "أي واحد؟" },
  whatIs: { en: "What is this?", ar: "ما هذا؟" },
  country: { en: "Which country?", ar: "أي دولة؟" },
  flag: { en: "Which flag?", ar: "أي علم؟" },
  lives: { en: "Where does it live?", ar: "أين يعيش؟" },
  habitat: { en: "Which home?", ar: "أين بيته؟" },
  climate: { en: "Which climate?", ar: "ما نوع المناخ؟" },
  howMany: { en: "How many countries?", ar: "كم دولة؟" },
  trace: { en: "Trace the border", ar: "تتبّع الحدود" },
  place: { en: "Drag it to the map", ar: "اسحبها إلى الخريطة" },
  match: { en: "Match", ar: "طابق" },
  tap: { en: "Tap and listen", ar: "اضغط واسمع" },
  great: { en: "Great!", ar: "أحسنت!" },
  again: { en: "Gently try again", ar: "حاول مرة أخرى" },
  translate: { en: "Which word matches?", ar: "ما الكلمة المطابقة؟" },
} as const;
export type GeoPromptId = keyof typeof geoPrompts;

export function geoClipTexts(): Record<string, { text: string; lang: "en" | "ar" }> {
  const out: Record<string, { text: string; lang: "en" | "ar" }> = {};
  for (const i of allGeo) { out[`geo-${i.id}-en`] = { text: i.en, lang: "en" }; out[`geo-${i.id}-ar`] = { text: i.ar, lang: "ar" }; }
  for (const [k, p] of Object.entries(geoPrompts)) { out[`gp-${k}-en`] = { text: p.en, lang: "en" }; out[`gp-${k}-ar`] = { text: p.ar, lang: "ar" }; }
  return out;
}
