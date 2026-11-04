/** Station marker and label geometry shared by the server-side label placement and the client map, in screen px. */

export const DOT_R = 4;
export const HUB_R = 5.5;
const GAP = 3;
const LINE_HEIGHT = 1.2;

export const LABEL_FONT = { hub: 12, regular: 11 } as const;

/** Directions a label can sit in around its station, best first when nothing nearby is in the way. */
export const LABEL_POSITIONS = [
  [1, 0],
  [-1, 0],
  [0, -1],
  [0, 1],
  [0.7, -0.7],
  [0.7, 0.7],
  [-0.7, -0.7],
  [-0.7, 0.7],
] as const;

/** Long Latin names break onto two lines at the space nearest the middle. */
export function labelLines(text: string): string[] {
  if (text.length <= 16 || !text.includes(" ")) return [text];
  const middle = text.length / 2;
  let best = -1;
  for (let index = text.indexOf(" "); index !== -1; index = text.indexOf(" ", index + 1)) {
    if (best === -1 || Math.abs(index - middle) < Math.abs(best - middle)) best = index;
  }
  return [text.slice(0, best), text.slice(best + 1)];
}

const WIDE = /[\u1100-\u11ff\u2e80-\u9fff\uac00-\ud7af\uf900-\ufaff\uff00-\uffef]/;

/** Rough rendered width of bold text: no font metrics on the server, so per-character estimates with a margin. */
export function textWidth(text: string, size: number) {
  let em = 0;
  for (const char of text) {
    if (WIDE.test(char)) em += 1;
    else if (/[A-Z0-9]/.test(char)) em += 0.64;
    else if (/[a-z]/.test(char)) em += 0.55;
    else if (char === " ") em += 0.27;
    else em += 0.36;
  }
  return em * size + 2;
}

export type LabelBox = { x0: number; y0: number; x1: number; y1: number };

/** The label's box around its station (px, station at 0,0) for a position index. */
export function labelBox(position: number, hub: boolean, lines: string[]): LabelBox {
  const size = hub ? LABEL_FONT.hub : LABEL_FONT.regular;
  const w = Math.max(...lines.map((line) => textWidth(line, size)));
  const h = lines.length * size * LINE_HEIGHT;
  const [ux, uy] = LABEL_POSITIONS[position];
  const gap = (hub ? HUB_R : DOT_R) + GAP;
  const x0 = ux > 0 ? ux * gap : ux < 0 ? ux * gap - w : -w / 2;
  const y0 = uy > 0 ? uy * gap : uy < 0 ? uy * gap - h : -h / 2;
  return { x0, y0, x1: x0 + w, y1: y0 + h };
}

/** Where to draw the label's text: anchor, x, and each line's baseline. */
export function labelText(position: number, hub: boolean, lines: string[]) {
  const size = hub ? LABEL_FONT.hub : LABEL_FONT.regular;
  const box = labelBox(position, hub, lines);
  const [ux] = LABEL_POSITIONS[position];
  return {
    size,
    anchor: ux > 0 ? "start" : ux < 0 ? "end" : "middle",
    x: ux > 0 ? box.x0 : ux < 0 ? box.x1 : 0,
    baselines: lines.map((_, index) => box.y0 + size * (index * LINE_HEIGHT + 0.95)),
  } as const;
}
