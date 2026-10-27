import type { Metadata } from "next";
import LegalScreen from "../_components/LegalScreen";
import { TERMS_SECTIONS, TERMS_TITLE } from "../_lib/legal";

export const metadata: Metadata = {
  title: "이용약관 · 지하철꿀정보",
};

export default function TermsPage() {
  return <LegalScreen title={TERMS_TITLE} sections={TERMS_SECTIONS} />;
}
