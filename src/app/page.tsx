import type { Metadata } from "next";
import { RestaurantSite } from "@/components/RestaurantSite";
import { getRestaurant } from "@/restaurants";
import { restaurantMetadata } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  return restaurantMetadata(getRestaurant());
}

export default function HomePage() {
  return <RestaurantSite restaurant={getRestaurant()} />;
}
