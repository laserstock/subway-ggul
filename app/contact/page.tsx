import type { Metadata } from "next";
import LegalScreen from "../_components/LegalScreen";
import { CONTACT_SECTIONS, CONTACT_TITLE } from "../_lib/legal";
import ContactActions from "./ContactActions";

export const metadata: Metadata = {
  title: "문의하기 · Contact Us · 지하철꿀정보",
  description: "K-SUB(지하철꿀정보) 이용 문의, 역 정보 오류 제보, 피드백을 이메일로 보내 주세요.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <LegalScreen title={CONTACT_TITLE} sections={CONTACT_SECTIONS}>
      <ContactActions />
    </LegalScreen>
  );
}
