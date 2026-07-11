import type { NewsItem } from "@/lib/types";

const NEWS_BODY = [
  "Компания официально подтвердила информацию, которая ранее циркулировала в отраслевых источниках. По заявлению представителей, изменения затронут значительную часть пользователей уже в ближайшие недели.",
  "Аналитики отмечают, что решение вписывается в общую тенденцию рынка: игроки консолидируют ресурсы и делают ставку на автоматизацию. Реакция сообщества оказалась смешанной.",
  "Мы будем следить за развитием ситуации и обновим материал по мере поступления новой информации от официальных лиц и участников рынка.",
];

export const NEWS: NewsItem[] = [
  {
    id: "n-1",
    slug: "novaya-model-generacii",
    title: "Представлена новая модель генерации изображений с рекордной скоростью",
    excerpt:
      "Разработчики заявляют о десятикратном ускорении при сопоставимом качестве. Публичный доступ откроют до конца месяца.",
    body: NEWS_BODY,
    category: "tech",
    source: "TechRadar",
    tags: ["ИИ", "генерация", "релиз"],
    publishedAt: "2026-07-10T09:30:00",
    timeLabel: "2 часа назад",
    views: 8400,
    pipeline: "published",
    hot: true,
  },
  {
    id: "n-2",
    slug: "reklamnyy-rynok-rost",
    title: "Рекламный рынок вырос на 14% за квартал вопреки прогнозам",
    excerpt:
      "Основной драйвер — перформанс в мессенджерах и ритейл-медиа. Классическая медийка продолжает терять долю.",
    body: NEWS_BODY,
    category: "marketing",
    source: "AdIndex",
    tags: ["реклама", "рынок", "аналитика"],
    publishedAt: "2026-07-10T08:00:00",
    timeLabel: "4 часа назад",
    views: 5200,
    pipeline: "published",
  },
  {
    id: "n-3",
    slug: "startap-raund-b",
    title: "Российский B2B-стартап привлёк раунд B на развитие в регионе MENA",
    excerpt:
      "Инвестиции пойдут на локализацию продукта и найм команды в Дубае. Оценка компании выросла втрое за год.",
    body: NEWS_BODY,
    category: "business",
    source: "Forbes",
    tags: ["инвестиции", "стартапы", "MENA"],
    publishedAt: "2026-07-10T06:45:00",
    timeLabel: "5 часов назад",
    views: 4100,
    pipeline: "published",
  },
  {
    id: "n-4",
    slug: "issledovanie-vnimaniya",
    title: "Учёные уточнили, сколько на самом деле длится концентрация внимания",
    excerpt:
      "Новое исследование опровергает популярный миф о «восьми секундах». Реальность оказалась сложнее и контекстнее.",
    body: NEWS_BODY,
    category: "science",
    source: "N+1",
    tags: ["исследование", "внимание", "когнитивистика"],
    publishedAt: "2026-07-09T18:20:00",
    timeLabel: "вчера",
    views: 6700,
    pipeline: "published",
  },
  {
    id: "n-5",
    slug: "brauzer-privatnost",
    title: "Крупный браузер по умолчанию отключит сторонние трекеры",
    excerpt:
      "Изменение затронет рекламные экосистемы и заставит маркетологов пересмотреть модели атрибуции.",
    body: NEWS_BODY,
    category: "tech",
    source: "The Verge",
    tags: ["приватность", "браузеры", "трекинг"],
    publishedAt: "2026-07-09T15:10:00",
    timeLabel: "вчера",
    views: 7300,
    pipeline: "published",
    hot: true,
  },
  {
    id: "n-6",
    slug: "marketplace-komissii",
    title: "Маркетплейсы пересматривают комиссии для продавцов",
    excerpt:
      "Новые условия вступят в силу осенью. Малые продавцы опасаются роста издержек.",
    body: NEWS_BODY,
    category: "business",
    source: "РБК",
    tags: ["e-commerce", "маркетплейсы", "комиссии"],
    publishedAt: "2026-07-09T12:00:00",
    timeLabel: "вчера",
    views: 3900,
    pipeline: "published",
  },
  {
    id: "n-7",
    slug: "otkrytaya-model-perevoda",
    title: "Вышла открытая модель перевода с поддержкой 200 языков",
    excerpt:
      "Модель доступна под свободной лицензией и уже интегрируется в редакционные пайплайны.",
    body: NEWS_BODY,
    category: "tech",
    source: "Habr",
    tags: ["ИИ", "перевод", "open source"],
    publishedAt: "2026-07-08T20:30:00",
    timeLabel: "2 дня назад",
    views: 5600,
    pipeline: "published",
  },
  {
    id: "n-8",
    slug: "nayti-dizaynera",
    title: "Спрос на продуктовых дизайнеров вырос впервые за полтора года",
    excerpt:
      "Рынок труда в digital постепенно восстанавливается, но требования к кандидатам заметно ужесточились.",
    body: NEWS_BODY,
    category: "marketing",
    source: "Хабр Карьера",
    tags: ["рынок труда", "дизайн", "найм"],
    publishedAt: "2026-07-08T14:15:00",
    timeLabel: "2 дня назад",
    views: 4800,
    pipeline: "published",
  },
  {
    id: "n-9",
    slug: "kvantovyy-eksperiment",
    title: "Физики сообщили о новом рекорде в квантовых вычислениях",
    excerpt:
      "Результат приближает практическое применение, хотя до массовых устройств ещё далеко.",
    body: NEWS_BODY,
    category: "science",
    source: "Nature",
    tags: ["квантовые вычисления", "физика"],
    publishedAt: "2026-07-07T10:00:00",
    timeLabel: "3 дня назад",
    views: 3300,
    pipeline: "published",
  },
  {
    id: "n-10",
    slug: "novost-v-ocheredi",
    title: "Платёжный сервис анонсировал поддержку подписок для авторов",
    excerpt:
      "Функция позволит независимым медиа получать регулярный доход напрямую от аудитории.",
    body: NEWS_BODY,
    category: "business",
    source: "RSS · автоимпорт",
    tags: ["платежи", "подписки", "монетизация"],
    publishedAt: "2026-07-10T10:40:00",
    timeLabel: "только что",
    views: 0,
    pipeline: "review",
  },
];

export function getNews(slug: string): NewsItem | undefined {
  return NEWS.find((n) => n.slug === slug);
}

export function publishedNews(): NewsItem[] {
  return NEWS.filter((n) => n.pipeline === "published" || !n.pipeline);
}

export function newsByCategory(category: string): NewsItem[] {
  return publishedNews().filter((n) => n.category === category);
}

export function latestNews(limit?: number): NewsItem[] {
  const sorted = [...publishedNews()].sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
  );
  return limit ? sorted.slice(0, limit) : sorted;
}

export function popularNews(limit?: number): NewsItem[] {
  const sorted = [...publishedNews()].sort((a, b) => b.views - a.views);
  return limit ? sorted.slice(0, limit) : sorted;
}
