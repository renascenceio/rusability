import { NextResponse } from "next/server";
import { generateImage } from "ai";
import { gateway } from "@ai-sdk/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// TEMP diagnostic: which image models actually return bytes for this project?
export async function GET() {
  const candidates = [
    "openai/gpt-image-1-mini",
    "openai/gpt-image-1",
    "xai/grok-imagine-image",
    "bfl/flux-pro-1.1",
    "bfl/flux-2-pro",
  ];
  const results: Record<string, string> = {};
  for (const id of candidates) {
    try {
      const { image } = await generateImage({
        model: gateway.image(id),
        prompt: "A minimalist abstract business illustration, soft gradients, 16:9",
        aspectRatio: "16:9",
      });
      const n = image?.uint8Array?.length ?? 0;
      results[id] = n > 0 ? `OK ${n} bytes` : "empty";
    } catch (err) {
      results[id] = `ERR ${err instanceof Error ? err.message.slice(0, 140) : String(err)}`;
    }
  }
  return NextResponse.json(results);
}
