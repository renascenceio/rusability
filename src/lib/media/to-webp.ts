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

/**
 * Remove baked-in near-white horizontal/vertical matte bars from generated
 * covers. Detection is deliberately conservative: a row/column is treated as
 * matte only when at least 98.5% of its pixels are almost white. This catches
 * Imagen's framed-poster output without trimming legitimate pale scenery.
 */
async function removeLightMatte(bytes: Buffer): Promise<Buffer> {
  const image = sharp(bytes).rotate();
  const { width, height } = await image.metadata();
  if (!width || !height) return bytes;

  const { data, info } = await image
    .clone()
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const channels = info.channels;
  const isLight = (offset: number) =>
    data[offset] >= 238 && data[offset + 1] >= 238 && data[offset + 2] >= 238;
  const lightRow = (y: number) => {
    let light = 0;
    for (let x = 0; x < width; x++) {
      if (isLight((y * width + x) * channels)) light++;
    }
    return light / width >= 0.985;
  };
  const lightColumn = (x: number) => {
    let light = 0;
    for (let y = 0; y < height; y++) {
      if (isLight((y * width + x) * channels)) light++;
    }
    return light / height >= 0.985;
  };

  const maxY = Math.floor(height * 0.3);
  const maxX = Math.floor(width * 0.3);
  let top = 0;
  let bottom = 0;
  let left = 0;
  let right = 0;
  while (top < maxY && lightRow(top)) top++;
  while (bottom < maxY && lightRow(height - 1 - bottom)) bottom++;
  while (left < maxX && lightColumn(left)) left++;
  while (right < maxX && lightColumn(width - 1 - right)) right++;

  // Ignore tiny anti-aliased rims; only crop a meaningful baked-in matte.
  if (top + bottom < height * 0.02 && left + right < width * 0.02) return bytes;
  const cropWidth = width - left - right;
  const cropHeight = height - top - bottom;
  if (cropWidth < width * 0.4 || cropHeight < height * 0.4) return bytes;

  return image
    .extract({ left, top, width: cropWidth, height: cropHeight })
    .resize({ width, height: Math.round(width * 9 / 16), fit: "cover" })
    .toBuffer();
}

/** Transcode arbitrary image bytes to WebP, capped at `maxWidth`. */
export async function toWebp(
  bytes: Uint8Array | Buffer,
  opts: { maxWidth?: number; quality?: number; removeLightMatte?: boolean } = {},
): Promise<Buffer> {
  const { maxWidth = 1600, quality = 82, removeLightMatte: shouldRemoveMatte = false } = opts;
  const source = shouldRemoveMatte
    ? await removeLightMatte(Buffer.from(bytes))
    : Buffer.from(bytes);
  return sharp(source)
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
  opts: {
    prefix?: string;
    name?: string;
    maxWidth?: number;
    quality?: number;
    removeLightMatte?: boolean;
  } = {},
): Promise<string> {
  const { prefix = "covers", name = "image", maxWidth, quality, removeLightMatte } = opts;
  const webp = await toWebp(bytes, { maxWidth, quality, removeLightMatte });
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
