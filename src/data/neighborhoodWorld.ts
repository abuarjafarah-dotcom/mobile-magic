// Neighborhood World — destination + collision metadata.
// All positions are fractions of the map image (0..1 on both axes), so they
// stay correct at any screen size. Image is 2000 × 1091 px (see MAP_PX).

export const MAP_PX = { w: 2000, h: 1091 } as const;

export type Point = { x: number; y: number };
export type Rect = { x1: number; y1: number; x2: number; y2: number };

// Existing screens a destination can open. These must match the `Screen`
// union in src/routes/index.tsx; "quran" opens the Qur'an picker.
export type WorldTarget =
  | "kitchen"
  | "build"
  | "ws"
  | "iq"
  | "ie"
  | "quran"
  | "noorani"
  | "beads"
  | "golden"
  | "lw"
  | "seek"
  | "play"
  | "g1"
  | "quest"
  | "bowling"
  | "geo"
  | "chess"
  | "hbl"
  | "sci";

// Label and emoji for each target, shown on the enter buttons.
export const TARGET_INFO: Record<WorldTarget, { label: string; icon: string }> = {
  kitchen: { label: "Palestinian Kitchen", icon: "🍲" },
  build: { label: "Building World", icon: "🧱" },
  ws: { label: "Wudu & Salah", icon: "🤲" },
  iq: { label: "Interactive Qur’an", icon: "📖" },
  ie: { label: "More to Explore", icon: "🕌" },
  quran: { label: "Surahs & Finish the Ayah", icon: "📗" },
  noorani: { label: "Noorani Qaida", icon: "🌳" },
  beads: { label: "Bead Garden", icon: "🌼" },
  golden: { label: "Golden Bead Workshop", icon: "🟡" },
  lw: { label: "Arabic Learning World", icon: "🔤" },
  seek: { label: "Seek & Find", icon: "🔎" },
  play: { label: "Harakat Slot Machine", icon: "🎰" },
  g1: { label: "Grade 1 Math", icon: "🔢" },
  quest: { label: "Math Quest", icon: "🌟" },
  bowling: { label: "Math Bowling", icon: "🎳" },
  geo: { label: "Geography", icon: "🌍" },
  chess: { label: "Chess", icon: "♟️" },
  hbl: { label: "Human Biology Lab", icon: "🫀" },
  sci: { label: "Science World", icon: "🔬" },
};

export type WorldDestination = {
  id: "home" | "masjid" | "garden" | "market" | "school" | "lab";
  name: string;
  arabic: string;
  // Spot in front of the door where the character stands to enter.
  at: Point;
  // Where the destination's pulse ring sits (on the building's door).
  hotspot: Point;
  // Existing games to offer here. Empty = in-world preview (no game yet).
  targets: readonly WorldTarget[];
  blurb: string;
};

export const WORLD_DESTINATIONS: readonly WorldDestination[] = [
  {
    id: "home",
    name: "Family Home",
    arabic: "البيت",
    at: { x: 0.19, y: 0.5 },
    hotspot: { x: 0.19, y: 0.45 },
    targets: ["kitchen", "build", "lw", "play"],
    blurb: "Teta’s kitchen, Building World, Arabic and Harakat, all at home.",
  },
  {
    id: "masjid",
    name: "Masjid",
    arabic: "المسجد",
    at: { x: 0.43, y: 0.5 },
    hotspot: { x: 0.43, y: 0.42 },
    targets: ["ws", "iq", "quran", "noorani", "ie"],
    blurb: "Prayer, the Qur’an and Islamic learning.",
  },
  {
    id: "garden",
    name: "Garden",
    arabic: "الحديقة",
    at: { x: 0.3, y: 0.8 },
    hotspot: { x: 0.27, y: 0.7 },
    targets: ["beads", "golden"],
    blurb: "Beads and place value, growing one step at a time.",
  },
  {
    id: "market",
    name: "Market",
    arabic: "السوق",
    at: { x: 0.8, y: 0.49 },
    hotspot: { x: 0.8, y: 0.36 },
    targets: ["seek"],
    blurb: "Seek & Find: look for the hidden words.",
  },
  {
    id: "school",
    name: "School",
    arabic: "المدرسة",
    at: { x: 0.63, y: 0.42 },
    hotspot: { x: 0.63, y: 0.33 },
    targets: ["g1", "quest", "bowling", "geo", "chess"],
    blurb: "Math, geography and strategy.",
  },
  {
    id: "lab",
    name: "Discovery Lab",
    arabic: "مختبر الاكتشاف",
    at: { x: 0.84, y: 0.81 },
    hotspot: { x: 0.85, y: 0.72 },
    targets: ["hbl", "sci"],
    blurb: "How our bodies and the world work.",
  },
];

// Solid obstacles the character cannot walk through. Each building's
// footprint stops at its doorway so the spot in front stays reachable.
export const WORLD_OBSTACLES: readonly Rect[] = [
  { x1: 0.03, y1: 0.18, x2: 0.24, y2: 0.47 }, // Family home
  { x1: 0.29, y1: 0.15, x2: 0.52, y2: 0.46 }, // Masjid
  { x1: 0.52, y1: 0.14, x2: 0.7, y2: 0.36 }, // School
  { x1: 0.7, y1: 0.27, x2: 0.92, y2: 0.45 }, // Market stalls
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
