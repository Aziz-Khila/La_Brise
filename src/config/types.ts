import type { DisplayFontId, BodyFontId, ScriptFontId } from "@/config/fonts";

export type ThemePresetId =
  | "noir"
  | "royal"
  | "rustic"
  | "fresh"
  | "riviera"
  | "street";

export type ThemeColors = {
  /** Page background. */
  background: string;
  /** Slightly raised surfaces (cards, inputs, tabs). */
  surface: string;
  /** Main text color on the background. */
  text: string;
  /** Buttons, highlights, prices. */
  accent: string;
  /** Text drawn on top of the accent color. */
  accentText: string;
  /** Menu page paper (flip-book pages). */
  paper: string;
  paperText: string;
  paperAccent: string;
  /** Menu book cover. */
  cover: string;
  coverText: string;
};

export type ThemeFonts = {
  display: DisplayFontId;
  body: BodyFontId;
  script: ScriptFontId;
};

export type ThemeRadius = "sharp" | "soft" | "round";

export type ThemePreset = {
  label: string;
  scheme: "dark" | "light";
  colors: ThemeColors;
  fonts: ThemeFonts;
  radius: ThemeRadius;
  /** Subtle film-grain overlay on the whole page. */
  texture: boolean;
};

export type ThemeConfig = {
  preset: ThemePresetId;
  colors?: Partial<ThemeColors>;
  fonts?: Partial<ThemeFonts>;
  radius?: ThemeRadius;
  texture?: boolean;
};

/** rich: smooth scroll + parallax + reveals · subtle: reveals only · none: static. */
export type MotionLevel = "rich" | "subtle" | "none";

export type ImageRef = {
  src: string;
  alt: string;
  /** Point kept in view when the frame crops the image, as CSS object-position, e.g. "50% 20%". */
  focus?: string;
  /** Show the whole image at its own proportions instead of cropping it (about section only). */
  whole?: boolean;
};

/**
 * What a button does. Anchors (`#menu`, `#reservation`) scroll to a section;
 * `tour` slowly auto-scrolls through the whole page.
 */
export type CtaAction =
  | "tour"
  | "whatsapp"
  | "call"
  | "maps"
  | "instagram"
  | `#${string}`;

export type Cta = {
  label: string;
  action: CtaAction;
};

export type MenuTag = "new" | "popular" | "spicy" | "vegetarian" | "chef";

export type MenuItem = {
  name: string;
  description?: string;
  /** Number is formatted with the restaurant currency; string is shown as-is (e.g. "18 / 24 DT"). */
  price: number | string;
  /** Square photo, shown as a thumbnail in the tabs/list menus. */
  image?: string;
  /** Transparent PNG cut-out: gets its own full page in the flip-book menu. */
  cutout?: string;
  tags?: MenuTag[];
};

export type MenuCategory = {
  id: string;
  name: string;
  description?: string;
  items: MenuItem[];
};

type SectionBase = {
  /** Anchor id; defaults to the section type. */
  id?: string;
  /** When set, the section is linked in the header navigation. */
  navLabel?: string;
  /** Set to false to hide the section without deleting its content. */
  enabled?: boolean;
};

export type HeroSection = SectionBase & {
  type: "hero";
  /** cinematic: text left over full photo · centered: centered over full photo · split: text beside a framed photo. */
  variant: "cinematic" | "centered" | "split";
  eyebrow?: string;
  /** Defaults to the restaurant name. */
  title?: string;
  headline?: string;
  text?: string;
  image: ImageRef;
  primaryCta?: Cta;
  secondaryCta?: Cta;
};

export type AboutSection = SectionBase & {
  type: "about";
  variant: "image-right" | "image-left";
  eyebrow?: string;
  title: string;
  text: string;
  image: ImageRef;
  /** Small key figures under the text, e.g. { value: "100%", label: "Fait maison" }. */
  highlights?: { value: string; label: string }[];
};

export type FeaturedSection = SectionBase & {
  type: "featured";
  /** grid: 2-column photo grid · cards: 3-column compact cards · editorial: alternating large rows. */
  variant: "grid" | "cards" | "editorial";
  eyebrow?: string;
  title: string;
  text?: string;
  items: { title: string; text: string; image: ImageRef }[];
};

export type MenuSection = SectionBase & {
  type: "menu";
  /** tabs: one category at a time · list: classic printed menu · book: interactive flip-book. */
  variant: "tabs" | "list" | "book";
  eyebrow?: string;
  title: string;
  text?: string;
  /** Small line printed at the bottom of the book cover. */
  coverNote?: string;
  /** Adds an "order on WhatsApp" button under the menu. */
  orderButton?: boolean;
};

export type QuoteSection = SectionBase & {
  type: "quote";
  quote: string;
  cite?: string;
  image: ImageRef;
};

export type ReservationSection = SectionBase & {
  type: "reservation";
  /** form: booking form sent through WhatsApp · compact: a banner with WhatsApp / call buttons. */
  variant: "form" | "compact";
  eyebrow?: string;
  title: string;
  text?: string;
  maxGuests?: number;
  image?: ImageRef;
};

export type VisitSection = SectionBase & {
  type: "visit";
  /** photo: storefront photo with a maps card · map: embedded interactive Google Map. */
  variant: "photo" | "map";
  eyebrow?: string;
  title: string;
  text?: string;
  image?: ImageRef;
};

export type SectionConfig =
  | HeroSection
  | AboutSection
  | FeaturedSection
  | MenuSection
  | QuoteSection
  | ReservationSection
  | VisitSection;

export type RestaurantConfig = {
  slug: string;
  name: string;
  /** Short descriptor shown under the name, e.g. "Cafe Restaurant". */
  kind: string;
  city: string;
  logo?: string;
  seo: {
    title: string;
    description: string;
  };
  contact: {
    /** International format, e.g. "+216 46 613 260". */
    phone?: string;
    /** International format; enables reservation and ordering through WhatsApp. */
    whatsapp?: string;
    email?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
  location: {
    address: string;
    /** Landmark or directions hint, e.g. "En face de la Banque Azzaytouna". */
    note?: string;
    mapsUrl: string;
    /** Place name or "lat,lng" used for the embedded map. */
    mapQuery?: string;
  };
  hours: { days: string; time: string }[];
  currency: string;
  theme: ThemeConfig;
  motion: MotionLevel;
  header?: {
    cta?: Cta;
  };
  /** Floating WhatsApp button in the corner of every page. */
  floatingWhatsapp?: {
    enabled: boolean;
    message?: string;
  };
  menu: MenuCategory[];
  sections: SectionConfig[];
  footer?: {
    note?: string;
  };
};

/** Identity and contact details shared by most components. */
export type Brand = Pick<
  RestaurantConfig,
  "name" | "kind" | "city" | "logo" | "contact" | "location" | "hours" | "currency"
>;
