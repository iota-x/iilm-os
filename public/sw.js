// Minimal service worker: enough for the app to be installable on Android,
// which is what makes it a share target. It deliberately caches nothing —
// every page is live data.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
