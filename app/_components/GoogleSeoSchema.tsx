import { JsonLd } from "../[lang]/_guide/parts";

type Faq = { question: string; answer: string };

/** WebSite data (Google's site name comes from the home page) plus an optional FAQPage. */
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
          name: "K-Sub",
          alternateName: ["K-SUB Seoul Subway Guide", "지하철꿀정보", "k-sub.com"],
          url,
          inLanguage,
          ...(publisherId ? { publisher: { "@id": publisherId } } : {}),
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
