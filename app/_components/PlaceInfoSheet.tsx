"use client";

import { useRef, useState, type ReactNode } from "react";
import KakaoMap, { type MapOverlay } from "../KakaoMap";
import type { NearbyPlace } from "../kakao-places";
import { walkMinutes, walkUrl, type MapPoint } from "../_lib/exits";
import { distanceMeters, t, type Locale, type Localized } from "../_lib/stations";
import BottomSheet from "./BottomSheet";

const COPY = {
  walk: {
    ko: "{from}에서 도보 약 {min}분 · {m}m",
    en: "~{min} min walk from {from} · {m} m",
    zh: "从{from}步行约{min}分钟 · {m}m",
    ja: "{from}から徒歩約{min}分 · {m}m",
  },
  walkShort: { ko: "도보 {min}분 · {m}m", en: "{min} min · {m} m", zh: "步行{min}分钟 · {m}m", ja: "徒歩{min}分 · {m}m" },
  copy: { ko: "복사", en: "Copy", zh: "复制", ja: "コピー" },
  copied: { ko: "복사됨", en: "Copied", zh: "已复制", ja: "コピー済み" },
  lot: { ko: "지번", en: "Lot", zh: "地号", ja: "地番" },
  noPhone: {
    ko: "카카오에 등록된 전화번호가 없어요",
    en: "No phone number listed on Kakao",
    zh: "Kakao上没有登记电话",
    ja: "カカオに電話番号の登録がありません",
  },
  call: { ko: "전화", en: "Call", zh: "致电", ja: "電話" },
  route: { ko: "카카오맵 길찾기", en: "Directions in Kakao Map", zh: "Kakao地图导航", ja: "カカオマップで道案内" },
  others: { ko: "근처 다른 {kind} {n}곳", en: "{n} more {kind} nearby", zh: "附近其他{kind}{n}家", ja: "近くの他の{kind} {n}件" },
  othersPlain: { ko: "근처 다른 곳 {n}곳", en: "{n} more nearby", zh: "附近其他{n}家", ja: "近くの他の場所 {n}件" },
  source: { ko: "매장 정보 © 카카오", en: "Store info © Kakao", zh: "店铺信息 © Kakao", ja: "店舗情報 © カカオ" },
} satisfies Record<string, Localized>;

