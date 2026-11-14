import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_LINES, GUIDE_STATIONS, guideDetail, type GuideDetail } from "../../_lib/guide";
import { BRAND, gt } from "../../_lib/guideCopy";
import { GUIDE_LANGUAGES, isGuideLocale, type GuideLocale } from "../../_lib/guideLocale";
import { CONTACT_EMAIL } from "../../_lib/legal";
import { guideAlternates, OG_LOCALES, SITE_URL } from "../../_lib/site";
import { STATION_LOCAL_GUIDES } from "../../_lib/stationLocalGuides";
import {
  COVERAGE_HEADING,
  COVERAGE_LABELS,
  DATA_SOURCES,
  EDITORIAL_DESCRIPTION,
  EDITORIAL_LEAD,
  EDITORIAL_SECTIONS,
  EDITORIAL_TITLE,
  SOURCES_HEADING,
  TRUST_COPY,
  TRUST_UPDATED,
} from "../../_lib/trustPages";
import { JsonLd } from "../_guide/parts";
import { breadcrumbs, organization, TrustIntro, TrustProse, TrustRelated } from "../_guide/trust";

export async function generateMetadata({ params }: PageProps<"/[lang]/editorial-policy">): Promise<Metadata> {
  const { lang } = await params;
  if (!isGuideLocale(lang)) return {};
  const title = `${gt(EDITORIAL_TITLE, lang)} | ${lang === "en" ? "K-SUB" : gt(BRAND, lang)}`;
  const description = gt(EDITORIAL_DESCRIPTION, lang);
  return {
    title,
    description,
    alternates: guideAlternates("/editorial-policy", lang),
    openGraph: {
      type: "website",
      siteName: gt(BRAND, lang),
      title,
      description,
      locale: OG_LOCALES[lang],
      url: `/${lang}/editorial-policy`,
    },
  };
}

/** How many station guides have each kind of data, counted from the same tables the pages render. */
function coverage(locale: GuideLocale): [string, number][] {
  const details = GUIDE_STATIONS.map(guideDetail);
  const count = (has: (detail: GuideDetail) => boolean) => details.filter(has).length;
  return [
    [gt(COVERAGE_LABELS.stations, locale), GUIDE_STATIONS.length],
    [gt(COVERAGE_LABELS.lines, locale), ALL_LINES.length],
    [gt(COVERAGE_LABELS.exits, locale), count((detail) => detail.exits.length > 0)],
    [gt(COVERAGE_LABELS.toilets, locale), count((detail) => detail.toilets.length > 0)],
    [gt(COVERAGE_LABELS.lockers, locale), count((detail) => detail.lockers.length > 0)],
    [gt(COVERAGE_LABELS.transfers, locale), count((detail) => detail.transfers.length > 0)],
    [gt(COVERAGE_LABELS.elevators, locale), count((detail) => detail.elevators.length > 0)],
    [gt(COVERAGE_LABELS.curated, locale), Object.keys(STATION_LOCAL_GUIDES).length],
  ];
}

export default async function EditorialPolicyPage({ params }: PageProps<"/[lang]/editorial-policy">) {
  const { lang } = await params;
  if (!isGuideLocale(lang)) notFound();
  const title = gt(EDITORIAL_TITLE, lang);
  const url = `${SITE_URL}/${lang}/editorial-policy`;
  const values = {
    curated: Object.keys(STATION_LOCAL_GUIDES).length,
    email: CONTACT_EMAIL ?? `${SITE_URL}/contact`,
  };
  const [first, ...rest] = EDITORIAL_SECTIONS;

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: title,
            description: gt(EDITORIAL_DESCRIPTION, lang),
            url,
            inLanguage: GUIDE_LANGUAGES[lang].htmlLang,
            dateModified: TRUST_UPDATED,
            about: organization(CONTACT_EMAIL),
            isBasedOn: DATA_SOURCES.map((source) => ({ "@type": "Dataset", name: source.name.ko, url: source.url })),
          },
          breadcrumbs(lang, title, url),
        ]}
      />
      <article>
        <TrustIntro locale={lang} title={title} lead={gt(EDITORIAL_LEAD, lang)} />

        <section id="sources" aria-labelledby="data-sources" className="mt-8 scroll-mt-20 lg:mt-12">
          <h2 id="data-sources" className="text-[19px] font-extrabold tracking-tight text-ink lg:text-[24px]">
            {gt(SOURCES_HEADING, lang)}
          </h2>
          <ul className="mt-3 flex flex-col gap-2.5 lg:mt-5 lg:grid lg:grid-cols-2 lg:gap-3">
            {DATA_SOURCES.map((source) => {
              const name = gt(source.name, lang);
              return (
                <li key={source.name.ko} className="rounded-2xl border border-line bg-surface px-4 py-3.5 lg:px-5 lg:py-4">
                  <p className="text-[15px] font-extrabold leading-snug text-ink">{name}</p>
                  {name !== source.name.ko ? (
                    <p lang="ko" className="mt-0.5 text-[12px] text-ink-muted">
                      {gt(TRUST_COPY.koreanName, lang)}: {source.name.ko}
                    </p>
                  ) : null}
                  <p className="mt-1.5 text-[13px] font-semibold text-ink-muted">{gt(source.publisher, lang)}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink">{gt(source.use, lang)}</p>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener"
                    className="mt-1.5 inline-block text-[13px] font-bold text-honey-strong underline-offset-2 hover:underline"
                  >
                    {new URL(source.url).hostname.replace(/^www\./, "")} ↗
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        <TrustProse section={first} locale={lang} values={values} />

        <section id="coverage" aria-labelledby="coverage-heading" className="mt-8 scroll-mt-20 lg:mt-12">
          <h2 id="coverage-heading" className="text-[19px] font-extrabold tracking-tight text-ink lg:text-[24px]">
            {gt(COVERAGE_HEADING, lang)}
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-2 lg:mt-5 lg:grid-cols-4 lg:gap-3">
            {coverage(lang).map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-line bg-surface px-3 py-3 lg:px-4 lg:py-4">
                <dt className="text-[12px] font-bold leading-snug text-ink-muted lg:text-[13px]">{label}</dt>
                <dd className="mt-1 text-[22px] font-extrabold leading-none text-honey-strong lg:text-[28px]">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {rest.map((section) => (
          <TrustProse key={section.heading.en} section={section} locale={lang} values={values} />
        ))}
      </article>
      <TrustRelated locale={lang} current="editorial" />
    </>
  );
}
