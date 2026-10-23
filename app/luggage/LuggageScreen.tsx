"use client";

import { useState, type ReactNode } from "react";
import AppHeader from "../_components/AppHeader";
import BottomNav from "../_components/BottomNav";
import { LineIcon } from "../_components/LineBadges";
import StationSearch from "../_components/StationSearch";
import { useLocale } from "../_lib/locale";
import {
  LOCKER_HOURS,
  LOCKER_MAX_DAYS,
  LOCKER_SIZES,
  LUGGAGE_DESKS,
  LUGGAGE_HOURS,
  LUGGAGE_LINKS,
  LUGGAGE_SIZES,
  STORAGE_DISCOUNTS,
  STORAGE_ROOMS,
  STORAGE_SITES,
  formatWon,
  isWeekend,
  lockerFee,
  luggageFee,
  recommendLuggage,
  stationDesk,
  stationLockers,
  stationStorage,
  type BagSize,
  type LockerSize,
  type LuggagePick,
  type LuggagePlan,
  type LuggageSize,
} from "../_lib/luggage";
import { useNow } from "../_lib/reports";
import { LOCKER_DATA_DATE } from "../_lib/stationLockers";
import { stationKeys, t, type Locale, type Localized, type StationOption } from "../_lib/stations";
import { LOCATION_ISSUE_COPY, useStationTracker } from "../_lib/useStationTracker";
import { LUGGAGE_TITLE, LuggageIcon } from "./header";

const HOUR_CHOICES = [2, 4, 6, 8, 12] as const;
const LATE_HOUR = 21;

