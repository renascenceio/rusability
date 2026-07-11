import type { Article, ArticleBlock } from "@/lib/types";

function body(intro: string, extra?: Partial<{ q: string; cite: string }>): ArticleBlock[] {
  const blocks: ArticleBlock[] = [
    { type: "p", text: intro },
    {
      type: "p",
      text: "За последние годы дисциплина изменилась сильнее, чем за предыдущее десятилетие. Инструменты стали дешевле, аудитория — требовательнее, а порог входа — одновременно ниже и выше. Ниже разберём, что действительно работает, а что осталось красивой теорией из презентаций.",
    },
    { type: "h2", text: "С чего начать" },
    {
      type: "p",
      text: "Первый шаг почти всегда один и тот же: перестать копировать чужие решения и начать с собственных данных. Кейсы конкурентов полезны как ориентир, но не как инструкция. Контекст, аудитория и ресурсы у всех разные.",
    },
    {
      type: "quote",
      text: extra?.q ?? "Хорошая стратегия — это не список того, что вы делаете. Это список того, что вы осознанно решили не делать.",
      cite: extra?.cite ?? "Из интервью",
    },
    { type: "h3", text: "Три принципа, которые окупаются" },
    {
      type: "list",
      items: [
        "Измеряйте то, что влияет на решение, а не то, что удобно считать.",
        "Сначала гипотеза, потом инструмент — а не наоборот.",
        "Скорость обучения важнее скорости запуска.",
      ],
    },
    {
      type: "p",
      text: "Эти принципы звучат банально, пока вы не начнёте применять их под давлением сроков. Именно там, в реальных условиях, и проходит граница между теорией и практикой.",
    },
    { type: "h2", text: "Что дальше" },
    {
      type: "p",
      text: "Мы продолжим разбирать эту тему в следующих материалах: покажем конкретные шаблоны, метрики и ошибки, которые чаще всего дорого обходятся командам. Подпишитесь, чтобы не пропустить продолжение.",
    },
  ];
  return blocks;
}

