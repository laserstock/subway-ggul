"use client";

import { useMemo, useState, type ReactNode } from "react";

type Locale = "ko" | "en";
type Localized = { ko: string; en: string };
type CategoryId =
  | "pharmacy"
  | "oliveyoung"
  | "daiso"
  | "cafe"
  | "convenience";

type Place = {
  id: string;
  category: CategoryId;
  name: Localized;
  walk: Localized;
  walkMinutes: number;
  status: Localized;
  note: Localized;
  x: number;
  y: number;
  badge?: number;
  pin: "pharmacy" | "shop" | "cafe" | "store";
};

const COPY = {
  title: { ko: "지하철꿀정보", en: "Subway Tips" },
  search: {
    ko: "역 주변이나 동선 상의 시설을 찾아보세요 (예: 홍대입구역)",
    en: "Search nearby or along your route (e.g. Hongik Univ.)",
  },
  smartList: { ko: "스마트 추천 목록", en: "Smart picks" },
  sortHint: { ko: "현재 위치에서 가장 빠른 순", en: "Fastest from here" },
  empty: { ko: "조건에 맞는 장소가 없어요", en: "No matching places" },
  station: { ko: "홍대입구역", en: "Hongik Univ." },
  insidePaid: {
    ko: "홍대입구역 역사 내(개찰구 안)",
    en: "Inside station (paid area)",
  },
  gyeongui: { ko: "경의, 경의중앙선", en: "Gyeongui–Jungang" },
};

const CATEGORIES: { id: CategoryId; name: Localized; emoji: string }[] = [
  { id: "pharmacy", name: { ko: "약국", en: "Pharmacy" }, emoji: "💊" },
  { id: "oliveyoung", name: { ko: "올리브영", en: "Olive Young" }, emoji: "💄" },
  { id: "daiso", name: { ko: "다이소", en: "Daiso" }, emoji: "🛍️" },
  { id: "cafe", name: { ko: "카페", en: "Cafe" }, emoji: "☕" },
  { id: "convenience", name: { ko: "편의점", en: "Store" }, emoji: "🏪" },
];

const EXITS = [
  { id: "e9a", label: { ko: "9번 출구", en: "Exit 9" }, x: 39, y: 24 },
  { id: "e2", label: { ko: "2번 출구", en: "Exit 2" }, x: 18, y: 34 },
  { id: "e1b", label: { ko: "1번 출구", en: "Exit 1" }, x: 78, y: 29 },
  { id: "e3", label: { ko: "3번 출구", en: "Exit 3" }, x: 72, y: 43 },
  { id: "e1a", label: { ko: "1번 출구", en: "Exit 1" }, x: 14, y: 52 },
  { id: "e9b", label: { ko: "9번 출구", en: "Exit 9" }, x: 27, y: 58 },
  { id: "e7", label: { ko: "7번 출구", en: "Exit 7" }, x: 43, y: 59 },
  { id: "e4", label: { ko: "4번 출구", en: "Exit 4" }, x: 55, y: 54 },
];

const MAP_LABELS = [
  { text: "동교동", x: 5, y: 16, size: 10 },
  { text: "서교동", x: 6, y: 40, size: 10 },
  { text: "서울의대", x: 84, y: 11, size: 10 },
  { text: "체리점밀", x: 88, y: 22, size: 9 },
  { text: "서울동능\n지역관리", x: 88, y: 40, size: 9 },
  { text: "경창역사들과", x: 76, y: 52, size: 9 },
  { text: "서울쥐아친구\n정의사", x: 60, y: 64, size: 9 },
  { text: "서울지하철", x: 86, y: 62, size: 9 },
  { text: "경의중앙선", x: 6, y: 66, size: 9 },
];

