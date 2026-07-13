"use server";

import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { comments, articles, news } from "@/lib/db/schema";
import { glyphAvatar } from "@/lib/avatar";
import { moderateComment } from "@/lib/ai/moderate-comment";
import type { Comment } from "@/lib/types";

export type ContentKind = "article" | "news";

const MIN_FILL_MS = 2000; // humans take a moment to type a comment
const MAX_FILL_MS = 1000 * 60 * 60 * 6; // 6h stale token
const RATE_WINDOW_MS = 1000 * 60 * 10; // 10 minutes
const RATE_MAX = 5; // comments per IP per window

async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown"
  );
}

export type CommentResult =
  | { ok: true; comment: Comment }
  | { ok: false; error: string };

export async function submitComment(input: {
  kind: ContentKind;
  contentId: string;
  authorName: string;
  text: string;
  parentId?: string | null;
  company?: string; // honeypot — must stay empty
  renderedAt?: number; // client mount timestamp
}): Promise<CommentResult> {
  // 1) Honeypot — pretend success so bots don't learn they were caught.
  if (input.company && input.company.trim().length > 0) {
    return {
      ok: true,
      comment: {
        id: "hp",
        authorName: input.authorName || "Гость",
        authorAvatar: "",
        text: "",
        timeLabel: "",
        likes: 0,
      },
    };
  }

  // 2) Timing gate.
  const elapsed = input.renderedAt ? Date.now() - input.renderedAt : 0;
  if (!input.renderedAt || elapsed < MIN_FILL_MS) {
    return { ok: false, error: "Слишком быстрая отправка. Попробуйте ещё раз." };
  }
  if (elapsed > MAX_FILL_MS) {
    return { ok: false, error: "Форма устарела. Обновите страницу и попробуйте снова." };
  }

  // 3) Validation.
  const name = (input.authorName ?? "").trim().slice(0, 60);
  const text = (input.text ?? "").trim();
  if (name.length < 2) return { ok: false, error: "Укажите имя (от 2 символов)." };
  if (text.length < 2 || text.length > 2000) {
    return { ok: false, error: "Комментарий должен содержать от 2 до 2000 символов." };
  }

  const ip = await clientIp();

  // 4) Per-IP rate limiting.
  if (ip !== "unknown") {
    const since = new Date(Date.now() - RATE_WINDOW_MS);
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(comments)
      .where(and(eq(comments.ip, ip), gte(comments.createdAt, since)));
    if (count >= RATE_MAX) {
      return { ok: false, error: "Слишком много комментариев. Попробуйте позже." };
    }
  }

  // 5) AI moderation — clean comments publish instantly; problematic ones are
  // rejected with an explanation for the author.
  const verdict = await moderateComment(text);
  if (!verdict.allowed) {
    return { ok: false, error: verdict.reason };
  }

  const id = nanoid();
  const avatar = glyphAvatar(name);
  await db.insert(comments).values({
    id,
    articleId: input.contentId,
    contentType: input.kind,
    authorName: name,
    authorAvatar: avatar,
    text,
    timeLabel: "только что",
    likes: 0,
    parentId: input.parentId ?? null,
    status: "published",
    ip,
  });

  // Keep the article comment counter in sync (news has no counter column).
  if (input.kind === "article") {
    await db
      .update(articles)
      .set({ comments: sql`${articles.comments} + 1` })
      .where(eq(articles.id, input.contentId));
  }

  return {
    ok: true,
    comment: { id, authorName: name, authorAvatar: avatar, text, timeLabel: "только что", likes: 0 },
  };
}

/**
 * Shared, anonymous +1 counter. The browser enforces one +1 per visitor via
 * localStorage; the server just applies the signed delta to the shared count.
 */
export async function likeContent(input: {
  kind: ContentKind;
  contentId: string;
  delta: 1 | -1;
}): Promise<{ ok: true; likes: number } | { ok: false }> {
  const { kind, contentId, delta } = input;
  try {
    if (kind === "article") {
      const [row] = await db
        .update(articles)
        .set({ claps: sql`GREATEST(0, ${articles.claps} + ${delta})` })
        .where(eq(articles.id, contentId))
        .returning({ likes: articles.claps });
      return row ? { ok: true, likes: row.likes } : { ok: false };
    }
    const [row] = await db
      .update(news)
      .set({ likes: sql`GREATEST(0, ${news.likes} + ${delta})` })
      .where(eq(news.id, contentId))
      .returning({ likes: news.likes });
    return row ? { ok: true, likes: row.likes } : { ok: false };
  } catch {
    return { ok: false };
  }
}