function fill(template: Localized, locale: Locale, values: Record<string, string | number>) {
  return t(template, locale).replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/** "음식점 > 카페 > 커피전문점 > 스타벅스" → "커피전문점 › 스타벅스". */
function categoryTrail(category: string) {
  return category
    .split(">")
    .map((level) => level.trim())
    .filter(Boolean)
    .slice(-2)
    .join(" › ");
}

/**
 * Kakao Places details for one store, inside the app. Only the directions button leaves for Kakao Map.
 * `places` is the store and its same-kind neighbours, nearest first.
 */
export default function PlaceInfoSheet({
  places,
  initialId,
  origin,
  originLabel,
  kind,
  renderIcon,
  locale,
  onClose,
}: {
  places: NearbyPlace[];
  initialId?: string;
  /** Where walking times are measured from and directions start, e.g. the exit. */
  origin: MapPoint;
  originLabel: string;
  kind?: Localized;
  renderIcon: (place: NearbyPlace) => ReactNode;
  locale: Locale;
  onClose: () => void;
}) {
  const [currentId, setCurrentId] = useState(initialId ?? places[0]?.id);
  const [copied, setCopied] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const place = places.find((item) => item.id === currentId) ?? places[0];
  if (!place) return null;

  const meters = Math.round(distanceMeters(origin.position, place.position));
  const others = places.filter((item) => item.id !== place.id);
  const trail = categoryTrail(place.category);
  const address = place.roadAddress || place.lotAddress;

  const overlays: MapOverlay[] = [
    {
      key: "origin",
      position: origin.position,
      zIndex: 1,
      content: (
        <span className="inline-block whitespace-nowrap rounded-[6px] bg-[#f1d24f] px-[7px] py-[3px] text-[11px] font-bold leading-none text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.18)]">
          {originLabel}
        </span>
      ),
    },
    {
      key: place.id,
      position: place.position,
      zIndex: 2,
      content: (
        <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-[3px] border-[#1d4ed8] bg-white shadow-md">
          {renderIcon(place)}
        </span>
      ),
    },
  ];

  function copyAddress() {
    if (!address) return;
    navigator.clipboard?.writeText(address).then(
      () => setCopied(place.id),
      () => {},
    );
  }

  return (
    <BottomSheet
      onClose={onClose}
      title={
        <span className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-muted">
            {renderIcon(place)}
          </span>
          <span className="min-w-0">
            <span className="block break-words">{place.name}</span>
            {trail ? <span className="block text-[12px] font-semibold text-ink-muted">{trail}</span> : null}
          </span>
        </span>
      }
    >
      <div ref={scrollRef} className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-1 pt-3">
        <div className="relative isolate h-40 overflow-hidden rounded-2xl ring-1 ring-line">
          <KakaoMap
            center={place.position}
            fit={{ key: `${place.id}@${origin.position.lat},${origin.position.lng}`, points: [origin.position, place.position] }}
            overlays={overlays}
          />
        </div>

        <ul className="mt-3 flex flex-col gap-2.5 text-[13.5px] leading-snug text-neutral-800">
          <li className="flex gap-2">
            <span aria-hidden>🚶</span>
            <span className="font-bold text-[#2563eb]">
              {fill(COPY.walk, locale, { from: originLabel, min: walkMinutes(meters), m: meters })}
            </span>
          </li>
          {address ? (
            <li className="flex items-start gap-2">
              <span aria-hidden>📍</span>
              <span className="min-w-0 flex-1">
                {address}
                {place.roadAddress && place.lotAddress ? (
                  <span className="mt-0.5 block text-[12px] text-neutral-400">
                    {t(COPY.lot, locale)} {place.lotAddress}
                  </span>
                ) : null}
              </span>
              <button
                type="button"
                onClick={copyAddress}
                className="shrink-0 rounded-lg bg-surface-muted px-2 py-1 text-[11px] font-bold text-neutral-600 active:scale-95"
              >
                {t(copied === place.id ? COPY.copied : COPY.copy, locale)}
              </button>
            </li>
          ) : null}
          <li className="flex gap-2">
            <span aria-hidden>📞</span>
            {place.phone ? (
              <a href={`tel:${place.phone}`} className="font-semibold text-neutral-900 underline-offset-2 active:underline">
                {place.phone}
              </a>
            ) : (
              <span className="text-neutral-400">{t(COPY.noPhone, locale)}</span>
            )}
          </li>
        </ul>

        <div className="mt-4 flex gap-2">
          {place.phone ? (
            <a
              href={`tel:${place.phone}`}
              className="flex shrink-0 items-center justify-center rounded-xl bg-surface-muted px-4 py-3 text-[14px] font-extrabold text-neutral-800 active:scale-[0.98]"
            >
              📞 {t(COPY.call, locale)}
            </a>
          ) : null}
          <a
            href={walkUrl(origin, { name: place.name, position: place.position })}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-[#fee500] px-3 py-3 text-[14px] font-extrabold text-[#191919] active:scale-[0.98]"
          >
            {t(COPY.route, locale)} <span aria-hidden>↗</span>
          </a>
        </div>

        {others.length > 0 ? (
          <section className="mt-5">
            <h3 className="text-[13px] font-extrabold text-neutral-900">
              {kind
                ? fill(COPY.others, locale, { kind: t(kind, locale), n: others.length })
                : fill(COPY.othersPlain, locale, { n: others.length })}
            </h3>
            <ul className="mt-1.5 divide-y divide-line overflow-hidden rounded-2xl ring-1 ring-line">
              {others.map((other) => {
                const otherMeters = Math.round(distanceMeters(origin.position, other.position));
                return (
                  <li key={other.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentId(other.id);
                        scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left active:bg-surface-muted"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                        {renderIcon(other)}
                      </span>
                      <span className="min-w-0 flex-1 break-words text-[13.5px] font-bold leading-snug text-neutral-900">{other.name}</span>
                      <span className="shrink-0 text-[12px] font-semibold text-neutral-500">
                        {fill(COPY.walkShort, locale, { min: walkMinutes(otherMeters), m: otherMeters })}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <p className="mt-3 text-right text-[10px] text-neutral-400">{t(COPY.source, locale)}</p>
      </div>
    </BottomSheet>
  );
}
