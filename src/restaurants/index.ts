import fs from "fs";
import path from "path";
import type { RestaurantConfig } from "@/config/types";

/** Repository paths the admin reads and commits to. */
export const CONTENT_PATH = "content/restaurants/la-brise.json";
export const IMAGES_PATH = "public/restaurants/la-brise";
/** Public URL of IMAGES_PATH. */
export const IMAGES_URL = "/restaurants/la-brise";

export const contentFile = () => path.join(process.cwd(), "content", "restaurants", "la-brise.json");

export function getRestaurant(): RestaurantConfig {
  return JSON.parse(fs.readFileSync(contentFile(), "utf8")) as RestaurantConfig;
}