export const ARTICLES: Article[] = [
  {
    id: "ar-1",
    slug: "psihologiya-interfeysov",
    title: "Психология интерфейсов: как дизайн управляет вниманием",
    excerpt:
      "Разбираем когнитивные механизмы, которые определяют, куда посмотрит пользователь — и как проектировать интерфейсы, уважающие внимание.",
    body: body(
      "Внимание — самый дефицитный ресурс в цифровом продукте. Мы боремся за него с уведомлениями, лентами и десятками вкладок. Но хороший интерфейс не крадёт внимание, а направляет его.",
    ),
    cover: "/images/covers/design-1.png",
    category: "design",
    tags: ["интерфейсы", "психология", "внимание"],
    authorId: "au-1",
    tier: "elite",
    status: "published",
    readingMinutes: 9,
    views: 24800,
    claps: 1840,
    comments: 63,
    publishedAt: "2026-07-08",
    geoScore: 92,
    featured: true,
  },
  {
    id: "ar-2",
    slug: "rost-bez-byudzheta",
    title: "Рост без бюджета: 7 каналов, которые ещё работают",
    excerpt:
      "Перформанс дорожает, а органика недооценена. Собрали каналы, которые дают результат без больших вложений в рекламу.",
    body: body(
      "Когда рекламные аукционы перегреты, выигрывает не тот, у кого больше денег, а тот, у кого лучше система. Рассмотрим семь каналов, которые всё ещё дают недорогой трафик.",
    ),
    cover: "/images/covers/marketing-1.png",
    category: "marketing",
    tags: ["рост", "органика", "каналы"],
    authorId: "au-2",
    tier: "standard",
    status: "published",
    readingMinutes: 7,
    views: 18200,
    claps: 920,
    comments: 41,
    publishedAt: "2026-07-07",
    featured: true,
  },
  {
    id: "ar-3",
    slug: "issledovaniya-bez-byudzheta",
    title: "UX-исследования, когда нет ни времени, ни бюджета",
    excerpt:
      "Практичные методы получить инсайты за день, а не за месяц. Гид по guerrilla-исследованиям для продуктовых команд.",
    body: body(
      "«У нас нет времени на исследования» — фраза, которая обходится компаниям в миллионы. На самом деле полезные данные можно собрать за один день, если знать, где искать.",
    ),
    cover: "/images/covers/ux-1.png",
    category: "ux",
    tags: ["исследования", "методы", "продукт"],
    authorId: "au-3",
    tier: "elite",
    status: "published",
    readingMinutes: 11,
    views: 31500,
    claps: 2210,
    comments: 88,
    publishedAt: "2026-07-06",
    geoScore: 96,
    featured: true,
  },
  {
    id: "ar-4",
    slug: "ii-v-redakcii",
    title: "ИИ в редакции: помощник или замена автора",
    excerpt:
      "Как редакции используют генеративные модели, где проходит граница доверия и что остаётся исключительно человеческим.",
    body: body(
      "Генеративные модели уже пишут черновики, подбирают заголовки и переводят тексты. Но значит ли это, что автор больше не нужен? Разбираемся без паники и без хайпа.",
    ),
    cover: "/images/covers/ai-1.png",
    category: "ai",
    tags: ["ИИ", "контент", "редакция"],
    authorId: "au-ai-1",
    tier: "standard",
    status: "published",
    readingMinutes: 8,
    views: 27400,
    claps: 1560,
    comments: 72,
    publishedAt: "2026-07-05",
  },
  {
    id: "ar-5",
    slug: "komanda-kotoraya-masshtabiruetsya",
    title: "Команда, которая масштабируется: уроки роста с 5 до 50",
    excerpt:
      "Что ломается, когда стартап растёт, и как выстроить процессы, не убив культуру. Личный опыт основательницы.",
    body: body(
      "Рост — это не только больше выручки. Это больше людей, больше согласований и больше способов всё сломать. Расскажу, что мы поняли, пройдя путь от пяти человек до пятидесяти.",
    ),
    cover: "/images/covers/business-1.png",
    category: "business",
    tags: ["команды", "масштабирование", "культура"],
    authorId: "au-5",
    tier: "standard",
    status: "published",
    readingMinutes: 10,
    views: 14900,
    claps: 780,
    comments: 34,
    publishedAt: "2026-07-04",
  },
  {
    id: "ar-6",
    slug: "budushchee-frontenda",
    title: "Будущее фронтенда: куда движется веб в 2026",
    excerpt:
      "Серверные компоненты, edge-рендеринг и конец эпохи тяжёлых SPA. Обзор трендов, которые меняют разработку.",
    body: body(
      "Фронтенд снова на переломе. То, что вчера было бесспорной практикой, сегодня выглядит устаревшим. Соберём ключевые сдвиги и попробуем понять, что из этого приживётся.",
    ),
    cover: "/images/covers/tech-1.png",
    category: "tech",
    tags: ["фронтенд", "веб", "тренды"],
    authorId: "au-4",
    tier: "standard",
    status: "published",
    readingMinutes: 9,
    views: 21300,
    claps: 1120,
    comments: 57,
    publishedAt: "2026-07-03",
  },
  {
    id: "ar-7",
    slug: "sistema-tipografiki",
    title: "Как собрать типографическую систему, которая не развалится",
    excerpt:
      "Шкала, ритм и токены: инженерный подход к типографике в дизайн-системах.",
    body: body(
      "Типографика — это не про красивый шрифт. Это про систему, которая остаётся согласованной на сотнях экранов и в руках десятков людей.",
    ),
    cover: "/images/covers/design-2.png",
    category: "design",
    tags: ["типографика", "дизайн-система", "токены"],
    authorId: "au-1",
    tier: "standard",
    status: "published",
    readingMinutes: 6,
    views: 12700,
    claps: 640,
    comments: 22,
    publishedAt: "2026-07-02",
  },
  {
    id: "ar-8",
    slug: "kontent-strategiya-2026",
    title: "Контент-стратегия 2026: меньше постов, больше системы",
    excerpt:
      "Почему ежедневный постинг больше не работает и как построить контент вокруг ценности, а не частоты.",
    body: body(
      "Алгоритмы устали от шума не меньше, чем аудитория. Выигрывает не тот, кто публикует чаще, а тот, кто попадает точнее.",
    ),
    cover: "/images/covers/marketing-2.png",
    category: "marketing",
    tags: ["контент", "стратегия", "SMM"],
    authorId: "au-2",
    tier: "standard",
    status: "published",
    readingMinutes: 7,
    views: 16400,
    claps: 830,
    comments: 29,
    publishedAt: "2026-07-01",
  },
  {
    id: "ar-9",
    slug: "generativnyy-dizayn",
    title: "Генеративный дизайн: соавтор, а не кнопка «сделать красиво»",
    excerpt:
      "Как использовать ИИ в дизайн-процессе так, чтобы усилить команду, а не обесценить ремесло.",
    body: body(
      "ИИ в дизайне вызывает две крайние реакции: восторг и страх. Правда, как всегда, посередине — в рутине, которую можно делегировать, и в вкусе, который делегировать нельзя.",
    ),
    cover: "/images/covers/ai-2.png",
    category: "ai",
    tags: ["ИИ", "дизайн", "инструменты"],
    authorId: "au-3",
    tier: "standard",
    status: "published",
    readingMinutes: 8,
    views: 19800,
    claps: 1040,
    comments: 45,
    publishedAt: "2026-06-29",
  },
  {
    id: "ar-10",
    slug: "metriki-produkta",
    title: "Метрики продукта, которые врут",
    excerpt:
      "DAU, retention, конверсия — как популярные метрики вводят команды в заблуждение и что смотреть вместо них.",
    body: body(
      "Цифры создают ощущение объективности. Но метрика без контекста — это не факт, а иллюзия. Разберём, где популярные показатели обманывают.",
    ),
    cover: "/images/covers/ux-1.png",
    category: "ux",
    tags: ["метрики", "аналитика", "продукт"],
    authorId: "au-3",
    tier: "standard",
    status: "published",
    readingMinutes: 9,
    views: 22100,
    claps: 1180,
    comments: 51,
    publishedAt: "2026-06-27",
  },
  {
    id: "ar-11",
    slug: "cenoobrazovanie-saas",
    title: "Ценообразование в SaaS: искусство, притворяющееся наукой",
    excerpt:
      "Как выбрать модель, тарифы и якоря так, чтобы не оставить деньги на столе и не отпугнуть аудиторию.",
    body: body(
      "Цена — это самый недооценённый рычаг роста. Небольшое изменение тарифной сетки часто влияет на выручку сильнее, чем месяцы работы над воронкой.",
    ),
    cover: "/images/covers/business-1.png",
    category: "business",
    tags: ["SaaS", "ценообразование", "выручка"],
    authorId: "au-5",
    tier: "standard",
    status: "published",
    readingMinutes: 10,
    views: 13600,
    claps: 710,
    comments: 26,
    publishedAt: "2026-06-25",
  },
  {
    id: "ar-12",
    slug: "instrumenty-razrabotchika",
    title: "Инструменты разработчика, которые экономят часы в неделю",
    excerpt:
      "Подборка утилит и практик, которые незаметно ускоряют ежедневную работу инженера.",
    body: body(
      "Продуктивность редко приходит от одного большого решения. Чаще это сумма мелких улучшений, каждое из которых экономит минуты — а вместе они дают часы.",
    ),
    cover: "/images/covers/tech-1.png",
    category: "tech",
    tags: ["инструменты", "продуктивность", "разработка"],
    authorId: "au-4",
    tier: "standard",
    status: "draft",
    readingMinutes: 6,
    views: 0,
    claps: 0,
    comments: 0,
    publishedAt: "2026-07-10",
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function publishedArticles(): Article[] {
  return ARTICLES.filter((a) => a.status === "published");
}

export function articlesByCategory(category: string): Article[] {
  return publishedArticles().filter((a) => a.category === category);
}

export function articlesByAuthor(authorId: string): Article[] {
  return ARTICLES.filter((a) => a.authorId === authorId);
}

export function featuredArticles(): Article[] {
  return publishedArticles().filter((a) => a.featured);
}

export function relatedArticles(article: Article, limit = 3): Article[] {
  return publishedArticles()
    .filter((a) => a.id !== article.id && a.category === article.category)
    .slice(0, limit);
}
