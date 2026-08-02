/**
 * Free AI writing-tools registry (public /tools).
 *
 * Config-driven so a new tool = one entry here (metadata + fields + a pure
 * prompt builder). This module is CLIENT-SAFE: it imports nothing server-only,
 * so the public form and the server action share one source of truth. The
 * `buildPrompt` functions are pure string builders (no secrets), safe to bundle.
 */

export type ToolFieldType = "text" | "textarea" | "select";

export type ToolField = {
  name: string;
  label: string;
  type: ToolFieldType;
  placeholder?: string;
  help?: string;
  required?: boolean;
  maxLength?: number;
  /** For type 'select'. First option is the default. */
  options?: { value: string; label: string }[];
};

/** How the model returns its answer, and how the UI renders it. */
export type ToolOutput =
  | { kind: "variants"; count: number; label: string; itemLabel: string }
  | { kind: "text"; label: string };

export type ToolCategory = "seo" | "writing" | "ideas";

export type ToolValues = Record<string, string>;

export type ToolDef = {
  slug: string;
  title: string;
  /** Short label for cards / nav. */
  shortTitle: string;
  /** One-line description (card + meta description base). */
  description: string;
  /** Longer intro shown on the tool page. */
  intro: string;
  category: ToolCategory;
  /** Lucide icon name (resolved in the UI). */
  icon: string;
  /** Extra SEO keywords for metadata. */
  keywords: string[];
  fields: ToolField[];
  output: ToolOutput;
  /** Pure builder → { system, prompt } sent to the model. */
  buildPrompt: (v: ToolValues) => { system: string; prompt: string };
};

export const TOOL_CATEGORY_LABELS: Record<ToolCategory, string> = {
  seo: "SEO и продвижение",
  writing: "Работа с текстом",
  ideas: "Идеи и планирование",
};

/** Shared Russian editorial system preamble — keeps every tool on-brand. */
const BASE_SYSTEM = [
  "Ты — опытный русскоязычный редактор и контент-маркетолог издания Rusability о digital, маркетинге и клиентском опыте.",
  "Пиши живым, профессиональным русским языком без канцелярита, штампов и калек с английского.",
  "Не используй markdown, эмодзи, кавычки-«ёлочки» вокруг всего ответа и служебные пояснения.",
  "Не выдумывай факты, цифры и имена. Отвечай строго на русском языке.",
].join(" ");

const TONE_OPTIONS = [
  { value: "нейтральный", label: "Нейтральный" },
  { value: "экспертный", label: "Экспертный" },
  { value: "дружелюбный", label: "Дружелюбный" },
  { value: "продающий", label: "Продающий" },
  { value: "деловой", label: "Деловой" },
];

