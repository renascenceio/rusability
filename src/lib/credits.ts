import "server-only";
import { db } from "@/lib/db";
import { authors, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/** Monthly AI-credit allowance for a regular user. 1 credit = 1 article OR 1 image. */
export const MONTHLY_CREDITS = 10;

/** Roles that always get unlimited AI credits (in addition to Elite authors). */
const UNLIMITED_ROLES = new Set(["superadmin", "admin", "editor"]);

export interface CreditState {
  unlimited: boolean;
  used: number;
  limit: number;
  remaining: number;
  /** YYYY-MM the current counter belongs to. */
  month: string;
}

function currentMonth(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Resolve whether an author has unlimited credits. Elite authors are unlimited,
 * as are authors linked to an admin/editor/superadmin user account.
 */
async function isUnlimited(row: typeof authors.$inferSelect): Promise<boolean> {
  if (row.elite) return true;
  if (!row.userId) return false;
  const u = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, row.userId))
    .limit(1);
  return UNLIMITED_ROLES.has(u[0]?.role ?? "");
}

/** Read the credit state for an author, auto-resetting the counter each month. */
export async function getCreditState(authorId: string): Promise<CreditState | null> {
  const rows = await db.select().from(authors).where(eq(authors.id, authorId)).limit(1);
  const row = rows[0];
  if (!row) return null;

  const unlimited = await isUnlimited(row);
  const month = currentMonth();
  // A stale month means the allowance has reset — treat used as 0.
  const used = row.aiCreditsMonth === month ? row.aiCreditsUsed : 0;

  return {
    unlimited,
    used,
    limit: MONTHLY_CREDITS,
    remaining: unlimited ? Infinity : Math.max(0, MONTHLY_CREDITS - used),
    month,
  };
}

/**
 * Attempt to consume `n` credits. Returns the resulting state and whether it
 * succeeded. Unlimited authors always succeed and are never charged.
 */
export async function consumeCredits(
  authorId: string,
  n = 1,
): Promise<{ ok: boolean; state: CreditState | null }> {
  const state = await getCreditState(authorId);
  if (!state) return { ok: false, state: null };
  if (state.unlimited) return { ok: true, state };
  if (state.remaining < n) return { ok: false, state };

  const nextUsed = state.used + n;
  await db
    .update(authors)
    .set({ aiCreditsUsed: nextUsed, aiCreditsMonth: state.month })
    .where(eq(authors.id, authorId));

  return {
    ok: true,
    state: { ...state, used: nextUsed, remaining: Math.max(0, MONTHLY_CREDITS - nextUsed) },
  };
}
