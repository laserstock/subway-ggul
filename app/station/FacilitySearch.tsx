"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { searchNearby, type NearbyPlace, type NearbyQuery } from "../kakao-places";
import { loadKakaoMaps } from "../kakao-sdk";
import { SearchIcon } from "../_components/icons";
import { loadExits, nearestExit, walkMinutes, walkUrl, type StationExit } from "../_lib/exits";
import { formatDistance, stationParams, t, type Locale, type Localized, type StationOption } from "../_lib/stations";
import { sortSpots, type StationUrgent, type UrgentZone } from "../_lib/urgent";

type Screen = "/urgent" | "/shops" | "/transfer" | "/luggage";

type Intent = {
  id: string;
  emoji: string;
  label: Localized;
  /** Matched against what the user typed, in any of the app languages. */
  match: RegExp;
  /** Places around the station from Kakao. */
  nearby?: NearbyQuery;
  /** Restrooms come from the station's own facility data, not Kakao. */
  restrooms?: boolean;
  /** Screen with the full comparison for this facility. */
  screen?: { href: Screen; category?: string; label: Localized };
  /** Scroll to the exit guide instead of searching. */
  exits?: boolean;
  note?: Localized;
};

const INTENTS: Intent[] = [
  {
    id: "restroom",
    emoji: "🚻",
    label: { ko: "화장실", en: "Restroom", zh: "卫生间", ja: "トイレ" },
    match: /화장실|변소|toilet|restroom|wc|bathroom|厕所|卫生间|洗手间|トイレ|お手洗い/i,
    restrooms: true,
    screen: {
      href: "/urgent",
      label: { ko: "긴급 화면에서 개찰구 안/밖 비교", en: "Compare inside/outside the gate", zh: "比较闸机内外", ja: "改札内/外を比較" },
    },
  },
  {
    id: "pharmacy",
    emoji: "💊",
    label: { ko: "약국", en: "Pharmacy", zh: "药店", ja: "薬局" },
    match: /약국|^약$|pharmacy|drug|药|薬|ドラッグ/i,
    nearby: { kind: "category", code: "PM9", radius: 700 },
    screen: {
      href: "/urgent",
      label: { ko: "긴급 화면에서 더 보기", en: "More on the Urgent screen", zh: "在紧急页面查看更多", ja: "緊急画面で詳しく" },
    },
  },
  {
    id: "convenience",
    emoji: "🏪",
    label: { ko: "편의점", en: "Convenience store", zh: "便利店", ja: "コンビニ" },
    match: /편의점|^cu$|gs25|세븐일레븐|이마트24|convenience|7-?eleven|便利店|コンビニ/i,
    nearby: { kind: "category", code: "CS2", radius: 500 },
    screen: {
      href: "/shops",
      category: "convenience",
      label: { ko: "출구 매장 지도에서 보기", en: "See on the exit shops map", zh: "在出口商店地图查看", ja: "出口ショップ地図で見る" },
    },
  },
  {
    id: "cafe",
    emoji: "☕",
    label: { ko: "카페", en: "Cafe", zh: "咖啡店", ja: "カフェ" },
    match: /카페|커피|cafe|coffee|咖啡|カフェ|コーヒー/i,
    nearby: { kind: "category", code: "CE7", radius: 500 },
    screen: {
      href: "/shops",
      category: "cafe",
      label: { ko: "출구 매장 지도에서 보기", en: "See on the exit shops map", zh: "在出口商店地图查看", ja: "出口ショップ地図で見る" },
    },
  },
  {
    id: "starbucks",
    emoji: "🧜",
    label: { ko: "스타벅스", en: "Starbucks", zh: "星巴克", ja: "スターバックス" },
    match: /스타벅스|스벅|starbucks|星巴克|スタバ|スターバックス/i,
    nearby: { kind: "keyword", keyword: "스타벅스", radius: 1000, category: "CE7", brand: true },
  },
  {
    id: "oliveyoung",
    emoji: "💄",
    label: { ko: "올리브영", en: "Olive Young", zh: "Olive Young", ja: "オリーブヤング" },
    match: /올리브영|올영|olive\s*young|オリーブヤング/i,
    nearby: { kind: "keyword", keyword: "올리브영", radius: 1000, brand: true },
    screen: {
      href: "/shops",
      category: "oliveyoung",
      label: { ko: "출구 매장 지도에서 보기", en: "See on the exit shops map", zh: "在出口商店地图查看", ja: "出口ショップ地図で見る" },
    },
  },
  {
    id: "daiso",
    emoji: "🛒",
    label: { ko: "다이소", en: "Daiso", zh: "大创", ja: "ダイソー" },
    match: /다이소|daiso|大创|ダイソー/i,
    nearby: { kind: "keyword", keyword: "다이소", radius: 1000, brand: true },
    screen: {
      href: "/shops",
      category: "daiso",
      label: { ko: "출구 매장 지도에서 보기", en: "See on the exit shops map", zh: "在出口商店地图查看", ja: "出口ショップ地図で見る" },
    },
  },
  {
    id: "atm",
    emoji: "🏧",
    label: { ko: "ATM·은행", en: "ATM · Bank", zh: "ATM · 银行", ja: "ATM · 銀行" },
    match: /atm|현금|인출|은행|bank|银行|取款|銀行/i,
    nearby: { kind: "category", code: "BK9", radius: 700 },
  },
  {
    id: "elevator",
    emoji: "🛗",
    label: { ko: "엘리베이터", en: "Elevator", zh: "电梯", ja: "エレベーター" },
    match: /엘리베이터|엘베|에스컬레이터|휠체어|무장애|유모차|elevator|lift|escalator|wheelchair|stroller|电梯|扶梯|轮椅|エレベーター|エスカレーター|車いす/i,
    note: {
      ko: "엘리베이터 칸 번호와 무장애 동선은 '빠른환승 & 편한길'에서 볼 수 있어요",
      en: "Elevator car numbers and step-free routes are in Fast Transfer & Easy Route",
      zh: "电梯车厢号和无障碍路线请在「快速换乘 & 舒适路线」查看",
      ja: "エレベーターに近い号車とバリアフリー経路は「スムーズ乗換」で確認できます",
    },
    screen: {
      href: "/transfer",
      label: { ko: "빠른환승 & 편한길 열기", en: "Open Fast Transfer & Easy Route", zh: "打开快速换乘", ja: "スムーズ乗換を開く" },
    },
  },
  {
    id: "luggage",
    emoji: "🧳",
    label: { ko: "짐보관", en: "Luggage storage", zh: "行李寄存", ja: "荷物預け" },
    match: /짐|보관|사물함|락커|라커|캐리어|locker|luggage|storage|baggage|行李|寄存|荷物|ロッカー/i,
    note: {
      ko: "또타라커·T-Luggage·주변 보관소를 한 번에 비교해 보세요",
      en: "Compare T-Locker, T-Luggage and nearby storage in one place",
      zh: "一次比较 T-Locker、T-Luggage 和周边寄存点",
      ja: "T-Locker・T-Luggage・周辺の預かり所をまとめて比較",
    },
    screen: {
      href: "/luggage",
      label: { ko: "짐보관 화면 열기", en: "Open Luggage", zh: "打开行李寄存", ja: "荷物預けを開く" },
    },
  },
  {
    id: "exit",
    emoji: "🚪",
    label: { ko: "출구", en: "Exits", zh: "出口", ja: "出口" },
    match: /출구|나가는|exit|出口/i,
    exits: true,
  },
  {
    id: "food",
    emoji: "🍜",
    label: { ko: "맛집", en: "Food", zh: "美食", ja: "グルメ" },
    match: /맛집|식당|밥집|음식|restaurant|food|eat|美食|餐厅|グルメ|レストラン|ご飯/i,
    nearby: { kind: "category", code: "FD6", radius: 500 },
  },
  {
    id: "clinic",
    emoji: "🏥",
    label: { ko: "병원", en: "Clinic", zh: "医院", ja: "病院" },
    match: /병원|의원|내과|응급|clinic|hospital|doctor|医院|诊所|病院|クリニック/i,
    nearby: { kind: "category", code: "HP8", radius: 700 },
    screen: {
      href: "/urgent",
      label: { ko: "긴급 화면에서 더 보기", en: "More on the Urgent screen", zh: "在紧急页面查看更多", ja: "緊急画面で詳しく" },
    },
  },
  {
    id: "exchange",
    emoji: "💱",
    label: { ko: "환전", en: "Currency exchange", zh: "换钱", ja: "両替" },
    match: /환전|exchange|money\s*change|换钱|兑换|両替/i,
    nearby: { kind: "keyword", keyword: "환전", radius: 1000 },
  },
];