const COPY = {
  search: { ko: "다른 역 검색", en: "Search another station", zh: "搜索其他车站", ja: "他の駅を検索" },
  nearest: { ko: "가장 가까운 역", en: "Nearest station" },
  selected: { ko: "선택한 역", en: "Selected station" },
  backToMe: { ko: "내 위치로", en: "Use my location" },
  locating: { ko: "현재 위치를 찾는 중…", en: "Finding your location…" },
  locatingHint: {
    ko: "위에서 역을 검색해도 돼요. 요금·추천은 아래에서 바로 볼 수 있어요.",
    en: "You can also search a station above. Fees and tips are below.",
  },
  retry: { ko: "다시 시도", en: "Retry" },
  lockerCount: { ko: "또타라커 {n}곳", en: "{n} T-Locker banks" },
  slotCount: { ko: "{n}칸", en: "{n} slots" },
  noLocker: { ko: "또타라커 정보 없음", en: "No T-Locker data" },
  deskHere: { ko: "또타러기지 있음", en: "T-Luggage desk here" },
  storageHere: { ko: "또타스토리지 있음", en: "T-Storage here" },

  finderTitle: { ko: "나에게 맞는 보관 찾기", en: "Find the right storage" },
  planQuestion: { ko: "얼마나 맡기세요?", en: "How long?" },
  bagQuestion: { ko: "짐 크기는요?", en: "How big is it?" },
  pickBadge: { ko: "추천", en: "Pick" },

  lockersTitle: { ko: "{station} 또타라커 위치", en: "T-Lockers at {station}" },
  insideGate: { ko: "개찰구 안", en: "Inside gate" },
  noLockerHere: {
    ko: "이 역엔 서울교통공사 또타라커 정보가 없어요. 코레일·민자 노선 역은 공공데이터에 빠져 있어요. 위에서 근처 다른 역을 검색해 보세요.",
    en: "No Seoul Metro T-Locker data for this station. Korail and private-line stations aren't in the open data, so try a nearby station above.",
  },
  lockerWeb: { ko: "앱 없이 웹으로 맡기기", en: "Store via web, no app" },
  lockerWebHint: {
    ko: "보관함의 QR을 찍거나 웹에서 바로 결제해요. 빈 칸 수는 현장 화면에서 확인해 주세요.",
    en: "Scan the locker's QR or pay on the web. Check free slots on the locker screen.",
  },
  lateWarning: {
    ko: "또타라커는 {open}~{close}시에만 넣고 찾을 수 있어요. 지금 맡기면 {close}시 전에 꼭 찾으세요!",
    en: "T-Locker only opens {open}:00–{close}:00. If you store now, pick up before {close}:00!",
  },

  feeTitle: { ko: "요금 계산기", en: "Fee calculator" },
  weekday: { ko: "평일", en: "Weekday" },
  weekend: { ko: "주말·공휴일", en: "Weekend/holiday" },
  hoursUnit: { ko: "{n}시간", en: "{n}h" },
  feeNote: {
    ko: "두 서비스 모두 4시간 기본요금 + 이후 1시간마다 추가요금이에요.",
    en: "Both charge a 4-hour base fee plus an hourly fee after that.",
  },
  tLocker: { ko: "또타라커", en: "T-Locker" },
  tLuggage: { ko: "또타러기지", en: "T-Luggage" },
  storage: { ko: "또타스토리지", en: "T-Storage" },
  selfService: { ko: "무인 보관함", en: "self-service" },
  staffed: { ko: "직원이 보관", en: "staffed" },

  deskTitle: { ko: "또타러기지 · 보관과 당일 배송", en: "T-Luggage · storage & same-day delivery" },
  deskIntro: {
    ko: "직원이 직접 맡아줘서 대형 캐리어도 OK. 숙소·인천공항으로 당일 배송도 돼요.",
    en: "Staff take your bags, even large suitcases, and can deliver them to your hotel or Incheon Airport the same day.",
  },
  deskHereNote: { ko: "이 역에 있어요", en: "At this station" },
  deliveryCity: { ko: "서울 시내 당일", en: "Seoul same-day" },
  deliveryAirport: { ko: "인천공항", en: "Incheon Airport" },
  deskBook: { ko: "또타러기지 예약하기", en: "Book T-Luggage" },
  from: { ko: "{price}부터", en: "from {price}" },

  storageTitle: { ko: "또타스토리지 · 한 달 이상 보관", en: "T-Storage · monthly storage" },
  storageIntro: {
    ko: "역 안 개인 창고예요. 이사·계절옷·캠핑용품처럼 오래 둘 짐에 맞아요. 또타라커 앱에서 신청해요.",
    en: "Private rooms inside stations for moving boxes, seasonal clothes or gear. Apply in the T-Locker app.",
  },
  perMonth: { ko: "월", en: "/mo" },
  discount: { ko: "{m}개월 {r}% 할인", en: "{m} mo −{r}%" },
  storageHereNote: { ko: "이 역에 있어요", en: "At this station" },

  tipsTitle: { ko: "맡기기 전에 꼭 확인", en: "Before you store" },
  tips: [
    {
      ko: `또타라커: ${LOCKER_HOURS.open}~${LOCKER_HOURS.close}시에만 넣고 찾을 수 있고, 최대 ${LOCKER_MAX_DAYS}일까지 보관돼요.`,
      en: `T-Locker: store and pick up ${LOCKER_HOURS.open}:00–${LOCKER_HOURS.close}:00 only, up to ${LOCKER_MAX_DAYS} days.`,
    },
    {
      ko: `또타러기지: 매일 ${LUGGAGE_HOURS.open}~${LUGGAGE_HOURS.close}시 운영해요.`,
      en: `T-Luggage desks: open daily ${LUGGAGE_HOURS.open}:00–${LUGGAGE_HOURS.close}:00.`,
    },
    {
      ko: "귀중품·현금, 음식물, 동물, 위험물은 맡길 수 없어요.",
      en: "No valuables or cash, food, animals or hazardous items.",
    },
    {
      ko: "대형 칸은 역마다 몇 칸뿐이라 주말·관광지 역은 일찍 차요.",
      en: "Each station has only a few large slots; they fill early at weekends and tourist stops.",
    },
  ] satisfies Localized[],
  callCenter: { ko: "보관함 고장·분실 문의 1877-1265", en: "Locker help line 1877-1265" },

  sourceNote: {
    ko: `보관함 위치: 서울교통공사 물품보관함 위치정보(공공데이터포털, ${LOCKER_DATA_DATE} 기준, 1~8호선·9호선 2·3단계). 요금·운영시간·러기지·스토리지: 각 서비스 공식 안내 기준이며 바뀔 수 있어요.`,
    en: `Locker locations: Seoul Metro open data (as of ${LOCKER_DATA_DATE}, Lines 1–8 and Line 9 phases 2–3). Fees, hours, T-Luggage and T-Storage: official service pages; subject to change.`,
  },
};

