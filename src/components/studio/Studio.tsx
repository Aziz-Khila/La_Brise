"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RestaurantConfig } from "@/config/types";
import { ContactPanel } from "@/components/studio/panels/ContactPanel";
import { GeneralPanel } from "@/components/studio/panels/GeneralPanel";
import { MenuPanel } from "@/components/studio/panels/MenuPanel";
import { SectionsPanel } from "@/components/studio/panels/SectionsPanel";
import { ThemePanel } from "@/components/studio/panels/ThemePanel";
import {
  PREVIEW_CONFIG,
  PREVIEW_READY,
  PREVIEW_SCROLL,
  sectionAnchor,
  type Recipe,
} from "@/components/studio/shared";

const tabs = [
  { id: "general", label: "Général", Panel: GeneralPanel },
  { id: "theme", label: "Thème", Panel: ThemePanel },
  { id: "sections", label: "Sections", Panel: SectionsPanel },
  { id: "menu", label: "Menu", Panel: MenuPanel },
  { id: "contact", label: "Contact", Panel: ContactPanel },
] as const;

const devices = [
  { id: "desktop", label: "Ordinateur", width: "100%" },
  { id: "tablet", label: "Tablette", width: "820px" },
  { id: "mobile", label: "Mobile", width: "390px" },
] as const;

type SaveState = "saved" | "pending" | "saving" | "error";

const saveLabels: Record<SaveState, string> = {
  saved: "Enregistré",
  pending: "Modifications…",
  saving: "Enregistrement…",
  error: "Erreur d’enregistrement",
};

const AUTOSAVE_DELAY = 700;
const HISTORY_LIMIT = 60;
/** Keystrokes closer together than this are undone as one step. */
const HISTORY_COALESCE = 1000;

export function Studio({ initial }: { initial: RestaurantConfig }) {
  const [config, setConfig] = useState(initial);
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("general");
  const [device, setDevice] = useState<(typeof devices)[number]["id"]>("desktop");
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [history, setHistory] = useState<RestaurantConfig[]>([]);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const configRef = useRef(config);
  const lastHistoryPush = useRef(0);
  const firstRender = useRef(true);

  const postToPreview = useCallback((next: RestaurantConfig) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: PREVIEW_CONFIG, config: next },
      window.location.origin
    );
  }, []);

  const update = useCallback((recipe: Recipe) => {
    const previous = configRef.current;
    const next = structuredClone(previous);
    recipe(next);

    const now = Date.now();
    if (now - lastHistoryPush.current > HISTORY_COALESCE) {
      setHistory((stack) => [...stack.slice(-HISTORY_LIMIT + 1), previous]);
    }
    lastHistoryPush.current = now;

    configRef.current = next;
    setConfig(next);
  }, []);

  const undo = useCallback(() => {
    const previous = history.at(-1);
    if (!previous) return;
    configRef.current = previous;
    lastHistoryPush.current = 0;
    setConfig(previous);
    setHistory(history.slice(0, -1));
  }, [history]);

  useEffect(() => {
    postToPreview(config);

    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    setSaveState("pending");
    const timer = setTimeout(async () => {
      setSaveState("saving");
      try {
        const response = await fetch(`/api/studio/restaurants/${config.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        });
        setSaveState(response.ok ? "saved" : "error");
      } catch {
        setSaveState("error");
      }
    }, AUTOSAVE_DELAY);
    return () => clearTimeout(timer);
  }, [config, postToPreview]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === PREVIEW_READY) postToPreview(configRef.current);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [postToPreview]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, select")) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo]);

  useEffect(() => {
    if (saveState === "saved") return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [saveState]);

  const { Panel } = tabs.find((item) => item.id === tab)!;
  const width = devices.find((item) => item.id === device)!.width;

  return (
    <div className="studio">
      <aside className="studio-side">
        <header className="studio-top">
          <Link href="/studio" className="studio-back">
            ← Restaurants
          </Link>
          <div className="studio-title">
            <strong>{config.name || "Sans nom"}</strong>
            <span className={`studio-save is-${saveState}`}>{saveLabels[saveState]}</span>
          </div>
          <button
            type="button"
            className="sf-button"
            onClick={undo}
            disabled={history.length === 0}
            title="Annuler (Ctrl+Z)"
          >
            Annuler
          </button>
        </header>

        <nav className="studio-tabs" aria-label="Réglages">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={item.id === tab ? "page" : undefined}
              onClick={() => {
                setTab(item.id);
                const menu = config.sections.find((section) => section.type === "menu");
                if (item.id === "menu" && menu) {
                  iframeRef.current?.contentWindow?.postMessage(
                    { type: PREVIEW_SCROLL, anchor: sectionAnchor(menu) },
                    window.location.origin
                  );
                }
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="studio-panel">
          <Panel config={config} update={update} />
        </div>
      </aside>

      <main className="studio-stage">
        <div className="studio-toolbar">
          <div className="studio-devices" role="group" aria-label="Taille d’écran">
            {devices.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={item.id === device}
                onClick={() => setDevice(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <a className="studio-open" href={`/preview/${config.slug}`} target="_blank" rel="noreferrer">
            Ouvrir dans un onglet ↗
          </a>
        </div>
        <div className="studio-frame-wrap">
          <iframe
            ref={iframeRef}
            className="studio-frame"
            style={{ width }}
            src={`/studio/preview/${config.slug}`}
            title={`Aperçu de ${config.name}`}
          />
        </div>
      </main>
    </div>
  );
}
