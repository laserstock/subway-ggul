"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import oliveyoungIcon from "@/public/icons/oliveyoung.png";
import daisoIcon from "@/public/icons/daiso.png";
import cafeIcon from "@/public/icons/cafe.png";
import KakaoMap, { type LatLng, type MapFit, type MapOverlay } from "../KakaoMap";
import { useKakaoMaps } from "../kakao-sdk";
import { searchNearby, type NearbyPlace, type NearbyQuery } from "../kakao-places";
import AppHeader from "../_components/AppHeader";
import StationSearch from "../_components/StationSearch";
import { LocateIcon } from "../_components/icons";
import { useLocale } from "../_lib/locale";
import { LOCATION_ISSUE_COPY, useStationTracker } from "../_lib/useStationTracker";
import { AT_STATION_METERS, findStoreJumps, type JumpCandidate } from "../_lib/storeJump";
import { angleBetween, bearingDegrees, lineLabel } from "../_lib/subwayLine";
import {
  STATIONS,
  curatedOption,
  kakaoOption,
  distanceMeters,
  formatDistance,
  t,
  type CategoryId,
  type Locale,
  type Localized,
  type Place,
  type Station,
  type StationOption,
  type Zone,
} from "../_lib/stations";

type ListItem = {
  id: string;
  category: CategoryId;
  zone: Zone;
  name: Localized;
  walk: Localized;
  walkMinutes: number;
  status?: Localized;
  note: Localized;
  position: LatLng;
  distance?: number;
  badge?: number;
  url?: string;
};

const COPY = {
  search: {
    ko: "역 주변이나 동선 상의 시설을 찾아보세요 (예: 홍대입구역)",
    en: "Search nearby or along your route (e.g. Hongik Univ.)",
  },
  smartList: { ko: "스마트 추천 목록", en: "Smart picks" },
  sortHint: { ko: "현재 위치에서 가장 빠른 순", en: "Fastest from here" },
  empty: { ko: "조건에 맞는 장소가 없어요", en: "No matching places" },
  loading: { ko: "주변 장소를 불러오는 중…", en: "Loading nearby places…" },
  loadFailed: {
    ko: "주변 장소를 불러오지 못했어요",
    en: "Couldn't load nearby places",
  },
  gatePending: {
    ko: "이 역은 개찰구 안/밖 정보를 준비 중이에요",
    en: "Fare gate tips for this station are coming soon",
  },
  kakaoLink: { ko: "카카오맵에서 보기", en: "View on Kakao Map" },
  myLocation: { ko: "내 위치로 가장 가까운 역 찾기", en: "Find the station nearest to me" },
  locating: { ko: "현재 위치를 찾는 중…", en: "Finding your location…" },
  nearestStation: { ko: "내 위치에서 가장 가까운 역", en: "Nearest station to you" },
  stopTracking: { ko: "추적 끄기", en: "Stop" },
  inside: { ko: "개찰구 안", en: "Inside fare gate" },
  outside: { ko: "역외", en: "Outside station" },
  unpaid: { ko: "개찰구 밖", en: "Unpaid area" },
  nearby: { ko: "역 주변", en: "Near station" },
  jumpTitle: { ko: "스마트 점핑 안내", en: "Smart station jump" },
  jumpSearching: { ko: "앞뒤 역에서 찾는 중…", en: "Checking nearby stops…" },
  jumpNone: {
    ko: "앞뒤 3정거장 안에도 역 바로 앞 매장이 없어요",
    en: "No store right by a station within 3 stops either",
  },
  jumpGo: { ko: "이 역 매장 보기", en: "Show that station" },
};

const HEADING_MIN_METERS = 100;

const WALK_METERS_PER_MINUTE = 67;
const ALL_PER_CATEGORY = 3;

export type ShopCategoryId = Exclude<CategoryId, "pharmacy">;
export type ShopFilter = "all" | ShopCategoryId;

const ALL_FILTER: Localized = { ko: "전체", en: "All" };

