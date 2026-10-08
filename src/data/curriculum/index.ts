import arabicJson from "./arabicGrade1T2.json";
import scienceJson from "./scienceGrade1P2.json";
import dictionaryJson from "./pictureDictionary.json";
import type { ArabicBook, ScienceBook, DictionaryEntry, SourceBlock, ArabicSkill, ScienceSkill } from "./types";

export * from "./types";
export const arabicBook = arabicJson as unknown as ArabicBook;
export const scienceBook = scienceJson as unknown as ScienceBook;
export const pictureDictionary = dictionaryJson as unknown as DictionaryEntry[];

type Located = { unitId: string; lessonId: string; page: number; block: SourceBlock };
function flatten(book: ArabicBook | ScienceBook): Located[] {
  return book.units.flatMap((u) => u.lessons.flatMap((l) => l.pages.flatMap((p) => p.blocks.map((block) => ({ unitId: u.id, lessonId: l.id, page: p.page, block })))));
}
export const arabicBlocks = flatten(arabicBook);
export const scienceBlocks = flatten(scienceBook);

export const arabicBySkill = (s: ArabicSkill) => arabicBlocks.filter((b) => b.block.skill === s);
export const scienceBySkill = (s: ScienceSkill) => scienceBlocks.filter((b) => b.block.skill === s);
export const arabicLetterLessons = arabicBook.units.flatMap((u) => u.lessons.filter((l) => l.type === "letter"));
export const arabicStories = arabicBlocks.filter((b) => b.block.kind === "story");
export const arabicNasheeds = arabicBook.units.flatMap((u) => u.lessons.filter((l) => l.type === "nasheed"));
export const scienceVocabulary = scienceBlocks.filter((b) => b.block.kind === "vocabulary");
export const dictionaryByLetter = (letter: string) => pictureDictionary.filter((e) => e.letter === letter);
