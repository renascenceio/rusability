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
 * Remove a baked-in uniform-colour matte/frame from generated covers — of ANY
 * colour (Imagen frames posters on black just as often as on white), on any of
 * the four sides. A side row/column is treated as matte only when ≥98.5% of its
 * pixels match a border reference colour sampled from the image corners, so a
 * real edge-to-edge photograph is left untouched while a "small artwork centred
 * on a solid background" is cropped down to just the artwork.
 *
 * Returns `{ buffer, cropped }` so the caller knows whether trimming happened.
 */
async function removeMatte(bytes: Buffer): Promise<{ buffer: Buffer; cropped: boolean }> {
  const image = sharp(bytes).rotate();
  const { width, height } = await image.metadata();
  if (!width || !height) return { buffer: bytes, cropped: false };

  const { data, info } = await image
    .clone()
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const channels = info.channels;
  const rgb = (x: number, y: number) => {
    const o = (y * width + x) * channels;
    return [data[o], data[o + 1], data[o + 2]] as const;
  };
  // Reference matte colour = the four corners, but only if they AGREE (a framed
  // poster has four identical corners). If the corners disagree, the image has
  // no uniform frame and nothing is trimmed.
  const corners = [
    rgb(0, 0),
    rgb(width - 1, 0),
    rgb(0, height - 1),
    rgb(width - 1, height - 1),
  ];
  const dist = (a: readonly number[], b: readonly number[]) =>
    Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
  const ref = corners[0];
  const cornersAgree = corners.every((c) => dist(c, ref) <= 24);
  if (!cornersAgree) return { buffer: bytes, cropped: false };

  const TOL = 24; // sum-of-abs-channel-diff tolerance for "same as matte"
  const isMatte = (x: number, y: number) => dist(rgb(x, y), ref) <= TOL;
  const matteRow = (y: number) => {
    let hit = 0;
    for (let x = 0; x < width; x++) if (isMatte(x, y)) hit++;
    return hit / width >= 0.985;
  };
  const matteColumn = (x: number) => {
    let hit = 0;
    for (let y = 0; y < height; y++) if (isMatte(x, y)) hit++;
    return hit / height >= 0.985;
  };

  const maxY = Math.floor(height * 0.45);
  const maxX = Math.floor(width * 0.45);
  let top = 0;
  let bottom = 0;
  let left = 0;
  let right = 0;
  while (top < maxY && matteRow(top)) top++;
  while (bottom < maxY && matteRow(height - 1 - bottom)) bottom++;
  while (left < maxX && matteColumn(left)) left++;
  while (right < maxX && matteColumn(width - 1 - right)) right++;

  // Ignore tiny anti-aliased rims; only crop a meaningful baked-in matte.
  if (top + bottom < height * 0.02 && left + right < width * 0.02) {
    return { buffer: bytes, cropped: false };
  }
  // Shave an extra safety inset on the trimmed sides to remove the anti-aliased
  // gradient rim where the frame meets the artwork (the 98.5% threshold leaves a
  // 1-2px transition line otherwise, which reads as a faint frame).
  const insetX = Math.round(width * 0.01);
  const insetY = Math.round(height * 0.01);
  if (top > 0) top += insetY;
  if (bottom > 0) bottom += insetY;
  if (left > 0) left += insetX;
  if (right > 0) right += insetX;

  const cropWidth = width - left - right;
  const cropHeight = height - top - bottom;
  // Keep at least a viable chunk of real content.
  if (cropWidth < width * 0.25 || cropHeight < height * 0.25) {
    return { buffer: bytes, cropped: false };
  }

  const buffer = await image
    .extract({ left, top, width: cropWidth, height: cropHeight })
    .toBuffer();
  return { buffer, cropped: true };
}

/**
 * Transcode arbitrary image bytes to WebP, capped at `maxWidth`.
 *
 * When `normalizeCover` is set, the image is treated as an article hero: any
 * baked-in uniform matte/frame is trimmed off first, then the result is
 * cover-cropped to EXACTLY 16:9 so it can never render with letterbox/pillarbox
 * bars or a coloured frame around a smaller image — regardless of what shape the
 * generator returned.
 */
export async function toWebp(
  bytes: Uint8Array | Buffer,
  opts: { maxWidth?: number; quality?: number; normalizeCover?: boolean } = {},
): Promise<Buffer> {
  const { maxWidth = 1600, quality = 82, normalizeCover = false } = opts;

  let source: Buffer = Buffer.from(bytes);
  if (normalizeCover) {
    const { buffer } = await removeMatte(source);
    source = Buffer.from(buffer);
  }

  const pipeline = sharp(source).rotate(); // respect EXIF orientation
  if (normalizeCover) {
    // Force an exact 16:9 frame, cropping to fill — never pad. This is the hard
    // guarantee that no cover ever shows bars/frames around a smaller image.
    pipeline.resize({
      width: maxWidth,
      height: Math.round((maxWidth * 9) / 16),
      fit: "cover",
      position: "attention",
    });
  } else {
    pipeline.resize({ width: maxWidth, withoutEnlargement: true });
  }
  return pipeline.webp({ quality, effort: 4 }).toBuffer();
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
    normalizeCover?: boolean;
  } = {},
): Promise<string> {
  const { prefix = "covers", name = "image", maxWidth, quality, normalizeCover } = opts;
  const webp = await toWebp(bytes, { maxWidth, quality, normalizeCover });
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