const CATEGORIES: {
  id: ShopCategoryId;
  name: Localized;
  emoji: string;
  icon?: StaticImageData;
  nearby: NearbyQuery;
}[] = [
  {
    id: "oliveyoung",
    name: { ko: "올리브영", en: "Olive Young" },
    emoji: "💄",
    icon: oliveyoungIcon,
    nearby: { kind: "keyword", keyword: "올리브영", radius: 1500 },
  },
  {
    id: "daiso",
    name: { ko: "다이소", en: "Daiso" },
    emoji: "🛍️",
    icon: daisoIcon,
    nearby: { kind: "keyword", keyword: "다이소", radius: 1500 },
  },
  {
    id: "cafe",
    name: { ko: "카페", en: "Cafe" },
    emoji: "☕",
    icon: cafeIcon,
    nearby: { kind: "category", code: "CE7", radius: 500 },
  },
  {
    id: "convenience",
    name: { ko: "편의점", en: "Store" },
    emoji: "🏪",
    nearby: { kind: "category", code: "CS2", radius: 500 },
  },
];

const LAYOUT_ORIGIN = { x: 50, y: 38 };
const LAYOUT_SPAN = { lat: 0.0045, lng: 0.0045 };

function layoutToLatLng(center: LatLng, x: number, y: number): LatLng {
  return {
    lat: center.lat - ((y - LAYOUT_ORIGIN.y) / 100) * LAYOUT_SPAN.lat,
    lng: center.lng + ((x - LAYOUT_ORIGIN.x) / 100) * LAYOUT_SPAN.lng,
  };
}

function curatedItem(station: Station, place: Place): ListItem {
  return {
    id: place.id,
    category: place.category,
    zone: place.zone,
    name: place.name,
    walk: place.walk,
    walkMinutes: place.walkMinutes,
    status: place.status,
    note: place.note,
    position: layoutToLatLng(station.center, place.x, place.y),
    badge: place.badge,
  };
}

function nearbyItem(category: CategoryId, place: NearbyPlace): ListItem {
  const minutes = Math.max(1, Math.round(place.distance / WALK_METERS_PER_MINUTE));
  return {
    id: `kakao-${place.id}`,
    category,
    zone: "nearby",
    name: { ko: place.name, en: place.name },
    walk: {
      ko: `도보 ${minutes}분 · ${place.distance}m`,
      en: `${minutes} min on foot · ${place.distance} m`,
    },
    walkMinutes: minutes,
    note: { ko: place.address, en: place.address },
    position: place.position,
    distance: place.distance,
    url: place.url,
  };
}

function subjectParticle(word: string) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0 ? "이" : "가";
}

function pickJump(
  candidates: JumpCandidate[],
  station: StationOption,
  heading: number | null,
): { candidate: JumpCandidate; ahead: boolean } | null {
  if (candidates.length === 0) return null;
  const isAhead = (candidate: JumpCandidate) =>
    heading !== null && angleBetween(bearingDegrees(station.center, candidate.toward.center), heading) < 90;
  const ordered = [...candidates].sort(
    (a, b) => Number(isAhead(b)) - Number(isAhead(a)) || a.place.distance - b.place.distance,
  );
  return { candidate: ordered[0], ahead: isAhead(ordered[0]) };
}

function jumpMessage(
  categoryName: Localized,
  pick: { candidate: JumpCandidate; ahead: boolean },
  locale: Locale,
) {
  const { candidate, ahead } = pick;
  const minutes = Math.max(1, Math.round(candidate.place.distance / WALK_METERS_PER_MINUTE));
  const line = t(lineLabel(candidate.line), locale);
  if (locale === "ko") {
    const brand = categoryName.ko;
    const where = ahead
      ? `${candidate.stops}정거장 뒤`
      : `${line} ${candidate.toward.name} 방면 ${candidate.stops}정거장`;
    return {
      missing: `현재 역에는 ${brand}${subjectParticle(brand)} 없어요.`,
      suggestion: `${where} [${candidate.stop.name} · ${candidate.place.name} 도보 ${minutes}분] 매장을 추천해요.`,
    };
  }
  const where = ahead
    ? `${candidate.stops} stop${candidate.stops > 1 ? "s" : ""} ahead`
    : `${candidate.stops} stop${candidate.stops > 1 ? "s" : ""} toward ${candidate.toward.name} (${line})`;
  return {
    missing: `No ${categoryName.en} at this station.`,
    suggestion: `Try ${where}: [${candidate.stop.name} · ${candidate.place.name}, ${minutes} min walk].`,
  };
}

