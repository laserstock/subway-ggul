"use client";

import { useEffect, useState } from "react";
import type { LatLng } from "../KakaoMap";
import { searchNearby, type NearbyPlace, type NearbyQuery } from "../kakao-places";
import { loadKakaoMaps } from "../kakao-sdk";
import { stationKeys, t, type Locale, type Localized, type StationOption } from "../_lib/stations";

type StationExit = { label: string; position: LatLng };

type ShopKind = { id: string; emoji: string; tint: string; label: Localized; query: NearbyQuery };

const SHOP_KINDS: ShopKind[] = [
  {
    id: "pharmacy",
    emoji: "💊",
    tint: "#fee2e2",
    label: { ko: "약국", en: "Pharmacy", zh: "药店", ja: "薬局" },
    query: { kind: "category", code: "PM9", radius: 500 },
  },
  {
    id: "cafe",
    emoji: "☕",
    tint: "#f3e8dc",
    label: { ko: "카페", en: "Cafe", zh: "咖啡店", ja: "カフェ" },
    query: { kind: "category", code: "CE7", radius: 300 },
  },
  {
    id: "oliveyoung",
    emoji: "💄",
    tint: "#e7f6d5",
    label: { ko: "올리브영", en: "Olive Young", zh: "Olive Young", ja: "オリーブヤング" },
    query: { kind: "keyword", keyword: "올리브영", radius: 700 },
  },
  {
    id: "starbucks",
    emoji: "🧋",
    tint: "#d9f0e4",
    label: { ko: "스타벅스", en: "Starbucks", zh: "星巴克", ja: "スターバックス" },
    query: { kind: "keyword", keyword: "스타벅스", radius: 700 },
  },
  {
    id: "store",
    emoji: "🏪",
    tint: "#e0ecff",
    label: { ko: "편의점", en: "Convenience store", zh: "便利店", ja: "コンビニ" },
    query: { kind: "category", code: "CS2", radius: 300 },
  },
];

/** Walking speed used for the "N min" estimates. */
const METERS_PER_MINUTE = 70;

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
  walk: { ko: "도보 {n}분", en: "{n} min walk", zh: "步行{n}分钟", ja: "徒歩{n}分" },
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
  credit: { ko: "출구 위치 © OpenStreetMap", en: "Exit locations © OpenStreetMap" },
} satisfies Record<string, Localized>;

function fill(template: Localized, locale: Locale, n: string | number) {
  return t(template, locale).replace("{n}", String(n));
}

async function loadExits(station: StationOption): Promise<StationExit[]> {
  const { STATION_EXITS } = await import("../_lib/stationExits");
  for (const key of stationKeys(station)) {
    const list = STATION_EXITS[key];
    if (list?.length) return list.map(([label, lat, lng]) => ({ label, position: { lat, lng } }));
  }
  return [];
}

type ShopRow = { kind: ShopKind; places: NearbyPlace[] };

/** One row per kind, nearest first; null when Kakao couldn't be reached at all. */
async function loadShops(center: LatLng): Promise<ShopRow[] | null> {
  await loadKakaoMaps();
  const results = await Promise.allSettled(SHOP_KINDS.map((kind) => searchNearby(kind.query, center)));
  if (results.every((result) => result.status === "rejected")) return null;
  return SHOP_KINDS.map((kind, index) => {
    const result = results[index];
    return { kind, places: result.status === "fulfilled" ? result.value : [] };
  });
}

function ShopRowItem({ row, locale }: { row: ShopRow; locale: Locale }) {
  const [nearest, ...rest] = row.places;
  const body = (
    <>
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[20px]"
        style={{ backgroundColor: row.kind.tint }}
        aria-hidden
      >
        {row.kind.emoji}
      </span>
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
            {fill(COPY.walk, locale, Math.max(1, Math.round(nearest.distance / METERS_PER_MINUTE)))}
          </span>
          <span className="block text-[11px] font-semibold text-neutral-400">
            {nearest.distance}m{rest.length > 0 ? ` · ${fill(COPY.more, locale, rest.length)}` : ""}
          </span>
        </span>
      ) : null}
    </>
  );

  return (
    <li>
      {nearest ? (
        <a
          href={nearest.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 transition active:bg-surface-muted"
        >
          {body}
        </a>
      ) : (
        <div className="flex items-center gap-3 px-3 py-2.5">{body}</div>
      )}
    </li>
  );
}

export default function ExitGuide({ station, locale }: { station: StationOption; locale: Locale }) {
  const [exits, setExits] = useState<{ key: string; list: StationExit[] } | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  /** Shop rows per exit label ("" for the station centre); null when the lookup failed. */
  const [shops, setShops] = useState<Record<string, ShopRow[] | null>>({});

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
  const kakaoUrl = `https://map.kakao.com/link/map/${encodeURIComponent(mapName)},${center.lat},${center.lng}`;

  return (
    <section className="mt-5">
      <h2 className="text-[16px] font-extrabold tracking-tight text-neutral-900">🗺️ {t(COPY.title, locale)}</h2>

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
          <div className="no-scrollbar -mx-4 mt-2 flex gap-1.5 overflow-x-auto px-4 pb-1" role="group">
            {exitList.map((exit) => {
              const active = exit.label === selected?.label;
              return (
                <button
                  key={exit.label}
                  type="button"
                  onClick={() => setPicked(exit.label)}
                  aria-pressed={active}
                  aria-label={fill(COPY.exit, locale, exit.label)}
                  className={`flex h-10 min-w-10 shrink-0 items-center justify-center rounded-xl px-2 text-[15px] font-black tabular-nums transition active:scale-95 ${
                    active
                      ? "bg-[#f5b800] text-neutral-900 shadow-[0_2px_6px_rgba(245,184,0,0.4)]"
                      : "bg-surface-muted text-neutral-600 ring-1 ring-line"
                  }`}
                >
                  {exit.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      {exitList ? (
        <div className="mt-2.5 overflow-hidden rounded-2xl bg-surface ring-1 ring-line">
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
              {SHOP_KINDS.map((kind) => (
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
                <ShopRowItem key={row.kind.id} row={row} locale={locale} />
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
        <span aria-hidden>🗺️</span>
        {selected ? fill(COPY.kakaoExit, locale, selected.label) : t(COPY.kakaoStation, locale)}
        <span aria-hidden>↗</span>
      </a>
      {exitList && exitList.length > 0 ? (
        <p className="mt-1.5 text-right text-[10px] text-neutral-400">{t(COPY.credit, locale)}</p>
      ) : null}
    </section>
  );
}
