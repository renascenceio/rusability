import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/cron-auth";
import { runNewsbot } from "@/lib/ai/news-engine";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthorized())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const result = await runNewsbot();
  return NextResponse.json({ ok: true, ...result });
}

export const POST = GET;
