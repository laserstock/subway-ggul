import type { Metadata } from "next";
import LegalScreen from "../_components/LegalScreen";
import { DELETION_SECTIONS, DELETION_TITLE } from "../_lib/legal";

export const metadata: Metadata = {
  title: "계정·데이터 삭제 요청 · 지하철꿀정보 (K-Sub)",
  description: "지하철꿀정보(K-Sub) 계정과 데이터를 삭제하는 방법 · How to delete your K-Sub account and data.",
};

export default function DeleteAccountPage() {
  return <LegalScreen title={DELETION_TITLE} sections={DELETION_SECTIONS} />;
}
