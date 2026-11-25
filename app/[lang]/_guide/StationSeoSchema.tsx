import type { GuideDetail, GuideStation } from "../../_lib/guide";
import { exitName, GUIDE_YEAR, gt, stationTitle, tc } from "../../_lib/guideCopy";
import { GUIDE_LANGUAGES, contentLocale, type GuideLocale } from "../../_lib/guideLocale";
import { SITE_URL, SITE_WEBSITE_ID } from "../../_lib/site";
import { JsonLd } from "./parts";

/** First token of a Korean road address ("서울특별시", "경기도", …) becomes the station's city. */
function cityName(address: string) {
  return address.trim().split(/\s+/)[0] || null;
}

/**
 * TrainStation, amenity list and BreadcrumbList structured data for a station guide; the FAQPage is
 * `StationFaqSchema`. Every value comes from the same station data the page renders, so AI answer engines
 * can read restrooms / lockers / elevator exits straight off the markup.
 */
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
  const inside = detail.toilets.filter((row) => row.gate === "inside").length;
  const outside = detail.toilets.length - inside;
  const lockerSlots = detail.lockers.reduce((sum, row) => sum + (row.slots ?? 0), 0);
  const elevatorExits = [
    ...new Set(detail.elevators.map((row) => exitName(gt(row.exit, lang), contentLocale(lang)))),
  ].slice(0, 3);
  const city = detail.address ? cityName(detail.address) : null;
  const ogQuery = new URLSearchParams({ ...(lang === "en" ? {} : { lang }), v: String(GUIDE_YEAR) });
  const image = `${SITE_URL}/api/og/station/${station.slug}?${ogQuery}`;

  const amenities = [
    detail.toilets.length
      ? {
          "@type": "LocationFeatureSpecification",
          name: tc("toilets", lang),
          value: tc("utilRestroomCount", lang, { inside, outside }),
        }
      : null,
    detail.lockers.length
      ? {
          "@type": "LocationFeatureSpecification",
          name: tc("lockers", lang),
          value: `${tc("utilLockersCount", lang, { n: detail.lockers.length })}${
            lockerSlots ? ` · ${lockerSlots}` : ""
          }`,
        }
      : null,
    elevatorExits.length
      ? {
          "@type": "LocationFeatureSpecification",
          name: tc("utilElevator", lang),
          value: tc("utilElevatorVia", lang, { exit: elevatorExits.join(", ") }),
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <JsonLd
      data={[
        {
          "@context": "https://schema.org",
          "@type": ["TrainStation", "TransitStation"],
          "@id": `${url}#station`,
          name: title,
          alternateName: [station.name.ko, station.name.en, station.name.zh, station.name.ja].filter(
            (name) => name && name !== title,
          ),
          url,
          inLanguage: GUIDE_LANGUAGES[lang].htmlLang,
          isPartOf: { "@id": SITE_WEBSITE_ID },
          image,
          geo: { "@type": "GeoCoordinates", latitude: station.lat, longitude: station.lng },
          ...(city ? { containedInPlace: { "@type": "City", name: city } } : {}),
          ...(detail.address
            ? {
                address: {
                  "@type": "PostalAddress",
                  streetAddress: detail.address,
                  ...(city ? { addressLocality: city } : {}),
                  addressCountry: "KR",
                },
              }
            : {}),
          ...(amenities.length ? { amenityFeature: amenities } : {}),
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "@id": `${url}#breadcrumb`,
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
