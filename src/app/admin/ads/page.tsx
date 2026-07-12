import { AD_SLOTS } from "@/lib/mock";
import { AdsWorkspace } from "./AdsWorkspace";

export const metadata = { title: "Реклама — Rusability" };

export default function AdminAdsPage() {
  return (
    <div className="mx-auto max-w-[1180px]">
      <AdsWorkspace slots={AD_SLOTS} />
    </div>
  );
}
