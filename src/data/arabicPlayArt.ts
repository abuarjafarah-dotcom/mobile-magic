/**
 * Picture cut-outs for the Harakat Slot Machine and Finger Tracing games.
 * Sliced from Farah's Gemini sheets into transparent WebP in src/assets/arabicplay/.
 * To replace a picture, overwrite the .webp with the same filename.
 */
import kataba from "@/assets/arabicplay/kataba.webp";
import fataha from "@/assets/arabicplay/fataha.webp";
import dhahaba from "@/assets/arabicplay/dhahaba.webp";
import jalasa from "@/assets/arabicplay/jalasa.webp";
import dakhala from "@/assets/arabicplay/dakhala.webp";
import kharaja from "@/assets/arabicplay/kharaja.webp";
import rasama from "@/assets/arabicplay/rasama.webp";
import shariba from "@/assets/arabicplay/shariba.webp";
import laiba from "@/assets/arabicplay/laiba.webp";
import fariha from "@/assets/arabicplay/fariha.webp";
import kabura from "@/assets/arabicplay/kabura.webp";
import qalam from "@/assets/arabicplay/qalam.webp";
import qamar from "@/assets/arabicplay/qamar.webp";
import jamal from "@/assets/arabicplay/jamal.webp";
import asad from "@/assets/arabicplay/asad.webp";
import walad from "@/assets/arabicplay/walad.webp";
import letter01 from "@/assets/arabicplay/letter-01.webp";
import letter02 from "@/assets/arabicplay/letter-02.webp";
import letter03 from "@/assets/arabicplay/letter-03.webp";
import letter04 from "@/assets/arabicplay/letter-04.webp";
import letter05 from "@/assets/arabicplay/letter-05.webp";
import letter06 from "@/assets/arabicplay/letter-06.webp";
import letter07 from "@/assets/arabicplay/letter-07.webp";
import letter08 from "@/assets/arabicplay/letter-08.webp";
import letter09 from "@/assets/arabicplay/letter-09.webp";
import letter10 from "@/assets/arabicplay/letter-10.webp";
import letter11 from "@/assets/arabicplay/letter-11.webp";
import letter12 from "@/assets/arabicplay/letter-12.webp";
import letter13 from "@/assets/arabicplay/letter-13.webp";
import letter14 from "@/assets/arabicplay/letter-14.webp";
import letter15 from "@/assets/arabicplay/letter-15.webp";
import letter16 from "@/assets/arabicplay/letter-16.webp";
import letter17 from "@/assets/arabicplay/letter-17.webp";
import letter18 from "@/assets/arabicplay/letter-18.webp";
import letter19 from "@/assets/arabicplay/letter-19.webp";
import letter20 from "@/assets/arabicplay/letter-20.webp";
import letter21 from "@/assets/arabicplay/letter-21.webp";
import letter22 from "@/assets/arabicplay/letter-22.webp";
import letter23 from "@/assets/arabicplay/letter-23.webp";
import letter24 from "@/assets/arabicplay/letter-24.webp";
import letter25 from "@/assets/arabicplay/letter-25.webp";
import letter26 from "@/assets/arabicplay/letter-26.webp";
import letter27 from "@/assets/arabicplay/letter-27.webp";
import letter28 from "@/assets/arabicplay/letter-28.webp";
import salahRuku from "@/assets/salah/salah-ruku.webp";
import salahSujud from "@/assets/salah/salah-sujud.webp";

export type PicWord = { id: string; ar: string; en: string; img: string };
export type LetterCard = { letter: string; word: string; en: string; img: string };

/** Level 1–2 verbs (Hamad & Talal doing the action). ركع/سجد reuse the salah art. */
export const VERB_PICS: PicWord[] = [
  { id: "kataba", ar: "كَتَبَ", en: "wrote", img: kataba },
  { id: "fataha", ar: "فَتَحَ", en: "opened", img: fataha },
  { id: "dhahaba", ar: "ذَهَبَ", en: "went", img: dhahaba },
  { id: "jalasa", ar: "جَلَسَ", en: "sat", img: jalasa },
  { id: "dakhala", ar: "دَخَلَ", en: "entered", img: dakhala },
  { id: "kharaja", ar: "خَرَجَ", en: "went out", img: kharaja },
  { id: "rasama", ar: "رَسَمَ", en: "drew", img: rasama },
  { id: "shariba", ar: "شَرِبَ", en: "drank", img: shariba },
  { id: "laiba", ar: "لَعِبَ", en: "played", img: laiba },
  { id: "fariha", ar: "فَرِحَ", en: "was happy", img: fariha },
  { id: "kabura", ar: "كَبُرَ", en: "grew up", img: kabura },
];

/** Level 3 nouns (sukun when stopped). */
export const NOUN_PICS: PicWord[] = [
  { id: "qalam", ar: "قَلَمْ", en: "pen", img: qalam },
  { id: "qamar", ar: "قَمَرْ", en: "moon", img: qamar },
  { id: "jamal", ar: "جَمَلْ", en: "camel", img: jamal },
  { id: "asad", ar: "أَسَدْ", en: "lion", img: asad },
  { id: "walad", ar: "وَلَدْ", en: "boy", img: walad },
];

