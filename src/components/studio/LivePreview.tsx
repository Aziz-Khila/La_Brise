"use client";

import { useEffect, useState } from "react";
import type { RestaurantConfig } from "@/config/types";
import { RestaurantSite } from "@/components/RestaurantSite";
import { PREVIEW_CONFIG, PREVIEW_READY, PREVIEW_SCROLL } from "@/components/studio/shared";

/** Renders the site inside the studio iframe and re-renders whenever the editor posts a new config. */
export function LivePreview({ initial }: { initial: RestaurantConfig }) {
  const [restaurant, setRestaurant] = useState(initial);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === PREVIEW_CONFIG) setRestaurant(event.data.config);
      if (event.data?.type === PREVIEW_SCROLL) {
        document.getElementById(event.data.anchor)?.scrollIntoView({ behavior: "smooth" });
      }
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: PREVIEW_READY }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return <RestaurantSite restaurant={restaurant} />;
}
