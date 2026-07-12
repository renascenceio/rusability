"use server";

import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";

export type ContactResult = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_FILL_MS = 2500; // humans take at least a couple seconds to fill the form
const MAX_FILL_MS = 1000 * 60 * 60; // 1h — stale token
const RATE_WINDOW_MS = 1000 * 60 * 10; // 10 minutes
const RATE_MAX = 3; // per IP per window

export async function submitContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
  company?: string; // honeypot — must stay empty
  renderedAt?: number; // client timestamp when the form mounted
}): Promise<ContactResult> {
  // 1) Honeypot: real users never see or fill this field.
  if (input.company && input.company.trim().length > 0) {
    // Pretend success so bots don't learn they were caught.
    return { ok: true };
  }

  // 2) Timing check: submissions that are implausibly fast are almost always bots.
  const elapsed = input.renderedAt ? Date.now() - input.renderedAt : 0;
  if (!input.renderedAt || elapsed < MIN_FILL_MS || elapsed > MAX_FILL_MS) {
    if (elapsed < MIN_FILL_MS) {
      return { ok: false, error: "Слишком быстрая отправка. Попробуйте ещё раз." };
    }
    // stale/absent token — silently accept to avoid blocking slow humans is risky; ask to reload
    return { ok: false, error: "Форма устарела. Обновите страницу и попробуйте снова." };
  }

  // 3) Validation.
  const name = (input.name ?? "").trim();
  const email = (input.email ?? "").trim().toLowerCase();
  const subject = (input.subject ?? "").trim().slice(0, 200);
  const message = (input.message ?? "").trim();

  if (name.length < 2 || name.length > 120) {
    return { ok: false, error: "Укажите имя (от 2 символов)." };
  }
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return { ok: false, error: "Укажите корректный адрес электронной почты." };
  }
  if (message.length < 10 || message.length > 5000) {
    return { ok: false, error: "Сообщение должно содержать от 10 до 5000 символов." };
  }

  // Capture request metadata for moderation / abuse handling.
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const userAgent = h.get("user-agent")?.slice(0, 400) ?? null;

  // 4) Per-IP rate limiting.
  if (ip && ip !== "unknown") {
    const since = new Date(Date.now() - RATE_WINDOW_MS);
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(contactMessages)
      .where(and(eq(contactMessages.ip, ip), gte(contactMessages.createdAt, since)));
    if (count >= RATE_MAX) {
      return { ok: false, error: "Слишком много сообщений. Попробуйте позже." };
    }
  }

  await db.insert(contactMessages).values({
    id: randomUUID(),
    name,
    email,
    subject,
    message,
    status: "new",
    ip,
    userAgent,
  });

  return { ok: true };
}
