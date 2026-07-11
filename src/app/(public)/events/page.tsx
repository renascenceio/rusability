import { UPCOMING_EVENTS } from "@/lib/mock/events";
import { EventCard } from "@/components/site/EventCard";

export const metadata = {
  title: "События — Rusability",
  description: "Конференции, вебинары и митапы для тех, кто создаёт цифровые продукты.",
};

export default function EventsPage() {
  const events = UPCOMING_EVENTS;

  return (
    <div className="container-editorial py-10 md:py-14">
      <header className="mb-10 max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
          Календарь индустрии
        </span>
        <h1 className="mt-2 font-serif text-4xl font-bold text-[var(--foreground)] md:text-5xl">
          События
        </h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Конференции, вебинары и митапы. Онлайн и офлайн — выбирайте формат и присоединяйтесь.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </div>
  );
}
