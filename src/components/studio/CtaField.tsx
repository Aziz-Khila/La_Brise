"use client";

import type { Cta, CtaAction, SectionConfig } from "@/config/types";
import { sectionAnchor, sectionLabels } from "@/components/studio/shared";

type CtaFieldProps = {
  label: string;
  value: Cta | undefined;
  sections: SectionConfig[];
  onChange: (value: Cta | undefined) => void;
};

const fixedActions: { value: CtaAction; label: string }[] = [
  { value: "tour", label: "Visite guidée (défilement auto)" },
  { value: "whatsapp", label: "Ouvrir WhatsApp" },
  { value: "call", label: "Appeler" },
  { value: "maps", label: "Ouvrir Google Maps" },
  { value: "instagram", label: "Ouvrir Instagram" },
];

export function CtaField({ label, value, sections, onChange }: CtaFieldProps) {
  const anchors = sections
    .filter((section) => section.type !== "hero")
    .map((section) => ({
      value: `#${sectionAnchor(section)}` as CtaAction,
      label: `Aller à : ${section.navLabel ?? sectionLabels[section.type]}`,
    }));
  const actions = [...anchors, ...fixedActions];
  const knownAction = actions.some((action) => action.value === value?.action);

  return (
    <div className="sf-field">
      <span className="sf-label">{label}</span>
      <div className="sf-cta">
        <select
          className="sf-input"
          value={value ? value.action : ""}
          onChange={(event) => {
            const action = event.target.value as CtaAction | "";
            if (!action) return onChange(undefined);
            onChange({ label: value?.label ?? "Découvrir", action });
          }}
        >
          <option value="">— Aucun bouton —</option>
          {actions.map((action) => (
            <option key={action.value} value={action.value}>
              {action.label}
            </option>
          ))}
          {value && !knownAction && <option value={value.action}>{value.action}</option>}
        </select>
        {value && (
          <input
            className="sf-input"
            type="text"
            value={value.label}
            placeholder="Texte du bouton"
            onChange={(event) => onChange({ ...value, label: event.target.value })}
          />
        )}
      </div>
    </div>
  );
}
