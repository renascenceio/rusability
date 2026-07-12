import "server-only";
import { generateImage, generateText } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { CONTENT_MODEL } from "./model";
import {
  buildImagePrompt,
  AUTHOR_IMAGE_STYLES,
  DEFAULT_IMAGE_STYLE,
  NEGATIVE_CLAUSE,
} from "./author-image-styles";
import { storeWebp } from "@/lib/media/to-webp";

/**
 * Cover-image generation via the Vercel AI Gateway (Google Imagen).
 *  - `fast`   → imagen-4 fast: cheap, used for bulk backfill of old articles;
 *  - default  → imagen-4: higher fidelity, used for freshly generated articles.
 * Output is always transcoded to WebP and stored on the public Blob store.
 * The article title is used only to steer the abstract subject and is NEVER
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
 * Ask the content model to craft ONE vivid, abstract art-direction prompt for
 * this specific article — creative-agency quality, dreamy and artful, never a
 * literal business scene, chart or piece of text. Falls back to the
 * deterministic template builder if the model call fails.
 */
async function craftImagePrompt(input: GenerateCoverInput): Promise<string> {
  const sig = AUTHOR_IMAGE_STYLES[input.authorId] ?? DEFAULT_IMAGE_STYLE;
  const colour = sig.bw ? "monochrome black and white, rich tonal range" : sig.palette;

  const system = [
    "You are an award-winning creative-agency art director (think Ogilvy, Leo Burnett) writing a single prompt for an AI image generator to produce an editorial magazine COVER.",
    "House aesthetic: ARTSY, DREAMY, ABSTRACT — cinematic, painterly, surreal, macro or hyperreal, or a bold flat graphic illustration. Draw on the language of fine-art photography and modern painters. Walk AWAY from the obvious, literal image a person would first expect.",
    "It must be visually stunning, vibrant and inspiring — never corny, basic or corporate.",
    "STRICTLY FORBIDDEN: any text/letters/numbers/words; charts, graphs, diagrams, dashboards, infographics, gauges, arrows; business clichés (handshakes, suits at laptops, lightbulbs, gears, rocket ships, brain-circuit imagery); generic stock-photo looks.",
    "Steer the subject only by the MOOD and METAPHOR of the topic — keep it symbolic and abstract. Do NOT put the article's literal title or any quoted phrase into the image or the prompt.",
    "Output ONE single English prompt of 60–110 words describing: medium/style, the abstract subject, composition, lighting, colour palette and mood. No preamble, no lists, no quotes — just the prompt sentence(s).",
  ].join("\n");

  const prompt = [
    `Article topic (Russian): «${input.title}». Theme area: ${input.category}.`,
    `Lean toward this author's visual signature: ${sig.style}.`,
    `Preferred colour direction: ${colour}.`,
    "Write the image prompt now.",
  ].join("\n");

  try {
    const { text } = await generateText({ model: CONTENT_MODEL, system, prompt });
    const crafted = text.trim().replace(/^["'\s]+|["'\s]+$/g, "");
    if (crafted.length < 40) return buildImagePrompt(input);
    // Always re-assert the hard bans regardless of what the model returned.
    return `${crafted} 16:9 widescreen, single clear focal point, generous negative space. ${NEGATIVE_CLAUSE}`;
  } catch {
    return buildImagePrompt(input);
  }
}

/**
 * Generate one article cover. Returns the public WebP URL, or null on any
 * failure (e.g. AI Gateway out of credits) so callers degrade gracefully.
 */
export async function generateArticleCover(input: GenerateCoverInput): Promise<string | null> {
  const prompt = buildImagePrompt({
    authorId: input.authorId,
    title: input.title,
    category: input.category,
  });
  const modelId = input.fast ? IMAGE_MODEL_FAST : IMAGE_MODEL_QUALITY;

  try {
    const { image } = await generateImage({
      model: gateway.image(modelId),
      prompt,
      aspectRatio: "16:9",
      providerOptions: {
        google: { personGeneration: "allow_adult", safetySetting: "block_only_high" },
      },
    });
    const bytes = image.uint8Array;
    if (!bytes || bytes.length === 0) return null;
    return await storeWebp(bytes, { prefix: "covers", name: input.title });
  } catch (err) {
    console.log("[v0] generateArticleCover failed:", err instanceof Error ? err.message : String(err));
    return null;
  }
}
