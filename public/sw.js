// Shows arrival-alarm notifications (Android Chrome requires a service worker for them)
// and brings the app back to the front when one is tapped. No caching.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const client = clients.find((candidate) => "focus" in candidate);
      return client ? client.focus() : self.clients.openWindow("/");
    }),
  );
});
