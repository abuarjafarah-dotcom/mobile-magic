import { useEffect, useRef, useState } from "react";
import hamadIdle from "@/assets/kitchen/cast/hamad-idle.png";
import talalIdle from "@/assets/kitchen/cast/talal-idle.png";
import yousefHappy from "@/assets/science/yousef-happy.png";
import type { ChildId } from "@/lib/childProfiles";
import { addExtraMinutes, addPlaySeconds, applyCalm, isTimeUp } from "@/lib/familySettings";

const FACES: Record<ChildId, string> = { hamad: hamadIdle, talal: talalIdle, yousef: yousefHappy };
const TICK = 5;
const HOLD_MS = 2000;

/**
 * Counts play time while the app is in front, and shows a gentle goodnight
 * screen when today's limit is used up. A parent holds a button for two
 * seconds to give five more minutes, which a small child will not do by accident.
 */
export function PlayLimit({ child, paused }: { child: ChildId | null; paused: boolean }) {
  const [up, setUp] = useState(false);
  const holdRef = useRef<number | null>(null);
  const [holding, setHolding] = useState(false);

  useEffect(() => {
    applyCalm();
    setUp(isTimeUp());
  }, []);

  useEffect(() => {
    if (paused || up) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible" && addPlaySeconds(TICK)) setUp(true);
    }, TICK * 1000);
    return () => window.clearInterval(id);
  }, [paused, up]);

  // The parent may have changed the limit in settings; check again when they come back.
  useEffect(() => {
    if (!paused) setUp(isTimeUp());
  }, [paused]);

  if (!up || paused) return null;

  const stopHold = () => {
    if (holdRef.current) window.clearTimeout(holdRef.current);
    holdRef.current = null;
    setHolding(false);
  };
  const startHold = () => {
    setHolding(true);
    holdRef.current = window.setTimeout(() => {
      addExtraMinutes(5);
      stopHold();
      setUp(false);
    }, HOLD_MS);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Play time is finished for today"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "linear-gradient(#3B2A6B, #E9806E 60%, #FFC98B)" }}
    >
      <img
        src={FACES[child ?? "hamad"]}
        alt=""
        draggable={false}
        className="h-52 w-auto object-contain drop-shadow-lg"
      />
      <p
        className="mt-4 font-display text-4xl font-bold leading-tight text-white"
        style={{ textShadow: "0 3px 0 rgba(0,0,0,.2)" }}
      >
        All done for today!
      </p>
      <p lang="ar" className="mt-2 font-arabic text-2xl font-bold text-white">
        خلص وقت اللعب، نلتقي بكرة
      </p>
      <button
        type="button"
        onPointerDown={startHold}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        onContextMenu={(e) => e.preventDefault()}
        className="mt-10 touch-none select-none rounded-full bg-white/25 px-5 py-3 text-sm font-black text-white"
      >
        {holding ? "Keep holding…" : "Grown-up: hold for 5 more minutes"}
      </button>
    </div>
  );
}
