import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isGoneLink } from "@/lib/archive/known-slugs";
import { goneHtml } from "@/lib/archive/gone-page";

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

/**
 * The previous Rusability site had thousands of /articles/<slug> and
 * /news/<slug> pages that no longer exist. Those slugs collide with the new
 * URL structure, so a blanket redirect is impossible. Instead we detect links
 * whose slug is NOT in the new database and answer with HTTP 410 Gone plus a
 * branded "moved to archive" page — the correct, fast de-indexing signal for
 * intentionally removed content, while keeping the original URL in place.
 */
const GONE_PATH = /^\/(articles|news)\/([^/]+)\/?$/;

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  const { pathname } = request.nextUrl;

  // Old-link → 410 Gone (only for single-segment article/news detail paths).
  const match = pathname.match(GONE_PATH);
  if (match) {
    const section = match[1] as "articles" | "news";
    let slug = match[2];
    try {
      slug = decodeURIComponent(slug);
    } catch {
      /* keep raw slug if it isn't valid percent-encoding */
    }
    if (await isGoneLink(section, slug)) {
      return new NextResponse(goneHtml(section), {
        status: 410,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "x-robots-tag": "noindex, nofollow",
          "cache-control": "public, max-age=0, s-maxage=86400",
        },
      });
    }
  }

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
