import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import Script from "next/script";
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
  SITE_URL,
} from "./_lib/site";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_BRAND_NAME,
  alternateName: [...SITE_BRAND_ALTERNATE_NAMES],
  url: `${SITE_URL}/`,
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD).replace(/</g, "\\u003c") }}
        />
        <Script
          id="travelpayouts"
          src="https://emrldtp.cc/NjAzMTU3.js?t=603157"
          strategy="afterInteractive"
          data-cmp-ab="2"
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
