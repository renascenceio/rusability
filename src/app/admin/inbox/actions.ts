"use server";

import { revalidatePath } from "next/cache";
import { requireRole, ADMIN_ROLES } from "@/lib/auth-helpers";
import { getResend, isMailConfigured, MAIL_FROM } from "@/lib/mail/resend";
import {
  appendMessage,
  getThread,
  latestMessageId,
  markThreadRead,
  setThreadStatus,
  deleteThread,
  parseAddress,
  type ThreadStatus,
} from "@/lib/mail/store";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Send a reply in a thread and record it as an outbound message. */
export async function sendReply(
  threadId: string,
  body: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireRole(ADMIN_ROLES, "/admin");

  const text = body.trim();
  if (!text) return { ok: false, error: "Пустое сообщение" };
  if (!isMailConfigured()) {
    return { ok: false, error: "Почта не подключена. Добавьте RESEND_API_KEY в настройках." };
  }

  const { thread, messages } = await getThread(threadId);
  if (!thread) return { ok: false, error: "Диалог не найден" };

  const resend = getResend();
  if (!resend) return { ok: false, error: "Почта не подключена" };

  const parentMessageId = await latestMessageId(threadId);
  const subject = thread.subject.match(/^\s*re:/i)
    ? thread.subject
    : `Re: ${thread.subject}`;
  const fromName = parseAddress(MAIL_FROM).name || "Rusability";

  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a">${text
    .split("\n")
    .map((l) => escapeHtml(l))
    .join("<br/>")}</div>`;

  const headers: Record<string, string> = {};
  if (parentMessageId) {
    headers["In-Reply-To"] = parentMessageId;
    headers["References"] = parentMessageId;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: MAIL_FROM,
      to: [thread.correspondentEmail],
      subject,
      text,
      html,
      replyTo: thread.mailbox || undefined,
      headers,
    });
    if (error) {
      console.log("[v0] reply send error:", JSON.stringify(error));
      return { ok: false, error: "Не удалось отправить письмо" };
    }

    await appendMessage({
      threadId,
      direction: "outbound",
      fromEmail: parseAddress(MAIL_FROM).email,
      fromName,
      toEmails: [thread.correspondentEmail],
      subject,
      html,
      text,
      providerId: data?.id ?? null,
      // Our sent message id isn't returned; correspondent replies thread by subject.
      messageId: null,
    });

    revalidatePath("/admin/inbox");
    return { ok: true };
  } catch (err) {
    console.log("[v0] reply send threw:", (err as Error).message);
    return { ok: false, error: "Ошибка отправки" };
  }
}

/** Open a thread: mark it read and return its full message history. */
export async function openThread(threadId: string) {
  await requireRole(ADMIN_ROLES, "/admin");
  const { thread, messages } = await getThread(threadId);
  if (thread?.unread) await markThreadRead(threadId, false);
  return { thread, messages };
}

export async function markRead(threadId: string, unread = false) {
  await requireRole(ADMIN_ROLES, "/admin");
  await markThreadRead(threadId, unread);
  revalidatePath("/admin/inbox");
}

export async function changeStatus(threadId: string, status: ThreadStatus) {
  await requireRole(ADMIN_ROLES, "/admin");
  await setThreadStatus(threadId, status);
  revalidatePath("/admin/inbox");
}

export async function removeThread(threadId: string) {
  await requireRole(ADMIN_ROLES, "/admin");
  await deleteThread(threadId);
  revalidatePath("/admin/inbox");
}
