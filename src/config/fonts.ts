import {
  Bebas_Neue,
  Cormorant_Garamond,
  DM_Sans,
  DM_Serif_Display,
  Dancing_Script,
  Fraunces,
  Great_Vibes,
  Instrument_Serif,
  Inter,
  Manrope,
  Outfit,
  Playfair_Display,
} from "next/font/google";

// next/font only accepts literal options, so every font is declared here.
// preload is off: only the fonts a theme actually uses get downloaded.

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--ff-instrument",
  display: "swap",
  preload: false,
});

const playfair = Playfair_Display({
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--ff-playfair",
  display: "swap",
  preload: false,
});

const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--ff-cormorant",
  display: "swap",
  preload: false,
});

const fraunces = Fraunces({
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--ff-fraunces",
  display: "swap",
  preload: false,
});

const dmSerif = DM_Serif_Display({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--ff-dm-serif",
  display: "swap",
  preload: false,
});

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--ff-bebas",
  display: "swap",
  preload: false,
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--ff-outfit",
  display: "swap",
  preload: false,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--ff-inter",
  display: "swap",
  preload: false,
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--ff-dm-sans",
  display: "swap",
  preload: false,
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--ff-manrope",
  display: "swap",
  preload: false,
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--ff-great-vibes",
  display: "swap",
  preload: false,
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--ff-dancing",
  display: "swap",
  preload: false,
});

export const fontVariables = [
  instrumentSerif,
  playfair,
  cormorant,
  fraunces,
  dmSerif,
  bebas,
  outfit,
  inter,
  dmSans,
  manrope,
  greatVibes,
  dancingScript,
]
  .map((font) => font.variable)
  .join(" ");

export const displayFonts = {
  instrument: "var(--ff-instrument), Georgia, serif",
  playfair: "var(--ff-playfair), Georgia, serif",
  cormorant: "var(--ff-cormorant), Georgia, serif",
  fraunces: "var(--ff-fraunces), Georgia, serif",
  "dm-serif": "var(--ff-dm-serif), Georgia, serif",
  bebas: "var(--ff-bebas), Impact, sans-serif",
} as const;

export const bodyFonts = {
  outfit: "var(--ff-outfit), system-ui, sans-serif",
  inter: "var(--ff-inter), system-ui, sans-serif",
  "dm-sans": "var(--ff-dm-sans), system-ui, sans-serif",
  manrope: "var(--ff-manrope), system-ui, sans-serif",
} as const;

export const scriptFonts = {
  "great-vibes": "var(--ff-great-vibes), cursive",
  dancing: "var(--ff-dancing), cursive",
} as const;

export type DisplayFontId = keyof typeof displayFonts;
export type BodyFontId = keyof typeof bodyFonts;
export type ScriptFontId = keyof typeof scriptFonts;
