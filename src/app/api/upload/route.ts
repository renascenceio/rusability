import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { storeWebp, isWebpConvertible } from "@/lib/media/to-webp";

export const runtime = "nodejs";

/**
 * Authenticated image upload → normalised to WebP → public Blob URL.
 * Used by the article editor's hero-image field (drag-drop / file picker).
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется вход." }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл не найден." }, { status: 400 });
  }
  if (!isWebpConvertible(file.type)) {
    return NextResponse.json({ error: "Поддерживаются JPG, PNG, WebP, AVIF." }, { status: 415 });
  }
  if (file.size > 12 * 1024 * 1024) {
    return NextResponse.json({ error: "Файл больше 12 МБ." }, { status: 413 });
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const url = await storeWebp(bytes, { prefix: "covers", name: file.name || "cover" });
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "Не удалось загрузить изображение." }, { status: 500 });
  }
}
