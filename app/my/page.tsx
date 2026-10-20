import type { Metadata } from "next";
import MyScreen from "./MyScreen";

export const metadata: Metadata = {
  title: "My 역 & 출퇴근 동선 · 지하철꿀정보",
};

export default function MyPage() {
  return <MyScreen />;
}
