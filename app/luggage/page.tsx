import type { Metadata } from "next";
import { Suspense } from "react";
import AppHeader from "../_components/AppHeader";
import { stationFromParams } from "../_lib/stations";
import { LUGGAGE_TITLE, LuggageIcon } from "./header";
import LuggageScreen from "./LuggageScreen";

export const metadata: Metadata = {
  title: "짐보관 · 또타라커 · 러기지 · 스토리지 · 지하철꿀정보",
};

type SearchParams = PageProps<"/luggage">["searchParams"];

async function LuggageContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const station = stationFromParams(params);
  const follow = params.near === "1";
  return (
    <LuggageScreen key={`${station?.key ?? "none"}:${follow ? "near" : "pin"}`} initialStation={station} follow={follow} />
  );
}

function LuggageShell() {
  return (
    <div className="flex min-h-dvh justify-center bg-frame">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-app shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <AppHeader backHref="/" title={LUGGAGE_TITLE} icon={<LuggageIcon />} />
        <div className="mx-4 h-[44px] animate-pulse rounded-full bg-surface-muted" />
        <div className="mx-4 mt-3 h-[120px] animate-pulse rounded-2xl bg-[#e3f6ea]" />
        <div className="mx-4 mt-3 h-[220px] animate-pulse rounded-2xl bg-surface-muted" />
        <div className="mx-4 mt-3 h-[160px] animate-pulse rounded-2xl bg-surface-muted" />
      </div>
    </div>
  );
}

export default function LuggagePage({ searchParams }: PageProps<"/luggage">) {
  return (
    <Suspense fallback={<LuggageShell />}>
      <LuggageContent searchParams={searchParams} />
    </Suspense>
  );
}
