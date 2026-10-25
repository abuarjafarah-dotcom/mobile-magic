/**
 * Anatomy Atlas — flat, colour-blocked front-view body and hotspot geometry (data only).
 *
 * Style: bold flat colour fills with simple labelled cutaways, in the spirit of an
 * encyclopedia page. The shapes are drawn in code for this app. They are NOT traced from,
 * and do not reproduce, any published artwork. They are a stand-in until final art exists
 * (see src/assets/human-biology/ASSET-MANIFEST.md). Keep the organ ids and hotspot data
 * stable so that real layered art can replace these shapes without changing the logic.
 *
 * Coordinate space: viewBox "-100 0 500 520". The child's left is on the screen's right.
 */
import type { OrganId } from "@/data/humanBiology";

export const BODY_VIEWBOX = "-100 0 500 520";
export const INK = "#2d2a24";

/** Soft backdrop behind the figure (keeps organ colours readable). */
export const BODY_BACKDROP = "#fdeecb";
export const BODY_FILL = "#e9a47c"; // skin
export const BODY_EDGE = "#c97f57";
const SKIN = BODY_FILL;
const SHIRT = "#2f7f86";
const PANTS = "#e96a4a";
const SHOE = "#3b3b5c";

/** Filled body parts, drawn in order. */
export const BODY_PARTS: { d: string; fill: string }[] = [
  // head
  {
    d: "M150 12 C180 12 196 34 196 62 C196 92 176 108 150 108 C124 108 104 92 104 62 C104 34 120 12 150 12 Z",
    fill: SKIN,
  },
  // neck
  { d: "M136 102 L164 102 L166 124 L134 124 Z", fill: SKIN },
  // torso (shirt)
  { d: "M104 124 C124 116 176 116 196 124 L210 300 C180 312 120 312 90 300 Z", fill: SHIRT },
  // trousers
  {
    d: "M92 298 C120 306 180 306 208 298 L212 352 L186 352 L160 330 L140 330 L114 352 L88 352 Z",
    fill: PANTS,
  },
];

/** Stroked limbs (drawn with round caps). */
export const BODY_LIMBS: { d: string; width: number; color: string }[] = [
  // arms: sleeves, then forearms and hands
  { d: "M112 136 L72 226", width: 28, color: SHIRT },
  { d: "M188 136 L228 226", width: 28, color: SHIRT },
  { d: "M72 226 L60 300", width: 22, color: SKIN },
  { d: "M228 226 L240 300", width: 22, color: SKIN },
  // legs and shoes
  { d: "M122 336 L116 466", width: 30, color: PANTS },
  { d: "M178 336 L184 466", width: 30, color: PANTS },
  { d: "M116 466 L104 490", width: 28, color: SHOE },
  { d: "M184 466 L196 490", width: 28, color: SHOE },
];

export type Shape =
  | { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number; color?: string }
  | { kind: "fill"; d: string; color?: string }
  /** Open path, such as a bone or the intestine. Hit area is at least 14 units wide. */
  | { kind: "line"; d: string; width: number; color?: string };

