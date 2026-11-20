"use client";

import {
  cancelArrivalAlarm,
  setAlarmMuteVoice,
  useAlarmProgress,
  useArrivalAlarm,
} from "../_lib/arrivalAlarm";
import { restroomText, restroomTip } from "../_lib/arrivalTips";
import { useLocale } from "../_lib/locale";
import { currentAlarmLeg } from "../_lib/multiLegAlarm";
import { restoreStation, t, type Localized } from "../_lib/stations";

const COPY = {
  transferring: {
    ko: "환승 중 · 다음 구간 탑승을 감지하면 알람이 이어져요",
    en: "Transferring · next leg arms when you board",
    zh: "换乘中 · 上车后自动进入下一段",
    ja: "乗換中 · 次区間に乗るとアラーム継続",
  },
  wrongWay: {
    ko: "주의! 반대 방향입니다 · 다음 역에서 갈아타세요",
    en: "Wrong direction · change at the next stop",
    zh: "注意！反方向 · 请在下一站换乘",
    ja: "注意！逆方向 · 次駅で乗換えて",
  },
  arrived: {
    ko: "{station} 도착 · 알림을 확인해 주세요",
    en: "Arrived at {station}",
    zh: "已到达{station}",
    ja: "{station}に到着",
  },
  ticker: {
    ko: "{station}까지 {n}정거장 (약 {m}분 남음)  •  🚻 화장실: {gate}  •  🛗 추천 출구/환승: {tip}",
    en: "{n} stops to {station} (~{m} min)  •  🚻 Restroom: {gate}  •  🛗 Exit/transfer: {tip}",
    zh: "距{station}还有{n}站（约{m}分钟）  •  🚻 洗手间：{gate}  •  🛗 出口/换乘：{tip}",
    ja: "{station}まで{n}駅（約{m}分）  •  🚻 トイレ: {gate}  •  🛗 出口/乗換: {tip}",
  },
  gateUnknown: { ko: "개찰구 안·밖 확인", en: "check near gates", zh: "请查看检票口附近", ja: "改札付近を確認" },
  tipTransfer: { ko: "빠른환승 {tip}", en: "Fast transfer {tip}", zh: "快速换乘 {tip}", ja: "快速乗換 {tip}" },
  tipDefault: {
    ko: "내릴 준비 · 두고 내리는 물건 확인",
    en: "Get ready · check your belongings",
    zh: "准备下车 · 请确认随身物品",
    ja: "降りる準備 · 忘れ物確認",
  },
  muteOn: { ko: "음성", en: "Voice", zh: "语音", ja: "音声" },
  muteOff: { ko: "음소거", en: "Mute", zh: "静音", ja: "消音" },
  cancel: { ko: "끄기", en: "Off", zh: "关闭", ja: "オフ" },
} satisfies Record<string, Localized>;

function fill(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);
}

/** Slim in-flow marquee under AppHeader — never overlays page content. */
export default function AlarmTickerBar() {
  const alarm = useArrivalAlarm();
  const progress = useAlarmProgress();
  const locale = useLocale();
  if (!alarm) return null;

  const leg = currentAlarmLeg(alarm.legs, alarm.legIndex);
  const station = restoreStation(alarm.station);
  const stationName = t(station.name, locale);
  const minutes = Math.max(1, Math.round(progress.etaSeconds / 60));
  const toilet = restroomTip(station, leg?.line ?? alarm.line);
  const gate = toilet ? restroomText(station, toilet, locale) : t(COPY.gateUnknown, locale);
  const tip = leg?.transferTip
    ? fill(t(COPY.tipTransfer, locale), { tip: leg.transferTip })
    : t(COPY.tipDefault, locale);

  const message =
    alarm.stage === "transferring"
      ? t(COPY.transferring, locale)
      : alarm.stage === "wrong_way"
        ? t(COPY.wrongWay, locale)
        : alarm.stage === "arrived"
          ? fill(t(COPY.arrived, locale), { station: stationName })
          : fill(t(COPY.ticker, locale), {
              station: stationName,
              n: progress.remainingStops,
              m: minutes,
              gate,
              tip,
            });

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex h-9 w-full items-center gap-1.5 border-b border-amber-200 bg-[#FEF9C3] px-2 text-[#78350F]"
    >
      <style>{`
        @keyframes ksub-marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .ksub-marquee-viewport:hover .ksub-marquee-track,
        .ksub-marquee-viewport:active .ksub-marquee-track {
          animation-play-state: paused;
        }
        .ksub-marquee-track {
          display: flex;
          width: max-content;
          animation: ksub-marquee 16s linear infinite;
          will-change: transform;
        }
      `}</style>
      <span className="shrink-0 text-[13px] leading-none" aria-hidden>
        🔔
      </span>
      <div className="ksub-marquee-viewport relative flex min-w-0 flex-1 items-center overflow-hidden">
        <div className="ksub-marquee-track text-[13px] font-semibold leading-9 text-[#1F2937]">
          <span className="whitespace-nowrap pr-12">{message}</span>
          <span className="whitespace-nowrap pr-12" aria-hidden="true">
            {message}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setAlarmMuteVoice(!alarm.muteVoice)}
        aria-pressed={alarm.muteVoice}
        aria-label={alarm.muteVoice ? t(COPY.muteOff, locale) : t(COPY.muteOn, locale)}
        className="shrink-0 rounded-md px-1.5 py-1 text-[12px] font-bold text-[#1F2937] transition active:scale-95"
      >
        {alarm.muteVoice ? "🔇" : "🔊"}
      </button>
      <button
        type="button"
        onClick={cancelArrivalAlarm}
        className="shrink-0 rounded-md bg-amber-200/80 px-2 py-1 text-[11px] font-extrabold text-[#78350F] transition active:scale-95"
      >
        {t(COPY.cancel, locale)}
      </button>
    </div>
  );
}
