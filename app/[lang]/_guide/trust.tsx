import Link from "next/link";
import { BRAND, fill, gt, tc } from "../../_lib/guideCopy";
import { contentLocale, GUIDE_LANGUAGES, type GuideLocale } from "../../_lib/guideLocale";
import type { Localized } from "../../_lib/i18n";
import { CONTACT_TITLE, PRIVACY_TITLE, TERMS_TITLE } from "../../_lib/legal";
import { APP_RELEASED, PLAY_STORE_URL, SITE_URL } from "../../_lib/site";
import { ABOUT_TITLE, EDITORIAL_TITLE, TRUST_COPY, TRUST_UPDATED, type TrustSection } from "../../_lib/trustPages";
import { Icon } from "./icons";

export function trustUpdated(locale: GuideLocale) {
  const date = new Intl.DateTimeFormat(GUIDE_LANGUAGES[locale].htmlLang, { dateStyle: "long" }).format(
    new Date(`${TRUST_UPDATED}T00:00:00+09:00`),
  );
  return fill(gt(TRUST_COPY.updated, locale), { date });
}

/** The site-wide Organization node (same @id as the home page), pointing at the editorial policy. */
export function organization(email: string | null) {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "K-Sub",
    alternateName: ["K-SUB", "지하철꿀정보"],
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    publishingPrinciples: `${SITE_URL}/en/editorial-policy`,
    ...(email ? { email } : {}),
    ...(APP_RELEASED ? { sameAs: [PLAY_STORE_URL] } : {}),
  };
}

export function breadcrumbs(locale: GuideLocale, title: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tc("breadcrumbHome", locale), item: `${SITE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: title, item: url },
    ],
  };
}

export function TrustIntro({ locale, title, lead }: { locale: GuideLocale; title: string; lead: string }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-[12px] font-semibold text-ink-muted lg:pt-4 lg:text-[14px]">
        <ol className="flex flex-wrap items-center gap-1 lg:gap-1.5">
          <li>
            <Link href={`/${locale}`} className="hover:text-ink">
              {gt(BRAND, locale)}
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li aria-current="page">{title}</li>
        </ol>
      </nav>
      <h1 className="mt-3 break-words text-[26px] font-extrabold leading-tight tracking-tight text-ink lg:mt-6 lg:text-[38px] lg:leading-[1.2]">
        {title}
      </h1>
      <p className="mt-3 text-[16px] leading-relaxed text-ink lg:mt-4 lg:text-[19px] lg:leading-relaxed">{lead}</p>
      <p className="mt-2 text-[12px] font-semibold text-ink-muted lg:text-[13px]">{trustUpdated(locale)}</p>
    </>
  );
}

export function TrustProse({
  section,
  locale,
  values = {},
}: {
  section: TrustSection;
  locale: GuideLocale;
  values?: Record<string, string | number>;
}) {
  return (
    <section className="mt-8 lg:mt-12">
      <h2 className="text-[19px] font-extrabold tracking-tight text-ink lg:text-[24px]">{gt(section.heading, locale)}</h2>
      <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-ink lg:mt-4 lg:space-y-5 lg:text-lg lg:leading-8">
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph.en}>{fill(gt(paragraph, locale), values)}</p>
        ))}
      </div>
    </section>
  );
}

/** The other trust and legal pages, so each one leads to the rest. */
export function TrustRelated({ locale, current }: { locale: GuideLocale; current: "about" | "editorial" }) {
  const app = contentLocale(locale);
  const links: [string, Localized][] = [
    ...(current === "about" ? [] : ([[`/${locale}/about`, ABOUT_TITLE]] as [string, Localized][])),
    ...(current === "editorial" ? [] : ([[`/${locale}/editorial-policy`, EDITORIAL_TITLE]] as [string, Localized][])),
    [`/contact?lang=${app}`, CONTACT_TITLE],
    [`/terms?lang=${app}`, TERMS_TITLE],
    [`/privacy?lang=${app}`, PRIVACY_TITLE],
  ];
  return (
    <nav aria-labelledby="trust-related" className="mt-10 rounded-2xl bg-surface-muted px-4 py-4 lg:mt-14 lg:px-6 lg:py-5">
      <h2 id="trust-related" className="text-[14px] font-extrabold text-ink">
        {gt(TRUST_COPY.related, locale)}
      </h2>
      <ul className="mt-2 flex flex-col gap-1.5 text-[14px] font-bold lg:flex-row lg:flex-wrap lg:gap-x-6">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="inline-flex items-center gap-1 text-honey-strong underline-offset-2 hover:underline">
              {gt(label, locale)}
              <Icon name="arrow" size={14} />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
