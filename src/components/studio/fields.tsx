"use client";

import { useRef, useState, type ReactNode } from "react";
import type { ImageSpec } from "@/components/studio/shared";

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

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
}) {
  return (
    <Field label={label}>
      <input
        className="sf-input"
        type="number"
        min={min}
        max={max}
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value === "" ? undefined : Number(event.target.value))
        }
      />
    </Field>
  );
}

export type Option<T extends string> = { value: T; label: string };

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <select
        className="sf-input"
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/** Pill buttons for picking one of a few layout variants. */
export function ChoiceField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="sf-field">
      <span className="sf-label">{label}</span>
      <div className="sf-choices">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className="sf-choice"
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ToggleField({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="sf-toggle">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="sf-toggle-track" aria-hidden="true" />
      <span className="sf-toggle-text">
        {label}
        {hint && <small>{hint}</small>}
      </span>
    </label>
  );
}

export function ColorField({
  label,
  value,
  overridden,
  onChange,
  onReset,
}: {
  label: string;
  value: string;
  overridden: boolean;
  onChange: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="sf-color">
      <input type="color" value={value} onChange={(event) => onChange(event.target.value)} />
      <span className="sf-color-text">
        {label}
        <code>{value}</code>
      </span>
      {overridden && (
        <button type="button" className="sf-link" onClick={onReset}>
          Réinitialiser
        </button>
      )}
    </div>
  );
}

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
function checkImage(
  spec: ImageSpec,
  size: { width: number; height: number },
  src: string,
  whole?: boolean
) {
  const warnings: string[] = [];
  const scale = whole
    ? Math.max(size.width, size.height) / Math.max(spec.width, spec.height)
    : Math.min(size.width / spec.width, size.height / spec.height);
  if (scale < 0.5) warnings.push("Trop petite : elle sera floue.");
  else if (scale < 0.75) warnings.push("Un peu petite : légèrement floue sur grand écran.");
  const expected = spec.width / spec.height;
  const actual = size.width / size.height;
  if (!whole && Math.abs(actual - expected) / expected > 0.2) {
    warnings.push("Format différent : l’image sera recadrée, choisissez le point à garder ci-dessous.");
  }
  if (spec.transparent && /\.jpe?g$/i.test(src)) {
    warnings.push("JPG sans transparence : utilisez un PNG.");
  }
  return warnings;
}

export function ImageField({
  label,
  value,
  slug,
  onChange,
  hint,
  spec,
  whole,
}: {
  label: string;
  value: string | undefined;
  slug: string;
  onChange: (value: string | undefined) => void;
  hint?: string;
  spec?: ImageSpec;
  /** The slot shows the image uncropped, so only its resolution matters. */
  whole?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string>();
  const [loaded, setLoaded] = useState<{ src: string; width: number; height: number }>();
  const size = loaded && loaded.src === value ? loaded : undefined;
  const warnings = spec && size && value ? checkImage(spec, size, value, whole) : [];

  const upload = async (file: File) => {
    setStatus("uploading");
    const body = new FormData();
    body.append("slug", slug);
    body.append("file", file);
    const response = await fetch("/api/studio/upload", { method: "POST", body });
    const data = await response.json();
    if (!response.ok) {
      setStatus("error");
      setError(data.error);
      return;
    }
    setStatus("idle");
    onChange(data.url);
  };

  return (
    <div className="sf-field">
      <span className="sf-label">{label}</span>
      <div className="sf-image">
        <div className="sf-image-thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {value ? (
            <img
              src={value}
              alt=""
              ref={(img) => {
                if (img?.complete && img.naturalWidth && loaded?.src !== value) {
                  setLoaded({ src: value, width: img.naturalWidth, height: img.naturalHeight });
                }
              }}
              onLoad={(event) =>
                setLoaded({
                  src: value,
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight,
                })
              }
            />
          ) : (
            <span>Aucune image</span>
          )}
        </div>
        <div className="sf-image-actions">
          <button
            type="button"
            className="sf-button"
            disabled={status === "uploading"}
            onClick={() => inputRef.current?.click()}
          >
            {status === "uploading" ? "Envoi…" : value ? "Remplacer" : "Téléverser"}
          </button>
          {value && (
            <button type="button" className="sf-link" onClick={() => onChange(undefined)}>
              Retirer
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) upload(file);
              event.target.value = "";
            }}
          />
        </div>
      </div>
      <input
        className="sf-input sf-input--small"
        type="text"
        value={value ?? ""}
        placeholder="/restaurants/…/photo.png"
        onChange={(event) => onChange(event.target.value || undefined)}
      />
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

