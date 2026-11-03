import type { Metadata } from "next";
import LegalScreen from "../_components/LegalScreen";
import { TERMS_SECTIONS, TERMS_TITLE } from "../_lib/legal";

export const metadata: Metadata = {
  title: "이용약관 · Terms of Service · 지하철꿀정보",
  description: "K-SUB(지하철꿀정보) 서비스 이용약관, 커뮤니티 가이드라인과 지하철 데이터 면책 조항.",
};

export default function TermsPage() {
  return <LegalScreen title={TERMS_TITLE} sections={TERMS_SECTIONS} />;
}
