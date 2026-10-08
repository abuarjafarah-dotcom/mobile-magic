// Interactive Qur'an world — data-driven content. All Arabic words use full harakat.
// Qur'an references below are verified surah namesakes/mentions only.

export type WorldWord = { id: string; arabic: string; english: string; emoji: string };

export const words: Record<string, WorldWord> = {
  najm: { id: "najm", arabic: "نَجْم", english: "Star", emoji: "⭐" },
  qamar: { id: "qamar", arabic: "قَمَر", english: "Moon", emoji: "🌙" },
  shams: { id: "shams", arabic: "شَمْس", english: "Sun", emoji: "☀️" },
  layl: { id: "layl", arabic: "لَيْل", english: "Night", emoji: "🌃" },
  nahar: { id: "nahar", arabic: "نَهَار", english: "Day", emoji: "🌞" },
  samaa: { id: "samaa", arabic: "سَمَاء", english: "Sky", emoji: "🌌" },
  matar: { id: "matar", arabic: "مَطَر", english: "Rain", emoji: "🌧️" },
  maa: { id: "maa", arabic: "مَاء", english: "Water", emoji: "💧" },
  jabal: { id: "jabal", arabic: "جَبَل", english: "Mountain", emoji: "⛰️" },
  shajara: { id: "shajara", arabic: "شَجَرَة", english: "Tree", emoji: "🌴" },
  zahra: { id: "zahra", arabic: "زَهْرَة", english: "Flower", emoji: "🌸" },
  janna: { id: "janna", arabic: "جَنَّة", english: "Garden", emoji: "🏞️" },
  ard: { id: "ard", arabic: "أَرْض", english: "Earth", emoji: "🌍" },
  nur: { id: "nur", arabic: "نُور", english: "Light", emoji: "✨" },
  bahr: { id: "bahr", arabic: "بَحْر", english: "Sea", emoji: "🌊" },
};

export type WorldScene = {
  id: string;
  titleAr: string;
  titleEn: string;
  emoji: string;
  sky: string; // tailwind gradient classes
  wordIds: string[];
};

export const scenes: WorldScene[] = [
  { id: "night", titleAr: "سَمَاءُ اللَّيْل", titleEn: "Night Sky", emoji: "🌙", sky: "from-indigo-900 via-indigo-700 to-purple-800", wordIds: ["najm", "qamar", "layl", "samaa"] },
  { id: "garden", titleAr: "الْجَنَّة", titleEn: "Garden", emoji: "🌳", sky: "from-emerald-300 via-green-200 to-lime-200", wordIds: ["shajara", "zahra", "janna", "maa"] },
  { id: "day", titleAr: "النَّهَار", titleEn: "Sunny Day", emoji: "☀️", sky: "from-sky-300 via-amber-100 to-yellow-200", wordIds: ["shams", "nahar", "nur", "samaa"] },
  { id: "earth", titleAr: "الْأَرْض", titleEn: "Earth & Rain", emoji: "⛰️", sky: "from-slate-400 via-teal-200 to-emerald-200", wordIds: ["matar", "ard", "jabal", "bahr"] },
];

export type QuranAnimal = { id: string; arabic: string; english: string; emoji: string; refAr: string; refEn: string };

export const animals: QuranAnimal[] = [
  { id: "fil", arabic: "فِيل", english: "Elephant", emoji: "🐘", refAr: "سُورَةُ الْفِيل", refEn: "Surah Al-Fil (105)" },
  { id: "naqa", arabic: "نَاقَة", english: "She-camel", emoji: "🐪", refAr: "سُورَةُ الشَّمْس ٩١:١٣", refEn: "Surah Ash-Shams 91:13" },
  { id: "baqara", arabic: "بَقَرَة", english: "Cow", emoji: "🐄", refAr: "سُورَةُ الْبَقَرَة", refEn: "Surah Al-Baqarah (2)" },
  { id: "nahl", arabic: "نَحْل", english: "Bee", emoji: "🐝", refAr: "سُورَةُ النَّحْل", refEn: "Surah An-Nahl (16)" },
  { id: "ankabut", arabic: "عَنْكَبُوت", english: "Spider", emoji: "🕷️", refAr: "سُورَةُ الْعَنْكَبُوت", refEn: "Surah Al-Ankabut (29)" },
  { id: "hudhud", arabic: "هُدْهُد", english: "Hoopoe", emoji: "🐦", refAr: "سُورَةُ النَّمْل", refEn: "Surah An-Naml (27)" },
  { id: "naml", arabic: "نَمْل", english: "Ant", emoji: "🐜", refAr: "سُورَةُ النَّمْل ٢٧:١٨", refEn: "Surah An-Naml 27:18" },
];

