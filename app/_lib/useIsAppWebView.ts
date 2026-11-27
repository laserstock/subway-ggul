"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "ksub_platform";
const APP_MARK = "app";

type BridgeWindow = Window & {
  Capacitor?: { isNativePlatform?: () => boolean };
  ReactNativeWebView?: unknown;
  webkit?: { messageHandlers?: Record<string, unknown> };
};

function persistAppFlagFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("platform") === "app" || params.get("utm_source") === "app") {
      sessionStorage.setItem(STORAGE_KEY, APP_MARK);
    }
  } catch {
    /* private mode / blocked storage */
  }
}

function hasAppQueryOrSession() {
  try {
    if (sessionStorage.getItem(STORAGE_KEY) === APP_MARK) return true;
  } catch {
    /* ignore */
  }
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("platform") === "app" || params.get("utm_source") === "app";
  } catch {
    return false;
  }
}

function hasWebViewBridge() {
  const win = window as BridgeWindow;
  if (win.Capacitor?.isNativePlatform?.()) return true;
  if (win.ReactNativeWebView) return true;
  const handlers = win.webkit?.messageHandlers;
  if (!handlers) return false;
  // Avoid plain iOS Safari false positives: require a known native bridge key.
  return Boolean(handlers.capacitor || handlers.bridge || handlers.ReactNativeWebView);
}

function hasWebViewUserAgent() {
  const ua = navigator.userAgent || "";
  if (/\bwv\b/i.test(ua) || /WebView/i.test(ua)) return true;
  // Capacitor / custom shells often keep Android + Version/ without Chrome.
  if (/Android/i.test(ua) && /Version\/[\d.]+/i.test(ua) && !/Chrome\/[\d.]+Mobile/i.test(ua)) return true;
  return false;
}

function detectIsAppWebView() {
  if (typeof window === "undefined") return true;
  persistAppFlagFromUrl();
  const isApp = hasAppQueryOrSession() || hasWebViewBridge() || hasWebViewUserAgent();
  // Keep in sync with BOOT_SCRIPT so [data-web-seo] CSS hide stays reliable after client nav.
  try {
    if (isApp) document.documentElement.setAttribute("data-platform", "app");
    else document.documentElement.removeAttribute("data-platform");
  } catch {
    /* ignore */
  }
  return isApp;
}

const noopSubscribe = () => () => {};

/**
 * `true` inside the mobile app WebView (or until the client proves it is a normal browser).
 * Defaults to `true` on SSR / first paint so affiliate UI never flashes inside the app.
 */
export function useIsAppWebView() {
  return useSyncExternalStore(noopSubscribe, detectIsAppWebView, () => true);
}
