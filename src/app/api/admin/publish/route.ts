import { NextResponse } from "next/server";
import { applyOwnerEdits } from "@/lib/admin/ownerEdits";
import {
  RepositoryError,
  loadContent,
  publishContent,
  publishesThroughGitHub,
  type PendingImage,
} from "@/lib/admin/repository";
import { isAdmin } from "@/lib/admin/session";
import { IMAGES_URL } from "@/restaurants";

const isPendingImage = (value: unknown): value is PendingImage => {
  const image = value as PendingImage;
  return (
    typeof image?.url === "string" &&
    image.url.startsWith(`${IMAGES_URL}/`) &&
    !image.url.slice(IMAGES_URL.length + 1).includes("/") &&
    typeof image.blobSha === "string" &&
    /^[0-9a-f]{40}$/.test(image.blobSha)
  );
};

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Session expirée." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as {
    config?: unknown;
    baseSha?: unknown;
    images?: unknown;
  } | null;
  const images = Array.isArray(body?.images) ? body.images : [];
  if (!body || typeof body.baseSha !== "string" || !images.every(isPendingImage)) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  try {
    const current = await loadContent();
    if (current.sha !== body.baseSha) {
      return NextResponse.json(
        { error: "Le site a été modifié depuis l’ouverture de l’éditeur. Rechargez la page." },
        { status: 409 }
      );
    }

    const config = applyOwnerEdits(current.config, body.config);
    if (!config) return NextResponse.json({ error: "Contenu invalide." }, { status: 400 });

    const sha = await publishContent(config, images, "Mise à jour du contenu depuis l’admin");
    return NextResponse.json({ config, sha, redeploy: publishesThroughGitHub() });
  } catch (error) {
    if (error instanceof RepositoryError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
