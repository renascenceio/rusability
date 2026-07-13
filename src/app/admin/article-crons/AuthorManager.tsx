"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2, Eye, EyeOff, FileText } from "lucide-react";
import { Panel, Tag, AdminButton } from "@/components/admin/ui";
import {
  listAuthorArticles,
  listAuthorTopics,
  setArticleStatus,
  deleteArticle,
  addAuthorTopic,
  removeAuthorTopic,
  type AuthorArticle,
  type AuthorTopic,
} from "./author-actions";

export type AuthorStat = {
  id: string;
  name: string;
  active: boolean;
  category: string;
  published: number;
  review: number;
  created: number;
  planned: number;
};

const STATUS_LABEL: Record<string, string> = {
  published: "Опубликовано",
  review: "На модерации",
  draft: "Черновик",
};
const STATUS_TONE: Record<string, "success" | "warn" | "neutral"> = {
  published: "success",
  review: "warn",
  draft: "neutral",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

export function AuthorManager({ authors }: { authors: AuthorStat[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <Panel title={`Авторы и статьи (${authors.length})`}>
      <p className="mb-4 text-xs text-[var(--muted-foreground)]">
        По каждому автору: опубликовано / на модерации / создано и запланировано тем. Разверните
        строку, чтобы редактировать список статей и очередь тем.
      </p>
      <div className="space-y-2">
        {authors.map((a) => (
          <AuthorRow
            key={a.id}
            author={a}
            open={openId === a.id}
            onToggle={() => setOpenId(openId === a.id ? null : a.id)}
          />
        ))}
      </div>
    </Panel>
  );
}

function AuthorRow({
  author,
  open,
  onToggle,
}: {
  author: AuthorStat;
  open: boolean;
  onToggle: () => void;
}) {
  const [articles, setArticles] = useState<AuthorArticle[] | null>(null);
  const [topics, setTopics] = useState<AuthorTopic[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [, startTransition] = useTransition();

  async function ensureLoaded() {
    if (articles && topics) return;
    setLoading(true);
    const [arts, tops] = await Promise.all([
      listAuthorArticles(author.id),
      listAuthorTopics(author.id),
    ]);
    setArticles(arts);
    setTopics(tops);
    setLoading(false);
  }

  function handleToggle() {
    if (!open) void ensureLoaded();
    onToggle();
  }

  async function refresh() {
    const [arts, tops] = await Promise.all([
      listAuthorArticles(author.id),
      listAuthorTopics(author.id),
    ]);
    setArticles(arts);
    setTopics(tops);
  }

  function changeStatus(id: string, status: "published" | "review") {
    startTransition(async () => {
      await setArticleStatus(id, status);
      await refresh();
    });
  }

  function removeArticle(id: string, title: string) {
    if (!confirm(`Удалить статью «${title}»?`)) return;
    startTransition(async () => {
      await deleteArticle(id);
      await refresh();
    });
  }

  function addTopic() {
    const t = newTopic.trim();
    if (!t) return;
    startTransition(async () => {
      await addAuthorTopic(author.id, t);
      setNewTopic("");
      await refresh();
    });
  }

  function removeTopic(id: number) {
    startTransition(async () => {
      await removeAuthorTopic(id);
      await refresh();
    });
  }

  return (
    <div className="rounded-xl border border-[var(--border)]">
      {/* Header row */}
      <button
        onClick={handleToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate font-semibold text-[var(--foreground)]">{author.name}</span>
          {author.active ? (
            <Tag tone="success">активен</Tag>
          ) : (
            <Tag tone="neutral">на паузе</Tag>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-4 text-xs">
          <span className="text-[var(--success)]">{author.published} опубл.</span>
          <span className="text-[var(--warn)]">{author.review} модер.</span>
          <span className="text-[var(--muted-foreground)]">{author.created} всего</span>
          <span className="text-[var(--primary)]">{author.planned} тем</span>
          {open ? (
            <ChevronUp size={16} className="text-[var(--muted-foreground)]" />
          ) : (
            <ChevronDown size={16} className="text-[var(--muted-foreground)]" />
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-[var(--border)] px-4 py-4">
          {loading && !articles ? (
            <p className="text-sm text-[var(--muted-foreground)]">Загрузка…</p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Articles */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                  <FileText size={15} /> Статьи ({articles?.length ?? 0})
                </div>
                <div className="space-y-1.5">
                  {articles && articles.length > 0 ? (
                    articles.map((art) => (
                      <div
                        key={art.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm text-[var(--foreground)]">{art.title}</div>
                          <div className="mt-0.5 flex items-center gap-2">
                            <Tag tone={STATUS_TONE[art.status] ?? "neutral"}>
                              {STATUS_LABEL[art.status] ?? art.status}
                            </Tag>
                            <span className="text-[11px] text-[var(--muted-foreground)]">
                              {fmt(art.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {art.status === "published" ? (
                            <button
                              title="Снять с публикации (на модерацию)"
                              className="rounded-md border border-[var(--border)] p-1.5 hover:bg-[var(--muted)]"
                              onClick={() => changeStatus(art.id, "review")}
                            >
                              <EyeOff size={13} />
                            </button>
                          ) : (
                            <button
                              title="Опубликовать"
                              className="rounded-md border border-[var(--border)] p-1.5 hover:bg-[var(--muted)]"
                              onClick={() => changeStatus(art.id, "published")}
                            >
                              <Eye size={13} />
                            </button>
                          )}
                          <button
                            title="Удалить"
                            className="rounded-md border border-[var(--border)] p-1.5 text-[var(--danger)] hover:bg-[var(--muted)]"
                            onClick={() => removeArticle(art.id, art.title)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[var(--muted-foreground)]">Пока нет статей.</p>
                  )}
                </div>
              </div>

              {/* Topics */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                  Очередь тем ({topics?.filter((t) => !t.used).length ?? 0} свободно)
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <input
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.nativeEvent.isComposing) addTopic();
                    }}
                    placeholder="Новая тема для статьи"
                    className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  />
                  <AdminButton disabled={!newTopic.trim()} onClick={addTopic}>
                    <Plus size={15} /> Добавить
                  </AdminButton>
                </div>
                <div className="space-y-1.5">
                  {topics && topics.length > 0 ? (
                    topics.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2"
                      >
                        <span className="min-w-0 truncate text-sm text-[var(--foreground)]">{t.topic}</span>
                        <div className="flex shrink-0 items-center gap-2">
                          {t.used ? (
                            <Tag tone="neutral">использована</Tag>
                          ) : (
                            <button
                              title="Удалить тему"
                              className="rounded-md border border-[var(--border)] p-1.5 text-[var(--danger)] hover:bg-[var(--muted)]"
                              onClick={() => removeTopic(t.id)}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Нет тем. У автора должен быть крон, чтобы добавлять темы.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
