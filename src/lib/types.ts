/*
  Shared domain types for Rusability.
  These mirror the intended Neon/Postgres schema so the mock layer in
  src/lib/mock/* can be swapped for real DB queries in phase 2 with
  minimal churn. Field names use camelCase in TS; DB columns will be snake_case.
*/

export type CategorySlug =
  | "design"
  | "marketing"
  | "pr"
  | "seo"
  | "analytics"
  | "ux"
  | "business"
  | "smm"
  | "media"
  | "ai"
  | "tech"
  | "ecommerce"
  | "science"
  | "behavioral"
  | "cx"
  | "startups";

export interface Category {
  slug: CategorySlug;
  name: string;
  /** short label used in chips */
  short: string;
  /** semantic accent token name */
  accent: "primary" | "accent" | "success" | "gold";
}

export type AuthorRole = "author" | "elite" | "ai" | "editor" | "admin";

export interface Author {
  id: string;
  username: string;
  name: string;
  role: AuthorRole;
  avatar: string;
  bio: string;
  /** AI archetype, only for role === "ai" */
  archetype?: string;
  location?: string;
  followers: number;
  articlesCount: number;
  /** verified / elite badge */
  elite: boolean;
  joinedAt: string;
  socials?: { telegram?: string; site?: string };
}

export type ArticleStatus =
  | "published"
  | "draft"
  | "review"
  | "scheduled"
  | "quarantine";

export type ArticleTier = "standard" | "elite";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** HTML-ish body split into blocks for the mock renderer */
  body: ArticleBlock[];
  cover: string;
  category: CategorySlug;
  tags: string[];
  authorId: string;
  tier: ArticleTier;
  status: ArticleStatus;
  readingMinutes: number;
  views: number;
  claps: number;
  comments: number;
  publishedAt: string;
  /** GEO score for elite articles */
  geoScore?: number;
  featured?: boolean;
  /** Optionally embedded author (populated by data-layer joins) so shared /
   *  client card components can render bylines without a DB lookup. */
  author?: Author;
}

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "list"; items: string[] }
  | { type: "image"; src: string; caption?: string };

export type NewsCategory = "tech" | "marketing" | "business" | "science";

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  category: NewsCategory;
  source: string;
  sourceUrl?: string;
  tags: string[];
  publishedAt: string;
  /** relative time label like "2 часа назад" */
  timeLabel: string;
  views: number;
  /** admin pipeline status */
  pipeline?: "queued" | "rewriting" | "review" | "published" | "rejected";
  hot?: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  cover: string;
  city: string;
  venue: string;
  format: "offline" | "online" | "hybrid";
  category: string;
  date: string;
  dateLabel: string;
  price: string;
  attendees: number;
}

export interface AppTool {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  category: string;
  pricing: "free" | "freemium" | "paid";
  rating: number;
  users: string;
  featured?: boolean;
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timeLabel: string;
  likes: number;
  replies?: Comment[];
}

/* ---- Admin / analytics mock shapes ---- */

export interface MetricPoint {
  label: string;
  value: number;
}

export interface KpiStat {
  label: string;
  value: string;
  delta: number;
  spark: number[];
}

export interface AiAuthorConfig {
  id: string;
  name: string;
  avatar: string;
  archetype: string;
  topics: string[];
  active: boolean;
  schedule: "hourly" | "daily" | "weekly";
  published: number;
  lastRun: string;
}

export interface CronJob {
  id: string;
  name: string;
  authorId: string;
  topics: string[];
  schedule: string;
  volume: number;
  status: "running" | "paused" | "queued";
  nextRun: string;
}

export interface NewsletterCampaign {
  id: string;
  name: string;
  subject: string;
  audience: string;
  recipients: number;
  status: "sent" | "scheduled" | "draft" | "sending";
  openRate: number;
  clickRate: number;
  sentAt?: string;
}

export interface AdSlot {
  id: string;
  name: string;
  placement: string;
  format: string;
  status: "active" | "paused" | "empty";
  impressions: number;
  clicks: number;
  ctr: number;
  advertiser?: string;
}

export interface Connection {
  id: string;
  platform: string;
  handle: string;
  connected: boolean;
  autopost: boolean;
  followers: string;
  lastSync?: string;
}
