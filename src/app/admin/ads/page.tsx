import { AD_SLOTS } from "@/lib/mock";
import { allCtas } from "@/lib/data/ctas";
import { AdsWorkspace } from "./AdsWorkspace";

export const metadata = { title: "Реклама — Rusability" };
export const dynamic = "force-dynamic";

export default async function AdminAdsPage() {
  const ctas = await allCtas();
  return (
    <div className="mx-auto max-w-[1180px]">
      <AdsWorkspace slots={AD_SLOTS} ctas={ctas} />
    </div>
  );
}
