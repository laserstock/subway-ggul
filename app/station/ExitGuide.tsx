"use client";

import { useEffect, useState } from "react";
import { findStationExits, searchNearby, type NearbyPlace, type StationExit } from "../kakao-places";
import { loadKakaoMaps } from "../kakao-sdk";
import { t, type Locale, type Localized, type StationOption } from "../_lib/stations";

const SHOP_RADIUS = 150;
const SHOPS_PER_KIND = 2;

const SHOP_KINDS = [
  { code: "CS2", emoji: "🏪" },
  { code: "CE7", emoji: "☕" },
  { code: "PM9", emoji: "💊" },
] as const;

type ExitShop = NearbyPlace & { emoji: string };

const COPY = {
  title: { ko: "출구·길찾기", en: "Exits & directions", zh: "出口 · 导航", ja: "出口 · 道案内" },
  exit: { ko: "{n}번", en: "Exit {n}", zh: "{n}号", ja: "{n}番" },
  shopsTitle: {
    ko: "{n}번 출구 주요 매장",
    en: "Around Exit {n}",
    zh: "{n}号出口周边",
    ja: "{n}番出口周辺",
  },
  loading: { ko: "출구 정보를 불러오는 중…", en: "Loading exits…", zh: "正在加载出口…", ja: "出口を読み込み中…" },
  failed: {
    ko: "출구 정보를 불러오지 못했어요. 지도 앱에서 확인해 주세요",
    en: "Couldn't load exits. Please check a map app",
  },
  none: {
    ko: "카카오맵에 등록된 출구 정보가 없어요. 지도 앱에서 확인해 주세요",
    en: "No exits listed on Kakao Map. Please check a map app",
  },
  shopsLoading: { ko: "주변 매장을 찾는 중…", en: "Finding shops nearby…" },
  shopsNone: {
    ko: "출구 150m 안에 편의점·카페·약국이 없어요",
    en: "No store, cafe or pharmacy within 150 m",
  },
  kakao: { ko: "카카오맵 연동", en: "Kakao Map", zh: "Kakao地图", ja: "カカオマップ" },
  naver: { ko: "네이버 지도 연동", en: "Naver Map", zh: "Naver地图", ja: "NAVER地図" },
} satisfies Record<string, Localized>;

function fill(template: Localized, locale: Locale, n: string) {
  return t(template, locale).replace("{n}", n);
}

function MapButton({ href, label, color }: { href: string; label: string; color: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-1 items-center justify-center gap-1 rounded-xl border bg-white px-2 py-2.5 text-[12.5px] font-extrabold transition active:scale-[0.98]"
      style={{ borderColor: `${color}55`, color }}
    >
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      {label} ↗
    </a>
  );
}

export default function ExitGuide({ station, locale }: { station: StationOption; locale: Locale }) {
  /** undefined while loading, null when the lookup failed. */
  const [exits, setExits] = useState<StationExit[] | null | undefined>(undefined);
  const [picked, setPicked] = useState<string | null>(null);
  const [shops, setShops] = useState<{ exit: string; list: ExitShop[] } | null>(null);

  useEffect(() => {
    let alive = true;
    loadKakaoMaps()
      .then(() => findStationExits(station.name.ko, station.center))
      .then((found) => {
        if (alive) setExits(found);
      })
      .catch(() => {
        if (alive) setExits(null);
      });
    return () => {
      alive = false;
    };
  }, [station]);

  const selected = exits?.find((exit) => exit.label === picked) ?? exits?.[0] ?? null;

  useEffect(() => {
    if (!selected) return;
    let alive = true;
    Promise.allSettled(
      SHOP_KINDS.map((kind) =>
        searchNearby({ kind: "category", code: kind.code, radius: SHOP_RADIUS }, selected.position).then((found) =>
          found.slice(0, SHOPS_PER_KIND).map((place) => ({ ...place, emoji: kind.emoji })),
        ),
      ),
    ).then((results) => {
      if (!alive) return;
      const list = results
        .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
        .sort((a, b) => a.distance - b.distance);
      setShops({ exit: selected.label, list });
    });
    return () => {
      alive = false;
    };
  }, [selected]);

  const shopList = selected && shops?.exit === selected.label ? shops.list : null;
  const target = selected
    ? { name: `${station.name.ko} ${selected.label}번 출구`, position: selected.position }
    : { name: station.name.ko, position: station.center };
  const kakaoUrl = `https://map.kakao.com/link/map/${encodeURIComponent(target.name)},${target.position.lat},${target.position.lng}`;
  const naverUrl = `https://map.naver.com/p/search/${encodeURIComponent(target.name)}`;

  return (
    <section className="mt-4">
      <h2 className="mb-2 text-[16px] font-extrabold tracking-tight text-neutral-900">
        🗺️ {t(COPY.title, locale)}
      </h2>

      {exits === undefined ? (
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4].map((index) => (
            <span key={index} className="h-9 w-14 shrink-0 animate-pulse rounded-full bg-surface-muted" />
          ))}
          <span className="sr-only">{t(COPY.loading, locale)}</span>
        </div>
      ) : exits === null || exits.length === 0 ? (
        <p className="rounded-xl bg-surface px-3 py-2.5 text-[12px] text-neutral-500 ring-1 ring-line">
          {t(exits === null ? COPY.failed : COPY.none, locale)}
        </p>
      ) : (
        <>
          <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
            {exits.map((exit) => {
              const active = exit.label === selected?.label;
              return (
                <button
                  key={exit.label}
                  type="button"
                  onClick={() => setPicked(exit.label)}
                  aria-pressed={active}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-bold transition active:scale-95 ${
                    active
                      ? "border-[#f5b800] bg-[#f5b800] text-neutral-900 shadow-[0_2px_6px_rgba(245,184,0,0.35)]"
                      : "border-neutral-200 bg-white text-neutral-700"
                  }`}
                >
                  {fill(COPY.exit, locale, exit.label)}
                </button>
              );
            })}
          </div>

          {selected ? (
            <div className="mt-2 border-l-[3px] border-[#f5b800] pl-2.5">
              <p className="text-[13px] font-extrabold text-neutral-900">
                {fill(COPY.shopsTitle, locale, selected.label)}
              </p>
              {shopList === null ? (
                <p className="mt-1 text-[12px] text-neutral-400">{t(COPY.shopsLoading, locale)}</p>
              ) : shopList.length === 0 ? (
                <p className="mt-1 text-[12px] text-neutral-500">{t(COPY.shopsNone, locale)}</p>
              ) : (
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {shopList.map((shop) => (
                    <li key={shop.id}>
                      <a
                        href={shop.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-lg bg-[#eef6ff] px-2 py-1 text-[12px] font-bold text-[#1e3a8a]"
                      >
                        <span aria-hidden>{shop.emoji}</span>
                        <span className="max-w-[150px] truncate">{shop.name}</span>
                        <span className="font-semibold text-[#64748b]">{shop.distance}m</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </>
      )}

      <div className="mt-3 flex gap-2">
        <MapButton href={kakaoUrl} label={t(COPY.kakao, locale)} color="#2563eb" />
        <MapButton href={naverUrl} label={t(COPY.naver, locale)} color="#03a94d" />
      </div>
    </section>
  );
}
