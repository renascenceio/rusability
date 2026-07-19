"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import type { ArticleBlock, FaqItem, Comment } from "@/lib/types";
import { normalizeList } from "@/lib/article-list";
import { ArticleEngagement } from "./ArticleEngagement";

type SkinKey = "sepia" | "night";

type Skin = {
  bg: string;
  card: string;
  bdr: string;
  text: string;
  textM: string;
  textF: string;
  accent: string;
};

const SKINS: Record<SkinKey, Skin> = {
  sepia: { bg: "#F2E7CF", card: "#E8D8B8", bdr: "rgba(86,57,25,.16)", text: "#332418", textM: "rgba(51,36,24,.62)", textF: "rgba(51,36,24,.34)", accent: "#945B24" },
  night: { bg: "#0D0E10", card: "#17181B", bdr: "rgba(245,239,225,.12)", text: "#F2EDE3", textM: "rgba(242,237,227,.62)", textF: "rgba(242,237,227,.32)", accent: "#D9A34A" },
};

export type EliteRelated = {
  slug: string;
  title: string;
  cover: string;
  readingMinutes: number;
  claps: number;
};

export type EliteArticleData = {
  contentId: string;
  title: string;
  excerpt: string;
  cover: string;
  categoryLabel: string;
  publishedLabel: string;
  readingMinutes: number;
  claps: number;
  comments: Comment[];
  body: ArticleBlock[];
  faq: FaqItem[];
  scores: { geo?: number; seo?: number; aeo?: number };
  author: {
    id?: string;
    name: string;
    avatar: string;
    role: string;
    articlesCount: number;
    subscribed?: boolean;
    authed?: boolean;
  };
  related: EliteRelated[];
};

/** Convert **bold** markdown into <strong>; leaves plain text otherwise. */
function inline(text: string) {
  if (!text.includes("**")) return text;
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    const m = part.match(/^\*\*([^*]+)\*\*$/);
    return m ? <strong key={i} style={{ fontWeight: 700 }}>{m[1]}</strong> : part;
  });
}

