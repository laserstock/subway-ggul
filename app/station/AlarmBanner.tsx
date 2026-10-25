"use client";

import type { ReactNode } from "react";
import { ElevatorIcon, RestroomIcon } from "../_components/icons";
import { armArrivalAlarm, cancelArrivalAlarm, useArrivalAlarm } from "../_lib/arrivalAlarm";
import { elevatorTip, floorLabel, restroomTip, type ElevatorTip } from "../_lib/arrivalTips";
import { isNativeApp } from "../_lib/native";
import type { StationToilet } from "../_lib/stationToilets";
import { restoreStation, t, type Locale, type Localized, type StationOption } from "../_lib/stations";

const COPY = {
  question: {
    ko: "{station} 도착할 때 알려드릴까요?",
    en: "Alert me before {station}?",
    zh: "到达{station}时提醒您吗？",
    ja: "{station}到着前にお知らせしますか？",
  },
  off: {
    ko: "1역 전에 진동과 알림으로 알려드려요",
    en: "We'll buzz you one stop before",
    zh: "前一站振动提醒",
    ja: "1駅前に振動と通知でお知らせします",
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
  toggle: { ko: "도착 알림", en: "Arrival alert", zh: "到站提醒", ja: "到着通知" },
  noSystem: {
    ko: "알림 권한이 없어 앱 안에서 소리·진동으로만 알려드려요",
    en: "Notifications are off, so we'll alert you in the app only",
    zh: "未开启通知权限，仅在应用内用声音和振动提醒",
    ja: "通知が許可されていないため、アプリ内の音と振動でお知らせします",
  },
  other: {
    ko: "{station} 알림이 켜져 있어요. 켜면 이 역으로 바뀌어요",
    en: "{station} alert is on. Turning this on switches it here",
    zh: "{station}的提醒已开启，开启后将切换到本站",
    ja: "{station}の通知がオンです。オンにするとこの駅に切り替わります",
  },
  elevator: { ko: "엘리베이터 칸", en: "Elevator car", zh: "电梯车厢", ja: "エレベーター車両" },
  toward: { ko: "{x} 방면", en: "to {x}", zh: "往{x}", ja: "{x}方面" },
  restroom: { ko: "화장실", en: "Restroom", zh: "卫生间", ja: "トイレ" },
  inside: { ko: "개찰구 안", en: "Inside gates", zh: "闸机内", ja: "改札内" },
  outside: { ko: "개찰구 밖", en: "Outside gates", zh: "闸机外", ja: "改札外" },
} satisfies Record<string, Localized>;

function elevatorBrief(tip: ElevatorTip, locale: Locale) {
  if (tip.cars.length === 1) return tip.cars[0].car;
  return tip.cars
    .map(({ toward, car }) => `${t(COPY.toward, locale).replace("{x}", t(toward, locale))} ${car}`)
    .join(" · ");
}

function restroomBrief(toilet: StationToilet, locale: Locale) {
  return `${t(toilet.gate === "inside" ? COPY.inside : COPY.outside, locale)} ${floorLabel(toilet.floor, locale)}`;
}

function TipIcon({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-[#f5b800] text-white shadow-[0_1px_2px_rgba(146,64,14,0.25)]">
      {children}
    </span>
  );
}

export default function AlarmBanner({ station, locale }: { station: StationOption; locale: Locale }) {
  const alarm = useArrivalAlarm();
  const on = alarm !== null && alarm.station.key === station.key;
  const other = alarm && !on ? restoreStation(alarm.station) : null;

  const elevator = elevatorTip(station, on ? alarm.from : null);
  const toilet = restroomTip(station, on ? alarm.line : null);

  function toggle() {
    if (on) cancelArrivalAlarm();
    else void armArrivalAlarm(station);
  }

  return (
    <section className="mt-1 rounded-2xl border border-[#f5d76e] bg-gradient-to-br from-[#fff8db] to-[#fffdf3] px-4 py-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-extrabold leading-snug tracking-tight text-neutral-900">
            <span aria-hidden>🔔 </span>
            {t(COPY.question, locale).replace("{station}", t(station.name, locale))}
          </p>
          <p className={`mt-0.5 text-[12px] font-bold ${on ? "text-[#15803d]" : "text-neutral-500"}`}>
            {t(on ? (isNativeApp() ? COPY.onNative : COPY.on) : COPY.off, locale)}
          </p>
        </div>
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

      {on && !alarm.systemAlerts ? (
        <p className="mt-1.5 text-[11.5px] font-semibold text-[#b45309]">⚠️ {t(COPY.noSystem, locale)}</p>
      ) : null}
      {other ? (
        <p className="mt-1.5 text-[11.5px] font-bold text-[#b45309]">
          {t(COPY.other, locale).replace("{station}", t(other.name, locale))}
        </p>
      ) : null}

      {elevator || toilet ? (
        <dl className="mt-2.5 flex flex-col gap-1 border-t border-[#f5d76e]/70 pt-2 text-[12.5px]">
          {elevator ? (
            <div className="flex items-start gap-2">
              <dt className="flex shrink-0 items-center gap-1.5 font-bold text-[#92400e]">
                <TipIcon>
                  <ElevatorIcon size={14} />
                </TipIcon>
                {t(COPY.elevator, locale)}
              </dt>
              <dd className="min-w-0 pt-[2px] font-extrabold text-neutral-900">{elevatorBrief(elevator, locale)}</dd>
            </div>
          ) : null}
          {toilet ? (
            <div className="flex items-start gap-2">
              <dt className="flex shrink-0 items-center gap-1.5 font-bold text-[#92400e]">
                <TipIcon>
                  <RestroomIcon size={14} />
                </TipIcon>
                {t(COPY.restroom, locale)}
              </dt>
              <dd className="min-w-0 pt-[2px] font-extrabold text-neutral-900">{restroomBrief(toilet, locale)}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </section>
  );
}