export const ORGAN_SHAPES: Record<OrganId, { color: string; shapes: Shape[] }> = {
  lungs: {
    color: "#f08aa0",
    shapes: [
      // left and right lungs (the child's left is on the screen's right)
      {
        kind: "fill",
        d: "M96 132 C78 140 74 178 80 206 C86 226 108 226 116 210 C124 190 120 146 96 132 Z",
      },
      {
        kind: "fill",
        d: "M204 132 C222 140 226 178 220 206 C214 226 192 226 184 210 C176 190 180 146 204 132 Z",
      },
      // windpipe and bronchi
      { kind: "line", d: "M150 110 L150 140", width: 8, color: "#c9d6e8" },
      { kind: "line", d: "M150 140 L126 168 M150 140 L174 168", width: 4, color: "#c9d6e8" },
    ],
  },
  heart: {
    color: "#d6323a",
    shapes: [
      // heart body
      {
        kind: "fill",
        d: "M162 196 C150 186 146 170 152 164 C156 160 160 162 162 166 C164 162 170 160 174 164 C180 170 176 186 162 196 Z",
      },
      // right atrium (blue, as on the body's side that receives blood from the body)
      { kind: "ellipse", cx: 152, cy: 172, rx: 5, ry: 5, color: "#3b6fd6" },
      // aorta (going up to the body)
      { kind: "line", d: "M162 166 L168 140 L180 132", width: 7, color: "#b22329" },
    ],
  },
  stomach: {
    color: "#f2a33a",
    shapes: [
      {
        kind: "fill",
        d: "M190 222 C210 216 222 232 214 248 C208 258 196 254 194 262 C190 272 176 268 178 254 C180 240 176 226 190 222 Z",
      },
    ],
  },
  smallIntestine: {
    color: "#e8735a",
    shapes: [
      {
        kind: "line",
        d: "M112 276 C128 258 146 294 164 276 S196 258 190 290 S132 302 138 322 S186 318 196 338",
        width: 16,
        color: "#b5482f",
      },
      {
        kind: "line",
        d: "M112 276 C128 258 146 294 164 276 S196 258 190 290 S132 302 138 322 S186 318 196 338",
        width: 10,
      },
    ],
  },
  brain: {
    color: "#e5484d",
    shapes: [
      // frontal lobe (front of the head: screen's left)
      { kind: "ellipse", cx: 130, cy: 50, rx: 17, ry: 15, color: "#e5484d" },
      // parietal lobe (top back)
      { kind: "ellipse", cx: 158, cy: 40, rx: 15, ry: 13, color: "#e86fb0" },
      // occipital lobe (back of the head: screen's right)
      { kind: "ellipse", cx: 170, cy: 60, rx: 13, ry: 13, color: "#3fa35b" },
      // temporal lobe (side, low)
      { kind: "ellipse", cx: 148, cy: 72, rx: 18, ry: 8, color: "#f4c430" },
    ],
  },
  skeleton: {
    color: "#f4ecd8",
    shapes: [
      // skull outline
      {
        kind: "line",
        d: "M150 10 C186 10 192 40 192 58 C192 88 176 106 150 106 C124 106 108 88 108 58 C108 40 114 10 150 10",
        width: 3,
      },
      // spine
      { kind: "line", d: "M150 106 L150 330", width: 5 },
      // ribs (left and right)
      { kind: "line", d: "M150 146 Q100 152 98 172", width: 3 },
      { kind: "line", d: "M150 170 Q96 178 96 198", width: 3 },
      { kind: "line", d: "M150 194 Q98 202 100 222", width: 3 },
      { kind: "line", d: "M150 216 Q104 222 106 240", width: 3 },
      { kind: "line", d: "M150 146 Q200 152 202 172", width: 3 },
      { kind: "line", d: "M150 170 Q204 178 204 198", width: 3 },
      { kind: "line", d: "M150 194 Q202 202 200 222", width: 3 },
      { kind: "line", d: "M150 216 Q196 222 194 240", width: 3 },
      // pelvis
      {
        kind: "line",
        d: "M118 320 Q150 300 182 320 Q178 344 150 348 Q122 344 118 320 Z",
        width: 4,
      },
      // arms (same line as the arm limbs)
      { kind: "line", d: "M112 136 L72 226 L60 300", width: 4 },
      { kind: "line", d: "M188 136 L228 226 L240 300", width: 4 },
      // legs
      { kind: "line", d: "M130 344 L120 430 L116 466", width: 4 },
      { kind: "line", d: "M170 344 L180 430 L184 466", width: 4 },
    ],
  },
};

/**
 * Draw order: the skeleton is drawn first, under the organs. Its bone hit areas are
 * wider than the bones, so if they sat on top they would block taps on the heart and lungs.
 * Organs drawn on top win wherever they overlap a bone.
 */
export const ORGAN_DRAW_ORDER: OrganId[] = [
  "skeleton",
  "lungs",
  "heart",
  "stomach",
  "smallIntestine",
  "brain",
];

/**
 * Callout labels in the style of a labelled encyclopedia diagram.
 * (tx, ty) is the text position, (lx, ly) the leader start, (ax, ay) the point on the organ.
 */
export type Callout = {
  text: string;
  tx: number;
  ty: number;
  anchor: "start" | "end";
  lx: number;
  ly: number;
  ax: number;
  ay: number;
};
export const CALLOUTS: Record<OrganId, Callout> = {
  // right-hand labels: text starts at x=318; the leader starts just left of the text
  brain: { text: "BRAIN", tx: 306, ty: 44, anchor: "start", lx: 298, ly: 40, ax: 150, ay: 50 },
  heart: { text: "HEART", tx: 306, ty: 184, anchor: "start", lx: 298, ly: 180, ax: 162, ay: 178 },
  stomach: {
    text: "STOMACH",
    tx: 306,
    ty: 246,
    anchor: "start",
    lx: 298,
    ly: 242,
    ax: 206,
    ay: 240,
  },
  // left-hand labels: the leader starts just right of the text
  lungs: { text: "LUNGS", tx: -92, ty: 156, anchor: "start", lx: -20, ly: 152, ax: 80, ay: 170 },
  smallIntestine: {
    text: "SMALL INTESTINE",
    tx: -92,
    ty: 326,
    anchor: "start",
    lx: 74,
    ly: 322,
    ax: 136,
    ay: 318,
  },
  skeleton: {
    text: "SKELETON",
    tx: -92,
    ty: 430,
    anchor: "start",
    lx: 8,
    ly: 426,
    ax: 116,
    ay: 430,
  },
};

