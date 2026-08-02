import "server-only";

import { cookies } from "next/headers";
import crypto from "node:crypto";

/**
 * Anonymous identity + anti-bot token for the free public tools.
 *
 * - `rt_vid` is a stable, HttpOnly visitor cookie minted in middleware. It is
 *   the PRIMARY per-user key for rate limiting (IP is only a backstop, since
 *   offices/mobile carriers share IPs and IPs are easily rotated).
 * - The run token is a short-lived HMAC bound to that visitor id. It is issued
 *   only when the tool PAGE renders, so a script POSTing straight to the
 *   server action (never loading the page) can't produce a valid one.
 */

const VISITOR_COOKIE = "rt_vid";
const SECRET =
  process.env.NEON_AUTH_COOKIE_SECRET ||
  process.env.CRON_SECRET ||
  "rusability-tools-dev-secret";
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12h — forces a reload of very stale tabs

export async function getVisitorId(): Promise<string> {
  const c = await cookies();
  return c.get(VISITOR_COOKIE)?.value ?? "";
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

/** Issue a signed token bound to the visitor id (called from the tool page RSC). */
export function issueToolToken(visitorId: string): string {
  const issued = Date.now();
  return `${issued}.${sign(`${visitorId}.${issued}`)}`;
}

/** Verify a token came from a real page render for THIS visitor and is fresh. */
export function verifyToolToken(token: string, visitorId: string): boolean {
  if (!token || !visitorId) return false;
  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const issuedStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const issued = Number(issuedStr);
  if (!sig || !Number.isFinite(issued)) return false;
  // Reject stale tokens and any clock-skew shenanigans from the future.
  if (Date.now() - issued > TOKEN_TTL_MS || issued > Date.now() + 60_000) return false;
  const expected = sign(`${visitorId}.${issued}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
