import { NextResponse } from "next/server";
import { runTickIfDue } from "@/lib/ai/cron-engine";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * Public, self-healing publishing trigger. Hit by site traffic (a tiny client
 * ping on every page load) and optionally by any external uptime pinger. It is
 * intentionally unauthenticated because it is idempotent and internally guarded:
 * `runTickIfDue` no-ops unless a scheduled tick is actually overdue, and a DB
 * soft-lock prevents concurrent runs. This keeps articles publishing on schedule
 * even when Vercel's cron scheduler stops firing after a redeploy.
 */
async function handle() {
  try {
    const result = await runTickIfDue("heartbeat");
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "error" },
      { status: 500 },
    );
  }
}

export const GET = handle;
export const POST = handle;
