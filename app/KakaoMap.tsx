"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { KAKAO_APP_KEY, useKakaoMaps } from "./kakao-sdk";

export type LatLng = { lat: number; lng: number };

export type MapOverlay = {
  key: string;
  position: LatLng;
  content: ReactNode;
  zIndex?: number;
  yAnchor?: number;
};

export default function KakaoMap({
  center,
  focus,
  level = 3,
  overlays,
}: {
  center: LatLng;
  focus?: LatLng | null;
  level?: number;
  overlays: MapOverlay[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const overlaysRef = useRef(overlays);
  const ready = useKakaoMaps() === "ready";

  const overlayKeys = overlays.map((overlay) => overlay.key).join("|");
  const layoutKey = overlays
    .map(
      (overlay) =>
        `${overlay.key}@${overlay.position.lat},${overlay.position.lng}#${overlay.zIndex ?? 0}`,
    )
    .join("|");

  const hosts = useMemo(() => {
    if (!ready) return null;
    return new Map(
      overlayKeys
        .split("|")
        .filter(Boolean)
        .map((key) => [key, document.createElement("div")]),
    );
  }, [ready, overlayKeys]);

  useEffect(() => {
    overlaysRef.current = overlays;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!ready || !container) return;
    const position = new kakao.maps.LatLng(center.lat, center.lng);
    if (mapRef.current) {
      mapRef.current.setCenter(position);
    } else {
      mapRef.current = new kakao.maps.Map(container, { center: position, level });
    }
  }, [ready, center.lat, center.lng, level]);

  const focusLat = focus?.lat;
  const focusLng = focus?.lng;
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || focusLat === undefined || focusLng === undefined) return;
    map.panTo(new kakao.maps.LatLng(focusLat, focusLng));
  }, [ready, focusLat, focusLng]);

  useEffect(() => {
    const container = containerRef.current;
    if (!ready || !container) return;
    const observer = new ResizeObserver(() => {
      const map = mapRef.current;
      if (!map) return;
      map.relayout();
      map.setCenter(new kakao.maps.LatLng(center.lat, center.lng));
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [ready, center.lat, center.lng]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !hosts) return;
    const created = overlaysRef.current.flatMap((overlay) => {
      const host = hosts.get(overlay.key);
      if (!host) return [];
      return [
        new kakao.maps.CustomOverlay({
          map,
          position: new kakao.maps.LatLng(overlay.position.lat, overlay.position.lng),
          content: host,
          clickable: true,
          zIndex: overlay.zIndex,
          yAnchor: overlay.yAnchor,
        }),
      ];
    });
    return () => created.forEach((overlay) => overlay.setMap(null));
  }, [hosts, layoutKey]);

  if (!KAKAO_APP_KEY) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#eef1f3] px-6 text-center text-[13px] text-neutral-500">
        NEXT_PUBLIC_KAKAO_MAP_KEY 환경 변수가 없어 지도를 불러올 수 없어요.
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} className="absolute inset-0 bg-[#eef1f3]" />
      {hosts
        ? overlays.map((overlay) => {
            const host = hosts.get(overlay.key);
            return host ? createPortal(overlay.content, host, overlay.key) : null;
          })
        : null}
    </>
  );
}
