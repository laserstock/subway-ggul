"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import cafeIcon from "@/public/icons/cafe.png";
import convenienceIcon from "@/public/icons/convenience.svg";
import daisoIcon from "@/public/icons/daiso.png";
import oliveyoungIcon from "@/public/icons/oliveyoung.png";
import pharmacyIcon from "@/public/icons/pharmacy.png";
import starbucksIcon from "@/public/icons/starbucks.png";
import type { LatLng } from "../KakaoMap";
import { searchNearby, type NearbyPlace, type NearbyQuery } from "../kakao-places";
import { loadKakaoMaps } from "../kakao-sdk";
import { ExitIcon, PinIcon } from "../_components/icons";
import PlaceInfoSheet from "../_components/PlaceInfoSheet";
import { DEPARTMENT_QUERY, departmentLogo, uniqueDepartmentStores } from "../_lib/departmentStores";
import {
  loadExits,
  mapPoint,
  nearestExit,
  walkMinutes,
  walkUrl,
  type MapPoint,
  type StationExit,
} from "../_lib/exits";
import { HUB_TAGS, hubForExit, hubGuide, type HubRoute } from "../_lib/hubGuides";
import { t, type Locale, type Localized, type StationOption } from "../_lib/stations";

type ShopKind = {
  id: string;
  icon: StaticImageData;
  /** Brand logo per place, e.g. Lotte vs Shinsegae for department stores. */
  iconFor?: (place: NearbyPlace) => StaticImageData;
  label: Localized;
  query: NearbyQuery;
  /** Drops places another row already covers, e.g. Starbucks from the generic cafe row. */
  skip?: RegExp;
  refine?: (places: NearbyPlace[]) => NearbyPlace[];
  /** Rare kinds are left out instead of showing "none nearby". */
  hideEmpty?: boolean;
};

const DEPARTMENT_LABEL: Localized = { ko: "백화점", en: "Department store", zh: "百货商店", ja: "百貨店" };

const SHOP_KINDS: ShopKind[] = [
  {
    id: "department",
    icon: departmentLogo(""),
    iconFor: (place) => departmentLogo(place.name),
    label: DEPARTMENT_LABEL,
    query: { ...DEPARTMENT_QUERY, radius: 600 },
    refine: uniqueDepartmentStores,
    hideEmpty: true,
  },
  {
    id: "pharmacy",
    icon: pharmacyIcon,
    label: { ko: "약국", en: "Pharmacy", zh: "药店", ja: "薬局" },
    query: { kind: "category", code: "PM9", radius: 500 },
  },
  {
    id: "cafe",
    icon: cafeIcon,
    label: { ko: "카페", en: "Cafe", zh: "咖啡店", ja: "カフェ" },
    query: { kind: "category", code: "CE7", radius: 300 },
    skip: /^스타벅스/,
  },
  {
    id: "starbucks",
    icon: starbucksIcon,
    label: { ko: "스타벅스", en: "Starbucks", zh: "星巴克", ja: "スターバックス" },
    query: { kind: "keyword", keyword: "스타벅스", radius: 700, category: "CE7", brand: true },
  },
  {
    id: "oliveyoung",
    icon: oliveyoungIcon,
    label: { ko: "올리브영", en: "Olive Young", zh: "Olive Young", ja: "オリーブヤング" },
    query: { kind: "keyword", keyword: "올리브영", radius: 700, brand: true },
  },
  {
    id: "daiso",
    icon: daisoIcon,
    label: { ko: "다이소", en: "Daiso", zh: "大创", ja: "ダイソー" },
    query: { kind: "keyword", keyword: "다이소", radius: 700, brand: true },
  },
  {
    id: "store",
    icon: convenienceIcon,
    label: { ko: "편의점", en: "Convenience store", zh: "便利店", ja: "コンビニ" },
    query: { kind: "category", code: "CS2", radius: 300 },
  },
];

