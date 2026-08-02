import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ToolIcon } from "@/components/tools/tool-icon";
import { ToolRunner } from "@/components/tools/ToolRunner";
import { getTool, TOOLS } from "@/lib/tools/registry";

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return { title: "Инструмент не найден" };
  return {
    title: tool.title,
    description: tool.description,
    keywords: tool.keywords,
    alternates: { canonical: `/tools/${tool.slug}` },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  return (
    <div className="container-editorial py-8 md:py-12">
      <Link
        href="/tools"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
      >
        <ArrowLeft size={16} /> Все инструменты
      </Link>

      <header className="mt-6 max-w-2xl">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
          <ToolIcon name={tool.icon} className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-balance font-serif text-3xl font-bold text-[var(--foreground)] md:text-4xl">
          {tool.title}
        </h1>
        <p className="mt-3 text-pretty leading-relaxed text-[var(--muted-foreground)]">
          {tool.intro}
        </p>
      </header>

      <div className="mt-10">
        <ToolRunner
          tool={{
            slug: tool.slug,
            title: tool.title,
            intro: tool.intro,
            fields: tool.fields,
            output: tool.output,
          }}
        />
      </div>
    </div>
  );
}
