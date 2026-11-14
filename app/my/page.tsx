import type { Metadata } from "next";
import { APP_SCREEN_ROBOTS } from "../_lib/site";
import MyScreen from "./MyScreen";

export const metadata: Metadata = {
  title: "My 역 & 출퇴근 동선 · 지하철꿀정보",
  robots: APP_SCREEN_ROBOTS,
};

export default function MyPage() {
  return <MyScreen />;
}
