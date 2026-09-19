// Service worker: installable on Android (which makes the app a share
// target), and a fallback page when there's no signal — the college wifi
// drops, the lecture hall has no bars.
//
// Caching policy, deliberately narrow:
//   - /offline and the app icon are precached, so the fallback always renders
//   - hashed build assets (/_next/static/*) are cached on first use; they're
//     immutable by name, so this is safe forever
//   - HTML is never cached. Every page is live, per-user data behind a
//     session; a cached copy could show one person's data to the next on a
//     shared device. When a navigation fails, /offline is served instead.
const VERSION = "v2";
const SHELL = `shell-${VERSION}`;
const ASSETS = `assets-${VERSION}`;
const OFFLINE = "/offline";

self.addEventListener("install", (e) => {
  e.waitUntil(
    (async () => {
      const shell = await caches.open(SHELL);
      await shell.addAll([OFFLINE, "/api/pwa-icon/192"]);
      // the offline page needs its own CSS and JS to look like the app —
      // pull the build assets it references into the asset cache now
      const html = await (await shell.match(OFFLINE))?.text();
      const refs = [...(html ?? "").matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g)].map((m) => m[1]);
      const assets = await caches.open(ASSETS);
      await Promise.all(refs.map((u) => assets.add(u).catch(() => {})));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL && k !== ASSETS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // navigations: network, else the offline page
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).catch(() => caches.match(OFFLINE)));
    return;
  }

  // build assets: cache-first, they never change under the same name
  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(ASSETS).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // the precached shell bits (icon), else network
  if (url.pathname === OFFLINE || url.pathname.startsWith("/api/pwa-icon/")) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
  }
});
