// Library shelf storage on Supabase: book rows in table `library_books`, PDF files in the public bucket `library`.
// Uses the REST and Storage endpoints directly so no extra client package is needed.

export type LibraryTone = "sun" | "mint" | "sky" | "berry";

export type LibraryBook = {
  id: string;
  title: string;
  author: string | null;
  blurb: string | null;
  tone: LibraryTone;
  file_path: string;
  created_at: string;
};

export const LIBRARY_TONES: LibraryTone[] = ["sun", "mint", "sky", "berry"];
export const LIBRARY_MAX_BYTES = 50 * 1024 * 1024;
const BUCKET = "library";

function config() {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !key) throw new Error("Library storage is not configured.");
  return { url: url.replace(/\/$/, ""), key };
}

function headers(key: string, extra: Record<string, string> = {}) {
  return { apikey: key, Authorization: `Bearer ${key}`, ...extra };
}

export function bookFileUrl(book: Pick<LibraryBook, "file_path">) {
  const { url } = config();
  return `${url}/storage/v1/object/public/${BUCKET}/${book.file_path}`;
}

export async function listBooks(): Promise<LibraryBook[]> {
  const { url, key } = config();
  const res = await fetch(`${url}/rest/v1/library_books?select=*&order=created_at.desc`, {
    headers: headers(key),
  });
  if (!res.ok) throw new Error(`Could not load the shelf (${res.status}).`);
  return (await res.json()) as LibraryBook[];
}

export async function addBook(input: {
  file: File;
  title: string;
  author: string;
  blurb: string;
  tone: LibraryTone;
}): Promise<LibraryBook> {
  if (input.file.type !== "application/pdf" && !input.file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Please choose a PDF file.");
  }
  if (input.file.size > LIBRARY_MAX_BYTES) {
    throw new Error("This PDF is larger than 50 MB. Compress it and try again.");
  }
  const { url, key } = config();
  const path = `${crypto.randomUUID()}.pdf`;

  const up = await fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: headers(key, { "Content-Type": "application/pdf", "x-upsert": "false" }),
    body: input.file,
  });
  if (!up.ok) throw new Error(`Upload failed (${up.status}).`);

  const row = await fetch(`${url}/rest/v1/library_books`, {
    method: "POST",
    headers: headers(key, { "Content-Type": "application/json", Prefer: "return=representation" }),
    body: JSON.stringify({
      title: input.title.trim(),
      author: input.author.trim() || null,
      blurb: input.blurb.trim() || null,
      tone: input.tone,
      file_path: path,
    }),
  });
  if (!row.ok) {
    // Roll back the stored file so the bucket does not keep orphans.
    await fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, {
      method: "DELETE",
      headers: headers(key),
    });
    throw new Error(`Could not save the book (${row.status}).`);
  }
  const [saved] = (await row.json()) as LibraryBook[];
  return saved;
}
