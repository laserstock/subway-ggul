"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "../_lib/locale";
import { isNativeApp } from "../_lib/native";
import { t, type Localized } from "../_lib/stations";

const EXIT_WINDOW_MS = 2200;

const COPY = {
  pressAgain: {
    ko: "한 번 더 누르면 앱이 종료됩니다",
    en: "Press back again to exit",
    zh: "再按一次返回键退出应用",
    ja: "もう一度押すとアプリを終了します",
  },
} satisfies Record<string, Localized>;

function isHomePath(pathname: string) {
  return pathname === "/" || pathname === "";
}

/** Close the top-most in-app sheet/dialog before leaving the screen. */
function closeTopOverlay(): boolean {
  // Ignore closed overlays that stay mounted for exit animations (they used to
  // keep role="dialog" and swallow every Android back press on the home screen).
  const open = document.querySelector(
    '[data-overlay-open="true"], [role="dialog"][aria-modal="true"]:not([aria-hidden="true"]):not([inert])',
  );
  if (!open) return false;
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  return true;
}

/**
 * Android system back: close overlay → go home → confirm → exit.
 * Only active inside the Capacitor shell (`@capacitor/app`).
 */
export default function AndroidBackHandler() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const locale = useLocale();
  const [toast, setToast] = useState<string | null>(null);
  const lastHomeBackAt = useRef(0);
  const pathnameRef = useRef(pathname);
  const toastTimer = useRef<number | null>(null);

  pathnameRef.current = pathname;

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!isNativeApp()) return;

    let removed = false;
    let handle: { remove: () => Promise<void> } | null = null;

    function showExitHint() {
      setToast(t(COPY.pressAgain, locale));
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToast(null), EXIT_WINDOW_MS);
    }

    void import("@capacitor/app").then(({ App }) => {
      if (removed) return;
      return App.addListener("backButton", () => {
        if (closeTopOverlay()) {
          lastHomeBackAt.current = 0;
          return;
        }

        if (!isHomePath(pathnameRef.current)) {
          lastHomeBackAt.current = 0;
          setToast(null);
          router.push("/");
          return;
        }

        const now = Date.now();
        if (now - lastHomeBackAt.current < EXIT_WINDOW_MS) {
          lastHomeBackAt.current = 0;
          void App.exitApp();
          return;
        }

        lastHomeBackAt.current = now;
        showExitHint();
      }).then((listener) => {
        if (removed) {
          void listener.remove();
          return;
        }
        handle = listener;
      });
    });

    return () => {
      removed = true;
      void handle?.remove();
    };
  }, [locale, router]);

  if (!toast) return null;

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-5 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[200] rounded-xl bg-neutral-900/92 px-4 py-2.5 text-center text-[13px] font-semibold text-white shadow-lg"
    >
      {toast}
    </div>
  );
}
