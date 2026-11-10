import { JsonLd } from "../[lang]/_guide/parts";
import type { FaqItem } from "../_lib/guideCopy";
import { GUIDE_LANGUAGES, type GuideLocale } from "../_lib/guideLocale";

/**
 * FAQPage structured data for a station guide: lockers, elevator exit and restrooms first, then the rest of
 * the page's FAQ. Pass the exact list the page renders; Google treats markup that isn't on the page as spam,
 * and a page should carry only one FAQPage.
 */
export default function StationFaqSchema({ url, lang, faq }: { url: string; lang: GuideLocale; faq: FaqItem[] }) {
  if (!faq.length) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        url,
        inLanguage: GUIDE_LANGUAGES[lang].htmlLang,
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }}
    />
  );
}
