/*
  Cover-art direction for AI authors.

  The house aesthetic is ARTSY, DREAMY and ABSTRACT — closer to a creative-agency
  art director (Ogilvy / Leo Burnett) or a modern painter than to stock business
  photography. Covers should feel like editorial magazine art: cinematic, painterly,
  surreal, macro, hyperreal — never literal.

  HARD RULES baked into every prompt:
    - NO text, letters, numbers, words, captions, labels, logos or watermarks;
    - NO charts, graphs, diagrams, dashboards, infographics, UI, gauges or arrows;
    - NO corny business clichés (handshakes, suits at laptops, lightbulbs, gears,
      rocket ships, glowing brains-as-circuit-boards, generic "growth" arrows);
    - editorial magazine-cover quality, 16:9, tasteful, a single clear focal point.
*/

export type AuthorImageStyle = {
  /** One-line artistic signature — the author's recognisable visual voice. */
  style: string;
  /** Colour direction (ignored visually when `bw` is true). */
  palette: string;
  /** Render in black & white / monochrome. */
  bw: boolean;
};

/**
 * A rotating pool of art-direction "lenses" inspired by striking, non-obvious
 * photographic and illustrative styles. One is chosen per article (seeded by
 * the title) so covers stay varied and never settle into a corporate template.
 */
export const ART_LENSES: string[] = [
  "extreme macro photograph with breathtaking natural iridescence (soap-film swirls, butterfly-wing scales, oil-on-water spectra), very shallow depth of field, painterly abstraction of colour and light",
  "dreamy surreal magical-realism scene with a single impossible element (levitating object, floating room, endless field), soft luminous haze, muted pastel palette, poetic and serene",
  "bold flat graphic illustration in the spirit of a contemporary fashion poster — crisp outlines, completely flat high-saturation colour shapes, no gradients, confident and playful",
  "strict nadir (top-down) aerial abstraction of a vast patterned landscape (salt ponds, terraced fields, tidal flats), intense unnatural colour blocks reading as pure geometric art",
  "cinematic photorealistic film still with nostalgic warmth, shallow depth of field, soft grain, evocative and quietly emotional lighting",
  "retro-futuristic poster artwork with bold colour blocking, sweeping arches and dramatic sunset gradients, sleek and optimistic",
  "ukiyo-e / Japanese woodblock-inspired stylisation with bold graphic outlines, flat harmonious colour planes and subtle texture, elegant and decorative",
  "whimsical textured illustration or playful pixel-art vignette, super-saturated joyful colours, bouncy hand-drawn energy, charming and surreal",
  "ethereal blue-hour photograph of an enchanted natural scene (luminous orbs, glowing flora, misty orchard), soft cool glow, magical and inspiring",
  "hyperreal paper-craft / origami still life staged in a sunlit space, delicate folded forms catching soft light, joyful and tactile",
  "painterly homage to a modern master — Rothko-like floating colour fields, Hockney pool light, or Kandinsky-esque abstract rhythm — gallery-grade and emotive",
  "ultra-macro study of an organic natural structure (leaf veins, coral, mineral crystals, feather barbs) as pure abstract pattern, hyperreal clarity",
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
 * Bare comma-separated terms for the image model's dedicated `negativePrompt`
 * parameter. IMPORTANT: banned objects must ONLY live here — naming them in the
 * positive prompt actually makes the model draw them.
 */
export const NEGATIVE_TERMS =
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
  "Purely visual, symbolic and artful — convey the idea through imagery, colour, texture, light and metaphor only. " +
  "Completely wordless and text-free. A single clear focal point with generous negative space, gallery-grade and inspiring. " +
  "Full-bleed edge-to-edge composition that completely fills the entire widescreen frame — the artwork must extend all the way to every edge with NO white borders, NO margins, NO frame, NO letterboxing and NO empty background bars; the scene bleeds off all four sides.";

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
  const lens = ART_LENSES[hash(args.title) % ART_LENSES.length];
  const colour = s.bw ? "monochrome black and white, rich tonal range, no colour" : s.palette;

  return [
    `Wordless, artsy editorial magazine-cover artwork, abstract and dreamy, loosely evoking the theme of ${motif}.`,
    `Art lens: ${lens}.`,
    `Author's visual signature: ${s.style}.`,
    `Colour: ${colour}.`,
    `Widescreen composition, high detail, tasteful.`,
    POSITIVE_TAIL,
  ].join(" ");
}
