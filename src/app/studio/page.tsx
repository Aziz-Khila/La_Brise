import { DEFAULT_RESTAURANT, listRestaurants } from "@/restaurants";
import { EXPORT_DIR, exportPath, isExported } from "@/restaurants/export";
import { themePresets } from "@/config/themes";
import { StudioDashboard, type RestaurantSummary } from "@/components/studio/StudioDashboard";

export const dynamic = "force-dynamic";

export default function StudioHomePage() {
  const all = listRestaurants().sort(
    (a, b) => Number(b.slug === DEFAULT_RESTAURANT) - Number(a.slug === DEFAULT_RESTAURANT)
  );
  const restaurants: RestaurantSummary[] = all.map((restaurant) => {
    const preset = themePresets[restaurant.theme.preset];
    return {
      slug: restaurant.slug,
      name: restaurant.name,
      kind: restaurant.kind,
      city: restaurant.city,
      logo: restaurant.logo,
      background: restaurant.theme.colors?.background ?? preset.colors.background,
      accent: restaurant.theme.colors?.accent ?? preset.colors.accent,
      text: restaurant.theme.colors?.text ?? preset.colors.text,
      exportedTo: isExported(restaurant.slug) ? exportPath(restaurant.slug) : undefined,
    };
  });

  return <StudioDashboard restaurants={restaurants} exportDir={EXPORT_DIR} />;
}
