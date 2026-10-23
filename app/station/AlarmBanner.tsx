"use client";

import { armArrivalAlarm, cancelArrivalAlarm, useArrivalAlarm } from "../_lib/arrivalAlarm";
import { elevatorText, elevatorTip, restroomText, restroomTip } from "../_lib/arrivalTips";
import { restoreStation, t, type Locale, type Localized, type StationOption } from "../_lib/stations";

const COPY = {
  question: {
    ko: "지하철 내릴 때 알려드릴까요?",
    en: "Want a heads-up before your stop?",
    zh: "下车前提醒您吗？",
    ja: "降りる前にお知らせしましょうか？",
  },
  action: { ko: "이 역 도착 알림 예약하기", en: "Set an arrival alert", zh: "预约到站提醒", ja: "到着通知を予約" },
  actionOn: { ko: "도착 알림 대기 중", en: "Arrival alert is on", zh: "到站提醒已开启", ja: "到着通知 待機中" },
  how: {
    ko: "1역 전 진동 + 알림 (엘리베이터 가까운 칸 · 화장실 위치 안내)",
    en: "Vibration + alert one stop before (elevator car · restroom location)",
  },
  keepOpen: {
    ko: "앱 화면을 켜 둔 채로 타고 가세요. 화면을 끄거나 다른 앱으로 가면 위치를 못 따라가요.",
    en: "Keep this app open on screen. Location can't be followed with the screen off or in another app.",
  },
  noSystem: {
    ko: "알림 권한이 없어 앱 화면 안 알림과 진동·소리로 알려드려요. 아이폰은 홈 화면에 추가한 앱에서만 알림이 와요.",
    en: "Notifications aren't allowed, so we'll alert you in the app with sound and vibration. On iPhone, notifications need the app on your Home Screen.",
  },
  other: {
    ko: "지금 {station} 알림이 켜져 있어요. 켜면 이 역으로 바뀌어요.",
    en: "An alert for {station} is on. Turning this on switches it here.",
  },
  previewTitle: { ko: "알림 미리보기", en: "Alert preview", zh: "提醒预览", ja: "通知プレビュー" },
  previewApproach: { ko: "1역 전", en: "1 stop before", zh: "前一站", ja: "1駅前" },
  previewArrive: { ko: "도착", en: "On arrival", zh: "到站", ja: "到着" },
} satisfies Record<string, Localized>;

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
          <p className="text-[15px] font-extrabold tracking-tight text-neutral-900">
            <span aria-hidden>🔔 </span>
            {t(COPY.question, locale)}
          </p>
          <p className="mt-1 text-[13.5px] font-bold text-neutral-800">
            {t(on ? COPY.actionOn : COPY.action, locale)}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={t(COPY.action, locale)}
          onClick={toggle}
          className={`relative h-8 w-[52px] shrink-0 rounded-full transition-colors ${on ? "bg-[#22c55e]" : "bg-neutral-300"}`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? "left-[24px]" : "left-1"}`}
          />
        </button>
      </div>
      <p className="mt-1 text-[11.5px] font-semibold leading-snug text-neutral-500">{t(COPY.how, locale)}</p>

      {other ? (
        <p className="mt-2 text-[11.5px] font-bold text-[#b45309]">
          {t(COPY.other, locale).replace("{station}", t(other.name, locale))}
        </p>
      ) : null}

      {on ? (
        <div className="mt-2.5 space-y-1.5 rounded-xl bg-white/80 px-3 py-2.5">
          <p className="text-[12px] font-bold leading-snug text-[#15803d]">📍 {t(COPY.keepOpen, locale)}</p>
          {!alarm.systemAlerts ? (
            <p className="text-[11.5px] font-semibold leading-snug text-[#b45309]">⚠️ {t(COPY.noSystem, locale)}</p>
          ) : null}
        </div>
      ) : null}

      {elevator || toilet ? (
        <div className="mt-2.5 border-t border-[#f5d76e]/70 pt-2">
          <p className="text-[11px] font-extrabold text-[#92400e]">{t(COPY.previewTitle, locale)}</p>
          {elevator ? (
            <p className="mt-1 text-[12px] leading-snug text-neutral-700">
              <span className="mr-1 rounded bg-[#fde68a] px-1 text-[10.5px] font-bold text-[#92400e]">
                {t(COPY.previewApproach, locale)}
              </span>
              💡 {elevatorText(elevator, locale)}
            </p>
          ) : null}
          {toilet ? (
            <p className="mt-1 text-[12px] leading-snug text-neutral-700">
              <span className="mr-1 rounded bg-[#fde68a] px-1 text-[10.5px] font-bold text-[#92400e]">
                {t(COPY.previewArrive, locale)}
              </span>
              🚽 {restroomText(station, toilet, locale)}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
