import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import mapUrl from "@/assets/world/neighborhood.webp";
import mosqueIcon from "@/assets/salah/mosque-icon.webp";
import hamadIdle from "@/assets/world/characters/hamad-idle.webp";
import hamadSide1 from "@/assets/world/characters/hamad-side1.webp";
import hamadSide2 from "@/assets/world/characters/hamad-side2.webp";
import hamadSide3 from "@/assets/world/characters/hamad-side3.webp";
import hamadSide4 from "@/assets/world/characters/hamad-side4.webp";
import hamadDown1 from "@/assets/world/characters/hamad-down1.webp";
import hamadDown2 from "@/assets/world/characters/hamad-down2.webp";
import hamadUp from "@/assets/world/characters/hamad-up.webp";
import talalIdle from "@/assets/world/characters/talal-idle.webp";
import talalSide1 from "@/assets/world/characters/talal-side1.webp";
import talalSide2 from "@/assets/world/characters/talal-side2.webp";
import talalSide3 from "@/assets/world/characters/talal-side3.webp";
import talalSide4 from "@/assets/world/characters/talal-side4.webp";
import talalDown1 from "@/assets/world/characters/talal-down1.webp";
import talalDown2 from "@/assets/world/characters/talal-down2.webp";
import talalUp from "@/assets/world/characters/talal-up.webp";
import buildingHome from "@/assets/world/buildings/home.webp";
import buildingMasjid from "@/assets/world/buildings/masjid.webp";
import buildingGarden from "@/assets/world/buildings/garden-entrance.webp";
import buildingSchool from "@/assets/world/buildings/school.webp";
import buildingMarket from "@/assets/world/buildings/market.webp";
import buildingLab from "@/assets/world/buildings/discovery-lab.webp";
import iconBird from "@/assets/world/icons/bird.webp";
import iconBook from "@/assets/world/icons/book-open.webp";
import iconBasket from "@/assets/world/icons/basket.webp";
import iconFlask from "@/assets/world/icons/flask.webp";
import iconFlower from "@/assets/world/icons/flower.webp";
import tetaIdle from "@/assets/kitchen/cast/teta-idle.png";
import {
  ENTER_RADIUS_PX,
  MAP_PX,
  WORLD_BOUNDS,
  WORLD_DESTINATIONS,
  WORLD_OBSTACLES,
  WORLD_SPAWN,
  WORLD_SPEED,
  type WorldDestination,
  type WorldTarget,
  type Point,
} from "@/data/neighborhoodWorld";

type Character = "hamad" | "talal";
type Dir = "up" | "down" | "left" | "right";
type Pose = "idle" | "side" | "down" | "up";

// Frames from the Gemini character sheets. "side" faces right; left is mirrored.
const FRAMES: Record<Character, Record<Pose, string[]>> = {
  hamad: {
    idle: [hamadIdle],
    side: [hamadSide1, hamadSide2, hamadSide3, hamadSide4],
    down: [hamadDown1, hamadDown2],
    up: [hamadUp],
  },
  talal: {
    idle: [talalIdle],
    side: [talalSide1, talalSide2, talalSide3, talalSide4],
    down: [talalDown1, talalDown2],
    up: [talalUp],
  },
};
const WALK_FPS = 8;

// Destination art: building illustration for the preview and an icon badge for the prompt.
const DEST_ART: Record<string, { building: string; icon: string }> = {
  home: { building: buildingHome, icon: iconBird },
  masjid: { building: buildingMasjid, icon: mosqueIcon },
  garden: { building: buildingGarden, icon: iconFlower },
  school: { building: buildingSchool, icon: iconBook },
  market: { building: buildingMarket, icon: iconBasket },
  lab: { building: buildingLab, icon: iconFlask },
};
const NAMES: Record<Character, string> = { hamad: "Hamad", talal: "Talal" };
const ZOOM = 2; // scene width relative to the visible stage width
const ASPECT = MAP_PX.h / MAP_PX.w;
const CHAR_HEIGHT = 0.22; // character height as a fraction of scene height
const COLLISION_R = 0.012; // half-size of the character's foot box, map fraction

