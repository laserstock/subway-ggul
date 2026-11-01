/** AdSense authorized-seller record; served once NEXT_PUBLIC_ADSENSE_CLIENT_ID ("ca-pub-…") is set. */
export function GET() {
  const publisher = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.replace(/^ca-/, "");
  if (!publisher) return new Response("Not found", { status: 404 });
  return new Response(`google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
