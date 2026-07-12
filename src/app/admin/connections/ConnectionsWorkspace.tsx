"use client";

import { useState, useTransition } from "react";
import { Plug, Check } from "lucide-react";
import { Tag, AdminButton } from "@/components/admin/ui";
import {
  toggleConnected as toggleConnectedAction,
  toggleAutopost as toggleAutopostAction,
} from "./actions";

type Connection = {
  id: string;
  platform: string;
  handle: string;
  connected: boolean;
  followers: string;
  lastSync?: string | null;
  autopost: boolean;
};

export function ConnectionsWorkspace({ initial }: { initial: Connection[] }) {
  const [items, setItems] = useState<Connection[]>(initial);
  const [, startTransition] = useTransition();

  function toggleAutopost(id: string) {
    setItems((list) => list.map((c) => (c.id === id ? { ...c, autopost: !c.autopost } : c)));
    startTransition(async () => {
      const res = await toggleAutopostAction(id);
      if (res.ok) {
        setItems((list) => list.map((c) => (c.id === id ? { ...c, autopost: res.autopost } : c)));
      }
    });
  }

  function toggleConnected(id: string) {
    setItems((list) =>
      list.map((c) =>
        c.id === id
          ? {
              ...c,
              connected: !c.connected,
              autopost: c.connected ? false : c.autopost,
              lastSync: c.connected ? null : "только что",
            }
          : c,
      ),
    );
    startTransition(async () => {
      const res = await toggleConnectedAction(id);
      if (res.ok) {
        setItems((list) =>
          list.map((c) =>
            c.id === id
              ? {
                  ...c,
                  connected: res.connected,
                  autopost: res.connected ? c.autopost : false,
                  lastSync: res.connected ? "только что" : null,
                }
              : c,
          ),
        );
      }
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((c) => (
        <div key={c.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--muted)] text-[var(--muted-foreground)]">
                <Plug className="h-5 w-5" />
              </span>
              <div>
                <div className="font-serif text-lg font-bold text-[var(--foreground)]">{c.platform}</div>
                <div className="text-sm text-[var(--muted-foreground)]">{c.handle}</div>
              </div>
            </div>
            {c.connected ? (
              <Tag tone="success">
                <Check className="h-3.5 w-3.5" /> Подключено
              </Tag>
            ) : (
              <Tag tone="neutral">Не подключено</Tag>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-sm">
            <span className="text-[var(--muted-foreground)]">{c.followers} подписчиков</span>
            {c.lastSync ? (
              <span className="text-xs text-[var(--muted-foreground)]">Синхр.: {c.lastSync}</span>
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-[var(--foreground)]">Автопостинг</span>
            <button
              type="button"
              onClick={() => toggleAutopost(c.id)}
              disabled={!c.connected}
              aria-pressed={c.autopost}
              aria-label={`Автопостинг для ${c.platform}`}
              className="disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  c.autopost ? "bg-[var(--primary)]" : "bg-[var(--surface-3)]"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    c.autopost ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </span>
            </button>
          </div>

          <AdminButton
            variant={c.connected ? "outline" : "primary"}
            className="mt-4 w-full justify-center"
            onClick={() => toggleConnected(c.id)}
          >
            {c.connected ? "Отключить" : "Подключить"}
          </AdminButton>
        </div>
      ))}
    </div>
  );
}
