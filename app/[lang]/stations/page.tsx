import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_LINES, GUIDE_STATIONS, localLine } from "../../_lib/guide";
import { BRAND, COPY, tc } from "../../_lib/guideCopy";
import { isLocale, t } from "../../_lib/i18n";
import { guideAlternates, OG_LOCALES } from "../../_lib/site";
import GuideSearch from "../_guide/GuideSearch";
import { AppPromo, LineChip, searchItems, StationLink } from "../_guide/parts";

export async function generateMetadata({ params }: PageProps<"/[lang]/stations">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const title = `${t(COPY.allStationsTitle, lang)} | ${t(BRAND, lang)}`;
  const description = t(COPY.allStationsDescription, lang);
  return {
    title,
    description,
    alternates: guideAlternates("/stations", lang),
    openGraph: { type: "website", siteName: t(BRAND, lang), title, description, locale: OG_LOCALES[lang] },
  };
}

export default async function StationDirectory({ params }: PageProps<"/[lang]/stations">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const collator = new Intl.Collator(lang);
  return (
    <>
      <h1 className="text-[24px] font-extrabold leading-tight tracking-tight text-ink">{tc("allStationsTitle", lang)}</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{tc("allStationsDescription", lang)}</p>
      <div className="mt-4">
        <GuideSearch
          locale={lang}
          items={searchItems(lang)}
          label={tc("searchLabel", lang)}
          placeholder={tc("searchPlaceholder", lang)}
          empty={tc("searchEmpty", lang)}
        />
      </div>

      {ALL_LINES.map((line) => {
        const stations = GUIDE_STATIONS.filter((station) => station.lines.includes(line)).sort((a, b) =>
          collator.compare(t(a.name, lang), t(b.name, lang)),
        );
        return (
          <section key={line} className="mt-7" aria-label={localLine(line, lang)}>
            <h2 className="flex flex-wrap items-center gap-2">
              <LineChip line={line} locale={lang} />
              <span className="text-[12px] font-semibold text-ink-muted">
                {tc("stationsCount", lang, { n: stations.length })}
              </span>
            </h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {stations.map((station) => (
                <StationLink key={station.slug} station={station} locale={lang} />
              ))}
            </div>
          </section>
        );
      })}

      <div className="mt-10">
        <AppPromo locale={lang} />
      </div>
    </>
  );
}
