import type {
  AdSlot,
  AiAuthorConfig,
  Connection,
  CronJob,
  KpiStat,
  MetricPoint,
  NewsletterCampaign,
} from "@/lib/types";

export const KPIS: KpiStat[] = [
  { label: "Сессии", value: "482,3K", delta: 12.4, spark: [30, 42, 38, 55, 61, 58, 72, 80] },
  { label: "Пользователи", value: "214,7K", delta: 8.1, spark: [20, 28, 26, 34, 40, 44, 48, 52] },
  { label: "Просмотры", value: "1,24M", delta: 18.6, spark: [40, 44, 52, 60, 58, 70, 84, 92] },
  { label: "Ср. время", value: "3:42", delta: -2.3, spark: [60, 58, 55, 57, 52, 50, 48, 49] },
];

export const TRAFFIC_SERIES: MetricPoint[] = [
  { label: "Пн", value: 42000 },
  { label: "Вт", value: 51000 },
  { label: "Ср", value: 48000 },
  { label: "Чт", value: 61000 },
  { label: "Пт", value: 72000 },
  { label: "Сб", value: 58000 },
  { label: "Вс", value: 64000 },
];

export const TRAFFIC_SOURCES: MetricPoint[] = [
  { label: "Поиск", value: 42 },
  { label: "Прямые", value: 24 },
  { label: "Соцсети", value: 18 },
  { label: "Рассылки", value: 11 },
  { label: "Реферальные", value: 5 },
];

export const TOP_PAGES: { path: string; views: number; delta: number }[] = [
  { path: "/articles/psihologiya-interfeysov", views: 24800, delta: 14 },
  { path: "/articles/issledovaniya-bez-byudzheta", views: 31500, delta: 22 },
  { path: "/news/novaya-model-generacii", views: 8400, delta: 9 },
  { path: "/articles/ii-v-redakcii", views: 27400, delta: 31 },
  { path: "/articles/metriki-produkta", views: 22100, delta: -4 },
];

export const AI_AUTHORS: AiAuthorConfig[] = [
  {
    id: "ai-1",
    name: "Аврора",
    avatar: "/images/avatars/ai-1.png",
    archetype: "Аналитик",
    topics: ["Технологии", "Данные", "ИИ"],
    active: true,
    schedule: "daily",
    published: 112,
    lastRun: "48 минут назад",
  },
  {
    id: "ai-2",
    name: "Гермес",
    avatar: "/images/avatars/ai-1.png",
    archetype: "Обозреватель",
    topics: ["Маркетинг", "Тренды"],
    active: true,
    schedule: "hourly",
    published: 340,
    lastRun: "12 минут назад",
  },
  {
    id: "ai-3",
    name: "Веста",
    avatar: "/images/avatars/ai-1.png",
    archetype: "Практик",
    topics: ["UX", "Продукт"],
    active: false,
    schedule: "weekly",
    published: 28,
    lastRun: "3 дня назад",
  },
];

export const CRON_JOBS: CronJob[] = [
  {
    id: "cr-1",
    name: "Дневной техно-дайджест",
    authorId: "ai-1",
    topics: ["Технологии", "ИИ"],
    schedule: "Ежедневно, 09:00",
    volume: 3,
    status: "running",
    nextRun: "Завтра, 09:00",
  },
  {
    id: "cr-2",
    name: "Маркетинг-тренды",
    authorId: "ai-2",
    topics: ["Маркетинг"],
    schedule: "Каждый час",
    volume: 1,
    status: "running",
    nextRun: "Через 40 минут",
  },
  {
    id: "cr-3",
    name: "UX-практика",
    authorId: "ai-3",
    topics: ["UX", "Продукт"],
    schedule: "Еженедельно, Пн",
    volume: 5,
    status: "paused",
    nextRun: "—",
  },
];

