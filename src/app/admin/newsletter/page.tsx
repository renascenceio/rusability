import { CAMPAIGNS } from "@/lib/mock";
import { NewsletterWorkspace } from "./NewsletterWorkspace";

export const metadata = { title: "Рассылки — Rusability" };

export default function AdminNewsletterPage() {
  return (
    <div className="mx-auto max-w-[1180px]">
      <NewsletterWorkspace campaigns={CAMPAIGNS} />
    </div>
  );
}
