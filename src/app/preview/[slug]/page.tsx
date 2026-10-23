import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { MotionLevel, RestaurantConfig, ThemePresetId } from "@/config/types";
import { themePresets } from "@/config/themes";
import { RestaurantSite } from "@/components/RestaurantSite";
import { PreviewBar } from "@/components/site/PreviewBar";
import { listRestaurants, loadRestaurant, previewEnabled } from "@/restaurants";
import { restaurantMetadata } from "@/lib/metadata";

type PreviewProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ theme?: string; motion?: string }>;
};

const motionLevels: MotionLevel[] = ["rich", "subtle", "none"];

function applyOverrides(
  restaurant: RestaurantConfig,
  theme?: string,
  motion?: string
): RestaurantConfig {
  const preset = theme && theme in themePresets ? (theme as ThemePresetId) : undefined;
  const level = motionLevels.find((value) => value === motion);
  return {
    ...restaurant,
    // A different preset replaces the restaurant's color/font overrides too.
    theme: preset ? { preset } : restaurant.theme,
    motion: level ?? restaurant.motion,
  };
}

export async function generateMetadata({ params }: PreviewProps): Promise<Metadata> {
  const restaurant = loadRestaurant((await params).slug);
  return restaurant ? restaurantMetadata(restaurant) : {};
}

export default async function PreviewPage({ params, searchParams }: PreviewProps) {
  const { slug } = await params;
  const { theme, motion } = await searchParams;
  const base = loadRestaurant(slug);
  if (!previewEnabled || !base) notFound();

  const restaurant = applyOverrides(base, theme, motion);

  return (
    <RestaurantSite
      restaurant={restaurant}
      overlay={
        <PreviewBar
          slug={slug}
          slugs={listRestaurants().map((r) => r.slug)}
          theme={restaurant.theme.preset}
          motion={restaurant.motion}
        />
      }
    />
  );
}