const PLACES: Place[] = [
  {
    id: "ph-inside",
    category: "pharmacy",
    name: {
      ko: "홍대입구역 내 약국 (개찰구 안, 지하 1층)",
      en: "In-station pharmacy (paid area, B1)",
    },
    walk: { ko: "현재 역에서 도보 1분", en: "1 min on foot from here" },
    walkMinutes: 1,
    status: { ko: "영업중 (~22:00)", en: "Open (~22:00)" },
    note: { ko: "2호선 개찰구 안쪽에 있어요", en: "Inside the Line 2 fare gates" },
    x: 46,
    y: 36,
    badge: 1,
    pin: "pharmacy",
  },
  {
    id: "ph-exit9",
    category: "pharmacy",
    name: {
      ko: "지하철역 9번 출구 앞 약국 (역외)",
      en: "Pharmacy by Exit 9 (outside)",
    },
    walk: { ko: "도보 3분", en: "3 min on foot" },
    walkMinutes: 3,
    status: { ko: "영업중", en: "Open" },
    note: { ko: "9번 출구로 나가서 바로 앞", en: "Right outside Exit 9" },
    x: 35,
    y: 29,
    pin: "pharmacy",
  },
  {
    id: "ph-exit3",
    category: "pharmacy",
    name: {
      ko: "3번 출구 인근 온누리약국",
      en: "Onnuri Pharmacy near Exit 3",
    },
    walk: { ko: "도보 4분", en: "4 min on foot" },
    walkMinutes: 4,
    status: { ko: "영업중 (~21:30)", en: "Open (~21:30)" },
    note: { ko: "3번 출구로 나와 횡단보도 건너편", en: "Across the street from Exit 3" },
    x: 60,
    y: 46,
    pin: "pharmacy",
  },
  {
    id: "oy-station",
    category: "oliveyoung",
    name: {
      ko: "올리브영 홍대입구역점",
      en: "Olive Young Hongik Univ. Station",
    },
    walk: { ko: "현재 역에서 도보 2분", en: "2 min on foot from here" },
    walkMinutes: 2,
    status: { ko: "영업중 (~23:00)", en: "Open (~23:00)" },
    note: { ko: "1번 출구 앞 대로변", en: "On the main street by Exit 1" },
    x: 75,
    y: 33,
    badge: 1,
    pin: "shop",
  },
  {
    id: "oy-street",
    category: "oliveyoung",
    name: { ko: "올리브영 홍대거리점", en: "Olive Young Hongdae Street" },
    walk: { ko: "도보 6분", en: "6 min on foot" },
    walkMinutes: 6,
    status: { ko: "영업중 (~24:00)", en: "Open (~24:00)" },
    note: { ko: "홍대 걷고싶은거리 초입", en: "At the start of Hongdae street" },
    x: 24,
    y: 48,
    pin: "shop",
  },
  {
    id: "ds-hongdae",
    category: "daiso",
    name: { ko: "다이소 홍대점", en: "Daiso Hongdae" },
    walk: { ko: "도보 5분", en: "5 min on foot" },
    walkMinutes: 5,
    status: { ko: "영업중 (~23:00)", en: "Open (~23:00)" },
    note: { ko: "2번 출구에서 홍대거리 방향", en: "From Exit 2 toward Hongdae" },
    x: 20,
    y: 42,
    badge: 1,
    pin: "shop",
  },
  {
    id: "cafe-inside",
    category: "cafe",
    name: { ko: "역사 내 커피빈 (개찰구 밖)", en: "Coffee Bean (unpaid area)" },
    walk: { ko: "현재 역에서 도보 1분", en: "1 min on foot from here" },
    walkMinutes: 1,
    status: { ko: "영업중 (~22:00)", en: "Open (~22:00)" },
    note: { ko: "대합실 상가 쪽", en: "In the concourse shops" },
    x: 51,
    y: 32,
    badge: 1,
    pin: "cafe",
  },
  {
    id: "cafe-exit9",
    category: "cafe",
    name: { ko: "9번 출구 앞 카페", en: "Cafe by Exit 9" },
    walk: { ko: "도보 3분", en: "3 min on foot" },
    walkMinutes: 3,
    status: { ko: "영업중", en: "Open" },
    note: { ko: "테이크아웃 동선이 짧아요", en: "Quick takeout stop" },
    x: 31,
    y: 56,
    pin: "cafe",
  },
  {
    id: "cv-gs25",
    category: "convenience",
    name: {
      ko: "GS25 홍대입구역점 (개찰구 안)",
      en: "GS25 inside fare gates",
    },
    walk: { ko: "현재 역에서 도보 1분", en: "1 min on foot from here" },
    walkMinutes: 1,
    status: { ko: "영업중 (24시간)", en: "Open 24h" },
    note: { ko: "2호선 승강장 연결 통로", en: "On the Line 2 platform corridor" },
    x: 48,
    y: 38,
    badge: 1,
    pin: "store",
  },
  {
    id: "cv-cu",
    category: "convenience",
    name: { ko: "CU 홍대9번출구점", en: "CU Hongdae Exit 9" },
    walk: { ko: "도보 2분", en: "2 min on foot" },
    walkMinutes: 2,
    status: { ko: "영업중 (24시간)", en: "Open 24h" },
    note: { ko: "9번 출구 나와서 좌측", en: "Left after Exit 9" },
    x: 30,
    y: 26,
    pin: "store",
  },
];

