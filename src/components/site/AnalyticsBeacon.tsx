"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPageView, type TrackKind } from "@/app/actions/track";

const VISITOR_KEY = "rusability:vid";
const SESSION_KEY = "rusability:sid";

function uid() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/** Long-lived anonymous visitor id (a unique-visitor proxy). */
export function getVisitorId(): string {
  try {
    let v = localStorage.getItem(VISITOR_KEY);
    if (!v) {
      v = uid();
      localStorage.setItem(VISITOR_KEY, v);
    }
    return v;
  } catch {
    return "anon";
  }
}

/** Per-tab-session anonymous id (a session proxy). */
export function getSessionId(): string {
  try {
    let s = sessionStorage.getItem(SESSION_KEY);
    if (!s) {
      s = uid();
      sessionStorage.setItem(SESSION_KEY, s);
    }
    return s;
  } catch {
    return "anon";
  }
}

function detectDevice(): "desktop" | "mobile" | "tablet" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent || "";
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua)) return "mobile";
  return "desktop";
}

/**
 * Fires a single, best-effort pageview per path change. Placed once in the
 * public layout; content pages pass richer context (kind/id/category/author)
 * so audience can be split by surface, category and author.
 */
export function AnalyticsBeacon({
  kind = "other",
  contentId,
  category,
  authorId,
  /** When true (the layout-level beacon), skip content detail routes because
   *  those pages render their OWN beacon with full kind/category/author
   *  context — this prevents double counting. */
  skipContentRoutes = false,
}: {
  kind?: TrackKind;
  contentId?: string | null;
  category?: string | null;
  authorId?: string | null;
  skipContentRoutes?: boolean;
}) {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    // Skip admin/editor/auth surfaces entirely.
    if (!pathname || /^\/(admin|editor|author|api|sign-in|sign-up)(\/|$)/.test(pathname)) {
      return;
    }
    // The layout beacon defers to per-page beacons on content detail routes.
    if (
      skipContentRoutes &&
      /^\/(articles|news|authors)\/[^/]+$/.test(pathname)
    ) {
      return;
    }
    // One beacon per path per mount (guards StrictMode double-invoke + re-renders).
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    const referrer =
      typeof document !== "undefined" && document.referrer ? document.referrer : null;

    // For the layout-level beacon, listing routes count as "listing".
    const resolvedKind: TrackKind =
      kind === "other" && /^\/(articles|news|authors)\/?$/.test(pathname)
        ? "listing"
        : kind;

    trackPageView({
      path: pathname,
      kind: resolvedKind,
      contentId: contentId ?? null,
      category: category ?? null,
      authorId: authorId ?? null,
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      referrer,
      device: detectDevice(),
    }).catch(() => {});
  }, [pathname, kind, contentId, category, authorId]);

  return null;
}
