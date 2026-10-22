"use client";

import { useEffect, useState } from "react";
import { t, type Localized } from "../_lib/i18n";
import { useLocale } from "../_lib/locale";
import { onServerError, type ServerErrorKind } from "../_lib/supabase";

const COPY: Record<ServerErrorKind, Localized> = {
  offline: {
    ko: "서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요",
    en: "Couldn't reach the server. Please try again shortly",
    zh: "无法连接服务器，请稍后再试",
    ja: "サーバーに接続できませんでした。しばらくしてからお試しください",
  },
  limit: {
    ko: "너무 빠르게 올리고 있어요. 잠시 후 다시 시도해 주세요",
    en: "You're posting too fast. Please wait a moment",
    zh: "发布太频繁了，请稍后再试",
    ja: "投稿が早すぎます。少し待ってからお試しください",
  },
};

/** One app-wide toast for failed writes; optimistic updates roll back on their own. */
export default function ServerErrorToast() {
  const locale = useLocale();
  const [kind, setKind] = useState<ServerErrorKind | null>(null);

  useEffect(() => {
    let timer: number | undefined;
    const off = onServerError((next) => {
      setKind(next);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setKind(null), 2600);
    });
    return () => {
      off();
      window.clearTimeout(timer);
    };
  }, []);

  if (!kind) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[120] flex justify-center px-6">
      <p
        role="alert"
        className="w-full max-w-[345px] rounded-xl bg-neutral-900/90 px-4 py-2.5 text-center text-[13px] font-medium text-white"
      >
        {t(COPY[kind], locale)}
      </p>
    </div>
  );
}