const CITY_BLOCKS = Array.from({ length: 80 }, (_, i) => {
  const col = i % 8;
  const row = Math.floor(i / 8);
  const jitterX = (i * 13) % 9;
  const jitterY = (i * 7) % 8;
  return {
    x: 6 + col * 50 + jitterX,
    y: 4 + row * 42 + jitterY,
    w: 28 + ((i * 5) % 16),
    h: 18 + ((i * 3) % 14),
    r: 3,
  };
});

function t(value: Localized, locale: Locale) {
  return value[locale];
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="#9ca3af" strokeWidth="2" />
      <path
        d="M20 20l-3.5-3.5"
        stroke="#9ca3af"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3 12h18M12 3c2.5 2.8 3.8 6 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-6-3.8-9s1.3-6.2 3.8-9z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function TrainLogo() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#1e3a8a] text-white shadow-sm">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2c-4.6 0-8 1.35-8 4.2V15c0 1.8 1.4 3.3 3.2 3.6V21h-1.4v1.5h5.1V21h2.2v1.5h5.1V21h-1.4v-2.4c1.8-.3 3.2-1.8 3.2-3.6V6.2C20 3.35 16.6 2 12 2zm-4.2 15.1a1.35 1.35 0 1 1 0-2.7 1.35 1.35 0 0 1 0 2.7zm8.4 0a1.35 1.35 0 1 1 0-2.7 1.35 1.35 0 0 1 0 2.7zM18 12.2H6V7.1h12v5.1z" />
      </svg>
    </div>
  );
}

function DropPin({
  icon,
  color = "#2f6bff",
}: {
  icon?: "restroom" | "dot";
  color?: string;
}) {
  return (
    <svg width="22" height="30" viewBox="0 0 22 30" aria-hidden>
      <path
        d="M11 0C5.15 0 0.5 4.65 0.5 10.5 0.5 18.4 11 30 11 30s10.5-11.6 10.5-19.5C21.5 4.65 16.85 0 11 0z"
        fill={color}
      />
      <circle cx="11" cy="10.5" r="5.2" fill="white" />
      {icon === "restroom" ? (
        <g fill={color}>
          <circle cx="11" cy="7.8" r="1.1" />
          <rect x="9.6" y="9.2" width="2.8" height="3.4" rx="0.6" />
        </g>
      ) : (
        <circle cx="11" cy="10.5" r="2.4" fill={color} />
      )}
    </svg>
  );
}

function PharmacyPin({ selected }: { selected?: boolean }) {
  return (
    <div
      className={`flex h-[30px] w-[30px] items-center justify-center rounded-full border-[3px] bg-white shadow-md ${
        selected ? "scale-110 border-[#1d4ed8]" : "border-[#2f6bff]"
      }`}
    >
      <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden>
        <rect x="5.2" y="1.2" width="3.6" height="11.6" rx="0.8" fill="#ef4444" />
        <rect x="1.2" y="5.2" width="11.6" height="3.6" rx="0.8" fill="#ef4444" />
      </svg>
    </div>
  );
}

function CategoryPin({
  emoji,
  selected,
}: {
  emoji: string;
  selected?: boolean;
}) {
  return (
    <div
      className={`flex h-[30px] w-[30px] items-center justify-center rounded-full border-[3px] bg-white text-[13px] shadow-md ${
        selected ? "scale-110 border-[#1d4ed8]" : "border-[#2f6bff]"
      }`}
    >
      {emoji}
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
      className={`inline-block rounded-[6px] bg-[#f1d24f] px-[7px] py-[3px] text-[11px] font-semibold leading-none text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.18)] ${className}`}
    >
      {children}
    </span>
  );
}

