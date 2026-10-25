"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { LatLng } from "../KakaoMap";
import { saveLastStation } from "./lastStation";
import { isNativeApp, watchBackgroundLocation } from "./native";
import { loadNearbyStations, nearbyStationsOffline } from "./nearbyStations";
import { distanceMeters, type Localized, type StationOption } from "./stations";

const NEAREST_LOOKUP_METERS = 150;
/** Re-resolve when the previous fix was this vague and a new one is at least twice as precise. */
const SHARPER_FIX_METERS = 100;
/** A cached fix this recent is still the same station for a subway rider. */
const QUICK_FIX_MAX_AGE_MS = 60_000;

export type LocationIssue = "denied" | "unavailable" | "unsupported" | "noStation" | "lookupFailed";

export const LOCATION_ISSUE_COPY: Record<LocationIssue, Localized> = {
  denied: {
    ko: "위치 권한이 꺼져 있어요. 브라우저 설정에서 허용해 주세요",
    en: "Location access is off. Allow it in your browser settings",
    zh: "定位权限已关闭，请在浏览器设置中允许",
    ja: "位置情報がオフです。ブラウザの設定で許可してください",
  },
  unavailable: {
    ko: "위치 신호가 약해요. 신호가 잡히면 자동으로 갱신돼요",
    en: "Weak location signal. It will update once a signal is found",
    zh: "定位信号较弱，信号恢复后将自动更新",
    ja: "位置信号が弱いです。受信できたら自動で更新します",
  },
  unsupported: {
    ko: "이 브라우저는 위치 기능을 지원하지 않아요",
    en: "This browser doesn't support location",
    zh: "此浏览器不支持定位功能",
    ja: "このブラウザは位置情報に対応していません",
  },
  noStation: {
    ko: "주변 5km 안에 지하철역이 없어요",
    en: "No subway station within 5 km",
    zh: "周边5公里内没有地铁站",
    ja: "周辺5km以内に地下鉄駅がありません",
  },
  lookupFailed: {
    ko: "가까운 역을 찾지 못했어요. 이동하면 다시 시도해요",
    en: "Couldn't find a nearby station. Will retry as you move",
    zh: "未找到附近车站，移动后将重试",
    ja: "近くの駅が見つかりません。移動すると再試行します",
  },
};

export type NearestUpdate = { station: StationOption; position: LatLng; seq: number };

