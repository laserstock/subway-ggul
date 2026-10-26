import type { Metadata } from "next";
import { Suspense } from "react";
import AppHeader from "../_components/AppHeader";
import { isRouteMode, ROUTE_TITLE, RouteIcon } from "./header";
import { routeStation } from "./params";
import RouteScreen from "./RouteScreen";

export const metadata: Metadata = {
  title: "최적경로 찾기 · 지하철꿀정보",
};

type SearchParams = PageProps<"/route">["searchParams"];

async function RouteContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const from = routeStation(params, "from");
  const to = routeStation(params, "to");
  const mode = isRouteMode(params.mode) ? params.mode : "fastest";
  return <RouteScreen key={`${from?.key ?? ""}|${to?.key ?? ""}`} from={from} to={to} initialMode={mode} />;
}

function RouteShell() {
  return (
    <div className="flex min-h-dvh justify-center bg-frame">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-app shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <AppHeader backHref="/" title={ROUTE_TITLE} icon={<RouteIcon />} />
        <div className="mx-4 h-[104px] animate-pulse rounded-2xl bg-surface-muted" />
        <div className="mx-4 mt-3 h-[44px] animate-pulse rounded-xl bg-surface-muted" />
        <div className="mx-4 mt-3 h-[320px] animate-pulse rounded-2xl bg-surface-muted" />
      </div>
    </div>
  );
}

export default function RoutePage({ searchParams }: PageProps<"/route">) {
  return (
    <Suspense fallback={<RouteShell />}>
      <RouteContent searchParams={searchParams} />
    </Suspense>
  );
}