const PLAN_OPTIONS: { id: LuggagePlan; emoji: string; label: Localized }[] = [
  { id: "hours", emoji: "⏱️", label: { ko: "몇 시간 (오늘 찾기)", en: "A few hours" } },
  { id: "send", emoji: "🚚", label: { ko: "숙소·공항으로 보내기", en: "Send to hotel/airport" } },
  { id: "months", emoji: "📦", label: { ko: "한 달 이상", en: "A month or more" } },
];

const BAG_OPTIONS: { id: BagSize; emoji: string; label: Localized }[] = [
  { id: "bag", emoji: "🎒", label: { ko: "백팩·쇼핑백", en: "Backpack/bags" } },
  { id: "carryOn", emoji: "🧳", label: { ko: "기내용 캐리어", en: "Carry-on" } },
  { id: "large", emoji: "🛄", label: { ko: "대형 캐리어", en: "Large suitcase" } },
];

const SERVICE_ACCENT = { tLocker: "#22a559", tLuggage: "#2563eb", storage: "#7c3aed" } as const;

function fill(template: Localized, locale: Locale, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    t(template, locale),
  );
}

function pickCopy(pick: LuggagePick, plan: LuggagePlan, hasDeskHere: boolean, locale: Locale) {
  const ko = locale === "ko";
  if (pick.service === "storage") {
    return {
      title: t(COPY.storage, locale),
      reason: ko
        ? "몇 주 이상 둘 짐이면 역 안 개인 창고가 보관함보다 싸고 편해요."
        : "For weeks or more, a private room in the station beats lockers.",
      price: ko
        ? `월 ${formatWon(STORAGE_ROOMS.small.monthly)}부터 · 장기 결제 최대 20% 할인`
        : `From ${formatWon(STORAGE_ROOMS.small.monthly)}/month · up to 20% off long-term`,
    };
  }
  if (pick.service === "tLuggage") {
    const size = LUGGAGE_SIZES[pick.luggageSize ?? "S"];
    if (plan === "send") {
      return {
        title: `${t(COPY.tLuggage, locale)} ${ko ? "배송" : "delivery"}`,
        reason: ko
          ? "6개 역 데스크에 맡기면 숙소·인천공항으로 당일 배송돼요. 빈손으로 여행하세요."
          : "Drop bags at one of 6 desks and they reach your hotel or Incheon Airport the same day.",
        price: ko
          ? `${size.fits.ko} · 서울 당일 ${formatWon(size.city[0])} · 공항 ${formatWon(size.airport[0])} (평일)`
          : `${size.fits.en} · Seoul ${formatWon(size.city[0])} · airport ${formatWon(size.airport[0])} (weekday)`,
      };
    }
    return {
      title: `${t(COPY.tLuggage, locale)} ${size.label.ko}`,
      reason: ko
        ? `${hasDeskHere ? "이 역에 또타러기지가 있어요. " : ""}직원이 맡아줘서 대형 칸이 꽉 찼을 걱정이 없어요.`
        : `${hasDeskHere ? "There's a desk here. " : ""}Staff hold big bags, so no worrying about full large lockers.`,
      price: ko
        ? `4시간 ${formatWon(size.base[0])} (주말 ${formatWon(size.base[1])})`
        : `4 h ${formatWon(size.base[0])} (weekend ${formatWon(size.base[1])})`,
    };
  }
  const sizeId: LockerSize = pick.lockerSize ?? "M";
  const size = LOCKER_SIZES[sizeId];
  const reasons: Record<LockerSize, Localized> = {
    S: { ko: "백팩·쇼핑백은 소형 칸이면 충분해요.", en: "A small slot fits backpacks and shopping bags." },
    M: { ko: "기내용 캐리어는 중형 칸에 들어가요.", en: "A carry-on fits a medium slot." },
    L: {
      ko: "대형 캐리어는 대형 칸으로. 역마다 몇 칸뿐이라 일찍 차요.",
      en: "Use a large slot; there are only a few per station.",
    },
  };
  return {
    title: `${t(COPY.tLocker, locale)} ${t(size.label, locale)} (${size.dims})`,
    reason: t(reasons[sizeId], locale),
    price: ko
      ? `4시간 ${formatWon(size.base[0])} (주말 ${formatWon(size.base[1])}) · 이후 1시간 +${formatWon(size.extra)}`
      : `4 h ${formatWon(size.base[0])} (weekend ${formatWon(size.base[1])}) · +${formatWon(size.extra)}/h after`,
  };
}

