import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import ArrivalAlarmRunner from "./_components/ArrivalAlarmRunner";
import PreloadResources from "./_components/PreloadResources";
import ServerErrorToast from "./_components/ServerErrorToast";
import SplashScreen from "./_components/SplashScreen";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "지하철꿀정보",
  description: "역 주변과 동선 상의 시설을 가장 빠르게 찾아보세요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" data-theme="light" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className={`${notoSansKr.className} min-h-full flex flex-col`}>
        <PreloadResources />
        {children}
        <ArrivalAlarmRunner />
        <ServerErrorToast />
        <SplashScreen />
      </body>
    </html>
  );
}
