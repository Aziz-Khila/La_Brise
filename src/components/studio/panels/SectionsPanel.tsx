"use client";

import { useState } from "react";
import type {
  AboutSection,
  FeaturedSection,
  ImageRef,
  MenuSection,
  ReservationSection,
  RestaurantConfig,
  SectionConfig,
  VisitSection,
} from "@/config/types";
import { CtaField } from "@/components/studio/CtaField";
import {
  ChoiceField,
  FocusField,
  Group,
  ImageField,
  ListEditor,
  NumberField,
  TextField,
  ToggleField,
  type Option,
} from "@/components/studio/fields";
import { imageSpecs, sectionLabels, type ImageSpec, type PanelProps } from "@/components/studio/shared";

const variants: { [K in SectionConfig["type"]]?: Option<string>[] } = {
  hero: [
    { value: "cinematic", label: "Photo plein écran" },
    { value: "centered", label: "Centré" },
    { value: "split", label: "Texte + photo" },
  ],
  about: [
    { value: "image-right", label: "Image à droite" },
    { value: "image-left", label: "Image à gauche" },
  ],
  featured: [
    { value: "grid", label: "Grille 2 colonnes" },
    { value: "cards", label: "Cartes 3 colonnes" },
    { value: "editorial", label: "Éditorial" },
  ],
  menu: [
    { value: "book", label: "Livre animé" },
    { value: "tabs", label: "Onglets" },
    { value: "list", label: "Liste classique" },
  ],
  reservation: [
    { value: "form", label: "Formulaire" },
    { value: "compact", label: "Bandeau" },
  ],
  visit: [
    { value: "photo", label: "Photo de façade" },
    { value: "map", label: "Carte Google" },
  ],
};

function firstImage(config: RestaurantConfig): string {
  for (const section of config.sections) {
    if ("image" in section && section.image?.src) return section.image.src;
  }
  return config.logo ?? "";
}

function createSection(type: SectionConfig["type"], config: RestaurantConfig): SectionConfig {
  const image = { src: firstImage(config), alt: "" };
  switch (type) {
    case "hero":
      return { type, variant: "cinematic", headline: "Votre accroche ici", image, primaryCta: { label: "Découvrir", action: "tour" } };
    case "about":
      return { type, variant: "image-right", eyebrow: "Notre histoire", title: "Un titre qui donne envie.", text: "Racontez l’histoire du restaurant.", image };
    case "featured":
      return { type, variant: "grid", eyebrow: "Sur la table", title: "Nos spécialités.", items: [{ title: "Spécialité", text: "Une courte description.", image }] };
    case "menu":
      return { type, variant: "tabs", navLabel: "Menu", eyebrow: "La carte", title: "Notre menu.", orderButton: true };
    case "quote":
      return { type, quote: "“Une phrase qui marque.”", cite: config.name, image };
    case "reservation":
      return { type, variant: "form", navLabel: "Réserver", eyebrow: "Réservation", title: "Réservez votre table.", maxGuests: 10 };
    case "visit":
      return { type, variant: "map", navLabel: "Contact", eyebrow: "Nous trouver", title: "Venez nous voir." };
  }
}

const featuredSpecs: Record<FeaturedSection["variant"], ImageSpec> = {
  grid: imageSpecs.featuredGrid,
  cards: imageSpecs.featuredCards,
  editorial: imageSpecs.featuredEditorial,
};

function ImageRefField({
  label,
  value,
  slug,
  optional,
  spec,
  allowWhole,
  onChange,
}: {
  label: string;
  value: ImageRef | undefined;
  slug: string;
  optional?: boolean;
  spec: ImageSpec;
  /** The section can drop its fixed frame and show the photo uncropped. */
  allowWhole?: boolean;
  onChange: (value: ImageRef | undefined) => void;
}) {
  const whole = Boolean(allowWhole && value?.whole);
  return (
    <>
      <ImageField
        label={label}
        slug={slug}
        spec={spec}
        whole={whole}
        value={value?.src}
        onChange={(src) => {
          if (!src) return onChange(optional ? undefined : { src: "", alt: value?.alt ?? "" });
          onChange({ src, alt: value?.alt ?? "", whole: value?.whole });
        }}
      />
      {value?.src && allowWhole && (
        <ToggleField
          label="Afficher l’image entière"
          hint="Le cadre prend les proportions de la photo : rien n’est coupé."
          checked={whole}
          onChange={(checked) => onChange({ ...value, whole: checked || undefined })}
        />
      )}
      {value?.src && !whole && (
        <FocusField
          src={value.src}
          spec={spec}
          value={value.focus}
          onChange={(focus) => onChange({ ...value, focus })}
        />
      )}
      {value?.src && (
        <TextField
          label="Description de l’image (accessibilité)"
          required
          value={value.alt}
          onChange={(alt) => onChange({ ...value, alt: alt ?? "" })}
        />
      )}
    </>
  );
}

