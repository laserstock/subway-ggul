import type { Metadata } from "next";
import LegalScreen from "../_components/LegalScreen";
import { PRIVACY_SECTIONS, PRIVACY_TITLE } from "../_lib/legal";

export const metadata: Metadata = {
  title: "개인정보처리방침 · Privacy Policy · 지하철꿀정보",
  description: "K-SUB(지하철꿀정보) 개인정보처리방침: 위치 정보 비저장, Google AdSense 광고 쿠키, 데이터 삭제 방법.",
};

export default function PrivacyPage() {
  return <LegalScreen title={PRIVACY_TITLE} sections={PRIVACY_SECTIONS} />;
}
