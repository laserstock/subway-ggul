import type { Metadata } from "next";
import MeScreen from "./MeScreen";

export const metadata: Metadata = {
  title: "마이 · 지하철꿀정보",
};

export default function MePage() {
  return <MeScreen />;
}