function MockMap({
  locale,
  places,
  selectedId,
  onSelect,
  category,
}: {
  locale: Locale;
  places: Place[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  category: CategoryId;
}) {
  const categoryEmoji =
    CATEGORIES.find((item) => item.id === category)?.emoji ?? "📍";

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#eef1f3]">
      <svg
        viewBox="0 0 400 420"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <rect width="400" height="420" fill="#eef1f3" />
        <g stroke="#e2e6ea" strokeWidth="1">
          {Array.from({ length: 18 }).map((_, i) => (
            <line key={`h-${i}`} x1="0" y1={i * 24} x2="400" y2={i * 24} />
          ))}
          {Array.from({ length: 18 }).map((_, i) => (
            <line key={`v-${i}`} x1={i * 24} y1="0" x2={i * 24} y2="420" />
          ))}
        </g>

        {CITY_BLOCKS.map((b, i) => (
          <rect
            key={i}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx={b.r}
            fill="#f7f8f9"
            stroke="#e4e8ec"
            strokeWidth="1"
          />
        ))}

        <g stroke="#d5dbe2" strokeWidth="20" strokeLinecap="square">
          <line x1="-20" y1="96" x2="430" y2="78" />
          <line x1="78" y1="-20" x2="52" y2="450" />
          <line x1="198" y1="-20" x2="238" y2="450" />
          <line x1="-20" y1="248" x2="430" y2="226" />
          <line x1="318" y1="-20" x2="348" y2="450" />
          <line x1="-10" y1="360" x2="430" y2="338" />
        </g>
        <g stroke="#ffffff" strokeWidth="15" strokeLinecap="square">
          <line x1="-20" y1="96" x2="430" y2="78" />
          <line x1="78" y1="-20" x2="52" y2="450" />
          <line x1="198" y1="-20" x2="238" y2="450" />
          <line x1="-20" y1="248" x2="430" y2="226" />
          <line x1="318" y1="-20" x2="348" y2="450" />
          <line x1="-10" y1="360" x2="430" y2="338" />
        </g>

        <path
          d="M170 62 C 250 78, 330 118, 430 148"
          fill="none"
          stroke="#77c4a3"
          strokeWidth="10"
          strokeLinecap="round"
        />

        <g transform="translate(200 168) rotate(-16)">
          <rect x="-240" y="-8" width="170" height="16" rx="8" fill="#2fba4e" />
          <rect x="-78" y="-18" width="210" height="36" rx="11" fill="#2fba4e" />
          <rect x="124" y="-8" width="190" height="16" rx="8" fill="#2fba4e" />
          <rect x="-64" y="-3.5" width="182" height="7" rx="3.5" fill="#e7f8ed" />
        </g>

        <path
          d="M 128 178 C 176 148, 238 140, 286 158 C 318 174, 322 208, 286 232 C 248 256, 196 250, 164 222 C 142 202, 134 188, 128 178"
          fill="none"
          stroke="#3b6dff"
          strokeWidth="2.3"
          strokeLinejoin="round"
        />
      </svg>

      <div className="pointer-events-none absolute right-[16%] top-[12%]">
        <span className="rounded-md bg-[#6fbf9a] px-2 py-[3px] text-[11px] font-semibold text-white shadow-sm">
          {t(COPY.gyeongui, locale)}
        </span>
      </div>

      <div className="pointer-events-none absolute left-[57%] top-[27%] z-10 -translate-x-1/2">
        <span className="text-[13px] font-extrabold tracking-tight text-neutral-900 [text-shadow:0_0_5px_#fff,0_0_8px_#fff]">
          {t(COPY.station, locale)}
        </span>
      </div>

      <div className="pointer-events-none absolute left-[49%] top-[40%] z-10 -translate-x-1/2">
        <YellowLabel>{t(COPY.insidePaid, locale)}</YellowLabel>
      </div>

      {EXITS.map((exit) => (
        <div
          key={exit.id}
          className="pointer-events-none absolute z-10"
          style={{ left: `${exit.x}%`, top: `${exit.y}%` }}
        >
          <YellowLabel>{t(exit.label, locale)}</YellowLabel>
        </div>
      ))}

      {MAP_LABELS.map((label) => (
        <div
          key={label.text}
          className="pointer-events-none absolute whitespace-pre text-neutral-400"
          style={{
            left: `${label.x}%`,
            top: `${label.y}%`,
            fontSize: `${label.size}px`,
            lineHeight: 1.25,
          }}
        >
          {label.text}
        </div>
      ))}

      <div className="absolute left-[50%] top-[31%] z-20 -translate-x-1/2">
        <DropPin icon="restroom" />
      </div>
      <div className="absolute left-[61%] top-[24%] z-20">
        <div className="relative">
          <DropPin />
          <NumberBadge n={2} />
        </div>
      </div>
      <div className="absolute left-[70%] top-[14%] z-20">
        <DropPin />
      </div>

      {places.map((place) => (
        <button
          key={place.id}
          type="button"
          className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${place.x}%`, top: `${place.y}%` }}
          onClick={() => onSelect(place.id)}
          aria-label={t(place.name, locale)}
        >
          <span className="relative inline-flex">
            {place.pin === "pharmacy" ? (
              <PharmacyPin selected={selectedId === place.id} />
            ) : (
              <CategoryPin
                emoji={categoryEmoji}
                selected={selectedId === place.id}
              />
            )}
            {place.badge ? <NumberBadge n={place.badge} /> : null}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>("ko");
  const [category, setCategory] = useState<CategoryId>("pharmacy");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>("ph-inside");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PLACES.filter((place) => {
      if (place.category !== category) return false;
      if (!q) return true;
      return `${t(place.name, locale)} ${t(place.note, locale)}`
        .toLowerCase()
        .includes(q);
    }).sort((a, b) => a.walkMinutes - b.walkMinutes);
  }, [category, locale, query]);

  return (
    <div className="flex min-h-dvh justify-center bg-[#e8eaed]">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-white shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <header className="flex items-center justify-between px-4 pb-2 pt-3">
          <div className="flex items-center gap-2">
            <TrainLogo />
            <h1 className="text-[18px] font-bold tracking-tight text-neutral-900">
              {t(COPY.title, locale)}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setLocale((prev) => (prev === "ko" ? "en" : "ko"))}
            className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-medium text-neutral-600"
            aria-label="Change language"
          >
            <GlobeIcon />
            KO/EN
          </button>
        </header>

        <div className="px-4">
          <label className="flex items-center gap-2 rounded-full bg-[#f3f4f6] px-3.5 py-[11px]">
            <SearchIcon />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t(COPY.search, locale)}
              className="w-full bg-transparent text-[13px] text-neutral-800 outline-none placeholder:text-neutral-400"
            />
          </label>
        </div>

        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4 pb-3">
          {CATEGORIES.map((item) => {
            const selected = item.id === category;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCategory(item.id);
                  const first = PLACES.find((place) => place.category === item.id);
                  setSelectedId(first?.id ?? null);
                }}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border bg-white px-3.5 py-[7px] text-[13px] font-medium ${
                  selected
                    ? "border-[#3b82f6] text-neutral-900 shadow-[0_0_0_1px_#3b82f6]"
                    : "border-neutral-200 text-neutral-700"
                }`}
              >
                {t(item.name, locale)}
                <span className="text-[14px]">{item.emoji}</span>
              </button>
            );
          })}
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden">
          <MockMap
            locale={locale}
            places={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
            category={category}
          />

          <section className="absolute inset-x-0 bottom-0 z-40 rounded-t-[22px] bg-white px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_28px_rgba(15,23,42,0.08)]">
            <div className="mb-3 flex justify-center">
              <span className="h-[4px] w-10 rounded-full bg-neutral-300" />
            </div>
            <div className="mb-3 flex items-end justify-between gap-3">
              <h2 className="text-[18px] font-bold text-neutral-900">
                {t(COPY.smartList, locale)}
              </h2>
              <p className="shrink-0 text-[12px] text-neutral-400">
                {t(COPY.sortHint, locale)}
              </p>
            </div>
            <div className="flex max-h-[188px] flex-col gap-2.5 overflow-y-auto pb-1">
              {filtered.length === 0 ? (
                <p className="rounded-2xl border border-neutral-100 px-4 py-8 text-center text-sm text-neutral-400">
                  {t(COPY.empty, locale)}
                </p>
              ) : (
                filtered.map((place) => {
                  const active = place.id === selectedId;
                  return (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => setSelectedId(place.id)}
                      className={`rounded-[18px] border bg-white px-4 py-3.5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${
                        active ? "border-neutral-200" : "border-neutral-100"
                      }`}
                    >
                      <p className="text-[15px] font-bold leading-snug text-neutral-900">
                        {
                          CATEGORIES.find((item) => item.id === place.category)
                            ?.emoji
                        }{" "}
                        {t(place.name, locale)}
                      </p>
                      <p className="mt-1.5 text-[13px] text-neutral-500">
                        {t(place.walk, locale)}
                        <span className="mx-1.5 text-neutral-300">|</span>
                        {t(place.status, locale)}
                      </p>
                      <p className="mt-1 text-[13px] text-neutral-400">
                        {t(place.note, locale)}
                      </p>
                    </button>
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
