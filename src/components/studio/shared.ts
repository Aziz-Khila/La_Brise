import type {
  MenuTag,
  MotionLevel,
  RestaurantConfig,
  SectionConfig,
} from "@/config/types";
import type { Option } from "@/components/studio/fields";

export const PREVIEW_READY = "studio:ready";
export const PREVIEW_CONFIG = "studio:config";
export const PREVIEW_SCROLL = "studio:scroll";

export type Recipe = (draft: RestaurantConfig) => void;

export type PanelProps = {
  config: RestaurantConfig;
  /** Mutate a deep copy of the config; the studio swaps it in and autosaves. */
  update: (recipe: Recipe) => void;
};

export const sectionLabels: Record<SectionConfig["type"], string> = {
  hero: "Accueil (hero)",
  about: "À propos",
  featured: "Plats vedettes",
  menu: "Menu",
  quote: "Citation",
  reservation: "Réservation",
  visit: "Visite & contact",
};

export const motionOptions: Option<MotionLevel>[] = [
  { value: "rich", label: "Riche — défilement fluide et parallaxe" },
  { value: "subtle", label: "Subtil — apparitions douces" },
  { value: "none", label: "Aucune — site statique" },
];

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
  /** Logo and cut-outs must keep a transparent background. */
  transparent?: boolean;
  note?: string;
  /** Cropping position the stylesheet uses when no focus is set; must match globals.css. */
  focus?: string;
  /** Extra enlargement of the image inside its frame, e.g. the parallax margin of the about photo. */
  zoom?: number;
};

export const imageSpecs = {
  logo: { width: 512, height: 512, transparent: true, note: "Fond transparent, logo centré sans marge." },
  heroFull: {
    width: 2400,
    height: 1600,
    focus: "72% 55%",
    note: "Plein écran : l’image est recadrée selon la taille de l’écran.",
  },
  heroSplit: { width: 1200, height: 1500 },
  about: { width: 1200, height: 1500, focus: "50% 20%", zoom: 1.16 },
  featuredGrid: { width: 1200, height: 1200 },
  featuredCards: { width: 1200, height: 900 },
  featuredEditorial: { width: 1600, height: 1100 },
  quote: { width: 2400, height: 1350, focus: "50% 40%", note: "Image de fond assombrie : évitez le texte incrusté." },
  reservation: { width: 1600, height: 1200 },
  visit: { width: 1200, height: 1500, focus: "78% 28%" },
  menuThumb: { width: 400, height: 400 },
  cutout: { width: 1200, height: 1200, transparent: true, note: "Plat détouré sur fond transparent, qui remplit le cadre." },
} satisfies Record<string, ImageSpec>;

export const sectionAnchor = (section: SectionConfig) => section.id ?? section.type;

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
