import "server-only";
import { headers } from "next/headers";
import { getCurrentUser, ADMIN_ROLES } from "@/lib/auth-helpers";

/**
 * Authorize an automation/admin endpoint. Vercel Cron sends the configured
 * CRON_SECRET as `Authorization: Bearer <secret>` on every invocation.
 * Signed-in admins may also trigger the same endpoint manually.
 */
export async function isAuthorized(): Promise<boolean> {
  const h = await headers();
  const secret = process.env.CRON_SECRET;
  if (secret && h.get("authorization") === `Bearer ${secret}`) return true;

  const user = await getCurrentUser();
  if (user && ADMIN_ROLES.includes(user.role)) return true;

  if (!secret && process.env.NODE_ENV !== "production") return true;

  return false;
}
