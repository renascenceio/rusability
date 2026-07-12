import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/cron-auth";
import {
  seedAiAuthors,
  seedNewsAndSettings,
  seedAuthorCrons,
  syncAuthorArticleCounts,
} from "@/lib/ai/seed-authors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await seedAiAuthors();
  const nb = await seedNewsAndSettings();
  const crons = await seedAuthorCrons();
  await syncAuthorArticleCounts();
  return NextResponse.json({ ok: true, ...result, ...nb, crons: crons.crons, cronTopics: crons.topics });
}
