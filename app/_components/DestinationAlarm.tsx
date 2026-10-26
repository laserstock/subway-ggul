"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PinIcon, RouteIcon } from "./icons";
import LineBadges from "./LineBadges";
import { armArrivalAlarm, cancelArrivalAlarm, useArrivalAlarm } from "../_lib/arrivalAlarm";
import { bareStationName } from "../_lib/arrivalTips";
import { isNativeApp } from "../_lib/native";
import { distanceMeters, kakaoOption, restoreStation, t, type Locale, type Localized, type StationOption } from "../_lib/stations";
import { lineNeighbors, loadLineStations, sameLine, stationLines } from "../_lib/subwayLine";
import { routeHref } from "../route/params";

const COPY = {
  from: { ko: "출발", en: "From", zh: "出发", ja: "出発" },
  to: { ko: "도착", en: "To", zh: "到达", ja: "到着" },
  change: { ko: "변경", en: "Change", zh: "更改", ja: "変更" },
  pick: { ko: "선택", en: "Choose", zh: "选择", ja: "選択" },
  noDestination: { ko: "목적지를 골라 주세요", en: "Pick a stop", zh: "请选择目的地", ja: "目的地を選択" },
  locating: { ko: "위치 찾는 중…", en: "Locating…", zh: "定位中…", ja: "位置を検索中…" },
  noLocation: { ko: "위치 확인", en: "Set location", zh: "确认位置", ja: "位置を確認" },
  correctLocation: { ko: "위치 교정하기", en: "Correct my station", zh: "校正我的车站", ja: "現在の駅を修正" },
  title: {
    ko: "{station} 하차 알림 예약",
    en: "Alert before {station}",
    zh: "预约{station}下车提醒",
    ja: "{station}の降車通知",
  },
  titleEmpty: {
    ko: "목적지 하차 알림 예약",
    en: "Arrival alert",
    zh: "预约下车提醒",
    ja: "降車通知を予約",
  },
  hintPrev: {
    ko: "도착 1역 전({prev})에 진동과 알림으로 100% 알려드려요.",
    en: "We'll buzz and notify you one stop before ({prev}).",
    zh: "到站前一站（{prev}）用振动和通知提醒您。",
    ja: "到着1駅前（{prev}）に振動と通知でお知らせします。",
  },
  hint: {
    ko: "도착 1역 전에 진동과 알림으로 100% 알려드려요.",
    en: "We'll buzz and notify you one stop before.",
    zh: "到站前一站用振动和通知提醒您。",
    ja: "到着1駅前に振動と通知でお知らせします。",
  },
  on: {
    ko: "알림 대기 중 · 앱 화면을 켜 두세요",
    en: "Alert on · keep this screen open",
    zh: "提醒已开启 · 请保持屏幕开启",
    ja: "通知待機中 · 画面をつけたままにしてください",
  },
  onNative: {
    ko: "알림 대기 중 · 앱을 닫아도 알려드려요",
    en: "Alert on · works even with the app closed",
    zh: "提醒已开启 · 关闭应用也会提醒",
    ja: "通知待機中 · アプリを閉じても通知します",
  },
  noSystem: {
    ko: "알림 권한이 없어 앱 안에서 소리·진동으로만 알려드려요",
    en: "Notifications are off, so we'll alert you in the app only",
    zh: "未开启通知权限，仅在应用内用声音和振动提醒",
    ja: "通知が許可されていないため、アプリ内の音と振動でお知らせします",
  },
  toggle: { ko: "하차 알림", en: "Arrival alert", zh: "下车提醒", ja: "降車通知" },
  findRoute: { ko: "최적경로 찾기", en: "Find the best route", zh: "查找最佳路线", ja: "最適ルートを検索" },
} satisfies Record<string, Localized>;

