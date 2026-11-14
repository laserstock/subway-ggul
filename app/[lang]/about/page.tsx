import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_LINES, GUIDE_STATIONS } from "../../_lib/guide";
import { BRAND, fill, gt } from "../../_lib/guideCopy";
import { GUIDE_LANGUAGES, isGuideLocale } from "../../_lib/guideLocale";
import { CONTACT_EMAIL } from "../../_lib/legal";
import { guideAlternates, OG_LOCALES, SITE_URL } from "../../_lib/site";
import {
  ABOUT_DESCRIPTION,
  ABOUT_FEATURES,
  ABOUT_FEATURES_HEADING,
  ABOUT_SECTIONS,
  ABOUT_STORY,
  ABOUT_TITLE,
  STATS_LABELS,
  TRUST_UPDATED,
} from "../../_lib/trustPages";
import { IconTile } from "../_guide/icons";
import { JsonLd } from "../_guide/parts";
import { breadcrumbs, organization, TrustIntro, TrustProse, TrustRelated } from "../_guide/trust";

/** Korean, English, Chinese (Simplified and Traditional count as one) and Japanese. */
const LANGUAGE_COUNT = 4;

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!isGuideLocale(lang)) return {};
  const title = `${gt(ABOUT_TITLE, lang)} | ${lang === "en" ? "K-SUB" : gt(BRAND, lang)}`;
  const description = fill(gt(ABOUT_DESCRIPTION, lang), { stations: GUIDE_STATIONS.length });
  return {
    title,
    description,
    alternates: guideAlternates("/about", lang),
    openGraph: { type: "website", siteName: gt(BRAND, lang), title, description, locale: OG_LOCALES[lang], url: `/${lang}/about` },
  };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isGuideLocale(lang)) notFound();
  const title = gt(ABOUT_TITLE, lang);
  const description = fill(gt(ABOUT_DESCRIPTION, lang), { stations: GUIDE_STATIONS.length });
  const url = `${SITE_URL}/${lang}/about`;
  const stats: [number, string][] = [
    [GUIDE_STATIONS.length, gt(STATS_LABELS.stations, lang)],
    [ALL_LINES.length, gt(STATS_LABELS.lines, lang)],
    [LANGUAGE_COUNT, gt(STATS_LABELS.languages, lang)],
  ];

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: title,
            description,
            url,
            inLanguage: GUIDE_LANGUAGES[lang].htmlLang,
            dateModified: TRUST_UPDATED,
            mainEntity: organization(CONTACT_EMAIL),
          },
          breadcrumbs(lang, title, url),
        ]}
      />
      <article>
        <TrustIntro locale={lang} title={title} lead={description} />

        <ul className="mt-6 grid grid-cols-3 gap-2 lg:mt-8 lg:gap-4">
          {stats.map(([value, label]) => (
            <li key={label} className="rounded-2xl border border-line bg-surface px-3 py-3 text-center lg:py-5">
              <span className="block text-[24px] font-extrabold leading-none text-honey-strong lg:text-[34px]">{value}</span>
              <span className="mt-1 block text-[12px] font-bold text-ink-muted lg:text-[14px]">{label}</span>
            </li>
          ))}
        </ul>

        <TrustProse section={ABOUT_STORY} locale={lang} />

        <section id="features" aria-labelledby="about-features" className="mt-8 scroll-mt-20 lg:mt-12">
          <h2 id="about-features" className="text-[19px] font-extrabold tracking-tight text-ink lg:text-[24px]">
            {gt(ABOUT_FEATURES_HEADING, lang)}
          </h2>
          <ul className="mt-3 grid gap-3 lg:mt-5 lg:grid-cols-2 lg:gap-4">
            {ABOUT_FEATURES.map((feature) => (
              <li key={feature.icon} className="flex items-start gap-3.5 rounded-2xl border border-line bg-surface p-4 lg:p-5">
                <IconTile name={feature.icon} />
                <span className="min-w-0">
                  <span className="block text-[15px] font-extrabold leading-snug text-ink lg:text-[17px]">{gt(feature.title, lang)}</span>
                  <span className="mt-1 block text-[14px] leading-relaxed text-ink-muted lg:text-[15px]">{gt(feature.body, lang)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {ABOUT_SECTIONS.map((section) => (
          <TrustProse key={section.heading.en} section={section} locale={lang} />
        ))}
      </article>
      <TrustRelated locale={lang} current="about" />
    </>
  );
}
