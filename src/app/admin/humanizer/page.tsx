import { PageHeader } from "@/components/admin/ui";
import { ArticleTabs } from "@/components/admin/ArticleTabs";
import { getHumanizerConfig } from "@/lib/ai/humanizer";
import { HumanizerWorkspace } from "./HumanizerWorkspace";

export const metadata = { title: "Гуманизатор — Rusability" };
export const dynamic = "force-dynamic";

export default async function HumanizerPage() {
  const config = await getHumanizerConfig();

  return (
    <div>
      <PageHeader
        title="Гуманизатор текста"
        subtitle="humanizer-ru: убирает признаки нейросети из русского текста — канцелярит, кальки, штампы и фингерпринты ChatGPT/Claude. Настройки применяются ко всей ИИ-генерации."
      />
      <ArticleTabs />
      <HumanizerWorkspace initial={config} />
    </div>
  );
}
