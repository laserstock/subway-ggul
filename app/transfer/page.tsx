import type { Metadata } from "next";
import { Suspense } from "react";
import AppHeader from "../_components/AppHeader";
import { stationFromParams } from "../_lib/stations";
import { isTransferTab, TRANSFER_TITLE, TransferIcon } from "./header";
import TransferScreen from "./TransferScreen";

export const metadata: Metadata = {
  title: "빠른환승 & 편한길 · 지하철꿀정보",
};

type SearchParams = PageProps<"/transfer">["searchParams"];

async function TransferContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const station = stationFromParams(params);
  const tab = isTransferTab(params.tab) ? params.tab : "fast";
  return <TransferScreen key={station?.key ?? "none"} initialStation={station} initialTab={tab} />;
}

function TransferShell() {
  return (
    <div className="flex min-h-dvh justify-center bg-frame">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-app shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <AppHeader backHref="/" title={TRANSFER_TITLE} icon={<TransferIcon />} />
        <div className="mx-4 h-[58px] animate-pulse rounded-2xl bg-surface-muted" />
        <div className="mx-4 mt-3 h-[44px] animate-pulse rounded-xl bg-[#e5efff]" />
        <div className="mx-4 mt-3 h-[220px] animate-pulse rounded-2xl bg-surface-muted" />
        <div className="mx-4 mt-3 h-[120px] animate-pulse rounded-2xl bg-surface-muted" />
      </div>
    </div>
  );
}

export default function TransferPage({ searchParams }: PageProps<"/transfer">) {
  return (
    <Suspense fallback={<TransferShell />}>
      <TransferContent searchParams={searchParams} />
    </Suspense>
  );
}
