import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_LINES, guideDetail } from "../../_lib/guide";
import { BRAND, COPY, gt, lineLabel, tc } from "../../_lib/guideCopy";
import { contentLocale, isGuideLocale, type GuideLocale } from "../../_lib/guideLocale";
import { guideAlternates, OG_LOCALES, SITE_URL } from "../../_lib/site";
import { MAP_LEVELS, MAP_MAX_ZOOM, placeLabels, SUBWAY_MAP } from "../../_lib/subwayMap";
import { AppPromo, JsonLd, LineLink } from "../_guide/parts";
import SubwayMap, { type MapCopy, type MapLineData, type MapStationData } from "./SubwayMap";

export async function generateMetadata({ params }: PageProps<"/[lang]/map">): Promise<Metadata> {
  const { lang } = await params;
  if (!isGuideLocale(lang)) return {};
  const title = `${gt(COPY.mapTitle, lang)} | ${lang === "en" ? "K-SUB" : gt(BRAND, lang)}`;
  const description = gt(COPY.mapDescription, lang);
  return {
    title,
    description,
    alternates: guideAlternates("/map", lang),
    openGraph: { type: "website", siteName: gt(BRAND, lang), title, description, locale: OG_LOCALES[lang], url: `/${lang}/map` },
  };
}

function mapData(lang: GuideLocale) {
  const { nodes, lines } = SUBWAY_MAP;
  const names = nodes.map((node) => gt(node.station.name, lang));
  const labels = placeLabels(names);
  const lineIndex = new Map(lines.map((line, index) => [line.line, index]));
  const mapLines: MapLineData[] = lines.map((line) => ({ ko: line.line, name: lineLabel(line.line, lang), color: line.color, d: line.d }));
  const stations: MapStationData[] = nodes.map((node, index) => {
    const detail = guideDetail(node.station);
    const inside = detail.toilets.filter((row) => row.gate === "inside").length;
    return {
      slug: node.station.slug,
      name: names[index],
      ko: node.station.ko,
      alt: lang === "en" ? null : gt(node.station.name, "en"),
      x: node.x,
      y: node.y,
      lines: node.lines.map((line) => lineIndex.get(line)).filter((line) => line !== undefined),
      hub: node.hub,
      level: Math.min(labels[index].level, MAP_LEVELS.length - 1),
      position: labels[index].position,
      lat: node.station.lat,
      lng: node.station.lng,
      exits: detail.exits.length,
      restroomsIn: inside,
      restroomsOut: detail.toilets.length - inside,
      lockers: detail.lockers.length,
      desk: Boolean(detail.luggageDesk),
      elevator: detail.elevators[0] ? gt(detail.elevators[0].exit, lang) : null,
    };
  });
  return { lines: mapLines, stations };
}

export default async function SubwayMapPage({ params }: PageProps<"/[lang]/map">) {
  const { lang } = await params;
  if (!isGuideLocale(lang)) notFound();
  const { width, height, focus } = SUBWAY_MAP;
  const { lines, stations } = mapData(lang);
  const heading = tc("mapHeading", lang);
  const copy: MapCopy = {
    label: tc("mapLabel", lang),
    search: tc("mapSearch", lang),
    empty: tc("searchEmpty", lang),
    allLines: tc("mapAllLines", lang),
    close: tc("mapClose", lang),
    expand: tc("mapExpand", lang),
    collapse: tc("mapCollapse", lang),
    zoomIn: tc("mapZoomIn", lang),
    zoomOut: tc("mapZoomOut", lang),
    reset: tc("mapReset", lang),
    exits: tc("mapFactExits", lang),
    restrooms: tc("mapFactRestrooms", lang),
    lockers: tc("mapFactLockers", lang),
    elevator: tc("mapFactElevator", lang),
    exitsCount: tc("mapExitsCount", lang),
    restroomCount: tc("utilRestroomCount", lang),
    lockersCount: tc("utilLockersCount", lang),
    desk: tc("utilLuggageDesk", lang),
    elevatorVia: tc("utilElevatorVia", lang),
    noData: tc("utilNoData", lang),
    guide: tc("mapGuide", lang),
    live: tc("mapLive", lang),
  };

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: tc("breadcrumbHome", lang), item: `${SITE_URL}/${lang}` },
            { "@type": "ListItem", position: 2, name: heading, item: `${SITE_URL}/${lang}/map` },
          ],
        }}
      />
      <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-ink">{heading}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
        {tc("mapLead", lang, { lines: lines.length, n: stations.length })}
      </p>
      <p className="mt-2 text-[12px] font-semibold text-ink-muted">{tc("mapHint", lang)}</p>

      <div className="-mx-2 mt-3 sm:mx-0">
        <SubwayMap
          lang={lang}
          appLang={contentLocale(lang)}
          width={width}
          height={height}
          focus={focus}
          levels={MAP_LEVELS}
          maxZoom={MAP_MAX_ZOOM}
          lines={lines}
          stations={stations}
          copy={copy}
        />
      </div>

      <section aria-labelledby="map-lines" className="mt-7">
        <h2 id="map-lines" className="text-[17px] font-extrabold text-ink">
          {tc("mapLegend", lang)}
        </h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {ALL_LINES.map((line) => (
            <LineLink key={line} line={line} locale={lang} />
          ))}
        </div>
      </section>

      <section aria-labelledby="map-how" className="mt-8">
        <h2 id="map-how" className="text-[17px] font-extrabold text-ink">
          {tc("mapHowTitle", lang)}
        </h2>
        <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-ink">
          {(["mapHow1", "mapHow2", "mapHow3"] as const).map((key) => (
            <li key={key} className="rounded-2xl bg-surface-muted px-4 py-3">
              {tc(key, lang)}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[14px] font-bold">
          <Link href={`/${lang}/stations`} className="text-honey-strong">
            {tc("allStations", lang)} →
          </Link>
        </p>
      </section>

      <div className="mt-8">
        <AppPromo locale={lang} />
      </div>

      <p className="mt-6 text-[11px] leading-relaxed text-ink-muted">{tc("mapNote", lang)}</p>
    </>
  );
}
