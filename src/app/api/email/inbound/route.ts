import { type NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { put } from "@vercel/blob";
import { getResend } from "@/lib/mail/resend";
import {
  appendMessage,
  parseAddress,
  resolveThreadForInbound,
  type MailAttachment,
} from "@/lib/mail/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type InboundEvent = {
  type: string;
  data: {
    email_id: string;
    from: string;
    to?: string[];
    cc?: string[];
    subject?: string;
    message_id?: string;
    received_for?: string[];
    attachments?: { id: string; filename?: string; content_type?: string }[];
  };
};

/**
 * Resend inbound-email webhook.
 * The webhook payload is metadata only, so we retrieve the full email (body +
 * headers + attachments) from the Received Emails API, then persist a thread.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const secret = process.env.RESEND_WEBHOOK_SECRET;

  // Verify the Svix signature when a secret is configured.
  let evt: InboundEvent;
  if (secret) {
    try {
      const wh = new Webhook(secret);
      evt = wh.verify(raw, {
        "svix-id": req.headers.get("svix-id") ?? "",
        "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
        "svix-signature": req.headers.get("svix-signature") ?? "",
      }) as InboundEvent;
    } catch (err) {
      console.log("[v0] inbound webhook signature failed:", (err as Error).message);
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
  } else {
    evt = JSON.parse(raw) as InboundEvent;
  }

  if (evt.type !== "email.received") {
    return NextResponse.json({ ignored: evt.type });
  }

  const resend = getResend();
  if (!resend) {
    console.log("[v0] inbound webhook: RESEND_API_KEY not configured");
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const emailId = evt.data.email_id;

  // Retrieve the full received email (body, headers, attachment metadata).
  const { data: full, error: getErr } = await resend.emails.receiving.get(emailId);
  if (getErr) {
    console.log("[v0] inbound retrieve failed:", JSON.stringify(getErr));
  }

  const headers = full?.headers ?? {};
  const fromRaw = headers.from || full?.from || evt.data.from || "";
  const { name: fromName, email: fromEmail } = parseAddress(fromRaw);
  const subject = full?.subject ?? evt.data.subject ?? "(без темы)";
  const toList = full?.to ?? evt.data.to ?? [];
  const mailbox = (evt.data.received_for?.[0] || toList[0] || "").toLowerCase();
  const messageId = full?.message_id ?? evt.data.message_id ?? null;
  const inReplyTo = headers["in-reply-to"] || headers["In-Reply-To"] || null;

  // Persist attachments to Blob (best-effort).
  const attachments: MailAttachment[] = [];
  const attMeta = full?.attachments ?? [];
  for (const att of attMeta) {
    try {
      const { data: file } = await resend.emails.receiving.attachments.get({
        emailId,
        id: att.id,
      });
      const url = file?.download_url;
      if (!url) continue;
      const fileRes = await fetch(url);
      if (!fileRes.ok) continue;
      const buf = Buffer.from(await fileRes.arrayBuffer());
      const blob = await put(`mail/${emailId}/${att.filename || att.id}`, buf, {
        access: "public",
        addRandomSuffix: true,
        contentType: att.content_type,
      });
      attachments.push({
        filename: att.filename || "file",
        url: blob.url,
        contentType: att.content_type || "application/octet-stream",
        size: buf.byteLength,
      });
    } catch (err) {
      console.log("[v0] attachment fetch failed:", (err as Error).message);
    }
  }

  const threadId = await resolveThreadForInbound({
    correspondentEmail: fromEmail,
    correspondentName: fromName,
    subject,
    mailbox,
    inReplyTo,
  });

  await appendMessage({
    threadId,
    direction: "inbound",
    fromEmail,
    fromName,
    toEmails: toList,
    subject,
    html: full?.html ?? "",
    text: full?.text ?? "",
    messageId,
    inReplyTo,
    providerId: emailId,
    attachments,
  });

  console.log("[v0] inbound stored:", fromEmail, "→ thread", threadId);
  return NextResponse.json({ ok: true, threadId });
}
