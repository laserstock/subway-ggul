import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDE_ARTICLES } from "../../_lib/guideArticles";
import { BRAND, COPY, gt, tc } from "../../_lib/guideCopy";
import { isGuideLocale } from "../../_lib/guideLocale";
import { guideAlternates, OG_LOCALES, SITE_URL } from "../../_lib/site";
import { AppPromo, JsonLd } from "../_guide/parts";

export async function generateMetadata({ params }: PageProps<"/[lang]/guides">): Promise<Metadata> {
  const { lang } = await params;
  if (!isGuideLocale(lang)) return {};
  const title = `${gt(COPY.guidesTitle, lang)} | ${lang === "en" ? "K-SUB" : gt(BRAND, lang)}`;
  const description = gt(COPY.guidesDescription, lang);
  return {
    title,
    description,
    alternates: guideAlternates("/guides", lang),
    openGraph: { type: "website", siteName: gt(BRAND, lang), title, description, locale: OG_LOCALES[lang], url: `/${lang}/guides` },
  };
}

export default async function GuidesIndex({ params }: PageProps<"/[lang]/guides">) {
  const { lang } = await params;
  if (!isGuideLocale(lang)) notFound();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: tc("guidesHeading", lang),
          itemListElement: GUIDE_ARTICLES.map((article, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: gt(article.title, lang),
            url: `${SITE_URL}/${lang}/guides/${article.slug}`,
          })),
        }}
      />
      <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-ink">{tc("guidesHeading", lang)}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{tc("guidesLead", lang)}</p>
      <ul className="mt-5 flex flex-col gap-3">
        {GUIDE_ARTICLES.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/${lang}/guides/${article.slug}`}
              className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 transition active:scale-[0.99]"
            >
              <span className="text-[28px] leading-none" aria-hidden>
                {article.emoji}
              </span>
              <span className="min-w-0">
                <span className="block break-words text-[16px] font-extrabold leading-snug text-ink">
                  {gt(article.title, lang)}
                </span>
                <span className="mt-1 block text-[13px] leading-relaxed text-ink-muted">{gt(article.description, lang)}</span>
                <span className="mt-2 inline-block text-[13px] font-bold text-honey-strong">{tc("guideRead", lang)} →</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-[14px] font-bold">
        <Link href={`/${lang}/map`} className="text-honey-strong">
          🗺️ {tc("navMap", lang)} →
        </Link>
      </p>
      <div className="mt-8">
        <AppPromo locale={lang} />
      </div>
    </>
  );
}
