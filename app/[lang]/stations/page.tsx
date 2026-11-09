import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_LINES, GUIDE_STATIONS } from "../../_lib/guide";
import { BRAND, COPY, gt, lineLabel, tc } from "../../_lib/guideCopy";
import { isGuideLocale } from "../../_lib/guideLocale";
import { guideAlternates, OG_LOCALES } from "../../_lib/site";
import { DesktopWide } from "../_guide/desktop";
import GuideSearch from "../_guide/GuideSearch";
import { AppPromo, LineLink, searchItems, StationLink } from "../_guide/parts";

export async function generateMetadata({ params }: PageProps<"/[lang]/stations">): Promise<Metadata> {
  const { lang } = await params;
  if (!isGuideLocale(lang)) return {};
  const title = `${gt(COPY.allStationsTitle, lang)} | ${gt(BRAND, lang)}`;
  const description = gt(COPY.allStationsDescription, lang);
  return {
    title,
    description,
    alternates: guideAlternates("/stations", lang),
    openGraph: { type: "website", siteName: gt(BRAND, lang), title, description, locale: OG_LOCALES[lang] },
  };
}

export default async function StationDirectory({ params }: PageProps<"/[lang]/stations">) {
  const { lang } = await params;
  if (!isGuideLocale(lang)) notFound();
  const collator = new Intl.Collator(lang);
  return (
    <DesktopWide>
      <h1 className="text-[24px] font-extrabold leading-tight tracking-tight text-ink lg:text-[40px] lg:leading-[1.15]">
        {tc("allStationsTitle", lang)}
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-muted lg:mt-4 lg:max-w-3xl lg:text-lg lg:leading-relaxed">
        {tc("allStationsDescription", lang)}
      </p>
      <div className="mt-4 lg:mt-8 lg:max-w-3xl">
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
          collator.compare(gt(a.name, lang), gt(b.name, lang)),
        );
        return (
          <section
            key={line}
            className="mt-7 lg:mt-10 lg:border-t lg:border-line lg:pt-8"
            aria-label={lineLabel(line, lang)}
          >
            <h2 className="flex flex-wrap items-center gap-2 lg:gap-3">
              <LineLink line={line} locale={lang} />
              <span className="text-[12px] font-semibold text-ink-muted lg:text-[14px]">
                {tc("stationsCount", lang, { n: stations.length })}
              </span>
            </h2>
            <div className="mt-3 flex flex-wrap gap-1.5 lg:mt-4 lg:gap-2">
              {stations.map((station) => (
                <StationLink key={station.slug} station={station} locale={lang} />
              ))}
            </div>
          </section>
        );
      })}

      <div className="mt-10 lg:mt-16">
        <AppPromo locale={lang} />
      </div>
    </DesktopWide>
  );
}
