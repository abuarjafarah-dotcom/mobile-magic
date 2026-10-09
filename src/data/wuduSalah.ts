/**
 * Wudu & Salah — single source of truth for every activity (Learn, Arrange, Practice, Identify, Rak'ah).
 * Art: Gemini cut-outs in src/assets/salah/ (checkerboard removed). Add steps/prayers as data only.
 */
import wuduIntention from "@/assets/salah/wudu-intention.webp";
import wuduHands from "@/assets/salah/wudu-hands.webp";
import wuduMouth from "@/assets/salah/wudu-mouth.webp";
import wuduNose from "@/assets/salah/wudu-nose.webp";
import wuduFace from "@/assets/salah/wudu-face.webp";
import wuduArms from "@/assets/salah/wudu-arms.webp";
import wuduHead from "@/assets/salah/wudu-head.webp";
import wuduEars from "@/assets/salah/wudu-ears.webp";
import wuduFeet from "@/assets/salah/wudu-feet.webp";
import salahTakbir from "@/assets/salah/salah-takbir.webp";
import salahQiyam from "@/assets/salah/salah-qiyam.webp";
import salahRuku from "@/assets/salah/salah-ruku.webp";
import salahSujud from "@/assets/salah/salah-sujud.webp";
import salahJalsah from "@/assets/salah/salah-jalsah.webp";
import salahTashahhud from "@/assets/salah/salah-tashahhud.webp";
import wuduVideoUrl from "@/assets/salah/wudu-video.mp4";

export type Bi = { ar: string; en: string };
export type Topic = "wudu" | "salah";

/** "heart" = intention, "say" = spoken words, "body" = a physical action. */
export type StepKind = "heart" | "say" | "body";
export type Step = {
  id: string;
  kind: StepKind;
  img: string;
  title: Bi;
  how: Bi;
  hint: Bi;
  say?: Bi;
};

export const WUDU_STEPS: readonly Step[] = [
  {
    id: "niyyah",
    kind: "heart",
    img: wuduIntention,
    title: { ar: "النِّيَّة", en: "Intention" },
    how: { ar: "نَنْوِي الوُضُوءَ فِي قُلُوبِنَا", en: "We intend wudu in our hearts" },
    hint: {
      ar: "النِّيَّةُ فِي القَلْبِ، قَبْلَ أَنْ نَبْدَأ",
      en: "Intention is in the heart, before we start",
    },
  },
  {
    id: "bismillah",
    kind: "say",
    img: wuduIntention,
    title: { ar: "البَسْمَلَة", en: "Bismillah" },
    how: { ar: "نَقُولُ: بِسْمِ الله", en: "We say: Bismillah" },
    hint: { ar: "نَقُولُ بِسْمِ اللهِ قَبْلَ المَاء", en: "We say Bismillah before the water" },
    say: { ar: "بِسْمِ الله", en: "Bismillah" },
  },
  {
    id: "hands",
    kind: "body",
    img: wuduHands,
    title: { ar: "غَسْلُ الكَفَّيْن", en: "Wash hands" },
    how: { ar: "نَغْسِلُ الكَفَّيْنِ بِالمَاء", en: "We wash both hands" },
    hint: { ar: "أَوَّلُ غَسْلٍ: اليَدَانِ", en: "First we wash our hands" },
  },
  {
    id: "mouth",
    kind: "body",
    img: wuduMouth,
    title: { ar: "المَضْمَضَة", en: "Rinse mouth" },
    how: { ar: "نَضَعُ المَاءَ فِي الفَمِ وَنُحَرِّكُهُ", en: "We rinse our mouth with water" },
    hint: { ar: "بَعْدَ اليَدَيْنِ: الفَم", en: "After the hands comes the mouth" },
  },
  {
    id: "nose",
    kind: "body",
    img: wuduNose,
    title: { ar: "الاسْتِنْشَاق", en: "Rinse nose" },
    how: { ar: "نُدْخِلُ المَاءَ فِي الأَنْفِ بِلُطْف", en: "We gently rinse our nose" },
    hint: { ar: "بَعْدَ الفَمِ: الأَنْف", en: "After the mouth comes the nose" },
  },
  {
    id: "face",
    kind: "body",
    img: wuduFace,
    title: { ar: "غَسْلُ الوَجْه", en: "Wash face" },
    how: { ar: "نَغْسِلُ الوَجْهَ كُلَّه", en: "We wash our whole face" },
    hint: { ar: "بَعْدَ الأَنْفِ: الوَجْه", en: "After the nose comes the face" },
  },
  {
    id: "arms",
    kind: "body",
    img: wuduArms,
    title: { ar: "غَسْلُ اليَدَيْنِ إِلَى المِرْفَقَيْن", en: "Wash arms to the elbows" },
    how: { ar: "نَغْسِلُ اليَدَيْنِ مَعَ المِرْفَقَيْن", en: "We wash our arms, elbows included" },
    hint: { ar: "بَعْدَ الوَجْهِ: الذِّرَاعَان", en: "After the face come the arms" },
  },
  {
    id: "head",
    kind: "body",
    img: wuduHead,
    title: { ar: "مَسْحُ الرَّأْس", en: "Wipe head" },
    how: {
      ar: "نَمْسَحُ الرَّأْسَ بِيَدَيْنِ مُبْتَلَّتَيْن",
      en: "We wipe our head with wet hands",
    },
    hint: { ar: "بَعْدَ الذِّرَاعَيْنِ: الرَّأْس", en: "After the arms comes the head" },
  },
  {
    id: "ears",
    kind: "body",
    img: wuduEars,
    title: { ar: "مَسْحُ الأُذُنَيْن", en: "Wipe ears" },
    how: { ar: "نَمْسَحُ الأُذُنَيْن", en: "We wipe our ears" },
    hint: { ar: "بَعْدَ الرَّأْسِ: الأُذُنَان", en: "After the head come the ears" },
  },
  {
    id: "feet",
    kind: "body",
    img: wuduFeet,
    title: { ar: "غَسْلُ الرِّجْلَيْنِ إِلَى الكَعْبَيْن", en: "Wash feet to the ankles" },
    how: { ar: "نَغْسِلُ الرِّجْلَيْنِ مَعَ الكَعْبَيْن", en: "We wash our feet, ankles included" },
    hint: { ar: "آخِرُ خُطْوَةٍ: القَدَمَان", en: "The last step is the feet" },
  },
];