export function EliteArticle({ data }: { data: EliteArticleData }) {
  const [skin, setSkin] = useState<SkinKey>("sepia");
  const s = SKINS[skin];

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.eliteTheme = skin;
    return () => {
      delete root.dataset.eliteTheme;
    };
  }, [skin]);

  // Make the shared like/comment/share bar adopt the active skin.
  const engagementTheme = {
    border: s.bdr,
    surface: s.card,
    surface2: s.card,
    surface3: s.card,
    background: s.bg,
    foreground: s.text,
    muted: s.textM,
    accent: s.accent,
  };

  return (
    <div style={{ background: s.bg, minHeight: "100vh", transition: "background .3s ease" }}>
      {/* Elite reading mode */}
      <div
        className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 rounded-full border p-1 shadow-2xl md:bottom-auto md:left-auto md:right-6 md:top-24 md:translate-x-0"
        style={{ background: s.card, borderColor: s.bdr }}
        role="group"
        aria-label="Режим чтения"
      >
        {([
          ["sepia", "Сепия", Sun],
          ["night", "Ночь", Moon],
        ] as const).map(([key, title, Icon]) => {
          const active = skin === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSkin(key)}
              aria-pressed={active}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold transition-colors"
              style={{
                background: active ? s.text : "transparent",
                color: active ? s.bg : s.textM,
              }}
            >
              <Icon className="size-4" />
              {title}
            </button>
          );
        })}
      </div>

      {/* Head */}
      <div style={{ padding: "40px 48px 0", maxWidth: 1080, margin: "0 auto" }}>
        <Link
          href="/articles"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: s.textM,
            textDecoration: "none",
            marginBottom: 28,
          }}
        >
          <ArrowLeft size={14} /> Статьи
        </Link>

        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: s.accent,
              borderBottom: `1px solid ${s.accent}`,
              paddingBottom: 2,
            }}
          >
            {data.categoryLabel} · Редакционное
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#1A1612",
              background: "linear-gradient(135deg,#FFD700,#FFA500)",
              padding: "4px 12px",
              borderRadius: 20,
              boxShadow: "0 2px 8px rgba(255,165,0,.35)",
            }}
          >
            Elite
          </span>

          {/* AEO / SEO / GEO scores — Elite-only */}
          <div style={{ marginLeft: "auto", display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 8 }}>
            {([
              ["AEO", data.scores.aeo],
              ["SEO", data.scores.seo],
              ["GEO", data.scores.geo],
            ] as const)
              .filter(([, v]) => typeof v === "number")
              .map(([label, v]) => (
                <span
                  key={label}
                  title={`${label}-оценка: ${v}/100`}
                  style={{
                    display: "inline-flex",
                    alignItems: "baseline",
                    gap: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    color: s.textM,
                    border: `1px solid ${s.bdr}`,
                    borderRadius: 20,
                    padding: "4px 10px",
                  }}
                >
                  <span style={{ fontSize: 9, letterSpacing: "0.1em", color: s.textF }}>{label}</span>
                  <span style={{ color: s.accent, fontWeight: 700 }}>{v}</span>
                </span>
              ))}
          </div>
        </div>

        <h1
          className="font-serif"
          style={{
            fontSize: "clamp(32px,5vw,64px)",
            fontWeight: 700,
            color: s.text,
            lineHeight: 1.08,
            margin: "0 0 20px",
            letterSpacing: "-0.015em",
            maxWidth: 820,
            textWrap: "pretty",
          }}
        >
          {data.title}
        </h1>

        <p
          style={{
            fontSize: "clamp(16px,2vw,20px)",
            lineHeight: 1.6,
            color: s.textM,
            margin: "0 0 32px",
            maxWidth: 680,
            fontStyle: "italic",
          }}
        >
          {data.excerpt}
        </p>

        {/* Author row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "18px 0",
            borderTop: `1px solid ${s.bdr}`,
            borderBottom: `1px solid ${s.bdr}`,
            marginBottom: 36,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.author.avatar || "/placeholder.svg"}
            alt={data.author.name}
            style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: `2px solid ${s.accent}`, flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: s.text, marginBottom: 2 }}>
              {data.author.name}
            </div>
            <div style={{ fontSize: 12, color: s.textM }}>
              {data.author.role} · {data.author.articlesCount} статьи
            </div>
          </div>
          <div style={{ fontSize: 12, color: s.textM, textAlign: "right" }}>
            <div>{data.publishedLabel}</div>
            <div style={{ marginTop: 2 }}>{data.readingMinutes} мин</div>
          </div>
        </div>

        {/* Hero image */}
        <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 48, boxShadow: "0 24px 64px rgba(0,0,0,.18)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.cover || "/placeholder.svg"}
            alt={data.title}
            style={{ width: "100%", height: "clamp(280px,40vw,540px)", objectFit: "cover", display: "block" }}
          />
        </div>
      </div>

      {/* Body: narrow column */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px 80px" }}>
        <ArticleEngagement
          kind="article"
          contentId={data.contentId}
          title={data.title}
          initialLikes={data.claps}
          comments={data.comments}
          theme={engagementTheme}
        >
        {data.body.map((block, i) => (
          <EliteBlock key={i} block={block} skin={s} first={i === 0} />
        ))}

        {/* FAQ — Elite-only, AEO/GEO */}
        {data.faq.length > 0 && (
          <section style={{ margin: "52px 0 8px" }} aria-labelledby="faq-heading">
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: s.accent,
                marginBottom: 6,
              }}
            >
              Вопросы и ответы
            </div>
            <h2
              id="faq-heading"
              className="font-serif"
              style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 700, color: s.text, margin: "0 0 20px", lineHeight: 1.2 }}
            >
              Часто задаваемые вопросы
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {data.faq.map((f, i) => (
                <details
                  key={i}
                  style={{ background: s.card, border: `1px solid ${s.bdr}`, borderRadius: 16, padding: "16px 20px" }}
                >
                  <summary
                    style={{ fontSize: 16, fontWeight: 600, color: s.text, cursor: "pointer", listStyle: "none" }}
                  >
                    {f.q}
                  </summary>
                  <p style={{ margin: "12px 0 0", fontSize: 15, lineHeight: 1.7, color: s.textM }}>{f.a}</p>
                </details>
              ))}
            </div>
            {/* Structured data for answer engines */}
            <script
              type="application/ld+json"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: data.faq.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: { "@type": "Answer", text: f.a },
                  })),
                }),
              }}
            />
          </section>
        )}

        {/* Inline related — breaks out */}
        {data.related.length > 0 && (
          <div style={{ margin: "44px 0" }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: s.accent,
                marginBottom: 18,
              }}
            >
              Ещё от {data.author.name}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {data.related.slice(0, 3).map((r) => (
                <Link
                  key={r.slug}
                  href={`/articles/${r.slug}`}
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 16,
                    overflow: "hidden",
                    background: s.card,
                    border: `1px solid ${s.bdr}`,
                  }}
                >
                  <div style={{ position: "relative", height: 140, overflow: "hidden" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.cover || "/placeholder.svg"} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: s.text, lineHeight: 1.35, marginBottom: 6 }}>
                      {r.title}
                    </div>
                    <div style={{ fontSize: 11, color: s.textM }}>
                      {r.readingMinutes} мин
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        </ArticleEngagement>
      </div>
    </div>
  );
}

