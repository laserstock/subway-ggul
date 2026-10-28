import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDE_STATIONS, POPULAR_GUIDES } from "../_lib/guide";
import { BRAND, COPY, tc } from "../_lib/guideCopy";
import { isLocale, t } from "../_lib/i18n";
import { guideAlternates, OG_LOCALES, SITE_URL } from "../_lib/site";
import GuideSearch from "./_guide/GuideSearch";
import { AppPromo, JsonLd, searchItems, StationLink } from "./_guide/parts";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const title = `${t(COPY.homeTitle, lang)} | ${t(BRAND, lang)}`;
  const description = t(COPY.homeDescription, lang);
  return {
    title,
    description,
    alternates: guideAlternates("", lang),
    openGraph: { type: "website", siteName: t(BRAND, lang), title, description, locale: OG_LOCALES[lang], url: `/${lang}` },
  };
}

const FEATURES = [
  ["🚪", "featureExits"],
  ["🚻", "featureToilets"],
  ["🧳", "featureLockers"],
  ["🔁", "featureTransfers"],
  ["⏱️", "featureLive"],
] as const;

export default async function GuideHome({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: t(BRAND, lang),
          url: `${SITE_URL}/${lang}`,
          inLanguage: lang,
        }}
      />
      <section className="pt-2">
        <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-ink">{tc("homeHeading", lang)}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
          {tc("homeLead", lang, { n: GUIDE_STATIONS.length })}
        </p>
        <div className="mt-5">
          <GuideSearch
            locale={lang}
            items={searchItems(lang)}
            label={tc("searchLabel", lang)}
            placeholder={tc("searchPlaceholder", lang)}
            empty={tc("searchEmpty", lang)}
          />
        </div>
      </section>

      <section className="mt-7" aria-labelledby="popular">
        <h2 id="popular" className="text-[17px] font-extrabold text-ink">
          {tc("popular", lang)}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {POPULAR_GUIDES.map((station) => (
            <StationLink key={station.slug} station={station} locale={lang} />
          ))}
        </div>
        <Link
          href={`/${lang}/stations`}
          className="mt-4 inline-flex items-center gap-1 text-[14px] font-bold text-honey-strong"
        >
          {tc("allStations", lang)} →
        </Link>
      </section>

      <section className="mt-8" aria-labelledby="features">
        <h2 id="features" className="text-[17px] font-extrabold text-ink">
          {tc("features", lang)}
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {FEATURES.map(([emoji, key]) => (
            <li key={key} className="flex items-center gap-3 rounded-2xl bg-surface-muted px-4 py-3">
              <span className="text-[20px]" aria-hidden>
                {emoji}
              </span>
              <span className="min-w-0 break-words text-[14px] font-semibold text-ink">{tc(key, lang)}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8">
        <AppPromo locale={lang} />
      </div>
    </>
  );
}
