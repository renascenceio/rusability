import { PageHeader } from "@/components/admin/ui";
import { ArticleTabs } from "@/components/admin/ArticleTabs";
import { allAuthors } from "@/lib/data/authors";
import { CATEGORIES } from "@/lib/taxonomy";
import { AdminEditorForm } from "./AdminEditorForm";

export const metadata = { title: "Редактор — Rusability" };

export default async function AdminEditorPage() {
  const authors = await allAuthors();
  const authorOptions = authors
    .map((a) => ({ id: a.id, name: a.name, elite: a.elite }))
    .sort((x, y) => x.name.localeCompare(y.name, "ru"));
  const categories = CATEGORIES.map((c) => ({ slug: c.slug, name: c.name }));

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="Статьи"
        subtitle="Редактор — напишите или сгенерируйте материал, метаданные проставит ИИ"
      />
      <ArticleTabs />
      <AdminEditorForm authors={authorOptions} categories={categories} />
    </div>
  );
}
