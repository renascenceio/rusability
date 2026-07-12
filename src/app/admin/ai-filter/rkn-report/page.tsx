import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RknPrintTrigger } from "@/components/admin/RknPrintTrigger";

export const metadata = { title: "Отчёт о соответствии РКН — Rusability" };

type Row = { req: string; status: "ok" | "warn" | "todo"; note: string };

const STATUS_LABEL: Record<Row["status"], string> = {
  ok: "Выполнено",
  warn: "Требует проверки",
  todo: "Требует решения",
};
const STATUS_COLOR: Record<Row["status"], string> = {
  ok: "var(--success)",
  warn: "var(--warn, #b8860b)",
  todo: "var(--danger)",
};

const TRANSPORT: Row[] = [
  { req: "Действующий TLS-сертификат доверенного УЦ, без ошибок браузера", status: "ok", note: "Выпускается и продлевается на edge-слое Vercel" },
  { req: "Минимум TLS 1.2, TLS 1.3 включён", status: "ok", note: "Согласуется TLS 1.3 с откатом на 1.2" },
  { req: "Устаревшие протоколы отключены — SSL 3.0, TLS 1.0, TLS 1.1", status: "ok", note: "Не предлагаются сервером" },
  { req: "Только современные наборы шифров", status: "ok", note: "Управляется на edge-слое" },
  { req: "HTTP/2 и HTTP/3 включены", status: "ok", note: "Включены по умолчанию на edge Vercel" },
  { req: "Автоперенаправление HTTP → HTTPS", status: "ok", note: "308-редирект на edge" },
];

const HEADERS: [string, string][] = [
  ["Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload"],
  ["Content-Security-Policy", "upgrade-insecure-requests"],
  ["X-Content-Type-Options", "nosniff"],
  ["X-Frame-Options", "SAMEORIGIN"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["Permissions-Policy", "camera=(), microphone=(), geolocation=()"],
];

const MODERATION: Row[] = [
  { req: "Фильтр запрещённых тем при публикации", status: "ok", note: "content-filter.ts сканирует заголовок, лид и тело" },
  { req: "Автоблокировка нарушителей (3 нарушения → блок)", status: "ok", note: "Счётчик user.rkn_strikes" },
  { req: "Ручная блокировка администратором", status: "ok", note: "«Пользователи» → «Заблокированные»" },
  { req: "Автомодерация новостного бота", status: "ok", note: "Рерайт и проверка перед публикацией" },
  { req: "Реестр заблокированных пользователей", status: "ok", note: "Отдельная вкладка с причиной и счётчиком" },
];

const ACCESSIBILITY: Row[] = [
  { req: "Язык страницы объявлен (<html lang=\"ru\">)", status: "ok", note: "app/layout.tsx" },
  { req: "Ссылка «Перейти к основному содержимому»", status: "ok", note: "(public)/layout.tsx" },
  { req: "Альтернативный текст у изображений", status: "ok", note: "Полное покрытие alt" },
  { req: "Семантическая разметка (header, main, nav, footer)", status: "ok", note: "Во всех макетах" },
  { req: "ARIA-роли и атрибуты", status: "ok", note: "Кнопки, вкладки, переключатели" },
  { req: "Масштабирование до 200% без потери контента", status: "ok", note: "Вёрстка на rem/clamp" },
  { req: "Контраст текста ≥ 4.5:1", status: "warn", note: "Требуется финальная проверка серых подписей" },
];

const OPEN_ITEMS = [
  "Локализация ПДн на серверах в РФ (152-ФЗ) — выбрать РФ-хостинг для БД/форм.",
  "Идентификация владельца домена rusability.ru через ЕСИА (срок — 01.09.2026).",
  "Финальная проверка контраста второстепенного текста (WAVE / axe).",
];

function StatusPill({ status }: { status: Row["status"] }) {
  return (
    <span
      style={{ color: STATUS_COLOR[status], fontWeight: 600, whiteSpace: "nowrap" }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 28, breakInside: "avoid" }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: "var(--foreground)" }}>{title}</h2>
      {children}
    </section>
  );
}

function ReqTable({ rows }: { rows: Row[] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ textAlign: "left", borderBottom: "2px solid var(--border)" }}>
          <th style={{ padding: "8px 10px", width: "44%" }}>Требование</th>
          <th style={{ padding: "8px 10px", width: "18%" }}>Статус</th>
          <th style={{ padding: "8px 10px" }}>Как обеспечено</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.req} style={{ borderBottom: "1px solid var(--border)", breakInside: "avoid" }}>
            <td style={{ padding: "8px 10px", color: "var(--foreground)" }}>{r.req}</td>
            <td style={{ padding: "8px 10px" }}><StatusPill status={r.status} /></td>
            <td style={{ padding: "8px 10px", color: "var(--muted-foreground)" }}>{r.note}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function RknReportPage() {
  const today = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-[820px] text-[var(--foreground)]">
      <Link
        href="/admin/ai-filter"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] print:hidden"
      >
        <ArrowLeft className="h-4 w-4" /> Назад к ИИ-фильтру
      </Link>

      <header style={{ borderBottom: "3px solid var(--primary)", paddingBottom: 16, marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--primary)" }}>
          Rusability
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: 6, lineHeight: 1.2 }}>
          Отчёт о соответствии требованиям Роскомнадзора
        </h1>
        <p style={{ marginTop: 8, fontSize: 13, color: "var(--muted-foreground)" }}>
          Документ для подготовки обращения в РКН · сформировано {today}
        </p>
      </header>

      <Section title="1. Транспортная безопасность и протоколы">
        <ReqTable rows={TRANSPORT} />
        <p style={{ marginTop: 8, fontSize: 12.5, color: "var(--muted-foreground)" }}>
          Отключаются устаревшие протоколы (SSL 3.0 / TLS 1.0 / 1.1). TLS 1.3 остаётся включённым — это рекомендованная версия.
        </p>
      </Section>

      <Section title="2. HTTP-заголовки безопасности">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid var(--border)" }}>
              <th style={{ padding: "8px 10px", width: "42%" }}>Заголовок</th>
              <th style={{ padding: "8px 10px" }}>Значение</th>
            </tr>
          </thead>
          <tbody>
            {HEADERS.map(([k, v]) => (
              <tr key={k} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "8px 10px", fontFamily: "var(--font-mono, monospace)", fontSize: 12 }}>{k}</td>
                <td style={{ padding: "8px 10px", color: "var(--muted-foreground)", fontFamily: "var(--font-mono, monospace)", fontSize: 12 }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12.5, color: "var(--muted-foreground)" }}>
          Активируются на продакшн-деплое (VERCEL_ENV=production); проверяются через SSL Labs / curl -I.
        </p>
      </Section>

      <Section title="3. Контентная модерация по темам, запрещённым в РФ">
        <ReqTable rows={MODERATION} />
      </Section>

      <Section title="4. Доступность — ГОСТ Р 52872-2019">
        <ReqTable rows={ACCESSIBILITY} />
      </Section>

      <Section title="5. Открытые вопросы (до отправки в РКН)">
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.7 }}>
          {OPEN_ITEMS.map((item) => (
            <li key={item} style={{ color: "var(--foreground)" }}>{item}</li>
          ))}
        </ul>
      </Section>

      <footer style={{ marginTop: 32, paddingTop: 14, borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--muted-foreground)" }}>
        Rusability · внутренний документ о соответствии требованиям РКН · {today}
      </footer>

      <RknPrintTrigger />
    </div>
  );
}
