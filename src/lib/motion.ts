import type { MotionLevel } from "@/config/types";

/** Motion level chosen by the restaurant, downgraded to "none" when the visitor prefers reduced motion. */
export function motionLevel(): MotionLevel {
  if (typeof window === "undefined") return "none";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "none";
  }
  const level = document
    .querySelector<HTMLElement>("[data-motion]")
    ?.dataset.motion as MotionLevel | undefined;
  return level ?? "rich";
}

export function prefersReducedMotion(): boolean {
  return motionLevel() === "none";
}

/** Parallax, image drift and hero zoom are reserved for the "rich" level. */
export function allowsParallax(): boolean {
  return motionLevel() === "rich";
}
