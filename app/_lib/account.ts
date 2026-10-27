"use client";

import { getSupabase } from "./supabase";

const STORAGE_PREFIX = "subway-ggul:";

function clearDeviceStorage() {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      Object.keys(storage)
        .filter((key) => key.startsWith(STORAGE_PREFIX))
        .forEach((key) => storage.removeItem(key));
    } catch {}
  }
}

/**
 * Deletes the device's anonymous account on the server (everything it wrote cascades with it),
 * then wipes this device's saved settings. False when the server refused, so nothing local is lost.
 */
export async function deleteMyAccount(): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const { error } = await supabase.rpc("delete_my_account");
      if (error) return false;
      await supabase.auth.signOut({ scope: "local" }).catch(() => {});
    }
  }
  clearDeviceStorage();
  return true;
}
