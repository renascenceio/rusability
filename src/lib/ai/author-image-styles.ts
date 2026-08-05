/*
  Cover-art direction for AI authors.

  The house aesthetic is GROUNDED, PHOTOREALISTIC editorial imagery: every cover
  should make a reader instantly recognise what the article is about. Think a
  quality magazine photo desk, NOT an "AI tech" render. The subject is driven by
  the ARTICLE TOPIC — a real person, place, object, tool or material that belongs
  to it — and each article is seeded to one photographic "lens" so the feed stays
  varied (mostly real photography with a little editorial illustration) instead of
  every article by one author looking like the same abstract render.

  HARD RULES baked into every prompt (all modes):
    - the image must CONCRETELY depict the real subject of the article;
    - NO abstract 3D renders, glowing orbs/spheres, floating geometric shapes,
      swirling ribbons, metallic discs, particle/cosmic or neon sci-fi backgrounds;
    - NO text, letters, numbers, words, captions, labels, logos or watermarks;
    - NO charts, graphs, diagrams, dashboards, infographics, UI, gauges or arrows;
    - NO corny corporate stock (handshakes, suits at laptops, lightbulbs, gears,
      rocket ships, glowing brains, circuit boards, generic "growth" arrows);
    - editorial magazine quality, 16:9, tasteful, a single clear focal point.
*/

export type AuthorImageStyle = {
  /** One-line artistic signature — the author's recognisable visual voice. */
  style: string;
  /** Colour direction (ignored visually when `bw` is true). */
  palette: string;
  /** Render in black & white / monochrome. */
  bw: boolean;
};

/** Where a lens sits on the realism↔illustration spectrum. */
export type LensMode = "real" | "painterly";

/**
 * A rotating pool of photographic "lenses". Each describes the photographic
 * TREATMENT only — the SUBJECT always comes from the article topic. One lens is
 * chosen per article (seeded by title + author) so the feed stays varied. The
 * pool is dominated by real photography, with a little concrete editorial
 * illustration; there is deliberately NO dreamy/abstract/3D-render mode, because
 * those produced interchangeable, topic-agnostic covers.
 */
export const ART_LENSES: { lens: string; mode: LensMode }[] = [
  // --- real photography (dominant) -------------------------------------
  {
    mode: "real",
    lens: "photorealistic documentary photograph of a real person genuinely engaged in the actual activity the topic is about, natural available light, candid reportage realism, shallow depth of field, true-to-life colour and authentic texture",
  },
  {
    mode: "real",
    lens: "photorealistic still life of the real, tactile objects, tools or materials that literally belong to the topic, arranged on a real surface, soft directional daylight from a window, honest shadows and crisp true-to-life detail",
  },
  {
    mode: "real",
    lens: "atmospheric real-world location photograph of an authentic place where this topic actually happens, shot like reportage with natural light, candid, specific and true to life",
  },
  {
    mode: "real",
    lens: "photorealistic close-up of real human hands working with the real tools or materials of the topic, tactile texture, natural light, honest colour, shallow depth of field",
  },
  {
    mode: "real",
    lens: "cinematic documentary photograph capturing a believable real moment directly connected to the topic, naturalistic colour grading, believable depth, gentle film grain, quietly human",
  },
  {
    mode: "real",
    lens: "clean, modern real-world photograph of the actual setting or subject of the topic in a bright, characterful space, honest natural light and specific real detail — emphatically not generic corporate stock",
  },
  // --- concrete editorial illustration (minority) ----------------------
  {
    mode: "painterly",
    lens: "bold editorial spot illustration that clearly and literally depicts the topic with recognisable real-world elements, crisp confident shapes and a limited palette, like a quality magazine illustration — never an abstract pattern, texture or render",
  },
  {
    mode: "painterly",
    lens: "warm painterly gouache editorial illustration concretely portraying a real, recognisable scene from the topic, human, specific and gallery-grade",
  },
];