function zoneLabel(zone: Zone) {
  if (zone === "inside") return COPY.inside;
  if (zone === "unpaid") return COPY.unpaid;
  if (zone === "nearby") return COPY.nearby;
  return COPY.outside;
}

function MyLocationDot() {
  return (
    <span className="relative flex h-6 w-6 items-center justify-center">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff3b5c]/40" />
      <span className="relative h-4 w-4 rounded-full border-[3px] border-white bg-[#ff3b5c] shadow-md" />
    </span>
  );
}

function CategoryIcon({
  category,
  size,
}: {
  category: CategoryId;
  size: number;
}) {
  const item = CATEGORIES.find((entry) => entry.id === category);
  if (!item?.icon) {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center leading-none"
        style={{ width: size, height: size, fontSize: size * 0.85 }}
        aria-hidden
      >
        {item?.emoji ?? "📍"}
      </span>
    );
  }
  return (
    <Image
      src={item.icon}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-[4px] object-contain"
      style={{ width: size, height: size }}
    />
  );
}

function PlacePin({
  category,
  selected,
}: {
  category: CategoryId;
  selected?: boolean;
}) {
  return (
    <div
      className={`flex h-[32px] w-[32px] items-center justify-center rounded-full border-[3px] bg-white shadow-md ${
        selected ? "scale-110 border-[#1d4ed8]" : "border-[#2f6bff]"
      }`}
    >
      <CategoryIcon category={category} size={20} />
    </div>
  );
}

function NumberBadge({ n }: { n: number }) {
  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[#2f6bff] shadow">
      {n}
    </span>
  );
}

function YellowLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-[6px] bg-[#f1d24f] px-[7px] py-[3px] text-[11px] font-semibold leading-none text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.18)] ${className}`}
    >
      {children}
    </span>
  );
}

function buildOverlays({
  locale,
  station,
  items,
  activeId,
  onSelect,
  myPosition,
}: {
  locale: Locale;
  station: StationOption;
  items: ListItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  myPosition: LatLng | null;
}): MapOverlay[] {
  const me: MapOverlay[] = myPosition
    ? [{ key: "my-location", position: myPosition, zIndex: 6, content: <MyLocationDot /> }]
    : [];
  const curated = station.curated;
  const labels: MapOverlay[] = curated
    ? [
        {
          key: `${curated.id}-paid-area`,
          position: layoutToLatLng(curated.center, 49, 47),
          zIndex: 1,
          content: <YellowLabel>{t(curated.insidePaid, locale)}</YellowLabel>,
        },
        ...curated.exits.map((exit) => ({
          key: `${curated.id}-${exit.id}`,
          position: layoutToLatLng(curated.center, exit.x, exit.y),
          zIndex: 1,
          content: <YellowLabel>{t(exit.label, locale)}</YellowLabel>,
        })),
      ]
    : [];
  return [
    ...labels,
    ...me,
    ...items.map((item) => ({
      key: item.id,
      position: item.position,
      zIndex: item.id === activeId ? 4 : 3,
      content: (
        <button
          type="button"
          onClick={() => onSelect(item.id)}
          aria-label={t(item.name, locale)}
        >
          <span className="relative inline-flex">
            <PlacePin category={item.category} selected={item.id === activeId} />
            {item.badge ? <NumberBadge n={item.badge} /> : null}
          </span>
        </button>
      ),
    })),
  ];
}

