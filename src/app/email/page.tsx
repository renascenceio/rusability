import type { Metadata } from "next";
import { NewsletterDigest } from "@/components/email/NewsletterDigest";

export const metadata: Metadata = {
  title: "Дайджест — Rusability",
  robots: { index: false },
};

export default function EmailPage() {
  return (
    <div className="min-h-dvh bg-[#1a1712] px-4 py-10">
      <NewsletterDigest />
    </div>
  );
}