/** One picture per letter, in alphabet order, for the sand-tray reward. */
export const LETTER_CARDS: LetterCard[] = [
  { letter: "ا", word: "أَرْنَب", en: "rabbit", img: letter01 },
  { letter: "ب", word: "بَطَّة", en: "duck", img: letter02 },
  { letter: "ت", word: "تُفَّاحَة", en: "apple", img: letter03 },
  { letter: "ث", word: "ثَعْلَب", en: "fox", img: letter04 },
  { letter: "ج", word: "جَزَرَة", en: "carrot", img: letter05 },
  { letter: "ح", word: "حِصَان", en: "horse", img: letter06 },
  { letter: "خ", word: "خَرُوف", en: "sheep", img: letter07 },
  { letter: "د", word: "دُبّ", en: "bear", img: letter08 },
  { letter: "ذ", word: "ذُرَة", en: "corn", img: letter09 },
  { letter: "ر", word: "رُمَّان", en: "pomegranate", img: letter10 },
  { letter: "ز", word: "زَرَافَة", en: "giraffe", img: letter11 },
  { letter: "س", word: "سَمَكَة", en: "fish", img: letter12 },
  { letter: "ش", word: "شَمْس", en: "sun", img: letter13 },
  { letter: "ص", word: "صَقْر", en: "falcon", img: letter14 },
  { letter: "ض", word: "ضِفْدَع", en: "frog", img: letter15 },
  { letter: "ط", word: "طَائِرَة", en: "airplane", img: letter16 },
  { letter: "ظ", word: "ظَرْف", en: "envelope", img: letter17 },
  { letter: "ع", word: "عِنَب", en: "grapes", img: letter18 },
  { letter: "غ", word: "غَيْمَة", en: "cloud", img: letter19 },
  { letter: "ف", word: "فَرَاشَة", en: "butterfly", img: letter20 },
  { letter: "ق", word: "قِطَّة", en: "cat", img: letter21 },
  { letter: "ك", word: "كِتَاب", en: "book", img: letter22 },
  { letter: "ل", word: "لَيْمُونَة", en: "lemon", img: letter23 },
  { letter: "م", word: "مَوْزَة", en: "banana", img: letter24 },
  { letter: "ن", word: "نَحْلَة", en: "bee", img: letter25 },
  { letter: "ه", word: "هِلَال", en: "crescent moon", img: letter26 },
  { letter: "و", word: "وَرْدَة", en: "rose", img: letter27 },
  { letter: "ي", word: "يَد", en: "hand", img: letter28 },
];

/* ---------------- Harakat Slot Machine words ---------------- */

/** One reel per letter: the letter with its haraka, in reading order. */
export type SlotWord = PicWord & { reels: [string, string, string] };
export type SlotLevel = {
  id: string;
  title: { ar: string; en: string };
  hint: { ar: string; en: string };
  words: SlotWord[];
};

const pic = (id: string) => [...VERB_PICS, ...NOUN_PICS].find((p) => p.id === id)!;
const w = (id: string, reels: [string, string, string]): SlotWord => ({ ...pic(id), reels });

export const SLOT_LEVELS: SlotLevel[] = [
  {
    id: "fatha",
    title: { ar: "الفَتْحَة", en: "Fatha words" },
    hint: { ar: "كلُّ الحروفِ بالفَتْحَة", en: "Every letter has a fatha" },
    words: [
      w("kataba", ["كَ", "تَ", "بَ"]),
      w("fataha", ["فَ", "تَ", "حَ"]),
      w("dhahaba", ["ذَ", "هَ", "بَ"]),
      w("jalasa", ["جَ", "لَ", "سَ"]),
      w("dakhala", ["دَ", "خَ", "لَ"]),
      w("kharaja", ["خَ", "رَ", "جَ"]),
      w("rasama", ["رَ", "سَ", "مَ"]),
      { id: "rakaa", ar: "رَكَعَ", en: "bowed", img: salahRuku, reels: ["رَ", "كَ", "عَ"] },
      { id: "sajada", ar: "سَجَدَ", en: "prostrated", img: salahSujud, reels: ["سَ", "جَ", "دَ"] },
    ],
  },
  {
    id: "kasra-damma",
    title: { ar: "الكَسْرَة والضَّمَّة", en: "Kasra & damma" },
    hint: { ar: "انتبه للحرف الأوسط", en: "Watch the middle letter" },
    words: [
      w("shariba", ["شَ", "رِ", "بَ"]),
      w("laiba", ["لَ", "عِ", "بَ"]),
      w("fariha", ["فَ", "رِ", "حَ"]),
      w("kabura", ["كَ", "بُ", "رَ"]),
    ],
  },
  {
    id: "sukun",
    title: { ar: "السُّكُون", en: "Sukun at the end" },
    hint: { ar: "نقف على آخر حرف بالسُّكُون", en: "Stop on the last letter" },
    words: [
      w("qalam", ["قَ", "لَ", "مْ"]),
      w("qamar", ["قَ", "مَ", "رْ"]),
      w("jamal", ["جَ", "مَ", "لْ"]),
      w("asad", ["أَ", "سَ", "دْ"]),
      w("walad", ["وَ", "لَ", "دْ"]),
    ],
  },
];

/**
 * Recorded syllable clips (e.g. "كَ" → "/audio/syllables/ka.mp3").
 * Empty for now: syllables fall back to the device Arabic voice.
 * Drop recordings in and map them here; nothing else changes.
 */
export const SYLLABLE_AUDIO: Record<string, string> = {};
