import "server-only";
import { generateText } from "ai";
import { CONTENT_MODEL } from "./model";

const SYSTEM = `Ты пишешь короткое личное кредо (манифест) автора русскоязычного медиа Rusability о бизнесе, маркетинге и технологиях.

Формат — от первого лица, в духе примера:
«Фанат аналитики. Адвокат честного маркетинга. Пишу о данных и росте — просто о сложном.»

ТРЕБОВАНИЯ:
- 2–3 коротких фрагмента через точку, разговорно и живо.
- Начни с роли/страсти («Фанат…», «Адвокат…», «Исследую…», «Верю в…») и обязательно включи оборот «Пишу о … » с темами автора.
- Только на русском. Без кавычек, без эмодзи, без хэштегов, без имени автора.
- Не выдумывай факты, награды и цифры. Опирайся на архетип и специализацию.
- Максимум ~160 символов.`;

/** Generate a short first-person manifesto for an author. */
export async function generateManifesto(input: {
  name: string;
  archetype?: string | null;
  bio?: string | null;
}): Promise<string> {
  const parts = [
    input.archetype ? `Специализация: ${input.archetype}` : "",
    input.bio ? `О себе: ${input.bio}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const { text } = await generateText({
    model: CONTENT_MODEL,
    system: SYSTEM,
    prompt: `Автор Rusability.\n${parts || "Автор пишет о бизнесе и маркетинге."}\n\nНапиши манифест:`,
  });

  return text
    .trim()
    .replace(/^["«»']+|["«»']+$/g, "")
    .slice(0, 200);
}
