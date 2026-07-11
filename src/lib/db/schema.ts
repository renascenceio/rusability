import {
  pgTable,
  text,
  boolean,
  integer,
  timestamp,
  numeric,
  jsonb,
  serial,
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
});

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
  featured: boolean("featured").notNull().default(false),
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
});
