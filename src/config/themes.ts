import { bodyFonts, displayFonts, scriptFonts } from "@/config/fonts";
import type {
  ThemeConfig,
  ThemePreset,
  ThemePresetId,
  ThemeRadius,
} from "@/config/types";

export const themePresets: Record<ThemePresetId, ThemePreset> = {
  /** Black & white luxury — lounges, signature restaurants. */
  noir: {
    label: "Noir",
    scheme: "dark",
    colors: {
      background: "#050505",
      surface: "#111111",
      text: "#f5f5f5",
      accent: "#ffffff",
      accentText: "#050505",
      paper: "#f6f2ea",
      paperText: "#1a1714",
      paperAccent: "#8f816d",
      cover: "#0a0a0a",
      coverText: "#f7f4ef",
    },
    fonts: { display: "instrument", body: "outfit", script: "great-vibes" },
    radius: "sharp",
    texture: true,
  },
  /** Deep charcoal & gold — traditional and oriental cuisine. */
  royal: {
    label: "Royal",
    scheme: "dark",
    colors: {
      background: "#12100c",
      surface: "#1d1913",
      text: "#f3e9d7",
      accent: "#c9a45c",
      accentText: "#12100c",
      paper: "#f7f0e1",
      paperText: "#2a1f12",
      paperAccent: "#9c7a3c",
      cover: "#1d3328",
      coverText: "#ecd9ab",
    },
    fonts: { display: "cormorant", body: "outfit", script: "great-vibes" },
    radius: "sharp",
    texture: true,
  },
  /** Cream & terracotta — trattorias, pizzerias, family restaurants. */
  rustic: {
    label: "Rustique",
    scheme: "light",
    colors: {
      background: "#f4ecdf",
      surface: "#ebdfcb",
      text: "#2b1d14",
      accent: "#b4492a",
      accentText: "#fff8ef",
      paper: "#fbf6ec",
      paperText: "#2b1d14",
      paperAccent: "#b4492a",
      cover: "#5a2a1a",
      coverText: "#f6e9d6",
    },
    fonts: { display: "playfair", body: "dm-sans", script: "dancing" },
    radius: "soft",
    texture: true,
  },
  /** Bright & green — cafés, brunch, healthy food. */
  fresh: {
    label: "Fresh",
    scheme: "light",
    colors: {
      background: "#f6f7f2",
      surface: "#ffffff",
      text: "#1d2b22",
      accent: "#2f7d4f",
      accentText: "#ffffff",
      paper: "#ffffff",
      paperText: "#1d2b22",
      paperAccent: "#2f7d4f",
      cover: "#1d3b2a",
      coverText: "#f1f5ee",
    },
    fonts: { display: "fraunces", body: "dm-sans", script: "dancing" },
    radius: "round",
    texture: false,
  },
  /** White & navy — seafood, Mediterranean, beach restaurants. */
  riviera: {
    label: "Riviera",
    scheme: "light",
    colors: {
      background: "#f3f6f9",
      surface: "#ffffff",
      text: "#0f2a43",
      accent: "#1f5f99",
      accentText: "#ffffff",
      paper: "#fdfcf8",
      paperText: "#0f2a43",
      paperAccent: "#1f5f99",
      cover: "#0f2a43",
      coverText: "#f3f6f9",
    },
    fonts: { display: "cormorant", body: "manrope", script: "great-vibes" },
    radius: "soft",
    texture: false,
  },
  /** Bold black & yellow — burgers, fast food, street food. */
  street: {
    label: "Street",
    scheme: "dark",
    colors: {
      background: "#111111",
      surface: "#1c1c1c",
      text: "#fdf6e3",
      accent: "#ffc21a",
      accentText: "#111111",
      paper: "#fff8e6",
      paperText: "#111111",
      paperAccent: "#e63b2e",
      cover: "#e63b2e",
      coverText: "#fff8e6",
    },
    fonts: { display: "bebas", body: "inter", script: "dancing" },
    radius: "round",
    texture: false,
  },
};

const radii: Record<ThemeRadius, { sm: string; lg: string; btn: string }> = {
  sharp: { sm: "0px", lg: "0px", btn: "0px" },
  soft: { sm: "6px", lg: "14px", btn: "8px" },
  round: { sm: "12px", lg: "24px", btn: "999px" },
};

/** Condensed display fonts look wrong in italic and read better uppercase. */
const uprightDisplayFonts = new Set(["bebas"]);

export function resolveTheme(config: ThemeConfig) {
  const preset = themePresets[config.preset];
  const colors = { ...preset.colors, ...config.colors };
  const fonts = { ...preset.fonts, ...config.fonts };
  const radius = radii[config.radius ?? preset.radius];
  const upright = uprightDisplayFonts.has(fonts.display);

  return {
    scheme: preset.scheme,
    texture: config.texture ?? preset.texture,
    vars: {
      "color-scheme": preset.scheme,
      "--bg": colors.background,
      "--surface": colors.surface,
      "--text": colors.text,
      "--accent": colors.accent,
      "--accent-text": colors.accentText,
      "--paper": colors.paper,
      "--paper-text": colors.paperText,
      "--paper-accent": colors.paperAccent,
      "--cover": colors.cover,
      "--cover-text": colors.coverText,
      "--font-display": displayFonts[fonts.display],
      "--font-body": bodyFonts[fonts.body],
      "--font-script": scriptFonts[fonts.script],
      "--display-style": upright ? "normal" : "italic",
      "--display-transform": upright ? "uppercase" : "none",
      "--display-tracking": upright ? "0.01em" : "-0.02em",
      "--radius-sm": radius.sm,
      "--radius-lg": radius.lg,
      "--radius-btn": radius.btn,
    } as Record<string, string>,
  };
}

export function themeToCss(config: ThemeConfig): string {
  const { vars } = resolveTheme(config);
  const body = Object.entries(vars)
    .map(([key, value]) => `${key}:${value};`)
    .join("");
  return `:root{${body}}`;
}
