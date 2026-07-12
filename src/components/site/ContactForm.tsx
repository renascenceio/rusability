"use client";

import { useEffect, useRef, useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { submitContactMessage } from "@/app/actions/contact";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const renderedAt = useRef<number>(Date.now());

  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError(null);
    const res = await submitContactMessage({
      name,
      email,
      subject,
      message,
      company,
      renderedAt: renderedAt.current,
    });
    if (res.ok) {
      setStatus("done");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } else {
      setStatus("error");
      setError(res.error);
    }
  }

  if (status === "done") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-soft)]">
          <CheckCircle2 className="h-7 w-7 text-[var(--primary)]" />
        </span>
        <div>
          <p className="font-serif text-xl font-bold text-[var(--foreground)]">
            Сообщение отправлено
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Спасибо за обращение. Мы ответим на указанный адрес электронной почты.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="text-sm font-semibold text-[var(--primary)] hover:underline"
        >
          Отправить ещё одно
        </button>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--faint)] focus:border-[var(--primary)]";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {/* Honeypot: visually hidden, ignored by humans, filled by bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Компания
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            Имя
          </label>
          <input
            id="cf-name"
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Как к вам обращаться"
            maxLength={120}
            required
          />
        </div>
        <div>
          <label htmlFor="cf-email" className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            Электронная почта
          </label>
          <input
            id="cf-email"
            type="email"
            className={inputCls}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            maxLength={200}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="cf-subject" className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
          Тема
        </label>
        <input
          id="cf-subject"
          className={inputCls}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Кратко о чём сообщение"
          maxLength={200}
        />
      </div>

      <div>
        <label htmlFor="cf-message" className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
          Сообщение
        </label>
        <textarea
          id="cf-message"
          className={`${inputCls} min-h-36 resize-y`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Расскажите подробнее…"
          maxLength={5000}
          required
        />
      </div>

      {error && (
        <p className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-4 py-2.5 text-sm text-[var(--accent)]">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs leading-relaxed text-[var(--faint)]">
          Отправляя форму, вы соглашаетесь с{" "}
          <a href="/privacy" className="text-[var(--primary)] hover:underline">
            политикой конфиденциальности
          </a>
          .
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {status === "sending" ? "Отправка…" : "Отправить"}
        </button>
      </div>
    </form>
  );
}