const POPULAR = ["restroom", "pharmacy", "convenience", "cafe", "oliveyoung", "daiso", "atm", "elevator", "luggage", "food", "clinic", "exchange"];
const SHOWN = 5;
const FREE_TEXT_RADIUS = 1000;

const COPY = {
  placeholder: {
    ko: "{station}에서 찾기 · 약국, 화장실, 편의점…",
    en: "Find at {station} · pharmacy, restroom…",
    zh: "在{station}查找 · 药店、卫生间…",
    ja: "{station}で探す · 薬局、トイレ…",
  },
  label: { ko: "역 주변 시설 검색", en: "Search facilities", zh: "搜索周边设施", ja: "周辺施設を検索" },
  clear: { ko: "지우기", en: "Clear", zh: "清除", ja: "クリア" },
  popular: { ko: "많이 찾는", en: "Popular", zh: "热门", ja: "よく検索" },
  searching: { ko: "찾는 중…", en: "Searching…", zh: "搜索中…", ja: "検索中…" },
  none: {
    ko: "역 근처에서 찾지 못했어요. 다른 이름으로 검색해 보세요",
    en: "Nothing found near the station. Try another word",
    zh: "车站附近没有找到，请换个关键词",
    ja: "駅の近くで見つかりませんでした。別の言葉で検索してください",
  },
  failed: {
    ko: "검색하지 못했어요. 잠시 후 다시 시도해 주세요",
    en: "Search failed. Please try again shortly",
    zh: "搜索失败，请稍后重试",
    ja: "検索できませんでした。しばらくしてからお試しください",
  },
  walk: { ko: "도보 약 {n}분", en: "~{n} min walk", zh: "步行约{n}分钟", ja: "徒歩約{n}分" },
  fromExit: { ko: "{n}번 출구에서 가까워요", en: "Closest to Exit {n}", zh: "靠近{n}号出口", ja: "{n}番出口から近い" },
  inStation: { ko: "역 안", en: "In station", zh: "站内", ja: "駅構内" },
  route: { ko: "길찾기", en: "Directions", zh: "导航", ja: "ルート" },
  moreKakao: { ko: "카카오맵에서 더 보기", en: "More in Kakao Map", zh: "在Kakao地图查看更多", ja: "カカオマップでもっと見る" },
  showExits: { ko: "출구·길찾기로 이동", en: "Go to exits & directions", zh: "前往出口 · 导航", ja: "出口 · 道案内へ" },
  restroomLoading: { ko: "화장실 정보를 불러오는 중…", en: "Loading restrooms…", zh: "正在加载卫生间…", ja: "トイレ情報を読み込み中…" },
} satisfies Record<string, Localized>;

