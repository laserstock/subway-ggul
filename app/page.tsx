import type { Metadata } from "next";
import { JsonLd } from "./[lang]/_guide/parts";
import HomeScreen from "./_components/HomeScreen";
import { guideLanguages, SITE_URL } from "./_lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/", languages: guideLanguages("") },
};

/** Google takes a domain's site name from the WebSite data on its home page. */
const SITE_NAME = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "K-Sub",
  alternateName: ["K-Sub Seoul Subway Guide", "지하철꿀정보", "k-sub.com"],
  url: `${SITE_URL}/`,
};

export default function Home() {
  return (
    <>
      <JsonLd data={SITE_NAME} />
      <HomeScreen />
    </>
  );
}
