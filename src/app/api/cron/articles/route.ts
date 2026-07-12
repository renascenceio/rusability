import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/cron-auth";
import { runDueCrons, promoteBuffer } from "@/lib/ai/cron-engine";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthorized())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const due = await runDueCrons();
  const promoted = await promoteBuffer();
  return NextResponse.json({ ok: true, ...due, ...promoted });
}

export const POST = GET;
