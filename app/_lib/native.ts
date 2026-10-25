"use client";

import type { BackgroundGeolocationPlugin, Location } from "@capacitor-community/background-geolocation";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

/** True inside the Capacitor app shell, which loads this same site but adds native plugins. */
export function isNativeApp() {
  return Capacitor.isNativePlatform();
}

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>("BackgroundGeolocation");

export type BackgroundFix = { lat: number; lng: number; accuracy: number };

/**
 * Keeps delivering fixes while the app is in the background or the screen is off.
 * Android requires a persistent notification for this, so its title and text are passed in.
 * Returns a stop function.
 */
export function watchBackgroundLocation(
  notice: { title: string; message: string },
  onFix: (fix: BackgroundFix) => void,
  onDenied: () => void,
  onUnavailable: () => void,
): () => void {
  let stopped = false;
  const id = BackgroundGeolocation.addWatcher(
    {
      backgroundTitle: notice.title,
      backgroundMessage: notice.message,
      requestPermissions: true,
      stale: false,
      distanceFilter: 30,
    },
    (location?: Location, error?: { code?: string }) => {
      if (stopped) return;
      if (error) {
        if (error.code === "NOT_AUTHORIZED") onDenied();
        else onUnavailable();
        return;
      }
      if (location) onFix({ lat: location.latitude, lng: location.longitude, accuracy: location.accuracy });
    },
  );
  return () => {
    stopped = true;
    void id.then((watcherId) => BackgroundGeolocation.removeWatcher({ id: watcherId })).catch(() => {});
  };
}

export function openNativeSettings() {
  void BackgroundGeolocation.openSettings().catch(() => {});
}

const ALARM_CHANNEL = "arrival-alarm";
const ALARM_NOTIFICATION_ID = 1;

/** Asks for notification permission and sets up a heads-up channel on Android. */
export async function prepareNativeAlerts(channelName: string): Promise<boolean> {
  try {
    const current = await LocalNotifications.checkPermissions();
    const granted =
      current.display === "granted" || (await LocalNotifications.requestPermissions()).display === "granted";
    if (Capacitor.getPlatform() === "android") {
      await LocalNotifications.createChannel({
        id: ALARM_CHANNEL,
        name: channelName,
        importance: 5,
        visibility: 1,
        vibration: true,
      });
    }
    return granted;
  } catch {
    return false;
  }
}

export async function sendNativeAlert(title: string, body: string) {
  try {
    await LocalNotifications.schedule({
      notifications: [{ id: ALARM_NOTIFICATION_ID, title, body, channelId: ALARM_CHANNEL }],
    });
  } catch {}
}