/** Stages of the prayer. Some images repeat on purpose (e.g. standing after ruku' looks like qiyam). */
export const SALAH_STAGES = {
  takbir: {
    id: "takbir",
    kind: "say",
    img: salahTakbir,
    title: { ar: "تَكْبِيرَةُ الإِحْرَام", en: "Opening takbir" },
    how: {
      ar: "نَرْفَعُ اليَدَيْنِ وَنَقُولُ: اللهُ أَكْبَر",
      en: "Raise your hands and say Allahu Akbar",
    },
    hint: { ar: "الصَّلَاةُ تَبْدَأُ بِـ: اللهُ أَكْبَر", en: "Prayer starts with Allahu Akbar" },
    say: { ar: "اللهُ أَكْبَر", en: "Allahu Akbar" },
  },
  qiyam: {
    id: "qiyam",
    kind: "body",
    img: salahQiyam,
    title: { ar: "القِيَام", en: "Standing (qiyam)" },
    how: { ar: "نَقِفُ وَنَقْرَأُ الفَاتِحَة", en: "Stand and recite Al-Fatiha" },
    hint: { ar: "نَقِفُ وَنَقْرَأُ قَبْلَ الرُّكُوع", en: "We stand and recite before bowing" },
  },
  ruku: {
    id: "ruku",
    kind: "body",
    img: salahRuku,
    title: { ar: "الرُّكُوع", en: "Bowing (ruku')" },
    how: {
      ar: "نَنْحَنِي وَنَضَعُ اليَدَيْنِ عَلَى الرُّكْبَتَيْن",
      en: "Bow with your hands on your knees",
    },
    hint: { ar: "بَعْدَ القِرَاءَةِ نَرْكَع", en: "After reciting, we bow" },
  },
  qawmah: {
    id: "qawmah",
    kind: "body",
    img: salahQiyam,
    title: { ar: "الرَّفْعُ مِنَ الرُّكُوع", en: "Rising (qawmah)" },
    how: { ar: "نَرْفَعُ وَنَقِفُ مُسْتَقِيمِين", en: "Rise and stand up straight" },
    hint: { ar: "بَعْدَ الرُّكُوعِ نَقِفُ مِنْ جَدِيد", en: "After bowing, we stand up again" },
  },
  sujud: {
    id: "sujud",
    kind: "body",
    img: salahSujud,
    title: { ar: "السَّجْدَةُ الأُولَى", en: "First prostration (sujud)" },
    how: {
      ar: "نَسْجُدُ: الجَبْهَةُ وَالأَنْفُ عَلَى الأَرْض",
      en: "Forehead and nose on the ground",
    },
    hint: { ar: "بَعْدَ الوُقُوفِ نَسْجُد", en: "After standing, we prostrate" },
  },
  jalsah: {
    id: "jalsah",
    kind: "body",
    img: salahJalsah,
    title: { ar: "الجِلْسَةُ بَيْنَ السَّجْدَتَيْن", en: "Sitting between (jalsah)" },
    how: {
      ar: "نَجْلِسُ بِهُدُوءٍ بَيْنَ السَّجْدَتَيْن",
      en: "Sit calmly between the two prostrations",
    },
    hint: { ar: "بَيْنَ السَّجْدَتَيْنِ نَجْلِس", en: "Between the two prostrations, we sit" },
  },
  sujud2: {
    id: "sujud2",
    kind: "body",
    img: salahSujud,
    title: { ar: "السَّجْدَةُ الثَّانِيَة", en: "Second prostration" },
    how: { ar: "نَسْجُدُ مَرَّةً ثَانِيَة", en: "Prostrate a second time" },
    hint: { ar: "فِي كُلِّ رَكْعَةٍ سَجْدَتَان", en: "Every rak'ah has two prostrations" },
  },
  tashahhud1: {
    id: "tashahhud1",
    kind: "say",
    img: salahTashahhud,
    title: { ar: "التَّشَهُّدُ الأَوَّل", en: "First tashahhud" },
    how: {
      ar: "نَجْلِسُ وَنَقْرَأُ التَّشَهُّد، ثُمَّ نَقُومُ",
      en: "Sit and recite the tashahhud, then stand up",
    },
    hint: {
      ar: "بَعْدَ الرَّكْعَةِ الثَّانِيَةِ نَجْلِسُ لِلتَّشَهُّد",
      en: "After the second rak'ah we sit for tashahhud",
    },
  },
  tashahhud: {
    id: "tashahhud",
    kind: "say",
    img: salahTashahhud,
    title: { ar: "التَّشَهُّدُ الأَخِير", en: "Final tashahhud" },
    how: { ar: "نَجْلِسُ وَنَقْرَأُ التَّشَهُّد", en: "Sit and recite the tashahhud" },
    hint: {
      ar: "فِي آخِرِ الصَّلَاةِ نَجْلِسُ لِلتَّشَهُّد",
      en: "At the end of prayer we sit for tashahhud",
    },
  },
  salam: {
    id: "salam",
    kind: "say",
    img: salahTashahhud,
    title: { ar: "التَّسْلِيم", en: "Salam" },
    how: {
      ar: "نَلْتَفِتُ يَمِينًا ثُمَّ يَسَارًا وَنَقُول: السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ الله",
      en: "Turn right, then left: Assalamu alaykum wa rahmatullah",
    },
    hint: { ar: "الصَّلَاةُ تَنْتَهِي بِالسَّلَام", en: "Prayer ends with salam" },
    say: { ar: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ الله", en: "Assalamu alaykum wa rahmatullah" },
  },
} satisfies Record<string, Step>;
export type StageId = keyof typeof SALAH_STAGES;

/** One rak'ah cycle as taught on its own (Arrange / Practice / Identify). */
export const RAKAH_CYCLE: readonly Step[] = (
  ["takbir", "qiyam", "ruku", "qawmah", "sujud", "jalsah", "sujud2"] as const
).map((id) => SALAH_STAGES[id]);

export type PrayerStep = Step & { rakah: number };
/** Full prayer: the cycle repeats per rak'ah; first tashahhud after rak'ah 2 when longer; final tashahhud + salam at the end. */
export function buildPrayer(rakahs: number): PrayerStep[] {
  const out: PrayerStep[] = [];
  for (let r = 1; r <= rakahs; r++) {
    const ids: StageId[] = [
      r === 1 ? "takbir" : "qiyam",
      ...(r === 1 ? (["qiyam"] as StageId[]) : []),
      "ruku",
      "qawmah",
      "sujud",
      "jalsah",
      "sujud2",
    ];
    if (r === 2 && rakahs > 2) ids.push("tashahhud1");
    if (r === rakahs) ids.push("tashahhud", "salam");
    for (const id of ids) out.push({ ...SALAH_STAGES[id], rakah: r });
  }
  return out;
}

export type Prayer = { id: string; e: string; name: Bi; rakahs: 2 | 3 | 4 };
export const PRAYERS: readonly Prayer[] = [
  { id: "fajr", e: "🌅", name: { ar: "الفَجْر", en: "Fajr" }, rakahs: 2 },
  { id: "dhuhr", e: "☀️", name: { ar: "الظُّهْر", en: "Dhuhr" }, rakahs: 4 },
  { id: "asr", e: "🌤️", name: { ar: "العَصْر", en: "Asr" }, rakahs: 4 },
  { id: "maghrib", e: "🌇", name: { ar: "المَغْرِب", en: "Maghrib" }, rakahs: 3 },
  { id: "isha", e: "🌙", name: { ar: "العِشَاء", en: "Isha" }, rakahs: 4 },
];

export const WUDU_VIDEO: string = wuduVideoUrl;
/** Salah video drops in automatically once src/assets/salah/salah-video.mp4 (or .webm) is added. */
const salahVideoGlob = import.meta.glob("/src/assets/salah/salah-video.{mp4,webm}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
export const SALAH_VIDEO: string | null = Object.values(salahVideoGlob)[0] ?? null;

export type Activity = "learn" | "arrange" | "practice" | "identify" | "rakah";
export const ACTIVITIES: readonly { id: Activity; e: string; title: Bi; detail: Bi }[] = [
  {
    id: "learn",
    e: "📖",
    title: { ar: "تَعَلَّم", en: "Learn" },
    detail: { ar: "خُطْوَةً خُطْوَة", en: "One step at a time" },
  },
  {
    id: "arrange",
    e: "🧩",
    title: { ar: "رَتِّب", en: "Arrange" },
    detail: { ar: "ضَعِ الخُطُوَاتِ بِالتَّرْتِيب", en: "Put the steps in order" },
  },
  {
    id: "practice",
    e: "🙌",
    title: { ar: "تَدَرَّب", en: "Practice" },
    detail: { ar: "اخْتَرِ الصُّورَةَ الصَّحِيحَة", en: "Pick the right picture" },
  },
  {
    id: "identify",
    e: "🔍",
    title: { ar: "مَاذَا يَفْعَل؟", en: "Identify" },
    detail: { ar: "مَا هَذِهِ الخُطْوَة؟ وَمَاذَا بَعْدَهَا؟", en: "Name it, or what comes next" },
  },
  {
    id: "rakah",
    e: "🕌",
    title: { ar: "تَحَدِّي الرَّكَعَات", en: "Rak'ah Challenge" },
    detail: { ar: "كَمْ رَكْعَةً فِي كُلِّ صَلَاة؟", en: "How many rak'ahs in each prayer?" },
  },
];

export const TOPICS: Record<Topic, { e: string; title: Bi }> = {
  wudu: { e: "💧", title: { ar: "الوُضُوء", en: "Wudu" } },
  salah: { e: "🧎", title: { ar: "الصَّلَاة", en: "Salah" } },
};

/** All UI copy for the game, bilingual. */
export const T = {
  game: { ar: "الوُضُوءُ وَالصَّلَاة", en: "Wudu & Salah" },
  activities: { ar: "الأَنْشِطَة", en: "Activities" },
  watch: { ar: "شَاهِدِ الفِيدْيُو", en: "Watch the video" },
  videoSoon: { ar: "فِيدْيُو الصَّلَاةِ قَرِيبًا", en: "Salah video coming soon" },
  videoNote: {
    ar: "شَاهِدْ ثُمَّ تَعَلَّمْ كُلَّ خُطْوَةٍ وَحْدَهَا",
    en: "Watch, then learn each step on its own",
  },
  stepOf: { ar: "خُطْوَة", en: "Step" },
  rakahOf: { ar: "الرَّكْعَة", en: "Rak'ah" },
  of: { ar: "مِنْ", en: "of" },
  before: { ar: "قَبْلَ المَاء", en: "Before the water" },
  heart: { ar: "فِي القَلْب", en: "In the heart" },
  sayIt: { ar: "قُلْهَا", en: "Say it" },
  next: { ar: "التَّالِي", en: "Next" },
  back: { ar: "السَّابِق", en: "Back" },
  hear: { ar: "اسْتَمِع", en: "Listen" },
  again: { ar: "مَرَّةً أُخْرَى", en: "Again" },
  done: { ar: "تَمّ", en: "Done" },
  startOver: { ar: "مِنْ جَدِيد", en: "Start over" },
  pickPrayer: { ar: "اخْتَرْ صَلَاة", en: "Choose a prayer" },
  rakahs: { ar: "رَكَعَات", en: "rak'ahs" },
  rakahWord: { ar: "رَكْعَة", en: "rak'ah" },
  arrangeWudu: { ar: "رَتِّبْ خُطُوَاتِ الغَسْلِ وَالمَسْح", en: "Put the washing steps in order" },
  arrangeSalah: {
    ar: "رَتِّبْ خُطُوَاتِ الرَّكْعَةِ الأُولَى",
    en: "Put the first rak'ah in order",
  },
  arrangeReady: {
    ar: "النِّيَّةُ وَالبَسْمَلَةُ أَوَّلًا ✓",
    en: "Intention and Bismillah come first ✓",
  },
  pickPicture: {
    ar: "أَيُّ صُورَةٍ تُظْهِرُ هَذِهِ الخُطْوَة؟",
    en: "Which picture shows this step?",
  },
  whatDoing: { ar: "مَاذَا يَفْعَلُ حَمَد؟", en: "What is Hamad doing?" },
  whatNext: { ar: "مَاذَا يَأْتِي بَعْدَ هَذِه؟", en: "What comes next?" },
  howMany: { ar: "كَمْ رَكْعَةً فِي صَلَاةِ", en: "How many rak'ahs in" },
  has: { ar: "فِيهَا", en: "has" },
  mama: { ar: "مَامَا", en: "Mama" },
  winWudu: {
    ar: "وُضُوءٌ جَمِيل! أَنْتَ جَاهِزٌ لِلصَّلَاة",
    en: "Beautiful wudu! You're ready to pray",
  },
  winSalah: { ar: "مَا شَاءَ الله! صَلَاةٌ جَمِيلَة", en: "Masha'Allah! A beautiful prayer" },
  winRakah: {
    ar: "تَعْرِفُ رَكَعَاتِ الصَّلَوَاتِ الخَمْس!",
    en: "You know the rak'ahs of all five prayers!",
  },
  voice: { ar: "الصَّوْت", en: "Voice" },
  sameImage: { ar: "نَفْسُ وَضْعِ القِيَام", en: "Same pose as standing" },
} satisfies Record<string, Bi>;

export const PRAISE: readonly Bi[] = [
  { ar: "أَحْسَنْت!", en: "Well done!" },
  { ar: "مَا شَاءَ الله!", en: "Masha'Allah!" },
  { ar: "رَائِع!", en: "Wonderful!" },
  { ar: "بَارَكَ اللهُ فِيك!", en: "Barak Allahu feek!" },
];
export const TRY_AGAIN: Bi = {
  ar: "لَا بَأْس، حَاوِلْ مَرَّةً أُخْرَى",
  en: "That's okay — try again",
};

/** Mama's short, contextual guidance per activity. */
export const MAMA: Record<Activity, Record<Topic, Bi>> = {
  learn: {
    wudu: {
      ar: "يَا حَبِيبِي، نَتَوَضَّأُ قَبْلَ الصَّلَاة. اضْغَطِ التَّالِي لِتَرَى كُلَّ خُطْوَة",
      en: "Sweetheart, we make wudu before prayer. Tap Next to see each step",
    },
    salah: {
      ar: "كُلُّ رَكْعَةٍ فِيهَا رُكُوعٌ وَسَجْدَتَان. اخْتَرْ صَلَاةً وَتَابِع",
      en: "Each rak'ah has one bow and two prostrations. Choose a prayer and follow along",
    },
  },
  arrange: {
    wudu: {
      ar: "مِنَ اليَدَيْنِ إِلَى القَدَمَيْن، مِنْ فَوْقُ إِلَى تَحْت",
      en: "From hands to feet — top to bottom",
    },
    salah: {
      ar: "نَبْدَأُ بِاللهِ أَكْبَر، ثُمَّ نَقِفُ وَنَقْرَأ",
      en: "We begin with Allahu Akbar, then stand and recite",
    },
  },
  practice: {
    wudu: {
      ar: "اسْتَمِعْ لِلْخُطْوَة، ثُمَّ اخْتَرِ الصُّورَة",
      en: "Listen to the step, then pick the picture",
    },
    salah: {
      ar: "اسْتَمِعْ لِلْخُطْوَة، ثُمَّ اخْتَرِ الصُّورَة",
      en: "Listen to the step, then pick the picture",
    },
  },
  identify: {
    wudu: {
      ar: "انْظُرْ إِلَى يَدَيْ حَمَد. أَيْنَ هُمَا؟",
      en: "Look at Hamad's hands. Where are they?",
    },
    salah: {
      ar: "هَلْ هُوَ وَاقِفٌ أَمْ رَاكِعٌ أَمْ سَاجِد؟",
      en: "Is he standing, bowing, or prostrating?",
    },
  },
  rakah: {
    wudu: {
      ar: "الفَجْرُ قَصِيرَة، وَالمَغْرِبُ ثَلَاث",
      en: "Fajr is short, and Maghrib has three",
    },
    salah: {
      ar: "الفَجْرُ قَصِيرَة، وَالمَغْرِبُ ثَلَاث",
      en: "Fajr is short, and Maghrib has three",
    },
  },
};

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
export const arNum = (n: number) => String(n).replace(/\d/g, (d) => AR_DIGITS[Number(d)]!);
