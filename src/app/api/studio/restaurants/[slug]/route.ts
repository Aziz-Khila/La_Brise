import { NextResponse } from "next/server";
import type { RestaurantConfig } from "@/config/types";
import { deleteRestaurant, loadRestaurant, saveRestaurant, studioEnabled } from "@/restaurants";

type Context = { params: Promise<{ slug: string }> };

const notFound = () => NextResponse.json({ error: "Not found" }, { status: 404 });

export async function GET(_request: Request, { params }: Context) {
  if (!studioEnabled) return notFound();
  const restaurant = loadRestaurant((await params).slug);
  return restaurant ? NextResponse.json(restaurant) : notFound();
}

export async function PUT(request: Request, { params }: Context) {
  if (!studioEnabled) return notFound();
  const { slug } = await params;
  if (!loadRestaurant(slug)) return notFound();

  const restaurant = (await request.json()) as RestaurantConfig;
  if (restaurant.slug !== slug) {
    return NextResponse.json({ error: "Slug mismatch" }, { status: 400 });
  }
  saveRestaurant(restaurant);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Context) {
  if (!studioEnabled) return notFound();
  deleteRestaurant((await params).slug);
  return NextResponse.json({ ok: true });
}
