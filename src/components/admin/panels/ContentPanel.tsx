"use client";

import type {
  AboutSection,
  FeaturedSection,
  ImageRef,
  MenuSection,
  ReservationSection,
  SectionConfig,
  VisitSection,
} from "@/config/types";
import { ImageField, ListEditor, TextField } from "@/components/admin/fields";
import { imageSpecs, sectionLabels, type ImageSpec, type PanelProps } from "@/components/admin/shared";

const featuredSpecs: Record<FeaturedSection["variant"], ImageSpec> = {
  grid: imageSpecs.featuredGrid,
  cards: imageSpecs.featuredCards,
  editorial: imageSpecs.featuredEditorial,
};

function ImageRefField({
  label,
  value,
  spec,
  optional,
  onChange,
}: {
  label: string;
  value: ImageRef | undefined;
  spec: ImageSpec;
  optional?: boolean;
  onChange: (value: ImageRef | undefined) => void;
}) {
  return (
    <>
      <ImageField
        label={label}
        spec={spec}
        whole={value?.whole}
        removable={optional}
        value={value?.src}
        // A new photo drops the old framing point, which was chosen for the previous image.
        onChange={(src) => onChange(src ? { src, alt: value?.alt ?? "", whole: value?.whole } : undefined)}
      />
      {value?.src && (
        <TextField
          label="Description de la photo (Google et accessibilité)"
          required
          value={value.alt}
          onChange={(alt) => onChange({ ...value, alt: alt ?? "" })}
        />
      )}
    </>
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

function SectionFields({
  section,
  set,
  name,
}: {
  section: SectionConfig;
  set: (section: SectionConfig) => void;
  name: string;
}) {
  switch (section.type) {
    case "hero":
      return (
        <>
          <TextField label="Sur-titre" value={section.eyebrow} onChange={(eyebrow) => set({ ...section, eyebrow })} />
          <TextField label="Titre" placeholder={name} value={section.title} onChange={(title) => set({ ...section, title })} />
          <TextField label="Accroche" value={section.headline} onChange={(headline) => set({ ...section, headline })} />
          <TextField label="Texte" multiline value={section.text} onChange={(text) => set({ ...section, text })} />
          <ImageRefField
            label="Photo"
            spec={section.variant === "split" ? imageSpecs.heroSplit : imageSpecs.heroFull}
            value={section.image}
            onChange={(image) => image && set({ ...section, image })}
          />
        </>
      );
    case "about":
      return (
        <>
          <IntroFields section={section} set={set} />
          <ImageRefField label="Photo" spec={imageSpecs.about} value={section.image} onChange={(image) => image && set({ ...section, image })} />
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
      );
    case "featured":
      return (
        <>
          <IntroFields section={section} set={set} />
          <span className="sf-label">Plats</span>
          <ListEditor
            items={section.items}
            onChange={(items) => set({ ...section, items })}
            create={() => ({ title: "Nouveau plat", text: "", image: { src: "", alt: "" } })}
            title={(item) => item.title}
            addLabel="Ajouter un plat"
            render={(item, setItem) => (
              <>
                <TextField label="Titre" required value={item.title} onChange={(title) => setItem({ ...item, title: title ?? "" })} />
                <TextField label="Texte" required multiline value={item.text} onChange={(text) => setItem({ ...item, text: text ?? "" })} />
                <ImageRefField
                  label="Photo"
                  spec={featuredSpecs[section.variant]}
                  value={item.image}
                  onChange={(image) => image && setItem({ ...item, image })}
                />
              </>
            )}
          />
        </>
      );
    case "menu":
      return (
        <>
          <IntroFields section={section} set={set} />
          {section.variant === "book" && (
            <TextField label="Note sur la couverture" value={section.coverNote} onChange={(coverNote) => set({ ...section, coverNote })} />
          )}
          <p className="sf-note">Les plats et les prix se gèrent dans l’onglet Menu.</p>
        </>
      );
    case "quote":
      return (
        <>
          <TextField label="Citation" required multiline value={section.quote} onChange={(quote) => set({ ...section, quote: quote ?? "" })} />
          <TextField label="Auteur" value={section.cite} onChange={(cite) => set({ ...section, cite })} />
          <ImageRefField label="Photo de fond" spec={imageSpecs.quote} value={section.image} onChange={(image) => image && set({ ...section, image })} />
        </>
      );
    case "reservation":
      return (
        <>
          <IntroFields section={section} set={set} />
          {section.variant === "form" && (
            <ImageRefField label="Photo" optional spec={imageSpecs.reservation} value={section.image} onChange={(image) => set({ ...section, image })} />
          )}
        </>
      );
    case "visit":
      return (
        <>
          <IntroFields section={section} set={set} />
          {section.variant === "photo" && (
            <ImageRefField label="Photo de façade" optional spec={imageSpecs.visit} value={section.image} onChange={(image) => set({ ...section, image })} />
          )}
        </>
      );
  }
}

export function ContentPanel({ config, update }: PanelProps) {
  return (
    <>
      <p className="sf-note admin-intro">Les textes et photos de chaque partie du site, dans l’ordre de la page.</p>
      {config.sections.map((section, index) =>
        section.enabled === false ? null : (
          <details key={index} className="sf-group admin-section">
            <summary>
              {sectionLabels[section.type]}
              {section.navLabel && <span> — {section.navLabel}</span>}
            </summary>
            <div className="sf-group-body">
              <SectionFields
                section={section}
                name={config.name}
                set={(next) => update((d) => void (d.sections[index] = next))}
              />
            </div>
          </details>
        )
      )}
    </>
  );
}
