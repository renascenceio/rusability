import "server-only";
import { db } from "@/lib/db";
import {
  authors,
  aiAuthors,
  aiRequirements,
  newsbotSources,
  contentSettings,
  articleCrons,
  articleCronTopics,
} from "@/lib/db/schema";
import { AUTHOR_ARCHETYPES } from "./author-archetypes";
import { DEFAULT_REQUIREMENTS } from "./requirements-defaults";
import { DEFAULT_NEWS_SOURCES } from "./news-sources";
import { TOPIC_BANK, cronKeywordsFor } from "./topic-bank";
import { eq, sql } from "drizzle-orm";

/**
 * Seed the 20 Russian AI author archetypes into BOTH `authors` (public byline)
 * and `ai_authors` (generation config), sharing the same id so article joins
 * keep working. Idempotent via upsert on primary key.
 */
export async function seedAiAuthors(): Promise<{ authors: number; aiAuthors: number }> {
  let authorCount = 0;
  let aiCount = 0;

  for (const a of AUTHOR_ARCHETYPES) {
    await db
      .insert(authors)
      .values({
        id: a.id,
        username: a.username,
        name: a.name,
        role: "ai",
        avatar: "",
        bio: a.bio,
        archetype: a.archetype,
        followers: 0,
        articlesCount: 0,
        elite: a.elite ?? false,
        socials: {},
      })
      .onConflictDoUpdate({
        target: authors.id,
        set: { name: a.name, bio: a.bio, archetype: a.archetype, role: "ai", username: a.username, elite: a.elite ?? false },
      });
    authorCount++;

    await db
      .insert(aiAuthors)
      .values({
        id: a.id,
        name: a.name,
        avatar: "",
        archetype: a.archetype,
        topics: a.topics,
        active: true,
        schedule: "daily",
        bio: a.bio,
        tone: a.tone,
        approach: a.approach,
        stylePrompt: a.stylePrompt,
        category: a.category,
        elite: a.elite ?? false,
      })
      .onConflictDoUpdate({
        target: aiAuthors.id,
        set: {
          name: a.name,
          archetype: a.archetype,
          topics: a.topics,
          bio: a.bio,
          tone: a.tone,
          approach: a.approach,
          stylePrompt: a.stylePrompt,
          category: a.category,
          elite: a.elite ?? false,
        },
      });
    aiCount++;
  }

  // Seed default AI Requirements (only if absent — never clobber edits).
  for (const r of DEFAULT_REQUIREMENTS) {
    await db
      .insert(aiRequirements)
      .values({ key: r.key, title: r.title, content: r.content })
      .onConflictDoNothing({ target: aiRequirements.key });
  }

  return { authors: authorCount, aiAuthors: aiCount };
}

/** Seed default Russian news sources + the single content_settings row. */
export async function seedNewsAndSettings(): Promise<{ sources: number }> {
  for (const s of DEFAULT_NEWS_SOURCES) {
    await db
      .insert(newsbotSources)
      .values({ id: s.id, name: s.name, url: s.url, active: true, category: s.category, lang: "ru" })
      .onConflictDoUpdate({ target: newsbotSources.id, set: { name: s.name, url: s.url, category: s.category } });
  }
  await db
    .insert(contentSettings)
    .values({ id: 1 })
    .onConflictDoNothing({ target: contentSettings.id });
  return { sources: DEFAULT_NEWS_SOURCES.length };
}

/**
 * Seed ONE hourly, no-approval cron per AI author, plus its curated topic bank.
 * - category follows the author's own category automatically;
 * - min_words = 2400, frequency = hourly, requires_approval = false;
 * - cron keywords come from the author's assigned topics;
 * - topics are seeded from TOPIC_BANK, but only when the cron has none yet,
 *   so re-running never resets the `used` flags of already-consumed topics.
 * Idempotent via a deterministic cron id (`cron-<authorId>`).
 * Also relaxes the global pace so 20 authors can each publish hourly.
 */
export async function seedAuthorCrons(): Promise<{ crons: number; topics: number }> {
  // Relax the global publish pace + enable article auto-publish so hourly
  // output from all authors is not throttled (news moderation is untouched).
  await db
    .insert(contentSettings)
    .values({ id: 1, minHoursBetween: 0, maxPerDay: 1000, autoPublish: true })
    .onConflictDoUpdate({
      target: contentSettings.id,
      set: { minHoursBetween: 0, maxPerDay: 1000, autoPublish: true, updatedAt: new Date() },
    });

  let cronCount = 0;
  let topicCount = 0;

  for (const a of AUTHOR_ARCHETYPES) {
    const cronId = `cron-${a.id}`;
    const keywords = cronKeywordsFor(a.id, a.topics);
    const name = `${a.name} — ежечасно`;

    await db
      .insert(articleCrons)
      .values({
        id: cronId,
        name,
        authorId: a.id,
        category: a.category,
        frequency: "hourly",
        runTime: "00:00",
        days: [],
        minWords: 2400,
        keywords,
        requiresApproval: false,
        status: "active",
      })
      .onConflictDoUpdate({
        target: articleCrons.id,
        set: {
          name,
          authorId: a.id,
          category: a.category,
          frequency: "hourly",
          minWords: 2400,
          keywords,
          requiresApproval: false,
          status: "active",
        },
      });
    cronCount++;

    // Seed topics only when this cron has none (preserve `used` bookkeeping).
    const existing = await db
      .select({ id: articleCronTopics.id })
      .from(articleCronTopics)
      .where(eq(articleCronTopics.cronId, cronId))
      .limit(1);
    if (existing.length === 0) {
      const bank = TOPIC_BANK[a.id] ?? [];
      for (const t of bank) {
        await db.insert(articleCronTopics).values({ cronId, topic: t.topic, keywords: t.keywords });
        topicCount++;
      }
    }
  }

  return { crons: cronCount, topics: topicCount };
}

/** Sync the public `authors.articles_count` from real published articles. */
export async function syncAuthorArticleCounts(): Promise<void> {
  await db.execute(sql`
    UPDATE authors a SET articles_count = (
      SELECT count(*) FROM articles ar
      WHERE ar.author_id = a.id AND ar.status = 'published'
    )
  `);
}
