import { GUIDE_LOCALES, isGuideLocale } from "../../../_lib/guideLocale";
import { mapCopy, mapData } from "../../map/mapData";

export function generateStaticParams() {
  return GUIDE_LOCALES.map((lang) => ({ lang }));
}

/** The subway map for the planner's station picker, loaded only when the picker opens. */
export async function GET(_request: Request, context: RouteContext<"/[lang]/planner/map-data">) {
  const { lang } = await context.params;
  if (!isGuideLocale(lang)) return new Response(null, { status: 404 });
  return Response.json({ ...mapData(lang), copy: mapCopy(lang) });
}
