import type { Metadata } from "next";
import { APP_SCREEN_ROBOTS } from "../_lib/site";
import MeScreen from "./MeScreen";

export const metadata: Metadata = {
  title: "마이 · 지하철꿀정보",
  robots: APP_SCREEN_ROBOTS,
};

export default function MePage() {
  return <MeScreen />;
}
