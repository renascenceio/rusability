"use client";

import { useEffect, useState } from "react";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("rusability-cookie-consent")) {
      const t = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = (value: string) => {
    localStorage.setItem("rusability-cookie-consent", value);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-4">
      <div className="flex w-full max-w-2xl flex-col items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-5 shadow-[var(--shadow-lift)] backdrop-blur-xl sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="text-sm font-bold text-[var(--foreground)]">
            Мы используем файлы cookie
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
            Rusability использует cookie для персонализации, аналитики и улучшения сервиса.{" "}
            <a href="#" className="font-medium text-[var(--primary)] hover:underline">
              Политика конфиденциальности →
            </a>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => dismiss("configured")}
            className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-3)]"
          >
            Настроить
          </button>
          <button
            onClick={() => dismiss("all")}
            className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] transition-all hover:brightness-110 active:scale-[0.97]"
          >
            Принять все
          </button>
        </div>
      </div>
    </div>
  );
}
