import { JsonLd } from "../[lang]/_guide/parts";
import { SITE_WEBSITE_ID } from "../_lib/site";

type Faq = { question: string; answer: string };

/**
 * Per-page WebPage entity plus an optional FAQPage.
 *
 * The WebSite/Organization entities live once in the root layout (`#website`, `#organization`); this block
 * only declares which page it is and which language that page is written in, so Google and AI answer engines
 * can tell `/ko/…`, `/en/…`, `/ja/…` and `/zh/…` apart instead of clustering them as duplicates.
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
          "@type": "WebPage",
          "@id": url,
          url,
          inLanguage,
          isPartOf: { "@id": SITE_WEBSITE_ID },
          ...(publisherId ? { publisher: { "@id": publisherId } } : {}),
          ...(faq.length ? { mainEntity: { "@id": `${url}#faq` } } : {}),
        },
        ...(faq.length
          ? [
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "@id": `${url}#faq`,
                url,
                inLanguage,
                isPartOf: { "@id": SITE_WEBSITE_ID },
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
