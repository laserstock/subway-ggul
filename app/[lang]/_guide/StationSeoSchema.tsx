import type { GuideDetail, GuideStation } from "../../_lib/guide";
import { stationTitle, tc, type FaqItem } from "../../_lib/guideCopy";
import type { GuideLocale } from "../../_lib/guideLocale";
import { SITE_URL } from "../../_lib/site";
import { JsonLd } from "./parts";

/**
 * TrainStation, BreadcrumbList and FAQPage structured data for a station guide. The FAQ must be the same
 * questions and answers the page shows, or Google treats the markup as spam.
 */
export default function StationSeoSchema({
  station,
  detail,
  lang,
  faq,
}: {
  station: GuideStation;
  detail: GuideDetail;
  lang: GuideLocale;
  faq: FaqItem[];
}) {
  const title = stationTitle(station, lang);
  const url = `${SITE_URL}/${lang}/stations/${station.slug}`;
  return (
    <JsonLd
      data={[
        {
          "@context": "https://schema.org",
          "@type": "TrainStation",
          name: title,
          alternateName: [station.name.ko, station.name.en, station.name.zh, station.name.ja].filter(
            (name) => name && name !== title,
          ),
          url,
          geo: { "@type": "GeoCoordinates", latitude: station.lat, longitude: station.lng },
          ...(detail.address
            ? { address: { "@type": "PostalAddress", streetAddress: detail.address, addressCountry: "KR" } }
            : {}),
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: tc("breadcrumbHome", lang), item: `${SITE_URL}/${lang}` },
            { "@type": "ListItem", position: 2, name: tc("breadcrumbStations", lang), item: `${SITE_URL}/${lang}/stations` },
            { "@type": "ListItem", position: 3, name: title, item: url },
          ],
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