export const AUTHOR_IMAGE_STYLES: Record<string, AuthorImageStyle> = {
  "ai-startup-strategist": {
    style:
      "abstract sculptural forms suggesting momentum and ascent — sweeping ribbons and balanced monoliths floating in a dreamlike studio void",
    palette: "electric indigo and cobalt with a single warm ember accent",
    bw: false,
  },
  "ai-pr-architect": {
    style:
      "poetic cinematic portrait-mood scene evoking trust and voice, a lone silhouette in soft volumetric light through painterly haze",
    palette: "warm neutral tones, brass highlights",
    bw: true,
  },
  "ai-performance-marketer": {
    style:
      "mesmerising macro of flowing luminous light-trails and liquid colour in motion, abstract and hyperreal",
    palette: "deep navy with cyan and lime luminescence",
    bw: false,
  },
  "ai-brand-advertiser": {
    style:
      "bold flat graphic collage in fashion-poster spirit, crisp outlines and clashing high-saturation shapes, no gradients",
    palette: "terracotta, cream and ink-blue, high contrast",
    bw: false,
  },
  "ai-cx-designer": {
    style:
      "warm dreamy magical-realism vignette of a single gentle human gesture, soft window light, painterly and tender",
    palette: "gentle peach, sage and warm white",
    bw: false,
  },
  "ai-ex-lead": {
    style:
      "candid painterly documentary warmth of human connection, natural light, quietly authentic",
    palette: "warm daylight, muted earthy tones",
    bw: true,
  },
  "ai-seo-technologist": {
    style:
      "intricate ultra-macro of branching organic structures (leaf veins, mycelium, coral) as a metaphor for discovery, hyperreal clarity",
    palette: "graphite and electric teal on pale ground",
    bw: false,
  },
  "ai-geo-answer": {
    style:
      "ethereal surreal constellation of floating luminous orbs converging in a soft void, blue-hour magical realism",
    palette: "deep space blue with luminous violet-to-azure glow",
    bw: false,
  },
  "ai-data-analyst": {
    style:
      "minimal abstract composition of layered translucent glass planes and soft light refraction, calm clay-render studio",
    palette: "slate blue, chalk white and a single coral accent",
    bw: false,
  },
  "ai-ux-researcher": {
    style:
      "playful tactile paper-craft still life of folded shapes and soft cast shadow, top-down, warm and inviting",
    palette: "cool neutrals with a friendly blue accent",
    bw: false,
  },
  "ai-design-lead": {
    style:
      "gallery-grade modernist colour-field abstraction, generous negative space and one decisive plane, museum-quiet",
    palette: "monochrome greys with one decisive red plane",
    bw: true,
  },
  "ai-smm-strategist": {
    style:
      "vibrant pop-art abstraction of floating iridescent bubbles and swirling motion trails, energetic and joyful",
    palette: "magenta, azure and sunny yellow",
    bw: false,
  },
  "ai-media-editor": {
    style:
      "atmospheric painterly abstraction evoking a thoughtful newsroom mood, layered light, shadow and soft focus",
    palette: "rich charcoal and warm amber light",
    bw: true,
  },
  "ai-tech-writer": {
    style:
      "dreamy cloud-scape surrealism of monolithic soft forms floating in luminous mist, hyperreal and serene",
    palette: "cool steel blue with neon-mint highlights",
    bw: false,
  },
  "ai-ai-analyst": {
    style:
      "surreal organic-meets-crystalline lattice intertwined with botanical forms, restrained iridescent elegance",
    palette: "deep indigo with soft iridescent teal glow",
    bw: false,
  },
  "ai-ecommerce-expert": {
    style:
      "playful surreal still life of everyday objects levitating in a bright pastel dreamscape, crisp product light",
    palette: "coral, teal and clean white with soft shadow",
    bw: false,
  },
  "ai-sales-b2b": {
    style:
      "cinematic painterly moment of momentum and quiet resolve rendered abstractly, decisive directional light",
    palette: "deep espresso and steel tones",
    bw: true,
  },
  "ai-content-strategist": {
    style:
      "elegant paper-craft flat-lay of flowing folded forms and ribbon, refined craft feel, one gold accent",
    palette: "ink blue, kraft beige and a single gold accent",
    bw: false,
  },
  "ai-leadership-hr": {
    style:
      "quiet contemplative painterly portrait mood, soft chiaroscuro by a window, mature and reflective",
    palette: "warm neutral shadows, gentle daylight",
    bw: true,
  },
  "ai-fintech-economist": {
    style:
      "sophisticated abstract of floating metallic discs and flowing ribbons in a dreamy void, precise and calm",
    palette: "deep green and graphite with a metallic gold accent",
    bw: false,
  },
  "ai-behavioral-economist": {
    style:
      "clever surreal composition of forking paths and gently tilted balance as a metaphor for choice, editorial flat art",
    palette: "muted mustard, dusty blue and cream",
    bw: false,
  },
  "ai-consumer-psychologist": {
    style:
      "intriguing surreal optical composition of perception and balance, minimalist dreamlike set",
    palette: "soft blush, deep plum and neutral sand",
    bw: false,
  },
  "ai-cx-strategist": {
    style:
      "airy abstract of flowing ribbons rising and connecting into a graceful form, boardroom-elegant surrealism",
    palette: "royal blue, ivory and a warm champagne accent",
    bw: false,
  },
  "ai-startup-founder": {
    style:
      "raw painterly nocturne of a creative workspace glow at night, gritty, intimate and cinematic",
    palette: "warm tungsten light against a dark room",
    bw: true,
  },
};

