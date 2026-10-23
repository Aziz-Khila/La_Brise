import { notFound } from "next/navigation";
import { LivePreview } from "@/components/studio/LivePreview";
import { loadRestaurant, studioEnabled } from "@/restaurants";

export default async function StudioPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const restaurant = loadRestaurant((await params).slug);
  if (!studioEnabled || !restaurant) notFound();
  return <LivePreview initial={restaurant} />;
}
