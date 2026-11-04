import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdSense from "../../../_components/AdSense";
import {
  ALL_LINES,
  guideDetail,
  guideLine,
  lineSlug,
  lineStations,
  sameGuideLine,
  stationLineColor,
} from "../../../_lib/guide";
import { BRAND, gt, lineLabel, stationTitle, tc } from "../../../_lib/guideCopy";
import { isGuideLocale } from "../../../_lib/guideLocale";
import { guideAlternates, OG_LOCALES, SITE_URL } from "../../../_lib/site";
import { Icon } from "../../_guide/icons";
import { AppPromo, JsonLd, LineLink } from "../../_guide/parts";

export function generateStaticParams() {
  return ALL_LINES.map((line) => ({ line: lineSlug(line) }));
}

async function resolve(params: PageProps<"/[lang]/lines/[line]">["params"]) {
  const { lang, line: slug } = await params;
  const line = guideLine(slug);
  if (!isGuideLocale(lang) || !line) return null;
  return { lang, line, slug };
}

export async function generateMetadata({ params }: PageProps<"/[lang]/lines/[line]">): Promise<Metadata> {
  const found = await resolve(params);
  if (!found) return {};
  const { lang, line, slug } = found;
  const name = lineLabel(line, lang);
  const title = tc("lineMetaTitle", lang, { line: name });
  const description = tc("lineDescription", lang, { line: name, n: lineStations(line).length });
  return {
    title,
    description,
    alternates: guideAlternates(`/lines/${slug}`, lang),
    openGraph: {
      type: "website",
      siteName: gt(BRAND, lang),
      title,
      description,
      locale: OG_LOCALES[lang],
      url: `${SITE_URL}/${lang}/lines/${slug}`,
    },
  };
}

export default async function LineGuide({ params }: PageProps<"/[lang]/lines/[line]">) {
  const found = await resolve(params);
  if (!found) notFound();
  const { lang, line, slug } = found;
  const name = lineLabel(line, lang);
  const color = stationLineColor(line);
  const url = `${SITE_URL}/${lang}/lines/${slug}`;
  const rows = lineStations(line).map((station) => {
    const detail = guideDetail(station);
    return {
      station,
      title: stationTitle(station, lang),
      lockers: detail.lockers.some((row) => sameGuideLine(row.line, line)),
      stepFree: detail.elevators.some((row) => sameGuideLine(row.line, line)),
      others: station.lines.filter((other) => other !== line),
    };
  });
  const facts = [
    tc("lineFactTransfers", lang, { n: rows.filter((row) => row.others.length).length }),
    tc("lineFactLockers", lang, { n: rows.filter((row) => row.lockers).length }),
    tc("lineFactStepFree", lang, { n: rows.filter((row) => row.stepFree).length }),
  ];

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: gt(BRAND, lang), item: `${SITE_URL}/${lang}` },
              {
                "@type": "ListItem",
                position: 2,
                name: tc("breadcrumbStations", lang),
                item: `${SITE_URL}/${lang}/stations`,
              },
              { "@type": "ListItem", position: 3, name, item: url },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: tc("lineHeading", lang, { line: name }),
            url,
            numberOfItems: rows.length,
            itemListElement: rows.map((row, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: row.title,
              url: `${SITE_URL}/${lang}/stations/${row.station.slug}`,
            })),
          },
        ]}
      />

      <nav aria-label="Breadcrumb" className="text-[12px] font-semibold text-ink-muted">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href={`/${lang}`}>{gt(BRAND, lang)}</Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link href={`/${lang}/stations`}>{tc("breadcrumbStations", lang)}</Link>
          </li>
          <li aria-hidden>›</li>
          <li aria-current="page" className="text-ink">
            {name}
          </li>
        </ol>
      </nav>

      <header className="mt-3">
        <h1 className="break-words text-[26px] font-extrabold leading-tight tracking-tight text-ink">
          {tc("lineHeading", lang, { line: name })}
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
          {tc("lineDescription", lang, { line: name, n: rows.length })}
        </p>
        <ul className="mt-4 flex flex-wrap gap-1.5 text-[12px] font-bold">
          {facts.map((fact) => (
            <li key={fact} className="rounded-full bg-surface-muted px-3 py-1 text-ink">
              {fact}
            </li>
          ))}
        </ul>
      </header>

      <section aria-labelledby="line-stations" className="mt-7">
        <h2 id="line-stations" className="text-[18px] font-extrabold tracking-tight text-ink">
          {tc("lineStations", lang)}
        </h2>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{tc("lineStationsHint", lang)}</p>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-semibold text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <Icon name="luggage" size={15} className="text-honey-strong" />
            {tc("lockers", lang)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon name="elevator" size={15} className="text-[#2563eb]" />
            {tc("exitElevator", lang)}
          </span>
        </p>
        <ol className="mt-3 border-l-4 pl-0" style={{ borderColor: color }}>
          {rows.map((row) => (
            <li key={row.station.slug} className="relative -ml-[10px] flex items-start gap-3 py-1.5">
              <span
                className="mt-1.5 h-4 w-4 shrink-0 rounded-full border-[3px] bg-surface"
                style={{ borderColor: color }}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <Link
                    href={`/${lang}/stations/${row.station.slug}`}
                    className="break-words text-[15px] font-bold text-ink underline-offset-2 hover:underline"
                  >
                    {row.title}
                  </Link>
                  {lang !== "ko" ? (
                    <span lang="ko" className="text-[12px] text-ink-muted">
                      {row.station.ko}
                    </span>
                  ) : null}
                  {row.lockers ? (
                    <span role="img" aria-label={tc("lockers", lang)} className="self-center text-honey-strong">
                      <Icon name="luggage" size={15} />
                    </span>
                  ) : null}
                  {row.stepFree ? (
                    <span role="img" aria-label={tc("exitElevator", lang)} className="self-center text-[#2563eb]">
                      <Icon name="elevator" size={15} />
                    </span>
                  ) : null}
                </p>
                {row.others.length ? (
                  <p className="mt-1 flex flex-wrap gap-1">
                    {row.others.map((other) => (
                      <LineLink key={other} line={other} locale={lang} />
                    ))}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <AdSense
        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_STATION_BOTTOM}
        label={tc("advertisement", lang)}
        className="mt-9"
      />

      <section aria-labelledby="other-lines" className="mt-8">
        <h2 id="other-lines" className="text-[17px] font-extrabold text-ink">
          {tc("otherLines", lang)}
        </h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {ALL_LINES.filter((other) => other !== line).map((other) => (
            <LineLink key={other} line={other} locale={lang} />
          ))}
        </div>
      </section>

      <div className="mt-8">
        <AppPromo locale={lang} />
      </div>
    </>
  );
}
