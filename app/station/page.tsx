import type { Metadata } from "next";
import { Suspense } from "react";
import AppHeader from "../_components/AppHeader";
import { stationFromParams } from "../_lib/stations";
import { DASHBOARD_TITLE } from "./header";
import StationDashboard from "./StationDashboard";

export const metadata: Metadata = {
  title: "역 꿀정보 · 지하철꿀정보",
};

type SearchParams = PageProps<"/station">["searchParams"];

async function DashboardContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const station = stationFromParams(params);
  return <StationDashboard key={station?.key ?? "none"} station={station} />;
}

function DashboardShell() {
  return (
    <div className="flex min-h-dvh justify-center bg-frame">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-app shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <AppHeader backHref="/" title={DASHBOARD_TITLE} />
        <div className="mx-4 h-[118px] animate-pulse rounded-2xl bg-[#fff3c4]" />
        <div className="mx-4 mt-4 grid grid-cols-2 gap-2.5">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="h-[124px] animate-pulse rounded-2xl bg-surface-muted" />
          ))}
        </div>
        <div className="mx-4 mt-4 h-[230px] animate-pulse rounded-2xl bg-surface-muted" />
      </div>
    </div>
  );
}

export default function StationPage({ searchParams }: PageProps<"/station">) {
  return (
    <Suspense fallback={<DashboardShell />}>
      <DashboardContent searchParams={searchParams} />
    </Suspense>
  );
}
