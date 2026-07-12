import { PageHeader } from "@/components/admin/ui";
import { SeoWorkspace } from "./SeoWorkspace";

export const metadata = { title: "SEO / AEO / GEO — Rusability" };

export default function AdminSeoPage() {
  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="SEO / AEO / GEO"
        subtitle="Мета-теги, карта сайта, robots.txt, редиректы и оптимизация под ИИ-поиск."
      />
      <SeoWorkspace />
    </div>
  );
}
