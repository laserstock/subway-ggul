import { JsonLd } from "../[lang]/_guide/parts";
import {
  SITE_BRAND_ALTERNATE_NAMES,
  SITE_BRAND_NAME,
  SITE_URL,
} from "../_lib/site";

type Faq = { question: string; answer: string };

/**
 * Site-wide WebSite identity (brand / navigational queries) plus an optional FAQPage.
 * `url` stays the canonical homepage so “k-sub com” resolves to www.k-sub.com, not ksub.com.
 */
export default function GoogleSeoSchema({
  url,
  inLanguage,
  faq = [],
  publisherId,
}: {
  url: string;
  inLanguage: string;
  faq?: Faq[];
  publisherId?: string;
}) {
  return (
    <JsonLd
      data={[
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_BRAND_NAME,
          alternateName: [...SITE_BRAND_ALTERNATE_NAMES],
          url: `${SITE_URL}/`,
          inLanguage,
          ...(publisherId ? { publisher: { "@id": publisherId } } : {}),
          ...(url !== `${SITE_URL}/` ? { mainEntityOfPage: url } : {}),
        },
        ...(faq.length
          ? [
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: faq.map((item) => ({
                  "@type": "Question",
                  name: item.question,
                  acceptedAnswer: { "@type": "Answer", text: item.answer },
                })),
              },
            ]
          : []),
      ]}
    />
  );
}
