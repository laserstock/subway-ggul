import type { GuideDetail, GuideStation } from "../../_lib/guide";
import { stationTitle, tc } from "../../_lib/guideCopy";
import type { GuideLocale } from "../../_lib/guideLocale";
import { SITE_URL } from "../../_lib/site";
import { JsonLd } from "./parts";

/** TrainStation and BreadcrumbList structured data for a station guide; the FAQPage is `StationFaqSchema`. */
export default function StationSeoSchema({
  station,
  detail,
  lang,
}: {
  station: GuideStation;
  detail: GuideDetail;
  lang: GuideLocale;
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
      ]}
    />
  );
}
