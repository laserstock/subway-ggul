import { ADSENSE_CLIENT_ID } from "../_lib/site";

/** AdSense authorized-seller record. */
export function GET() {
  const publisher = ADSENSE_CLIENT_ID.replace(/^ca-/, "");
  return new Response(`google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