const ZONE_BADGE: Record<UrgentZone, { label: Localized; className: string }> = {
  inside: { label: { ko: "개찰구 안", en: "Inside gate", zh: "闸机内", ja: "改札内" }, className: "bg-[#dcfce7] text-[#15803d]" },
  station: { label: { ko: "역 안", en: "In station", zh: "站内", ja: "駅構内" }, className: "bg-[#e0f2fe] text-[#0369a1]" },
  exit: { label: { ko: "출구 앞", en: "By the exit", zh: "出口旁", ja: "出口前" }, className: "bg-[#fef3c7] text-[#b45309]" },
  outside: { label: { ko: "개찰구 밖", en: "Outside gate", zh: "闸机外", ja: "改札外" }, className: "bg-[#ffedd5] text-[#c2410c]" },
  unknown: { label: { ko: "현장 확인", en: "Check on site", zh: "请现场确认", ja: "現地で確認" }, className: "bg-surface-muted text-ink-muted" },
};

function fill(template: Localized, locale: Locale, values: Record<string, string | number>) {
  return t(template, locale).replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

type Resolved = { key: string; intent: Intent | null; text: string };

function resolve(query: string): Resolved | null {
  const text = query.trim();
  if (!text) return null;
  const intent = INTENTS.find((item) => item.match.test(text)) ?? null;
  return { key: intent ? intent.id : `q:${text}`, intent, text };
}

function queryFor(resolved: Resolved): NearbyQuery | null {
  if (resolved.intent) return resolved.intent.nearby ?? null;
  return { kind: "keyword", keyword: resolved.text, radius: FREE_TEXT_RADIUS };
}

function PlaceRow({
  place,
  station,
  exits,
  inStation,
  locale,
}: {
  place: NearbyPlace;
  station: StationOption;
  exits: StationExit[];
  inStation: boolean;
  locale: Locale;
}) {
  const near = inStation ? null : nearestExit(exits, place.position);
  const from = near
    ? { name: `${station.name.ko} ${near.exit.label}번 출구`, position: near.exit.position }
    : { name: station.name.ko, position: station.center };
  const minutes = walkMinutes(near ? near.meters : place.distance);
  const kind = place.category.split(">").pop()?.trim();

  return (
    <li>
      <a
        href={walkUrl(from, { name: place.name, position: place.position })}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-3 py-2.5 transition active:bg-surface-muted"
      >
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[14px] font-extrabold text-ink">{place.name}</span>
            {inStation ? (
              <span className="shrink-0 rounded-md bg-[#e0f2fe] px-1.5 py-[1px] text-[10.5px] font-extrabold text-[#0369a1]">
                {t(COPY.inStation, locale)}
              </span>
            ) : null}
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11.5px] font-semibold text-ink-muted">
            {near ? (
              <span className="inline-flex items-center gap-1 text-[#15803d]">
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded bg-[#f5b800] px-0.5 text-[10px] font-black text-neutral-900">
                  {near.exit.label}
                </span>
                {fill(COPY.fromExit, locale, { n: near.exit.label })}
              </span>
            ) : null}
            {kind ? <span className="truncate">{kind}</span> : null}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="text-right">
            <span className="block text-[12.5px] font-extrabold text-[#2563eb]">{fill(COPY.walk, locale, { n: minutes })}</span>
            <span className="block text-[11px] font-semibold text-neutral-400">{formatDistance(place.distance)}</span>
          </span>
          <span className="rounded-lg bg-[#eef4ff] px-2 py-1.5 text-[11px] font-extrabold text-[#2563eb]">
            {t(COPY.route, locale)}
          </span>
        </span>
      </a>
    </li>
  );
}

/** "약국", "toilet", "다이소"… — finds a facility around the station and shows the exit to take. */
export default function FacilitySearch({
  station,
  urgent,
  locale,
}: {
  station: StationOption;
  urgent: StationUrgent | null;
  locale: Locale;
}) {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [exits, setExits] = useState<StationExit[]>([]);
  /** Kakao results per resolved key; null when the search failed. */
  const [results, setResults] = useState<Record<string, NearbyPlace[] | null>>({});

  const resolved = resolve(submitted);
  const nearby = resolved ? queryFor(resolved) : null;
  const resultKey = resolved?.key ?? "";

  useEffect(() => {
    let alive = true;
    loadExits(station)
      .catch(() => [])
      .then((list) => {
        if (alive) setExits(list);
      });
    return () => {
      alive = false;
    };
  }, [station]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSubmitted(query), 450);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const target = resolve(submitted);
    const request = target ? queryFor(target) : null;
    if (!target || !request || target.key in results) return;
    let alive = true;
    loadKakaoMaps()
      .then(() => searchNearby(request, station.center))
      .catch(() => null)
      .then((places) => {
        if (alive) setResults((previous) => ({ ...previous, [target.key]: places }));
      });
    return () => {
      alive = false;
    };
  }, [submitted, results, station.center]);

  function choose(intent: Intent) {
    const text = t(intent.label, locale);
    setQuery(text);
    setSubmitted(text);
    if (intent.exits) document.getElementById("exit-guide")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const intent = resolved?.intent ?? null;
  const places = resultKey in results ? results[resultKey] : undefined;
  const inStationIds = new Set(
    (urgent?.pharmacy ?? []).filter((spot) => spot.zone === "station").map((spot) => spot.id.replace(/^kakao-/, "")),
  );
  const restrooms = intent?.restrooms && urgent ? sortSpots(urgent.restroom) : null;
  const kakaoSearch = resolved
    ? `https://map.kakao.com/link/search/${encodeURIComponent(`${station.name.ko} ${intent ? intent.label.ko : resolved.text}`)}`
    : null;

  return (
    <section className="mt-1">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(query);
        }}
      >
        <label className="flex items-center gap-2 rounded-2xl bg-surface-muted px-3.5 py-3 ring-1 ring-line focus-within:ring-2 focus-within:ring-honey">
          <SearchIcon />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={fill(COPY.placeholder, locale, { station: t(station.name, locale) })}
            aria-label={t(COPY.label, locale)}
            enterKeyHint="search"
            className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-ink outline-none placeholder:font-medium placeholder:text-neutral-400 [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSubmitted("");
              }}
              aria-label={t(COPY.clear, locale)}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-300 text-[12px] font-bold text-white"
            >
              ✕
            </button>
          ) : null}
        </label>
      </form>

      <div className="no-scrollbar -mx-4 mt-2 flex items-center gap-1.5 overflow-x-auto px-4 pb-0.5">
        <span className="shrink-0 text-[11px] font-bold text-ink-muted">{t(COPY.popular, locale)}</span>
        {POPULAR.map((id) => {
          const item = INTENTS.find((entry) => entry.id === id);
          if (!item) return null;
          const active = intent?.id === item.id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => choose(item)}
              aria-pressed={active}
              className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-bold transition active:scale-95 ${
                active ? "bg-ink text-white" : "bg-surface text-ink ring-1 ring-line"
              }`}
            >
              <span aria-hidden>{item.emoji}</span>
              {t(item.label, locale)}
            </button>
          );
        })}
      </div>

      {resolved ? (
        <div className="mt-2.5 overflow-hidden rounded-2xl bg-surface ring-1 ring-line" aria-live="polite">
          {intent ? (
            <p className="flex items-center gap-1.5 border-b border-line px-3 py-2 text-[13px] font-extrabold text-ink">
              <span aria-hidden>{intent.emoji}</span>
              {t(intent.label, locale)}
            </p>
          ) : null}

          {intent?.note ? <p className="px-3 pt-2.5 text-[12.5px] font-semibold leading-relaxed text-ink-muted">{t(intent.note, locale)}</p> : null}

          {intent?.restrooms ? (
            restrooms ? (
              <ul className="divide-y divide-line">
                {restrooms.slice(0, SHOWN).map((spot) => (
                  <li key={spot.id} className="flex items-start gap-2 px-3 py-2.5">
                    <span
                      className={`mt-0.5 shrink-0 rounded-md px-1.5 py-[1px] text-[10.5px] font-extrabold ${ZONE_BADGE[spot.zone].className}`}
                    >
                      {t(ZONE_BADGE[spot.zone].label, locale)}
                    </span>
                    <span className="min-w-0 flex-1 text-[13px] font-semibold leading-snug text-ink">{t(spot.detail, locale)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 py-3 text-[12px] text-ink-muted">{t(COPY.restroomLoading, locale)}</p>
            )
          ) : null}

          {nearby ? (
            places === undefined ? (
              <ul className="divide-y divide-line" aria-busy>
                {[0, 1, 2].map((index) => (
                  <li key={index} className="flex items-center gap-3 px-3 py-3">
                    <span className="h-4 flex-1 animate-pulse rounded bg-surface-muted" />
                    <span className="h-4 w-16 animate-pulse rounded bg-surface-muted" />
                  </li>
                ))}
              </ul>
            ) : places === null ? (
              <p className="px-3 py-3 text-[12px] text-ink-muted">{t(COPY.failed, locale)}</p>
            ) : places.length === 0 ? (
              <p className="px-3 py-3 text-[12px] text-ink-muted">{t(COPY.none, locale)}</p>
            ) : (
              <ul className="divide-y divide-line">
                {places.slice(0, SHOWN).map((place) => (
                  <PlaceRow
                    key={place.id}
                    place={place}
                    station={station}
                    exits={exits}
                    inStation={inStationIds.has(place.id)}
                    locale={locale}
                  />
                ))}
              </ul>
            )
          ) : null}

          <div className="flex flex-wrap gap-1.5 border-t border-line px-3 py-2.5">
            {intent?.exits ? (
              <button
                type="button"
                onClick={() => document.getElementById("exit-guide")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="rounded-full bg-[#16a34a] px-3 py-1.5 text-[12px] font-extrabold text-white active:scale-95"
              >
                🚪 {t(COPY.showExits, locale)} ↓
              </button>
            ) : null}
            {intent?.screen ? (
              <Link
                href={`${intent.screen.href}?${stationParams(station)}${intent.screen.category ? `&category=${intent.screen.category}` : ""}`}
                className="rounded-full bg-ink px-3 py-1.5 text-[12px] font-extrabold text-white active:scale-95"
              >
                {t(intent.screen.label, locale)} →
              </Link>
            ) : null}
            {nearby && kakaoSearch ? (
              <a
                href={kakaoSearch}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#fee500] px-3 py-1.5 text-[12px] font-extrabold text-[#191919] active:scale-95"
              >
                {t(COPY.moreKakao, locale)} ↗
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
