import "server-only";
import sharp from "sharp";
import { put } from "@vercel/blob";

/**
 * Canonical image pipeline for Rusability: every image we store is normalised
 * to WebP first (smaller, SEO-friendly, consistent). The Blob store is public,
 * so `put(...).url` is directly usable in <img src>.
 */

/** Image mime types we can transcode to WebP. */
const CONVERTIBLE = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/tiff",
  "image/gif",
]);

export function isWebpConvertible(mediaType?: string | null): boolean {
  return !!mediaType && CONVERTIBLE.has(mediaType.toLowerCase());
}

/** Transcode arbitrary image bytes to WebP, capped at `maxWidth`. */
export async function toWebp(
  bytes: Uint8Array | Buffer,
  opts: { maxWidth?: number; quality?: number } = {},
): Promise<Buffer> {
  const { maxWidth = 1600, quality = 82 } = opts;
  return sharp(Buffer.from(bytes))
    .rotate() // respect EXIF orientation
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toBuffer();
}

/**
 * Convert bytes to WebP and upload to the public Blob store.
 * Returns the public URL. `prefix` groups files (e.g. "covers").
 */
export async function storeWebp(
  bytes: Uint8Array | Buffer,
  opts: { prefix?: string; name?: string; maxWidth?: number; quality?: number } = {},
): Promise<string> {
  const { prefix = "covers", name = "image", maxWidth, quality } = opts;
  const webp = await toWebp(bytes, { maxWidth, quality });
  const safe = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "image";
  const blob = await put(`${prefix}/${safe}.webp`, webp, {
    access: "public",
    addRandomSuffix: true,
    contentType: "image/webp",
  });
  return blob.url;
}

/**
 * Fetch a remote image and rehost it as WebP on Blob. Used when importing
 * external images (e.g. RSS/aggregator media) so nothing stays hotlinked and
 * everything is WebP. Returns null on any failure (caller keeps the original).
 */
export async function importImageAsWebp(
  sourceUrl: string,
  opts: { prefix?: string; name?: string } = {},
): Promise<string | null> {
  try {
    const res = await fetch(sourceUrl);
    if (!res.ok) return null;
    const type = res.headers.get("content-type");
    if (!isWebpConvertible(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return await storeWebp(buf, { prefix: opts.prefix ?? "imported", name: opts.name });
  } catch {
    return null;
  }
}
