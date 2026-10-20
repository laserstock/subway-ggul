"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { LatLng } from "../KakaoMap";
import { loadKakaoMaps } from "../kakao-sdk";
import { findNearestStation } from "../kakao-places";
import { distanceMeters, kakaoOption, type Localized, type StationOption } from "./stations";

const NEAREST_LOOKUP_METERS = 150;

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
  onNearest,
}: {
  autoStart?: boolean;
  onNearest?: (update: NearestUpdate) => void;
} = {}) {
  const [tracking, setTracking] = useState(autoStart);
  const [position, setPosition] = useState<LatLng | null>(null);
  const [nearest, setNearest] = useState<StationOption | null>(null);
  const [issue, setIssue] = useState<LocationIssue | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastLookupRef = useRef<LatLng | null>(null);
  const lookupSeqRef = useRef(0);
  const positionRef = useRef<LatLng | null>(null);
  const onNearestRef = useRef(onNearest);

  useEffect(() => {
    onNearestRef.current = onNearest;
  });

  function lookupNearest(here: LatLng) {
    const seq = ++lookupSeqRef.current;
    lastLookupRef.current = here;
    loadKakaoMaps()
      .then(() => findNearestStation(here))
      .then((found) => {
        if (seq !== lookupSeqRef.current) return;
        if (!found) {
          setIssue("noStation");
          return;
        }
        const station = kakaoOption(found.station);
        setIssue(null);
        setNearest(station);
        onNearestRef.current?.({ station, position: here, seq });
      })
      .catch(() => {
        if (seq !== lookupSeqRef.current) return;
        lastLookupRef.current = null;
        setIssue("lookupFailed");
      });
  }

  function clearWatch() {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
    lookupSeqRef.current += 1;
    lastLookupRef.current = null;
    positionRef.current = null;
  }

  function beginWatch() {
    if (!("geolocation" in navigator)) {
      queueMicrotask(() => {
        setTracking(false);
        setIssue("unsupported");
      });
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (result) => {
        const here = { lat: result.coords.latitude, lng: result.coords.longitude };
        positionRef.current = here;
        setPosition(here);
        setIssue((current) => (current === "unavailable" ? null : current));
        const last = lastLookupRef.current;
        if (last && distanceMeters(last, here) < NEAREST_LOOKUP_METERS) return;
        lookupNearest(here);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          clearWatch();
          setTracking(false);
          setPosition(null);
          setIssue("denied");
        } else {
          setIssue("unavailable");
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );
  }

  function start() {
    if (watchIdRef.current !== null) {
      if (positionRef.current) lookupNearest(positionRef.current);
      return;
    }
    setTracking(true);
    setIssue(null);
    beginWatch();
  }

  function stop() {
    clearWatch();
    setTracking(false);
    setPosition(null);
    setNearest(null);
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

  return { tracking, position, nearest, issue, start, stop, dismissIssue };
}
