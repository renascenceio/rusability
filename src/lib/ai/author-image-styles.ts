/*
  Distinctive cover-art direction per AI author. Each author has a recognisable
  visual signature so their articles look consistent and unlike anyone else's.
  Some are abstract/conceptual, some feature people, several are black & white.

  Hard rules baked into every prompt:
    - absolutely NO text, letters, numbers, words, captions or watermarks;
    - editorial magazine-cover quality, 16:9, tasteful and modern;
    - the alt text of the rendered image always equals the article title.
*/

export type AuthorImageStyle = {
  /** One-line art-direction summary (medium, subject, mood). */
  style: string;
  /** Colour direction (ignored visually when `bw` is true). */
  palette: string;
  /** Render in black & white / monochrome. */
  bw: boolean;
};

export const AUTHOR_IMAGE_STYLES: Record<string, AuthorImageStyle> = {
  "ai-startup-strategist": {
    style:
      "bold isometric 3D vector illustration of abstract growth structures, ascending platforms and geometric arrows, clean studio lighting, subtle depth of field",
    palette: "electric indigo and cobalt blue on soft off-white, single warm accent",
    bw: false,
  },
  "ai-pr-architect": {
    style:
      "elegant cinematic photograph of a confident spokesperson at a lectern in soft rim light, shallow depth of field, poised and diplomatic mood",
    palette: "warm neutral tones, muted brass highlights",
    bw: true,
  },
  "ai-performance-marketer": {
    style:
      "sleek data-driven abstract composition of glowing funnels, flowing particle streams and dashboard geometry, macro tech aesthetic",
    palette: "deep navy background with cyan and lime signal accents",
    bw: false,
  },
  "ai-brand-advertiser": {
    style:
      "artful still-life collage of brand objects, bold shapes and layered paper cut-outs, playful Bauhaus-inspired composition",
    palette: "terracotta, cream and ink-blue, high contrast",
    bw: false,
  },
  "ai-cx-designer": {
    style:
      "warm lifestyle photograph of hands interacting with a friendly service touchpoint, human-centred, soft natural window light",
    palette: "gentle peach, sage and warm white",
    bw: false,
  },
  "ai-ex-lead": {
    style:
      "candid documentary photograph of a diverse team collaborating in a bright modern office, authentic human connection, natural light",
    palette: "warm daylight, muted earthy tones",
    bw: true,
  },
  "ai-seo-technologist": {
    style:
      "intricate technical wireframe illustration of interconnected nodes, site-architecture graphs and crawling paths, blueprint precision",
    palette: "graphite and electric teal on pale grid background",
    bw: false,
  },
  "ai-geo-answer": {
    style:
      "futuristic conceptual render of a glowing neural answer-graph, floating structured cards and light beams converging, sci-fi editorial",
    palette: "deep space blue with luminous violet-to-azure glow",
    bw: false,
  },
  "ai-data-analyst": {
    style:
      "minimal abstract sculpture of layered translucent charts, cohort bars and probability curves in soft 3D clay render, calm studio set",
    palette: "slate blue, chalk white and a single coral accent",
    bw: false,
  },
  "ai-ux-researcher": {
    style:
      "clean flat-lay photograph of usability research artefacts, sticky notes, wireframe sketches and a device, top-down soft shadow",
    palette: "cool neutrals with a friendly blue accent",
    bw: false,
  },
  "ai-design-lead": {
    style:
      "striking modernist geometric composition exploring typography-free grid systems, negative space and precise shapes, gallery-grade",
    palette: "monochrome greys with one decisive red plane",
    bw: true,
  },
  "ai-smm-strategist": {
    style:
      "vibrant dynamic collage of floating social interface bubbles, motion trails and engagement sparks, energetic pop aesthetic",
    palette: "magenta, azure and sunny yellow on clean white",
    bw: false,
  },
  "ai-media-editor": {
    style:
      "atmospheric editorial photograph evoking a modern newsroom, layered newspapers and screens softly out of focus, thoughtful mood",
    palette: "rich charcoal and warm amber light",
    bw: true,
  },
  "ai-tech-writer": {
    style:
      "polished product-render of abstract cloud infrastructure, floating servers, cables and modular blocks, crisp studio reflections",
    palette: "cool steel blue with neon-mint highlights",
    bw: false,
  },
  "ai-ai-analyst": {
    style:
      "refined conceptual render of a translucent brain-like neural lattice intertwined with organic forms, restrained sci-fi elegance",
    palette: "deep indigo with soft iridescent teal glow",
    bw: false,
  },
  "ai-ecommerce-expert": {
    style:
      "crisp commercial still-life of floating parcels, shopping carts and conversion geometry in a bright product-photography set",
    palette: "coral, teal and clean white with soft shadows",
    bw: false,
  },
  "ai-sales-b2b": {
    style:
      "confident cinematic photograph of a handshake and negotiation moment across a table, decisive corporate mood, directional light",
    palette: "deep espresso and steel tones",
    bw: true,
  },
  "ai-content-strategist": {
    style:
      "elegant editorial flat-lay of a content-funnel storyboard, layered paper, ink pen and geometric flow arrows, refined craft feel",
    palette: "ink blue, kraft paper beige and a single gold accent",
    bw: false,
  },
  "ai-leadership-hr": {
    style:
      "quiet reflective portrait-style photograph of a leader by a window, contemplative and mature, soft chiaroscuro lighting",
    palette: "warm neutral shadows, gentle daylight",
    bw: true,
  },
  "ai-fintech-economist": {
    style:
      "sophisticated abstract render of floating financial geometry, coins as clean discs, flowing market ribbons and grids, precise",
    palette: "deep green and graphite with a metallic gold accent",
    bw: false,
  },
  "ai-behavioral-economist": {
    style:
      "clever conceptual illustration of decision-making, forking paths, tilted scales and choice-architecture shapes, thoughtful surrealism",
    palette: "muted mustard, dusty blue and cream, editorial flat art",
    bw: false,
  },
  "ai-consumer-psychologist": {
    style:
      "intriguing conceptual composition of perception and value, price tags as abstract weights, optical balance, minimalist surreal set",
    palette: "soft blush, deep plum and neutral sand",
    bw: false,
  },
  "ai-cx-strategist": {
    style:
      "premium abstract render connecting customer-journey ribbons to a rising revenue form, strategic and airy, boardroom elegance",
    palette: "royal blue, ivory and a warm champagne accent",
    bw: false,
  },
  "ai-startup-founder": {
    style:
      "raw authentic documentary photograph of an early-stage founder's workspace at night, whiteboard sketches and laptop glow, gritty real",
    palette: "warm tungsten light against dark room",
    bw: true,
  },
};

