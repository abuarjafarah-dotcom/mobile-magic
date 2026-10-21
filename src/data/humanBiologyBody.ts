/**
 * Anatomy Atlas — schematic front-view body and hotspot geometry (data only).
 *
 * This is a SIMPLIFIED schematic drawn in code, not a finished anatomical illustration.
 * Each organ's shapes are positioned at its approximate real location, so
 * the hotspot for each structure sits on that structure. When the Gemini artwork is
 * ready, replace the schematic geometry with a layered image (see ASSET-MANIFEST.md)
 * and update the coordinates here. Keep the same organ ids.
 *
 * Coordinate space: viewBox 0 0 300 520. The child's left is on the screen's right.
 */
import type { OrganId } from "@/data/humanBiology";

export const BODY_VIEWBOX = "-100 0 500 520";
export const INK = "#2d2a24";
export const BODY_FILL = "#efe6d6";
export const BODY_EDGE = "#cbbca4";

/** Non-interactive body outline. */
export const BODY_SILHOUETTE: string[] = [
  // head
  "M150 14 C178 14 186 40 186 60 C186 84 172 102 150 102 C128 102 114 84 114 60 C114 40 122 14 150 14 Z",
  // neck, torso, arms and legs
  "M136 100 L164 100 L164 118 C200 122 226 128 232 150 L244 226 L236 230 L220 176 L214 300 L210 336 L220 512 L192 514 L166 360 L150 330 L134 360 L108 514 L80 512 L90 336 L86 300 L80 176 L64 230 L56 226 L68 150 C74 128 100 122 136 118 Z",
];

export type Shape =
  | { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number }
  | { kind: "fill"; d: string }
  /** Open path, such as a bone or the intestine. Hit area is at least 14 units wide. */
  | { kind: "line"; d: string; width: number };

export const ORGAN_SHAPES: Record<OrganId, { color: string; shapes: Shape[] }> = {
  lungs: {
    color: "#eea59f",
    shapes: [
      { kind: "ellipse", cx: 118, cy: 168, rx: 24, ry: 42 },
      { kind: "ellipse", cx: 182, cy: 168, rx: 24, ry: 42 },
    ],
  },
  heart: {
    color: "#c9473f",
    shapes: [{ kind: "ellipse", cx: 162, cy: 176, rx: 14, ry: 17 }],
  },
  stomach: {
    color: "#e0a84a",
    shapes: [{ kind: "ellipse", cx: 184, cy: 240, rx: 22, ry: 17 }],
  },
  smallIntestine: {
    color: "#d97b5c",
    shapes: [
      {
        kind: "line",
        d: "M112 276 C128 258 146 294 164 276 S196 258 190 290 S132 302 138 322 S186 318 196 338",
        width: 12,
      },
    ],
  },
  brain: {
    color: "#e6a0b4",
    shapes: [{ kind: "ellipse", cx: 150, cy: 52, rx: 26, ry: 22 }],
  },
  skeleton: {
    color: "#8c7a62",
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
      // arms
      { kind: "line", d: "M104 130 L70 228 L56 300", width: 4 },
      { kind: "line", d: "M196 130 L230 228 L244 300", width: 4 },
      // legs
      { kind: "line", d: "M130 344 L112 430 L108 512", width: 4 },
      { kind: "line", d: "M170 344 L188 430 L192 512", width: 4 },
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
  brain: { text: "BRAIN", tx: 388, ty: 44, anchor: "end", lx: 384, ly: 40, ax: 172, ay: 50 },
  heart: { text: "HEART", tx: 388, ty: 184, anchor: "end", lx: 384, ly: 180, ax: 176, ay: 178 },
  stomach: { text: "STOMACH", tx: 388, ty: 246, anchor: "end", lx: 384, ly: 242, ax: 206, ay: 240 },
  lungs: { text: "LUNGS", tx: -92, ty: 156, anchor: "start", lx: -40, ly: 152, ax: 96, ay: 160 },
  smallIntestine: {
    text: "SMALL INTESTINE",
    tx: -92,
    ty: 326,
    anchor: "start",
    lx: 38,
    ly: 322,
    ax: 136,
    ay: 318,
  },
  skeleton: {
    text: "SKELETON",
    tx: -92,
    ty: 430,
    anchor: "start",
    lx: -18,
    ly: 426,
    ax: 110,
    ay: 430,
  },
};
