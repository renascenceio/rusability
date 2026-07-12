import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * SEO guard: only the canonical domain should be indexable.
 *
 * Vercel keeps the deployment alias (e.g. rusability-*.vercel.app) publicly
 * reachable. Left alone, Google can index that host too and treat it as a
 * duplicate that competes with the real domain. We add `X-Robots-Tag: noindex`
 * for every host that is NOT the canonical domain, so search engines only ever
 * rank rusability.ru.
 */
const CANONICAL_HOSTS = new Set(["rusability.ru", "www.rusability.ru"]);

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  const response = NextResponse.next();

  // localhost / preview / *.vercel.app → keep out of the search index.
  if (!CANONICAL_HOSTS.has(host)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  // Run on all routes except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)"],
};
