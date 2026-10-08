// Shared shapes for textbook-sourced curriculum data. The JSON files next to this are generated from
// page-by-page transcriptions of the NCCD student books — regenerate them rather than hand-editing.

export type BlockKind =
  | "heading" | "instruction" | "text" | "story" | "poem" | "question" | "exercise" | "vocabulary"
  | "letter" | "syllables" | "sentence" | "experiment" | "observation" | "activity" | "caption" | "other";

export type ArabicSkill = "listening" | "speaking" | "reading" | "writing" | "construction" | "letters";
export type ScienceSkill = "observe" | "experiment" | "classify" | "predict" | "cause_effect" | "design" | "investigate";

/** One printed element on a textbook page, kept exactly as printed. */
export type SourceBlock = {
  id: string;
  kind: BlockKind;
  skill: ArabicSkill | ScienceSkill | null;
  number: string | null; // exercise number as printed
  text: string;
  items: string[]; // words/options/sentences inside the block, in reading order
  picture: string | null; // short English note about an illustration the block depends on
};

export type SourcePage = { page: number; kind: string; blocks: SourceBlock[]; unclear: string | null };

export type ArabicLessonType = "listening" | "speaking" | "letter" | "shadda" | "reading" | "nasheed" | "writing" | "construction" | "review";
export type ArabicLesson = { id: string; title: string; type: ArabicLessonType; letter: string | null; pages: SourcePage[] };
export type ArabicUnit = { id: string; number: number; title: string; en: string; opener: SourcePage[]; lessons: ArabicLesson[] };
export type ArabicBook = { source: string; frontMatter: SourcePage[]; units: ArabicUnit[] };

export type ScienceLesson = { id: string; code: string; title: string; type: "lesson" | "enrichment"; pages: SourcePage[] };
export type ScienceUnit = { id: string; number: number; title: string; en: string; opener: SourcePage[]; lessons: ScienceLesson[] };
export type ScienceBook = { source: string; frontMatter: SourcePage[]; backMatter: SourcePage[]; units: ScienceUnit[] };

export type SheetCell = { sheet: string; cell: number; transparent: boolean };

export type DictionaryEntry = {
  id: string;
  letter: string; // first letter (ignoring ال)
  word: string; // without harakat
  vowelled: string | null;
  category: string | null;
  en: string | null;
  definition: string | null; // child-friendly Arabic definition — not yet written; never invented automatically
  example: string | null;
  image: SheetCell | null;
  audio: string | null;
  difficulty: 1 | 2 | 3;
  relatedWords: string[];
  games: string[];
  sources: string[]; // e.g. "arabic-book p.14"
  reviewed: boolean;
};
