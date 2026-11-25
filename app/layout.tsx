import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import AndroidBackHandler from "./_components/AndroidBackHandler";
import ArrivalAlarmRunner from "./_components/ArrivalAlarmRunner";
import BadgeCelebration from "./_components/BadgeCelebration";
import PreloadResources from "./_components/PreloadResources";
import ServerErrorToast from "./_components/ServerErrorToast";
import SplashScreen from "./_components/SplashScreen";
import { ADSENSE_LOADER, BOOT_SCRIPT, THEME_COLORS } from "./_lib/bootScript";
import {
  ADSENSE_CLIENT_ID,
  SITE_BRAND_ALTERNATE_NAMES,
  SITE_BRAND_DESCRIPTION,
  SITE_BRAND_DISPLAY,
  SITE_BRAND_NAME,
  SITE_BRAND_TITLE,
  SITE_LOGO_URL,
  SITE_ORGANIZATION_ID,
  SITE_URL,
  SITE_WEBSITE_ID,
} from "./_lib/site";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/**
 * One site-wide graph for the brand: the WebSite node answers “k-sub com” / “지하철꿀정보” navigational
 * queries, and the Organization node gives AI answer engines a single publisher entity to cite.
 * Pages reference these ids instead of repeating the entities.
 */
const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": SITE_WEBSITE_ID,
      name: SITE_BRAND_NAME,
      alternateName: [...SITE_BRAND_ALTERNATE_NAMES],
      url: `${SITE_URL}/`,
      description: SITE_BRAND_DESCRIPTION,
      inLanguage: "ko-KR",
      publisher: { "@id": SITE_ORGANIZATION_ID },
    },
    {
      "@type": "Organization",
      "@id": SITE_ORGANIZATION_ID,
      name: SITE_BRAND_NAME,
      alternateName: [...SITE_BRAND_ALTERNATE_NAMES],
      url: `${SITE_URL}/`,
      logo: { "@type": "ImageObject", url: SITE_LOGO_URL },
      description: SITE_BRAND_DESCRIPTION,
      areaServed: { "@type": "Country", name: "South Korea" },
      knowsLanguage: ["ko", "en", "ja", "zh"],
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_BRAND_TITLE,
  description: SITE_BRAND_DESCRIPTION,
  applicationName: SITE_BRAND_DISPLAY,
  openGraph: {
    type: "website",
    siteName: SITE_BRAND_DISPLAY,
    title: SITE_BRAND_TITLE,
    description: SITE_BRAND_DESCRIPTION,
    locale: "ko_KR",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_BRAND_TITLE,
    description: SITE_BRAND_DESCRIPTION,
    site: SITE_BRAND_DISPLAY,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
  other: { "google-adsense-account": ADSENSE_CLIENT_ID },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: THEME_COLORS.light,
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      data-theme="light"
      suppressHydrationWarning
      className={`${notoSansKr.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: ADSENSE_LOADER }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD).replace(/</g, "\\u003c") }}
        />
      </head>
      <GoogleTagManager gtmId="GTM-5RW9WQZH" />
      <body className={`${notoSansKr.className} min-h-full flex flex-col`}>
        <PreloadResources />
        {children}
        <AndroidBackHandler />
        <ArrivalAlarmRunner />
        <ServerErrorToast />
        <BadgeCelebration />
        <SplashScreen />
      </body>
    </html>
  );
}
