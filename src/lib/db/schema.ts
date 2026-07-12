import {
  pgTable,
  text,
  boolean,
  integer,
  timestamp,
  numeric,
  jsonb,
  serial,
  unique,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Better Auth tables — public schema.                                 */
/* Column names are camelCase to match Better Auth defaults. Do not    */
/* rename them. `role`/`banned` power the app's role gating.           */
/* ------------------------------------------------------------------ */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("banReason"),
  banExpires: timestamp("banExpires", { withTimezone: true }),
  /* РКН compliance: number of times the user published (or attempted to
     publish) material on a Roskomnadzor-banned topic. At 3+ strikes the
     account is automatically banned. Admins can also ban manually. */
  rknStrikes: integer("rkn_strikes").notNull().default(0),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonatedBy"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Content tables — public schema.                                     */
/* ------------------------------------------------------------------ */
export const categories = pgTable("categories", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  short: text("short").notNull(),
  accent: text("accent").notNull().default("primary"),
  sort: integer("sort").notNull().default(0),
});

export const authors = pgTable("authors", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("author"),
  avatar: text("avatar").notNull().default(""),
  bio: text("bio").notNull().default(""),
  archetype: text("archetype"),
  location: text("location"),
  followers: integer("followers").notNull().default(0),
  articlesCount: integer("articles_count").notNull().default(0),
  elite: boolean("elite").notNull().default(false),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  socials: jsonb("socials").notNull().default({}),
  userId: text("user_id"),
  /* Monthly AI credits (1 credit = 1 generated article OR 1 image).
     Regular users get a fixed monthly allowance; Elite authors & admins are
     unlimited. `aiCreditsMonth` is the YYYY-MM the counter belongs to so the
     usage resets automatically at the start of each month. */
  aiCreditsUsed: integer("ai_credits_used").notNull().default(0),
  aiCreditsMonth: text("ai_credits_month").notNull().default(""),
});

/** Reader → author follows. One row per (user, author). */
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => authors.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniqUserAuthor: unique("subscriptions_user_author_uq").on(t.userId, t.authorId),
  }),
);

export const articles = pgTable("articles", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  body: jsonb("body").notNull().default([]),
  cover: text("cover").notNull().default(""),
  category: text("category").notNull(),
  tags: text("tags").array().notNull().default([]),
  authorId: text("author_id").notNull(),
  tier: text("tier").notNull().default("standard"),
  status: text("status").notNull().default("draft"),
  readingMinutes: integer("reading_minutes").notNull().default(1),
  views: integer("views").notNull().default(0),
  claps: integer("claps").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  geoScore: integer("geo_score"),
  /* AEO/SEO self-assessments — shown on Elite articles only. */
  seoScore: integer("seo_score"),
  aeoScore: integer("aeo_score"),
  /* Q&A block appended to Elite articles (AEO/GEO). [{q,a}] */
  faq: jsonb("faq").notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  /* AI generation provenance + moderation buffer. */
  cronId: text("cron_id"),
  bufferReason: text("buffer_reason"),
  aiGenerated: boolean("ai_generated").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const news = pgTable("news", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").array().notNull().default([]),
  category: text("category").notNull(),
  source: text("source").notNull().default(""),
  sourceUrl: text("source_url"),
  tags: text("tags").array().notNull().default([]),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  timeLabel: text("time_label").notNull().default(""),
  views: integer("views").notNull().default(0),
  pipeline: text("pipeline"),
  hot: boolean("hot").notNull().default(false),
  /* Aggregator provenance + dedupe. originalUrl is unique to prevent re-ingest. */
  originalUrl: text("original_url"),
  originalTitle: text("original_title"),
  sourceId: text("source_id"),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }),
});

export const events = pgTable("events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  cover: text("cover").notNull().default(""),
  city: text("city").notNull().default(""),
  venue: text("venue").notNull().default(""),
  format: text("format").notNull().default("offline"),
  category: text("category").notNull().default(""),
  date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
  dateLabel: text("date_label").notNull().default(""),
  price: text("price").notNull().default(""),
  attendees: integer("attendees").notNull().default(0),
});

export const apps = pgTable("apps", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull().default(""),
  description: text("description").notNull().default(""),
  icon: text("icon").notNull().default(""),
  category: text("category").notNull().default(""),
  pricing: text("pricing").notNull().default("free"),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("0"),
  users: text("users").notNull().default(""),
  featured: boolean("featured").notNull().default(false),
});

