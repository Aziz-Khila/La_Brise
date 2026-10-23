import { NextResponse } from "next/server";
import type { RestaurantConfig } from "@/config/types";
import {
  SLUG_PATTERN,
  listRestaurants,
  loadRestaurant,
  saveRestaurant,
  studioEnabled,
} from "@/restaurants";

const notFound = () => NextResponse.json({ error: "Not found" }, { status: 404 });

export function GET() {
  if (!studioEnabled) return notFound();
  return NextResponse.json(listRestaurants());
}

/** Creates a restaurant by duplicating an existing one under a new slug and name. */
export async function POST(request: Request) {
  if (!studioEnabled) return notFound();

  const { slug, name, from } = (await request.json()) as {
    slug?: string;
    name?: string;
    from?: string;
  };

  if (!slug || !SLUG_PATTERN.test(slug)) {
    return NextResponse.json(
      { error: "Identifiant invalide : lettres minuscules, chiffres et tirets." },
      { status: 400 }
    );
  }
  if (!name?.trim()) {
    return NextResponse.json({ error: "Le nom est obligatoire." }, { status: 400 });
  }
  if (loadRestaurant(slug)) {
    return NextResponse.json({ error: "Ce restaurant existe déjà." }, { status: 409 });
  }

  const source = from ? loadRestaurant(from) : null;
  if (!source) {
    return NextResponse.json({ error: "Restaurant modèle introuvable." }, { status: 400 });
  }

  const restaurant: RestaurantConfig = {
    ...structuredClone(source),
    slug,
    name: name.trim(),
    seo: {
      title: `${name.trim()} — ${source.kind} · ${source.city}`,
      description: source.seo.description,
    },
  };
  saveRestaurant(restaurant);
  return NextResponse.json(restaurant, { status: 201 });
}
