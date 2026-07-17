"use client";

import { useEffect } from "react";

/**
 * Fires a lightweight, fire-and-forget ping to the publishing heartbeat on page
 * load. Throttled per-browser to at most once every few minutes; the server has
 * the real gate (it no-ops unless a scheduled tick is actually overdue). This
 * makes article publishing self-healing: as long as the site gets any traffic,
 * it keeps publishing on schedule even if Vercel's cron scheduler has stalled.
 */
export function HeartbeatPinger() {
  useEffect(() => {
    const KEY = "rusability:hb";
    const THROTTLE_MS = 5 * 60_000;
    try {
      const last = Number(localStorage.getItem(KEY) || 0);
      if (Date.now() - last < THROTTLE_MS) return;
      localStorage.setItem(KEY, String(Date.now()));
    } catch {
      /* localStorage unavailable — still fire once */
    }
    // keepalive lets the request survive a navigation; errors are ignored.
    fetch("/api/cron/heartbeat", { method: "POST", keepalive: true }).catch(() => {});
  }, []);

  return null;
}
