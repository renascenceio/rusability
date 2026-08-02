"use server";

import { headers } from "next/headers";
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { toolRuns } from "@/lib/db/schema";
import { getTool, type ToolValues } from "@/lib/tools/registry";
import { runToolModel, parseVariants } from "@/lib/tools/run-model";
import { getVisitorId, verifyToolToken } from "@/lib/tools/identity";

/* Per-user limits for the free, public tools (protect Gateway spend + block bots). */
const BURST_WINDOW_MS = 60 * 1000; // 1 minute
const BURST_MAX = 5;
const DAY_WINDOW_MS = 24 * 60 * 60 * 1000;
  const DAY_MAX = 10; // successful runs per visitor per rolling 24h — shown to the user
  const IP_DAY_MAX = 60; // backstop across ALL visitors sharing one IP (anti cookie-rotation)

/** Per-user daily quota surfaced in the UI ("attempts left today"). */
export type ToolQuota = {
  used: number;
  limit: number;
  remaining: number;
  /** ISO time the oldest counted run ages out of the window (null when unused). */
  resetAt: string | null;
};

export type ToolRunResult =
  | { ok: true; kind: "variants"; results: string[]; quota: ToolQuota }
  | { ok: true; kind: "text"; text: string; quota: ToolQuota }
  | { ok: false; error: string; quota?: ToolQuota };

async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown"
  );
}

/** Count runs in a window, keyed by visitor id when available (else IP). */
async function countRuns(opts: {
  visitorId: string;
  ip: string;
  sinceMs: number;
  okOnly?: boolean;
}): Promise<number> {
  const since = new Date(Date.now() - opts.sinceMs);
  const key = opts.visitorId
    ? eq(toolRuns.visitorId, opts.visitorId)
    : eq(toolRuns.ip, opts.ip);
  const conds = [key, gte(toolRuns.createdAt, since)];
  if (opts.okOnly) conds.push(eq(toolRuns.status, "ok"));
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(toolRuns)
    .where(and(...conds));
  return row?.count ?? 0;
}

/** Successful-runs quota for the current user over the rolling day. */
async function quotaFor(visitorId: string, ip: string): Promise<ToolQuota> {
  const since = new Date(Date.now() - DAY_WINDOW_MS);
  const key = visitorId ? eq(toolRuns.visitorId, visitorId) : eq(toolRuns.ip, ip);
  const [row] = await db
    .select({
      count: sql<number>`count(*)::int`,
      earliest: sql<string | null>`min(${toolRuns.createdAt})`,
    })
    .from(toolRuns)
    .where(and(key, gte(toolRuns.createdAt, since), eq(toolRuns.status, "ok")));
  const used = row?.count ?? 0;
  const remaining = Math.max(0, DAY_MAX - used);
  const resetAt =
    used > 0 && row?.earliest
      ? new Date(new Date(row.earliest).getTime() + DAY_WINDOW_MS).toISOString()
      : null;
  return { used, limit: DAY_MAX, remaining, resetAt };
}

/** Read-only quota lookup for the UI (called on mount). */
export async function getToolQuota(): Promise<ToolQuota> {
  const [visitorId, ip] = await Promise.all([getVisitorId(), clientIp()]);
  return quotaFor(visitorId, ip);
}

export async function runTool(input: {
  slug: string;
  values: ToolValues;
  token?: string; // signed page-load token (anti-bot)
  company?: string; // honeypot — must stay empty
}): Promise<ToolRunResult> {
  // 1) Honeypot: pretend nothing happened.
  if (input.company && input.company.trim().length > 0) {
    return { ok: false, error: "Не удалось обработать запрос." };
  }

  const tool = getTool(input.slug);
  if (!tool) return { ok: false, error: "Инструмент не найден." };

  const [visitorId, ip] = await Promise.all([getVisitorId(), clientIp()]);

  // 2) Anti-bot: require a valid token that could only come from a real page
  // render for this visitor. Direct scripted POSTs won't have one.
  if (!verifyToolToken(input.token ?? "", visitorId)) {
    return {
      ok: false,
      error: "Сессия устарела. Обновите страницу и попробуйте снова.",
    };
  }

  // 3) Validate + normalise inputs against the registry field spec.
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

  // 4) Rate limiting: burst (per user) + daily (per user, shown) + IP backstop.
  if (await countRuns({ visitorId, ip, sinceMs: BURST_WINDOW_MS }) >= BURST_MAX) {
    return {
      ok: false,
      error: "Слишком много запросов. Подождите минуту и попробуйте снова.",
      quota: await quotaFor(visitorId, ip),
    };
  }

  if (ip !== "unknown" && (await countRuns({ visitorId: "", ip, sinceMs: DAY_WINDOW_MS })) >= IP_DAY_MAX) {
    return {
      ok: false,
      error: "Достигнут дневной лимит бесплатных запросов. Попробуйте завтра.",
      quota: await quotaFor(visitorId, ip),
    };
  }

  const quota = await quotaFor(visitorId, ip);
  if (quota.remaining <= 0) {
    return {
      ok: false,
      error: "Достигнут дневной лимит бесплатных запросов. Попробуйте завтра.",
      quota,
    };
  }

  const { system, prompt } = tool.buildPrompt(values);
  const inputChars = Object.values(values).reduce((n, s) => n + s.length, 0);
  const started = Date.now();

  try {
    const { text, model } = await runToolModel({ system, prompt });
    if (!text) throw new Error("empty model response");

    let results: string[] | null = null;
    if (tool.output.kind === "variants") {
      results = parseVariants(text, tool.output.count);
      if (results.length === 0) throw new Error("no variants parsed");
    }

    await db.insert(toolRuns).values({
      slug: tool.slug,
      status: "ok",
      ip,
      visitorId: visitorId || null,
      model,
      inputChars,
      outputChars: text.length,
      durationMs: Date.now() - started,
    });

    // Reflect this successful run in the returned quota (used +1).
    const nextQuota: ToolQuota = {
      used: quota.used + 1,
      limit: quota.limit,
      remaining: Math.max(0, quota.remaining - 1),
      resetAt: quota.resetAt ?? new Date(Date.now() + DAY_WINDOW_MS).toISOString(),
    };

    return results
      ? { ok: true, kind: "variants", results, quota: nextQuota }
      : { ok: true, kind: "text", text, quota: nextQuota };
  } catch (err) {
    await db.insert(toolRuns).values({
      slug: tool.slug,
      status: "error",
      ip,
      visitorId: visitorId || null,
      inputChars,
      durationMs: Date.now() - started,
      error: (err as Error).message?.slice(0, 300) ?? "unknown",
    });
    // A failed generation does NOT consume the user's daily quota.
    return {
      ok: false,
      error: "Не удалось сгенерировать результат. Попробуйте ещё раз.",
      quota,
    };
  }
}
