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
  roadAddress: string;
  lotAddress: string;
  /** Kakao category path, e.g. "의료,건강 > 병원 > 내과". */
  category: string;
  url: string;
  position: LatLng;
};

export type NearbyQuery =
  | { kind: "category"; code: "PM9" | "CE7" | "CS2" | "HP8"; radius: number }
  | { kind: "keyword"; keyword: string; radius: number };

/** Seoul Metro signage palette (Pantone → hex) plus the commuter/light-rail lines. */
const LINE_COLORS: [RegExp, string][] = [
  [/^1호선/, "#0032a0"],
  [/^2호선/, "#00b140"],
  [/^3호선/, "#fc4c02"],
  [/^4호선/, "#00a9e0"],
  [/^5호선/, "#a05eb5"],
  [/^6호선/, "#a9431e"],
  [/^7호선/, "#67823a"],
  [/^8호선/, "#e31c79"],
  [/^9호선/, "#8c8279"],
  [/신분당/, "#c8102e"],
  [/수인분당|분당/, "#eaab00"],
  [/경의|중앙/, "#6cc5a9"],
  [/공항/, "#0090d2"],
  [/경춘/, "#178c72"],
  [/우이신설/, "#b0ce18"],
  [/신림/, "#6789ca"],
  [/서해/, "#81a914"],
  [/김포/, "#a17e46"],
  [/인천\s*2/, "#f5a251"],
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

export function searchStations(
  query: string,
  near?: { center: LatLng; radius: number },
): Promise<KakaoStation[]> {
  return new Promise((resolve) => {
    const options: kakao.maps.services.PlacesSearchOptions = { category_group_code: "SW8", size: 15 };
    if (near) {
      options.location = new kakao.maps.LatLng(near.center.lat, near.center.lng);
      options.radius = near.radius;
    }
    places().keywordSearch(
      query,
      (result, status) => {
        resolve(status === kakao.maps.services.Status.OK ? groupStations(result) : []);
      },
      options,
    );
  });
}

export function findNearbyStations(position: LatLng): Promise<(KakaoStation & { distance: number })[]> {
  return new Promise((resolve, reject) => {
    places().categorySearch(
      "SW8",
      (result, status) => {
        if (status === kakao.maps.services.Status.ERROR) {
          reject(new Error("Kakao station search failed"));
          return;
        }
        resolve(status === kakao.maps.services.Status.OK ? groupStations(result) : []);
      },
      {
        location: new kakao.maps.LatLng(position.lat, position.lng),
        radius: 5000,
        sort: kakao.maps.services.SortBy.DISTANCE,
        size: 15,
      },
    );
  });
}

export function normalizeLine(line: string) {
  return line.replace(/[\s·]/g, "");
}

export function findLineStations(line: string, center: LatLng): Promise<KakaoStation[]> {
  const target = normalizeLine(line);
  return new Promise((resolve, reject) => {
    places().keywordSearch(
      target,
      (result, status) => {
        if (status === kakao.maps.services.Status.ERROR) {
          reject(new Error("Kakao line search failed"));
          return;
        }
        const items = status === kakao.maps.services.Status.OK ? result : [];
        resolve(
          items.flatMap((item) => {
            const { name, line: found } = splitStationName(item.place_name);
            return normalizeLine(found) === target
              ? [{ name, lines: [found], center: toLatLng(item) }]
              : [];
          }),
        );
      },
      {
        category_group_code: "SW8",
        location: new kakao.maps.LatLng(center.lat, center.lng),
        radius: 8000,
        sort: kakao.maps.services.SortBy.DISTANCE,
        size: 15,
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
            roadAddress: item.road_address_name,
            lotAddress: item.address_name,
            category: item.category_name,
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
