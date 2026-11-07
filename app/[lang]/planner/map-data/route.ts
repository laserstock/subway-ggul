import { MAP_LEVELS, MAP_MAX_ZOOM, SUBWAY_MAP } from "../../../_lib/subwayMap";
import { mapCopy, mapData } from "../../map/mapData";

export function generateStaticParams() {
  return [{ lang: "en" }];
}

/** The subway map for the planner's station picker, loaded only when the picker opens. */
export async function GET(_request: Request, context: RouteContext<"/[lang]/planner/map-data">) {
  const { lang } = await context.params;
  if (lang !== "en") return new Response(null, { status: 404 });
  const { width, height, focus } = SUBWAY_MAP;
  return Response.json({ width, height, focus, levels: MAP_LEVELS, maxZoom: MAP_MAX_ZOOM, ...mapData(lang), copy: mapCopy(lang) });
}
