import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { guideByKo, type GuideStation } from "../../../_lib/guide";
import { ARTICLES_CHECKED, GUIDE_ARTICLES, guideArticle } from "../../../_lib/guideArticles";
import { BRAND, gt, tc } from "../../../_lib/guideCopy";
import { contentLocale, GUIDE_LANGUAGES, isGuideLocale, type GuideLocale } from "../../../_lib/guideLocale";
import {
  formatWon,
  LOCKER_HOURS,
  LOCKER_MAX_DAYS,
  LOCKER_SIZES,
  LUGGAGE_DESKS,
  LUGGAGE_HOURS,
  type LockerSize,
} from "../../../_lib/luggage";
import { guideAlternates, OG_LOCALES, SITE_URL } from "../../../_lib/site";
import { IconTile } from "../../_guide/icons";
import { AppPromo, JsonLd, StationLink } from "../../_guide/parts";

export function generateStaticParams() {
  return GUIDE_ARTICLES.map((article) => ({ slug: article.slug }));
}

async function resolve(params: PageProps<"/[lang]/guides/[slug]">["params"]) {
  const { lang, slug } = await params;
  const article = guideArticle(slug);
  if (!isGuideLocale(lang) || !article) return null;
  return { lang, article };
}

export async function generateMetadata({ params }: PageProps<"/[lang]/guides/[slug]">): Promise<Metadata> {
  const found = await resolve(params);
  if (!found) return {};
  const { lang, article } = found;
  const title = `${gt(article.title, lang)} | ${lang === "en" ? "K-SUB" : gt(BRAND, lang)}`;
  const description = gt(article.description, lang);
  return {
    title,
    description,
    alternates: guideAlternates(`/guides/${article.slug}`, lang),
    openGraph: {
      type: "article",
      siteName: gt(BRAND, lang),
      title,
      description,
      locale: OG_LOCALES[lang],
      url: `/${lang}/guides/${article.slug}`,
      modifiedTime: ARTICLES_CHECKED,
    },
  };
}

