import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/cron-auth";
import { writeQueuedNews } from "@/lib/ai/news-engine";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * Writing pass — drain queued news with bounded concurrency and publish each
 * item the instant it is written. Runs more frequently than collection so the
 * queue is steadily worked down without ever exceeding the write concurrency.
 */
export async function GET() {
  if (!(await isAuthorized())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const result = await writeQueuedNews();
  return NextResponse.json({ ok: true, ...result });
}

export const POST = GET;
