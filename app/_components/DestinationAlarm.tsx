"use client";

import { useEffect, useMemo, useState } from "react";
import LineBadges from "./LineBadges";
import { armArrivalAlarm, cancelArrivalAlarm, useArrivalAlarm } from "../_lib/arrivalAlarm";
import { bareStationName } from "../_lib/arrivalTips";
import { distanceMeters, kakaoOption, restoreStation, t, type Locale, type Localized, type StationOption } from "../_lib/stations";
import { lineNeighbors, loadLineStations, sameLine, stationLines } from "../_lib/subwayLine";

const COPY = {
  destination: { ko: "목적지", en: "Destination", zh: "目的地", ja: "目的地" },
  change: { ko: "변경", en: "Change", zh: "更改", ja: "変更" },
  pick: { ko: "선택하기", en: "Choose", zh: "选择", ja: "選択" },
  title: {
    ko: "{station} 하차 알림 예약하기",
    en: "Alert me before {station}",
    zh: "预约{station}下车提醒",
    ja: "{station}の降車通知を予約",
  },
  titleEmpty: {
    ko: "목적지 정하고 하차 알림 받기",
    en: "Pick a stop to get an arrival alert",
    zh: "选择目的地，接收下车提醒",
    ja: "目的地を選んで降車通知を受け取る",
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
  noSystem: {
    ko: "알림 권한이 없어 앱 안에서 소리·진동으로만 알려드려요",
    en: "Notifications are off, so we'll alert you in the app only",
    zh: "未开启通知权限，仅在应用内用声音和振动提醒",
    ja: "通知が許可されていないため、アプリ内の音と振動でお知らせします",
  },
  toggle: { ko: "하차 알림", en: "Arrival alert", zh: "下车提醒", ja: "降車通知" },
} satisfies Record<string, Localized>;

function DestinationIcon() {
  return (
    <span
      className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] bg-gradient-to-br from-[#ffc83d] to-[#f59e0b] text-white shadow-[0_1px_3px_rgba(146,64,14,0.3)]"
      aria-hidden
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
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

/** Destination line, the arrival-alarm switch and its hint, inside the home hero card. */
export default function DestinationAlarm({
  target,
  current,
  locale,
  onChange,
}: {
  /** Suggested destination: the last station viewed, else the first My station. */
  target: StationOption | null;
  current: StationOption | null;
  locale: Locale;
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
    <div className="mt-3 border-t border-[#f5d76e]/70 pt-3">
      <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#92400e]">
        <DestinationIcon />
        <span className="shrink-0">{t(COPY.destination, locale)}:</span>
        {destination ? (
          <span className="flex min-w-0 items-center gap-1 font-extrabold text-neutral-900">
            <LineBadges station={destination} locale={locale} size="sm" />
            <span className="truncate">{name}</span>
          </span>
        ) : null}
        <button
          type="button"
          onClick={onChange}
          aria-haspopup="dialog"
          className="ml-auto flex shrink-0 items-center gap-0.5 rounded-full border border-[#f5d76e] bg-white px-2.5 py-1 text-[11.5px] font-extrabold text-[#b45309] transition active:scale-95"
        >
          {t(destination ? COPY.change : COPY.pick, locale)}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <p className="min-w-0 flex-1 text-[18px] font-extrabold leading-snug tracking-tight text-neutral-900">
          <span aria-hidden>🔔 </span>
          {destination ? t(COPY.title, locale).replace("{station}", name) : t(COPY.titleEmpty, locale)}
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={t(COPY.toggle, locale)}
          onClick={toggle}
          className={`relative h-9 w-[60px] shrink-0 rounded-full transition-colors ${on ? "bg-[#22c55e]" : "bg-neutral-300"}`}
        >
          <span
            className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow transition-all ${on ? "left-[28px]" : "left-1"}`}
          />
        </button>
      </div>
      <p className="mt-1 truncate text-[12px] font-semibold tracking-tight text-neutral-600">
        {prev ? t(COPY.hintPrev, locale).replace("{prev}", t(prev.name, locale)) : t(COPY.hint, locale)}
      </p>

      {on ? <p className="mt-2 text-[12px] font-bold text-[#15803d]">{t(COPY.on, locale)}</p> : null}
      {on && !alarm.systemAlerts ? (
        <p className="mt-1 text-[11.5px] font-semibold text-[#b45309]">⚠️ {t(COPY.noSystem, locale)}</p>
      ) : null}
    </div>
  );
}
