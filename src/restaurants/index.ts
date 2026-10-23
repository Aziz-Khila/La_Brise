import fs from "fs";
import path from "path";
import type { RestaurantConfig } from "@/config/types";

/** Every restaurant lives in content/restaurants/<slug>.json, edited by hand or through /studio. */
const CONTENT_DIR = path.join(process.cwd(), "content", "restaurants");

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** The showcase served when RESTAURANT is not set, and the default template for new restaurants. */
export const DEFAULT_RESTAURANT = "la-brise";

function fileFor(slug: string) {
  if (!SLUG_PATTERN.test(slug)) throw new Error(`Invalid restaurant slug "${slug}"`);
  return path.join(CONTENT_DIR, `${slug}.json`);
}

export function listRestaurants(): RestaurantConfig[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => loadRestaurant(file.replace(/\.json$/, "")))
    .filter((restaurant): restaurant is RestaurantConfig => Boolean(restaurant));
}

export function loadRestaurant(slug: string): RestaurantConfig | null {
  if (!SLUG_PATTERN.test(slug)) return null;
  const file = fileFor(slug);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as RestaurantConfig;
}

export function saveRestaurant(restaurant: RestaurantConfig) {
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
  fs.writeFileSync(fileFor(restaurant.slug), `${JSON.stringify(restaurant, null, 2)}\n`, "utf8");
}

export function deleteRestaurant(slug: string) {
  const file = fileFor(slug);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

/** The restaurant this deployment serves, chosen with the RESTAURANT env variable. */
export function getRestaurant(): RestaurantConfig {
  const slug = process.env.RESTAURANT ?? DEFAULT_RESTAURANT;
  const restaurant = loadRestaurant(slug);
  if (!restaurant) {
    const available = listRestaurants().map((r) => r.slug).join(", ");
    throw new Error(`Unknown RESTAURANT "${slug}". Available: ${available}`);
  }
  return restaurant;
}

/** Preview routes let you browse every config locally; disabled in production unless ENABLE_PREVIEW=1. */
export const previewEnabled =
  process.env.NODE_ENV !== "production" || process.env.ENABLE_PREVIEW === "1";

/** The studio writes files to disk, so it only exists while running `npm run dev`. */
export const studioEnabled = process.env.NODE_ENV === "development";
