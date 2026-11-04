import type { Metadata } from "next";
import GoogleSeoSchema from "./_components/GoogleSeoSchema";
import HomeScreen from "./_components/HomeScreen";
import { COPY, HOME_KEYWORDS, homeMetaTitle } from "./_lib/guideCopy";
import { guideLanguages, SITE_URL } from "./_lib/site";

const TITLE = homeMetaTitle("en");
const DESCRIPTION = COPY.homeDescription.en;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: HOME_KEYWORDS,
  alternates: { canonical: "/", languages: guideLanguages("") },
  openGraph: { type: "website", siteName: "K-Sub", title: TITLE, description: DESCRIPTION, locale: "ko_KR", url: "/" },
};

export default function Home() {
  return (
    <>
      <GoogleSeoSchema url={`${SITE_URL}/`} inLanguage="ko" />
      <HomeScreen />
    </>
  );
}
