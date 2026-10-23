"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { slugify } from "@/components/studio/shared";

export type RestaurantSummary = {
  slug: string;
  name: string;
  kind: string;
  city: string;
  logo?: string;
  background: string;
  accent: string;
  text: string;
  /** Folder of the standalone project, once the restaurant has been exported. */
  exportedTo?: string;
};

type StudioDashboardProps = {
  restaurants: RestaurantSummary[];
  exportDir: string;
};

export function StudioDashboard({ restaurants, exportDir }: StudioDashboardProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [from, setFrom] = useState(restaurants[0]?.slug ?? "");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    const response = await fetch("/api/studio/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, from }),
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) return setError(data.error);
    router.push(`/studio/${data.slug}`);
  };

  const remove = async (restaurant: RestaurantSummary) => {
    const answer = window.prompt(
      `Supprimer définitivement « ${restaurant.name} » ? Tapez ${restaurant.slug} pour confirmer.`
    );
    if (answer !== restaurant.slug) return;
    await fetch(`/api/studio/restaurants/${restaurant.slug}`, { method: "DELETE" });
    router.refresh();
  };

  const exportProject = async (restaurant: RestaurantSummary) => {
    const confirmed = window.confirm(
      `Exporter « ${restaurant.name} » comme projet indépendant dans ${exportDir} ?\n\n` +
        "Ensuite, toutes les modifications de ce restaurant se font dans ce dossier, plus dans ce studio."
    );
    if (!confirmed) return;
    const response = await fetch(`/api/studio/restaurants/${restaurant.slug}/export`, { method: "POST" });
    const data = await response.json();
    if (!response.ok) return window.alert(data.error);
    window.alert(
      `Projet exporté dans ${data.dir}` +
        (data.git ? "\nUn premier commit Git a été créé." : "\nGit n’a pas pu initialiser le dépôt.")
    );
    router.refresh();
  };

  return (
    <div className="studio-home">
      <header className="studio-home-head">
        <div>
          <h1>Studio</h1>
          <p>Chaque restaurant est un fichier dans content/restaurants. Les modifications sont enregistrées automatiquement.</p>
        </div>
      </header>

      <div className="studio-cards">
        {restaurants.map((restaurant) => (
          <article key={restaurant.slug} className="studio-card">
            <Link
              href={`/studio/${restaurant.slug}`}
              className="studio-card-preview"
              style={{ background: restaurant.background, color: restaurant.text }}
            >
              {restaurant.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={restaurant.logo} alt="" />
              ) : (
                <span className="studio-card-name">{restaurant.name}</span>
              )}
              <i style={{ background: restaurant.accent }} />
            </Link>
            <div className="studio-card-body">
              <strong>{restaurant.name}</strong>
              <span>
                {restaurant.kind} · {restaurant.city}
              </span>
              <code>{restaurant.slug}</code>
            </div>
            <div className="studio-card-actions">
              <Link href={`/studio/${restaurant.slug}`} className="sf-button sf-button--primary">
                Éditer
              </Link>
              <a href={`/preview/${restaurant.slug}`} target="_blank" rel="noreferrer" className="sf-button">
                Aperçu ↗
              </a>
              {restaurant.exportedTo ? (
                <span className="studio-card-exported" title={restaurant.exportedTo}>
                  Exporté ✓
                </span>
              ) : (
                <button type="button" className="sf-button" onClick={() => exportProject(restaurant)}>
                  Exporter
                </button>
              )}
              <button type="button" className="sf-link" onClick={() => remove(restaurant)}>
                Supprimer
              </button>
            </div>
          </article>
        ))}

        <form className="studio-card studio-new" onSubmit={create}>
          <h2>Nouveau restaurant</h2>
          <label className="sf-field">
            <span className="sf-label">Nom</span>
            <input
              className="sf-input"
              required
              value={name}
              placeholder="Le Petit Bistro"
              onChange={(event) => {
                setName(event.target.value);
                if (!slugEdited) setSlug(slugify(event.target.value));
              }}
            />
          </label>
          <label className="sf-field">
            <span className="sf-label">Identifiant (dans l’URL et RESTAURANT=…)</span>
            <input
              className="sf-input"
              required
              value={slug}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              placeholder="le-petit-bistro"
              onChange={(event) => {
                setSlugEdited(true);
                setSlug(event.target.value);
              }}
            />
          </label>
          <label className="sf-field">
            <span className="sf-label">Partir de</span>
            <select className="sf-input" value={from} onChange={(event) => setFrom(event.target.value)}>
              {restaurants.map((restaurant) => (
                <option key={restaurant.slug} value={restaurant.slug}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </label>
          {error && <span className="sf-error">{error}</span>}
          <button type="submit" className="sf-button sf-button--primary" disabled={busy || !from}>
            {busy ? "Création…" : "Créer et éditer"}
          </button>
        </form>
      </div>
    </div>
  );
}
