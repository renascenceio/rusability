"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const isSignUp = mode === "sign-up";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = isSignUp
        ? await authClient.signUp.email({ email, password, name })
        : await authClient.signIn.email({ email, password });
      if (res.error) {
        setError(translateError(res.error.message || res.error.statusText));
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Что-то пошло не так. Попробуйте ещё раз.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-3xl font-semibold text-balance text-[var(--foreground)]">
          {isSignUp ? "Создать аккаунт" : "С возвращением"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
          {isSignUp
            ? "Присоединяйтесь к сообществу Rusability"
            : "Войдите, чтобы продолжить работу"}
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {isSignUp && (
          <Field
            label="Имя"
            value={name}
            onChange={setName}
            type="text"
            autoComplete="name"
            required
            placeholder="Иван Петров"
          />
        )}
        <Field
          label="Email"
          value={email}
          onChange={setEmail}
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
        <Field
          label="Пароль"
          value={password}
          onChange={setPassword}
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          required
          minLength={8}
          placeholder="Минимум 8 символов"
        />

        {error && (
          <p className="rounded-lg border border-[var(--danger,#dc2626)]/30 bg-[var(--danger,#dc2626)]/8 px-3 py-2 text-[13px] text-[var(--danger,#dc2626)]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-foreground)] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Подождите…" : isSignUp ? "Зарегистрироваться" : "Войти"}
        </button>
      </form>

      {/* Public self-registration is disabled — only the sign-in form is
          reachable (used by editors/admins). Account creation is handled in
          the admin console. */}
      {isSignUp && (
        <p className="mt-6 text-center text-[13px] text-[var(--muted-foreground)]">
          Уже есть аккаунт?{" "}
          <Link href="/sign-in" className="font-semibold text-[var(--primary)] hover:underline">
            Войти
          </Link>
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-[var(--foreground)]">{label}</span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-[var(--border)] bg-[var(--surface,var(--background))] px-3.5 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--faint)] focus:border-[var(--primary)]"
      />
    </label>
  );
}

function translateError(msg?: string): string {
  const m = (msg || "").toLowerCase();
  if (m.includes("invalid") && m.includes("password")) return "Неверный email или пароль.";
  if (m.includes("invalid email")) return "Неверный email или пароль.";
  if (m.includes("already") || m.includes("exists")) return "Пользователь с таким email уже существует.";
  if (m.includes("password")) return "Пароль должен быть не короче 8 символов.";
  return "Не удалось выполнить вход. Проверьте данные и попробуйте снова.";
}
