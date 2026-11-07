import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_LINES } from "../../_lib/guide";
import { BRAND, COPY, gt, tc } from "../../_lib/guideCopy";
import { contentLocale, isGuideLocale } from "../../_lib/guideLocale";
import { guideAlternates, OG_LOCALES, SITE_URL } from "../../_lib/site";
import { MAP_LEVELS, MAP_MAX_ZOOM, SUBWAY_MAP } from "../../_lib/subwayMap";
import { AppPromo, JsonLd, LineLink } from "../_guide/parts";
import { mapCopy, mapData } from "./mapData";
import SubwayMap from "./SubwayMap";

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

export default async function SubwayMapPage({ params }: PageProps<"/[lang]/map">) {
  const { lang } = await params;
  if (!isGuideLocale(lang)) notFound();
  const { width, height, focus } = SUBWAY_MAP;
  const { lines, stations } = mapData(lang);
  const heading = tc("mapHeading", lang);
  const copy = mapCopy(lang);

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
