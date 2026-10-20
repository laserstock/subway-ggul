"use client";

import { useEffect, useState } from "react";

export const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

const SDK_URL = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&libraries=services&autoload=false`;

let loading: Promise<void> | null = null;

export function loadKakaoMaps(): Promise<void> {
  if (!KAKAO_APP_KEY) return Promise.reject(new Error("NEXT_PUBLIC_KAKAO_MAP_KEY is not set"));
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = () => kakao.maps.load(() => resolve());
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error("Failed to load Kakao Maps SDK"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

export type KakaoStatus = "loading" | "ready" | "error";

export function useKakaoMaps(): KakaoStatus {
  const [status, setStatus] = useState<KakaoStatus>("loading");
  useEffect(() => {
    let alive = true;
    loadKakaoMaps().then(
      () => alive && setStatus("ready"),
      () => alive && setStatus("error"),
    );
    return () => {
      alive = false;
    };
  }, []);
  return status;
}
