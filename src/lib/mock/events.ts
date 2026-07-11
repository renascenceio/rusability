import type { EventItem } from "@/lib/types";

export const EVENTS: EventItem[] = [
  {
    id: "ev-1",
    title: "Design Weekend 2026",
    description:
      "Двухдневная конференция о продуктовом дизайне, дизайн-системах и ИИ в творческом процессе. Спикеры из ведущих продуктовых команд.",
    cover: "/images/events/event-1.png",
    city: "Москва",
    venue: "Хлебозавод №9",
    format: "offline",
    category: "Дизайн",
    date: "2026-09-12",
    dateLabel: "12–13 сентября",
    price: "от 4 900 ₽",
    attendees: 640,
  },
  {
    id: "ev-2",
    title: "Growth Meetup: каналы, которые работают",
    description:
      "Камерный митап для маркетологов и фаундеров. Разбор реальных кейсов роста, нетворкинг и живые вопросы спикерам.",
    cover: "/images/events/event-2.png",
    city: "Санкт-Петербург",
    venue: "Space 1",
    format: "offline",
    category: "Маркетинг",
    date: "2026-08-05",
    dateLabel: "5 августа",
    price: "бесплатно",
    attendees: 120,
  },
  {
    id: "ev-3",
    title: "UX Research Online Intensive",
    description:
      "Онлайн-интенсив по быстрым исследованиям: методы, шаблоны и практика. Три вечера с домашними заданиями и обратной связью.",
    cover: "/images/events/event-3.png",
    city: "Онлайн",
    venue: "Zoom",
    format: "online",
    category: "UX",
    date: "2026-07-28",
    dateLabel: "28–30 июля",
    price: "от 2 500 ₽",
    attendees: 310,
  },
  {
    id: "ev-4",
    title: "AI in Media Summit",
    description:
      "Отраслевой саммит о применении ИИ в медиа и редакциях: автоматизация, этика, монетизация и будущее профессии.",
    cover: "/images/covers/ai-1.png",
    city: "Дубай",
    venue: "Museum of the Future",
    format: "hybrid",
    category: "ИИ",
    date: "2026-10-03",
    dateLabel: "3 октября",
    price: "от $120",
    attendees: 890,
  },
];

export function getEvent(id: string): EventItem | undefined {
  return EVENTS.find((e) => e.id === id);
}

/** Sorted soonest-first */
export const UPCOMING_EVENTS: EventItem[] = [...EVENTS].sort(
  (a, b) => +new Date(a.date) - +new Date(b.date),
);
