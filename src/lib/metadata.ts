import type { Metadata } from "next";
import type { RestaurantConfig } from "@/config/types";

export function restaurantMetadata(restaurant: RestaurantConfig): Metadata {
  return {
    title: restaurant.seo.title,
    description: restaurant.seo.description,
    icons: restaurant.logo
      ? {
          icon: [{ url: restaurant.logo, type: "image/png" }],
          apple: restaurant.logo,
        }
      : undefined,
    openGraph: {
      title: restaurant.seo.title,
      description: restaurant.seo.description,
      type: "website",
      locale: "fr_FR",
    },
  };
}