export const TOOLS: ToolDef[] = [
  {
    slug: "generator-zagolovkov",
    title: "Генератор заголовков",
    shortTitle: "Заголовки",
    description:
      "Придумывает цепляющие заголовки для статьи, поста или рассылки по теме.",
    intro:
      "Опишите, о чём материал, и получите варианты заголовков — от информативных до кликабельных. Подходит для статей, блогов, email-рассылок и соцсетей.",
    category: "seo",
    icon: "Heading",
    keywords: ["генератор заголовков", "заголовки для статьи", "цепляющие заголовки", "title generator"],
    output: { kind: "variants", count: 8, label: "Варианты заголовков", itemLabel: "Заголовок" },
    fields: [
      {
        name: "topic",
        label: "О чём материал",
        type: "textarea",
        placeholder: "Например: как малому бизнесу внедрить CRM без больших затрат",
        required: true,
        maxLength: 600,
      },
      {
        name: "tone",
        label: "Тон",
        type: "select",
        options: TONE_OPTIONS,
      },
    ],
    buildPrompt: (v) => ({
      system: BASE_SYSTEM,
      prompt: [
        `Тема материала: ${v.topic}`,
        `Тон: ${v.tone || "нейтральный"}.`,
        "Придумай 8 разных заголовков на русском языке.",
        "Заголовки должны быть разнообразными: часть — информативные и точные, часть — более цепляющие и кликабельные, но без жёлтого кликбейта и без обмана.",
        "Каждый заголовок — до 90 символов, без точки в конце, без нумерации и без кавычек.",
      ].join("\n"),
    }),
  },
  {
    slug: "meta-opisanie",
    title: "Генератор мета-описаний",
    shortTitle: "Мета-описания",
    description:
      "Создаёт SEO мета-описание (description) до 160 символов для страницы или статьи.",
    intro:
      "Мета-описание — это сниппет под заголовком в результатах поиска. Хорошее описание повышает кликабельность. Введите заголовок и суть страницы — получите готовые варианты нужной длины.",
    category: "seo",
    icon: "Search",
    keywords: ["мета-описание", "meta description", "SEO описание", "сниппет для поиска"],
    output: { kind: "variants", count: 5, label: "Варианты мета-описаний", itemLabel: "Описание" },
    fields: [
      {
        name: "title",
        label: "Заголовок страницы",
        type: "text",
        placeholder: "Например: Как выбрать CRM для малого бизнеса",
        required: true,
        maxLength: 200,
      },
      {
        name: "summary",
        label: "О чём страница",
        type: "textarea",
        placeholder: "Кратко опишите содержание и ключевую выгоду для читателя",
        required: true,
        maxLength: 800,
      },
    ],
    buildPrompt: (v) => ({
      system: BASE_SYSTEM,
      prompt: [
        `Заголовок страницы: ${v.title}`,
        `Содержание: ${v.summary}`,
        "Напиши 5 вариантов мета-описания (meta description) на русском языке для этой страницы.",
        "СТРОГО: каждое описание — от 120 до 160 символов, одно предложение или два коротких, с ключевой выгодой и мягким призывом к прочтению.",
        "Без кавычек, без markdown, без нумерации.",
      ].join("\n"),
    }),
  },
  {
    slug: "rerayt-teksta",
    title: "Рерайт и перефразирование текста",
    shortTitle: "Рерайт текста",
    description:
      "Переписывает текст другими словами, сохраняя смысл. Можно выбрать тон.",
    intro:
      "Вставьте фрагмент текста — инструмент перепишет его другими словами, сохранив смысл, факты и цифры. Удобно, чтобы убрать повторы, упростить формулировки или сменить тон.",
    category: "writing",
    icon: "RefreshCw",
    keywords: ["рерайт текста", "перефразировать текст", "переписать текст", "рерайтер онлайн"],
    output: { kind: "text", label: "Переписанный текст" },
    fields: [
      {
        name: "text",
        label: "Исходный текст",
        type: "textarea",
        placeholder: "Вставьте текст, который нужно переписать",
        required: true,
        maxLength: 4000,
      },
      {
        name: "tone",
        label: "Тон",
        type: "select",
        options: TONE_OPTIONS,
      },
    ],
    buildPrompt: (v) => ({
      system: BASE_SYSTEM,
      prompt: [
        "Перепиши следующий текст другими словами на русском языке.",
        `Тон результата: ${v.tone || "нейтральный"}.`,
        "Сохрани смысл, факты, цифры и имена. Не сокращай существенно и не добавляй новых фактов. Убери повторы и канцелярит, сделай текст естественным.",
        "Верни только переписанный текст, без пояснений и без markdown.",
        "",
        `Текст:\n${v.text}`,
      ].join("\n"),
    }),
  },
  {
    slug: "idei-dlya-statey",
    title: "Генератор идей для статей",
    shortTitle: "Идеи для статей",
    description:
      "Предлагает темы и идеи для контент-плана по вашей нише или ключевому слову.",
    intro:
      "Не знаете, о чём писать? Укажите нишу или ключевую тему — получите список идей для статей с разными углами подачи. Отличная основа для контент-плана.",
    category: "ideas",
    icon: "Lightbulb",
    keywords: ["идеи для статей", "темы для блога", "контент-план", "генератор тем"],
    output: { kind: "variants", count: 10, label: "Идеи для статей", itemLabel: "Идея" },
    fields: [
      {
        name: "niche",
        label: "Ниша или тема",
        type: "text",
        placeholder: "Например: email-маркетинг для интернет-магазинов",
        required: true,
        maxLength: 300,
      },
      {
        name: "audience",
        label: "Аудитория (необязательно)",
        type: "text",
        placeholder: "Например: маркетологи малого бизнеса",
        maxLength: 200,
      },
    ],
    buildPrompt: (v) => ({
      system: BASE_SYSTEM,
      prompt: [
        `Ниша / тема: ${v.niche}`,
        v.audience ? `Целевая аудитория: ${v.audience}` : "",
        "Предложи 10 идей для статей на русском языке по этой теме.",
        "Каждая идея — это конкретная тема статьи с понятным углом подачи (проблема, кейс, руководство, разбор, сравнение и т. п.), сформулированная как рабочий заголовок до 100 символов.",
        "Идеи должны быть разнообразными и не повторять друг друга. Без нумерации, без кавычек, без markdown.",
      ].filter(Boolean).join("\n"),
    }),
  },
];

export function getTool(slug: string): ToolDef | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function toolsByCategory(): { category: ToolCategory; label: string; tools: ToolDef[] }[] {
  const cats: ToolCategory[] = ["seo", "writing", "ideas"];
  return cats
    .map((category) => ({
      category,
      label: TOOL_CATEGORY_LABELS[category],
      tools: TOOLS.filter((t) => t.category === category),
    }))
    .filter((g) => g.tools.length > 0);
}
