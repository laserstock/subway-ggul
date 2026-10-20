import type { Metadata } from "next";
import { Suspense } from "react";
import AppHeader from "../_components/AppHeader";
import { stationFromParams } from "../_lib/stations";
import ShopsScreen, { type ShopCategoryId } from "./ShopsScreen";

export const metadata: Metadata = {
  title: "출구 매장 & 픽업 · 지하철꿀정보",
};

const CATEGORY_IDS: ShopCategoryId[] = ["oliveyoung", "daiso", "cafe", "convenience"];

type SearchParams = PageProps<"/shops">["searchParams"];

async function ShopsContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : null;
  return (
    <ShopsScreen
      initialStation={stationFromParams(params)}
      initialCategory={CATEGORY_IDS.find((id) => id === category) ?? null}
      follow={params.near === "1"}
    />
  );
}

function ShopsShell() {
  return (
    <div className="flex min-h-dvh justify-center bg-[#e8eaed]">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-white shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <AppHeader backHref="/" />
        <div className="mx-4 h-[42px] animate-pulse rounded-full bg-[#f3f4f6]" />
        <div className="mt-3 flex-1 animate-pulse bg-[#eef1f5]" />
      </div>
    </div>
  );
}

export default function ShopsPage({ searchParams }: PageProps<"/shops">) {
  return (
    <Suspense fallback={<ShopsShell />}>
      <ShopsContent searchParams={searchParams} />
    </Suspense>
  );
}
