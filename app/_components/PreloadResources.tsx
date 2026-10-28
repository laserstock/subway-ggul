"use client";

import { usePathname } from "next/navigation";
import ReactDOM from "react-dom";
import { guideLocale } from "../_lib/site";
import { KAKAO_APP_KEY, SDK_URL } from "../kakao-sdk";

/** Starts fetching the Kakao SDK with the HTML instead of after hydration; the map-free guides skip it. */
export default function PreloadResources() {
  const pathname = usePathname();
  if (KAKAO_APP_KEY && !guideLocale(pathname)) {
    ReactDOM.preconnect("https://dapi.kakao.com");
    ReactDOM.preconnect("https://t1.daumcdn.net");
    ReactDOM.preload(SDK_URL, { as: "script" });
  }
  return null;
}
