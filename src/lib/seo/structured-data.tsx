/**
 * Shared JSON-LD (schema.org) builders for Google E-E-A-T.
 *
 * E-E-A-T = Experience, Expertise, Authoritativeness, Trustworthiness. Search
 * and generative engines can only reward these signals if they are expressed in
 * machine-readable structured data, so every article/news page emits ONE linked
 * `@graph` describing:
 *   - the publisher Organization (Authoritativeness/Trust),
 *   - the author as a Person entity with bio, role and profile links (Experience/Expertise),
 *   - the Article/NewsArticle with datePublished AND dateModified (freshness/Trust),
 *   - the original source citation for aggregated news (Trust/transparency),
 *   - breadcrumbs and FAQ.
 *
 * Nodes cross-reference each other by `@id`, so the author's `worksFor` and the
 * article's `publisher`/`author` all resolve to the same entities.
 */
import type { Author, FaqItem } from "@/lib/types";
import { SITE_URL } from "@/lib/site";

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const PUBLISHER_NAME = "Rusability";

function absUrl(u?: string | null): string | undefined {
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u)) return u;
  return `${SITE_URL}${u.startsWith("/") ? "" : "/"}${u}`;
}

/** Normalises a stored Telegram handle/link into a canonical profile URL. */
function telegramUrl(v: string): string {
  const handle = v
    .trim()
    .replace(/^https?:\/\/(t\.me|telegram\.me)\//i, "")
    .replace(/^@/, "");
  return `https://t.me/${handle}`;
}

/** The publisher entity — the authoritative Organization behind all content. */
export function organizationNode() {
  return {
    "@type": "NewsMediaOrganization",
    "@id": ORG_ID,
    name: PUBLISHER_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/brand/rusability-logo-black.png`,
    },
    description:
      "Издание о дизайне, маркетинге, технологиях и продуктах. Пишем для тех, кто создаёт цифровые продукты.",
  };
}

/** Site identity + sitewide search action. */
export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: "Rusability",
    inLanguage: "ru-RU",
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** A content author expressed as an E-E-A-T Person entity. */
export function personNode(author: Author) {
  const url = `${SITE_URL}/authors/${author.username}`;
  const sameAs: string[] = [];
  if (author.socials?.telegram) sameAs.push(telegramUrl(author.socials.telegram));
  if (author.socials?.site) {
    const s = absUrl(author.socials.site);
    if (s) sameAs.push(s);
  }
  const image = absUrl(author.avatar);
  return {
    "@type": "Person",
    "@id": `${url}#person`,
    // Fall back so the name is never absent/"undefined" — some parsers
    // (e.g. Yandex Metrika content analytics) render a missing name literally.
    name: author.name?.trim() || "Редакция Rusability",
    url,
    ...(image ? { image } : {}),
    ...(author.bio ? { description: author.bio } : {}),
    jobTitle: author.elite ? "Elite-автор" : "Автор",
    worksFor: { "@id": ORG_ID },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/**
 * A compact INLINE author for an Article's `author` property.
 *
 * The article must carry the author's `name` inline (not only a bare
 * `{ "@id" }` reference), because some structured-data parsers — notably
 * Yandex Metrika's content analytics — do not dereference `@id` links across
 * the `@graph` and would otherwise read the author name as "undefined". The
 * `@id` is kept so Google still merges this with the full top-level Person.
 */
export function authorInline(person: ReturnType<typeof personNode>) {
  return {
    "@id": person["@id"],
    "@type": person["@type"],
    name: person.name,
    url: person.url,
  };
}

export function breadcrumbNode(items: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function faqNode(faq: FaqItem[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export type ArticleNodeInput = {
  type: "Article" | "NewsArticle";
  /** Canonical page URL. */
  url: string;
  headline: string;
  description: string;
  image?: string | null;
  datePublished: string;
  dateModified?: string;
  section?: string;
  keywords?: string[];
  /**
   * INLINE author object (use `authorInline(personNode(...))`) for a bylined
   * author; omit to attribute to the publisher Organization. Must carry `name`
   * inline — a bare `{ "@id" }` ref makes Metrika read the author as "undefined".
   */
  authorRef?: object;
  /** Original source URL for aggregated news (transparency). */
  isBasedOn?: string | null;
  /** Original source outlet name for aggregated news. */
  sourceName?: string | null;
};

export function articleNode(a: ArticleNodeInput) {
  const image = absUrl(a.image);
  return {
    "@type": a.type,
    headline: a.headline,
    description: a.description,
    ...(image ? { image: [image] } : {}),
    datePublished: a.datePublished,
    dateModified: a.dateModified || a.datePublished,
    inLanguage: "ru-RU",
    ...(a.section ? { articleSection: a.section } : {}),
    ...(a.keywords && a.keywords.length ? { keywords: a.keywords } : {}),
    // Inline (not a bare "@id" ref) so parsers that don't dereference the graph
    // still read the author name; falls back to the publisher Organization.
    author: a.authorRef ?? {
      "@type": "Organization",
      "@id": ORG_ID,
      name: PUBLISHER_NAME,
    },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": a.url },
    url: a.url,
    ...(a.isBasedOn ? { isBasedOn: a.isBasedOn } : {}),
    ...(a.sourceName
      ? { sourceOrganization: { "@type": "Organization", name: a.sourceName } }
      : {}),
  };
}

/** Wraps nodes into a single linked `@graph` document. */
export function buildGraph(nodes: (object | null | undefined)[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter(Boolean),
  };
}

/** Renders a JSON-LD `<script>` tag. Use from a server component. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
