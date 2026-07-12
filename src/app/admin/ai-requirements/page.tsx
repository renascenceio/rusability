import { PageHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { aiRequirements } from "@/lib/db/schema";
import { DEFAULT_REQUIREMENTS } from "@/lib/ai/requirements-defaults";
import { RequirementsEditor } from "./RequirementsEditor";
import { ArticleTabs } from "@/components/admin/ArticleTabs";

export const metadata = { title: "ИИ-требования — Rusability" };
export const dynamic = "force-dynamic";

export default async function AiRequirementsPage() {
  const rows = await db.select().from(aiRequirements);
  const byKey = new Map(rows.map((r) => [r.key, r]));

  // Merge stored rows over defaults so newly-added areas always appear.
  const items = DEFAULT_REQUIREMENTS.map((d) => {
    const row = byKey.get(d.key);
    return {
      key: d.key,
      title: row?.title || d.title,
      content: row?.content ?? d.content,
      updatedAt: row?.updatedAt ? row.updatedAt.toISOString() : null,
    };
  });

  return (
    <div>
      <PageHeader
        title="ИИ-требования"
        subtitle="Единые правила, которые подставляются в каждый запрос к ИИ — статьи, темы, новости. AEO / SEO / GEO и соответствие РКН."
      />
      <ArticleTabs />
      <RequirementsEditor items={items} />
    </div>
  );
}