export type StoryLine = { speaker: "hamad" | "talal"; audioKey: string; ar: string; en: string };
export type QuranStory = {
  id: string;
  titleAr: string;
  titleEn: string;
  emoji: string;
  sky: string;
  lines: StoryLine[];
  tapWordId: string; // word the child taps at the end
  tapPromptAr: string;
  tapPromptEn: string;
};

export const stories: QuranStory[] = [
  {
    id: "night-sky",
    titleAr: "حَمَد وَالْقَمَر",
    titleEn: "Hamad and the Moon",
    emoji: "🌙",
    sky: "from-indigo-900 via-indigo-700 to-purple-800",
    lines: [
      { speaker: "talal", audioKey: "iq-story1-1", ar: "يَا حَمَدُ، انْظُرْ إِلَى السَّمَاءِ!", en: "Hamad, look at the sky!" },
      { speaker: "hamad", audioKey: "iq-story1-2", ar: "وَاو! أَرَى الْقَمَرَ!", en: "Wow! I see the moon!" },
      { speaker: "talal", audioKey: "iq-story1-3", ar: "وَالنُّجُومُ جَمِيلَةٌ جِدًّا!", en: "And the stars are so beautiful!" },
      { speaker: "hamad", audioKey: "iq-story1-4", ar: "سُبْحَانَ اللهِ! اللهُ خَلَقَ كُلَّ شَيْءٍ.", en: "SubhanAllah! Allah created everything." },
    ],
    tapWordId: "qamar",
    tapPromptAr: "أَيْنَ الْقَمَرُ؟ اضْغَطْ عَلَيْهِ!",
    tapPromptEn: "Where is the moon? Tap it!",
  },
  {
    id: "bee",
    titleAr: "طَلال وَالنَّحْلَة",
    titleEn: "Talal and the Bee",
    emoji: "🐝",
    sky: "from-amber-200 via-yellow-100 to-lime-200",
    lines: [
      { speaker: "hamad", audioKey: "iq-story2-1", ar: "يَا طَلالُ، مَا هَذَا الصَّوْتُ؟", en: "Talal, what is that sound?" },
      { speaker: "talal", audioKey: "iq-story2-2", ar: "إِنَّهَا النَّحْلَةُ! تَصْنَعُ الْعَسَلَ.", en: "It's the bee! It makes honey." },
      { speaker: "hamad", audioKey: "iq-story2-3", ar: "الْعَسَلُ فِيهِ شِفَاءٌ لِلنَّاسِ!", en: "Honey has healing for people!" },
      { speaker: "talal", audioKey: "iq-story2-4", ar: "الْحَمْدُ لِلَّهِ عَلَى هَذِهِ النِّعَمِ.", en: "Alhamdulillah for these blessings." },
    ],
    tapWordId: "nahl",
    tapPromptAr: "أَيْنَ النَّحْلَةُ؟ اضْغَطْ عَلَيْهَا!",
    tapPromptEn: "Where is the bee? Tap it!",
  },
];

// Extra word entries used by stories/animals but not in scenes
export const extraWords: Record<string, WorldWord> = {
  nahl: { id: "nahl", arabic: "نَحْل", english: "Bee", emoji: "🐝" },
  fil: { id: "fil", arabic: "فِيل", english: "Elephant", emoji: "🐘" },
  naqa: { id: "naqa", arabic: "نَاقَة", english: "She-camel", emoji: "🐪" },
  hudhud: { id: "hudhud", arabic: "هُدْهُد", english: "Hoopoe", emoji: "🐦" },
};

export function wordById(id: string): WorldWord {
  return words[id] ?? extraWords[id] ?? { id, arabic: id, english: id, emoji: "✨" };
}
