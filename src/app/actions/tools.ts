"use server";

import { headers } from "next/headers";
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { toolRuns } from "@/lib/db/schema";
import { getTool, type ToolValues } from "@/lib/tools/registry";
import { runToolModel, parseVariants } from "@/lib/tools/run-model";

/* Per-IP limits for the free, public tools (protect Gateway spend). */
const BURST_WINDOW_MS = 60 * 1000; // 1 minute
const BURST_MAX = 5;
const DAY_WINDOW_MS = 24 * 60 * 60 * 1000;
const DAY_MAX = 40;

export type ToolRunResult =
  | { ok: true; kind: "variants"; results: string[] }
  | { ok: true; kind: "text"; text: string }
  | { ok: false; error: string };

async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown"
  );
}

async function countRuns(ip: string, sinceMs: number): Promise<number> {
  const since = new Date(Date.now() - sinceMs);
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(toolRuns)
    .where(and(eq(toolRuns.ip, ip), gte(toolRuns.createdAt, since)));
  return row?.count ?? 0;
}

export async function runTool(input: {
  slug: string;
  values: ToolValues;
  company?: string; // honeypot — must stay empty
}): Promise<ToolRunResult> {
  // 1) Honeypot: pretend nothing happened.
  if (input.company && input.company.trim().length > 0) {
    return { ok: false, error: "Не удалось обработать запрос." };
  }

  const tool = getTool(input.slug);
  if (!tool) return { ok: false, error: "Инструмент не найден." };

  // 2) Validate + normalise inputs against the registry field spec.
  const values: ToolValues = {};
  for (const f of tool.fields) {
    const raw = (input.values?.[f.name] ?? "").toString().trim();
    if (f.required && !raw) {
      return { ok: false, error: `Заполните поле «${f.label}».` };
    }
    if (f.maxLength && raw.length > f.maxLength) {
      return { ok: false, error: `Поле «${f.label}» слишком длинное (макс. ${f.maxLength} символов).` };
    }
    if (f.type === "select" && raw && f.options && !f.options.some((o) => o.value === raw)) {
      return { ok: false, error: `Недопустимое значение поля «${f.label}».` };
    }
    values[f.name] = raw;
  }

  const ip = await clientIp();

  // 3) Per-IP rate limiting (burst + daily). Skipped only for unknown IPs.
  if (ip !== "unknown") {
    if ((await countRuns(ip, BURST_WINDOW_MS)) >= BURST_MAX) {
      return { ok: false, error: "Слишком много запросов. Подождите минуту и попробуйте снова." };
    }
    if ((await countRuns(ip, DAY_WINDOW_MS)) >= DAY_MAX) {
      return {
        ok: false,
        error: "Достигнут дневной лимит бесплатных запросов. Попробуйте завтра.",
      };
    }
  }

  const { system, prompt } = tool.buildPrompt(values);
  const inputChars = Object.values(values).reduce((n, s) => n + s.length, 0);
  const started = Date.now();

  try {
    const { text, model } = await runToolModel({ system, prompt });
    if (!text) throw new Error("empty model response");

    let payload: ToolRunResult;
    if (tool.output.kind === "variants") {
      const results = parseVariants(text, tool.output.count);
      if (results.length === 0) throw new Error("no variants parsed");
      payload = { ok: true, kind: "variants", results };
    } else {
      payload = { ok: true, kind: "text", text };
    }

    await db.insert(toolRuns).values({
      slug: tool.slug,
      status: "ok",
      ip,
      model,
      inputChars,
      outputChars: text.length,
      durationMs: Date.now() - started,
    });

    return payload;
  } catch (err) {
    await db.insert(toolRuns).values({
      slug: tool.slug,
      status: "error",
      ip,
      inputChars,
      durationMs: Date.now() - started,
      error: (err as Error).message?.slice(0, 300) ?? "unknown",
    });
    return { ok: false, error: "Не удалось сгенерировать результат. Попробуйте ещё раз." };
  }
}
