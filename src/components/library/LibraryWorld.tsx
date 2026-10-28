import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Download, Lock, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkFamilyPassword, readFamilyUnlocked, writeFamilyUnlocked } from "@/lib/familyPassword";
import {
  LIBRARY_MAX_COVER_BYTES,
  LIBRARY_MAX_PDF_BYTES,
  addBook,
  bookCoverUrl,
  bookFileUrl,
  listBooks,
  type LibraryBook,
} from "@/lib/libraryStore";
import { compressPdf, renderCover } from "@/lib/pdfCompress";

const PAGE_SIZE = 8;
const ACCENTS = ["#e0533d", "#2f7fc1", "#4f9d3a", "#8e4fb5", "#ee8a2c", "#c9a21a", "#c8323c", "#2a9d8f"];

function accentFor(id: string) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return ACCENTS[Math.abs(hash) % ACCENTS.length];
}

function describeError(err: unknown) {
  if (err instanceof TypeError && /load failed|failed to fetch/i.test(err.message)) {
    return "Could not reach the library database from this device. Check the connection and try again.";
  }
  if (err instanceof Error) return `${err.name}: ${err.message}`;
  return String(err);
}

function stripPdfExtension(name: string) {
  return name.replace(/\.pdf$/i, "");
}

export function LibraryWorld({ onExit }: { onExit: () => void }) {
  const [unlocked, setUnlocked] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setUnlocked(readFamilyUnlocked());
    setChecked(true);
  }, []);

  if (!checked) return null;
  if (!unlocked) return <LibraryGate onExit={onExit} onUnlocked={() => setUnlocked(true)} />;
  return <Shelf onExit={onExit} />;
}

function LibraryGate({ onExit, onUnlocked }: { onExit: () => void; onUnlocked: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const ok = await checkFamilyPassword(password);
      if (ok) {
        writeFamilyUnlocked();
        onUnlocked();
      } else {
        setError("That password is not right. Try again.");
      }
    } catch {
      setError("This browser cannot check the password. Open the site over https.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
      <Header onExit={onExit} />
      <form onSubmit={submit} className="mt-10 flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15">
            <Lock className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-black leading-tight">Library</h1>
            <p className="text-sm font-bold text-muted-foreground">Enter the family password to open the shelf.</p>
          </div>
        </div>
        <label htmlFor="library-password" className="text-sm font-black">Password</label>
        <Input
          id="library-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError(null);
          }}
        />
        {error && <p role="alert" className="text-sm font-bold text-destructive">{error}</p>}
        <Button type="submit" disabled={!password || busy} className="h-12 rounded-2xl text-base font-black">
          Open library
        </Button>
      </form>
    </section>
  );
}