export const DEFAULT_IMAGE_STYLE: AuthorImageStyle = {
  style:
    "clean modern editorial abstract illustration with confident geometry and depth, magazine-cover quality",
  palette: "indigo-blue and warm neutrals on off-white",
  bw: false,
};

const CATEGORY_MOTIF: Record<string, string> = {
  startups: "entrepreneurship and momentum",
  pr: "reputation and public communication",
  marketing: "marketing and audience growth",
  cx: "customer experience",
  business: "business strategy",
  seo: "search visibility",
  analytics: "data and measurement",
  ux: "user experience and interface craft",
  design: "visual design systems",
  smm: "social media",
  media: "digital media",
  tech: "technology and infrastructure",
  ai: "artificial intelligence",
  ecommerce: "online commerce",
  behavioral: "human decision-making",
  science: "research and discovery",
};

/**
 * Compose the final image prompt for one article. The article title/theme is
 * used only to steer the abstract subject — the title text must NEVER be drawn.
 */
export function buildImagePrompt(args: {
  authorId: string;
  title: string;
  category: string;
}): string {
  const s = AUTHOR_IMAGE_STYLES[args.authorId] ?? DEFAULT_IMAGE_STYLE;
  const motif = CATEGORY_MOTIF[args.category] ?? "modern business";
  const colour = s.bw
    ? "monochrome black and white, rich tonal range, no colour"
    : s.palette;

  return [
    `Editorial magazine cover illustration on the theme of ${motif}.`,
    `Loosely inspired by the idea: "${args.title}" — but interpret it visually and conceptually only.`,
    `Art direction: ${s.style}.`,
    `Colour: ${colour}.`,
    `16:9 widescreen, high detail, professional, tasteful, uncluttered composition with clear focal point.`,
    `ABSOLUTELY NO text, no letters, no numbers, no words, no captions, no logos, no watermarks, no signage anywhere in the image.`,
  ].join(" ");
}
