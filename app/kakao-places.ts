import type { LatLng } from "./KakaoMap";

export type KakaoStation = {
  name: string;
  lines: string[];
  center: LatLng;
};

export type NearbyPlace = {
  id: string;
  name: string;
  distance: number;
  address: string;
  url: string;
  position: LatLng;
};

export type NearbyQuery =
  | { kind: "category"; code: "PM9" | "CE7" | "CS2"; radius: number }
  | { kind: "keyword"; keyword: string; radius: number };

const LINE_COLORS: [RegExp, string][] = [
  [/^1호선/, "#0052a4"],
  [/^2호선/, "#00a84d"],
  [/^3호선/, "#ef7c1c"],
  [/^4호선/, "#00a5de"],
  [/^5호선/, "#996cac"],
  [/^6호선/, "#cd7c2f"],
  [/^7호선/, "#747f00"],
  [/^8호선/, "#e6186c"],
  [/^9호선/, "#bdb092"],
  [/신분당/, "#d4003b"],
  [/수인분당|분당/, "#f5a200"],
  [/경의|중앙/, "#77c4a3"],
  [/공항/, "#0090d2"],
  [/경춘/, "#0c8e72"],
  [/우이신설/, "#b0ce18"],
  [/신림/, "#6789ca"],
  [/서해/, "#81a914"],
  [/김포/, "#a17e46"],
  [/인천/, "#7ca8d5"],
];

export function lineColor(lines: string[]) {
  for (const line of lines) {
    const match = LINE_COLORS.find(([pattern]) => pattern.test(line));
    if (match) return match[1];
  }
  return "#64748b";
}

function toLatLng(item: kakao.maps.services.PlacesSearchResultItem): LatLng {
  return { lat: Number(item.y), lng: Number(item.x) };
}

function splitStationName(placeName: string) {
  const match = placeName.match(/^(.+?역)\s*(.*)$/);
  if (match) return { name: match[1], line: match[2].trim() };
  const [name, ...rest] = placeName.split(" ");
  return { name, line: rest.join(" ").trim() };
}

function places() {
  return new kakao.maps.services.Places();
}

function groupStations(result: kakao.maps.services.PlacesSearchResult) {
  const grouped = new Map<string, KakaoStation & { distance: number }>();
  for (const item of result) {
    const { name, line } = splitStationName(item.place_name);
    const existing = grouped.get(name);
    if (existing) {
      if (line && !existing.lines.includes(line)) existing.lines.push(line);
    } else {
      grouped.set(name, {
        name,
        lines: line ? [line] : [],
        center: toLatLng(item),
        distance: Number(item.distance) || 0,
      });
    }
  }
  return [...grouped.values()];
}

export function searchStations(query: string): Promise<KakaoStation[]> {
  return new Promise((resolve) => {
    places().keywordSearch(
      query,
      (result, status) => {
        resolve(status === kakao.maps.services.Status.OK ? groupStations(result) : []);
      },
      { category_group_code: "SW8", size: 15 },
    );
  });
}

export function findNearestStation(
  position: LatLng,
): Promise<{ station: KakaoStation; distance: number } | null> {
  return new Promise((resolve, reject) => {
    places().categorySearch(
      "SW8",
      (result, status) => {
        if (status === kakao.maps.services.Status.ERROR) {
          reject(new Error("Kakao station search failed"));
          return;
        }
        const [nearest] = status === kakao.maps.services.Status.OK ? groupStations(result) : [];
        resolve(nearest ? { station: nearest, distance: nearest.distance } : null);
      },
      {
        location: new kakao.maps.LatLng(position.lat, position.lng),
        radius: 5000,
        sort: kakao.maps.services.SortBy.DISTANCE,
        size: 5,
      },
    );
  });
}

export function searchNearby(query: NearbyQuery, center: LatLng): Promise<NearbyPlace[]> {
  return new Promise((resolve, reject) => {
    const callback = (
      result: kakao.maps.services.PlacesSearchResult,
      status: kakao.maps.services.Status,
    ) => {
      if (status === kakao.maps.services.Status.ERROR) {
        reject(new Error("Kakao place search failed"));
        return;
      }
      const items = status === kakao.maps.services.Status.OK ? result : [];
      resolve(
        items
          .filter((item) => query.kind === "category" || item.place_name.includes(query.keyword))
          .map((item) => ({
            id: item.id,
            name: item.place_name,
            distance: Number(item.distance) || 0,
            address: item.road_address_name || item.address_name,
            url: item.place_url,
            position: toLatLng(item),
          })),
      );
    };
    const options: kakao.maps.services.PlacesSearchOptions = {
      location: new kakao.maps.LatLng(center.lat, center.lng),
      radius: query.radius,
      sort: kakao.maps.services.SortBy.DISTANCE,
      size: 10,
    };
    if (query.kind === "category") {
      places().categorySearch(query.code, callback, options);
    } else {
      places().keywordSearch(query.keyword, callback, options);
    }
  });
}
