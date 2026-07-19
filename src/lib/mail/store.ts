import "server-only";
import { nanoid } from "nanoid";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { mailMessages, mailThreads } from "@/lib/db/schema";

export type MailAttachment = {
  filename: string;
  url: string;
  contentType: string;
  size: number;
};

export type ThreadStatus = "open" | "closed" | "spam";
export type MailDirection = "inbound" | "outbound";

/** Split "Name <email@x.com>" into its parts. Falls back gracefully. */
export function parseAddress(raw: string): { name: string; email: string } {
  const s = (raw || "").trim();
  const m = s.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1].trim(), email: m[2].trim().toLowerCase() };
  return { name: "", email: s.toLowerCase() };
}

/** Normalise a subject for thread-matching (strip Re:/Fwd: prefixes). */
function normalizeSubject(subject: string): string {
  return (subject || "")
    .replace(/^\s*(re|fwd|fw|ответ)\s*:\s*/gi, "")
    .trim()
    .toLowerCase();
}

/**
 * Find the thread an inbound message belongs to: first by the In-Reply-To
 * message id, then by (correspondent + normalized subject). Creates one if none.
 */
export async function resolveThreadForInbound(opts: {
  correspondentEmail: string;
  correspondentName: string;
  subject: string;
  mailbox: string;
  inReplyTo?: string | null;
}): Promise<string> {
  const { correspondentEmail, correspondentName, subject, mailbox, inReplyTo } = opts;

  if (inReplyTo) {
    const parent = await db
      .select({ threadId: mailMessages.threadId })
      .from(mailMessages)
      .where(eq(mailMessages.messageId, inReplyTo))
      .limit(1);
    if (parent[0]) return parent[0].threadId;
  }

  const norm = normalizeSubject(subject);
  if (norm) {
    const existing = await db
      .select({ id: mailThreads.id, subject: mailThreads.subject })
      .from(mailThreads)
      .where(eq(mailThreads.correspondentEmail, correspondentEmail))
      .orderBy(desc(mailThreads.lastMessageAt))
      .limit(20);
    const match = existing.find((t) => normalizeSubject(t.subject) === norm);
    if (match) return match.id;
  }

  const id = nanoid();
  await db.insert(mailThreads).values({
    id,
    subject: subject || "(без темы)",
    correspondentEmail,
    correspondentName,
    mailbox,
  });
  return id;
}

export async function appendMessage(opts: {
  threadId: string;
  direction: MailDirection;
  fromEmail: string;
  fromName?: string;
  toEmails: string[];
  subject: string;
  html?: string;
  text?: string;
  messageId?: string | null;
  inReplyTo?: string | null;
  providerId?: string | null;
  attachments?: MailAttachment[];
}): Promise<string> {
  const id = nanoid();
  await db.insert(mailMessages).values({
    id,
    threadId: opts.threadId,
    direction: opts.direction,
    fromEmail: opts.fromEmail.toLowerCase(),
    fromName: opts.fromName ?? "",
    toEmails: opts.toEmails,
    subject: opts.subject ?? "",
    html: opts.html ?? "",
    text: opts.text ?? "",
    messageId: opts.messageId ?? null,
    inReplyTo: opts.inReplyTo ?? null,
    providerId: opts.providerId ?? null,
    attachments: opts.attachments ?? [],
  });

  // Bump the thread: inbound marks it unread, outbound (our reply) clears it.
  await db
    .update(mailThreads)
    .set({
      lastMessageAt: new Date(),
      unread: opts.direction === "inbound",
    })
    .where(eq(mailThreads.id, opts.threadId));

  return id;
}

export type ThreadListItem = {
  id: string;
  subject: string;
  correspondentEmail: string;
  correspondentName: string;
  mailbox: string;
  status: ThreadStatus;
  unread: boolean;
  lastMessageAt: string;
  preview: string;
  messageCount: number;
};

