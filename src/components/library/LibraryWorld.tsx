import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, BookOpen, Lock, Plus } from "lucide-react";
import { LIBRARY_BOOKS, type LibraryBook } from "@/data/library";
import { fetchUploadedBooks, libraryUploadsEnabled, uploadBook } from "@/lib/libraryBooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Only a salted SHA-256 hash of the password is stored here, never the password itself.
const SALT = "990e308b1535e0f0df03ede680480f7a";
const HASH = "e95c842b4bf20615c327ccd1989739187ca8710d9477dcf866e5e1179a16da42";
const UNLOCK_KEY = "library-unlock-v1";

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function readUnlocked(): boolean {
  try {
    return sessionStorage.getItem(UNLOCK_KEY) === "yes";
  } catch {
    return false;
  }
}

function writeUnlocked(): void {
  try {
    sessionStorage.setItem(UNLOCK_KEY, "yes");
  } catch {
    /* private mode: the library simply asks again next time */
  }
}

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
    setUnlocked(readUnlocked());
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
      const ok = (await sha256Hex(SALT + password)) === HASH;
      if (ok) {
        writeUnlocked();
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
  const [uploaded, setUploaded] = useState<LibraryBook[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const uploadsOn = libraryUploadsEnabled();

  useEffect(() => {
    let cancelled = false;
    fetchUploadedBooks()
      .then((books) => {
        if (!cancelled) setUploaded(books);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Uploaded books could not be loaded right now.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const books = [...LIBRARY_BOOKS, ...uploaded];

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 min-[960px]:max-w-6xl">
      <div className="flex items-center justify-between">
        <Header onExit={onExit} />
        <Button
          onClick={() => setAdding(true)}
          disabled={!uploadsOn}
          aria-label="Add a PDF to the shelf"
          title={uploadsOn ? "Add a PDF" : "Uploads are not set up yet"}
          className="h-12 w-12 rounded-full p-0 text-2xl font-black"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
      <header className="mt-4 text-center">
        <p className="text-sm font-black uppercase text-muted-foreground">Our shelf</p>
        <h1 className="mt-1 text-3xl font-black leading-tight sm:text-4xl">Library</h1>
      </header>
      {loadError && <p role="alert" className="mt-4 text-center text-sm font-bold text-destructive">{loadError}</p>}
      {books.length === 0 ? (
        <div className="mt-8 rounded-3xl border-2 border-dashed border-border p-8 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-black">The shelf is empty.</p>
          <p className="mt-1 text-sm font-bold text-muted-foreground">Tap + to add a PDF.</p>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 min-[960px]:grid-cols-4 min-[960px]:gap-4">
          {books.map((book) => {
            const body = (
              <>
                <BookOpen className="h-8 w-8" />
                <h2 className="mt-3 text-lg font-black leading-tight">{book.title}</h2>
                {book.author && <p className="text-sm font-bold text-muted-foreground">{book.author}</p>}
                {book.blurb && <p className="mt-2 text-sm font-bold">{book.blurb}</p>}
              </>
            );
            return (
              <li key={book.id} className={`rounded-3xl shadow-sm ${TONE[book.tone]}`}>
                {book.pdf ? (
                  <a href={book.pdf} target="_blank" rel="noopener noreferrer" className="block rounded-3xl p-4 focus-visible:outline-2 focus-visible:outline-offset-2">
                    {body}
                  </a>
                ) : (
                  <div className="p-4">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <AddBookDialog
        open={adding}
        onOpenChange={setAdding}
        onAdded={(book) => setUploaded((prev) => [...prev, book])}
      />
    </section>
  );
}

function AddBookDialog({
  open,
  onOpenChange,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: (book: LibraryBook) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [blurb, setBlurb] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function reset() {
    setFile(null);
    setTitle("");
    setAuthor("");
    setBlurb("");
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    if (busy) return;
    if (!next) reset();
    onOpenChange(next);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Choose a PDF first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const book = await uploadBook({ file, title, author, blurb });
      onAdded(book);
      setBusy(false);
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Add a book</DialogTitle>
          <DialogDescription className="font-bold">Choose a PDF and it will appear on the shelf.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="book-file" className="font-black">PDF file</Label>
            <Input
              id="book-file"
              type="file"
              accept="application/pdf,.pdf"
              disabled={busy}
              onChange={(event) => {
                const chosen = event.target.files?.[0] ?? null;
                setFile(chosen);
                setError(null);
                if (chosen && !title) setTitle(chosen.name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " "));
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="book-title" className="font-black">Title</Label>
            <Input id="book-title" value={title} disabled={busy} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="book-author" className="font-black">Author (optional)</Label>
            <Input id="book-author" value={author} disabled={busy} onChange={(event) => setAuthor(event.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="book-blurb" className="font-black">One line about it (optional)</Label>
            <Input id="book-blurb" value={blurb} disabled={busy} onChange={(event) => setBlurb(event.target.value)} />
          </div>
          {error && <p role="alert" className="text-sm font-bold text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={!file || busy} className="h-12 w-full rounded-2xl text-base font-black">
              {busy ? "Uploading…" : "Add to shelf"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