export const comments = pgTable("comments", {
  id: text("id").primaryKey(),
  articleId: text("article_id"),
  authorName: text("author_name").notNull(),
  authorAvatar: text("author_avatar").notNull().default(""),
  text: text("text").notNull(),
  timeLabel: text("time_label").notNull().default(""),
  likes: integer("likes").notNull().default(0),
  parentId: text("parent_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const aiAuthors = pgTable("ai_authors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  avatar: text("avatar").notNull().default(""),
  archetype: text("archetype").notNull().default(""),
  topics: text("topics").array().notNull().default([]),
  active: boolean("active").notNull().default(true),
  schedule: text("schedule").notNull().default("daily"),
  published: integer("published").notNull().default(0),
  lastRun: timestamp("last_run", { withTimezone: true }),
  /* Distinctive voice + method (Russian). Powers generation. */
  bio: text("bio").notNull().default(""),
  tone: text("tone").notNull().default(""),
  approach: text("approach").notNull().default(""),
  stylePrompt: text("style_prompt").notNull().default(""),
  category: text("category").notNull().default("business"),
  /* Elite authors get the rich layout + FAQ + AEO/SEO/GEO scores. */
  elite: boolean("elite").notNull().default(false),
});

export const cronJobs = pgTable("cron_jobs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  authorId: text("author_id"),
  topics: text("topics").array().notNull().default([]),
  schedule: text("schedule").notNull().default(""),
  volume: integer("volume").notNull().default(0),
  status: text("status").notNull().default("paused"),
  nextRun: timestamp("next_run", { withTimezone: true }),
});

export const newsletterCampaigns = pgTable("newsletter_campaigns", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull().default(""),
  audience: text("audience").notNull().default(""),
  recipients: integer("recipients").notNull().default(0),
  status: text("status").notNull().default("draft"),
  openRate: numeric("open_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  clickRate: numeric("click_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
});

export const adSlots = pgTable("ad_slots", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  placement: text("placement").notNull().default(""),
  format: text("format").notNull().default(""),
  status: text("status").notNull().default("empty"),
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  ctr: numeric("ctr", { precision: 5, scale: 2 }).notNull().default("0"),
  advertiser: text("advertiser"),
});

export const connections = pgTable("connections", {
  id: text("id").primaryKey(),
  platform: text("platform").notNull(),
  handle: text("handle").notNull().default(""),
  connected: boolean("connected").notNull().default(false),
  autopost: boolean("autopost").notNull().default(false),
  followers: text("followers").notNull().default(""),
  lastSync: timestamp("last_sync", { withTimezone: true }),
});

export const blockedTopics = pgTable("blocked_topics", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull().unique(),
});

export const newsbotSources = pgTable("newsbot_sources", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull().default(""),
  active: boolean("active").notNull().default(true),
  category: text("category"),
  lang: text("lang").notNull().default("ru"),
  lastFetchedAt: timestamp("last_fetched_at", { withTimezone: true }),
  itemsIngested: integer("items_ingested").notNull().default(0),
});

/* ------------------------------------------------------------------ */
/* Content automation engine — pace, requirements, crons, aggregator.  */
/* ------------------------------------------------------------------ */

/** Single-row (id=1) global publishing pace + engine config. */
export const contentSettings = pgTable("content_settings", {
  id: integer("id").primaryKey().default(1),
  minHoursBetween: integer("min_hours_between").notNull().default(6),
  maxPerDay: integer("max_per_day").notNull().default(8),
  autoPublish: boolean("auto_publish").notNull().default(false),
  newsAutoPublish: boolean("news_auto_publish").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Editable governance rules injected into every AI job. keyed by area. */
export const aiRequirements = pgTable("ai_requirements", {
  key: text("key").primaryKey(), // 'global' | 'articles' | 'news'
  title: text("title").notNull().default(""),
  content: text("content").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const articleCrons = pgTable("article_crons", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  authorId: text("author_id"), // null = rotate through active AI authors
  category: text("category").notNull().default("business"),
  frequency: text("frequency").notNull().default("daily"), // hourly|daily|weekly
  runTime: text("run_time").notNull().default("09:00"), // HH:MM (Moscow)
  days: text("days").array().notNull().default([]), // weekday tokens for weekly
  minWords: integer("min_words").notNull().default(900),
  tone: text("tone").notNull().default(""),
  keywords: text("keywords").array().notNull().default([]),
  imageBrief: text("image_brief").notNull().default(""),
  requiresApproval: boolean("requires_approval").notNull().default(true),
  status: text("status").notNull().default("active"), // active|paused
  lastRunAt: timestamp("last_run_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const articleCronTopics = pgTable("article_cron_topics", {
  id: serial("id").primaryKey(),
  cronId: text("cron_id").notNull(),
  topic: text("topic").notNull(),
  keywords: text("keywords").array().notNull().default([]),
  used: boolean("used").notNull().default(false),
  usedAt: timestamp("used_at", { withTimezone: true }),
});

export const articleCronRuns = pgTable("article_cron_runs", {
  id: serial("id").primaryKey(),
  cronId: text("cron_id").notNull(),
  status: text("status").notNull().default("ok"), // ok|error|skipped
  articlesCreated: integer("articles_created").notNull().default(0),
  message: text("message").notNull().default(""),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
});

export const newsbotRuns = pgTable("newsbot_runs", {
  id: serial("id").primaryKey(),
  status: text("status").notNull().default("ok"),
  fetched: integer("fetched").notNull().default(0),
  created: integer("created").notNull().default(0),
  message: text("message").notNull().default(""),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
});
