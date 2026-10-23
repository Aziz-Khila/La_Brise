import path from "path";
import { NextResponse } from "next/server";
import { RepositoryError, storeImage } from "@/lib/admin/repository";
import { isAdmin } from "@/lib/admin/session";

/** Images are resized in the browser first; hosts reject request bodies above ~4.5 MB. */
const MAX_BYTES = 4 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/webp": ".webp",
  "image/png": ".png",
  "image/jpeg": ".jpg",
};

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Session expirée." }, { status: 401 });

  const file = (await request.formData()).get("file");
  if (!(file instanceof File) || !EXTENSIONS[file.type]) {
    return NextResponse.json({ error: "Format d’image non supporté." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image trop lourde (4 Mo max)." }, { status: 400 });
  }

  const base =
    path
      .basename(file.name, path.extname(file.name))
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "image";
  const name = `${base}-${Date.now().toString(36)}${EXTENSIONS[file.type]}`;

  try {
    return NextResponse.json(await storeImage(name, Buffer.from(await file.arrayBuffer())));
  } catch (error) {
    if (error instanceof RepositoryError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