type EditorProps = {
  section: SectionConfig;
  set: (section: SectionConfig) => void;
  config: RestaurantConfig;
};

function CommonFields({ section, set }: Omit<EditorProps, "config">) {
  return (
    <div className="sf-row">
      <TextField
        label="Lien dans le menu"
        placeholder="Vide = pas de lien"
        value={section.navLabel}
        onChange={(navLabel) => set({ ...section, navLabel })}
      />
      <TextField
        label="Ancre"
        placeholder={section.type}
        value={section.id}
        onChange={(id) => set({ ...section, id: id?.replace(/[^a-z0-9-]/gi, "-").toLowerCase() })}
      />
    </div>
  );
}

type IntroSection = AboutSection | FeaturedSection | MenuSection | ReservationSection | VisitSection;

function IntroFields<S extends IntroSection>({ section, set }: { section: S; set: (section: S) => void }) {
  const textRequired = section.type === "about";
  return (
    <>
      <TextField label="Sur-titre" value={section.eyebrow} onChange={(eyebrow) => set({ ...section, eyebrow })} />
      <TextField label="Titre" required value={section.title} onChange={(title) => set({ ...section, title: title ?? "" })} />
      <TextField
        label="Texte"
        multiline
        required={textRequired}
        value={section.text}
        onChange={(text) => set({ ...section, text: textRequired ? (text ?? "") : text })}
      />
    </>
  );
}

