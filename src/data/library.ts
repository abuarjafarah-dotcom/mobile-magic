// Library shelf. Add books as data only; each book appears as a card on the shelf.
export type LibraryBook = {
  id: string;
  title: string;
  author?: string;
  blurb: string;
  tone: "sun" | "mint" | "sky" | "berry";
};

export const LIBRARY_BOOKS: LibraryBook[] = [];
