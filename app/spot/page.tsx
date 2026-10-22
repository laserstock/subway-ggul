import type { Metadata } from "next";
import { Suspense } from "react";
import AppHeader from "../_components/AppHeader";
import { SPOT_TITLE, SpotIcon } from "./header";
import SpotScreen, { SpotSkeleton } from "./SpotScreen";

export const metadata: Metadata = {
  title: "꿀스팟 · 호선별 광장 · 지하철꿀정보",
};

type SearchParams = PageProps<"/spot">["searchParams"];

async function SpotContent({ searchParams }: { searchParams: SearchParams }) {
  const { line } = await searchParams;
  const initialLine = typeof line === "string" && line.trim() ? line.trim().slice(0, 20) : null;
  return <SpotScreen key={initialLine ?? "auto"} initialLine={initialLine} />;
}

function SpotShell() {
  return (
    <div className="flex min-h-dvh justify-center bg-frame">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-app shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <AppHeader backHref="/" title={SPOT_TITLE} icon={<SpotIcon />} />
        <SpotSkeleton />
      </div>
    </div>
  );
}

export default function SpotPage({ searchParams }: PageProps<"/spot">) {
  return (
    <Suspense fallback={<SpotShell />}>
      <SpotContent searchParams={searchParams} />
    </Suspense>
  );
}
