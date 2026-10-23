import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { SLUG_PATTERN, studioEnabled } from "@/restaurants";

const MAX_BYTES = 15 * 1024 * 1024;
const EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif"]);

/** Saves an image into public/restaurants/<slug>/ and returns its public URL. */
export async function POST(request: Request) {
  if (!studioEnabled) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const form = await request.formData();
  const slug = String(form.get("slug") ?? "");
  const file = form.get("file");

  if (!SLUG_PATTERN.test(slug) || !(file instanceof File)) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image trop lourde (15 Mo max)." }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!EXTENSIONS.has(ext)) {
    return NextResponse.json({ error: "Format d’image non supporté." }, { status: 400 });
  }

  const base =
    path
      .basename(file.name, ext)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "image";

  const dir = path.join(process.cwd(), "public", "restaurants", slug);
  fs.mkdirSync(dir, { recursive: true });

  let name = `${base}${ext}`;
  for (let i = 2; fs.existsSync(path.join(dir, name)); i++) {
    name = `${base}-${i}${ext}`;
  }

  fs.writeFileSync(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/restaurants/${slug}/${name}` });
}
