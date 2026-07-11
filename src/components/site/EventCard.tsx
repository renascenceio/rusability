import { MapPin, Calendar, Users } from "lucide-react";
import type { EventItem } from "@/lib/types";
import { Badge, formatCount } from "@/components/ui/kit";

const FORMAT_LABEL: Record<EventItem["format"], string> = {
  offline: "Офлайн",
  online: "Онлайн",
  hybrid: "Гибрид",
};

export function EventCard({ event }: { event: EventItem }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface-3)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.cover || "/placeholder.svg"}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <Badge tone="primary">{FORMAT_LABEL[event.format]}</Badge>
        </div>
        <div className="absolute right-3 top-3">
          <Badge tone="neutral" className="bg-[var(--surface)]/90">
            {event.price}
          </Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 text-xs font-semibold text-[var(--accent)]">{event.category}</div>
        <h3 className="font-serif text-lg font-bold leading-snug text-[var(--foreground)] text-balance">
          {event.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
          {event.description}
        </p>
        <div className="mt-auto space-y-2 pt-4 text-sm text-[var(--muted-foreground)]">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-[var(--accent)]" /> {event.dateLabel}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-[var(--accent)]" /> {event.city}, {event.venue}
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0 text-[var(--accent)]" /> {formatCount(event.attendees)}{" "}
            участников
          </div>
        </div>
      </div>
    </article>
  );
}
