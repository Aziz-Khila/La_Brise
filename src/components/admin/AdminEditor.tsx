"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { RestaurantConfig } from "@/config/types";
import { AdminImagesContext, resizeImage, type AdminImages } from "@/components/admin/images";
import { ContactPanel } from "@/components/admin/panels/ContactPanel";
import { ContentPanel } from "@/components/admin/panels/ContentPanel";
import { MenuPanel } from "@/components/admin/panels/MenuPanel";
import type { Recipe } from "@/components/admin/shared";

const tabs = [
  { id: "menu", label: "Menu", Panel: MenuPanel },
  { id: "content", label: "Textes & photos", Panel: ContentPanel },
  { id: "contact", label: "Contact & horaires", Panel: ContactPanel },
] as const;

const DRAFT_KEY = "admin-draft";

type Published = { config: RestaurantConfig; sha: string };
/** Uploaded image URL → Git blob id, or "" when the file was written to disk directly. */
type Uploads = Record<string, string>;
type Draft = { baseSha: string; config: RestaurantConfig; uploads: Uploads };
type Status = {
  kind: "idle" | "publishing" | "published" | "error";
  message?: string;
  reload?: boolean;
};

export function AdminEditor({ initial, sha }: { initial: RestaurantConfig; sha: string }) {
  const [published, setPublished] = useState<Published>({ config: initial, sha });
  const [config, setConfig] = useState(initial);
  const [uploads, setUploads] = useState<Uploads>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("menu");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [restored, setRestored] = useState(false);

  const dirty = useMemo(
    () => JSON.stringify(config) !== JSON.stringify(published.config),
    [config, published.config]
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      const draft = saved ? (JSON.parse(saved) as Draft) : null;
      if (draft?.baseSha === sha) {
        setConfig(draft.config);
        setUploads(draft.uploads);
      } else if (draft) {
        localStorage.removeItem(DRAFT_KEY);
        setStatus({
          kind: "error",
          message: "Le site a été modifié depuis votre dernier brouillon : ce brouillon a été écarté.",
        });
      }
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
    setRestored(true);
  }, [sha]);

  useEffect(() => {
    if (!restored) return;
    if (dirty) {
      const draft: Draft = { baseSha: published.sha, config, uploads };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } else {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [restored, dirty, config, uploads, published.sha]);

  const update = useCallback((recipe: Recipe) => {
    setConfig((current) => {
      const next = structuredClone(current);
      recipe(next);
      return next;
    });
    setStatus((current) => (current.kind === "published" ? { kind: "idle" } : current));
  }, []);

  const images = useMemo<AdminImages>(
    () => ({
      upload: async (file) => {
        const resized = await resizeImage(file);
        const body = new FormData();
        body.append("file", resized);
        const response = await fetch("/api/admin/upload", { method: "POST", body });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Échec de l’envoi.");
        setUploads((current) => ({ ...current, [data.url]: data.blobSha ?? "" }));
        setPreviews((current) => ({ ...current, [data.url]: URL.createObjectURL(resized) }));
        return data.url as string;
      },
      display: (src) => previews[src] ?? (uploads[src] ? null : src),
    }),
    [previews, uploads]
  );

  const publish = async () => {
    setStatus({ kind: "publishing" });
    const used = JSON.stringify(config);
    const pending = Object.entries(uploads)
      .filter(([url, blobSha]) => blobSha && used.includes(`"${url}"`))
      .map(([url, blobSha]) => ({ url, blobSha }));

    try {
      const response = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, baseSha: published.sha, images: pending }),
      });
      const data = await response.json();
      if (!response.ok) {
        setStatus({
          kind: "error",
          message: data.error ?? "La publication a échoué.",
          reload: response.status === 401 || response.status === 409,
        });
        return;
      }
      setPublished({ config: data.config, sha: data.sha });
      setConfig(data.config);
      setUploads({});
      setStatus({
        kind: "published",
        message: data.redeploy ? "Publié ! Le site sera à jour dans 1 à 2 minutes." : "Publié.",
      });
    } catch {
      setStatus({ kind: "error", message: "Connexion impossible. Vos modifications sont conservées, réessayez." });
    }
  };

  const discard = () => {
    if (!window.confirm("Annuler toutes les modifications non publiées ?")) return;
    setConfig(published.config);
    setUploads({});
    setStatus({ kind: "idle" });
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  };

  const publishing = status.kind === "publishing";
  const { Panel } = tabs.find((item) => item.id === tab)!;

  return (
    <AdminImagesContext.Provider value={images}>
      <div className="admin">
        <header className="admin-top">
          <div className="admin-title">
            <strong>{config.name}</strong>
            <span className={`admin-state${dirty ? " is-dirty" : ""}`}>
              {publishing ? "Publication…" : dirty ? "Modifications non publiées" : "Tout est publié"}
            </span>
          </div>
          <div className="admin-actions">
            <a className="sf-button" href="/" target="_blank" rel="noreferrer">
              Voir le site ↗
            </a>
            <button type="button" className="sf-button" onClick={discard} disabled={!dirty || publishing}>
              Annuler
            </button>
            <button
              type="button"
              className="sf-button sf-button--primary"
              onClick={publish}
              disabled={!dirty || publishing}
            >
              Publier
            </button>
          </div>
        </header>

        {status.message && (
          <p className={`admin-status is-${status.kind}`} role="status">
            {status.message}
            {status.reload && (
              <button type="button" className="sf-link" onClick={() => window.location.reload()}>
                Recharger
              </button>
            )}
          </p>
        )}

        <nav className="admin-tabs" aria-label="Rubriques">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={item.id === tab ? "page" : undefined}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <main className="admin-panel">
          <Panel config={config} update={update} />
        </main>

        <footer className="admin-foot">
          <button type="button" className="sf-link" onClick={logout}>
            Se déconnecter
          </button>
        </footer>
      </div>
    </AdminImagesContext.Provider>
  );
}
