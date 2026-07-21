import { DEFAULT_HUMANIZER } from "@/lib/ai/humanizer-config";
import { HumanizerWorkspace } from "../admin/humanizer/HumanizerWorkspace";

export const dynamic = "force-dynamic";

export default function TmpHarness() {
  return (
    <div className="admin-root min-h-screen bg-[var(--background)] p-8" data-admin-theme="renascence">
      <HumanizerWorkspace initial={DEFAULT_HUMANIZER} />
    </div>
  );
}
