import type { MenuTag, RestaurantConfig, SectionConfig } from "@/config/types";
import type { Option } from "@/components/admin/fields";

export type Recipe = (draft: RestaurantConfig) => void;

export type PanelProps = {
  config: RestaurantConfig;
  /** Mutate a deep copy of the content; the editor swaps it in and keeps the draft. */
  update: (recipe: Recipe) => void;
};

export const sectionLabels: Record<SectionConfig["type"], string> = {
  hero: "Accueil",
  about: "À propos",
  featured: "Plats vedettes",
  menu: "Menu",
  quote: "Citation",
  reservation: "Réservation",
  visit: "Visite & contact",
};

export const tagOptions: Option<MenuTag>[] = [
  { value: "chef", label: "Choix du chef" },
  { value: "popular", label: "Populaire" },
  { value: "new", label: "Nouveau" },
  { value: "spicy", label: "Épicé" },
  { value: "vegetarian", label: "Végétarien" },
];

/** Size an image should be uploaded at for the slot it fills (2× the largest on-screen size). */
export type ImageSpec = {
  width: number;
  height: number;
  /** Cut-outs must keep a transparent background. */
  transparent?: boolean;
  note?: string;
};

export const imageSpecs = {
  heroFull: { width: 2400, height: 1600, note: "Plein écran : l’image est recadrée selon la taille de l’écran." },
  heroSplit: { width: 1200, height: 1500 },
  about: { width: 1200, height: 1500 },
  featuredGrid: { width: 1200, height: 1200 },
  featuredCards: { width: 1200, height: 900 },
  featuredEditorial: { width: 1600, height: 1100 },
  quote: { width: 2400, height: 1350, note: "Image de fond assombrie : évitez le texte incrusté." },
  reservation: { width: 1600, height: 1200 },
  visit: { width: 1200, height: 1500 },
  menuThumb: { width: 400, height: 400 },
  cutout: { width: 1200, height: 1200, transparent: true, note: "Plat détouré sur fond transparent, qui remplit le cadre." },
} satisfies Record<string, ImageSpec>;

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