export const QUARANTINE = [
  {
    id: "q-1",
    title: "Обзор рынка беттинга и прогнозов на сезон",
    reason: "Азартные игры",
    author: "Гермес",
    flaggedAt: "1 час назад",
  },
  {
    id: "q-2",
    title: "Политические итоги недели: что изменилось",
    reason: "Политический нарратив",
    author: "Аврора",
    flaggedAt: "3 часа назад",
  },
];

export const CAMPAIGNS: NewsletterCampaign[] = [
  {
    id: "cm-1",
    name: "Еженедельный дайджест",
    subject: "5 материалов недели, которые стоит прочитать",
    audience: "Все подписчики",
    recipients: 48200,
    status: "sent",
    openRate: 42.6,
    clickRate: 8.1,
    sentAt: "8 июля",
  },
  {
    id: "cm-2",
    name: "Elite-подборка",
    subject: "Только для подписчиков: лучшее за месяц",
    audience: "Elite-читатели",
    recipients: 6400,
    status: "sent",
    openRate: 61.3,
    clickRate: 14.7,
    sentAt: "5 июля",
  },
  {
    id: "cm-3",
    name: "Анонс Design Weekend",
    subject: "Открыта регистрация на Design Weekend 2026",
    audience: "Интерес: Дизайн",
    recipients: 21800,
    status: "scheduled",
    openRate: 0,
    clickRate: 0,
    sentAt: "12 июля",
  },
  {
    id: "cm-4",
    name: "Реактивация",
    subject: "Мы скучали. Вот что вы пропустили",
    audience: "Неактивные 90 дней",
    recipients: 12400,
    status: "draft",
    openRate: 0,
    clickRate: 0,
  },
];

export const AD_SLOTS: AdSlot[] = [
  { id: "ad-1", name: "Hero-баннер", placement: "Главная / Hero", format: "1200×400", status: "active", impressions: 184000, clicks: 3200, ctr: 1.74, advertiser: "Skillbox" },
  { id: "ad-2", name: "Внутри статьи", placement: "Статья / inline", format: "728×250", status: "active", impressions: 96000, clicks: 1450, ctr: 1.51, advertiser: "Тинькофф" },
  { id: "ad-3", name: "Сайдбар", placement: "Статья / sidebar", format: "300×600", status: "paused", impressions: 42000, clicks: 380, ctr: 0.9, advertiser: "Нетология" },
  { id: "ad-4", name: "В рассылке", placement: "Newsletter", format: "600×200", status: "active", impressions: 48000, clicks: 920, ctr: 1.92, advertiser: "VK Cloud" },
  { id: "ad-5", name: "Мобильный якорь", placement: "Mobile / anchor", format: "320×100", status: "empty", impressions: 0, clicks: 0, ctr: 0 },
];

export const CONNECTIONS: Connection[] = [
  { id: "cn-1", platform: "Telegram", handle: "@rusability", connected: true, autopost: true, followers: "84,2K", lastSync: "5 минут назад" },
  { id: "cn-2", platform: "ВКонтакте", handle: "rusability", connected: true, autopost: true, followers: "126K", lastSync: "18 минут назад" },
  { id: "cn-3", platform: "Instagram", handle: "@rusability", connected: true, autopost: false, followers: "42,8K", lastSync: "2 часа назад" },
  { id: "cn-4", platform: "Яндекс Дзен", handle: "Rusability", connected: false, autopost: false, followers: "—" },
];

export const REVENUE_SERIES: MetricPoint[] = [
  { label: "Янв", value: 420 },
  { label: "Фев", value: 480 },
  { label: "Мар", value: 520 },
  { label: "Апр", value: 610 },
  { label: "Май", value: 680 },
  { label: "Июн", value: 720 },
  { label: "Июл", value: 810 },
];

export const REVENUE_BREAKDOWN: MetricPoint[] = [
  { label: "Подписки", value: 48 },
  { label: "Реклама", value: 32 },
  { label: "Партнёрства", value: 14 },
  { label: "Мероприятия", value: 6 },
];