export default function ShopsScreen({
  initialStation,
  initialCategory,
  follow,
}: {
  initialStation: StationOption | null;
  initialCategory: ShopCategoryId | null;
  follow: boolean;
}) {
  const locale = useLocale();
  const [category, setCategory] = useState<ShopFilter>(initialCategory ?? "all");
  const [station, setStation] = useState<StationOption>(
    () => initialStation ?? curatedOption(STATIONS[0]),
  );
  const [query, setQuery] = useState(() => (initialStation ? initialStation.name.ko : ""));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nearby, setNearby] = useState<{ key: string; items: ListItem[] | null }>({
    key: "",
    items: [],
  });
  const [fit, setFit] = useState<MapFit | null>(null);
  const [pinned, setPinned] = useState(Boolean(initialStation) && !follow);
  const [heading, setHeading] = useState<number | null>(null);
  const [jump, setJump] = useState<{ key: string; candidates: JumpCandidate[] } | null>(null);
  const lastFixRef = useRef<LatLng | null>(null);
  const kakaoStatus = useKakaoMaps();

  const tracker = useStationTracker({
    autoStart: follow,
    onNearest: ({ station: next, position: here, seq }) => {
      const last = lastFixRef.current;
      lastFixRef.current = here;
      if (last && distanceMeters(last, here) >= HEADING_MIN_METERS) {
        setHeading(bearingDegrees(last, here));
      }
      if (next.key !== station.key) {
        setStation(next);
        setQuery(t(next.name, locale));
        setSelectedId(null);
      }
      setFit({ key: `${next.key}@${seq}`, points: [here, next.center] });
    },
  });
  const tracking = tracker.tracking;
  const myPosition = tracker.position;

  const nearbyKey = `${station.key}:${category}`;
  const { lat: centerLat, lng: centerLng } = station.center;
  useEffect(() => {
    if (kakaoStatus !== "ready") return;
    let alive = true;
    const targets = CATEGORIES.filter((item) => category === "all" || item.id === category);
    const limit = category === "all" ? ALL_PER_CATEGORY : undefined;
    Promise.allSettled(
      targets.map((item) =>
        searchNearby(item.nearby, { lat: centerLat, lng: centerLng }).then((found) =>
          found.slice(0, limit).map((place) => nearbyItem(item.id, place)),
        ),
      ),
    ).then((results) => {
      if (!alive) return;
      const loaded = results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
      if (loaded.length === 0) {
        setNearby({ key: nearbyKey, items: null });
        return;
      }
      const unique = new Map(loaded.flat().map((item) => [item.id, item]));
      setNearby({ key: nearbyKey, items: [...unique.values()] });
    });
    return () => {
      alive = false;
    };
  }, [kakaoStatus, nearbyKey, category, centerLat, centerLng]);

  const nearbyLoaded = nearby.key === nearbyKey;
  const nearbyFailed = kakaoStatus === "error" || (nearbyLoaded && nearby.items === null);
  const nearbyLoading = !nearbyFailed && !nearbyLoaded;
  const curated = station.curated;
  const items = [
    ...(curated
      ? curated.places
          .filter(
            (place) =>
              place.category !== "pharmacy" &&
              (category === "all" || place.category === category) &&
              (nearbyFailed || place.zone !== "outside"),
          )
          .map((place) => curatedItem(curated, place))
      : []),
    ...(nearbyLoaded && nearby.items ? nearby.items : []),
  ].sort((a, b) => a.walkMinutes - b.walkMinutes);

  const activeCategory = CATEGORIES.find((item) => item.id === category) ?? null;
  const needJump =
    activeCategory !== null &&
    nearbyLoaded &&
    nearby.items !== null &&
    !items.some((item) => item.zone !== "nearby" || (item.distance ?? Infinity) <= AT_STATION_METERS);

  useEffect(() => {
    if (!needJump || !activeCategory) return;
    let alive = true;
    findStoreJumps(station, nearbyKey, activeCategory.nearby).then((candidates) => {
      if (alive) setJump({ key: nearbyKey, candidates });
    });
    return () => {
      alive = false;
    };
  }, [needJump, activeCategory, station, nearbyKey]);

  const jumpCandidates = jump?.key === nearbyKey ? jump.candidates : null;
  const jumpPick = jumpCandidates ? pickJump(jumpCandidates, station, tracking ? heading : null) : null;
  const jumpText = jumpPick && activeCategory ? jumpMessage(activeCategory.name, jumpPick, locale) : null;

  const selected = items.find((item) => item.id === selectedId) ?? null;
  const activeId = selected?.id ?? items[0]?.id ?? null;

  const overlays = buildOverlays({
    locale,
    station,
    items,
    activeId,
    onSelect: setSelectedId,
    myPosition,
  });

  const nearestReady = tracking && myPosition !== null && tracker.nearest?.key === station.key;
  let locationMessage: string | null = null;
  if (tracker.issue) {
    locationMessage = t(LOCATION_ISSUE_COPY[tracker.issue], locale);
  } else if (nearestReady && myPosition) {
    locationMessage = `${t(COPY.nearestStation, locale)} · ${t(station.name, locale)} · ${formatDistance(
      distanceMeters(myPosition, station.center),
    )}`;
  } else if (tracking) {
    locationMessage = t(COPY.locating, locale);
  }

  function startTracking() {
    setPinned(false);
    tracker.start();
  }

  function selectStation(next: StationOption) {
    setPinned(true);
    if (tracking) tracker.stop();
    else tracker.dismissIssue();
    setStation(next);
    setQuery(t(next.name, locale));
    setSelectedId(null);
  }

  function selectCategory(next: ShopFilter) {
    setCategory(next);
    setSelectedId(null);
    if (!tracking && !pinned && tracker.issue !== "denied") startTracking();
  }

  function onLocaleChange(next: Locale, previous: Locale) {
    if (query === t(station.name, previous)) setQuery(t(station.name, next));
  }

  return (
    <div className="flex min-h-dvh justify-center bg-[#e8eaed]">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-white shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <AppHeader backHref="/" onLocaleChange={onLocaleChange} />

        <StationSearch
          className="mx-4"
          locale={locale}
          query={query}
          onQueryChange={setQuery}
          onSelect={selectStation}
          currentKey={station.key}
          placeholder={t(COPY.search, locale)}
        />

        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4 pb-3">
          {[{ id: "all" as const, name: ALL_FILTER }, ...CATEGORIES].map((item) => {
            const selected = item.id === category;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectCategory(item.id)}
                aria-pressed={selected}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border bg-white px-3.5 py-[7px] text-[13px] font-medium ${
                  selected
                    ? "border-[#3b82f6] text-neutral-900 shadow-[0_0_0_1px_#3b82f6]"
                    : "border-neutral-200 text-neutral-700"
                }`}
              >
                {t(item.name, locale)}
                {item.id === "all" ? null : <CategoryIcon category={item.id} size={18} />}
              </button>
            );
          })}
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#eef1f3]">
          <div className="relative isolate min-h-0 flex-1">
            <KakaoMap
              center={station.center}
              focus={selected?.position}
              fit={fit}
              overlays={overlays}
            />
            <button
              type="button"
              onClick={startTracking}
              aria-label={t(COPY.myLocation, locale)}
              aria-pressed={tracking}
              className={`absolute bottom-3 right-3 z-20 flex h-11 w-11 items-center justify-center rounded-full border bg-white shadow-[0_2px_10px_rgba(15,23,42,0.18)] ${
                tracking ? "border-[#2563eb] text-[#2563eb]" : "border-white text-neutral-600"
              } ${tracking && !nearestReady ? "animate-pulse" : ""}`}
            >
              <LocateIcon />
            </button>
          </div>

          <section className="relative z-40 shrink-0 rounded-t-[22px] bg-white px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_28px_rgba(15,23,42,0.08)]">
            <div className="mb-3 flex justify-center">
              <span className="h-[4px] w-10 rounded-full bg-neutral-300" />
            </div>
            {locationMessage ? (
              <div
                className={`mb-3 flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-[12px] ${
                  tracker.issue ? "bg-amber-50 text-amber-800" : "bg-[#eef4ff] text-[#1d4ed8]"
                }`}
                role="status"
              >
                <p className="min-w-0 font-medium">{locationMessage}</p>
                {tracking ? (
                  <button
                    type="button"
                    onClick={tracker.stop}
                    className="shrink-0 font-semibold text-neutral-500"
                  >
                    {t(COPY.stopTracking, locale)}
                  </button>
                ) : null}
              </div>
            ) : null}
            {needJump && activeCategory ? (
              <div className="mb-3 rounded-xl border border-[#fde3b0] bg-[#fff8e8] px-3 py-2.5 text-[12px] text-[#92400e]">
                <p className="font-extrabold">
                  <span aria-hidden>🦘 </span>
                  {t(COPY.jumpTitle, locale)}
                </p>
                {jumpText && jumpPick ? (
                  <>
                    <p className="mt-1 leading-snug">{jumpText.missing}</p>
                    <p className="mt-0.5 font-bold leading-snug">{jumpText.suggestion}</p>
                    <button
                      type="button"
                      onClick={() => selectStation(kakaoOption(jumpPick.candidate.stop))}
                      className="mt-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#b45309] shadow-sm"
                    >
                      {jumpPick.candidate.stop.name} · {t(COPY.jumpGo, locale)} →
                    </button>
                  </>
                ) : (
                  <p className="mt-1">
                    {t(jumpCandidates ? COPY.jumpNone : COPY.jumpSearching, locale)}
                  </p>
                )}
              </div>
            ) : null}
            <div className="mb-3 flex items-end justify-between gap-3">
              <h2 className="text-[18px] font-bold text-neutral-900">
                {t(COPY.smartList, locale)}
              </h2>
              <p className="shrink-0 text-[12px] text-neutral-400">
                {t(COPY.sortHint, locale)}
              </p>
            </div>
            {curated ? null : (
              <p className="-mt-1.5 mb-2.5 text-[12px] text-neutral-400">
                {t(COPY.gatePending, locale)}
              </p>
            )}
            <div className="flex max-h-[188px] flex-col gap-2.5 overflow-y-auto pb-1">
              {items.length === 0 ? (
                <p className="rounded-2xl border border-neutral-100 px-4 py-8 text-center text-sm text-neutral-400">
                  {t(
                    nearbyLoading
                      ? COPY.loading
                      : nearbyFailed && !curated
                        ? COPY.loadFailed
                        : COPY.empty,
                    locale,
                  )}
                </p>
              ) : (
                items.map((item) => {
                  const active = item.id === activeId;
                  return (
                    <div
                      key={item.id}
                      className={`rounded-[18px] border bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${
                        active ? "border-neutral-200" : "border-neutral-100"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className="block w-full text-left"
                      >
                        <p className="flex items-start gap-2 text-[15px] font-bold leading-snug text-neutral-900">
                          <span className="mt-[2px]">
                            <CategoryIcon category={item.category} size={18} />
                          </span>
                          {t(item.name, locale)}
                        </p>
                        <p className="mt-1.5 text-[13px] text-neutral-500">
                          {t(item.walk, locale)}
                          {item.status ? (
                            <>
                              <span className="mx-1.5 text-neutral-300">|</span>
                              {t(item.status, locale)}
                            </>
                          ) : null}
                        </p>
                        <p className="mt-1 text-[13px] text-neutral-400">
                          {t(item.note, locale)}
                        </p>
                      </button>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="inline-flex rounded-full bg-neutral-100 px-2 py-[3px] text-[11px] font-medium text-neutral-500">
                          {t(zoneLabel(item.zone), locale)}
                        </span>
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[12px] font-medium text-[#2563eb]"
                          >
                            {t(COPY.kakaoLink, locale)} ›
                          </a>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
