import type { AppTool } from "@/lib/types";

export const APPS: AppTool[] = [
  {
    id: "app-1",
    slug: "figma",
    name: "Figma",
    tagline: "Совместный дизайн интерфейсов",
    description:
      "Облачный редактор для дизайна интерфейсов и прототипирования в реальном времени. Стандарт индустрии для продуктовых команд.",
    icon: "Figma",
    category: "Дизайн",
    pricing: "freemium",
    rating: 4.9,
    users: "4M+",
    featured: true,
  },
  {
    id: "app-2",
    slug: "notion",
    name: "Notion",
    tagline: "База знаний и задачи в одном месте",
    description:
      "Гибкое рабочее пространство для документов, вики и планирования. Подходит и одному автору, и большой команде.",
    icon: "FileText",
    category: "Продуктивность",
    pricing: "freemium",
    rating: 4.7,
    users: "30M+",
    featured: true,
  },
  {
    id: "app-3",
    slug: "amplitude",
    name: "Amplitude",
    tagline: "Продуктовая аналитика без иллюзий",
    description:
      "Инструмент для анализа поведения пользователей, воронок и когорт. Помогает командам принимать решения на данных.",
    icon: "BarChart3",
    category: "Аналитика",
    pricing: "freemium",
    rating: 4.5,
    users: "1M+",
  },
  {
    id: "app-4",
    slug: "linear",
    name: "Linear",
    tagline: "Трекер задач для продуктовых команд",
    description:
      "Быстрый и минималистичный инструмент для управления разработкой. Любим инженерами за скорость и клавиатурные шорткаты.",
    icon: "CheckSquare",
    category: "Продуктивность",
    pricing: "freemium",
    rating: 4.8,
    users: "500K+",
    featured: true,
  },
  {
    id: "app-5",
    slug: "midjourney",
    name: "Midjourney",
    tagline: "Генерация изображений по тексту",
    description:
      "Один из ведущих генеративных инструментов для создания визуалов. Используется дизайнерами и иллюстраторами.",
    icon: "Sparkles",
    category: "ИИ",
    pricing: "paid",
    rating: 4.6,
    users: "16M+",
  },
  {
    id: "app-6",
    slug: "tilda",
    name: "Tilda",
    tagline: "Конструктор сайтов без кода",
    description:
      "Популярный конструктор для лендингов и медиа-проектов. Позволяет запускать страницы без разработчиков.",
    icon: "Layout",
    category: "No-code",
    pricing: "freemium",
    rating: 4.4,
    users: "2M+",
  },
  {
    id: "app-7",
    slug: "grammarly-ru",
    name: "Главред",
    tagline: "Чистим текст от словесного мусора",
    description:
      "Сервис для редактуры русскоязычных текстов по методу информационного стиля. Помогает делать материалы яснее.",
    icon: "PenTool",
    category: "Контент",
    pricing: "free",
    rating: 4.3,
    users: "800K+",
  },
  {
    id: "app-8",
    slug: "yandex-metrika",
    name: "Яндекс Метрика",
    tagline: "Веб-аналитика с картами кликов",
    description:
      "Бесплатная система веб-аналитики с вебвизором и тепловыми картами. Незаменима для рунет-проектов.",
    icon: "Activity",
    category: "Аналитика",
    pricing: "free",
    rating: 4.2,
    users: "5M+",
  },
];

export function getApp(slug: string): AppTool | undefined {
  return APPS.find((a) => a.slug === slug);
}

export const APP_CATEGORIES = [
  "Все",
  "Дизайн",
  "Продуктивность",
  "Аналитика",
  "ИИ",
  "No-code",
  "Контент",
];
