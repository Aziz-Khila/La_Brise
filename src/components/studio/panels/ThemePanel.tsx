"use client";

import type { ThemeColors, ThemePresetId, ThemeRadius } from "@/config/types";
import { bodyFonts, displayFonts, scriptFonts } from "@/config/fonts";
import { themePresets } from "@/config/themes";
import { ColorField, Group, SelectField } from "@/components/studio/fields";
import type { PanelProps } from "@/components/studio/shared";

const colorLabels: Record<keyof ThemeColors, string> = {
  background: "Fond de page",
  surface: "Cartes & champs",
  text: "Texte",
  accent: "Accent (boutons, prix)",
  accentText: "Texte sur l’accent",
  paper: "Papier du menu",
  paperText: "Texte du menu",
  paperAccent: "Accent du menu",
  cover: "Couverture du menu",
  coverText: "Texte de couverture",
};

const fontLabels: Record<string, string> = {
  instrument: "Instrument Serif",
  playfair: "Playfair Display",
  cormorant: "Cormorant Garamond",
  fraunces: "Fraunces",
  "dm-serif": "DM Serif Display",
  bebas: "Bebas Neue",
  outfit: "Outfit",
  inter: "Inter",
  "dm-sans": "DM Sans",
  manrope: "Manrope",
  "great-vibes": "Great Vibes",
  dancing: "Dancing Script",
};

const fontOptions = (registry: Record<string, string>, presetDefault: string) => [
  { value: "", label: `Par défaut du thème (${fontLabels[presetDefault]})` },
  ...Object.keys(registry).map((id) => ({ value: id, label: fontLabels[id] ?? id })),
];

const radiusOptions = [
  { value: "", label: "Par défaut du thème" },
  { value: "sharp", label: "Angles droits" },
  { value: "soft", label: "Légèrement arrondi" },
  { value: "round", label: "Très arrondi (pilules)" },
];

const textureOptions = [
  { value: "", label: "Par défaut du thème" },
  { value: "on", label: "Grain activé" },
  { value: "off", label: "Grain désactivé" },
];

export function ThemePanel({ config, update }: PanelProps) {
  const { theme } = config;
  const preset = themePresets[theme.preset];

  return (
    <>
      <Group title="Thème de base">
        <div className="sf-presets">
          {(Object.entries(themePresets) as [ThemePresetId, (typeof themePresets)[ThemePresetId]][]).map(
            ([id, item]) => (
              <button
                key={id}
                type="button"
                className="sf-preset"
                aria-pressed={id === theme.preset}
                onClick={() => update((d) => void (d.theme = { preset: id }))}
                style={{ background: item.colors.background, color: item.colors.text }}
              >
                <span className="sf-preset-sample" style={{ fontFamily: displayFonts[item.fonts.display] }}>
                  Aa
                </span>
                <span className="sf-preset-dots">
                  <i style={{ background: item.colors.accent }} />
                  <i style={{ background: item.colors.paper }} />
                  <i style={{ background: item.colors.cover }} />
                </span>
                <span className="sf-preset-name">{item.label}</span>
              </button>
            )
          )}
        </div>
        <p className="sf-note">Changer de thème réinitialise les couleurs et polices personnalisées.</p>
      </Group>

      <Group title="Couleurs">
        <div className="sf-colors">
          {(Object.keys(colorLabels) as (keyof ThemeColors)[]).map((key) => {
            const override = theme.colors?.[key];
            return (
              <ColorField
                key={key}
                label={colorLabels[key]}
                value={override ?? preset.colors[key]}
                overridden={Boolean(override)}
                onChange={(value) =>
                  update((d) => void (d.theme.colors = { ...d.theme.colors, [key]: value }))
                }
                onReset={() =>
                  update((d) => {
                    if (!d.theme.colors) return;
                    delete d.theme.colors[key];
                    if (Object.keys(d.theme.colors).length === 0) delete d.theme.colors;
                  })
                }
              />
            );
          })}
        </div>
      </Group>

      <Group title="Polices">
        <SelectField
          label="Titres"
          value={theme.fonts?.display ?? ""}
          options={fontOptions(displayFonts, preset.fonts.display)}
          onChange={(value) => update((d) => setFont(d.theme, "display", value))}
        />
        <SelectField
          label="Texte courant"
          value={theme.fonts?.body ?? ""}
          options={fontOptions(bodyFonts, preset.fonts.body)}
          onChange={(value) => update((d) => setFont(d.theme, "body", value))}
        />
        <SelectField
          label="Calligraphie (couverture du menu)"
          value={theme.fonts?.script ?? ""}
          options={fontOptions(scriptFonts, preset.fonts.script)}
          onChange={(value) => update((d) => setFont(d.theme, "script", value))}
        />
      </Group>

      <Group title="Style">
        <SelectField
          label="Coins"
          value={theme.radius ?? ""}
          options={radiusOptions}
          onChange={(value) =>
            update((d) => void (d.theme.radius = (value || undefined) as ThemeRadius | undefined))
          }
        />
        <SelectField
          label="Texture grain"
          value={theme.texture === undefined ? "" : theme.texture ? "on" : "off"}
          options={textureOptions}
          onChange={(value) =>
            update((d) => void (d.theme.texture = value === "" ? undefined : value === "on"))
          }
        />
      </Group>
    </>
  );
}

function setFont(
  theme: PanelProps["config"]["theme"],
  key: "display" | "body" | "script",
  value: string
) {
  const fonts: Record<string, string> = { ...theme.fonts };
  if (value) fonts[key] = value;
  else delete fonts[key];
  theme.fonts = Object.keys(fonts).length ? (fonts as typeof theme.fonts) : undefined;
}
