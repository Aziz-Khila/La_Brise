import { NextResponse } from "next/server";
import { studioEnabled } from "@/restaurants";
import { ExportError, exportRestaurant } from "@/restaurants/export";

type Context = { params: Promise<{ slug: string }> };

export async function POST(_request: Request, { params }: Context) {
  if (!studioEnabled) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    return NextResponse.json(exportRestaurant((await params).slug), { status: 201 });
  } catch (error) {
    if (error instanceof ExportError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