export function useStationTracker({
  autoStart = false,
  quickStart = false,
  background,
  onNearest,
}: {
  autoStart?: boolean;
  /**
   * Also asks for a fast network-based fix and re-resolves once GPS gets much sharper.
   * Off where consecutive fixes feed heading detection, since a coarse fix would fake movement.
   */
  quickStart?: boolean;
  /** In the native app, keeps tracking with the app closed; Android shows this as an ongoing notification. */
  background?: { title: string; message: string };
  onNearest?: (update: NearestUpdate) => void;
} = {}) {
  const [tracking, setTracking] = useState(autoStart);
  const [position, setPosition] = useState<LatLng | null>(null);
  /** Accuracy radius of `position` in metres. */
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [nearest, setNearest] = useState<StationOption | null>(null);
  const [lookupPosition, setLookupPosition] = useState<LatLng | null>(null);
  const [issue, setIssue] = useState<LocationIssue | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const stopNativeWatchRef = useRef<(() => void) | null>(null);
  const lastLookupRef = useRef<LatLng | null>(null);
  const lookupAccuracyRef = useRef(Infinity);
  const lookupSeqRef = useRef(0);
  const positionRef = useRef<LatLng | null>(null);
  const onNearestRef = useRef(onNearest);

  useEffect(() => {
    onNearestRef.current = onNearest;
  });

  function lookupNearest(here: LatLng): Promise<StationOption | null> {
    const seq = ++lookupSeqRef.current;
    lastLookupRef.current = here;
    const lookup = stopNativeWatchRef.current
      ? Promise.resolve(nearbyStationsOffline(here))
      : loadNearbyStations(here);
    return lookup
      .then(([station]) => {
        if (seq !== lookupSeqRef.current) return station ?? null;
        if (!station) {
          setIssue("noStation");
          return null;
        }
        setIssue(null);
        setNearest(station);
        setLookupPosition(here);
        saveLastStation(station);
        onNearestRef.current?.({ station, position: here, seq });
        return station;
      })
      .catch(() => {
        if (seq === lookupSeqRef.current) {
          lastLookupRef.current = null;
          setIssue("lookupFailed");
        }
        return null;
      });
  }

  function watching() {
    return watchIdRef.current !== null || stopNativeWatchRef.current !== null;
  }

  function clearWatch() {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
    stopNativeWatchRef.current?.();
    stopNativeWatchRef.current = null;
    lookupSeqRef.current += 1;
    lastLookupRef.current = null;
    lookupAccuracyRef.current = Infinity;
    positionRef.current = null;
  }

  function handleDenied() {
    clearWatch();
    setTracking(false);
    setPosition(null);
    setIssue("denied");
  }

  function handleFix(here: LatLng, accuracy: number) {
    positionRef.current = here;
    setPosition(here);
    setAccuracy(accuracy);
    setIssue((current) => (current === "unavailable" ? null : current));
    const last = lastLookupRef.current;
    const sharper =
      quickStart && lookupAccuracyRef.current > SHARPER_FIX_METERS && accuracy < lookupAccuracyRef.current / 2;
    if (last && distanceMeters(last, here) < NEAREST_LOOKUP_METERS && !sharper) return;
    lookupAccuracyRef.current = accuracy;
    lookupNearest(here);
  }

  function handleWebFix(result: GeolocationPosition) {
    handleFix({ lat: result.coords.latitude, lng: result.coords.longitude }, result.coords.accuracy);
  }

  function beginWatch() {
    if (background && isNativeApp()) {
      stopNativeWatchRef.current = watchBackgroundLocation(
        background,
        ({ lat, lng, accuracy }) => handleFix({ lat, lng }, accuracy),
        handleDenied,
        () => setIssue("unavailable"),
      );
      return;
    }
    if (!("geolocation" in navigator)) {
      queueMicrotask(() => {
        setTracking(false);
        setIssue("unsupported");
      });
      return;
    }
    if (quickStart) {
      navigator.geolocation.getCurrentPosition(
        (result) => {
          if (watchIdRef.current !== null && !positionRef.current) handleWebFix(result);
        },
        () => {},
        { enableHighAccuracy: false, maximumAge: QUICK_FIX_MAX_AGE_MS, timeout: 8000 },
      );
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleWebFix,
      (error) => {
        if (error.code === error.PERMISSION_DENIED) handleDenied();
        else setIssue("unavailable");
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );
  }

  function start() {
    if (watching()) {
      if (positionRef.current) lookupNearest(positionRef.current);
      return;
    }
    setTracking(true);
    setIssue(null);
    beginWatch();
  }

  /** Forces a fresh high-accuracy fix (ignores cached positions) and re-resolves the nearest station. */
  function relocate(): Promise<StationOption | null> {
    if (!("geolocation" in navigator)) {
      setIssue("unsupported");
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (result) => {
          const here = { lat: result.coords.latitude, lng: result.coords.longitude };
          positionRef.current = here;
          setPosition(here);
          setAccuracy(result.coords.accuracy);
          setIssue(null);
          if (!watching()) {
            setTracking(true);
            beginWatch();
          }
          lookupAccuracyRef.current = result.coords.accuracy;
          resolve(lookupNearest(here));
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            handleDenied();
          } else {
            setIssue("unavailable");
          }
          resolve(null);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
      );
    });
  }

  function stop() {
    clearWatch();
    setTracking(false);
    setPosition(null);
    setAccuracy(null);
    setNearest(null);
    setLookupPosition(null);
    setIssue(null);
  }

  function dismissIssue() {
    setIssue(null);
  }

  const mountTracker = useEffectEvent(() => {
    if (autoStart) beginWatch();
  });
  const unmountTracker = useEffectEvent(() => clearWatch());
  useEffect(() => {
    mountTracker();
    return () => unmountTracker();
  }, []);

  return { tracking, position, accuracy, nearest, lookupPosition, issue, start, stop, relocate, dismissIssue };
}
