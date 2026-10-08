import { arabicAudio } from "./arabicAudio";

// Add or remove letters and words here — the Read Arabic game reads only from this data.
export type ArabicLetter = { id: string; char: string; name: string; audio: string };
export type ArabicSyllable = { id: string; base: string; text: string; vowel: "fatha" | "kasra" | "damma"; sound: string; audio: string };
export type WordPicture = "door" | "house" | "pencil" | "boy" | "girl" | "hand" | "father" | "mother";
export type ArabicWord = {
  id: string;
  arabic: string; // with harakat
  plain: string;
  letters: string[]; // in reading order (right to left)
  transliteration: string;
  meaning: string;
  picture: WordPicture;
  difficulty: 1 | 2 | 3;
  audio: string;
};

const clip = (id: string) => arabicAudio[id] ?? "";

export const arabicLetters: ArabicLetter[] = [
  { id: "alif", char: "ا", name: "Alif", audio: clip("l-alif") },
  { id: "ba", char: "ب", name: "Ba", audio: clip("l-ba") },
  { id: "ta", char: "ت", name: "Ta", audio: clip("l-ta") },
  { id: "dal", char: "د", name: "Dal", audio: clip("l-dal") },
  { id: "qaf", char: "ق", name: "Qaf", audio: clip("l-qaf") },
  { id: "lam", char: "ل", name: "Lam", audio: clip("l-lam") },
  { id: "mim", char: "م", name: "Mim", audio: clip("l-mim") },
  { id: "nun", char: "ن", name: "Nun", audio: clip("l-nun") },
  { id: "waw", char: "و", name: "Waw", audio: clip("l-waw") },
  { id: "ya", char: "ي", name: "Ya", audio: clip("l-ya") },
];

export const arabicSyllables: ArabicSyllable[] = [
  { id: "ba-a", base: "ب", text: "بَ", vowel: "fatha", sound: "ba", audio: clip("h-ba") },
  { id: "ba-i", base: "ب", text: "بِ", vowel: "kasra", sound: "bi", audio: clip("h-bi") },
  { id: "ba-u", base: "ب", text: "بُ", vowel: "damma", sound: "bu", audio: clip("h-bu") },
  { id: "ma-a", base: "م", text: "مَ", vowel: "fatha", sound: "ma", audio: clip("h-ma") },
  { id: "ma-i", base: "م", text: "مِ", vowel: "kasra", sound: "mi", audio: clip("h-mi") },
  { id: "ma-u", base: "م", text: "مُ", vowel: "damma", sound: "mu", audio: clip("h-mu") },
];

export const arabicWords: ArabicWord[] = [
  { id: "bab", arabic: "بَاب", plain: "باب", letters: ["ب", "ا", "ب"], transliteration: "baab", meaning: "door", picture: "door", difficulty: 1, audio: clip("w-bab") },
  { id: "yad", arabic: "يَد", plain: "يد", letters: ["ي", "د"], transliteration: "yad", meaning: "hand", picture: "hand", difficulty: 1, audio: clip("w-yad") },
  { id: "ab", arabic: "أَب", plain: "أب", letters: ["أ", "ب"], transliteration: "ab", meaning: "father", picture: "father", difficulty: 1, audio: clip("w-ab") },
  { id: "umm", arabic: "أُمّ", plain: "أم", letters: ["أ", "م"], transliteration: "umm", meaning: "mother", picture: "mother", difficulty: 1, audio: clip("w-umm") },
  { id: "bayt", arabic: "بَيْت", plain: "بيت", letters: ["ب", "ي", "ت"], transliteration: "bayt", meaning: "house", picture: "house", difficulty: 2, audio: clip("w-bayt") },
  { id: "qalam", arabic: "قَلَم", plain: "قلم", letters: ["ق", "ل", "م"], transliteration: "qalam", meaning: "pencil", picture: "pencil", difficulty: 2, audio: clip("w-qalam") },
  { id: "walad", arabic: "وَلَد", plain: "ولد", letters: ["و", "ل", "د"], transliteration: "walad", meaning: "boy", picture: "boy", difficulty: 2, audio: clip("w-walad") },
  { id: "bint", arabic: "بِنْت", plain: "بنت", letters: ["ب", "ن", "ت"], transliteration: "bint", meaning: "girl", picture: "girl", difficulty: 3, audio: clip("w-bint") },
];

export const arabicStages = [
  { id: 1, title: "Letter sounds", tone: "sun" },
  { id: 2, title: "Harakat", tone: "sky" },
  { id: 3, title: "Build the word", tone: "mint" },
  { id: 4, title: "Choose the word", tone: "berry" },
  { id: 5, title: "Hear & build", tone: "sun" },
  { id: 6, title: "Read", tone: "sky" },
] as const;
export type ArabicStageId = (typeof arabicStages)[number]["id"];
