import { PageHeader } from "@/components/admin/ui";
import { getSetting } from "@/lib/data/settings";
import { SeoWorkspace } from "./SeoWorkspace";
import type { SeoMeta, RobotsSettings } from "./actions";

export const metadata = { title: "SEO / AEO / GEO — Rusability" };
export const dynamic = "force-dynamic";

const DEFAULT_META: SeoMeta = {
  title: "Rusability — деловое медиа о маркетинге, бизнесе и технологиях",
  description:
    "Аналитика, тренды и практика цифрового маркетинга, бизнеса и технологий. Экспертные статьи и новости для профессионалов.",
  ogImage: "/brand/og-default.png",
  keywords: "маркетинг, бизнес, технологии, SEO, аналитика",
};
const DEFAULT_ROBOTS: RobotsSettings = { index: true, follow: true, ai: true, sitemap: true };

export default async function AdminSeoPage() {
  const [meta, robots] = await Promise.all([
    getSetting<SeoMeta>("seo_meta", DEFAULT_META),
    getSetting<RobotsSettings>("seo_robots", DEFAULT_ROBOTS),
  ]);

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="SEO / AEO / GEO"
        subtitle="Мета-теги, карта сайта, robots.txt, редиректы и оптимизация под ИИ-поиск."
      />
      <SeoWorkspace initialMeta={meta} initialRobots={robots} />
    </div>
  );
}
