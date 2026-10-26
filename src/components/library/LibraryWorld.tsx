import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, BookOpen, Lock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkFamilyPassword, readFamilyUnlocked, writeFamilyUnlocked } from "@/lib/familyPassword";
import {
  LIBRARY_MAX_BYTES,
  LIBRARY_TONES,
  addBook,
  bookFileUrl,
  listBooks,
  type LibraryBook,
  type LibraryTone,
} from "@/lib/libraryStore";

const TONE: Record<string, string> = {
  sun: "bg-primary/15",
  mint: "bg-emerald-100 dark:bg-emerald-950/40",
  sky: "bg-sky-100 dark:bg-sky-950/40",
  berry: "bg-rose-100 dark:bg-rose-950/40",
};

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

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 min-[960px]:max-w-6xl">
      <div className="flex items-center justify-between pr-16">
        <Header onExit={onExit} />
        <Button
          onClick={() => setAdding((v) => !v)}
          aria-label="Add a book"
          aria-expanded={adding}
          className="h-12 w-12 rounded-2xl p-0"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
      <header className="mt-4 text-center">
        <p className="text-sm font-black uppercase text-muted-foreground">Our shelf</p>
        <h1 className="mt-1 text-3xl font-black leading-tight sm:text-4xl">Library</h1>
      </header>

      {adding && (
        <AddBookForm
          onCancel={() => setAdding(false)}
          onAdded={() => {
            setAdding(false);
            void refresh();
          }}
        />
      )}

      {loadError && <p role="alert" className="mt-6 text-center text-sm font-bold text-destructive">{loadError}</p>}

      {books === null && !loadError ? (
        <p className="mt-8 text-center font-bold text-muted-foreground">Loading the shelf…</p>
      ) : books && books.length === 0 ? (
        <div className="mt-8 rounded-3xl border-2 border-dashed border-border p-8 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-black">The shelf is empty.</p>
          <p className="mt-1 text-sm font-bold text-muted-foreground">Tap + to add a book.</p>
        </div>
      ) : books ? (
        <ul className="mt-6 grid grid-cols-2 gap-3 min-[960px]:grid-cols-4 min-[960px]:gap-4">
          {books.map((book) => (
            <li key={book.id}>
              <a
                href={bookFileUrl(book)}
                target="_blank"
                rel="noopener noreferrer"
                className={`block rounded-3xl p-4 shadow-sm ${TONE[book.tone] ?? TONE.sun}`}
              >
                <BookOpen className="h-8 w-8" />
                <h2 className="mt-3 text-lg font-black leading-tight">{book.title}</h2>
                {book.author && <p className="text-sm font-bold text-muted-foreground">{book.author}</p>}
                {book.blurb && <p className="mt-2 text-sm font-bold">{book.blurb}</p>}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function AddBookForm({ onCancel, onAdded }: { onCancel: () => void; onAdded: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [blurb, setBlurb] = useState("");
  const [tone, setTone] = useState<LibraryTone>("sun");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      await addBook({ file, title: title || file.name.replace(/\.pdf$/i, ""), author, blurb, tone });
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add the book.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 flex flex-col gap-3 rounded-3xl bg-card p-5 shadow-sm">
      <label htmlFor="library-file" className="text-sm font-black">PDF file</label>
      <input
        id="library-file"
        type="file"
        accept="application/pdf"
        className="text-sm font-bold"
        onChange={(event) => {
          const picked = event.target.files?.[0] ?? null;
          setFile(picked);
          if (picked && !title) setTitle(picked.name.replace(/\.pdf$/i, ""));
          setError(null);
        }}
      />
      {file && file.size > LIBRARY_MAX_BYTES && (
        <p role="alert" className="text-sm font-bold text-destructive">This PDF is larger than 50 MB. Compress it first.</p>
      )}
      <label htmlFor="library-title" className="text-sm font-black">Title</label>
      <Input id="library-title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <label htmlFor="library-author" className="text-sm font-black">Author (optional)</label>
      <Input id="library-author" value={author} onChange={(e) => setAuthor(e.target.value)} />
      <label htmlFor="library-blurb" className="text-sm font-black">Short note (optional)</label>
      <Input id="library-blurb" value={blurb} onChange={(e) => setBlurb(e.target.value)} />
      <div className="flex gap-2" role="radiogroup" aria-label="Card colour">
        {LIBRARY_TONES.map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={tone === t}
            aria-label={t}
            onClick={() => setTone(t)}
            className={`h-9 w-9 rounded-full border-2 ${TONE[t]} ${tone === t ? "border-foreground" : "border-transparent"}`}
          />
        ))}
      </div>
      {error && <p role="alert" className="text-sm font-bold text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="h-12 flex-1 rounded-2xl font-black">
          Cancel
        </Button>
        <Button type="submit" disabled={!file || busy || (file?.size ?? 0) > LIBRARY_MAX_BYTES} className="h-12 flex-1 rounded-2xl font-black">
          {busy ? "Saving…" : "Save to shelf"}
        </Button>
      </div>
    </form>
  );
}

function Header({ onExit }: { onExit: () => void }) {
  return (
    <div className="flex items-center">
      <Button variant="ghost" onClick={onExit} className="h-11 gap-2 rounded-2xl px-3 font-black">
        <ArrowLeft className="h-5 w-5" /> Back
      </Button>
    </div>
  );
}
