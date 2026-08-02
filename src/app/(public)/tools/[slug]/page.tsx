import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { ToolIcon } from "@/components/tools/tool-icon";
import { ToolRunner } from "@/components/tools/ToolRunner";
import { getTool, TOOLS } from "@/lib/tools/registry";
import { getVisitorId, issueToolToken } from "@/lib/tools/identity";

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

  // Bind a short-lived anti-bot token to this visitor at render time. Reading
  // the visitor cookie opts this route into per-request dynamic rendering.
  const visitorId = await getVisitorId();
  const token = issueToolToken(visitorId);

  return (
    <div className="container-editorial py-8 md:py-12">
      <Link
        href="/tools"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
      >
        <ArrowLeft size={16} /> Все инструменты
      </Link>

      <header className="mt-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
            <ToolIcon name={tool.icon} className="h-6 w-6" />
          </span>
          <h1 className="text-balance font-serif text-3xl font-bold text-[var(--foreground)] md:text-4xl">
            {tool.title}
          </h1>
        </div>
        <p className="mt-3 text-pretty leading-relaxed text-[var(--muted-foreground)]">
          {tool.intro}
        </p>
      </header>

      <div className="mt-10">
        <ToolRunner
          token={token}
          tool={{
            slug: tool.slug,
            title: tool.title,
            intro: tool.intro,
            fields: tool.fields,
            output: tool.output,
          }}
        />
      </div>

      {tool.faq && tool.faq.length > 0 && (
        <section className="mt-14 max-w-3xl">
          <h2 className="font-serif text-2xl font-bold text-[var(--foreground)]">
            Как это помогает
          </h2>
          <div className="mt-5 flex flex-col gap-3">
            {tool.faq.map((item, i) => (
              <details
                key={i}
                className="group rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-[var(--foreground)]">
                  {item.q}
                  <ChevronDown className="h-5 w-5 shrink-0 text-[var(--muted-foreground)] transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-pretty leading-relaxed text-[var(--muted-foreground)]">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {tool.faq && tool.faq.length > 0 && (
        <script
          type="application/ld+json"
          // FAQ structured data — helps AEO/GEO and rich results.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: tool.faq.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />
      )}
    </div>
  );
}
