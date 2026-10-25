import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.subwayggul",
  appName: "지하철꿀정보",
  // The app is server-rendered (API routes, Supabase), so the shell loads the live site; this folder is only the offline fallback.
  webDir: "native-shell",
  server: {
    url: "https://subway-ggul.vercel.app",
    errorPath: "index.html",
  },
  android: {
    // Without this, Android stops delivering background location to the WebView after about 5 minutes.
    useLegacyBridge: true,
  },
  plugins: {
    LocalNotifications: {
      iconColor: "#f5b800",
    },
  },
};

export default config;
