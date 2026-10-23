"use client";

import { Group, ListEditor, TextField } from "@/components/admin/fields";
import type { PanelProps } from "@/components/admin/shared";

export function ContactPanel({ config, update }: PanelProps) {
  const { contact, location } = config;

  return (
    <>
      <Group title="Horaires">
        <ListEditor
          items={config.hours}
          onChange={(hours) => update((d) => void (d.hours = hours))}
          create={() => ({ days: "Lundi – Vendredi", time: "12h00 – 23h00" })}
          title={(row) => `${row.days} · ${row.time}`}
          addLabel="Ajouter une ligne"
          render={(row, set) => (
            <div className="sf-row">
              <TextField
                label="Jours"
                required
                value={row.days}
                onChange={(days) => set({ ...row, days: days ?? "" })}
              />
              <TextField
                label="Heures"
                required
                value={row.time}
                onChange={(time) => set({ ...row, time: time ?? "" })}
              />
            </div>
          )}
        />
      </Group>

      <Group title="Contact">
        <div className="sf-row">
          <TextField
            label="Téléphone"
            placeholder="+216 …"
            value={contact.phone}
            onChange={(value) => update((d) => void (d.contact.phone = value))}
          />
          <TextField
            label="WhatsApp"
            placeholder="+216 …"
            hint="Reçoit les réservations et les commandes."
            value={contact.whatsapp}
            onChange={(value) => update((d) => void (d.contact.whatsapp = value))}
          />
        </div>
        <TextField
          label="Email"
          value={contact.email}
          onChange={(value) => update((d) => void (d.contact.email = value))}
        />
        <TextField
          label="Instagram"
          placeholder="nom_du_compte"
          value={contact.instagram}
          onChange={(value) => update((d) => void (d.contact.instagram = value?.replace(/^@/, "")))}
        />
        <div className="sf-row">
          <TextField
            label="Facebook (lien)"
            value={contact.facebook}
            onChange={(value) => update((d) => void (d.contact.facebook = value))}
          />
          <TextField
            label="TikTok (lien)"
            value={contact.tiktok}
            onChange={(value) => update((d) => void (d.contact.tiktok = value))}
          />
        </div>
      </Group>

      <Group title="Adresse">
        <TextField
          label="Adresse"
          required
          value={location.address}
          onChange={(value) => update((d) => void (d.location.address = value ?? ""))}
        />
        <TextField
          label="Repère"
          placeholder="En face de…"
          value={location.note}
          onChange={(value) => update((d) => void (d.location.note = value))}
        />
        <TextField
          label="Lien Google Maps"
          required
          value={location.mapsUrl}
          onChange={(value) => update((d) => void (d.location.mapsUrl = value ?? ""))}
        />
      </Group>
    </>
  );
}
