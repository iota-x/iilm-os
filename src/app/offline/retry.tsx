"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";

/** Tries again by itself the moment the browser says it's back online. */
export function Retry() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const sync = () => {
      setOnline(navigator.onLine);
      if (navigator.onLine) location.reload();
    };
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);
  return (
    <div className="mt-5 space-y-2">
      <Button variant="primary" onClick={() => location.reload()}>
        Try again
      </Button>
      <p className="text-[length:var(--text-micro)] text-subtle">
        {online ? "This reloads by itself when you're back online." : "Still offline — waiting."}
      </p>
    </div>
  );
}