export const DEFAULT_IMAGE_STYLE: AuthorImageStyle = {
  style:
    "confident abstract editorial artwork with dreamy depth and painterly light, magazine-cover quality",
  palette: "indigo-blue and warm neutrals on soft off-white",
  bw: false,
};

const CATEGORY_MOTIF: Record<string, string> = {
  startups: "entrepreneurship and momentum",
  pr: "reputation and public communication",
  marketing: "marketing and audience growth",
  cx: "customer experience",
  business: "business strategy",
  seo: "search visibility and discovery",
  analytics: "data and measurement",
  ux: "user experience and interface craft",
  design: "visual design and form",
  smm: "social media energy",
  media: "digital media",
  tech: "technology and infrastructure",
  ai: "artificial intelligence",
  ecommerce: "online commerce",
  behavioral: "human decision-making",
  science: "research and discovery",
};

/** Tiny deterministic string hash → non-negative int (for seeded lens choice). */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Seeded art-lens choice — stable per article, so a given title always gets the
 * same lens while the corpus as a whole mixes realism with abstraction. Shared
 * by both the LLM prompt-writer and the deterministic fallback so they agree.
 */
export function pickArtLens(seed: string): { lens: string; mode: LensMode } {
  return ART_LENSES[hash(seed) % ART_LENSES.length];
}

/**
 * Bare comma-separated terms for the image model's dedicated `negativePrompt`
 * parameter. IMPORTANT: banned objects must ONLY live here — naming them in the
 * positive prompt actually makes the model draw them.
 */
export const NEGATIVE_TERMS =
  "abstract 3d render, glowing orb, glowing sphere, floating geometric shapes, swirling ribbons, " +
  "metallic discs, particle cloud, cosmic background, nebula, neon sci-fi gradient, holographic, futuristic render, " +
  "text, letters, words, numbers, captions, labels, logos, watermark, signage, typography, UI, " +
  "chart, graph, diagram, dashboard, infographic, gauge, data grid, arrows, " +
  "businessman, business people, suit and tie, office worker, handshake, laptop, computer screen, " +
  "lightbulb, gears, cogs, rocket, rocket ship, spaceship, brain, circuit board, network nodes, " +
  "corporate stock photo, clip art, stock illustration, cliché, corny, cheesy, " +
  "white border, white margins, frame, framed, letterbox, pillarbox, empty background bars, matte border, passe-partout";

/**
 * A short POSITIVE reinforcement (safe to include in the prompt) that steers
 * toward the desired aesthetic without naming any banned object.
 */
export const POSITIVE_TAIL =
  "True to life and immediately legible: real, recognisable, tangible subject matter with authentic materials, natural light and honest colour — a genuine editorial photograph (or a concrete illustration only when an illustration is specified). " +
  "The subject clearly conveys what the article is about. " +
  "Completely wordless and text-free, with one clear focal point and rich real-world detail distributed across the full canvas. " +
  "Compose this immersive and edge-to-edge, never as a poster, print, card or artwork placed on a plain background. " +
  "Every corner and every outermost pixel must contain a natural continuation of the real scene; foreground, texture, colour and light must visibly continue beyond all four crop edges. " +
  "The scene occupies 100% of the widescreen canvas and is immediately crop-ready for a website hero without padding or cleanup.";

/**
 * Deterministic art-direction prompt for one article. Combines a seeded art
 * lens + the author's visual signature + the topic motif + hard bans. Used as a
 * fallback when the LLM prompt-writer isn't available.
 */
export function buildImagePrompt(args: {
  authorId: string;
  title: string;
  category: string;
}): string {
  const s = AUTHOR_IMAGE_STYLES[args.authorId] ?? DEFAULT_IMAGE_STYLE;
  const motif = CATEGORY_MOTIF[args.category] ?? "modern business";
  const { lens, mode } = pickArtLens(args.title);
  const colour = s.bw ? "monochrome black and white, rich tonal range, no colour" : s.palette;

  const framing =
    mode === "real"
      ? `Photorealistic, true-to-life editorial photograph that concretely depicts the real subject of an article about ${motif} — authentic and believable, natural light; NOT corporate stock (no offices, suits, handshakes, laptops or devices).`
      : `Concrete editorial illustration that clearly and recognisably depicts the real subject of an article about ${motif}, gallery-grade — never an abstract pattern or render.`;

  // The author signature is deliberately NOT used as the composition (it is
  // abstract and made every cover by one author look identical); only the
  // palette is folded in, as a subtle grade that must not override true colour.
  const lines = [
    framing,
    `Art lens: ${lens}.`,
    `Use this colour direction only as a subtle grade, keeping colour natural and true to life: ${colour}.`,
    `Widescreen composition, high detail, tasteful.`,
    POSITIVE_TAIL,
  ];
  return lines.join(" ");
}
