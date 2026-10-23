"use client";

import { useContext, useRef, useState, type ReactNode } from "react";
import { AdminImagesContext } from "@/components/admin/images";
import type { ImageSpec } from "@/components/admin/shared";

type FieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="sf-field">
      <span className="sf-label">{label}</span>
      {children}
      {hint && <span className="sf-hint">{hint}</span>}
    </label>
  );
}

export function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="sf-group">
      <h3>{title}</h3>
      <div className="sf-group-body">{children}</div>
    </section>
  );
}

type TextFieldProps = {
  label: string;
  value: string | undefined;
  /** Optional fields report `undefined` when cleared so they disappear from the JSON. */
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
  required?: boolean;
};

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  multiline,
  required,
}: TextFieldProps) {
  const handle = (next: string) => onChange(next === "" && !required ? undefined : next);
  return (
    <Field label={label} hint={hint}>
      {multiline ? (
        <textarea
          className="sf-input"
          rows={3}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(event) => handle(event.target.value)}
        />
      ) : (
        <input
          className="sf-input"
          type="text"
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(event) => handle(event.target.value)}
        />
      )}
    </Field>
  );
}

export type Option<T extends string> = { value: T; label: string };

function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}

function describeShape({ width, height }: { width: number; height: number }) {
  const divisor = gcd(width, height);
  const ratio = `${width / divisor}:${height / divisor}`;
  if (width === height) return "carré";
  return `${width > height ? "paysage" : "portrait"} ${ratio}`;
}

/** Warnings comparing the uploaded image with the slot's recommended size. */
function checkImage(spec: ImageSpec, size: { width: number; height: number }, whole?: boolean) {
  const warnings: string[] = [];
  const scale = whole
    ? Math.max(size.width, size.height) / Math.max(spec.width, spec.height)
    : Math.min(size.width / spec.width, size.height / spec.height);
  if (scale < 0.5) warnings.push("Trop petite : elle sera floue.");
  else if (scale < 0.75) warnings.push("Un peu petite : légèrement floue sur grand écran.");
  const expected = spec.width / spec.height;
  const actual = size.width / size.height;
  if (!whole && Math.abs(actual - expected) / expected > 0.2) {
    warnings.push("Format différent : l’image sera recadrée.");
  }
  return warnings;
}

export function ImageField({
  label,
  value,
  onChange,
  hint,
  spec,
  whole,
  removable,
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  hint?: string;
  spec?: ImageSpec;
  /** The slot shows the image uncropped, so only its resolution matters. */
  whole?: boolean;
  removable?: boolean;
}) {
  const images = useContext(AdminImagesContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string>();
  const [loaded, setLoaded] = useState<{ src: string; width: number; height: number }>();
  const shown = value ? (images?.display(value) ?? null) : null;
  const size = loaded && loaded.src === shown ? loaded : undefined;
  const warnings = spec && size ? checkImage(spec, size, whole) : [];

  const upload = async (file: File) => {
    if (!images) return;
    setStatus("uploading");
    try {
      onChange(await images.upload(file));
      setStatus("idle");
    } catch (uploadError) {
      setStatus("error");
      setError(uploadError instanceof Error ? uploadError.message : "Échec de l’envoi.");
    }
  };

  return (
    <div className="sf-field">
      <span className="sf-label">{label}</span>
      <div className="sf-image">
        <div className="sf-image-thumb">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shown}
              alt=""
              ref={(img) => {
                if (img?.complete && img.naturalWidth && loaded?.src !== shown) {
                  setLoaded({ src: shown, width: img.naturalWidth, height: img.naturalHeight });
                }
              }}
              onLoad={(event) =>
                setLoaded({
                  src: shown,
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight,
                })
              }
            />
          ) : (
            <span>{value ? "Visible après publication" : "Aucune image"}</span>
          )}
        </div>
        <div className="sf-image-actions">
          <button
            type="button"
            className="sf-button"
            disabled={status === "uploading"}
            onClick={() => inputRef.current?.click()}
          >
            {status === "uploading" ? "Envoi…" : value ? "Remplacer" : "Ajouter une photo"}
          </button>
          {value && removable && (
            <button type="button" className="sf-link" onClick={() => onChange(undefined)}>
              Retirer
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) upload(file);
              event.target.value = "";
            }}
          />
        </div>
      </div>
      {spec && (
        <div className="sf-spec">
          <span>
            {whole ? (
              <>
                Idéal : <strong>{Math.max(spec.width, spec.height)} px</strong> sur le grand côté · tout
                format
              </>
            ) : (
              <>
                Idéal : <strong>{spec.width} × {spec.height} px</strong> · {describeShape(spec)}
              </>
            )}
            {spec.transparent && " · PNG transparent"}
          </span>
          {size && (
            <span className={warnings.length ? "is-warning" : "is-ok"}>
              Votre image : {size.width} × {size.height} px
              {warnings.length ? ` — ${warnings.join(" ")}` : " ✓"}
            </span>
          )}
          {spec.note && <span className="sf-hint">{spec.note}</span>}
        </div>
      )}
      {status === "error" && <span className="sf-error">{error}</span>}
      {hint && <span className="sf-hint">{hint}</span>}
    </div>
  );
}

type ListEditorProps<T> = {
  items: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  title: (item: T, index: number) => string;
  render: (item: T, update: (item: T) => void, index: number) => ReactNode;
  addLabel: string;
};

/** Collapsible, reorderable list used for menu categories, dishes, hours… */
export function ListEditor<T>({ items, onChange, create, title, render, addLabel }: ListEditorProps<T>) {
  const [open, setOpen] = useState<number | null>(null);

  const update = (index: number, item: T) =>
    onChange(items.map((current, i) => (i === index ? item : current)));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
    if (open === index) setOpen(target);
  };

  const remove = (index: number) => {
    if (!window.confirm(`Supprimer « ${title(items[index], index)} » ?`)) return;
    onChange(items.filter((_, i) => i !== index));
    setOpen(null);
  };

  return (
    <div className="sf-list">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={index} className={`sf-list-item${isOpen ? " is-open" : ""}`}>
            <div className="sf-list-head">
              <button
                type="button"
                className="sf-list-title"
                onClick={() => setOpen(isOpen ? null : index)}
                aria-expanded={isOpen}
              >
                <span className="sf-caret" aria-hidden="true">
                  ▸
                </span>
                {title(item, index)}
              </button>
              <div className="sf-list-tools">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Monter">
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label="Descendre"
                >
                  ↓
                </button>
                <button type="button" onClick={() => remove(index)} aria-label="Supprimer">
                  ✕
                </button>
              </div>
            </div>
            {isOpen && (
              <div className="sf-list-body">{render(item, (next) => update(index, next), index)}</div>
            )}
          </div>
        );
      })}
      <button
        type="button"
        className="sf-button sf-button--dashed"
        onClick={() => {
          onChange([...items, create()]);
          setOpen(items.length);
        }}
      >
        + {addLabel}
      </button>
    </div>
  );
}
