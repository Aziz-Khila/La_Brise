"use client";

import { useState } from "react";
import type { MenuItem, MenuTag } from "@/config/types";
import { formatPrice } from "@/lib/links";
import { Field, Group, ImageField, ListEditor, TextField } from "@/components/studio/fields";
import { imageSpecs, slugify, tagOptions, type PanelProps } from "@/components/studio/shared";

function PriceField({ value, onChange }: { value: number | string; onChange: (value: number | string) => void }) {
  const [text, setText] = useState(String(value));

  return (
    <Field label="Prix" hint="Un nombre (ex. 12.5) ou un texte libre (ex. 18 / 24 DT).">
      <input
        className="sf-input"
        type="text"
        value={text}
        onChange={(event) => {
          const next = event.target.value;
          setText(next);
          const normalized = next.trim().replace(",", ".");
          onChange(/^\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : next);
        }}
      />
    </Field>
  );
}

function TagPicker({ value, onChange }: { value: MenuTag[] | undefined; onChange: (tags: MenuTag[] | undefined) => void }) {
  const tags = value ?? [];
  return (
    <div className="sf-field">
      <span className="sf-label">Étiquettes</span>
      <div className="sf-choices">
        {tagOptions.map((option) => {
          const active = tags.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              className="sf-choice"
              aria-pressed={active}
              onClick={() => {
                const next = active ? tags.filter((tag) => tag !== option.value) : [...tags, option.value];
                onChange(next.length ? next : undefined);
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MenuPanel({ config, update }: PanelProps) {
  const usesBook = config.sections.some((section) => section.type === "menu" && section.variant === "book");

  return (
    <Group title="Carte">
      <p className="sf-note">
        {usesBook
          ? "Style livre : un plat avec une image détourée (PNG transparent) obtient sa propre page."
          : "Les photos des plats s’affichent en vignette à côté du nom."}
      </p>
      <ListEditor
        items={config.menu}
        onChange={(menu) => update((d) => void (d.menu = menu))}
        create={() => {
          const n = config.menu.length + 1;
          return { id: `categorie-${n}`, name: `Catégorie ${n}`, items: [] };
        }}
        title={(category) => `${category.name} · ${category.items.length} plat${category.items.length > 1 ? "s" : ""}`}
        addLabel="Ajouter une catégorie"
        render={(category, setCategory) => (
          <div className="sf-stack">
            <TextField
              label="Nom de la catégorie"
              required
              value={category.name}
              onChange={(name) => {
                const autoId = category.id === slugify(category.name) || /^categorie-\d+$/.test(category.id);
                setCategory({ ...category, name: name ?? "", id: autoId ? slugify(name ?? "") || category.id : category.id });
              }}
            />
            <TextField
              label="Description"
              value={category.description}
              onChange={(description) => setCategory({ ...category, description })}
            />
            <span className="sf-label">Plats</span>
            <ListEditor<MenuItem>
              items={category.items}
              onChange={(items) => setCategory({ ...category, items })}
              create={() => ({ name: "Nouveau plat", price: 0 })}
              title={(item) => `${item.name} — ${formatPrice(item.price, config.currency)}`}
              addLabel="Ajouter un plat"
              render={(item, setItem) => (
                <div className="sf-stack">
                  <div className="sf-row sf-row--wide">
                    <TextField label="Nom" required value={item.name} onChange={(name) => setItem({ ...item, name: name ?? "" })} />
                    <PriceField value={item.price} onChange={(price) => setItem({ ...item, price })} />
                  </div>
                  <TextField
                    label="Description"
                    multiline
                    value={item.description}
                    onChange={(description) => setItem({ ...item, description })}
                  />
                  <TagPicker value={item.tags} onChange={(tags) => setItem({ ...item, tags })} />
                  <ImageField
                    label="Photo (vignette)"
                    slug={config.slug}
                    spec={imageSpecs.menuThumb}
                    value={item.image}
                    onChange={(image) => setItem({ ...item, image })}
                  />
                  {usesBook && (
                    <ImageField
                      label="Image détourée (page du livre)"
                      slug={config.slug}
                      spec={imageSpecs.cutout}
                      value={item.cutout}
                      onChange={(cutout) => setItem({ ...item, cutout })}
                    />
                  )}
                </div>
              )}
            />
          </div>
        )}
      />
    </Group>
  );
}
