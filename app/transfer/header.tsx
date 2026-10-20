import type { Localized } from "../_lib/stations";

export const TRANSFER_TITLE: Localized = {
  ko: "⚡ 빠른환승 & 편한길",
  en: "⚡ Fast Transfer & Easy Route",
  zh: "⚡ 快速换乘 & 舒适路线",
  ja: "⚡ スムーズ乗換 & らくらくルート",
};

export const TRANSFER_TABS = ["fast", "barrierFree", "facilities"] as const;
export type TransferTab = (typeof TRANSFER_TABS)[number];

export function isTransferTab(value: unknown): value is TransferTab {
  return TRANSFER_TABS.includes(value as TransferTab);
}

export function TransferIcon() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#e5efff] text-[18px]" aria-hidden>
      🛗
    </span>
  );
}
