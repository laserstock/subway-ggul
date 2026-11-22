import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GUIDE_STATIONS, guideDetail, guideStation } from "../../_lib/guide";
import { SITE_BRAND_DISPLAY, SITE_URL } from "../../_lib/site";
import { stationOptionFromGuide } from "../../_lib/stationAppPath";
import StationDashboard from "../StationDashboard";
import StationSeoPanel from "../StationSeoPanel";

export function generateStaticParams() {
  return GUIDE_STATIONS.map((station) => ({ slug: station.slug }));
}

type StationSlugParams = Promise<{ slug: string }>;

async function resolve(params: StationSlugParams) {
  const { slug } = await params;
  const station = guideStation(slug);
  if (!station) return null;
  return { station, detail: guideDetail(station), option: stationOptionFromGuide(station) };
}

export async function generateMetadata({ params }: { params: StationSlugParams }): Promise<Metadata> {
  "use cache";
  cacheLife("max");
  const found = await resolve(params);
  if (!found) return {};
  const { station } = found;
  const enName = station.name.en.replace(/\s+station$/i, "");
  const title = `${enName} Station Exit, Restroom & Elevator Guide | ${SITE_BRAND_DISPLAY}`;
  const description = `Find inside-gate restrooms, elevator exits, Daiso, Starbucks, and luggage lockers near ${enName} Station on Seoul Subway via k-sub.com.`;
  const url = `${SITE_URL}/station/${station.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_BRAND_DISPLAY,
      title,
      description,
      url,
    },
    twitter: { card: "summary_large_image", title, description, site: SITE_BRAND_DISPLAY },
    robots: { index: true, follow: true },
  };
}

function DashboardFallback() {
  return (
    <div className="flex min-h-[50vh] justify-center bg-frame">
      <div className="relative flex h-[70vh] w-full max-w-[393px] flex-col overflow-hidden bg-app shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <div className="mx-4 mt-4 h-[118px] animate-pulse rounded-2xl bg-[#fff3c4]" />
        <div className="mx-4 mt-4 grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="h-[54px] animate-pulse rounded-[22px] bg-surface-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function StationSlugPage({ params }: { params: StationSlugParams }) {
  "use cache";
  cacheLife("max");
  const found = await resolve(params);
  if (!found) notFound();
  const { station, detail, option } = found;

  return (
    <div className="flex min-h-dvh flex-col bg-frame">
      <StationSeoPanel station={station} detail={detail} />
      <Suspense fallback={<DashboardFallback />}>
        <StationDashboard station={option} />
      </Suspense>
    </div>
  );
}
