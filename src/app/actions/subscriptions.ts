"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { authors, subscriptions } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth-helpers";
import { mapAuthor } from "@/lib/data/authors";
import type { Author } from "@/lib/types";

export type ToggleResult =
  | { ok: true; subscribed: boolean; followers: number }
  | { ok: false; reason: "unauthenticated" };

/**
 * Subscribe / unsubscribe the current user to an author.
 * Keeps `authors.followers` in sync so the public count stays accurate.
 */
export async function toggleSubscription(authorId: string): Promise<ToggleResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, reason: "unauthenticated" };

  const existing = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, user.id), eq(subscriptions.authorId, authorId)))
    .limit(1);

  let subscribed: boolean;
  if (existing[0]) {
    await db.delete(subscriptions).where(eq(subscriptions.id, existing[0].id));
    subscribed = false;
  } else {
    await db
      .insert(subscriptions)
      .values({ id: randomUUID(), userId: user.id, authorId })
      .onConflictDoNothing();
    subscribed = true;
  }

  // Recompute the follower count from the source of truth.
  const followers = await db.$count(subscriptions, eq(subscriptions.authorId, authorId));
  await db.update(authors).set({ followers }).where(eq(authors.id, authorId));

  revalidatePath("/subscriptions");
  return { ok: true, subscribed, followers };
}

/** True if the current user follows the given author. */
export async function isSubscribed(authorId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  const rows = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, user.id), eq(subscriptions.authorId, authorId)))
    .limit(1);
  return rows.length > 0;
}

/** All author ids the current user follows (empty if signed out). */
export async function mySubscribedAuthorIds(): Promise<Set<string>> {
  const user = await getCurrentUser();
  if (!user) return new Set();
  const rows = await db
    .select({ authorId: subscriptions.authorId })
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id));
  return new Set(rows.map((r) => r.authorId));
}

/** Full author records the current user follows, newest first. */
export async function mySubscriptions(): Promise<Author[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  const subs = await db
    .select({ authorId: subscriptions.authorId })
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .orderBy(desc(subscriptions.createdAt));
  const ids = subs.map((s) => s.authorId);
  if (ids.length === 0) return [];
  const rows = await db.select().from(authors).where(inArray(authors.id, ids));
  const byId = new Map(rows.map((r) => [r.id, mapAuthor(r)]));
  // Preserve subscription order (newest first).
  return ids.map((id) => byId.get(id)).filter((a): a is Author => Boolean(a));
}
