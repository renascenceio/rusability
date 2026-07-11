import "server-only";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { asc, eq, gte } from "drizzle-orm";
import type { EventItem } from "@/lib/types";

type Row = typeof events.$inferSelect;

function toISO(v: Date | string | null | undefined): string {
  if (!v) return "";
  return typeof v === "string" ? v : v.toISOString();
}

export function mapEvent(r: Row): EventItem {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    cover: r.cover,
    city: r.city,
    venue: r.venue,
    format: r.format as EventItem["format"],
    category: r.category,
    date: toISO(r.date),
    dateLabel: r.dateLabel,
    price: r.price,
    attendees: r.attendees,
  };
}

export async function allEvents(): Promise<EventItem[]> {
  const rows = await db.select().from(events).orderBy(asc(events.date));
  return rows.map(mapEvent);
}

export async function getEvent(id: string): Promise<EventItem | undefined> {
  const rows = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return rows[0] ? mapEvent(rows[0]) : undefined;
}

export async function upcomingEvents(limit?: number): Promise<EventItem[]> {
  const q = db
    .select()
    .from(events)
    .where(gte(events.date, new Date()))
    .orderBy(asc(events.date));
  const rows = limit ? await q.limit(limit) : await q;
  return rows.map(mapEvent);
}
