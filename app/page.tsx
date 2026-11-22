import type { Metadata } from "next";
import GoogleSeoSchema from "./_components/GoogleSeoSchema";
import HomeScreen from "./_components/HomeScreen";
import { HOME_KEYWORDS } from "./_lib/guideCopy";
import {
  SITE_BRAND_DESCRIPTION,
  SITE_BRAND_DISPLAY,
  SITE_BRAND_TITLE,
  SITE_URL,
} from "./_lib/site";

export const metadata: Metadata = {
  title: SITE_BRAND_TITLE,
  description: SITE_BRAND_DESCRIPTION,
  keywords: [...HOME_KEYWORDS, "k-sub com", "k-sub.com", "www.k-sub.com", "K-SUB", "케이서브"],
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    type: "website",
    siteName: SITE_BRAND_DISPLAY,
    title: SITE_BRAND_TITLE,
    description: SITE_BRAND_DESCRIPTION,
    locale: "ko_KR",
    url: `${SITE_URL}/`,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_BRAND_TITLE,
    description: SITE_BRAND_DESCRIPTION,
    site: SITE_BRAND_DISPLAY,
  },
};

export default function Home() {
  return (
    <>
      <GoogleSeoSchema url={`${SITE_URL}/`} inLanguage="ko" />
      <HomeScreen />
    </>
  );
}
