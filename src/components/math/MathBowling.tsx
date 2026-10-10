import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { GameButton } from "@/components/game/GameButton";

// Stardust Lanes — the 3D math bowling game (three.js + Rapier physics).
// It ships as a self-contained page in public/games/ and runs in a full-screen frame,
// so its physics loop, keyboard controls and quiz stay isolated from the app.
const GAME_SRC = "/games/stardust-bowling.html";

export function MathBowling({ onExit }: { onExit: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <section className="fixed inset-0 z-50 bg-black">
      <iframe
        src={GAME_SRC}
        title="Stardust Lanes math bowling"
        className="h-full w-full border-0"
        allow="autoplay; fullscreen; gamepad"
        allowFullScreen
      />
      <GameButton
        tone="neutral"
        className="absolute right-[max(.75rem,env(safe-area-inset-right))] top-[max(.75rem,env(safe-area-inset-top))] grid h-11 w-11 place-items-center rounded-full p-0 opacity-90"
        onClick={onExit}
        aria-label="Leave Math Bowling"
      >
        <ArrowLeft className="h-5 w-5" />
      </GameButton>
    </section>
  );
}
