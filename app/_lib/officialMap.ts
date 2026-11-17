import positions from "./officialMapPositions.json";

/** Official Seoul Metro diagram (from map_korea.pdf), used as the guide map background. */
export const OFFICIAL_MAP = {
  width: positions.width as number,
  height: positions.height as number,
  image: positions.image as string,
  focus: positions.focus as { x: number; y: number; w: number; h: number },
  stations: positions.stations as Record<string, { x: number; y: number; ocr: string | null; fallback?: boolean }>,
};

/** Map units → screen zoom: the official diagram is denser, so labels/hits stay readable sooner. */
export const OFFICIAL_MAP_LEVELS = [0.35, 0.5, 0.7, 1.0, 1.4, 2.0, 2.8, 4.0, 5.6] as const;
export const OFFICIAL_MAP_MAX_ZOOM = 10;