function LuggageBlock({ locale }: { locale: GuideLocale }) {
  const app = contentLocale(locale);
  const desks = LUGGAGE_DESKS.map((desk) => ({ desk, station: guideByKo(desk.station) }));
  return (
    <section aria-labelledby="locker-prices" className="mt-8">
      <h2 id="locker-prices" className="text-[18px] font-extrabold tracking-tight text-ink">
        {tc("lockerPrices", locale)}
      </h2>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-surface-muted text-ink-muted">
            <tr>
              <th className="px-3 py-2 font-bold">{tc("lockerSize", locale)}</th>
              <th className="px-3 py-2 font-bold">{tc("weekday", locale)}</th>
              <th className="px-3 py-2 font-bold">{tc("weekend", locale)}</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(LOCKER_SIZES) as LockerSize[]).map((size) => {
              const row = LOCKER_SIZES[size];
              return (
                <tr key={size} className="border-t border-line text-ink">
                  <td className="px-3 py-2 font-bold">
                    {gt(row.label, locale)} <span className="font-normal text-ink-muted">{row.dims}</span>
                  </td>
                  <td className="px-3 py-2">{formatWon(row.base[0], app)}</td>
                  <td className="px-3 py-2">{formatWon(row.base[1], app)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[12px] text-ink-muted">
        {tc("lockerExtra", locale, { open: LOCKER_HOURS.open, close: LOCKER_HOURS.close, days: LOCKER_MAX_DAYS })}{" "}
        {tc("pricesMayChange", locale)}
      </p>

      <h3 className="mt-6 text-[16px] font-extrabold text-ink">
        {tc("deskList", locale, { open: LUGGAGE_HOURS.open, close: LUGGAGE_HOURS.close })}
      </h3>
      <ul className="mt-2 flex flex-col gap-2">
        {desks.map(({ desk, station }) => (
          <li key={desk.station} className="rounded-2xl border border-line bg-surface px-4 py-3 text-[14px]">
            {station ? (
              <Link href={`/${locale}/stations/${station.slug}`} className="font-bold text-ink underline-offset-2 hover:underline">
                {gt(station.name, locale)}
              </Link>
            ) : (
              <span className="font-bold text-ink">{desk.station}</span>
            )}
            <span className="ml-2 text-ink-muted">{gt(desk.where, locale)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function GuideArticlePage({ params }: PageProps<"/[lang]/guides/[slug]">) {
  const found = await resolve(params);
  if (!found) notFound();
  const { lang, article } = found;
  const title = gt(article.title, lang);
  const url = `${SITE_URL}/${lang}/guides/${article.slug}`;
  const checked = new Intl.DateTimeFormat(GUIDE_LANGUAGES[lang].htmlLang, { dateStyle: "long" }).format(
    new Date(`${ARTICLES_CHECKED}T00:00:00+09:00`),
  );
  const stations = article.stations
    .map((ko) => guideByKo(ko))
    .filter((station): station is GuideStation => station !== null);
  const others = GUIDE_ARTICLES.filter((other) => other.slug !== article.slug);

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description: gt(article.description, lang),
            inLanguage: GUIDE_LANGUAGES[lang].htmlLang,
            dateModified: ARTICLES_CHECKED,
            mainEntityOfPage: url,
            author: { "@type": "Organization", name: "K-Sub", url: SITE_URL },
            publisher: { "@type": "Organization", name: "K-Sub", logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` } },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: tc("breadcrumbHome", lang), item: `${SITE_URL}/${lang}` },
              { "@type": "ListItem", position: 2, name: tc("guidesHeading", lang), item: `${SITE_URL}/${lang}/guides` },
              { "@type": "ListItem", position: 3, name: title, item: url },
            ],
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
            <Link href={`/${lang}/guides`}>{tc("guidesHeading", lang)}</Link>
          </li>
        </ol>
      </nav>

      <article className="mt-3">
        <IconTile name={article.icon} size="lg" />
        <h1 className="mt-3 break-words text-[26px] font-extrabold leading-tight tracking-tight text-ink">{title}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{gt(article.description, lang)}</p>

        {article.sections.map((section) => (
          <section key={section.heading.en} className="mt-7">
            <h2 className="text-[18px] font-extrabold tracking-tight text-ink">{gt(section.heading, lang)}</h2>
            <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-ink">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.en}>{gt(paragraph, lang)}</p>
              ))}
            </div>
          </section>
        ))}

        {article.extra === "luggage" ? <LuggageBlock locale={lang} /> : null}
      </article>

      {stations.length ? (
        <section aria-labelledby="guide-stations" className="mt-8">
          <h2 id="guide-stations" className="text-[17px] font-extrabold text-ink">
            {tc("guideStations", lang)}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {stations.map((station) => (
              <StationLink key={station.slug} station={station} locale={lang} />
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="guide-sources" className="mt-8 rounded-2xl bg-surface-muted px-4 py-3">
        <h2 id="guide-sources" className="text-[14px] font-extrabold text-ink">
          {tc("guideSources", lang)}
        </h2>
        <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-semibold">
          {article.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noopener" className="text-honey-strong underline-offset-2 hover:underline">
                {source.label} ↗
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">{tc("guideChecked", lang, { date: checked })}</p>
      </section>

      <section aria-labelledby="more-guides" className="mt-8">
        <h2 id="more-guides" className="text-[17px] font-extrabold text-ink">
          {tc("guidesMore", lang)}
        </h2>
        <ul className="mt-3 flex flex-col gap-2">
          {others.map((other) => (
            <li key={other.slug}>
              <Link
                href={`/${lang}/guides/${other.slug}`}
                className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-3 py-2.5 text-[14px] font-bold text-ink"
              >
                <IconTile name={other.icon} size="sm" />
                <span className="min-w-0 break-words">{gt(other.title, lang)}</span>
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={`/${lang}/map`}
              className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-3 py-2.5 text-[14px] font-bold text-ink"
            >
              <IconTile name="map" size="sm" />
              <span>{tc("navMap", lang)}</span>
            </Link>
          </li>
        </ul>
      </section>

      <div className="mt-8">
        <AppPromo locale={lang} />
      </div>
    </>
  );
}
