import "server-only";
import { Resend } from "resend";

/**
 * Central Resend config for the Rusability mailbox.
 *
 * Required env vars (set in Project → Vars):
 *  - RESEND_API_KEY          the Resend API key (send + receive)
 *  - MAIL_FROM_ADDRESS       the verified address we send replies from,
 *                            e.g. "Rusability <hello@rusability.ru>"
 *  - RESEND_WEBHOOK_SECRET   the signing secret for the inbound webhook
 *                            (from the Resend dashboard → Webhooks)
 */
export const MAIL_FROM =
  process.env.MAIL_FROM_ADDRESS || "Rusability <onboarding@resend.dev>";

export function isMailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

let client: Resend | null = null;

/** Returns a Resend client, or null when the API key is not configured. */
export function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}
