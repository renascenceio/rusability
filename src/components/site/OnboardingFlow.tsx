"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  BookOpen,
  PenLine,
  Sparkles,
} from "lucide-react";
import { AUTHORS } from "@/lib/mock/authors";
import { CATEGORIES } from "@/lib/taxonomy";
import { formatNumber, cn } from "@/lib/utils";

type Role = "reader" | "author" | "both";

const ROLES: { id: Role; icon: typeof BookOpen; title: string; desc: string }[] = [
  {
    id: "reader",
    icon: BookOpen,
    title: "Читатель",
    desc: "Читаю статьи, слежу за темами и авторами, открываю для себя новые инструменты",
  },
  {
    id: "author",
    icon: PenLine,
    title: "Автор",
    desc: "Пишу статьи, строю аудиторию, монетизирую свои знания и экспертизу",
  },
  {
    id: "both",
    icon: Sparkles,
    title: "И то, и другое",
    desc: "Читаю и пишу — хочу полный доступ к функциям платформы",
  },
];

const STATS = [
  { value: "47k+", label: "читателей" },
  { value: "1.2k", label: "авторов" },
  { value: "94", label: "приложения" },
];

const RECOMMENDED = AUTHORS.filter((a) => a.role !== "ai").slice(0, 4);

export function OnboardingFlow() {
  const [step, setStep] = useState(0); // 0 welcome, 1 account, 2 role, 3 topics, 4 authors, 5 done
  const [showPass, setShowPass] = useState(false);
  const [name, setName] = useState("Анна");
  const [role, setRole] = useState<Role>("reader");
  const [topics, setTopics] = useState<string[]>(["design", "marketing", "seo", "ux"]);
  const [following, setFollowing] = useState<string[]>(
    [RECOMMENDED[1]?.id].filter(Boolean) as string[],
  );

  const toggleTopic = (slug: string) =>
    setTopics((t) => (t.includes(slug) ? t.filter((x) => x !== slug) : [...t, slug]));
  const toggleFollow = (id: string) =>
    setFollowing((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const progressStep = step >= 1 && step <= 3 ? step : 0;

  return (
    <div className="onboarding-dark relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
        style={{ background: "radial-gradient(circle, #4D5AFF, transparent 70%)" }}
      />

      <div className="relative w-full max-w-md">
        {progressStep > 0 && (
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/12 text-white/70 transition-colors hover:bg-white/5"
              aria-label="Назад"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#4D5AFF] transition-all duration-500"
                style={{ width: `${(progressStep / 3) * 100}%` }}
              />
            </div>
            <span className="shrink-0 text-sm font-medium text-white/50">{progressStep} / 3</span>
          </div>
        )}

        {/* STEP 0 — Welcome */}
        {step === 0 && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#5b67ff] to-[#3d49e6] text-3xl font-black text-white shadow-[0_12px_40px_-8px_rgba(77,90,255,0.7)]">
              R
            </div>
            <h1 className="font-serif text-3xl font-black text-white">
              Rusability<span className="text-[#4D5AFF]">.ru</span>
            </h1>
            <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-white/55">
              Медиа нового поколения для цифровых специалистов
            </p>

            <div className="mx-auto mt-7 flex max-w-sm items-center justify-center gap-2.5">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3"
                >
                  <div className="text-lg font-bold text-white">{s.value}</div>
                  <div className="text-xs text-white/45">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => setStep(1)}
                className="w-full rounded-full bg-[#4D5AFF] py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
              >
                Создать аккаунт
              </button>
              <button className="flex w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.03] py-3.5 text-sm font-semibold text-white/85 transition-colors hover:bg-white/[0.06]">
                <span className="font-bold text-[#EA4335]">G</span> Войти через Google
              </button>
              <button className="flex w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.03] py-3.5 text-sm font-semibold text-white/85 transition-colors hover:bg-white/[0.06]">
                <span className="text-[#29A9EA]">✈</span> Войти через Telegram
              </button>
            </div>
            <p className="mt-6 text-sm text-white/45">
              Уже есть аккаунт?{" "}
              <Link href="/" className="font-medium text-[#4D5AFF] hover:underline">
                Войти
              </Link>
            </p>
          </div>
        )}

        {/* STEP 1 — Account */}
        {step === 1 && (
          <div>
            <h2 className="font-serif text-2xl font-bold text-white">Создать аккаунт</h2>
            <p className="mt-1.5 text-sm text-white/55">Несколько секунд — и вы в Rusability</p>
            <div className="mt-6 space-y-4">
              <Field label="Имя">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="ob-input"
                  placeholder="Ваше имя"
                />
              </Field>
              <Field label="Email">
                <input
                  className="ob-input"
                  placeholder="you@example.com"
                  defaultValue="anna@artemy.studio"
                />
              </Field>
              <Field label="Пароль">
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    className="ob-input pr-11"
                    defaultValue="password"
                  />
                  <button
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                    aria-label={showPass ? "Скрыть пароль" : "Показать пароль"}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-white/40">Минимум 8 символов</p>
              </Field>
              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-white/60">
                <input type="checkbox" defaultChecked className="mt-0.5 h-4 w-4 accent-[#4D5AFF]" />
                <span>
                  Я принимаю{" "}
                  <a href="#" className="text-[#4D5AFF] hover:underline">
                    условия использования
                  </a>{" "}
                  и{" "}
                  <a href="#" className="text-[#4D5AFF] hover:underline">
                    политику конфиденциальности
                  </a>
                </span>
              </label>
            </div>
            <NextButton onClick={() => setStep(2)}>Продолжить</NextButton>
          </div>
        )}

        {/* STEP 2 — Role */}
        {step === 2 && (
          <div>
            <h2 className="font-serif text-2xl font-bold text-white">Кто вы?</h2>
            <p className="mt-1.5 text-sm text-white/55">Это поможет настроить опыт под вас</p>
            <div className="mt-6 space-y-3">
              {ROLES.map((r) => {
                const active = role === r.id;
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={cn(
                      "flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition-all",
                      active
                        ? "border-[#4D5AFF] bg-[#4D5AFF]/10"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        active ? "bg-[#4D5AFF] text-white" : "bg-white/[0.08] text-white/70",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="flex-1">
                      <span className="block font-semibold text-white">{r.title}</span>
                      <span className="mt-0.5 block text-sm leading-snug text-white/50">
                        {r.desc}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                        active ? "border-[#4D5AFF] bg-[#4D5AFF]" : "border-white/25",
                      )}
                    >
                      {active && <Check className="h-3 w-3 text-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
            <NextButton onClick={() => setStep(3)}>Продолжить</NextButton>
          </div>
        )}

        {/* STEP 3 — Topics */}
        {step === 3 && (
          <div>
            <h2 className="font-serif text-2xl font-bold text-white">Что вас интересует?</h2>
            <p className="mt-1.5 text-sm text-white/55">Выберите минимум 3 темы</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {CATEGORIES.map((c) => {
                const active = topics.includes(c.slug);
                return (
                  <button
                    key={c.slug}
                    onClick={() => toggleTopic(c.slug)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "border-[#4D5AFF] bg-[#4D5AFF] text-white"
                        : "border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]",
                    )}
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                    {c.name}
                  </button>
                );
              })}
            </div>
            <p className="mt-5 text-center text-sm text-white/45">
              Выбрано {topics.length} из {CATEGORIES.length} тем
            </p>
            <NextButton onClick={() => setStep(4)} disabled={topics.length < 3}>
              Продолжить
            </NextButton>
          </div>
        )}

        {/* STEP 4 — Follow authors */}
        {step === 4 && (
          <div>
            <h2 className="font-serif text-2xl font-bold text-white">Следите за авторами</h2>
            <p className="mt-1.5 text-sm text-white/55">Лучшие авторы по вашим темам</p>
            <div className="mt-6 space-y-3">
              {RECOMMENDED.map((a) => {
                const isFollowing = following.includes(a.id);
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-white">{a.name}</div>
                      <div className="truncate text-xs text-white/45">
                        {a.bio.split(",")[0].split(".")[0]} · {formatNumber(a.followers)} читателей
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFollow(a.id)}
                      className={cn(
                        "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                        isFollowing
                          ? "border border-white/15 bg-transparent text-white/70"
                          : "bg-[#4D5AFF] text-white hover:brightness-110",
                      )}
                    >
                      {isFollowing ? "Подписан" : "+ Подписаться"}
                    </button>
                  </div>
                );
              })}
            </div>
            <NextButton onClick={() => setStep(5)}>Перейти к чтению</NextButton>
            <button
              onClick={() => setStep(5)}
              className="mt-3 w-full text-center text-sm text-white/45 hover:text-white/70"
            >
              Пропустить
            </button>
          </div>
        )}

        {/* STEP 5 — Done */}
        {step === 5 && (
          <div className="text-center">
            <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-[#4D5AFF] text-white shadow-[0_0_60px_-4px_rgba(77,90,255,0.9)]">
              <Check className="h-9 w-9" />
            </div>
            <h2 className="font-serif text-3xl font-black text-white text-balance">
              Добро пожаловать, {name || "Анна"}!
            </h2>
            <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-white/55">
              Ваш персональный Rusability готов. Подобрали первые материалы по вашим темам.
            </p>
            <div className="mt-7 space-y-2.5 text-left">
              {[
                {
                  t: "Интерфейс как язык: почему будущее за эмоциональным дизайном",
                  m: "Дизайн · 8 мин",
                },
                { t: "ИИ-стратег против маркетолога: кто победит?", m: "Маркетинг · 5 мин" },
              ].map((it) => (
                <div
                  key={it.t}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-[#5b67ff]/40 to-[#3d49e6]/30" />
                  <div>
                    <div className="text-sm font-semibold leading-snug text-white">{it.t}</div>
                    <div className="mt-0.5 text-xs text-white/40">{it.m}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/"
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#4D5AFF] py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
            >
              Начать читать <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
        {label}
      </label>
      {children}
    </div>
  );
}

function NextButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#4D5AFF] py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children} <ArrowRight className="h-4 w-4" />
    </button>
  );
}