function OptionChips<T extends string>({
  options,
  value,
  onChange,
  locale,
}: {
  options: { id: T; emoji: string; label: Localized }[];
  value: T;
  onChange: (next: T) => void;
  locale: Locale;
}) {
  return (
    <div className="mt-1.5 grid grid-cols-3 gap-1.5">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={active}
            className={`flex flex-col items-center gap-0.5 rounded-xl border px-1.5 py-2 text-[11.5px] font-bold leading-tight ${
              active ? "border-[#22a559] bg-[#eefaf2] text-[#15803d]" : "border-neutral-200 bg-white text-neutral-700"
            }`}
          >
            <span className="text-[18px]" aria-hidden>
              {option.emoji}
            </span>
            {t(option.label, locale)}
          </button>
        );
      })}
    </div>
  );
}

function Section({ title, emoji, children, id }: { title: string; emoji: string; children: ReactNode; id?: string }) {
  return (
    <section
      id={id}
      className="mt-3 rounded-2xl border border-line bg-surface px-3.5 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
    >
      <h2 className="text-[15px] font-extrabold tracking-tight text-neutral-900">
        <span aria-hidden>{emoji} </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function ExternalButton({ href, color, children }: { href: string; color: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mt-2.5 flex items-center justify-center gap-1 rounded-xl px-3 py-2.5 text-[13px] font-extrabold text-white shadow-sm transition active:scale-[0.98]"
      style={{ backgroundColor: color }}
    >
      {children}
      <span aria-hidden>↗</span>
    </a>
  );
}

function AppLinks({ locale }: { locale: Locale }) {
  return (
    <div className="mt-2.5 grid grid-cols-2 gap-1.5">
      <ExternalButton href={LUGGAGE_LINKS.appGooglePlay} color={SERVICE_ACCENT.storage}>
        {locale === "ko" ? "또타라커 앱 (Android)" : "T-Locker app (Android)"}
      </ExternalButton>
      <ExternalButton href={LUGGAGE_LINKS.appAppStore} color={SERVICE_ACCENT.storage}>
        {locale === "ko" ? "또타라커 앱 (iPhone)" : "T-Locker app (iPhone)"}
      </ExternalButton>
    </div>
  );
}

function FeeRow({ label, sub, price, highlight }: { label: ReactNode; sub: string; price: number; highlight: boolean }) {
  return (
    <li className={`flex items-center gap-2 px-2 py-1.5 ${highlight ? "rounded-lg bg-[#eefaf2]" : ""}`}>
      <span className="min-w-0 flex-1 text-[12.5px] font-bold text-neutral-800">
        {label}
        <span className="ml-1 text-[11px] font-semibold text-neutral-400">{sub}</span>
      </span>
      <span className="shrink-0 text-[13px] font-extrabold tabular-nums text-neutral-900">{formatWon(price)}</span>
    </li>
  );
}

export default function LuggageScreen({
  initialStation,
  follow,
}: {
  initialStation: StationOption | null;
  follow: boolean;
}) {
  const locale = useLocale();
  const now = useNow();
  const [picked, setPicked] = useState<StationOption | null>(follow ? null : initialStation);
  const [query, setQuery] = useState("");
  const [plan, setPlan] = useState<LuggagePlan>("hours");
  const [bag, setBag] = useState<BagSize>("carryOn");
  const [hours, setHours] = useState<number>(4);
  const [weekendPick, setWeekendPick] = useState<boolean | null>(null);

  const tracker = useStationTracker({ autoStart: follow || !initialStation, quickStart: true });
  const current = picked ?? tracker.nearest ?? (follow ? initialStation : null);
  const live = !picked && tracker.tracking && tracker.nearest !== null;

  const lockers = current ? stationLockers(current) : [];
  const desk = current ? stationDesk(current) : null;
  const storage = current ? stationStorage(current) : null;
  const totalSlots = lockers.reduce((sum, locker) => sum + (locker.slots ?? 0), 0);
  const keys = current ? stationKeys(current) : [];

  const pick = recommendLuggage(plan, bag, current);
  const pickText = pickCopy(pick, plan, desk !== null, locale);

  const weekend = weekendPick ?? (now !== null && isWeekend(new Date(now)));
  const hour = now !== null ? new Date(now).getHours() : null;
  const late = hour !== null && (hour >= LATE_HOUR || hour < LOCKER_HOURS.open);

  function selectStation(next: StationOption) {
    setPicked(next);
    setQuery("");
    if (tracker.tracking) tracker.stop();
    else tracker.dismissIssue();
  }

  function backToMyStation() {
    setPicked(null);
    tracker.start();
  }

  const pickHref =
    pick.service === "tLocker" ? LUGGAGE_LINKS.tLockerWeb : pick.service === "tLuggage" ? LUGGAGE_LINKS.tLuggage : null;

  return (
    <div className="flex min-h-dvh justify-center bg-frame">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-app shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <AppHeader backHref="/" title={LUGGAGE_TITLE} icon={<LuggageIcon />} />

        <StationSearch
          className="relative z-20 mx-4"
          locale={locale}
          query={query}
          onQueryChange={setQuery}
          onSelect={selectStation}
          currentKey={current?.key ?? null}
          placeholder={t(COPY.search, locale)}
          near={tracker.position}
        />

        <main className="no-scrollbar flex-1 overflow-y-auto px-4 pb-5 pt-1">
          {current ? (
            <section
              className="mt-2 rounded-2xl px-4 py-3.5 text-white shadow-[0_6px_18px_rgba(15,23,42,0.14)]"
              style={{ background: `linear-gradient(135deg, ${current.color}, #14532d)` }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] font-semibold text-white/80">
                  📍 {t(live ? COPY.nearest : COPY.selected, locale)}
                </p>
                {picked ? (
                  <button
                    type="button"
                    onClick={backToMyStation}
                    className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold backdrop-blur"
                  >
                    {t(COPY.backToMe, locale)}
                  </button>
                ) : null}
              </div>
              <h1 className="mt-0.5 text-[22px] font-extrabold leading-tight tracking-tight">
                {t(current.name, locale)}
              </h1>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[11.5px] font-bold">
                <span className="rounded-full bg-white/20 px-2 py-0.5">
                  🔐{" "}
                  {lockers.length > 0
                    ? `${fill(COPY.lockerCount, locale, { n: lockers.length })}${
                        totalSlots > 0 ? ` · ${fill(COPY.slotCount, locale, { n: totalSlots })}+` : ""
                      }`
                    : t(COPY.noLocker, locale)}
                </span>
                {desk ? <span className="rounded-full bg-white/90 px-2 py-0.5 text-[#1d4ed8]">🙋 {t(COPY.deskHere, locale)}</span> : null}
                {storage ? (
                  <span className="rounded-full bg-white/90 px-2 py-0.5 text-[#6d28d9]">📦 {t(COPY.storageHere, locale)}</span>
                ) : null}
              </div>
            </section>
          ) : (
            <section className="mt-2 rounded-2xl border border-line bg-surface px-4 py-5 text-center">
              <p className="text-[15px] font-extrabold text-neutral-900">
                <span aria-hidden>📍 </span>
                {t(COPY.locating, locale)}
              </p>
              <p className="mt-1.5 text-[12px] text-neutral-500">
                {tracker.issue ? t(LOCATION_ISSUE_COPY[tracker.issue], locale) : t(COPY.locatingHint, locale)}
              </p>
              {tracker.issue ? (
                <button
                  type="button"
                  onClick={backToMyStation}
                  className="mt-3 rounded-full border border-neutral-200 px-3 py-1.5 text-[12px] font-semibold text-neutral-700"
                >
                  {t(COPY.retry, locale)}
                </button>
              ) : null}
            </section>
          )}

          <Section emoji="🧭" title={t(COPY.finderTitle, locale)}>
            <p className="mt-2 text-[12px] font-bold text-neutral-500">{t(COPY.planQuestion, locale)}</p>
            <OptionChips options={PLAN_OPTIONS} value={plan} onChange={setPlan} locale={locale} />
            {plan !== "months" ? (
              <>
                <p className="mt-2.5 text-[12px] font-bold text-neutral-500">{t(COPY.bagQuestion, locale)}</p>
                <OptionChips options={BAG_OPTIONS} value={bag} onChange={setBag} locale={locale} />
              </>
            ) : null}
            <div
              className="mt-3 rounded-xl border-2 px-3 py-2.5"
              style={{ borderColor: SERVICE_ACCENT[pick.service], backgroundColor: `${SERVICE_ACCENT[pick.service]}0d` }}
            >
              <p className="flex items-center gap-1.5 text-[14px] font-extrabold text-neutral-900">
                <span
                  className="shrink-0 rounded-full px-1.5 py-[1px] text-[10px] font-bold text-white"
                  style={{ backgroundColor: SERVICE_ACCENT[pick.service] }}
                >
                  {t(COPY.pickBadge, locale)}
                </span>
                {pickText.title}
              </p>
              <p className="mt-1 text-[12px] leading-snug text-neutral-700">{pickText.reason}</p>
              <p className="mt-1 text-[12px] font-bold text-neutral-900">💰 {pickText.price}</p>
              {pick.service === "tLocker" && current && lockers.length === 0 ? (
                <p className="mt-1 text-[11.5px] font-semibold text-[#b45309]">⚠️ {t(COPY.noLockerHere, locale)}</p>
              ) : null}
              {pickHref ? (
                <ExternalButton href={pickHref} color={SERVICE_ACCENT[pick.service]}>
                  {t(pick.service === "tLocker" ? COPY.lockerWeb : COPY.deskBook, locale)}
                </ExternalButton>
              ) : (
                <AppLinks locale={locale} />
              )}
            </div>
          </Section>

          {current ? (
            <Section emoji="🔐" title={fill(COPY.lockersTitle, locale, { station: t(current.name, locale) })}>
              {late ? (
                <p className="mt-2 rounded-xl bg-[#fff3c4] px-2.5 py-2 text-[12px] font-bold leading-snug text-[#92400e]">
                  🌙 {fill(COPY.lateWarning, locale, { open: LOCKER_HOURS.open, close: LOCKER_HOURS.close })}
                </p>
              ) : null}
              {lockers.length > 0 ? (
                <ul className="mt-1 divide-y divide-neutral-100">
                  {lockers.map((locker, index) => (
                    <li key={`${locker.line}-${index}`} className="flex items-start gap-2 py-2">
                      <LineIcon line={locker.line} locale={locale} size="sm" className="mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold leading-snug text-neutral-900">
                          {locker.floor ? (
                            <span className="mr-1 rounded bg-neutral-100 px-1 py-[1px] text-[11px] font-extrabold text-neutral-600">
                              {locker.floor}
                            </span>
                          ) : null}
                          {locker.detail}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] font-semibold text-neutral-500">
                          {locker.slots ? <span>{fill(COPY.slotCount, locale, { n: locker.slots })}</span> : null}
                          {locker.insideGate ? (
                            <span className="rounded-full bg-[#e8f0ff] px-1.5 text-[10px] font-bold text-[#2563eb]">
                              {t(COPY.insideGate, locale)}
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[12px] leading-relaxed text-neutral-500">{t(COPY.noLockerHere, locale)}</p>
              )}
              {lockers.length > 0 ? (
                <>
                  <ExternalButton href={LUGGAGE_LINKS.tLockerWeb} color={SERVICE_ACCENT.tLocker}>
                    {t(COPY.lockerWeb, locale)}
                  </ExternalButton>
                  <p className="mt-1.5 text-[11px] leading-snug text-neutral-500">{t(COPY.lockerWebHint, locale)}</p>
                </>
              ) : null}
            </Section>
          ) : null}

          <Section emoji="💰" title={t(COPY.feeTitle, locale)}>
            <div className="mt-2 flex gap-1.5">
              {[false, true].map((value) => (
                <button
                  key={String(value)}
                  type="button"
                  onClick={() => setWeekendPick(value)}
                  aria-pressed={weekend === value}
                  className={`flex-1 rounded-full border py-1.5 text-[12px] font-bold ${
                    weekend === value
                      ? "border-[#1e293b] bg-[#1e293b] text-white"
                      : "border-neutral-200 bg-white text-neutral-700"
                  }`}
                >
                  {t(value ? COPY.weekend : COPY.weekday, locale)}
                </button>
              ))}
            </div>
            <div className="no-scrollbar mt-1.5 flex gap-1.5 overflow-x-auto">
              {HOUR_CHOICES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setHours(value)}
                  aria-pressed={hours === value}
                  className={`shrink-0 rounded-full border px-3 py-1 text-[12px] font-bold ${
                    hours === value
                      ? "border-[#22a559] bg-[#eefaf2] text-[#15803d]"
                      : "border-neutral-200 bg-white text-neutral-700"
                  }`}
                >
                  {fill(COPY.hoursUnit, locale, { n: value })}
                </button>
              ))}
            </div>

            <p className="mt-3 text-[12px] font-extrabold text-[#15803d]">
              🔐 {t(COPY.tLocker, locale)} <span className="font-semibold text-neutral-400">· {t(COPY.selfService, locale)}</span>
            </p>
            <ul className="mt-0.5">
              {(Object.keys(LOCKER_SIZES) as LockerSize[]).map((size) => (
                <FeeRow
                  key={size}
                  label={t(LOCKER_SIZES[size].label, locale)}
                  sub={LOCKER_SIZES[size].dims}
                  price={lockerFee(size, hours, weekend)}
                  highlight={pick.service === "tLocker" && pick.lockerSize === size}
                />
              ))}
            </ul>
            <p className="mt-2 text-[12px] font-extrabold text-[#1d4ed8]">
              🙋 {t(COPY.tLuggage, locale)} <span className="font-semibold text-neutral-400">· {t(COPY.staffed, locale)}</span>
            </p>
            <ul className="mt-0.5">
              {(Object.keys(LUGGAGE_SIZES) as LuggageSize[]).map((size) => (
                <FeeRow
                  key={size}
                  label={t(LUGGAGE_SIZES[size].label, locale)}
                  sub={t(LUGGAGE_SIZES[size].fits, locale)}
                  price={luggageFee(size, hours, weekend)}
                  highlight={pick.service === "tLuggage" && plan === "hours" && pick.luggageSize === size}
                />
              ))}
            </ul>
            <p className="mt-2 text-[11px] leading-snug text-neutral-500">{t(COPY.feeNote, locale)}</p>
          </Section>

          <Section emoji="🙋" title={t(COPY.deskTitle, locale)}>
            <p className="mt-1.5 text-[12px] leading-snug text-neutral-600">{t(COPY.deskIntro, locale)}</p>
            <ul className="mt-2 grid grid-cols-2 gap-1.5">
              {LUGGAGE_DESKS.map((item) => {
                const here = keys.includes(item.station);
                return (
                  <li
                    key={item.station}
                    className={`rounded-xl border px-2 py-1.5 ${
                      here ? "border-[#2563eb] bg-[#eef4ff]" : "border-neutral-200 bg-white"
                    }`}
                  >
                    <p className="flex items-center gap-1 text-[12.5px] font-extrabold text-neutral-900">
                      <LineIcon line={item.line} locale={locale} size="xs" />
                      {item.station}
                    </p>
                    <p className="mt-0.5 text-[10.5px] font-semibold text-neutral-500">{t(item.where, locale)}</p>
                    {here ? (
                      <p className="mt-0.5 text-[10.5px] font-bold text-[#2563eb]">{t(COPY.deskHereNote, locale)}</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-center">
              <div className="rounded-xl bg-[#f3f6fb] px-2 py-2">
                <p className="text-[11px] font-bold text-neutral-500">🚚 {t(COPY.deliveryCity, locale)}</p>
                <p className="mt-0.5 text-[13px] font-extrabold text-neutral-900">
                  {fill(COPY.from, locale, { price: formatWon(LUGGAGE_SIZES.S.city[0]) })}
                </p>
              </div>
              <div className="rounded-xl bg-[#f3f6fb] px-2 py-2">
                <p className="text-[11px] font-bold text-neutral-500">✈️ {t(COPY.deliveryAirport, locale)}</p>
                <p className="mt-0.5 text-[13px] font-extrabold text-neutral-900">
                  {fill(COPY.from, locale, { price: formatWon(LUGGAGE_SIZES.S.airport[0]) })}
                </p>
              </div>
            </div>
            <ExternalButton href={LUGGAGE_LINKS.tLuggage} color={SERVICE_ACCENT.tLuggage}>
              {t(COPY.deskBook, locale)}
            </ExternalButton>
          </Section>

          <Section emoji="📦" title={t(COPY.storageTitle, locale)}>
            <p className="mt-1.5 text-[12px] leading-snug text-neutral-600">{t(COPY.storageIntro, locale)}</p>
            <ul className="mt-2 grid grid-cols-3 gap-1.5 text-center">
              {Object.values(STORAGE_ROOMS).map((room) => (
                <li key={room.monthly} className="rounded-xl bg-[#f5f1ff] px-1.5 py-2">
                  <p className="text-[12.5px] font-extrabold text-[#6d28d9]">{t(room.label, locale)}</p>
                  <p className="text-[10px] font-semibold text-neutral-500">{t(room.size, locale)}</p>
                  <p className="mt-0.5 text-[12px] font-extrabold text-neutral-900">
                    {locale === "ko" ? `${t(COPY.perMonth, locale)} ${formatWon(room.monthly)}` : `${formatWon(room.monthly)}${t(COPY.perMonth, locale)}`}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-[11px] font-semibold text-neutral-500">
              {STORAGE_DISCOUNTS.map((item) =>
                fill(COPY.discount, locale, { m: item.months, r: Math.round(item.rate * 100) }),
              ).join(" · ")}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {STORAGE_SITES.map((site) => {
                const here = keys.includes(site.station);
                return (
                  <span
                    key={site.station}
                    title={site.where}
                    className={`flex items-center gap-0.5 rounded-full py-0.5 pl-0.5 pr-2 text-[11px] font-bold ${
                      here ? "bg-[#7c3aed] text-white" : "bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    <LineIcon line={site.line} locale={locale} size="xs" />
                    {site.station.replace(/역$/, "")}
                  </span>
                );
              })}
            </div>
            {storage ? (
              <p className="mt-1.5 text-[11.5px] font-bold text-[#6d28d9]">
                📍 {t(COPY.storageHereNote, locale)} · {storage.where}
              </p>
            ) : null}
            <AppLinks locale={locale} />
          </Section>

          <Section emoji="⚠️" title={t(COPY.tipsTitle, locale)}>
            <ul className="mt-1.5 space-y-1">
              {COPY.tips.map((tip) => (
                <li key={tip.ko} className="flex gap-1.5 text-[12px] leading-snug text-neutral-700">
                  <span className="text-neutral-400" aria-hidden>
                    •
                  </span>
                  {t(tip, locale)}
                </li>
              ))}
            </ul>
            <a
              href={LUGGAGE_LINKS.callCenter}
              className="mt-2 inline-block rounded-full border border-neutral-200 px-3 py-1 text-[12px] font-bold text-neutral-700"
            >
              📞 {t(COPY.callCenter, locale)}
            </a>
          </Section>

          <p className="mt-4 text-[10.5px] leading-relaxed text-neutral-400">{t(COPY.sourceNote, locale)}</p>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
