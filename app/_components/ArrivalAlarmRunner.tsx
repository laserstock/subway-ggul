"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { speakAlarm } from "../_lib/alarmSpeech";
import {
  advanceAlarmLeg,
  cancelArrivalAlarm,
  sendArrivalAlert,
  setAlarmProgress,
  showPausedNotice,
  updateArrivalAlarm,
  useArrivalAlarm,
  VIBE,
  type ArrivalAlarm,
} from "../_lib/arrivalAlarm";
import { approachMessage, arrivalMessage, bareStationName } from "../_lib/arrivalTips";
import { useLocale } from "../_lib/locale";
import type { AlarmLeg } from "../_lib/multiLegAlarm";
import {
  hasNativeArrivalAlarm,
  isNativeApp,
  nativeArrivalAlarmStatus,
  startNativeArrivalAlarm,
  type NativeAlarmConfig,
} from "../_lib/native";
import { restoreStation, t, type Localized } from "../_lib/stations";
import { lineNeighbors, loadLineStations, stationLines } from "../_lib/subwayLine";
import { useSubwayAlarmEngine, type AlarmEngineEvent } from "../_lib/useSubwayAlarmEngine";

const COPY = {
  preBanner: {
    ko: "아직 내리지 마세요! 다음 역이 {target}입니다",
    en: "Don't get off yet! Next stop is {target}",
    zh: "先别下车！下一站是{target}",
    ja: "まだ降りないで！次は{target}です",
  },
  arriveBannerTransfer: {
    ko: "지금 내리세요! {target} 환승",
    en: "Get off now! Transfer at {target}",
    zh: "现在下车！{target}换乘",
    ja: "今降りて！{target}乗換",
  },
  arriveBannerFinal: {
    ko: "지금 내리세요! {target} 도착",
    en: "Get off now! Arrived at {target}",
    zh: "现在下车！已到{target}",
    ja: "今降りて！{target}到着",
  },
  preSpeech: {
    ko: "이번 역은 {current}입니다. 다음 역인 {target}에서 {action}하셔야 합니다.",
    en: "This stop is {current}. {action} at the next stop, {target}.",
    zh: "本站是{current}。请在下一站{target}{action}。",
    ja: "この駅は{current}です。次の{target}で{action}してください。",
  },
  actionTransfer: { ko: "환승", en: "transfer", zh: "换乘", ja: "乗換" },
  actionAlight: { ko: "하차", en: "get off", zh: "下车", ja: "降車" },
  transferSpeech: {
    ko: "이번 역은 환승역인 {target}입니다. 지금 내리세요. {tip}로 이동하시면 환승이 가장 빠릅니다.",
    en: "This is transfer station {target}. Get off now. Move to {tip} for the fastest transfer.",
    zh: "本站是换乘站{target}。请现在下车。前往{tip}换乘最快。",
    ja: "この駅は乗換の{target}です。今降りてください。{tip}へ向かうと最速です。",
  },
  transferSpeechNoTip: {
    ko: "이번 역은 환승역인 {target}입니다. 지금 내리세요.",
    en: "This is transfer station {target}. Get off now.",
    zh: "本站是换乘站{target}。请现在下车。",
    ja: "この駅は乗換の{target}です。今降りてください。",
  },
  finalSpeech: {
    ko: "최종 목적지인 {target}에 도착했습니다. 개찰구 {gate} 화장실 및 추천 출구 정보를 확인하세요.",
    en: "You have arrived at {target}. Check restrooms {gate} the gates and exit tips.",
    zh: "已到达终点{target}。请查看检票口{gate}洗手间与推荐出口。",
    ja: "最終目的地の{target}に到着しました。改札{gate}のトイレと出口情報を確認してください。",
  },
  gateInside: { ko: "안", en: "inside", zh: "内", ja: "内" },
  gateOutside: { ko: "밖", en: "outside", zh: "外", ja: "外" },
  gateUnknown: { ko: "안·밖", en: "nearby", zh: "附近", ja: "付近" },
  missedTitle: {
    ko: "환승역을 지나쳤습니다",
    en: "You passed the transfer stop",
    zh: "您已错过换乘站",
    ja: "乗換駅を通り過ぎました",
  },
  missedSpeech: {
    ko: "환승역을 지나쳤습니다. 다음 역에서 내려 반대편 열차를 이용하세요.",
    en: "You passed the transfer. Get off at the next stop and take the opposite train.",
    zh: "您已错过换乘站。请在下一站下车并乘坐对向列车。",
    ja: "乗換駅を通り過ぎました。次の駅で降りて反対方面の電車をご利用ください。",
  },
  trackingTitle: {
    ko: "지하철꿀정보 하차 알림",
    en: "Subway Honey arrival alert",
    zh: "地铁蜜信息 下车提醒",
    ja: "地下鉄ハチミツ情報 降車通知",
  },
  trackingMessage: {
    ko: "{station} 도착 전에 알려드릴게요",
    en: "We'll alert you before {station}",
    zh: "到达{station}前会提醒您",
    ja: "{station}の手前でお知らせします",
  },
  pausedTitle: {
    ko: "하차 알림이 멈췄어요",
    en: "Arrival alert paused",
    zh: "下车提醒已暂停",
    ja: "降車通知が止まっています",
  },
  pausedBody: {
    ko: "브라우저는 화면을 벗어나면 위치를 볼 수 없어요. 이 화면으로 돌아오면 {station} 알림을 이어서 해요",
    en: "Browsers can't track location in the background. Come back to this page to keep the {station} alert going",
    zh: "浏览器在后台无法定位。返回本页即可继续{station}的下车提醒",
    ja: "ブラウザはバックグラウンドで位置を取得できません。このページに戻ると{station}の通知を再開します",
  },
  cancel: { ko: "끄기", en: "Off", zh: "关闭", ja: "オフ" },
  ok: { ko: "확인", en: "OK", zh: "确定", ja: "OK" },
  appName: { ko: "지하철꿀정보 · 지금", en: "Subway Honey · now", zh: "地铁蜜信息 · 现在", ja: "地下鉄ハチミツ情報 · 今" },
  trackingChannel: { ko: "하차 알림 진행 중", en: "Arrival alert running", zh: "下车提醒运行中", ja: "降車通知の実行中" },
  alertChannel: { ko: "하차 알림", en: "Arrival alerts", zh: "下车提醒", ja: "降車通知" },
} satisfies Record<string, Localized>;

