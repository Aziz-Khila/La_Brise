"use client";

import { useCallback, useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { prefersReducedMotion } from "@/lib/motion";

/** ~px per second — steady tour pace through the page */
const AUTO_SCROLL_SPEED = 90;
/** Ignore interrupt gestures right after starting (click/touch release). */
const IGNORE_MS = 400;

const INTERRUPT_KEYS = new Set([
  "ArrowDown",
  "ArrowUp",
  "PageDown",
  "PageUp",
  "Home",
  "End",
  " ",
]);

/** Slow auto-scroll through the whole page; any wheel, touch or key press stops it. */
export function useTour() {
  const lenis = useLenis();
  const autoScrolling = useRef(false);
  const ignoreUntil = useRef(0);

  useEffect(() => {
    if (!lenis) return;

    const stop = (immediate: boolean) => {
      if (!autoScrolling.current) return;
      if (performance.now() < ignoreUntil.current) return;
      autoScrolling.current = false;
      if (immediate) {
        lenis.scrollTo(lenis.scroll, { immediate: true });
      }
    };

    const unsub = lenis.on("virtual-scroll", () => stop(false));
    const onKeyDown = (event: KeyboardEvent) => {
      if (INTERRUPT_KEYS.has(event.key)) stop(true);
    };
    window.addEventListener("keydown", onKeyDown, { passive: true });

    return () => {
      unsub();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lenis]);

  return useCallback(() => {
    if (!lenis) {
      const top = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      return;
    }

    if (prefersReducedMotion()) {
      lenis.scrollTo(lenis.limit, { immediate: true });
      return;
    }

    const remaining = Math.max(0, lenis.limit - lenis.scroll);
    if (remaining < 8) return;

    autoScrolling.current = true;
    ignoreUntil.current = performance.now() + IGNORE_MS;
    const duration = Math.min(36, Math.max(8, remaining / AUTO_SCROLL_SPEED));

    lenis.scrollTo(lenis.limit, {
      duration,
      easing: (t) => t,
      lock: false,
      programmatic: true,
      onComplete: () => {
        autoScrolling.current = false;
      },
    });
  }, [lenis]);
}
