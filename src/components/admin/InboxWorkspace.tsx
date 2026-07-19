"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import {
  Inbox,
  Search,
  Send,
  Paperclip,
  Mail,
  MailOpen,
  Archive,
  ArchiveRestore,
  ShieldAlert,
  Trash2,
  Loader2,
  CircleDot,
} from "lucide-react";
import { PageHeader, Panel, Tag, KpiCard } from "@/components/admin/ui";
import {
  openThread,
  sendReply,
  markRead,
  changeStatus,
  removeThread,
} from "@/app/admin/inbox/actions";

type Attachment = { filename: string; url: string; contentType: string; size: number };
type ThreadStatus = "open" | "closed" | "spam";

export type Thread = {
  id: string;
  subject: string;
  correspondentEmail: string;
  correspondentName: string;
  mailbox: string;
  status: ThreadStatus;
  unread: boolean;
  lastMessageAt: string;
  preview: string;
  messageCount: number;
};

type Message = {
  id: string;
  direction: "inbound" | "outbound";
  fromEmail: string;
  fromName: string;
  toEmails: string[];
  subject: string;
  html: string;
  text: string;
  attachments: Attachment[];
  createdAt: string;
};

type Filter = "unread" | "open" | "closed" | "spam" | "all";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "unread", label: "Непрочитанные" },
  { id: "open", label: "Открытые" },
  { id: "closed", label: "Закрытые" },
  { id: "spam", label: "Спам" },
  { id: "all", label: "Все" },
];

function fmtTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return d.toLocaleString("ru-RU", {
    day: sameDay ? undefined : "numeric",
    month: sameDay ? undefined : "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(name: string, email: string): string {
  const base = (name || email || "?").trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

export function InboxWorkspace({
  threads: initialThreads,
  configured,
  fromAddress,
}: {
  threads: Thread[];
  configured: boolean;
  fromAddress: string;
}) {
  const [threads, setThreads] = useState(initialThreads);
  const [filter, setFilter] = useState<Filter>("unread");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingThread, startLoad] = useTransition();
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [banner, setBanner] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const counts = useMemo(
    () => ({
      unread: threads.filter((t) => t.unread && t.status === "open").length,
      open: threads.filter((t) => t.status === "open").length,
      closed: threads.filter((t) => t.status === "closed").length,
      spam: threads.filter((t) => t.status === "spam").length,
      all: threads.length,
    }),
    [threads],
  );

  const visible = useMemo(() => {
    let list = threads;
    if (filter === "unread") list = list.filter((t) => t.unread && t.status === "open");
    else if (filter !== "all") list = list.filter((t) => t.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          t.correspondentEmail.toLowerCase().includes(q) ||
          t.correspondentName.toLowerCase().includes(q) ||
          t.preview.toLowerCase().includes(q),
      );
    }
    return list;
  }, [threads, filter, query]);

  const active = threads.find((t) => t.id === activeId) ?? null;

  function selectThread(t: Thread) {
    setActiveId(t.id);
    setMessages([]);
    setReply("");
    setBanner(null);
    if (t.unread) {
      setThreads((prev) => prev.map((x) => (x.id === t.id ? { ...x, unread: false } : x)));
    }
    startLoad(async () => {
      const res = await openThread(t.id);
      setMessages(res.messages as Message[]);
    });
  }

  async function onSend() {
    if (!active || !reply.trim() || sending) return;
    setSending(true);
    setBanner(null);
    const res = await sendReply(active.id, reply);
    setSending(false);
    if (!res.ok) {
      setBanner({ tone: "err", text: res.error ?? "Не удалось отправить" });
      return;
    }
    const now = new Date().toISOString();
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${now}`,
        direction: "outbound",
        fromEmail: fromAddress,
        fromName: "Rusability",
        toEmails: [active.correspondentEmail],
        subject: active.subject,
        html: "",
        text: reply,
        attachments: [],
        createdAt: now,
      },
    ]);
    setThreads((prev) =>
      prev.map((x) => (x.id === active.id ? { ...x, lastMessageAt: now, unread: false } : x)),
    );
    setReply("");
    setBanner({ tone: "ok", text: "Ответ отправлен" });
  }

  function updateStatus(id: string, status: ThreadStatus) {
    setThreads((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
    changeStatus(id, status);
  }

  function toggleUnread(t: Thread) {
    const next = !t.unread;
    setThreads((prev) => prev.map((x) => (x.id === t.id ? { ...x, unread: next } : x)));
    markRead(t.id, next);
  }

  function onRemove(id: string) {
    setThreads((prev) => prev.filter((x) => x.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
    }
    removeThread(id);
  }

  return (
    <div>
      <PageHeader
        title="Почта"
        subtitle={`Входящие письма и ответы прямо в админке · отправка с ${fromAddress}`}
      />

      {!configured && (
        <div className="mb-5 rounded-xl border border-[color-mix(in_srgb,var(--gold)_35%,transparent)] bg-[color-mix(in_srgb,var(--gold)_10%,transparent)] p-4 text-sm">
          <p className="font-semibold text-[var(--foreground)]">
            Почта ещё не подключена
          </p>
          <p className="mt-1 text-[var(--muted-foreground)]">
            Добавьте переменные <code className="font-mono">RESEND_API_KEY</code>,{" "}
            <code className="font-mono">MAIL_FROM_ADDRESS</code> и{" "}
            <code className="font-mono">RESEND_WEBHOOK_SECRET</code> в настройках проекта,
            затем настройте MX-запись и вебхук в панели Resend. До этого письма приниматься
            не будут, но интерфейс уже доступен.
          </p>
        </div>
      )}

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <KpiCard label="Непрочитанные" value={String(counts.unread)} />
        <KpiCard label="Открытые" value={String(counts.open)} />
        <KpiCard label="Всего диалогов" value={String(counts.all)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(300px,380px)_1fr]">
        {/* Thread list */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по письмам"
              className="w-full rounded-full border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  filter === f.id
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {f.label}
                <span className="ml-1.5 opacity-70">{counts[f.id]}</span>
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <Panel>
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-2)]">
                  <Inbox className="h-6 w-6 text-[var(--muted-foreground)]" />
                </span>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Здесь пока нет писем.
                </p>
              </div>
            </Panel>
          ) : (
            <div className="flex max-h-[70vh] flex-col gap-1.5 overflow-y-auto pr-1">
              {visible.map((t) => {
                const on = activeId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => selectThread(t)}
                    className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
                      on
                        ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                        : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]"
                    }`}
                  >
                    <span
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-3)] text-xs font-bold text-[var(--foreground)]"
                      aria-hidden
                    >
                      {initials(t.correspondentName, t.correspondentEmail)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`truncate text-sm ${
                            t.unread
                              ? "font-bold text-[var(--foreground)]"
                              : "font-medium text-[var(--foreground)]"
                          }`}
                        >
                          {t.correspondentName || t.correspondentEmail}
                        </span>
                        {t.unread && t.status === "open" && (
                          <CircleDot className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />
                        )}
                        <span className="ml-auto shrink-0 text-[11px] text-[var(--faint)]">
                          {fmtTime(t.lastMessageAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[13px] font-medium text-[var(--foreground)]">
                        {t.subject}
                      </p>
                      <p className="truncate text-[12px] text-[var(--muted-foreground)]">
                        {t.preview}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Reader + composer */}
        <Panel className="flex min-h-[60vh] flex-col">
          {!active ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-2)]">
                <Mail className="h-7 w-7 text-[var(--muted-foreground)]" />
              </span>
              <p className="text-sm text-[var(--muted-foreground)]">
                Выберите письмо слева, чтобы прочитать и ответить.
              </p>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              {/* Thread header */}
              <div className="flex flex-wrap items-start gap-3 border-b border-[var(--border)] pb-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-balance text-lg font-bold text-[var(--foreground)]">
                    {active.subject}
                  </h2>
                  <p className="mt-0.5 text-[13px] text-[var(--muted-foreground)]">
                    {active.correspondentName
                      ? `${active.correspondentName} · ${active.correspondentEmail}`
                      : active.correspondentEmail}
                    {active.mailbox ? ` → ${active.mailbox}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {active.status === "open" && <Tag tone="success">открыт</Tag>}
                  {active.status === "closed" && <Tag tone="neutral">закрыт</Tag>}
                  {active.status === "spam" && <Tag tone="danger">спам</Tag>}
                  <IconBtn title="Отметить непрочитанным" onClick={() => toggleUnread(active)}>
                    {active.unread ? (
                      <MailOpen className="h-4 w-4" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                  </IconBtn>
                  {active.status !== "closed" ? (
                    <IconBtn title="Закрыть" onClick={() => updateStatus(active.id, "closed")}>
                      <Archive className="h-4 w-4" />
                    </IconBtn>
                  ) : (
                    <IconBtn title="Вернуть в открытые" onClick={() => updateStatus(active.id, "open")}>
                      <ArchiveRestore className="h-4 w-4" />
                    </IconBtn>
                  )}
                  <IconBtn title="В спам" onClick={() => updateStatus(active.id, "spam")}>
                    <ShieldAlert className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn title="Удалить" danger onClick={() => onRemove(active.id)}>
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                </div>
              </div>

              {/* Messages */}
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-4">
                {loadingThread && messages.length === 0 ? (
                  <div className="flex items-center justify-center py-10 text-[var(--muted-foreground)]">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : (
                  messages.map((m) => <MessageBubble key={m.id} m={m} />)
                )}
              </div>

              {/* Composer */}
              <div className="border-t border-[var(--border)] pt-4">
                {banner && (
                  <p
                    className={`mb-2 text-[13px] ${
                      banner.tone === "ok" ? "text-[var(--success)]" : "text-[var(--danger)]"
                    }`}
                  >
                    {banner.text}
                  </p>
                )}
                <textarea
                  ref={composerRef}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      (e.metaKey || e.ctrlKey) &&
                      e.key === "Enter" &&
                      !e.nativeEvent.isComposing &&
                      e.keyCode !== 229
                    ) {
                      e.preventDefault();
                      void onSend();
                    }
                  }}
                  rows={4}
                  placeholder={`Ответить ${active.correspondentName || active.correspondentEmail}…`}
                  disabled={active.status === "spam"}
                  className="w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] disabled:opacity-60"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[12px] text-[var(--faint)]">
                    ⌘/Ctrl + Enter — отправить
                  </span>
                  <button
                    onClick={() => void onSend()}
                    disabled={!reply.trim() || sending || active.status === "spam"}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition-all hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Отправить
                  </button>
                </div>
              </div>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function IconBtn({
  title,
  onClick,
  danger,
  children,
}: {
  title: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-2)] transition-colors hover:bg-[var(--surface-3)] ${
        danger ? "text-[var(--danger)]" : "text-[var(--muted-foreground)]"
      }`}
    >
      {children}
    </button>
  );
}

function MessageBubble({ m }: { m: Message }) {
  const outbound = m.direction === "outbound";
  return (
    <div className={`flex ${outbound ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          outbound
            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
            : "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
        }`}
      >
        <div
          className={`mb-1 flex items-center gap-2 text-[11px] ${
            outbound ? "text-[var(--primary-foreground)]/75" : "text-[var(--faint)]"
          }`}
        >
          <span className="font-semibold">
            {outbound ? "Вы" : m.fromName || m.fromEmail}
          </span>
          <span>·</span>
          <span>{fmtTime(m.createdAt)}</span>
        </div>
        {m.html ? (
          <div
            className="mail-body text-sm leading-relaxed [word-break:break-word]"
            dangerouslySetInnerHTML={{ __html: m.html }}
          />
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed [word-break:break-word]">
            {m.text}
          </p>
        )}
        {m.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {m.attachments.map((a) => (
              <a
                key={a.url}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                  outbound
                    ? "bg-[var(--primary-foreground)]/15 text-[var(--primary-foreground)]"
                    : "bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--surface-3)]"
                }`}
              >
                <Paperclip className="h-3.5 w-3.5" />
                {a.filename}
                <span className="opacity-60">{fmtSize(a.size)}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
