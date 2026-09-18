"use client";

import { useEffect } from "react";

/** Registers the (empty) service worker so Android will offer to install the app. */
export function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
