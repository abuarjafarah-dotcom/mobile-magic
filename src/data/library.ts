// Library shelf. Books listed here are bundled with the site (PDF files live in public/books/).
// Books uploaded with the + button are stored in Supabase and appear after these.
export type LibraryBook = {
  id: string;
  title: string;
  author?: string;
  blurb: string;
  tone: "sun" | "mint" | "sky" | "berry";
  /** Path to the PDF under public/ (bundled books). */
  pdf?: string;
};

export const LIBRARY_BOOKS: LibraryBook[] = [
  {
    id: "millions",
    title: "Millions",
    blurb: "Welcome to Earth, population 7 billion.",
    tone: "sky",
    pdf: "/books/millions.pdf",
  },
];
