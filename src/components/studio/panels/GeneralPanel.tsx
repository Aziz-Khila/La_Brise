"use client";

import type { MotionLevel } from "@/config/types";
import { CtaField } from "@/components/studio/CtaField";
import { Group, ImageField, SelectField, TextField, ToggleField } from "@/components/studio/fields";
import { imageSpecs, motionOptions, type PanelProps } from "@/components/studio/shared";

export function GeneralPanel({ config, update }: PanelProps) {
  return (
    <>
      <Group title="Identité">
        <TextField
          label="Nom du restaurant"
          required
          value={config.name}
          onChange={(value) => update((d) => void (d.name = value ?? ""))}
        />
        <div className="sf-row">
          <TextField
            label="Type"
            required
            placeholder="Cafe Restaurant, Pizzeria…"
            value={config.kind}
            onChange={(value) => update((d) => void (d.kind = value ?? ""))}
          />
          <TextField
            label="Ville"
            required
            value={config.city}
            onChange={(value) => update((d) => void (d.city = value ?? ""))}
          />
        </div>
        <ImageField
          label="Logo"
          slug={config.slug}
          value={config.logo}
          spec={imageSpecs.logo}
          hint="Sans logo, le nom s’affiche seul."
          onChange={(value) => update((d) => void (d.logo = value))}
        />
        <TextField
          label="Devise"
          required
          value={config.currency}
          onChange={(value) => update((d) => void (d.currency = value ?? ""))}
        />
      </Group>

      <Group title="Google & partage">
        <TextField
          label="Titre de la page"
          required
          value={config.seo.title}
          onChange={(value) => update((d) => void (d.seo.title = value ?? ""))}
        />
        <TextField
          label="Description"
          required
          multiline
          value={config.seo.description}
          onChange={(value) => update((d) => void (d.seo.description = value ?? ""))}
        />
      </Group>

      <Group title="Boutons d’action">
        <CtaField
          label="Bouton dans l’en-tête"
          value={config.header?.cta}
          sections={config.sections}
          onChange={(cta) => update((d) => void (d.header = cta ? { cta } : undefined))}
        />
        <ToggleField
          label="Bouton WhatsApp flottant"
          hint={config.contact.whatsapp ? undefined : "Ajoutez un numéro WhatsApp dans Contact."}
          checked={Boolean(config.floatingWhatsapp?.enabled)}
          onChange={(enabled) =>
            update((d) => void (d.floatingWhatsapp = { ...d.floatingWhatsapp, enabled }))
          }
        />
        {config.floatingWhatsapp?.enabled && (
          <TextField
            label="Message pré-rempli"
            placeholder="Bonjour, je souhaite passer une commande."
            value={config.floatingWhatsapp.message}
            onChange={(message) =>
              update((d) => void (d.floatingWhatsapp = { enabled: true, message }))
            }
          />
        )}
      </Group>

      <Group title="Animations & pied de page">
        <SelectField<MotionLevel>
          label="Niveau d’animation"
          value={config.motion}
          options={motionOptions}
          onChange={(value) => update((d) => void (d.motion = value))}
        />
        <TextField
          label="Note du pied de page"
          placeholder="Photos : @instagram"
          value={config.footer?.note}
          onChange={(note) => update((d) => void (d.footer = note ? { note } : undefined))}
        />
      </Group>
    </>
  );
}