/* ---------------- Atlas artwork (illustrated body) ----------------
 * The Anatomy Atlas draws public/human-biology/body-organs.png and places tap areas
 * over it. Coordinates are in the image's own pixels (1154 × 2364), read from a
 * gridded render of that file. Taps are transparent until an organ is selected.
 * Brain & Senses keeps its own drawing above and is not affected.
 */
export const ATLAS_IMAGE = "/human-biology/body-organs.png";
export const ATLAS_IMAGE_SIZE = { w: 1154, h: 2364 };
/** Labels sit beside the figure, so the viewBox is wider than the image. */
export const ATLAS_VIEWBOX = "-380 0 1794 2364";

export type Hotspot =
  | { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number }
  | { kind: "capsule"; x1: number; y1: number; x2: number; y2: number; width: number };

export const ATLAS_HOTSPOTS: Record<OrganId, Hotspot[]> = {
  brain: [{ kind: "ellipse", cx: 583, cy: 144, rx: 112, ry: 100 }],
  lungs: [
    { kind: "ellipse", cx: 473, cy: 642, rx: 93, ry: 152 },
    { kind: "ellipse", cx: 679, cy: 642, rx: 97, ry: 152 },
  ],
  heart: [{ kind: "ellipse", cx: 600, cy: 667, rx: 68, ry: 76 }],
  stomach: [{ kind: "ellipse", cx: 615, cy: 890, rx: 95, ry: 55 }],
  smallIntestine: [{ kind: "ellipse", cx: 507, cy: 1098, rx: 101, ry: 93 }],
  // The skeleton is a backdrop target: drawn first, so organs above it win taps.
  skeleton: [
    { kind: "ellipse", cx: 580, cy: 225, rx: 110, ry: 150 },
    { kind: "ellipse", cx: 583, cy: 650, rx: 195, ry: 160 },
    { kind: "ellipse", cx: 580, cy: 1280, rx: 215, ry: 60 },
    { kind: "capsule", x1: 346, y1: 490, x2: 76, y2: 1351, width: 70 },
    { kind: "capsule", x1: 811, y1: 507, x2: 1081, y2: 1351, width: 70 },
    { kind: "capsule", x1: 405, y1: 1284, x2: 439, y2: 2179, width: 80 },
    { kind: "capsule", x1: 684, y1: 1284, x2: 667, y2: 2179, width: 80 },
  ],
};

/** Draw order for Atlas hotspots: skeleton under the organs. */
export const ATLAS_DRAW_ORDER: OrganId[] = [
  "skeleton",
  "lungs",
  "heart",
  "stomach",
  "smallIntestine",
  "brain",
];

/** Labels with leader lines to the organ, in image pixels. Right side labels sit at x ≥ 1180. */
export const ATLAS_CALLOUTS: Record<OrganId, Callout> = {
  brain: { text: "BRAIN", tx: 1180, ty: 150, anchor: "start", lx: 1172, ly: 146, ax: 650, ay: 144 },
  heart: { text: "HEART", tx: 1180, ty: 670, anchor: "start", lx: 1172, ly: 666, ax: 640, ay: 667 },
  stomach: {
    text: "STOMACH",
    tx: 1180,
    ty: 890,
    anchor: "start",
    lx: 1172,
    ly: 886,
    ax: 690,
    ay: 890,
  },
  lungs: { text: "LUNGS", tx: -360, ty: 640, anchor: "start", lx: -215, ly: 636, ax: 430, ay: 650 },
  smallIntestine: {
    text: "SMALL INTESTINE",
    tx: -360,
    ty: 1110,
    anchor: "start",
    lx: 20,
    ly: 1106,
    ax: 420,
    ay: 1110,
  },
  skeleton: {
    text: "SKELETON",
    tx: -360,
    ty: 1700,
    anchor: "start",
    lx: -150,
    ly: 1696,
    ax: 440,
    ay: 1690,
  },
};
