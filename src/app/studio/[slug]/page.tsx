import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadRestaurant, studioEnabled } from "@/restaurants";
import { Studio } from "@/components/studio/Studio";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Studio · ${slug}` };
}

export default async function StudioEditorPage({ params }: Props) {
  const { slug } = await params;
  const restaurant = studioEnabled ? loadRestaurant(slug) : null;
  if (!restaurant) notFound();

  return <Studio initial={restaurant} />;
}
