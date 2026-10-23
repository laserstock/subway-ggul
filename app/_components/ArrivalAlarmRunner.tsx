"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  cancelArrivalAlarm,
  sendArrivalAlert,
  updateArrivalAlarm,
  useArrivalAlarm,
  type ArrivalAlarm,
} from "../_lib/arrivalAlarm";
import { approachMessage, arrivalMessage, bareStationName, type AlarmMessage } from "../_lib/arrivalTips";
import { useLocale } from "../_lib/locale";
import { distanceMeters, restoreStation, t, type Localized } from "../_lib/stations";
import { lineNeighbors, loadLineStations, sameLine, stationLines } from "../_lib/subwayLine";
import { LOCATION_ISSUE_COPY, useStationTracker } from "../_lib/useStationTracker";

/** Fallback when the previous stop isn't recognised: roughly one station gap. */
const APPROACH_METERS = 1200;
const ARRIVED_METERS = 250;

const COPY = {
  waiting: {
    ko: "{station} 도착 알림 대기 중 · 화면을 켜 두세요",
    en: "Arrival alert for {station} on · keep the screen on",
    zh: "{station} 到站提醒中 · 请保持屏幕常亮",
    ja: "{station} 到着通知待機中 · 画面をつけたままに",
  },
  approaching: {
    ko: "곧 {station} 도착 · 내릴 준비하세요",
    en: "{station} is next · get ready",
    zh: "即将到达{station} · 请准备下车",
    ja: "まもなく{station} · 降りる準備を",
  },
  arrived: { ko: "{station} 도착 · 알림 끝", en: "Arrived at {station}", zh: "已到达{station}", ja: "{station}に到着" },
  cancel: { ko: "취소", en: "Cancel", zh: "取消", ja: "取消" },
  close: { ko: "닫기", en: "Close", zh: "关闭", ja: "閉じる" },
  ok: { ko: "확인", en: "OK", zh: "确定", ja: "OK" },
  appName: { ko: "지하철꿀정보 · 지금", en: "Subway Honey · now", zh: "地铁蜜信息 · 现在", ja: "地下鉄ハチミツ情報 · 今" },
} satisfies Record<string, Localized>;

/** Keeps the screen awake while the alarm runs; browsers drop the lock whenever the page is hidden. */
function useWakeLock() {
  useEffect(() => {
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
  }, []);
}

function ActiveAlarm({ alarm }: { alarm: ArrivalAlarm }) {
  const locale = useLocale();
  const pathname = usePathname();
  const station = useMemo(() => restoreStation(alarm.station), [alarm.station]);
  const [message, setMessage] = useState<AlarmMessage | null>(null);
  const alarmRef = useRef(alarm);
  const neighborsRef = useRef<Set<string>>(new Set());

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
      if (alive) neighborsRef.current = new Set(groups.flat().map((neighbor) => bareStationName(neighbor.name)));
    });
    return () => {
      alive = false;
    };
  }, [station]);

  useWakeLock();

  function fire(next: AlarmMessage) {
    setMessage(next);
    void sendArrivalAlert(next.title, next.body);
  }

  const tracker = useStationTracker({
    autoStart: true,
    onNearest: ({ station: here, position }) => {
      const current = alarmRef.current;
      if (current.stage === "arrived") return;
      const distance = distanceMeters(position, station.center);
      const hereName = bareStationName(here.name.ko);
      if (hereName === bareStationName(station.name.ko) || distance <= ARRIVED_METERS) {
        updateArrivalAlarm({ stage: "arrived" });
        fire(arrivalMessage(station, current.line, locale));
        return;
      }
      const line =
        stationLines(here).find((candidate) => stationLines(station).some((other) => sameLine(candidate, other))) ??
        current.line;
      const approaching =
        current.stage === "armed" && (neighborsRef.current.has(hereName) || distance <= APPROACH_METERS);
      updateArrivalAlarm({ from: here.name.ko, line, ...(approaching ? { stage: "approaching" as const } : {}) });
      if (approaching) fire(approachMessage(station, here.name.ko, locale));
    },
  });

  function dismiss() {
    setMessage(null);
    if (alarmRef.current.stage === "arrived") cancelArrivalAlarm();
  }

  const name = t(station.name, locale);

  if (message) {
    return (
      <div
        role="alertdialog"
        aria-labelledby="arrival-alarm-title"
        className="fixed inset-0 z-[130] flex items-start justify-center bg-black/45 px-4 pt-16"
      >
        <div className="w-full max-w-[361px] rounded-3xl bg-white p-4 shadow-2xl">
          <p className="text-[11px] font-bold text-neutral-400">{t(COPY.appName, locale)}</p>
          <p id="arrival-alarm-title" className="mt-1 text-[18px] font-extrabold tracking-tight text-neutral-900">
            {message.title}
          </p>
          <p className="mt-1.5 text-[14px] font-semibold leading-snug text-neutral-700">{message.body}</p>
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

  if (pathname === "/station") return null;

  const status = tracker.issue
    ? t(LOCATION_ISSUE_COPY[tracker.issue], locale)
    : t(COPY[alarm.stage === "armed" ? "waiting" : alarm.stage], locale).replace("{station}", name);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[84px] z-[110] flex justify-center px-4">
      <div className="pointer-events-auto flex w-full max-w-[361px] items-center gap-2 rounded-full bg-neutral-900/90 py-1.5 pl-3.5 pr-1.5 text-white shadow-lg">
        <span className={alarm.stage === "arrived" ? "" : "animate-pulse"} aria-hidden>
          🔔
        </span>
        <p className="min-w-0 flex-1 truncate text-[12.5px] font-bold" role="status">
          {status}
        </p>
        <button
          type="button"
          onClick={cancelArrivalAlarm}
          className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-[12px] font-bold"
        >
          {t(alarm.stage === "arrived" ? COPY.close : COPY.cancel, locale)}
        </button>
      </div>
    </div>
  );
}

/** Runs the arrival alarm on every page, so it keeps tracking while the rider browses the app. */
export default function ArrivalAlarmRunner() {
  const alarm = useArrivalAlarm();
  if (!alarm) return null;
  return <ActiveAlarm key={alarm.armedAt} alarm={alarm} />;
}
