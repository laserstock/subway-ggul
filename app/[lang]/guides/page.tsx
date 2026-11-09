import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDE_ARTICLES } from "../../_lib/guideArticles";
import { BRAND, COPY, gt, tc } from "../../_lib/guideCopy";
import { isGuideLocale } from "../../_lib/guideLocale";
import { guideAlternates, OG_LOCALES, SITE_URL } from "../../_lib/site";
import { DesktopWide } from "../_guide/desktop";
import { Icon, IconTile } from "../_guide/icons";
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
    <DesktopWide>
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
      <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-ink lg:text-[40px] lg:leading-[1.15]">
        {tc("guidesHeading", lang)}
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-muted lg:mt-4 lg:max-w-3xl lg:text-lg lg:leading-relaxed">
        {tc("guidesLead", lang)}
      </p>
      <ul className="mt-5 flex flex-col gap-3 lg:mt-10 lg:grid lg:grid-cols-2 lg:gap-5">
        {GUIDE_ARTICLES.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/${lang}/guides/${article.slug}`}
              className="group flex items-start gap-3.5 rounded-2xl border border-line bg-surface p-4 transition hover:-translate-y-1 hover:border-honey/40 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] active:scale-[0.99] lg:h-full lg:gap-5 lg:p-6 lg:duration-200"
            >
              <IconTile name={article.icon} size="lg" />
              <span className="min-w-0">
                <span className="block break-words text-[16px] font-extrabold leading-snug text-ink lg:text-[19px]">
                  {gt(article.title, lang)}
                </span>
                <span className="mt-1 block text-[13px] leading-relaxed text-ink-muted lg:mt-2 lg:text-[15px]">
                  {gt(article.description, lang)}
                </span>
                <span className="mt-2 inline-block text-[13px] font-bold text-honey-strong group-hover:underline group-hover:underline-offset-4 lg:mt-3 lg:text-[14px]">
                  {tc("guideRead", lang)} →
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-[14px] font-bold lg:mt-10 lg:text-[15px]">
        <Link href={`/${lang}/map`} className="inline-flex items-center gap-1.5 text-honey-strong hover:underline hover:underline-offset-4">
          <Icon name="map" size={18} />
          {tc("navMap", lang)} →
        </Link>
      </p>
      <div className="mt-8 lg:mt-14">
        <AppPromo locale={lang} />
      </div>
    </DesktopWide>
  );
}
