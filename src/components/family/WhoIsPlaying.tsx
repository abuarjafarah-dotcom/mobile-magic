import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import hamadIdle from "@/assets/kitchen/cast/hamad-idle.png";
import talalIdle from "@/assets/kitchen/cast/talal-idle.png";
import yousefHappy from "@/assets/science/yousef-happy.png";
import {
  CHILDREN,
  chooseChild,
  getActiveChild,
  readChildStars,
  type ChildId,
} from "@/lib/childProfiles";

const FACES: Record<ChildId, string> = {
  hamad: hamadIdle,
  talal: talalIdle,
  yousef: yousefHappy,
};

const CARD_ART: Record<ChildId, string> = {
  hamad: "linear-gradient(135deg,#7CD3FF,#2A9BE6)",
  talal: "linear-gradient(135deg,#FFD85A,#FFB02E)",
  yousef: "linear-gradient(135deg,#8BD48A,#2E9E3A)",
};

function pick(id: ChildId) {
  if (chooseChild(id)) window.location.reload();
}

// Reads the active child after mount, so server and first client render match.
export function useActiveChild() {
  const [state, setState] = useState<{ ready: boolean; child: ChildId | null }>({
    ready: false,
    child: null,
  });
  useEffect(() => {
    setState({ ready: true, child: getActiveChild() });
  }, []);
  return state;
}

// First launch: a full screen of faces. Pictures first, since the boys cannot read yet.
export function WhoIsPlayingGate() {
  return (
    <section
      className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(4.75rem,env(safe-area-inset-top))] text-center sm:px-6"
      style={{ background: "linear-gradient(#8FD3F4, #F9E7B8 55%, #FFF9EC)" }}
    >
      <h1 className="text-4xl leading-none sm:text-5xl">Who’s playing?</h1>
      <p lang="ar" className="mt-2 font-arabic text-2xl font-bold text-[#7E3C8A]">
        مين بيلعب؟
      </p>
      <div className="mt-8 grid grid-cols-2 gap-4">
        {CHILDREN.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => pick(c.id)}
            aria-label={c.name}
            className={`touch-manipulation flex flex-col overflow-hidden rounded-3xl bg-white p-2 pb-3 shadow-[0_6px_0_rgba(0,0,0,.18)] transition-transform active:translate-y-1 active:shadow-none focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#FFC930] ${
              i === 2 ? "col-span-2 mx-auto w-1/2" : ""
            }`}
          >
            <span
              className="grid h-40 place-items-end justify-center overflow-hidden rounded-2xl"
              style={{ background: CARD_ART[c.id] }}
            >
              <img
                src={FACES[c.id]}
                alt=""
                draggable={false}
                className="h-36 w-auto object-contain"
              />
            </span>
            <span className="mt-2 font-display text-2xl font-bold leading-none text-[#2B1B4A]">
              {c.name}
            </span>
            <span lang="ar" className="font-arabic text-lg font-bold text-[#7E3C8A]">
              {c.arabic}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

// Home screen band: shows who is playing and lets the boys switch.
export function WhoIsPlayingStrip({ active }: { active: ChildId | null }) {
  const [stars, setStars] = useState<Record<ChildId, number>>({ hamad: 0, talal: 0, yousef: 0 });
  useEffect(() => {
    setStars({
      hamad: readChildStars("hamad"),
      talal: readChildStars("talal"),
      yousef: readChildStars("yousef"),
    });
  }, [active]);

  return (
    <div className="bg-[#A65BB0] px-4 pb-7 pt-5 sm:px-6">
      <h2
        className="mb-3 font-display text-3xl font-bold text-white"
        style={{ textShadow: "0 3px 0 rgba(0,0,0,.14)" }}
      >
        Who’s playing?
      </h2>
      <div className="grid grid-cols-3 gap-2.5" role="group" aria-label="Choose a player">
        {CHILDREN.map((c) => {
          const on = active === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              onClick={() => pick(c.id)}
              className={`touch-manipulation flex min-w-0 flex-col items-center rounded-3xl bg-white p-2 text-[#2B1B4A] shadow-[0_5px_0_rgba(0,0,0,.18)] transition-transform active:translate-y-1 active:shadow-none focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#FFC930] ${
                on ? "outline-4 outline-offset-2 outline-[#FFC930]" : ""
              }`}
            >
              <span
                className="grid h-20 w-full place-items-end justify-center overflow-hidden rounded-2xl"
                style={{ background: CARD_ART[c.id] }}
              >
                <img
                  src={FACES[c.id]}
                  alt=""
                  draggable={false}
                  className="h-[4.5rem] w-auto object-contain"
                />
              </span>
              <span className="mt-1.5 font-display text-lg font-bold leading-none">{c.name}</span>
              <span className="mt-1 inline-flex items-center gap-1 text-sm font-black text-[#7E3C8A]">
                <Star className="h-4 w-4 fill-[#FFC930] text-[#FFC930]" aria-hidden="true" />
                {stars[c.id]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
