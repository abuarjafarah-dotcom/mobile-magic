// Neighborhood World — destination + collision metadata.
// All positions are fractions of the map image (0..1 on both axes), so they
// stay correct at any screen size. Image is 2000 × 1091 px (see MAP_PX).

export const MAP_PX = { w: 2000, h: 1091 } as const;

export type Point = { x: number; y: number };
export type Rect = { x1: number; y1: number; x2: number; y2: number };

// Existing screens a destination can open. These must match the `Screen`
// union in src/routes/index.tsx.
export type WorldTarget = "ws" | "g1" | "kitchen" | "noorani" | "sci";

export type WorldDestination = {
  id: "home" | "masjid" | "garden" | "market" | "school" | "lab";
  name: string;
  arabic: string;
  // Spot the character stands on to enter.
  at: Point;
  // Where the destination's pulse ring sits.
  hotspot: Point;
  // Existing game to open. `null` = in-world preview (no game yet).
  target: WorldTarget | null;
  blurb: string;
};

export const WORLD_DESTINATIONS: readonly WorldDestination[] = [
  {
    id: "home",
    name: "Home",
    arabic: "البيت",
    at: { x: 0.2, y: 0.5 },
    hotspot: { x: 0.14, y: 0.36 },
    target: null,
    blurb: "Our family home. Games are coming here soon.",
  },
  {
    id: "masjid",
    name: "Masjid",
    arabic: "المسجد",
    at: { x: 0.43, y: 0.52 },
    hotspot: { x: 0.41, y: 0.34 },
    target: "ws",
    blurb: "Wudu & Salah: learn how to get ready for prayer.",
  },
  {
    id: "garden",
    name: "Garden",
    arabic: "الحديقة",
    at: { x: 0.3, y: 0.8 },
    hotspot: { x: 0.27, y: 0.7 },
    target: "noorani",
    blurb: "Noorani Qaida: letters grow here, one step at a time.",
  },
  {
    id: "school",
    name: "School",
    arabic: "المدرسة",
    at: { x: 0.63, y: 0.42 },
    hotspot: { x: 0.61, y: 0.27 },
    target: "g1",
    blurb: "Grade 1 Math: numbers and counting.",
  },
  {
    id: "market",
    name: "Market",
    arabic: "السوق",
    at: { x: 0.8, y: 0.52 },
    hotspot: { x: 0.81, y: 0.37 },
    target: "kitchen",
    blurb: "Palestinian Kitchen: cook and taste together.",
  },
  {
    id: "lab",
    name: "Discovery Lab",
    arabic: "مختبر الاكتشاف",
    at: { x: 0.85, y: 0.84 },
    hotspot: { x: 0.9, y: 0.66 },
    target: "sci",
    blurb: "Science World: test, discover and wonder.",
  },
];

// Solid obstacles the character cannot walk through (building footprints,
// tree-and-bed garden, pond, and the Discovery Lab dome).
export const WORLD_OBSTACLES: readonly Rect[] = [
  { x1: 0.03, y1: 0.18, x2: 0.24, y2: 0.47 }, // Home
  { x1: 0.29, y1: 0.15, x2: 0.52, y2: 0.49 }, // Masjid
  { x1: 0.52, y1: 0.14, x2: 0.7, y2: 0.38 }, // School
  { x1: 0.7, y1: 0.27, x2: 0.92, y2: 0.47 }, // Market stalls
  { x1: 0.82, y1: 0.48, x2: 1.0, y2: 0.78 }, // Discovery Lab dome
  { x1: 0.0, y1: 0.55, x2: 0.46, y2: 0.74 }, // Garden trees and beds
  { x1: 0.07, y1: 0.84, x2: 0.24, y2: 0.97 }, // Pond
];

// Area the character may walk in (everything outside is off-map or behind
// the hills).
export const WORLD_BOUNDS = { minX: 0.02, maxX: 0.98, minY: 0.4, maxY: 0.97 } as const;

export const WORLD_SPAWN: Point = { x: 0.45, y: 0.8 };

// Walking speed in map-widths per second.
export const WORLD_SPEED = 0.22;

// How close (in image pixels) the character must be to a destination's
// entry spot to show the "tap to enter" prompt.
export const ENTER_RADIUS_PX = 130;
