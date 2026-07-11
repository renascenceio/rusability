"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { CATEGORIES } from "@/lib/mock/categories";
import { AUTHORS } from "@/lib/mock/authors";
import { Avatar, Button, ButtonLink } from "@/components/ui/kit";
import { formatNumber, cn } from "@/lib/utils";

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [topics, setTopics] = useState<string[]>([]);
  const [follows, setFollows] = useState<string[]>([]);

  const toggle = (arr: string[], set: (v: string[]) => void, id: string) =>
    set(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  return (
    <div className="container-reading py-12 md:py-20">
      <div className="mb-10 flex items-center justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i <= step ? "w-10 bg-[var(--primary)]" : "w-6 bg-[var(--surface-3)]",
            )}
          />
        ))}
      </div>

      {step === 0 && (
        <div className="animate-slide-up text-center">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
            Шаг 1 из 3
          </span>
          <h1 className="mt-2 font-serif text-3xl font-bold text-[var(--foreground)] md:text-4xl">
            Что вам интересно?
          </h1>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Выберите темы — мы соберём из них персональную ленту.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((c) => {
              const on = topics.includes(c.slug);
              return (
                <button
                  key={c.slug}
                  onClick={() => toggle(topics, setTopics, c.slug)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-all",
                    on
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--primary)]",
                  )}
                >
                  {on && <Check className="h-4 w-4" />}
                  {c.name}
                </button>
              );
            })}
          </div>
          <div className="mt-10">
            <Button size="lg" disabled={topics.length === 0} onClick={() => setStep(1)}>
              Продолжить <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="animate-slide-up">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
              Шаг 2 из 3
            </span>
            <h1 className="mt-2 font-serif text-3xl font-bold text-[var(--foreground)] md:text-4xl">
              Кого читать?
            </h1>
            <p className="mt-3 text-[var(--muted-foreground)]">
              Подпишитесь на авторов, которые вам близки.
            </p>
          </div>
          <div className="mt-8 space-y-3">
            {AUTHORS.map((a) => {
              const on = follows.includes(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => toggle(follows, setFollows, a.id)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                    on
                      ? "border-[var(--primary)] bg-[var(--primary)]/6"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]",
                  )}
                >
                  <Avatar src={a.avatar} alt={a.name} size={52} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 font-semibold text-[var(--foreground)]">
                      {a.name}
                      {a.role === "ai" && <Sparkles className="h-4 w-4 text-[var(--primary)]" />}
                    </div>
                    <div className="truncate text-sm text-[var(--muted-foreground)]">
                      {formatNumber(a.followers)} подписчиков · {a.articlesCount} материалов
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-4 py-2 text-sm font-semibold",
                      on
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "bg-[var(--surface-2)] text-[var(--foreground)]",
                    )}
                  >
                    {on ? "Вы подписаны" : "Подписаться"}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Button variant="ghost" size="lg" onClick={() => setStep(0)}>
              Назад
            </Button>
            <Button size="lg" onClick={() => setStep(2)}>
              Продолжить <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-slide-up text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/12">
            <Check className="h-8 w-8 text-[var(--primary)]" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-[var(--foreground)] md:text-4xl">
            Лента готова
          </h1>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Мы выбрали {topics.length}{" "}
            {topics.length === 1 ? "тему" : "тем"} и {follows.length}{" "}
            {follows.length === 1 ? "автора" : "авторов"}. Настройки можно изменить в профиле.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <ButtonLink href="/" size="lg">
              Перейти к ленте <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}