const COPY = {
  title: { ko: "출구·길찾기", en: "Exits & directions", zh: "出口 · 导航", ja: "出口 · 道案内" },
  pick: {
    ko: "출구 번호를 누르면 주변 가게를 보여 드려요",
    en: "Tap an exit to see what's nearby",
    zh: "点击出口编号查看周边店铺",
    ja: "出口番号をタップすると周辺のお店を表示します",
  },
  exit: { ko: "{n}번", en: "Exit {n}", zh: "{n}号", ja: "{n}番" },
  around: { ko: "{n}번 출구 주변", en: "Around Exit {n}", zh: "{n}号出口周边", ja: "{n}番出口周辺" },
  aroundStation: { ko: "역 주변", en: "Around the station", zh: "车站周边", ja: "駅周辺" },
  noExits: {
    ko: "아직 출구 번호 정보가 없는 역이에요. 역 주변 가게를 보여 드릴게요",
    en: "No exit numbers for this station yet, so here's what's around it",
    zh: "暂无该站出口信息，为您显示车站周边店铺",
    ja: "この駅の出口情報はまだありません。駅周辺のお店を表示します",
  },
  walk: { ko: "도보 약 {n}분", en: "~{n} min walk", zh: "步行约{n}分钟", ja: "徒歩約{n}分" },
  route: { ko: "길찾기", en: "Directions", zh: "导航", ja: "ルート" },
  more: { ko: "외 {n}곳", en: "+{n} more", zh: "等{n}家", ja: "他{n}件" },
  none: { ko: "가까운 곳에 없어요", en: "None nearby", zh: "附近没有", ja: "近くにありません" },
  failed: {
    ko: "주변 가게를 불러오지 못했어요. 카카오맵에서 확인해 주세요",
    en: "Couldn't load nearby shops. Please check Kakao Map",
    zh: "无法加载周边店铺，请在Kakao地图中查看",
    ja: "周辺のお店を読み込めませんでした。カカオマップで確認してください",
  },
  kakaoExit: {
    ko: "카카오맵에서 {n}번 출구 보기",
    en: "Open Exit {n} in Kakao Map",
    zh: "在Kakao地图查看{n}号出口",
    ja: "カカオマップで{n}番出口を見る",
  },
  kakaoStation: { ko: "카카오맵에서 보기", en: "Open in Kakao Map", zh: "在Kakao地图查看", ja: "カカオマップで見る" },
  credit: {
    ko: "출구 위치 © OpenStreetMap",
    en: "Exit locations © OpenStreetMap",
    zh: "出口位置 © OpenStreetMap",
    ja: "出口位置 © OpenStreetMap",
  },
  hubTitle: {
    ko: "✈️ 공항 & 주요 거점 3초 연결",
    en: "✈️ Airport & hotspot quick exits",
    zh: "✈️ 机场 & 热门地点 3秒直达",
    ja: "✈️ 空港 & 主要スポット 3秒案内",
  },
  hubHint: {
    ko: "출구 칩을 누르면 그 출구 정보를 바로 보여 드려요",
    en: "Tap an exit chip to jump to that exit",
    zh: "点击出口标签即可查看该出口信息",
    ja: "出口チップをタップするとその出口の情報を表示します",
  },
  hubNote: {
    ko: "베타 안내예요 · 역 안 표지판을 함께 확인해 주세요",
    en: "Beta guide · Please also follow the signs in the station",
    zh: "测试版指南 · 请同时留意站内指示牌",
    ja: "ベータ版の案内です · 駅構内の案内表示もご確認ください",
  },
  hubExit: { ko: "{n}번 출구", en: "Exit {n}", zh: "{n}号出口", ja: "{n}番出口" },
  deptTitle: { ko: "백화점 · 가까운 출구", en: "Department stores · nearest exit", zh: "百货商店 · 最近出口", ja: "百貨店 · 最寄り出口" },
  deptSource: { ko: "카카오맵 기준", en: "via Kakao Map", zh: "基于Kakao地图", ja: "カカオマップ基準" },
  deptFromExit: { ko: "{n}번 출구에서", en: "from Exit {n}", zh: "从{n}号出口", ja: "{n}番出口から" },
} satisfies Record<string, Localized>;

