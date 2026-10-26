import { stationFromParams, stationParams, type StationOption } from "../_lib/stations";

type SearchParams = Record<string, string | string[] | undefined>;
type End = "from" | "to";

const FIELDS = { station: "", lat: "Lat", lng: "Lng", lines: "Lines" } as const;

/** `/route` link for a trip; either end may be missing and is then picked on the page. */
export function routeHref(from: StationOption | null, to: StationOption | null) {
  const params = new URLSearchParams();
  for (const [end, station] of [["from", from], ["to", to]] as const) {
    if (!station) continue;
    for (const [field, value] of stationParams(station)) params.set(`${end}${FIELDS[field as keyof typeof FIELDS]}`, value);
  }
  const query = params.toString();
  return query ? `/route?${query}` : "/route";
}

export function routeStation(params: SearchParams, end: End): StationOption | null {
  return stationFromParams(
    Object.fromEntries(Object.entries(FIELDS).map(([field, suffix]) => [field, params[`${end}${suffix}`]])),
  );
}