function Shelf({ onExit }: { onExit: () => void }) {
  const [books, setBooks] = useState<LibraryBook[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [page, setPage] = useState(0);

  async function refresh() {
    try {
      setBooks(await listBooks());
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load the shelf.");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const pageCount = books ? Math.max(1, Math.ceil(books.length / PAGE_SIZE)) : 1;
  const current = Math.min(page, pageCount - 1);
  const visible = books ? books.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE) : [];

  return (
    <section
      className="min-h-dvh text-white"
      style={{
        backgroundColor: "#c2352f",
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 8px, transparent 8px 16px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.05) 0 8px, transparent 8px 16px)",
      }}
    >
      <div className="mx-auto flex w-full max-w-lg flex-col px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 min-[960px]:max-w-6xl">
        <div className="flex items-center justify-between pr-16">
          <Header onExit={onExit} light />
          <button
            type="button"
            onClick={() => setAdding(true)}
            aria-label="Add a storybook"
            className="grid h-12 w-12 place-items-center rounded-full bg-[#e8246f] text-white shadow-[0_4px_0_#8f0f40] active:translate-y-[2px] active:shadow-none"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        <h1
          className="mt-6 text-center text-5xl font-black leading-tight"
          style={{ color: "#ffffff", textShadow: "3px 3px 0 #6b1414" }}
        >
          Library
        </h1>

        {loadError && (
          <p role="alert" className="mt-6 rounded-2xl bg-white/90 p-4 text-center text-sm font-bold text-destructive">
            {loadError}
          </p>
        )}

        {books === null && !loadError ? (
          <p className="mt-10 text-center font-bold">Loading the shelf…</p>
        ) : books && books.length === 0 ? (
          <div className="mt-10 rounded-3xl border-4 border-dashed border-white/60 p-8 text-center">
            <BookOpen className="mx-auto h-10 w-10" />
            <p className="mt-3 text-xl font-black">The shelf is empty.</p>
            <p className="mt-1 font-bold text-white/85">Tap + to add a storybook.</p>
          </div>
        ) : books ? (
          <>
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 min-[960px]:grid-cols-4">
              {visible.map((book) => (
                <li key={book.id}>
                  <BookCard book={book} />
                </li>
              ))}
            </ul>
            {pageCount > 1 && (
              <div className="mt-8 flex justify-center gap-4">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={current === 0}
                  onClick={() => setPage(current - 1)}
                  className="grid h-14 w-24 place-items-center rounded-full bg-[#f29bbd] text-white disabled:opacity-50"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={current >= pageCount - 1}
                  onClick={() => setPage(current + 1)}
                  className="grid h-14 w-24 place-items-center rounded-full bg-[#e8246f] text-white disabled:opacity-50"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>

      {adding && (
        <AddBookSheet
          onClose={() => setAdding(false)}
          onAdded={() => {
            setAdding(false);
            setPage(0);
            void refresh();
          }}
        />
      )}
    </section>
  );
}

function BookCard({ book }: { book: LibraryBook }) {
  const accent = accentFor(book.id);
  const cover = bookCoverUrl(book);
  return (
    <a href={bookFileUrl(book)} target="_blank" rel="noopener noreferrer" className="relative block">
      <div
        className="relative aspect-[1.4/1] rounded-[22px] border-[6px] bg-white p-1 shadow-[0_6px_0_rgba(0,0,0,0.25)]"
        style={{ borderColor: accent }}
      >
        <div className="flex h-full gap-1">
          <div className="flex w-1/2 items-center justify-center overflow-hidden rounded-[16px]" style={{ backgroundColor: accent }}>
            {cover ? (
              <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <BookOpen className="h-10 w-10 text-white" />
            )}
          </div>
          <div className="flex w-1/2 items-center justify-center px-2 text-center">
            <span className="line-clamp-4 text-lg font-black leading-tight sm:text-xl" style={{ color: accent }}>
              {book.title}
            </span>
          </div>
        </div>
      </div>
      <span
        aria-hidden="true"
        className="absolute right-0 top-0 grid h-10 w-10 place-items-center rounded-tr-[16px] rounded-bl-[14px] bg-black/50 text-white"
      >
        <Download className="h-5 w-5" />
      </span>
      {book.author && <p className="mt-2 truncate text-center text-sm font-bold text-white/90">{book.author}</p>}
    </a>
  );
}

function AddBookSheet({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [pdf, setPdf] = useState<File | null>(null);
  const [cover, setCover] = useState<Blob | null>(null);
  const [coverExt, setCoverExt] = useState<"jpg" | "png" | "webp">("jpg");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [preparing, setPreparing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (coverUrl) URL.revokeObjectURL(coverUrl);
    };
  }, [coverUrl]);

  async function choosePdf(file: File | null) {
    setError(null);
    setPdf(file);
    if (!file) return;
    if (file.size > LIBRARY_MAX_PDF_BYTES * 4) {
      setError("This PDF is too large to open here. Try a smaller file.");
      setPdf(null);
      return;
    }
    setTitle((current) => current || stripPdfExtension(file.name));
    setPreparing(true);
    try {
      const picture = await renderCover(file);
      setCover(picture);
      setCoverExt("jpg");
      setCoverUrl(URL.createObjectURL(picture));
    } catch (err) {
      setError(`Could not read this PDF. ${describeError(err)}`);
      setPdf(null);
    } finally {
      setPreparing(false);
    }
  }

  function chooseCover(file: File | null) {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose a picture for the cover.");
      return;
    }
    if (file.size > LIBRARY_MAX_COVER_BYTES) {
      setError("This picture is larger than 8 MB. Choose a smaller one.");
      return;
    }
    setCover(file);
    setCoverExt(file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg");
    setCoverUrl(URL.createObjectURL(file));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pdf || !cover) return;
    setBusy(true);
    setError(null);
    try {
      setStatus("Making the file smaller…");
      const small = await compressPdf(pdf, (done, total) => {
        setStatus(`Making the file smaller… page ${done} of ${total}`);
      });
      setStatus("Uploading…");
      await addBook({
        pdf: small,
        cover,
        coverExt,
        title: title.trim() || stripPdfExtension(pdf.name),
        author: author.trim(),
      });
      onAdded();
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
      setStatus(null);
    }
  }

  const canSave = !!pdf && !!cover && !preparing && !busy && title.trim().length > 0;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/55 sm:items-center">
      <form
        onSubmit={save}
        className="flex max-h-[92dvh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-t-3xl bg-white p-5 text-foreground shadow-xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black">Add a storybook</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-2">
          <label htmlFor="library-file" className="text-sm font-black">1. Pick the PDF</label>
          <input
            id="library-file"
            type="file"
            accept="application/pdf"
            disabled={busy}
            className="text-sm font-bold"
            onChange={(event) => void choosePdf(event.target.files?.[0] ?? null)}
          />
          {pdf && (
            <p className="text-xs font-bold text-muted-foreground">
              {pdf.name} · {(pdf.size / 1024 / 1024).toFixed(1)} MB (will be made smaller before upload)
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <span className="text-sm font-black">2. Cover</span>
          <div className="flex items-center gap-3">
            <div className="grid h-32 w-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted">
              {preparing ? (
                <span className="text-xs font-bold text-muted-foreground">Preparing…</span>
              ) : coverUrl ? (
                <img src={coverUrl} alt="Cover preview" className="h-full w-full object-cover" />
              ) : (
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="grid gap-2">
              <p className="text-xs font-bold text-muted-foreground">
                {cover ? "Page 1 is used unless you pick a picture." : "Choose a PDF first."}
              </p>
              <label htmlFor="library-cover" className="text-sm font-black">
                Use a different picture
              </label>
              <input
                id="library-cover"
                type="file"
                accept="image/*"
                disabled={busy || !pdf}
                className="text-xs font-bold"
                onChange={(event) => chooseCover(event.target.files?.[0] ?? null)}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="library-title" className="text-sm font-black">3. Title</label>
          <Input id="library-title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={busy} />
          <label htmlFor="library-author" className="text-sm font-black">Author (optional)</label>
          <Input id="library-author" value={author} onChange={(e) => setAuthor(e.target.value)} disabled={busy} />
        </div>

        {status && <p className="text-sm font-bold text-muted-foreground" role="status">{status}</p>}
        {error && <p role="alert" className="text-sm font-bold text-destructive">{error}</p>}

        <Button type="submit" disabled={!canSave} className="h-12 rounded-2xl text-base font-black">
          {busy ? "Saving…" : "Save to shelf"}
        </Button>
      </form>
    </div>
  );
}

function Header({ onExit, light = false }: { onExit: () => void; light?: boolean }) {
  if (light) {
    return (
      <div className="flex items-center">
        <button
          type="button"
          onClick={onExit}
          className="flex h-11 items-center gap-2 rounded-2xl px-3 text-lg font-black text-white"
        >
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center">
      <Button variant="ghost" onClick={onExit} className="h-11 gap-2 rounded-2xl px-3 font-black">
        <ArrowLeft className="h-5 w-5" /> Back
      </Button>
    </div>
  );
}
