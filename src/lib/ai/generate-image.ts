import "server-only";
import { generateImage, generateText } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { CONTENT_MODEL, CONTENT_PROVIDER_OPTIONS } from "./model";
import {
  buildImagePrompt,
  pickArtLens,
  AUTHOR_IMAGE_STYLES,
  DEFAULT_IMAGE_STYLE,
  POSITIVE_TAIL,
} from "./author-image-styles";
import { storeWebp } from "@/lib/media/to-webp";
import { recordTextUsage, recordImageUsage } from "./usage";

/**
 * Cover-image generation via the Vercel AI Gateway (Google Imagen).
 *  - `fast`   → imagen-4 fast: cheap, used for bulk backfill of old articles;
 *  - default  → imagen-4: higher fidelity, used for freshly generated articles.
 * Output is always transcoded to WebP and stored on the public Blob store.
 * The article title steers the concrete, topic-relevant subject and is NEVER
 * drawn as text; the rendered <img> alt equals the article title at render.
 */
export const IMAGE_MODEL_FAST = "google/imagen-4.0-fast-generate-001";
export const IMAGE_MODEL_QUALITY = "google/imagen-4.0-generate-001";

export interface GenerateCoverInput {
  authorId: string;
  title: string;
  category: string;
  /** Use the fast/cheap model (bulk backfill). Default false = quality model. */
  fast?: boolean;
}

/**
 * Ask the content model to craft ONE photorealistic, topic-relevant
 * art-direction prompt for this specific article — magazine photo-desk quality
 * that concretely depicts the real subject, never the generic abstract "AI tech"
 * render. Falls back to the deterministic template builder if the call fails.
 */
async function craftImagePrompt(input: GenerateCoverInput): Promise<string> {
  const sig = AUTHOR_IMAGE_STYLES[input.authorId] ?? DEFAULT_IMAGE_STYLE;
  const colour = sig.bw ? "monochrome black and white, rich tonal range" : sig.palette;
  const { lens, mode } = pickArtLens(input.title);

  const modeDirection =
    mode === "real"
      ? "MODE — photorealistic editorial photograph. Write a genuinely PHOTOREALISTIC, believable photograph that clearly shows the REAL subject of THIS specific article — real people, a real place, or the real objects, tools and materials that literally belong to this topic. Natural light, authentic texture and honest colour. This is NOT corporate stock (no offices, suits, handshakes, laptops-as-props) and absolutely NOT an abstract render."
      : "MODE — concrete editorial illustration. Write a confident, gallery-grade illustration that still clearly and recognisably DEPICTS the real subject of THIS article — a quality magazine spot illustration with real, identifiable elements, never an abstract pattern, texture or render.";

  const system = [
    "You are an award-winning magazine photo editor writing a single prompt for an AI image generator to produce an editorial COVER for a website hero.",
    "YOUR #1 JOB: the cover must make a reader instantly recognise WHAT THIS SPECIFIC ARTICLE IS ABOUT. Read the topic, decide the concrete real-world thing it is really about, and depict THAT. Two different articles must never be interchangeable.",
    "The house style is grounded, photorealistic editorial imagery. Follow the MODE and ART LENS you are given EXACTLY.",
    modeDirection,
    "NEVER produce the generic 'AI tech' look: no abstract 3D renders, no glowing orbs or spheres, no floating geometric shapes, no swirling ribbons, no metallic discs, no particle or cosmic backgrounds, no neon sci-fi gradients, no holographic surfaces.",
    "Never depict any diagram, chart, dashboard, gauge, arrow, UI or text of any kind, and never the corny business clichés (handshakes, suits at laptops, lightbulbs, gears, rockets, glowing brains, circuit boards).",
    "Never put the article's literal title or any quoted phrase into the image. Keep it wordless.",
    "This is a WEBSITE HERO ASSET, not a poster or print. The scene itself must occupy 100% of the canvas, with subject, environment, texture, colour and light extending naturally through every corner and beyond all four crop edges.",
    "Reject any concept that places a smaller rectangular artwork, card, print, canvas, photograph or isolated vignette onto a plain backdrop. Avoid broad empty bands at the top or bottom. The result must be immediately crop-ready with visually active outer edges.",
    "Output ONE single English prompt of 65–110 words describing: medium/style, the concrete real subject, immersive edge-to-edge environment, active outer edges, lighting, colour and mood. No preamble, no lists, no quotes — just the prompt sentence(s).",
  ].join("\n");

  const prompt = [
    `Article title (Russian): «${input.title}». Theme area: ${input.category}.`,
    "First silently identify the concrete, real-world subject a reader would expect this article to be about, then art-direct a photograph/illustration of THAT.",
    `ART LENS to follow (photographic treatment only — the subject still comes from the article): ${lens}.`,
    `Colour direction as a SUBTLE grade only, never overriding natural true-to-life colour: ${colour}.`,
    "Write the image prompt now.",
  ].join("\n");

  try {
    const { text, usage } = await generateText({
      model: CONTENT_MODEL,
      providerOptions: CONTENT_PROVIDER_OPTIONS,
      system,
      prompt,
    });
    await recordTextUsage({ workload: "image-prompt", model: CONTENT_MODEL, usage, contentKind: "article" });
    const crafted = text.trim().replace(/^["'\s]+|["'\s]+$/g, "");
    if (crafted.length < 40) return buildImagePrompt(input);
    // Positive reinforcement only. NEVER put "16:9" or any ratio/number/word in
    // the prompt text — the model bakes it in as literal text. The aspectRatio
    // param already controls the shape. Bans are enforced by simply not naming
    // forbidden objects (naming them in the prompt summons them).
    return `${crafted} ${POSITIVE_TAIL}`;
  } catch {
    return buildImagePrompt(input);
  }
}

/**
 * Generate one article cover. Returns the public WebP URL, or null on any
 * failure (e.g. AI Gateway out of credits) so callers degrade gracefully.
 */
export async function generateArticleCover(input: GenerateCoverInput): Promise<string | null> {
  // Craft a bespoke, photorealistic, topic-relevant art-direction prompt from
  // the topic (LLM), with the deterministic template as a safe fallback.
  const prompt = await craftImagePrompt(input);
  const modelId = input.fast ? IMAGE_MODEL_FAST : IMAGE_MODEL_QUALITY;

  try {
    const { image } = await generateImage({
      model: gateway.image(modelId),
      prompt,
      aspectRatio: "16:9",
      providerOptions: {
        // NOTE: Imagen 4 dropped `negativePrompt` support, so bans are enforced
        // purely by NOT naming forbidden objects in the positive prompt.
        google: { personGeneration: "allow_adult", safetySetting: "block_only_high" },
      },
    });
    const bytes = image.uint8Array;
    if (!bytes || bytes.length === 0) return null;
    // Record the image spend only once we have a real image back.
    await recordImageUsage({ workload: "article-cover", model: modelId, images: 1, contentKind: "article" });
    // Prompt compliance is not trusted: Imagen sometimes returns a smaller
    // artwork baked onto a solid (white OR black OR coloured) canvas. Strip any
    // detected matte and force an exact 16:9 crop before the cover reaches Blob,
    // so every stored hero is structurally full-bleed with no frame or bars.
    return await storeWebp(bytes, {
      prefix: "covers",
      name: input.title,
      normalizeCover: true,
    });
  } catch (err) {
    console.log("[v0] generateArticleCover failed:", err instanceof Error ? err.message : String(err));
    return null;
  }
}