function HubCard({
  routes,
  exitLabels,
  activeExit,
  locale,
  onPickExit,
}: {
  routes: HubRoute[];
  /** Exits this station actually has; null while they load. */
  exitLabels: string[] | null;
  activeExit: string | null;
  locale: Locale;
  onPickExit: (exit: string) => void;
}) {
  return (
    <div className="mt-2 overflow-hidden rounded-2xl bg-gradient-to-br from-[#eef4ff] to-[#f5f0ff] ring-1 ring-[#d6e2ff]">
      <div className="px-3.5 pb-1 pt-3">
        <p className="text-[14px] font-extrabold tracking-tight text-[#1e3a8a]">{t(COPY.hubTitle, locale)}</p>
        <p className="mt-0.5 text-[11px] font-semibold text-[#4b5d8f]">{t(COPY.hubHint, locale)}</p>
      </div>
      <ul className="flex flex-col gap-1.5 px-2.5 pb-2.5 pt-1.5">
        {routes.map((route) => (
          <li key={route.to.ko} className="flex items-center gap-2.5 rounded-xl bg-white/85 px-2.5 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eef4ff] text-[19px]" aria-hidden>
              {route.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-extrabold leading-snug text-neutral-900">{t(route.to, locale)}</span>
              {route.via ? (
                <span className="mt-0.5 block text-[11px] font-semibold leading-snug text-neutral-500">{t(route.via, locale)}</span>
              ) : null}
            </span>
            {route.exits.length > 0 ? (
              <span className="flex shrink-0 items-center gap-1">
                <span className="text-[12px] font-black text-[#2563eb]" aria-hidden>
                  ➔
                </span>
                {route.exits.map((exit) => {
                  const known = exitLabels === null || exitLabels.includes(exit);
                  const active = exit === activeExit;
                  return (
                    <button
                      key={exit}
                      type="button"
                      disabled={!known}
                      onClick={() => onPickExit(exit)}
                      aria-pressed={active}
                      className={`rounded-lg px-2 py-1.5 text-[12px] font-black tabular-nums transition active:scale-95 disabled:opacity-40 ${
                        active
                          ? "bg-[#f5b800] text-neutral-900 shadow-[0_2px_6px_rgba(245,184,0,0.4)]"
                          : "bg-[#2563eb] text-white"
                      }`}
                    >
                      {fill(COPY.hubExit, locale, exit)}
                    </button>
                  );
                })}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="px-3.5 pb-2.5 text-[10px] font-semibold text-[#6b7aa6]">{t(COPY.hubNote, locale)}</p>
    </div>
  );
}

function fill(template: Localized, locale: Locale, n: string | number) {
  return t(template, locale).replace("{n}", String(n));
}

type ShopRow = { kind: ShopKind; places: NearbyPlace[] };

/** One row per kind, nearest first; null when Kakao couldn't be reached at all. */
async function loadShops(center: LatLng): Promise<ShopRow[] | null> {
  await loadKakaoMaps();
  const results = await Promise.allSettled(SHOP_KINDS.map((kind) => searchNearby(kind.query, center)));
  if (results.every((result) => result.status === "rejected")) return null;
  return SHOP_KINDS.flatMap((kind, index) => {
    const result = results[index];
    let places = result.status === "fulfilled" ? result.value : [];
    if (kind.skip) places = places.filter((place) => !kind.skip?.test(place.name));
    if (kind.refine) places = kind.refine(places);
    return kind.hideEmpty && places.length === 0 ? [] : [{ kind, places }];
  });
}

type DepartmentStop = { place: NearbyPlace; exit: StationExit | null; meters: number };

/** Department stores around the station, each with the exit closest to it. */
async function loadDepartments(station: StationOption, exits: StationExit[]): Promise<DepartmentStop[]> {
  await loadKakaoMaps();
  const places = uniqueDepartmentStores(await searchNearby(DEPARTMENT_QUERY, station.center));
  return places.map((place) => {
    const near = nearestExit(exits, place.position);
    return near ? { place, exit: near.exit, meters: near.meters } : { place, exit: null, meters: place.distance };
  });
}

function DepartmentCard({
  stops,
  station,
  activeExit,
  locale,
  onPickExit,
  onOpen,
}: {
  stops: DepartmentStop[];
  station: StationOption;
  activeExit: string | null;
  locale: Locale;
  onPickExit: (exit: string) => void;
  onOpen: (stop: DepartmentStop) => void;
}) {
  return (
    <div className="mt-2 overflow-hidden rounded-2xl bg-surface ring-1 ring-line">
      <div className="flex items-center justify-between gap-2 px-3.5 pb-1 pt-3">
        <p className="text-[14px] font-extrabold tracking-tight text-neutral-900">{t(COPY.deptTitle, locale)}</p>
        <span className="text-[10.5px] font-semibold text-neutral-400">{t(COPY.deptSource, locale)}</span>
      </div>
      <ul className="flex flex-col gap-1.5 px-2.5 pb-2.5 pt-1.5">
        {stops.map(({ place, exit, meters }) => {
          const active = exit !== null && exit.label === activeExit;
          return (
            <li key={place.id} className="flex items-center gap-2.5 rounded-xl bg-surface-muted/70 px-2.5 py-2">
              <button
                type="button"
                onClick={() => onOpen({ place, exit, meters })}
                className="flex min-w-0 flex-1 items-center gap-2.5 text-left active:opacity-70"
              >
                <Image
                  src={departmentLogo(place.name)}
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 shrink-0 rounded-[10px] object-contain"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-extrabold text-neutral-900">{place.name}</span>
                  <span className="mt-0.5 block text-[11.5px] font-semibold text-neutral-500">
                    {fill(COPY.walk, locale, walkMinutes(meters))}
                    {exit ? ` · ${fill(COPY.deptFromExit, locale, exit.label)}` : ""}
                  </span>
                </span>
              </button>
              {exit ? (
                <button
                  type="button"
                  onClick={() => onPickExit(exit.label)}
                  aria-pressed={active}
                  className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[12px] font-black tabular-nums transition active:scale-95 ${
                    active
                      ? "bg-[#f5b800] text-neutral-900 shadow-[0_2px_6px_rgba(245,184,0,0.4)]"
                      : "bg-neutral-900 text-white"
                  }`}
                >
                  {fill(COPY.hubExit, locale, exit.label)}
                </button>
              ) : (
                <a
                  href={walkUrl({ name: station.name.ko, position: station.center }, place)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-lg bg-[#eef4ff] px-2 py-1.5 text-[11px] font-extrabold text-[#2563eb]"
                >
                  {t(COPY.route, locale)}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ShopRowItem({
  row,
  from,
  locale,
  onOpen,
}: {
  row: ShopRow;
  from: MapPoint;
  locale: Locale;
  onOpen: () => void;
}) {
  const [nearest, ...rest] = row.places;
  const body = (
    <>
      <Image
        src={nearest && row.kind.iconFor ? row.kind.iconFor(nearest) : row.kind.icon}
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-xl object-contain"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-[11.5px] font-bold text-neutral-500">{t(row.kind.label, locale)}</span>
        {nearest ? (
          <span className="block truncate text-[14px] font-extrabold text-neutral-900">{nearest.name}</span>
        ) : (
          <span className="block text-[13px] font-semibold text-neutral-400">{t(COPY.none, locale)}</span>
        )}
      </span>
      {nearest ? (
        <span className="shrink-0 text-right">
          <span className="block text-[12.5px] font-extrabold text-[#2563eb]">
            {fill(COPY.walk, locale, walkMinutes(nearest.distance))}
          </span>
          <span className="block text-[11px] font-semibold text-neutral-400">
            {nearest.distance}m{rest.length > 0 ? ` · ${fill(COPY.more, locale, rest.length)}` : ""}
          </span>
        </span>
      ) : null}
    </>
  );

  if (!nearest) {
    return (
      <li>
        <div className="flex items-center gap-3 px-3 py-2.5">{body}</div>
      </li>
    );
  }
  return (
    <li className="flex items-center gap-2 pr-3">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 py-2.5 pl-3 text-left transition active:bg-surface-muted"
      >
        {body}
      </button>
      <a
        href={walkUrl(from, nearest)}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-lg bg-[#eef4ff] px-2 py-1.5 text-[11px] font-extrabold text-[#2563eb] active:scale-95"
      >
        {t(COPY.route, locale)}
      </a>
    </li>
  );
}

type OpenShop = {
  places: NearbyPlace[];
  id: string;
  kind: Localized;
  icon: (place: NearbyPlace) => StaticImageData;
  origin: MapPoint;
  originLabel: string;
};

export default function ExitGuide({ station, locale }: { station: StationOption; locale: Locale }) {
  const [exits, setExits] = useState<{ key: string; list: StationExit[] } | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  /** Shop rows per exit label ("" for the station centre); null when the lookup failed. */
  const [shops, setShops] = useState<Record<string, ShopRow[] | null>>({});
  const [departments, setDepartments] = useState<{ key: string; stops: DepartmentStop[] } | null>(null);
  const [openShop, setOpenShop] = useState<OpenShop | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hub = hubGuide(station.name.ko);

  useEffect(() => {
    let alive = true;
    loadExits(station)
      .catch(() => [])
      .then((list) => {
        if (!alive) return;
        setExits({ key: station.key, list });
        setPicked(null);
        setShops({});
      });
    return () => {
      alive = false;
    };
  }, [station]);

  const exitList = exits?.key === station.key ? exits.list : null;

  useEffect(() => {
    if (!exitList) return;
    let alive = true;
    loadDepartments(station, exitList)
      .catch(() => [])
      .then((stops) => {
        if (alive) setDepartments({ key: station.key, stops });
      });
    return () => {
      alive = false;
    };
  }, [station, exitList]);

  const departmentStops = departments?.key === station.key ? departments.stops : [];
  const departmentByExit = new Map<string, NearbyPlace>();
  for (const stop of departmentStops) {
    if (stop.exit && !departmentByExit.has(stop.exit.label)) departmentByExit.set(stop.exit.label, stop.place);
  }
  const selected = exitList ? (exitList.find((exit) => exit.label === picked) ?? exitList[0] ?? null) : null;
  const shopKey = selected?.label ?? "";
  const center = selected?.position ?? station.center;

  useEffect(() => {
    if (!exitList || shopKey in shops) return;
    let alive = true;
    loadShops(center)
      .catch(() => null)
      .then((rows) => {
        if (alive) setShops((previous) => ({ ...previous, [shopKey]: rows }));
      });
    return () => {
      alive = false;
    };
  }, [exitList, shopKey, center, shops]);

  const rows = shopKey in shops ? shops[shopKey] : undefined;
  const mapName = selected ? `${station.name.ko} ${selected.label}번 출구` : station.name.ko;
  const kakaoUrl = `https://map.kakao.com/link/map/${mapPoint({ name: mapName, position: center })}`;
  const highlight = hubForExit(hub, selected?.label ?? null);

  function pickHubExit(exit: string) {
    setPicked(exit);
    requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  }

  function openRow(row: ShopRow) {
    const nearest = row.places[0];
    if (!nearest) return;
    const { iconFor, icon } = row.kind;
    setOpenShop({
      places: row.places,
      id: nearest.id,
      kind: row.kind.label,
      icon: iconFor ?? (() => icon),
      origin: { name: mapName, position: center },
      originLabel: selected ? fill(COPY.hubExit, locale, selected.label) : t(station.name, locale),
    });
  }

  function openDepartment({ place, exit }: DepartmentStop) {
    setOpenShop({
      places: [place],
      id: place.id,
      kind: DEPARTMENT_LABEL,
      icon: (found) => departmentLogo(found.name),
      origin: exit
        ? { name: `${station.name.ko} ${exit.label}번 출구`, position: exit.position }
        : { name: station.name.ko, position: station.center },
      originLabel: exit ? fill(COPY.hubExit, locale, exit.label) : t(station.name, locale),
    });
  }

  return (
    <section id="exit-guide" className="mt-5 scroll-mt-3">
      <h2 className="flex items-center gap-1.5 text-[16px] font-extrabold tracking-tight text-neutral-900">
        <span className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-[#16a34a] text-white">
          <ExitIcon size={15} />
        </span>
        {t(COPY.title, locale)}
      </h2>

      {hub ? (
        <HubCard
          routes={hub}
          exitLabels={exitList ? exitList.map((exit) => exit.label) : null}
          activeExit={picked !== null ? (selected?.label ?? null) : null}
          locale={locale}
          onPickExit={pickHubExit}
        />
      ) : null}

      {departmentStops.length > 0 ? (
        <DepartmentCard
          stops={departmentStops}
          station={station}
          activeExit={picked !== null ? (selected?.label ?? null) : null}
          locale={locale}
          onPickExit={pickHubExit}
          onOpen={openDepartment}
        />
      ) : null}

      {exitList === null ? (
        <div className="mt-2 flex gap-1.5" aria-busy>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <span key={index} className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-surface-muted" />
          ))}
        </div>
      ) : exitList.length === 0 ? (
        <p className="mt-1 text-[12px] font-semibold text-neutral-500">{t(COPY.noExits, locale)}</p>
      ) : (
        <>
          <p className="mt-0.5 text-[12px] font-semibold text-neutral-500">{t(COPY.pick, locale)}</p>
          <div className="no-scrollbar -mx-4 mt-1 flex gap-1.5 overflow-x-auto px-4 pb-1 pt-1.5" role="group">
            {exitList.map((exit) => {
              const active = exit.label === selected?.label;
              const hubTag = hubForExit(hub, exit.label).tags[0];
              const department = departmentByExit.get(exit.label);
              return (
                <button
                  key={exit.label}
                  type="button"
                  onClick={() => setPicked(exit.label)}
                  aria-pressed={active}
                  aria-label={fill(COPY.exit, locale, exit.label)}
                  className={`relative flex h-10 min-w-10 shrink-0 items-center justify-center rounded-xl px-2 text-[15px] font-black tabular-nums transition active:scale-95 ${
                    active
                      ? "bg-[#f5b800] text-neutral-900 shadow-[0_2px_6px_rgba(245,184,0,0.4)]"
                      : "bg-surface-muted text-neutral-600 ring-1 ring-line"
                  }`}
                >
                  {exit.label}
                  {hubTag ? (
                    <span className="absolute -right-1 -top-1 text-[11px] leading-none" aria-hidden>
                      {HUB_TAGS[hubTag].emoji}
                    </span>
                  ) : department ? (
                    <Image
                      src={departmentLogo(department.name)}
                      alt=""
                      width={16}
                      height={16}
                      className="absolute -right-1 -top-1 h-4 w-4 rounded-[4px] shadow-[0_1px_2px_rgba(15,23,42,0.25)]"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </>
      )}

      {exitList ? (
        <div ref={panelRef} className="mt-2.5 scroll-mt-3 overflow-hidden rounded-2xl bg-surface ring-1 ring-line">
          {highlight.tags.length > 0 ? (
            <div className="border-b border-[#d6e2ff] bg-gradient-to-r from-[#eef4ff] to-[#f5f0ff] px-3 py-2.5">
              <div className="flex flex-wrap gap-1.5">
                {highlight.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#2563eb] px-2.5 py-1 text-[12px] font-extrabold text-white shadow-[0_2px_6px_rgba(37,99,235,0.3)]"
                  >
                    {HUB_TAGS[tag].emoji} {t(HUB_TAGS[tag].label, locale)}
                  </span>
                ))}
              </div>
              <ul className="mt-1.5 flex flex-col gap-0.5">
                {highlight.routes.map((route) => (
                  <li key={route.to.ko} className="text-[12px] font-bold text-[#1e3a8a]">
                    {route.emoji} {t(route.to, locale)}
                    {route.via ? <span className="font-semibold text-[#4b5d8f]"> · {t(route.via, locale)}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="border-b border-line px-3 py-2 text-[13px] font-extrabold text-neutral-900">
            {selected ? (
              <>
                <span className="mr-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-[#f5b800] px-1 text-[12px] font-black text-neutral-900">
                  {selected.label}
                </span>
                {fill(COPY.around, locale, selected.label)}
              </>
            ) : (
              t(COPY.aroundStation, locale)
            )}
          </p>
          {rows === undefined ? (
            <ul className="divide-y divide-line" aria-busy>
              {SHOP_KINDS.filter((kind) => !kind.hideEmpty).map((kind) => (
                <li key={kind.id} className="flex items-center gap-3 px-3 py-2.5">
                  <span className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-surface-muted" />
                  <span className="h-4 flex-1 animate-pulse rounded bg-surface-muted" />
                </li>
              ))}
            </ul>
          ) : rows === null ? (
            <p className="px-3 py-3 text-[12px] text-neutral-500">{t(COPY.failed, locale)}</p>
          ) : (
            <ul className="divide-y divide-line">
              {rows.map((row) => (
                <ShopRowItem
                  key={row.kind.id}
                  row={row}
                  from={{ name: mapName, position: center }}
                  locale={locale}
                  onOpen={() => openRow(row)}
                />
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <a
        href={kakaoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-[#fee500] px-3 py-3 text-[14px] font-extrabold text-[#191919] transition active:scale-[0.98]"
      >
        <PinIcon size={18} />
        {selected ? fill(COPY.kakaoExit, locale, selected.label) : t(COPY.kakaoStation, locale)}
        <span aria-hidden>↗</span>
      </a>
      {exitList && exitList.length > 0 ? (
        <p className="mt-1.5 text-right text-[10px] text-neutral-400">{t(COPY.credit, locale)}</p>
      ) : null}
      {openShop ? (
        <PlaceInfoSheet
          places={openShop.places}
          initialId={openShop.id}
          origin={openShop.origin}
          originLabel={openShop.originLabel}
          kind={openShop.kind}
          renderIcon={(place) => (
            <Image src={openShop.icon(place)} alt="" width={40} height={40} className="h-full w-full object-contain" />
          )}
          locale={locale}
          onClose={() => setOpenShop(null)}
        />
      ) : null}
    </section>
  );
}
