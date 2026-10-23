// Books uploaded from the library + button. Stored in Supabase (table `library_books`,
// bucket `library-books`). Set up once with supabase/library-books.sql.
// Talks to Supabase's REST and Storage endpoints directly, so no extra client package is needed.
import type { LibraryBook } from "@/data/library";

const BUCKET = "library-books";
export const MAX_PDF_BYTES = 50 * 1024 * 1024;

type Row = {
  id: string;
  title: string;
  author: string | null;
  blurb: string;
  tone: LibraryBook["tone"];
  file_path: string;
};

function config(): { url: string; key: string } | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

export function libraryUploadsEnabled(): boolean {
  return config() !== null;
}

export function bookFileUrl(filePath: string): string | undefined {
  const c = config();
  return c ? `${c.url}/storage/v1/object/public/${BUCKET}/${filePath}` : undefined;
}

function toBook(row: Row): LibraryBook {
  const pdf = bookFileUrl(row.file_path);
  return {
    id: row.id,
    title: row.title,
    author: row.author ?? undefined,
    blurb: row.blurb,
    tone: row.tone,
    pdf,
  };
}

export async function fetchUploadedBooks(): Promise<LibraryBook[]> {
  const c = config();
  if (!c) return [];
  const res = await fetch(`${c.url}/rest/v1/library_books?select=*&order=created_at.asc`, {
    headers: { apikey: c.key, Authorization: `Bearer ${c.key}` },
  });
  if (!res.ok) throw new Error("Could not load the shelf.");
  const rows = (await res.json()) as Row[];
  return rows.map(toBook);
}

function safeFileName(name: string): string {
  const base = name.replace(/\.pdf$/i, "").normalize("NFKD").replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "");
  return `${Date.now()}-${base.slice(0, 60) || "book"}.pdf`;
}

export async function uploadBook(input: {
  file: File;
  title: string;
  author: string;
  blurb: string;
}): Promise<LibraryBook> {
  const c = config();
  if (!c) throw new Error("Uploads are not set up yet.");
  if (input.file.type !== "application/pdf") throw new Error("Please choose a PDF file.");
  if (input.file.size > MAX_PDF_BYTES) throw new Error("This PDF is larger than 50 MB. Compress it first.");

  const filePath = safeFileName(input.file.name);
  const upload = await fetch(`${c.url}/storage/v1/object/${BUCKET}/${filePath}`, {
    method: "POST",
    headers: { apikey: c.key, Authorization: `Bearer ${c.key}`, "Content-Type": "application/pdf" },
    body: input.file,
  });
  if (!upload.ok) throw new Error("The PDF could not be uploaded. Try again.");

  const row = {
    title: input.title.trim() || input.file.name.replace(/\.pdf$/i, ""),
    author: input.author.trim() || null,
    blurb: input.blurb.trim(),
    tone: "sky",
    file_path: filePath,
  };
  const insert = await fetch(`${c.url}/rest/v1/library_books`, {
    method: "POST",
    headers: {
      apikey: c.key,
      Authorization: `Bearer ${c.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(row),
  });
  if (!insert.ok) throw new Error("The book was uploaded but could not be added to the shelf.");
  const [saved] = (await insert.json()) as Row[];
  return toBook(saved);
}
