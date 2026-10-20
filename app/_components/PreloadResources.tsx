"use client";

import ReactDOM from "react-dom";
import { KAKAO_APP_KEY, SDK_URL } from "../kakao-sdk";

/** Starts fetching the Kakao SDK with the HTML instead of after hydration. */
export default function PreloadResources() {
  if (KAKAO_APP_KEY) {
    ReactDOM.preconnect("https://dapi.kakao.com");
    ReactDOM.preconnect("https://t1.daumcdn.net");
    ReactDOM.preload(SDK_URL, { as: "script" });
  }
  return null;
}
