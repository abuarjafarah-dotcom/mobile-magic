// Library shelf storage on Supabase: book rows in table `library_books`; PDFs and covers in the public bucket `library`.
// Uses the REST and Storage endpoints directly so no extra client package is needed.

export type LibraryBook = {
  id: string;
  title: string;
  author: string | null;
  file_path: string;
  cover_path: string | null;
  created_at: string;
};

export const LIBRARY_MAX_PDF_BYTES = 50 * 1024 * 1024;
export const LIBRARY_MAX_COVER_BYTES = 8 * 1024 * 1024;
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

export function bookCoverUrl(book: Pick<LibraryBook, "cover_path">) {
  if (!book.cover_path) return null;
  const { url } = config();
  return `${url}/storage/v1/object/public/${BUCKET}/${book.cover_path}`;
}

export async function listBooks(): Promise<LibraryBook[]> {
  const { url, key } = config();
  const res = await fetch(`${url}/rest/v1/library_books?select=*&order=created_at.desc`, {
    headers: headers(key),
  });
  if (!res.ok) throw new Error(`Could not load the shelf (${res.status}).`);
  return (await res.json()) as LibraryBook[];
}

async function uploadObject(url: string, key: string, path: string, body: Blob, contentType: string) {
  const res = await fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: headers(key, { "Content-Type": contentType, "x-upsert": "false" }),
    body,
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status}).`);
}

async function removeObjects(url: string, key: string, paths: string[]) {
  await fetch(`${url}/storage/v1/object/${BUCKET}`, {
    method: "DELETE",
    headers: headers(key, { "Content-Type": "application/json" }),
    body: JSON.stringify({ prefixes: paths }),
  }).catch(() => undefined);
}

/** Saves an already-compressed PDF and its cover, then adds the shelf row. Rolls back the files if the row fails. */
export async function addBook(input: {
  pdf: Blob;
  cover: Blob;
  coverExt: "jpg" | "png" | "webp";
  title: string;
  author: string;
}): Promise<LibraryBook> {
  if (input.pdf.size > LIBRARY_MAX_PDF_BYTES) {
    throw new Error("This PDF is still larger than 50 MB after shrinking.");
  }
  const { url, key } = config();
  const id = crypto.randomUUID();
  const filePath = `books/${id}.pdf`;
  const coverPath = `covers/${id}.${input.coverExt}`;
  const coverType = input.coverExt === "jpg" ? "image/jpeg" : `image/${input.coverExt}`;

  await uploadObject(url, key, filePath, input.pdf, "application/pdf");
  try {
    await uploadObject(url, key, coverPath, input.cover, coverType);
  } catch (err) {
    await removeObjects(url, key, [filePath]);
    throw err;
  }

  const row = await fetch(`${url}/rest/v1/library_books`, {
    method: "POST",
    headers: headers(key, { "Content-Type": "application/json", Prefer: "return=representation" }),
    body: JSON.stringify({
      title: input.title,
      author: input.author || null,
      file_path: filePath,
      cover_path: coverPath,
    }),
  });
  if (!row.ok) {
    await removeObjects(url, key, [filePath, coverPath]);
    throw new Error(`Could not save the book (${row.status}).`);
  }
  const [saved] = (await row.json()) as LibraryBook[];
  return saved;
}
