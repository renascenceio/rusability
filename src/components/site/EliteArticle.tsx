"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ArticleBlock } from "@/lib/types";

type SkinKey = "classic" | "night" | "sepia" | "forest" | "blue";

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
  classic: { bg: "#FAFAF8", card: "#FFFFFF", bdr: "rgba(0,0,0,.08)", text: "#1A1612", textM: "rgba(26,22,18,.55)", textF: "rgba(26,22,18,.3)", accent: "#4D5AFF" },
  night: { bg: "#0D1117", card: "#161B22", bdr: "rgba(255,255,255,.08)", text: "#E6EDF3", textM: "rgba(230,237,243,.55)", textF: "rgba(230,237,243,.28)", accent: "#58A6FF" },
  sepia: { bg: "#F4ECD8", card: "#EDE0C4", bdr: "rgba(100,70,30,.1)", text: "#3A2A1A", textM: "rgba(58,42,26,.55)", textF: "rgba(58,42,26,.3)", accent: "#8B5E2A" },
  forest: { bg: "#1A2A1A", card: "#243424", bdr: "rgba(255,255,255,.08)", text: "#D4E8C8", textM: "rgba(212,232,200,.5)", textF: "rgba(212,232,200,.28)", accent: "#6AAA4A" },
  blue: { bg: "#0A1628", card: "#142038", bdr: "rgba(255,255,255,.08)", text: "#D8E8FF", textM: "rgba(216,232,255,.5)", textF: "rgba(216,232,255,.28)", accent: "#9AA0FF" },
};

const SWATCH: Record<SkinKey, string> = {
  classic: "#F7F5F2",
  night: "#0D1117",
  sepia: "#F4ECD8",
  forest: "#1A2A1A",
  blue: "#0A1628",
};

const SKIN_ORDER: { key: SkinKey; title: string }[] = [
  { key: "classic", title: "Классика" },
  { key: "night", title: "Ночь" },
  { key: "sepia", title: "Сепия" },
  { key: "forest", title: "Лес" },
  { key: "blue", title: "Синева" },
];

export type EliteRelated = {
  slug: string;
  title: string;
  cover: string;
  readingMinutes: number;
  claps: number;
};

export type EliteArticleData = {
  title: string;
  excerpt: string;
  cover: string;
  categoryLabel: string;
  publishedLabel: string;
  readingMinutes: number;
  claps: number;
  body: ArticleBlock[];
  author: { name: string; avatar: string; role: string; articlesCount: number };
  related: EliteRelated[];
};

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".0", "")}K`;
  return String(n);
}

export function EliteArticle({ data }: { data: EliteArticleData }) {
  const [skin, setSkin] = useState<SkinKey>("classic");
  const s = SKINS[skin];

  return (
    <div style={{ background: s.bg, minHeight: "100vh", transition: "background .3s ease" }}>
      {/* Skin toolbar */}
      <div
        style={{
          position: "fixed",
          right: 20,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          background: s.card,
          border: `1px solid ${s.bdr}`,
          borderRadius: 20,
          padding: "10px 8px",
          boxShadow: "0 8px 32px rgba(0,0,0,.18)",
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: s.textM,
            textAlign: "center",
            marginBottom: 4,
          }}
        >
          Скин
        </div>
        {SKIN_ORDER.map(({ key, title }) => {
          const active = skin === key;
          return (
            <button
              key={key}
              onClick={() => setSkin(key)}
              title={title}
              aria-label={title}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: SWATCH[key],
                cursor: "pointer",
                border: active ? "2px solid #4D5AFF" : "2px solid transparent",
                boxShadow: active ? "0 0 0 2px rgba(77,90,255,.3)" : "none",
              }}
            />
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

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
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
            ✦ Elite
          </span>
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
            <div style={{ marginTop: 2 }}>
              {data.readingMinutes} мин · {fmt(data.claps)} реакций
            </div>
          </div>
          <button
            style={{
              background: s.accent,
              border: "none",
              borderRadius: 22,
              padding: "9px 20px",
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            Подписаться
          </button>
        </div>

        {/* Hero image */}
        <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 48, boxShadow: "0 24px 64px rgba(0,0,0,.18)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.cover || "/placeholder.svg"}
            alt=""
            style={{ width: "100%", height: "clamp(280px,40vw,540px)", objectFit: "cover", display: "block" }}
          />
        </div>
      </div>

      {/* Body: narrow column */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px 80px" }}>
        {data.body.map((block, i) => (
          <EliteBlock key={i} block={block} skin={s} first={i === 0} />
        ))}

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
                      {r.readingMinutes} мин · {fmt(r.claps)} ♥
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
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
            {block.text}
          </p>
          {block.cite && (
            <cite style={{ display: "block", marginTop: 8, fontSize: 14, fontStyle: "normal", color: skin.textM }}>
              — {block.cite}
            </cite>
          )}
        </blockquote>
      );
    case "list":
      return (
        <ul style={{ margin: "20px 0", padding: 0, listStyle: "none" }}>
          {block.items.map((item, j) => (
            <li key={j} style={{ display: "flex", gap: 12, color: skin.text, lineHeight: 1.8, marginBottom: 8 }}>
              <span style={{ marginTop: 12, width: 6, height: 6, flexShrink: 0, borderRadius: "50%", background: skin.accent }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
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
            {rest}
          </p>
        );
      }
      return <p style={base}>{block.text}</p>;
  }
}
