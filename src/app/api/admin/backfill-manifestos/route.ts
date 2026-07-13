import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/cron-auth";
import { db } from "@/lib/db";
import { authors } from "@/lib/db/schema";
import { asc, eq, isNull, or, sql } from "drizzle-orm";
import { generateManifesto } from "@/lib/ai/generate-manifesto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Generate short first-person manifestos for authors that don't have one yet.
 * Bounded per call (default 12) so each invocation stays inside the budget;
 * call repeatedly until `remaining` is 0.
 *
 *   POST /api/admin/backfill-manifestos?limit=12
 *
 * force=1 regenerates for everyone; username=<u> targets one author.
 */
export async function POST(req: Request) {
  if (!(await isAuthorized())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const limit = Math.min(30, Math.max(1, parseInt(url.searchParams.get("limit") ?? "12", 10)));
  const force = url.searchParams.get("force") === "1";
  const username = url.searchParams.get("username");

  const missing = or(isNull(authors.manifesto), eq(authors.manifesto, ""));
  const filter = username ? eq(authors.username, username) : force ? sql`true` : missing;

  const batch = await db
    .select({ id: authors.id, name: authors.name, archetype: authors.archetype, bio: authors.bio })
    .from(authors)
    .where(filter)
    .orderBy(asc(authors.name))
    .limit(limit);

  let done = 0;
  const failures: string[] = [];
  for (const a of batch) {
    try {
      const manifesto = await generateManifesto({ name: a.name, archetype: a.archetype, bio: a.bio });
      if (manifesto) {
        await db.update(authors).set({ manifesto }).where(eq(authors.id, a.id));
        done++;
      } else {
        failures.push(`${a.id}: empty`);
      }
    } catch (err) {
      failures.push(`${a.id}: ${err instanceof Error ? err.message : "error"}`);
    }
  }

  const [{ n: remaining }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(authors)
    .where(filter);

  return NextResponse.json({ processed: batch.length, done, remaining, failures, force });
}
