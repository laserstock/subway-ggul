import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_LINES, GUIDE_STATIONS, POPULAR_GUIDES } from "../_lib/guide";
import GoogleSeoSchema from "../_components/GoogleSeoSchema";
import { BRAND, COPY, gt, HOME_FAQ_EN, HOME_KEYWORDS, homeMetaTitle, tc } from "../_lib/guideCopy";
import { GUIDE_LANGUAGES, isGuideLocale } from "../_lib/guideLocale";
import { APP_RELEASED, guideAlternates, OG_LOCALES, PLAY_STORE_URL, SITE_URL } from "../_lib/site";
import GuideSearch from "./_guide/GuideSearch";
import { Icon, IconTile } from "./_guide/icons";
import { AppPromo, JsonLd, LineLink, searchItems, StationLink } from "./_guide/parts";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isGuideLocale(lang)) return {};
  const title = homeMetaTitle(lang);
  const description = gt(COPY.homeDescription, lang);
  return {
    title,
    description,
    ...(lang === "en" ? { keywords: HOME_KEYWORDS } : {}),
    alternates: guideAlternates("", lang),
    openGraph: { type: "website", siteName: gt(BRAND, lang), title, description, locale: OG_LOCALES[lang], url: `/${lang}` },
  };
}

const FEATURES = [
  ["exit", "featureExits"],
  ["restroom", "featureToilets"],
  ["luggage", "featureLockers"],
  ["transfer", "featureTransfers"],
  ["clock", "featureLive"],
] as const;

export default async function GuideHome({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isGuideLocale(lang)) notFound();
  const faq = lang === "en" ? HOME_FAQ_EN : [];
  return (
    <>
      <GoogleSeoSchema
        url={`${SITE_URL}/${lang}`}
        inLanguage={GUIDE_LANGUAGES[lang].htmlLang}
        faq={faq}
        publisherId={`${SITE_URL}/#organization`}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: "K-Sub",
          alternateName: [gt(BRAND, lang), "지하철꿀정보"],
          url: SITE_URL,
          logo: `${SITE_URL}/icon.png`,
          ...(APP_RELEASED ? { sameAs: [PLAY_STORE_URL] } : {}),
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

      <nav aria-label={`${tc("navMap", lang)} · ${tc("navGuides", lang)}`} className="mt-5 grid grid-cols-2 gap-2">
        {(
          [
            ["map", "map", "navMap", "mapHeading"],
            ["guides", "book", "navGuides", "guidesLead"],
          ] as const
        ).map(([path, icon, label, hint]) => (
          <Link
            key={path}
            href={`/${lang}/${path}`}
            className="group flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition hover:border-honey/40 hover:shadow-[0_6px_18px_rgba(15,23,42,0.07)] active:scale-[0.98] sm:flex-row sm:items-start"
          >
            <IconTile name={icon} />
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-extrabold leading-snug text-ink">
                {tc(label, lang)}
                <Icon
                  name="arrow"
                  size={14}
                  className="ml-1 inline align-[-2px] text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-honey-strong"
                />
              </span>
              <span className="mt-0.5 block break-words text-[12px] leading-snug text-ink-muted">{tc(hint, lang)}</span>
            </span>
          </Link>
        ))}
      </nav>
      {lang === "en" ? (
        <Link
          href="/en/planner"
          className="group mt-2 flex items-center gap-3 rounded-2xl border border-[#f6e3a8] bg-gradient-to-r from-[#fff8e1] to-surface p-4 transition hover:border-honey/50 active:scale-[0.98]"
        >
          <IconTile name="route" onSurface />
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-extrabold leading-snug text-ink">Seoul Subway Travel Planner</span>
            <span className="mt-0.5 block text-[12px] leading-snug text-ink-muted">
              Two stations and your hours in, a timed tour with lockers, Olive Young, cafés and pop-ups out.
            </span>
          </span>
          <Icon name="arrow" size={16} className="text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-honey-strong" />
        </Link>
      ) : null}

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

      <section className="mt-8" aria-labelledby="lines">
        <h2 id="lines" className="text-[17px] font-extrabold text-ink">
          {tc("browseLines", lang)}
        </h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {ALL_LINES.map((line) => (
            <LineLink key={line} line={line} locale={lang} />
          ))}
        </div>
      </section>

      <section className="mt-8" aria-labelledby="features">
        <h2 id="features" className="text-[17px] font-extrabold text-ink">
          {tc("features", lang)}
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {FEATURES.map(([icon, key]) => (
            <li key={key} className="flex items-center gap-3 rounded-2xl bg-surface-muted px-3 py-2.5">
              <IconTile name={icon} size="sm" onSurface />
              <span className="min-w-0 break-words text-[14px] font-semibold text-ink">{tc(key, lang)}</span>
            </li>
          ))}
        </ul>
      </section>

      {faq.length ? (
        <section className="mt-8" aria-labelledby="faq">
          <h2 id="faq" className="text-[17px] font-extrabold text-ink">
            {tc("faq", lang)}
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            {faq.map((item) => (
              <div key={item.question} className="rounded-2xl border border-line bg-surface px-4 py-3">
                <h3 className="text-[14px] font-bold text-ink">{item.question}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-8">
        <AppPromo locale={lang} />
      </div>
    </>
  );
}
