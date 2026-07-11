/** Admin-only mock data: AI authors, moderation queue, newsbot sources, SEO scores. */

export interface AiAuthor {
  id: string;
  name: string;
  archetype: string;
  topics: string;
  cadence: string;
  lastPublished: string;
  articlesTotal: number;
  seo: number;
  aeo: number;
  accuracy: number;
  status: "active" | "paused";
  accent: string;
}

export const AI_AUTHORS: AiAuthor[] = [
  {
    id: "analyst",
    name: "Аналитик",
    archetype: "Данные, исследования, тренды",
    topics: "Аналитика, данные",
    cadence: "Каждые 4 ч",
    lastPublished: "Сегодня, 11:30",
    articlesTotal: 342,
    seo: 89,
    aeo: 72,
    accuracy: 94,
    status: "active",
    accent: "#4d5aff",
  },
  {
    id: "narrator",
    name: "Нарратор",
    archetype: "Дизайн, UX, продукт, истории",
    topics: "Дизайн, UX",
    cadence: "2 раза в день",
    lastPublished: "Вчера, 17:00",
    articlesTotal: 218,
    seo: 91,
    aeo: 80,
    accuracy: 92,
    status: "active",
    accent: "#c4523b",
  },
  {
    id: "provocateur",
    name: "Провокатор",
    archetype: "Маркетинг, бизнес, острые темы",
    topics: "Маркетинг, бизнес",
    cadence: "1 раз в день",
    lastPublished: "10.07, 12:00",
    articlesTotal: 176,
    seo: 84,
    aeo: 76,
    accuracy: 88,
    status: "active",
    accent: "#e8a85a",
  },
  {
    id: "practitioner",
    name: "Практик",
    archetype: "Инструкции, гайды, кейсы, SEO",
    topics: "SEO, гайды",
    cadence: "3 раза в день",
    lastPublished: "Сегодня, 08:00",
    articlesTotal: 401,
    seo: 93,
    aeo: 74,
    accuracy: 90,
    status: "active",
    accent: "#6aaa4a",
  },
  {
    id: "visionary",
    name: "Визионер",
    archetype: "Будущее технологий, прогнозы, тренды",
    topics: "Технологии, ИИ",
    cadence: "2 раза в неделю",
    lastPublished: "08.07, 09:00",
    articlesTotal: 97,
    seo: 86,
    aeo: 81,
    accuracy: 85,
    status: "paused",
    accent: "#7a5ad4",
  },
];

export interface ModerationItem {
  id: string;
  title: string;
  reason: string;
  author: string;
  confidence: number;
}

export const BLOCKED_TOPICS = [
  "Политическая агитация",
  "ЛГБТ-пропаганда",
  "Дискредитация армии",
  "Экстремистские материалы",
  "Медиаданные писателя",
];

export const MODERATION_QUEUE: ModerationItem[] = [
  {
    id: "m1",
    title: "Политическая ситуация в регионе…",
    reason: "Тема: политическая повестка",
    author: "Аналитик ИИ",
    confidence: 94,
  },
  {
    id: "m2",
    title: "Альтернативный взгляд на события…",
    reason: "Тема: спорная трактовка (63%)",
    author: "Архив-8",
    confidence: 63,
  },
];

export interface NewsbotSource {
  id: string;
  name: string;
  meta: string;
  enabled: boolean;
}

export const NEWSBOT_SOURCES: NewsbotSource[] = [
  { id: "s1", name: "Яндекс Новости", meta: "Обновление каждые 15 мин", enabled: true },
  { id: "s2", name: "РБК", meta: "Обновление каждые 30 мин", enabled: true },
  { id: "s3", name: "Habr", meta: "Технологии и IT", enabled: true },
  { id: "s4", name: "VC.ru", meta: "Бизнес и стартапы", enabled: false },
];

export const SEO_SCORES = [
  { label: "SEO", value: 75, color: "#6aaa4a", caption: "Готовы к публикации" },
  { label: "AEO", value: 64, color: "#e8a85a", caption: "Ответы ИИ-движкам" },
  { label: "GEO", value: 58, color: "#4d5aff", caption: "Геолокальные запросы" },
];

export const ADMIN_ACTIVITY = [
  { text: "Аналитик опубликовал «SEO-тренды 2026»", time: "11:30", tone: "ok" },
  { text: "Практик опубликовал «Топ SEO-инструментов»", time: "08:00", tone: "ok" },
  { text: "РКН заблокировал 1 материал (94%)", time: "07:44", tone: "danger" },
  { text: "Новости-бот собрал 48 материалов", time: "06:00", tone: "ok" },
] as const;

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: "Читатель" | "Автор" | "Редактор" | "Админ";
  plan: "Free" | "Premium";
  joined: string;
  articles: number;
  status: "active" | "banned";
}

export const PLATFORM_USERS: PlatformUser[] = [
  { id: "u1", name: "Мария Ковалёва", email: "m.kovaleva@rusability.ru", role: "Автор", plan: "Premium", joined: "12.03.2025", articles: 48, status: "active" },
  { id: "u2", name: "Дмитрий Соколов", email: "d.sokolov@rusability.ru", role: "Редактор", plan: "Premium", joined: "04.11.2024", articles: 132, status: "active" },
  { id: "u3", name: "Анна Лебедева", email: "anna.l@gmail.com", role: "Читатель", plan: "Premium", joined: "28.06.2026", articles: 0, status: "active" },
  { id: "u4", name: "Игорь Волков", email: "i.volkov@yandex.ru", role: "Автор", plan: "Free", joined: "15.01.2026", articles: 12, status: "active" },
  { id: "u5", name: "Елена Морозова", email: "e.morozova@rusability.ru", role: "Админ", plan: "Premium", joined: "01.09.2023", articles: 7, status: "active" },
  { id: "u6", name: "Спам-аккаунт", email: "bot4821@temp.mail", role: "Читатель", plan: "Free", joined: "09.07.2026", articles: 0, status: "banned" },
];

export const MONETIZATION_STATS = {
  mrr: "₽ 812 000",
  subscribers: 4820,
  arpu: "₽ 168",
  churn: "2,1%",
};
