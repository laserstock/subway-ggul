import type { Metadata } from "next";
import { APP_SCREEN_ROBOTS } from "../_lib/site";
import MeetScreen from "./MeetScreen";

export const metadata: Metadata = {
  title: "약속역 · 코스 플래너 · 지하철꿀정보",
  robots: APP_SCREEN_ROBOTS,
};

export default function MeetPage() {
  return <MeetScreen />;
}