function fill(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);
}

/** Keeps the screen awake while the alarm runs; browsers drop the lock whenever the page is hidden. */
function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let sentinel: WakeLockSentinel | null = null;
    let alive = true;
    function acquire() {
      if (document.visibilityState !== "visible" || !("wakeLock" in navigator)) return;
      navigator.wakeLock
        .request("screen")
        .then((next) => {
          if (alive) sentinel = next;
          else void next.release();
        })
        .catch(() => {});
    }
    acquire();
    document.addEventListener("visibilitychange", acquire);
    return () => {
      alive = false;
      document.removeEventListener("visibilitychange", acquire);
      void sentinel?.release();
    };
  }, [enabled]);
}

type Banner = {
  tone: "pre" | "arrive" | "missed";
  title: string;
  body: string;
  speech: string;
};

function ActiveAlarm({ alarm }: { alarm: ArrivalAlarm }) {
  const locale = useLocale();
  const station = useMemo(() => restoreStation(alarm.station), [alarm.station]);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [neighbors, setNeighbors] = useState<{ lat: number; lng: number; title: string; body: string }[] | null>(null);
  const [route, setRoute] = useState<NativeAlarmConfig["route"]>([]);
  const alarmRef = useRef(alarm);

  useEffect(() => {
    alarmRef.current = alarm;
  });

  useEffect(() => {
    let alive = true;
    Promise.all(
      stationLines(station).map((line) =>
        loadLineStations(station, line).then((stations) => lineNeighbors(station, stations)),
      ),
    ).then((groups) => {
      if (!alive) return;
      const found = groups.flat();
      setNeighbors(
        found.map((neighbor) => ({
          ...neighbor.center,
          ...approachMessage(station, neighbor.name, locale),
        })),
      );
    });
    return () => {
      alive = false;
    };
  }, [station, locale]);

  const native = isNativeApp();
  const nativeAlarm = hasNativeArrivalAlarm();
  const name = t(station.name, locale);
  const trackingTitle = t(COPY.trackingTitle, locale);
  const trackingBody = t(COPY.trackingMessage, locale).replace("{station}", name);
  useWakeLock(!native);

  const armedAt = alarm.armedAt;
  const arrived = alarm.stage === "arrived";
  useEffect(() => {
    if (!nativeAlarm || !neighbors || arrived || alarm.stage === "transferring") return;
    let alive = true;
    const generic = approachMessage(station, null, locale);
    const arrival = arrivalMessage(station, alarmRef.current.line, locale);
    const config: NativeAlarmConfig = {
      armedAt,
      target: station.center,
      approach: neighbors.length
        ? neighbors
        : [{ ...station.center, title: generic.title, body: generic.body }],
      route,
      texts: {
        trackingTitle,
        trackingBody,
        cancel: t(COPY.cancel, locale),
        approachTitle: generic.title,
        approachBody: generic.body,
        arrivalTitle: arrival.title,
        arrivalBody: arrival.body,
        trackingChannel: t(COPY.trackingChannel, locale),
        alertChannel: t(COPY.alertChannel, locale),
      },
    };
    void nativeArrivalAlarmStatus()
      .then((status) => {
        if (!alive || (status && status.armedAt === armedAt && !status.active)) return;
        return startNativeArrivalAlarm(config);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [nativeAlarm, neighbors, route, arrived, armedAt, station, locale, trackingTitle, trackingBody, alarm.stage]);

  useEffect(() => {
    if (!nativeAlarm) return;
    function sync() {
      if (document.visibilityState !== "visible") return;
      void nativeArrivalAlarmStatus().then((status) => {
        const current = alarmRef.current;
        if (!status || status.armedAt !== current.armedAt) return;
        if (status.stage === "arrived") {
          if (current.stage !== "arrived" && current.stage !== "transferring") {
            // Prefer the JS multi-leg engine; only sync final/single arrivals from native.
            if (current.mode === "single" || current.legIndex >= current.legs.length - 1) {
              updateArrivalAlarm({ stage: "arrived" });
            }
          }
        } else if (!status.active) {
          cancelArrivalAlarm();
        } else if (status.stage === "approaching" && current.stage === "armed") {
          updateArrivalAlarm({ stage: "approaching" });
        }
      });
    }
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [nativeAlarm]);

  function showBanner(next: Banner, pattern: number[]) {
    setBanner(next);
    speakAlarm(next.speech, alarmRef.current.muteVoice);
    void sendArrivalAlert(next.title, next.body, !nativeAlarm, pattern);
  }

  function onPreArrival(leg: AlarmLeg, currentStation: string) {
    updateArrivalAlarm({ stage: "approaching", from: currentStation + "역" });
    const target = t(restoreStation(leg.station).name, locale);
    const current = bareStationName(currentStation);
    const action = t(leg.kind === "transfer" ? COPY.actionTransfer : COPY.actionAlight, locale);
    showBanner(
      {
        tone: "pre",
        title: fill(t(COPY.preBanner, locale), { target }),
        body: fill(t(COPY.preSpeech, locale), { current, target, action }),
        speech: fill(t(COPY.preSpeech, locale), { current, target, action }),
      },
      VIBE.preArrival,
    );
  }

  function onArrival(leg: AlarmLeg) {
    const target = t(restoreStation(leg.station).name, locale);
    if (leg.kind === "transfer") {
      updateArrivalAlarm({ stage: "transferring" });
      const tip = leg.transferTip;
      const speech = tip
        ? fill(t(COPY.transferSpeech, locale), { target, tip })
        : fill(t(COPY.transferSpeechNoTip, locale), { target });
      showBanner(
        {
          tone: "arrive",
          title: fill(t(COPY.arriveBannerTransfer, locale), { target }),
          body: speech,
          speech,
        },
        VIBE.arrival,
      );
      return;
    }
    updateArrivalAlarm({ stage: "arrived" });
    const gate =
      leg.restroomGate === "inside"
        ? t(COPY.gateInside, locale)
        : leg.restroomGate === "outside"
          ? t(COPY.gateOutside, locale)
          : t(COPY.gateUnknown, locale);
    const speech = fill(t(COPY.finalSpeech, locale), { target, gate });
    const tips = arrivalMessage(restoreStation(leg.station), leg.line, locale);
    showBanner(
      {
        tone: "arrive",
        title: fill(t(COPY.arriveBannerFinal, locale), { target }),
        body: tips.body,
        speech,
      },
      VIBE.arrival,
    );
  }

  function onMissedTransfer(stationName: string) {
    updateArrivalAlarm({ stage: "missed_transfer", from: stationName + "역" });
    const speech = t(COPY.missedSpeech, locale);
    showBanner(
      {
        tone: "missed",
        title: t(COPY.missedTitle, locale),
        body: speech,
        speech,
      },
      VIBE.missedTransfer,
    );
  }

  const handleEvent = useEffectEvent((event: AlarmEngineEvent) => {
    if (event.type === "progress") {
      setAlarmProgress({
        remainingStops: event.remainingStops,
        etaSeconds: event.etaSeconds,
        atStation: event.atStation,
      });
      if (event.atStation) updateArrivalAlarm({ from: event.atStation + "역" });
      return;
    }
    if (event.type === "preArrival") onPreArrival(event.leg, event.currentStation);
    else if (event.type === "arrival") onArrival(event.leg);
    else if (event.type === "missedTransfer") onMissedTransfer(event.station);
    else if (event.type === "boardNextLeg") {
      setBanner(null);
      advanceAlarmLeg();
    }
  });

  const engine = useSubwayAlarmEngine({
    alarm,
    background: nativeAlarm ? undefined : { title: trackingTitle, message: trackingBody },
    onEvent: handleEvent,
  });

  useEffect(() => {
    setAlarmProgress({
      remainingStops: engine.remainingStops,
      etaSeconds: engine.etaSeconds,
      atStation: engine.atStation,
    });
  }, [engine.remainingStops, engine.etaSeconds, engine.atStation]);

  const stopTracking = useEffectEvent(() => engine.stop());
  useEffect(() => {
    if (alarm.stage === "arrived") stopTracking();
  }, [alarm.stage]);

  const originKey = engine.nearest?.key ?? null;
  const routeSeqRef = useRef(0);
  const planRoute = useEffectEvent(() => {
    const origin = engine.nearest;
    if (!nativeAlarm || !origin || origin.key === station.key) return;
    const seq = ++routeSeqRef.current;
    void import("../_lib/alarmRoute").then(({ alarmRoute }) => {
      if (seq === routeSeqRef.current) setRoute(alarmRoute(origin, station));
    });
  });
  useEffect(() => {
    planRoute();
  }, [originKey, alarm.legIndex]);

  const stage = alarm.stage;
  useEffect(() => {
    if (native || stage === "arrived") return;
    const paused = { title: t(COPY.pausedTitle, locale), body: t(COPY.pausedBody, locale).replace("{station}", name) };
    function onVisibility() {
      void showPausedNotice(document.visibilityState === "hidden" ? paused : null);
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      void showPausedNotice(null);
    };
  }, [native, stage, locale, name]);

  function dismiss() {
    setBanner(null);
    const current = alarmRef.current;
    if (current.stage === "arrived") cancelArrivalAlarm();
    else if (current.stage === "missed_transfer") {
      updateArrivalAlarm({ stage: "armed" });
    }
  }

  const bannerTone =
    banner?.tone === "missed"
      ? "border-red-500 bg-red-50 text-red-900"
      : banner?.tone === "arrive"
        ? "border-emerald-500 bg-emerald-50 text-emerald-950"
        : "border-amber-400 bg-amber-50 text-amber-950";

  if (!banner) return null;

  return (
    <div
      role="alertdialog"
      aria-labelledby="arrival-alarm-title"
      className="fixed inset-0 z-[130] flex items-start justify-center bg-black/45 px-4 pt-20"
    >
      <div className={`w-full max-w-[361px] rounded-3xl border-2 p-4 shadow-2xl ${bannerTone}`}>
        <p className="text-[11px] font-bold opacity-60">{t(COPY.appName, locale)}</p>
        <p id="arrival-alarm-title" className="mt-1 text-[18px] font-extrabold tracking-tight">
          {banner.tone === "pre" ? "⚠️ " : "🚨 "}
          {banner.title}
        </p>
        <p className="mt-1.5 text-[14px] font-semibold leading-snug opacity-90">{banner.body}</p>
        <button
          type="button"
          onClick={dismiss}
          className="mt-3.5 w-full rounded-xl bg-[#f5b800] py-2.5 text-[14px] font-extrabold text-neutral-900 transition active:scale-[0.98]"
        >
          {t(COPY.ok, locale)}
        </button>
      </div>
    </div>
  );
}

/** Runs the arrival alarm on every page, so it keeps tracking while the rider browses the app. */
export default function ArrivalAlarmRunner() {
  const alarm = useArrivalAlarm();
  if (!alarm) return null;
  return <ActiveAlarm key={`${alarm.armedAt}-${alarm.legIndex}`} alarm={alarm} />;
}