const KEY_TO_DIR: Record<string, Dir> = {
  ArrowUp: "up",
  w: "up",
  W: "up",
  ArrowDown: "down",
  s: "down",
  S: "down",
  ArrowLeft: "left",
  a: "left",
  A: "left",
  ArrowRight: "right",
  d: "right",
  D: "right",
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function isBlocked(x: number, y: number) {
  const { minX, maxX, minY, maxY } = WORLD_BOUNDS;
  if (x < minX || x > maxX || y < minY || y > maxY) return true;
  return WORLD_OBSTACLES.some(
    (o) =>
      x + COLLISION_R > o.x1 && x - COLLISION_R < o.x2 && y + COLLISION_R > o.y1 && y - COLLISION_R < o.y2,
  );
}

function distancePx(a: Point, b: Point) {
  return Math.hypot((a.x - b.x) * MAP_PX.w, (a.y - b.y) * MAP_PX.h);
}

// Character picker. The chosen character is kept only for this visit.
export function NeighborhoodWorld({
  onExit,
  onEnterGame,
  onShowAll,
}: {
  onExit: () => void;
  onEnterGame: (target: WorldTarget) => void;
  onShowAll: () => void;
}) {
  const [character, setCharacter] = useState<Character | null>(null);

  if (!character) {
    return (
      <section className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-6 pt-[max(3.75rem,env(safe-area-inset-top))]">
        <BackButton onClick={onExit} />
        <header className="mt-4 text-center">
          <p className="text-sm font-black uppercase text-muted-foreground">Our neighborhood · حينا</p>
          <h1 className="mt-1 text-3xl font-black leading-tight">Who wants to explore?</h1>
        </header>
        <div className="mt-8 grid grid-cols-2 gap-4">
          {(["hamad", "talal"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCharacter(c)}
              className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-3xl bg-card p-4 font-black shadow-md transition active:scale-95"
            >
              <img src={FRAMES[c].idle[0]} alt="" className="h-36 w-auto" draggable={false} />
              <span className="text-xl">{NAMES[c]}</span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  return <WorldStage character={character} onExit={onExit} onEnterGame={onEnterGame} onShowAll={onShowAll} />;
}

function WorldStage({
  character,
  onExit,
  onEnterGame,
  onShowAll,
}: {
  character: Character;
  onExit: () => void;
  onEnterGame: (target: WorldTarget) => void;
  onShowAll: () => void;
}) {
  const [player, setPlayer] = useState<{ x: number; y: number; facing: 1 | -1; moving: boolean; pose: Pose; frame: number }>({
    x: WORLD_SPAWN.x,
    y: WORLD_SPAWN.y,
    facing: 1,
    moving: false,
    pose: "idle",
    frame: 0,
  });
  const [preview, setPreview] = useState<WorldDestination | null>(null);
  const [leaving, setLeaving] = useState<WorldDestination | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const playerRef = useRef(player);
  const dirsRef = useRef<Set<Dir>>(new Set());
  const lockRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduced = useMemo(prefersReducedMotion, []);

  const pausedNow = preview !== null || leaving !== null;
  pausedRef.current = pausedNow;

  const nearby = WORLD_DESTINATIONS.find((d) => distancePx(player, d.at) < ENTER_RADIUS_PX) ?? null;

  // Keep the latest nearby destination and enter handler reachable from the
  // key listener above without re-binding it every frame.
  const nearbyRef = useRef<WorldDestination | null>(null);
  nearbyRef.current = nearby;
  const enterRef = useRef<(d: WorldDestination) => void>(() => {});

  // Keyboard controls for desktop/development. Arrow keys and WASD move;
  // Enter or Space enters a nearby place.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const dir = KEY_TO_DIR[e.key];
      if (dir) {
        e.preventDefault();
        dirsRef.current.add(dir);
        return;
      }
      if ((e.key === "Enter" || e.key === " ") && nearbyRef.current) {
        e.preventDefault();
        enterRef.current(nearbyRef.current);
      }
    };
    const up = (e: KeyboardEvent) => {
      const dir = KEY_TO_DIR[e.key];
      if (dir) dirsRef.current.delete(dir);
    };
    const clear = () => dirsRef.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);


  // Movement loop: applies held directions, resolves collisions one axis at
  // a time so the character slides along walls, and advances the walk cycle.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let walkT = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!pausedRef.current) {
        const dirs = dirsRef.current;
        let vx = (dirs.has("right") ? 1 : 0) - (dirs.has("left") ? 1 : 0);
        let vy = (dirs.has("down") ? 1 : 0) - (dirs.has("up") ? 1 : 0);
        const len = Math.hypot(vx, vy);
        if (len > 0) {
          vx /= len;
          vy /= len;
          // Equal on-screen speed in both axes (the map is wider than tall).
          const dx = vx * WORLD_SPEED * dt;
          const dy = vy * WORLD_SPEED * dt * (MAP_PX.w / MAP_PX.h);
          const p = playerRef.current;
          let x = p.x;
          let y = p.y;
          if (!isBlocked(x + dx, y)) x += dx;
          if (!isBlocked(x, y + dy)) y += dy;
          // Horizontal movement wins over vertical so side frames read clearly.
          const pose: Pose = vx !== 0 ? "side" : vy > 0 ? "down" : "up";
          const facing: 1 | -1 = vx < 0 ? -1 : vx > 0 ? 1 : p.facing;
          walkT += dt;
          const next = {
            x,
            y,
            facing,
            moving: x !== p.x || y !== p.y,
            pose,
            frame: Math.floor(walkT * WALK_FPS),
          };
          playerRef.current = next;
          setPlayer(next);
        } else if (playerRef.current.moving) {
          walkT = 0;
          const next = { ...playerRef.current, moving: false, pose: "idle" as Pose, frame: 0 };
          playerRef.current = next;
          setPlayer(next);
        }
      } else {
        dirsRef.current.clear();
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Track the stage size so the camera can follow the character.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setSize({ w: entry.contentRect.width, h: entry.contentRect.height }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const enter = (d: WorldDestination) => {
    if (lockRef.current) return;
    lockRef.current = true;
    dirsRef.current.clear();
    if (d.target === null) {
      setPreview(d);
      return;
    }
    setLeaving(d);
    const target = d.target;
    timerRef.current = window.setTimeout(() => onEnterGame(target), reduced ? 0 : 400);
  };
  enterRef.current = enter;

  const closePreview = () => {
    setPreview(null);
    lockRef.current = false;
  };

  // Camera: scene is ZOOM× the stage width, clamped so the edge of the map
  // never shows inside the stage.
  const sceneW = Math.max(size.w * ZOOM, size.h / ASPECT);
  const sceneH = sceneW * ASPECT;
  const camX =
    sceneW > size.w ? Math.min(0, Math.max(size.w - sceneW, size.w / 2 - player.x * sceneW)) : (size.w - sceneW) / 2;
  const camY =
    sceneH > size.h ? Math.min(0, Math.max(size.h - sceneH, size.h / 2 - player.y * sceneH)) : (size.h - sceneH) / 2;

  const setDir = (d: Dir, on: boolean) => {
    if (on) dirsRef.current.add(d);
    else dirsRef.current.delete(d);
  };

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-3xl select-none flex-col px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(3.5rem,env(safe-area-inset-top))]">
      <style>{`
        @keyframes nw-idle { 0%,100% { transform: translate(-50%, -100%) translateY(0); } 50% { transform: translate(-50%, -100%) translateY(-3%); } }
        @keyframes nw-pop { 0% { opacity: 0; transform: translateY(6px) scale(0.96); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      <div className="flex items-center justify-between gap-2">
        <BackButton onClick={onExit} />
        <div className="flex items-center gap-2">
          <p className="text-sm font-black text-muted-foreground">{NAMES[character]} · حينا</p>
          <button type="button" onClick={onShowAll} className="inline-flex min-h-12 items-center rounded-2xl bg-card px-3 font-black shadow active:scale-95">All games</button>
        </div>
      </div>

      <div
        ref={stageRef}
        className="relative mt-3 w-full overflow-hidden rounded-3xl bg-sky-100 shadow-md"
        style={{ height: "min(calc(100vw - 1.5rem), 60dvh)", touchAction: "none", overscrollBehavior: "none" }}
      >
        <div
          className="absolute left-0 top-0"
          style={{
            width: sceneW,
            height: sceneH,
            transform: `translate(${camX}px, ${camY}px)`,
            transition: reduced ? "none" : "transform 180ms linear",
          }}
        >
          <img src={mapUrl} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full" />

          {WORLD_DESTINATIONS.map((d) => {
            const isNear = nearby?.id === d.id;
            return (
              <span
                key={d.id}
                aria-hidden
                className="absolute block rounded-full"
                style={{
                  left: `${d.hotspot.x * 100}%`,
                  top: `${d.hotspot.y * 100}%`,
                  width: sceneW * 0.06,
                  height: sceneW * 0.06,
                  transform: "translate(-50%, -50%)",
                  border: "3px solid rgba(255,255,255,0.8)",
                  background: isNear ? "rgba(255,230,120,0.35)" : "transparent",
                  animation: isNear && !reduced ? "nw-pop 0.3s ease-out" : undefined,
                }}
              />
            );
          })}

          {(() => {
            const frames = FRAMES[character][player.pose];
            const src = frames[player.frame % frames.length];
            const flip = player.pose === "side" && player.facing < 0 ? -1 : 1;
            return (
              <img
                src={src}
                alt={NAMES[character]}
                draggable={false}
                className="pointer-events-none absolute"
                style={{
                  left: `${player.x * 100}%`,
                  top: `${player.y * 100}%`,
                  height: sceneH * CHAR_HEIGHT,
                  width: "auto",
                  transform: `translate(-50%, -100%) scaleX(${flip})`,
                  animation: reduced || player.moving ? undefined : "nw-idle 2.6s ease-in-out infinite",
                  filter: "drop-shadow(0 4px 4px rgba(0,0,0,0.2))",
                }}
              />
            );
          })()}
        </div>

        {nearby && !preview && !leaving && (
          <button
            type="button"
            onClick={() => enter(nearby)}
            className="absolute bottom-3 left-1/2 flex min-h-14 -translate-x-1/2 flex-col items-center justify-center rounded-2xl bg-white/95 px-6 py-2 text-center font-black shadow-lg active:scale-95"
            style={{ animation: reduced ? undefined : "nw-pop 0.25s ease-out" }}
          >
            <img src={nearby.target === "kitchen" ? tetaIdle : DEST_ART[nearby.id].icon} alt="" className="h-12 w-12 object-contain" draggable={false} />
            <span className="text-lg">{nearby.name}</span>
            <span lang="ar" className="font-arabic text-sm">{nearby.arabic}</span>
            <span className="text-xs font-bold text-muted-foreground">Tap to enter</span>
          </button>
        )}

        {preview && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 p-4" style={{ animation: reduced ? undefined : "nw-pop 0.25s ease-out" }}>
            <div className="w-full max-w-xs rounded-3xl bg-white p-5 text-center shadow-xl">
              <img src={DEST_ART[preview.id].building} alt="" className="mx-auto h-40 w-auto object-contain" draggable={false} />
              <h2 className="text-2xl font-black">{preview.name}</h2>
              <p lang="ar" className="font-arabic text-base">{preview.arabic}</p>
              <p className="mt-2 text-sm font-bold text-muted-foreground">{preview.blurb}</p>
              <button
                type="button"
                onClick={closePreview}
                className="mt-4 min-h-12 w-full rounded-2xl bg-primary px-4 font-black text-primary-foreground active:scale-95"
              >
                Back to the neighborhood
              </button>
            </div>
          </div>
        )}

        {leaving && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <p className="text-lg font-black">Going to {leaving.name}…</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="grid grid-cols-3 gap-1" style={{ width: 168 }}>
          <span />
          <DPadButton label="Move up" dir="up" onSet={setDir}><ChevronUp className="h-7 w-7" /></DPadButton>
          <span />
          <DPadButton label="Move left" dir="left" onSet={setDir}><ChevronLeft className="h-7 w-7" /></DPadButton>
          <span />
          <DPadButton label="Move right" dir="right" onSet={setDir}><ChevronRight className="h-7 w-7" /></DPadButton>
          <span />
          <DPadButton label="Move down" dir="down" onSet={setDir}><ChevronDown className="h-7 w-7" /></DPadButton>
          <span />
        </div>
        <p className="max-w-[12rem] text-right text-xs font-bold text-muted-foreground">
          Walk with the arrows, or use the keyboard on a computer. Tap a place to go in.
        </p>
      </div>
    </section>
  );
}

function DPadButton({
  label,
  dir,
  onSet,
  children,
}: {
  label: string;
  dir: Dir;
  onSet: (d: Dir, on: boolean) => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault();
        onSet(dir, true);
      }}
      onPointerUp={() => onSet(dir, false)}
      onPointerLeave={() => onSet(dir, false)}
      onPointerCancel={() => onSet(dir, false)}
      onContextMenu={(e) => e.preventDefault()}
      className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card font-black shadow active:scale-95 active:bg-primary/20"
      style={{ touchAction: "none" }}
    >
      {children}
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-card px-4 font-black shadow active:scale-95"
    >
      <ArrowLeft className="h-5 w-5" /> Back
    </button>
  );
}