export async function listThreads(): Promise<ThreadListItem[]> {
  const rows = await db
    .select({
      id: mailThreads.id,
      subject: mailThreads.subject,
      correspondentEmail: mailThreads.correspondentEmail,
      correspondentName: mailThreads.correspondentName,
      mailbox: mailThreads.mailbox,
      status: mailThreads.status,
      unread: mailThreads.unread,
      lastMessageAt: mailThreads.lastMessageAt,
      preview: sql<string>`(
        SELECT left(regexp_replace(coalesce(nullif(mm.text, ''), mm.html), '<[^>]*>', '', 'g'), 140)
        FROM mail_messages mm
        WHERE mm.thread_id = ${mailThreads.id}
        ORDER BY mm.created_at DESC LIMIT 1
      )`,
      messageCount: sql<number>`(
        SELECT count(*)::int FROM mail_messages mm WHERE mm.thread_id = ${mailThreads.id}
      )`,
    })
    .from(mailThreads)
    .orderBy(desc(mailThreads.lastMessageAt))
    .limit(400);

  return rows.map((r) => ({
    ...r,
    status: r.status as ThreadStatus,
    lastMessageAt: r.lastMessageAt.toISOString(),
    preview: (r.preview || "").trim(),
  }));
}

export type ThreadMessage = {
  id: string;
  direction: MailDirection;
  fromEmail: string;
  fromName: string;
  toEmails: string[];
  subject: string;
  html: string;
  text: string;
  attachments: MailAttachment[];
  createdAt: string;
};

export async function getThread(threadId: string): Promise<{
  thread: ThreadListItem | null;
  messages: ThreadMessage[];
}> {
  const t = await db.select().from(mailThreads).where(eq(mailThreads.id, threadId)).limit(1);
  if (!t[0]) return { thread: null, messages: [] };

  const msgs = await db
    .select()
    .from(mailMessages)
    .where(eq(mailMessages.threadId, threadId))
    .orderBy(mailMessages.createdAt);

  const thread = t[0];
  return {
    thread: {
      id: thread.id,
      subject: thread.subject,
      correspondentEmail: thread.correspondentEmail,
      correspondentName: thread.correspondentName,
      mailbox: thread.mailbox,
      status: thread.status as ThreadStatus,
      unread: thread.unread,
      lastMessageAt: thread.lastMessageAt.toISOString(),
      preview: "",
      messageCount: msgs.length,
    },
    messages: msgs.map((m) => ({
      id: m.id,
      direction: m.direction as MailDirection,
      fromEmail: m.fromEmail,
      fromName: m.fromName,
      toEmails: m.toEmails,
      subject: m.subject,
      html: m.html,
      text: m.text,
      attachments: (m.attachments as MailAttachment[]) ?? [],
      createdAt: m.createdAt.toISOString(),
    })),
  };
}

/** The message id of the most recent message in a thread (for reply headers). */
export async function latestMessageId(threadId: string): Promise<string | null> {
  const r = await db
    .select({ messageId: mailMessages.messageId })
    .from(mailMessages)
    .where(and(eq(mailMessages.threadId, threadId)))
    .orderBy(desc(mailMessages.createdAt))
    .limit(1);
  return r[0]?.messageId ?? null;
}

export async function setThreadStatus(threadId: string, status: ThreadStatus) {
  await db.update(mailThreads).set({ status }).where(eq(mailThreads.id, threadId));
}

export async function markThreadRead(threadId: string, unread = false) {
  await db.update(mailThreads).set({ unread }).where(eq(mailThreads.id, threadId));
}

export async function deleteThread(threadId: string) {
  await db.delete(mailThreads).where(eq(mailThreads.id, threadId));
}

export async function unreadCount(): Promise<number> {
  const r = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(mailThreads)
    .where(and(eq(mailThreads.unread, true), eq(mailThreads.status, "open")));
  return r[0]?.n ?? 0;
}
