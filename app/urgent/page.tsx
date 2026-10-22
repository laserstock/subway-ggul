import type { Metadata } from "next";
import { Suspense } from "react";
import AppHeader from "../_components/AppHeader";
import { stationFromParams } from "../_lib/stations";
import { URGENT_TITLE, UrgentIcon } from "./header";
import UrgentScreen from "./UrgentScreen";

export const metadata: Metadata = {
  title: "긴급 화장실 · 약국 · 병원 · 지하철꿀정보",
};

type SearchParams = PageProps<"/urgent">["searchParams"];

async function UrgentContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return <UrgentScreen initialStation={stationFromParams(params)} follow={params.near === "1"} />;
}

function UrgentShell() {
  return (
    <div className="flex min-h-dvh justify-center bg-frame">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-app shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <AppHeader backHref="/" title={URGENT_TITLE} icon={<UrgentIcon />} />
        <div className="mx-4 h-[34px] animate-pulse rounded- bg-surface-muted" />
        <div className="mx-4 mt-3 h-[44px] animate-pulse rounded-xl bg-[#efe9ff]" />
        <div className="mx-4 mt-3 h-[150px] animate-pulse rounded- bg-surface-muted" />
        <div className="mx-4 mt-3 h-[200px] animate-pulse rounded- bg-surface-muted" />
      </div>
    </div>
  );
}

export default function UrgentPage({ searchParams }: PageProps<"/urgent">) {
  return (
    <Suspense fallback={<UrgentShell />}>
      <UrgentContent searchParams={searchParams} />
    </Suspense>
  );
}
