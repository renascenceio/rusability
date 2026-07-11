"use client";

import { useState } from "react";
import * as Icons from "lucide-react";
import { Star } from "lucide-react";
import type { AppTool } from "@/lib/types";
import { APP_CATEGORIES } from "@/lib/mock/apps";
import { Card, Chip, Badge } from "@/components/ui/kit";

const PRICING_LABEL: Record<AppTool["pricing"], string> = {
  free: "Бесплатно",
  freemium: "Freemium",
  paid: "Платно",
};

const PRICING_TONE: Record<AppTool["pricing"], "success" | "primary" | "gold"> = {
  free: "success",
  freemium: "primary",
  paid: "gold",
};

function AppIcon({ name }: { name: string }) {
  const Ico = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] ?? Icons.AppWindow;
  return <Ico className="h-6 w-6 text-[var(--foreground)]" />;
}

export function AppsBrowser({ apps }: { apps: AppTool[] }) {
  const [cat, setCat] = useState("Все");
  const filtered = cat === "Все" ? apps : apps.filter((a) => a.category === cat);

  return (
    <div>
      <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto pb-1">
        {APP_CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCat(c)} className="shrink-0">
            <Chip active={cat === c}>{c}</Chip>
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((app) => (
          <Card key={app.id} className="flex flex-col p-5 transition-transform hover:-translate-y-1">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-2)]">
                <AppIcon name={app.icon} />
              </div>
              <Badge tone={PRICING_TONE[app.pricing]}>{PRICING_LABEL[app.pricing]}</Badge>
            </div>
            <h3 className="font-serif text-xl font-bold text-[var(--foreground)]">{app.name}</h3>
            <p className="mt-1 text-sm font-medium text-[var(--accent)]">{app.tagline}</p>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
              {app.description}
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4 text-sm">
              <span className="inline-flex items-center gap-1 font-semibold text-[var(--foreground)]">
                <Star className="h-4 w-4 fill-[var(--gold)] text-[var(--gold)]" /> {app.rating}
              </span>
              <span className="text-[var(--muted-foreground)]">{app.users} пользователей</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