function EliteBlock({ block, skin, first }: { block: ArticleBlock; skin: Skin; first: boolean }) {
  const base = { fontSize: 18, lineHeight: 1.85, color: skin.text, margin: "0 0 24px" } as const;

  switch (block.type) {
    case "h2":
      return (
        <h2
          className="font-serif"
          style={{ fontSize: "clamp(22px,3vw,34px)", fontWeight: 700, color: skin.text, margin: "44px 0 16px", lineHeight: 1.2 }}
        >
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 className="font-serif" style={{ fontSize: "clamp(19px,2.4vw,26px)", fontWeight: 700, color: skin.text, margin: "32px 0 12px" }}>
          {block.text}
        </h3>
      );
    case "quote":
      return (
        <blockquote style={{ margin: "36px 0", borderLeft: `3px solid ${skin.accent}`, paddingLeft: 22 }}>
          <p className="font-serif" style={{ fontSize: 22, fontStyle: "italic", lineHeight: 1.5, color: skin.text, margin: 0 }}>
            {inline(block.text)}
          </p>
          {block.cite && (
            <cite style={{ display: "block", marginTop: 8, fontSize: 14, fontStyle: "normal", color: skin.textM }}>
              — {block.cite}
            </cite>
          )}
        </blockquote>
      );
    case "list": {
      const { ordered, items } = normalizeList(block.items, block.ordered);
      return (
        <ol
          style={{
            margin: "20px 0",
            padding: 0,
            listStyle: "none",
            counterReset: ordered ? "elite-li" : undefined,
          }}
        >
          {items.map((item, j) => (
            <li key={j} style={{ display: "flex", gap: 12, color: skin.text, lineHeight: 1.8, marginBottom: 8 }}>
              {ordered ? (
                <span
                  style={{
                    flexShrink: 0,
                    minWidth: 22,
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                    color: skin.accent,
                  }}
                >
                  {j + 1}.
                </span>
              ) : (
                <span style={{ marginTop: 12, width: 6, height: 6, flexShrink: 0, borderRadius: "50%", background: skin.accent }} />
              )}
              <span>{inline(item)}</span>
            </li>
          ))}
        </ol>
      );
    }
    case "image":
      return (
        <figure style={{ margin: "36px 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.src || "/placeholder.svg"} alt={block.caption ?? ""} style={{ width: "100%", borderRadius: 16, display: "block" }} />
          {block.caption && (
            <figcaption style={{ marginTop: 8, textAlign: "center", fontSize: 13, color: skin.textM }}>
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    default:
      if (first && block.text) {
        const firstLetter = block.text.charAt(0);
        const rest = block.text.slice(1);
        return (
          <p style={base}>
            <span
              className="font-serif"
              style={{ float: "left", fontSize: 60, fontWeight: 700, lineHeight: 0.8, margin: "6px 8px 0 0", color: skin.accent }}
            >
              {firstLetter}
            </span>
            {inline(rest)}
          </p>
        );
      }
      return <p style={base}>{inline(block.text)}</p>;
  }
}
