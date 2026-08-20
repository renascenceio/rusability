import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/cron-auth";
import { runDueCrons, promoteBuffer } from "@/lib/ai/cron-engine";
import { backfillCoverlessArticles } from "@/lib/ai/backfill-covers";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthorized())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const due = await runDueCrons();
  const promoted = await promoteBuffer();
  // Self-heal any articles whose cover generation failed (e.g. a transient
  // image-provider outage). Covers never block publishing, so without this a
  // blip would leave permanent placeholder gaps at the top of the feed.
  const covers = await backfillCoverlessArticles(4).catch((err) => {
    console.log("[v0] cover self-heal failed:", err instanceof Error ? err.message : String(err));
    return { processed: 0, done: 0, remaining: -1 };
  });
  return NextResponse.json({ ok: true, ...due, ...promoted, covers });
}

export const POST = GET;
