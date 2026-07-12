"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";

/**
 * Floating "Save as PDF" control for the RKN compliance report print page.
 * Uses the browser's native print dialog (→ "Save as PDF"), so no server-side
 * PDF library is required. Pass ?auto=1 to fire the dialog automatically.
 */
export function RknPrintTrigger({ auto = false }: { auto?: boolean }) {
  useEffect(() => {
    if (auto) {
      const t = setTimeout(() => window.print(), 600);
      return () => clearTimeout(t);
    }
  }, [auto]);

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-lg transition-transform hover:scale-[1.03] print:hidden"
    >
      <Printer className="h-4 w-4" /> Сохранить как PDF
    </button>
  );
}
