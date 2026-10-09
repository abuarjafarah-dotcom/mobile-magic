// Juz 27: Surahs 56-66 (Al-Waqi'ah through At-Tahrim)
// Ahmad Al-Nufais (QUL/Tarteel recitation 42), Uthmani text (quran.com)
import type { SurahData } from "./surahs";

const v = (arabic: string, audio: string, wordTimings: number[][]) => ({ arabic, audio, wordTimings });

export const juz27Surahs: readonly SurahData[] = [
  { id: "alwaqiah", number: 56, name: "Surah Al-Waqi'ah", arabicName: "سورة الواقعة", reciter: "Ahmad Al-Nufais", tone: "mint", scene: "trees", verses: [
    v("إِذَا وَقَعَتِ ٱلْوَاقِعَةُ", "https://audio-cdn.tarteel.ai/quran/alnufais/056001.mp3", [[0,0]]),
    v("لَيْسَ لِوَقْعَتِهَا كَاذِبَةٌ", "https://audio-cdn.tarteel.ai/quran/alnufais/056002.mp3", [[0,0]]),
    v("خَافِضَةٌ رَّافِعَةٌ", "https://audio-cdn.tarteel.ai/quran/alnufais/056003.mp3", [[0,0]]),
    v("إِذَا رُجَّتِ ٱلْأَرْضُ رَجًّا", "https://audio-cdn.tarteel.ai/quran/alnufais/056004.mp3", [[0,0]]),
    v("وَبُسَّتِ ٱلْجِبَالُ بَسًّا", "https://audio-cdn.tarteel.ai/quran/alnufais/056005.mp3", [[0,0]]),
    v("فَكَانَتْ هَبَآءً مُّنۢبَثًّا", "https://audio-cdn.tarteel.ai/quran/alnufais/056006.mp3", [[0,0]]),
    v("وَكُنتُمْ أَزْوَٰجًا ثَلَـٰثَةً", "https://audio-cdn.tarteel.ai/quran/alnufais/056007.mp3", [[0,0]]),
  ] },
  { id: "alhadid", number: 57, name: "Surah Al-Hadid", arabicName: "سورة الحديد", reciter: "Ahmad Al-Nufais", tone: "sky", scene: "foliage", verses: [
    v("سَبَّحَ لِلَّهِ مَا فِى ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ وَهُوَ ٱلْعَزِيزُ ٱلْحَكِيمُ", "https://audio-cdn.tarteel.ai/quran/alnufais/057001.mp3", [[0,0]]),
    v("لَهُ ۥ مُلْكُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ ۖ يُحْىِ وَيُمِيتُ ۖ وَهُوَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ", "https://audio-cdn.tarteel.ai/quran/alnufais/057002.mp3", [[0,0]]),
    v("هُوَ ٱلْأَوَّلُ وَٱلْآخِرُ وَٱلظَّـٰهِرُ وَٱلْبَاطِنُ ۖ وَهُوَ بِكُلِّ شَىْءٍ عَلِيمٌ", "https://audio-cdn.tarteel.ai/quran/alnufais/057003.mp3", [[0,0]]),
    v("هُوَ ٱلَّذِى خَلَقَ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ فِى سِتَّةِ أَيَّامٍ", "https://audio-cdn.tarteel.ai/quran/alnufais/057004.mp3", [[0,0]]),
  ] },
  { id: "almujadilah", number: 58, name: "Surah Al-Mujadilah", arabicName: "سورة المجادلة", reciter: "Ahmad Al-Nufais", tone: "berry", scene: "dawn", verses: [
    v("قَدْ سَمِعَ ٱللَّهُ قَوْلَ ٱلَّتِى تُجَـٰدِلُكَ فِى زَوْجِهَا", "https://audio-cdn.tarteel.ai/quran/alnufais/058001.mp3", [[0,0]]),
  ] },
  { id: "alhashr", number: 59, name: "Surah Al-Hashr", arabicName: "سورة الحشر", reciter: "Ahmad Al-Nufais", tone: "sun", scene: "flowers", verses: [
    v("سَبَّحَ لِلَّهِ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ", "https://audio-cdn.tarteel.ai/quran/alnufais/059001.mp3", [[0,0]]),
  ] },
  { id: "almumtahanah", number: 60, name: "Surah Al-Mumtahanah", arabicName: "سورة الممتحنة", reciter: "Ahmad Al-Nufais", tone: "mint", scene: "trees", verses: [
    v("يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا تَتَّخِذُوا۟ عَدُوِّى وَعَدُوَّكُمْ أَوْلِيَآءَ", "https://audio-cdn.tarteel.ai/quran/alnufais/060001.mp3", [[0,0]]),
  ] },
  { id: "assaff", number: 61, name: "Surah As-Saff", arabicName: "سورة الصف", reciter: "Ahmad Al-Nufais", tone: "sky", scene: "foliage", verses: [
    v("سَبَّحَ لِلَّهِ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۖ وَهُوَ ٱلْعَزِيزُ ٱلْحَكِيمُ", "https://audio-cdn.tarteel.ai/quran/alnufais/061001.mp3", [[0,0]]),
  ] },
  { id: "aljumuah", number: 62, name: "Surah Al-Jumu'ah", arabicName: "سورة الجمعة", reciter: "Ahmad Al-Nufais", tone: "berry", scene: "dawn", verses: [
    v("يُسَبِّحُ لِلَّهِ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ٱلْمَلِكِ ٱلْقُدُّوسِ ٱلْعَزِيزِ ٱلْحَكِيمِ", "https://audio-cdn.tarteel.ai/quran/alnufais/062001.mp3", [[0,0]]),
  ] },
  { id: "almunafiqun", number: 63, name: "Surah Al-Munafiqun", arabicName: "سورة المنافقون", reciter: "Ahmad Al-Nufais", tone: "sun", scene: "flowers", verses: [
    v("إِذَا جَآءَكَ ٱلْمُنَـٰفِقُونَ قَالُوا۟ نَشْهَدُ أَنَّكَ لَرَسُولُ ٱللَّهِ", "https://audio-cdn.tarteel.ai/quran/alnufais/063001.mp3", [[0,0]]),
  ] },
  { id: "attaghabun", number: 64, name: "Surah At-Taghabun", arabicName: "سورة التغابن", reciter: "Ahmad Al-Nufais", tone: "mint", scene: "trees", verses: [
    v("يُسَبِّحُ لِلَّهِ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ", "https://audio-cdn.tarteel.ai/quran/alnufais/064001.mp3", [[0,0]]),
  ] },
  { id: "attalaq", number: 65, name: "Surah At-Talaq", arabicName: "سورة الطلاق", reciter: "Ahmad Al-Nufais", tone: "sky", scene: "foliage", verses: [
    v("يَـٰٓأَيُّهَا ٱلنَّبِىُّ إِذَا طَلَّقْتُمُ ٱلنِّسَآءَ فَطَلِّقُوهُنَّ لِعِدَّتِهِنَّ", "https://audio-cdn.tarteel.ai/quran/alnufais/065001.mp3", [[0,0]]),
  ] },
  { id: "attahrim", number: 66, name: "Surah At-Tahrim", arabicName: "سورة التحريم", reciter: "Ahmad Al-Nufais", tone: "berry", scene: "dawn", verses: [
    v("يَـٰٓأَيُّهَا ٱلنَّبِىُّ لِمَ تُحَرِّمُ مَا أَحَلَّ ٱللَّهُ لَكَ", "https://audio-cdn.tarteel.ai/quran/alnufais/066001.mp3", [[0,0]]),
  ] },
];