function parseFocus(focus: string | undefined) {
  const match = focus?.match(/^(\d+(?:\.\d+)?)% (\d+(?:\.\d+)?)%$/);
  return match ? { x: Number(match[1]), y: Number(match[2]) } : { x: 50, y: 50 };
}

/** Same maths as object-fit: cover + object-position, in percent of the image. */
function cropWindow(imageRatio: number, frameRatio: number, focus: { x: number; y: number }, zoom = 1) {
  const cover =
    imageRatio > frameRatio
      ? { width: (frameRatio / imageRatio) * 100, height: 100 }
      : { width: 100, height: (imageRatio / frameRatio) * 100 };
  const left = (100 - cover.width) * (focus.x / 100);
  const top = (100 - cover.height) * (focus.y / 100);
  const width = cover.width / zoom;
  const height = cover.height / zoom;
  return {
    left: left + (cover.width - width) / 2,
    top: top + (cover.height - height) / 2,
    width,
    height,
  };
}

/** Click on the photo to choose which part stays visible when the frame crops it. */
export function FocusField({
  src,
  value,
  spec,
  onChange,
}: {
  src: string;
  value: string | undefined;
  spec: ImageSpec;
  onChange: (value: string | undefined) => void;
}) {
  const [ratio, setRatio] = useState<{ src: string; value: number }>();
  const focus = parseFocus(value ?? spec.focus);
  const imageRatio = ratio?.src === src ? ratio.value : undefined;
  const crop = imageRatio
    ? cropWindow(imageRatio, spec.width / spec.height, focus, spec.zoom)
    : undefined;

  const measure = (img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth && ratio?.src !== src) {
      setRatio({ src, value: img.naturalWidth / img.naturalHeight });
    }
  };

  return (
    <div className="sf-field">
      <span className="sf-label">Cadrage</span>
      <div
        className="sf-focus"
        onClick={(event) => {
          const box = event.currentTarget.getBoundingClientRect();
          const x = Math.round(((event.clientX - box.left) / box.width) * 100);
          const y = Math.round(((event.clientY - box.top) / box.height) * 100);
          const clamp = (n: number) => Math.min(100, Math.max(0, n));
          onChange(`${clamp(x)}% ${clamp(y)}%`);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" ref={measure} onLoad={(event) => measure(event.currentTarget)} draggable={false} />
        {crop && (
          <span
            className="sf-focus-window"
            style={{
              left: `${crop.left}%`,
              top: `${crop.top}%`,
              width: `${crop.width}%`,
              height: `${crop.height}%`,
            }}
          />
        )}
        <span className="sf-focus-dot" style={{ left: `${focus.x}%`, top: `${focus.y}%` }} />
      </div>
      <span className="sf-hint">
        Cliquez sur le sujet à garder visible. Le cadre clair montre la partie affichée sur ordinateur.
        {value && (
          <>
            {" "}
            <button type="button" className="sf-link" onClick={() => onChange(undefined)}>
              Recentrer
            </button>
          </>
        )}
      </span>
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
  /** Extra controls in each item header, e.g. a visibility toggle. */
  headerExtra?: (item: T, update: (item: T) => void) => ReactNode;
};

/** Collapsible, reorderable list used for sections, menu categories, dishes, hours… */
export function ListEditor<T>({
  items,
  onChange,
  create,
  title,
  render,
  addLabel,
  headerExtra,
}: ListEditorProps<T>) {
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
              {headerExtra?.(item, (next) => update(index, next))}
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
