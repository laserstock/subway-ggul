import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import ArrivalAlarmRunner from "./_components/ArrivalAlarmRunner";
import BadgeCelebration from "./_components/BadgeCelebration";
import PreloadResources from "./_components/PreloadResources";
import ServerErrorToast from "./_components/ServerErrorToast";
import SplashScreen from "./_components/SplashScreen";
import { THEME_COLORS, THEME_INIT_SCRIPT } from "./_lib/themeInit";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const DESCRIPTION = "역 주변과 동선 상의 시설을 가장 빠르게 찾아보세요.";

export const metadata: Metadata = {
  metadataBase: new URL("https://subway-ggul.vercel.app"),
  title: "지하철꿀정보",
  description: DESCRIPTION,
  applicationName: "지하철꿀정보",
  openGraph: {
    type: "website",
    siteName: "지하철꿀정보",
    title: "지하철꿀정보",
    description: DESCRIPTION,
    locale: "ko_KR",
  },
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
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${notoSansKr.className} min-h-full flex flex-col`}>
        <PreloadResources />
        {children}
        <ArrivalAlarmRunner />
        <ServerErrorToast />
        <BadgeCelebration />
        <SplashScreen />
      </body>
    </html>
  );
}
