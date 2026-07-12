import "server-only";
import { headers } from "next/headers";
import { getCurrentUser, ADMIN_ROLES } from "@/lib/auth-helpers";

/**
 * Authorize an automation/seed endpoint. Allows, in order:
 *  1. Vercel Cron (sends `x-vercel-cron` header)
 *  2. Bearer token matching CRON_SECRET (manual trigger / external scheduler)
 *  3. A signed-in admin session (manual trigger from the console)
 *  4. Development (no CRON_SECRET set + not production)
 */
export async function isAuthorized(): Promise<boolean> {
  const h = await headers();
  if (h.get("x-vercel-cron")) return true;

  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = h.get("authorization");
    if (auth === `Bearer ${secret}`) return true;
  }

  const user = await getCurrentUser();
  if (user && ADMIN_ROLES.includes(user.role)) return true;

  if (!secret && process.env.NODE_ENV !== "production") return true;

  return false;
}