/** Hollow honey ring with a pin: where the rider is now. */
function OriginIcon({ pulse }: { pulse: boolean }) {
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-[1.5px] border-[#f5b800] bg-white text-[#e0a100] ${
        pulse ? "animate-pulse" : ""
      }`}
      aria-hidden
    >
      <PinIcon size={12} />
    </span>
  );
}

/** Solid honey tile with a flag: where the rider gets off. */
function DestinationIcon() {
  return (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] bg-gradient-to-br from-[#ffc83d] to-[#f59e0b] text-white shadow-[0_1px_3px_rgba(146,64,14,0.3)]"
      aria-hidden
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path d="M5.5 21V4" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M5.5 4.5h11.2l-2.6 4 2.6 4H5.5z" fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/** The stop before `destination` when riding from `from` on a shared line; null when it can't be told. */
async function previousStop(destination: StationOption, from: StationOption | null): Promise<StationOption | null> {
  if (!from || bareStationName(from.name.ko) === bareStationName(destination.name.ko)) return null;
  const lines = stationLines(destination).filter((line) => stationLines(from).some((other) => sameLine(line, other)));
  if (lines.length === 0) return null;
  const groups = await Promise.all(
    lines.map((line) => loadLineStations(destination, line).then((stations) => lineNeighbors(destination, stations))),
  );
  const nearest = groups
    .flat()
    .sort((a, b) => distanceMeters(from.center, a.center) - distanceMeters(from.center, b.center))[0];
  return nearest ? kakaoOption(nearest) : null;
}

/** Home hero card: "📍 current ➔ 🚩 destination" route, the arrival-alarm switch and its hint. */
export default function DestinationAlarm({
  target,
  current,
  locating,
  locale,
  onOrigin,
  onChange,
}: {
  /** Suggested destination: the last station viewed, else the first My station. */
  target: StationOption | null;
  current: StationOption | null;
  /** Still looking for the current station (as opposed to having failed). */
  locating: boolean;
  locale: Locale;
  /** Opens the current-station correction sheet. */
  onOrigin: () => void;
  onChange: () => void;
}) {
  const alarm = useArrivalAlarm();
  const alarmStation = useMemo(() => (alarm ? restoreStation(alarm.station) : null), [alarm]);
  const destination = alarmStation ?? target;
  const on = alarm !== null;
  const routeKey = destination ? `${destination.key}|${current?.key ?? ""}` : "";
  const [previous, setPrevious] = useState<{ key: string; station: StationOption | null } | null>(null);
  const prev = previous?.key === routeKey ? previous.station : null;

  useEffect(() => {
    if (!destination) return;
    let alive = true;
    previousStop(destination, current)
      .catch(() => null)
      .then((station) => {
        if (alive) setPrevious({ key: routeKey, station });
      });
    return () => {
      alive = false;
    };
  }, [destination, current, routeKey]);

  function toggle() {
    if (!destination) onChange();
    else if (on) cancelArrivalAlarm();
    else void armArrivalAlarm(destination);
  }

  const name = destination ? t(destination.name, locale) : "";

  return (
    <section className="mt-4 rounded-[20px] border border-[#f5d76e] bg-gradient-to-br from-[#fff8db] to-[#fffdf3] px-4 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
      <div className="rounded-2xl border border-[#f5d76e]/70 bg-white/70 px-3">
        <div className="flex items-center justify-between gap-2 border-b border-dashed border-[#f0d58a] py-2">
          <button
            type="button"
            onClick={onOrigin}
            aria-haspopup="dialog"
            title={t(COPY.correctLocation, locale)}
            className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-1 rounded-lg text-left text-sm text-gray-700 transition active:scale-[0.98]"
          >
            <OriginIcon pulse={!current && locating} />
            <span className="whitespace-nowrap font-semibold text-gray-500">{t(COPY.from, locale)} :</span>
            {current ? (
              <span className="flex flex-wrap items-center gap-1">
                <span className="whitespace-nowrap font-bold">{t(current.name, locale)}</span>
                <LineBadges station={current} locale={locale} size="chip" />
              </span>
            ) : (
              <span className="whitespace-nowrap text-gray-400">
                {t(locating ? COPY.locating : COPY.noLocation, locale)}
              </span>
            )}
          </button>
        </div>
        <div className="flex items-center justify-between gap-2 py-2">
          <button
            type="button"
            onClick={onChange}
            aria-haspopup="dialog"
            className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-1 rounded-lg text-left text-base font-bold text-gray-900 transition active:scale-[0.98]"
          >
            <DestinationIcon />
            <span className="whitespace-nowrap text-sm font-semibold text-gray-500">{t(COPY.to, locale)} :</span>
            {destination ? (
              <span className="flex flex-wrap items-center gap-1">
                <span className="whitespace-nowrap">{name}</span>
                <LineBadges station={destination} locale={locale} size="chip" />
              </span>
            ) : (
              <span className="whitespace-nowrap text-sm font-semibold text-gray-400">{t(COPY.noDestination, locale)}</span>
            )}
          </button>
          <button
            type="button"
            onClick={onChange}
            aria-haspopup="dialog"
            className="flex shrink-0 items-center gap-0.5 rounded-full border border-[#f5d76e] bg-white px-2.5 py-1 text-[12px] font-extrabold text-[#b45309] transition active:scale-95"
          >
            {t(destination ? COPY.change : COPY.pick, locale)}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <Link
        href={routeHref(current, destination)}
        className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#ffc83d] to-[#f59e0b] py-2.5 text-[14px] font-extrabold text-[#5a3300] shadow-[0_2px_8px_rgba(245,158,11,0.35)] transition active:scale-[0.98]"
      >
        <RouteIcon size={18} />
        {t(COPY.findRoute, locale)}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      <div className="mt-2.5 flex items-center justify-between gap-3">
        <p className="min-w-0 text-[16px] font-extrabold leading-snug tracking-tight text-neutral-900">
          <span aria-hidden>🔔 </span>
          {destination ? t(COPY.title, locale).replace("{station}", name) : t(COPY.titleEmpty, locale)}
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={t(COPY.toggle, locale)}
          onClick={toggle}
          className={`relative h-8 w-[52px] shrink-0 rounded-full transition-colors ${on ? "bg-[#22c55e]" : "bg-neutral-300"}`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? "left-[24px]" : "left-1"}`}
          />
        </button>
      </div>
      <p className={`mt-0.5 truncate text-xs ${on ? "font-bold text-[#15803d]" : "text-gray-500"}`}>
        {on
          ? t(isNativeApp() ? COPY.onNative : COPY.on, locale)
          : prev
            ? t(COPY.hintPrev, locale).replace("{prev}", t(prev.name, locale))
            : t(COPY.hint, locale)}
      </p>
      {on && !alarm.systemAlerts ? (
        <p className="mt-0.5 text-[11px] font-semibold text-[#b45309]">⚠️ {t(COPY.noSystem, locale)}</p>
      ) : null}
    </section>
  );
}
