import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Lock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkFamilyPassword, readFamilyUnlocked, writeFamilyUnlocked } from "@/lib/familyPassword";

type Game = { screen: string; label: string; icon: string };
type Location = { id: string; name: string; detail: string; tone: string; games: Game[] };

// Each location lists existing games by their screen id. Empty locations show "coming soon".
export const NEIGHBORHOOD_LOCATIONS: Location[] = [
  {
    id: "home",
    name: "Home",
    detail: "Cook, build and play together",
    tone: "bg-primary/15",
    games: [
      { screen: "kitchen", label: "Palestinian Kitchen", icon: "🍲" },
      { screen: "build", label: "Building World", icon: "🧱" },
    ],
  },
  {
    id: "masjid",
    name: "Masjid",
    detail: "Qur’an and Islamic learning",
    tone: "bg-emerald-100 dark:bg-emerald-950/40",
    games: [
      { screen: "iq", label: "Interactive Qur’an", icon: "📖" },
      { screen: "noorani", label: "Noorani Qaida", icon: "🌳" },
      { screen: "ws", label: "Wudu & Salah", icon: "🤲" },
      { screen: "ie", label: "More to Explore", icon: "🕌" },
    ],
  },
  {
    id: "garden",
    name: "Garden",
    detail: "Nature and discovery",
    tone: "bg-lime-100 dark:bg-lime-950/40",
    games: [],
  },
  {
    id: "market",
    name: "Market",
    detail: "Arabic words and shopping",
    tone: "bg-amber-100 dark:bg-amber-950/40",
    games: [
      { screen: "seek", label: "Seek & Find", icon: "🔎" },
      { screen: "play", label: "Harakat & Tracing", icon: "🎰" },
    ],
  },
  {
    id: "school",
    name: "School",
    detail: "Problem-solving and strategy",
    tone: "bg-sky-100 dark:bg-sky-950/40",
    games: [{ screen: "chess", label: "Chess", icon: "♟️" }],
  },
  {
    id: "lab",
    name: "Discovery Lab",
    detail: "How our bodies and the world work",
    tone: "bg-rose-100 dark:bg-rose-950/40",
    games: [
      { screen: "hbl", label: "Human Biology Lab", icon: "🫀" },
      { screen: "sci", label: "Science World", icon: "🔬" },
    ],
  },
];

export function NeighborhoodWorld({ onExit, onOpen }: { onExit: () => void; onOpen: (screen: string) => void }) {
  const [unlocked, setUnlocked] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setUnlocked(readFamilyUnlocked());
    setChecked(true);
  }, []);

  if (!checked) return null;
  if (!unlocked) return <NeighborhoodGate onExit={onExit} onUnlocked={() => setUnlocked(true)} />;
  return <Map onExit={onExit} onOpen={onOpen} />;
}

function NeighborhoodGate({ onExit, onUnlocked }: { onExit: () => void; onUnlocked: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (await checkFamilyPassword(password)) {
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
            <h1 className="text-2xl font-black leading-tight">Neighborhood</h1>
            <p className="text-sm font-bold text-muted-foreground">Enter the family password to open the neighborhood.</p>
          </div>
        </div>
        <label htmlFor="neighborhood-password" className="text-sm font-black">Password</label>
        <Input
          id="neighborhood-password"
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
          Open neighborhood
        </Button>
      </form>
    </section>
  );
}

function Map({ onExit, onOpen }: { onExit: () => void; onOpen: (screen: string) => void }) {
  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 min-[960px]:max-w-6xl">
      <Header onExit={onExit} />
      <header className="mt-4 text-center">
        <p className="text-sm font-black uppercase text-muted-foreground">Our world</p>
        <h1 className="mt-1 text-3xl font-black leading-tight sm:text-4xl">Neighborhood</h1>
      </header>
      <ul className="mt-6 grid grid-cols-1 gap-3 min-[600px]:grid-cols-2 min-[960px]:grid-cols-3 min-[960px]:gap-4">
        {NEIGHBORHOOD_LOCATIONS.map((loc) => (
          <li key={loc.id} className={`rounded-3xl p-4 shadow-sm ${loc.tone}`}>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <h2 className="text-xl font-black">{loc.name}</h2>
            </div>
            <p className="mt-1 text-sm font-bold text-muted-foreground">{loc.detail}</p>
            {loc.games.length === 0 ? (
              <p className="mt-3 rounded-2xl border-2 border-dashed border-border p-3 text-center text-sm font-black text-muted-foreground">Coming soon</p>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                {loc.games.map((game) => (
                  <Button
                    key={game.screen}
                    variant="secondary"
                    onClick={() => onOpen(game.screen)}
                    className="h-12 justify-start gap-3 rounded-2xl text-base font-black"
                  >
                    <span aria-hidden="true" className="text-2xl leading-none">{game.icon}</span>
                    {game.label}
                  </Button>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
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
