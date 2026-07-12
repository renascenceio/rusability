import type { ReactNode } from "react";

export type LegalSection = {
  heading: string;
  body: ReactNode;
};

/** Shared editorial layout for legal/policy documents. */
export function LegalDoc({
  eyebrow,
  title,
  intro,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <div className="container-editorial py-10 md:py-16">
      <div className="mx-auto max-w-3xl">
        <header className="border-b border-[var(--border)] pb-8">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
            {eyebrow}
          </span>
          <h1 className="mt-2 text-balance font-serif text-4xl font-bold text-[var(--foreground)] md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-[var(--muted-foreground)]">
            {intro}
          </p>
          <p className="mt-4 text-sm text-[var(--faint)]">Последнее обновление: {updated}</p>
        </header>

        <div className="mt-10 flex flex-col gap-10">
          {sections.map((s, i) => (
            <section key={s.heading} aria-labelledby={`sec-${i}`}>
              <h2
                id={`sec-${i}`}
                className="font-serif text-xl font-bold text-[var(--foreground)] md:text-2xl"
              >
                {`${i + 1}. ${s.heading}`}
              </h2>
              <div className="mt-3 flex flex-col gap-3 text-[15px] leading-relaxed text-[var(--muted-foreground)] [&_a]:font-medium [&_a]:text-[var(--primary)] [&_a:hover]:underline [&_li]:ml-1 [&_strong]:text-[var(--foreground)] [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5 [&_ul_li]:list-disc">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