function SectionEditor({ section, set, config }: EditorProps) {
  const slug = config.slug;
  const variantOptions = variants[section.type];

  return (
    <div className="sf-stack">
      {variantOptions && "variant" in section && (
        <ChoiceField
          label="Mise en page"
          value={section.variant}
          options={variantOptions}
          onChange={(variant) => set({ ...section, variant } as SectionConfig)}
        />
      )}

      {section.type === "hero" && (
        <>
          <TextField label="Sur-titre" value={section.eyebrow} onChange={(eyebrow) => set({ ...section, eyebrow })} />
          <TextField label="Titre" placeholder={config.name} value={section.title} onChange={(title) => set({ ...section, title })} />
          <TextField label="Accroche" value={section.headline} onChange={(headline) => set({ ...section, headline })} />
          <TextField label="Texte" multiline value={section.text} onChange={(text) => set({ ...section, text })} />
          <ImageRefField
            label="Photo"
            slug={slug}
            spec={section.variant === "split" ? imageSpecs.heroSplit : imageSpecs.heroFull}
            value={section.image}
            onChange={(image) => image && set({ ...section, image })}
          />
          <CtaField label="Bouton principal" value={section.primaryCta} sections={config.sections} onChange={(primaryCta) => set({ ...section, primaryCta })} />
          <CtaField label="Bouton secondaire" value={section.secondaryCta} sections={config.sections} onChange={(secondaryCta) => set({ ...section, secondaryCta })} />
        </>
      )}

      {section.type === "about" && (
        <>
          <IntroFields section={section} set={set} />
          <ImageRefField label="Photo" slug={slug} spec={imageSpecs.about} allowWhole value={section.image} onChange={(image) => image && set({ ...section, image })} />
          <span className="sf-label">Chiffres clés</span>
          <ListEditor
            items={section.highlights ?? []}
            onChange={(highlights) => set({ ...section, highlights: highlights.length ? highlights : undefined })}
            create={() => ({ value: "100%", label: "Fait maison" })}
            title={(item) => `${item.value} · ${item.label}`}
            addLabel="Ajouter un chiffre"
            render={(item, setItem) => (
              <div className="sf-row">
                <TextField label="Valeur" required value={item.value} onChange={(value) => setItem({ ...item, value: value ?? "" })} />
                <TextField label="Libellé" required value={item.label} onChange={(label) => setItem({ ...item, label: label ?? "" })} />
              </div>
            )}
          />
        </>
      )}

      {section.type === "featured" && (
        <>
          <IntroFields section={section} set={set} />
          <span className="sf-label">Plats</span>
          <ListEditor
            items={section.items}
            onChange={(items) => set({ ...section, items })}
            create={() => ({ title: "Nouveau plat", text: "", image: { src: firstImage(config), alt: "" } })}
            title={(item) => item.title}
            addLabel="Ajouter un plat"
            render={(item, setItem) => (
              <>
                <TextField label="Titre" required value={item.title} onChange={(title) => setItem({ ...item, title: title ?? "" })} />
                <TextField label="Texte" required multiline value={item.text} onChange={(text) => setItem({ ...item, text: text ?? "" })} />
                <ImageRefField label="Photo" slug={slug} spec={featuredSpecs[section.variant]} value={item.image} onChange={(image) => image && setItem({ ...item, image })} />
              </>
            )}
          />
        </>
      )}

      {section.type === "menu" && (
        <>
          <IntroFields section={section} set={set} />
          {section.variant === "book" && (
            <TextField label="Note sur la couverture" placeholder={config.city} value={section.coverNote} onChange={(coverNote) => set({ ...section, coverNote })} />
          )}
          <ToggleField
            label="Bouton « Commander sur WhatsApp »"
            checked={Boolean(section.orderButton)}
            onChange={(orderButton) => set({ ...section, orderButton })}
          />
          <p className="sf-note">Les plats se gèrent dans l’onglet Menu.</p>
        </>
      )}

      {section.type === "quote" && (
        <>
          <TextField label="Citation" required multiline value={section.quote} onChange={(quote) => set({ ...section, quote: quote ?? "" })} />
          <TextField label="Auteur" value={section.cite} onChange={(cite) => set({ ...section, cite })} />
          <ImageRefField label="Photo de fond" slug={slug} spec={imageSpecs.quote} value={section.image} onChange={(image) => image && set({ ...section, image })} />
        </>
      )}

      {section.type === "reservation" && (
        <>
          <IntroFields section={section} set={set} />
          <NumberField label="Nombre de personnes max" min={1} max={100} value={section.maxGuests} onChange={(maxGuests) => set({ ...section, maxGuests })} />
          {section.variant === "form" && (
            <ImageRefField label="Photo (optionnelle)" optional slug={slug} spec={imageSpecs.reservation} value={section.image} onChange={(image) => set({ ...section, image })} />
          )}
        </>
      )}

      {section.type === "visit" && (
        <>
          <IntroFields section={section} set={set} />
          {section.variant === "photo" && (
            <ImageRefField label="Photo de façade" optional slug={slug} spec={imageSpecs.visit} value={section.image} onChange={(image) => set({ ...section, image })} />
          )}
        </>
      )}

      {section.type !== "hero" && <CommonFields section={section} set={set} />}
    </div>
  );
}

export function SectionsPanel({ config, update }: PanelProps) {
  const [newType, setNewType] = useState<SectionConfig["type"]>("about");

  return (
    <Group title="Sections de la page">
      <p className="sf-note">Réorganisez avec les flèches, masquez avec l’interrupteur, cliquez pour modifier.</p>
      <ListEditor
        items={config.sections}
        onChange={(sections) => update((d) => void (d.sections = sections))}
        create={() => createSection(newType, config)}
        title={(section) =>
          `${sectionLabels[section.type]}${section.navLabel ? ` — ${section.navLabel}` : ""}`
        }
        addLabel={`Ajouter : ${sectionLabels[newType]}`}
        headerExtra={(section, set) => (
          <label className="sf-mini-toggle" title={section.enabled === false ? "Masquée" : "Visible"}>
            <input
              type="checkbox"
              checked={section.enabled !== false}
              onChange={(event) =>
                set({ ...section, enabled: event.target.checked ? undefined : false })
              }
            />
            <span aria-hidden="true" />
          </label>
        )}
        render={(section, set) => <SectionEditor section={section} set={set} config={config} />}
      />
      <div className="sf-field">
        <span className="sf-label">Type de la prochaine section ajoutée</span>
        <select
          className="sf-input"
          value={newType}
          onChange={(event) => setNewType(event.target.value as SectionConfig["type"])}
        >
          {(Object.keys(sectionLabels) as SectionConfig["type"][]).map((type) => (
            <option key={type} value={type}>
              {sectionLabels[type]}
            </option>
          ))}
        </select>
      </div>
    </Group>
  );
}
