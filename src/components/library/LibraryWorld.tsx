import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, BookOpen, Lock } from "lucide-react";
import { LIBRARY_BOOKS } from "@/data/library";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkFamilyPassword, readFamilyUnlocked, writeFamilyUnlocked } from "@/lib/familyPassword";

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
  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 min-[960px]:max-w-6xl">
      <Header onExit={onExit} />
      <header className="mt-4 text-center">
        <p className="text-sm font-black uppercase text-muted-foreground">Our shelf</p>
        <h1 className="mt-1 text-3xl font-black leading-tight sm:text-4xl">Library</h1>
      </header>
      {LIBRARY_BOOKS.length === 0 ? (
        <div className="mt-8 rounded-3xl border-2 border-dashed border-border p-8 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-black">The shelf is empty.</p>
          <p className="mt-1 text-sm font-bold text-muted-foreground">Books will appear here once they are added.</p>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 min-[960px]:grid-cols-4 min-[960px]:gap-4">
          {LIBRARY_BOOKS.map((book) => (
            <li key={book.id} className={`rounded-3xl p-4 shadow-sm ${TONE[book.tone]}`}>
              <BookOpen className="h-8 w-8" />
              <h2 className="mt-3 text-lg font-black leading-tight">{book.title}</h2>
              {book.author && <p className="text-sm font-bold text-muted-foreground">{book.author}</p>}
              <p className="mt-2 text-sm font-bold">{book.blurb}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
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
