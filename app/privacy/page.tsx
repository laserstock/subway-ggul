import type { Metadata } from "next";
import LegalScreen from "../_components/LegalScreen";
import { PRIVACY_SECTIONS, PRIVACY_TITLE } from "../_lib/legal";

export const metadata: Metadata = {
  title: "개인정보처리방침 · 지하철꿀정보",
};

export default function PrivacyPage() {
  return <LegalScreen title={PRIVACY_TITLE} sections={PRIVACY_SECTIONS} />;
}
