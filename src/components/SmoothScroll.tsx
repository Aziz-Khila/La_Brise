"use client";

import type { ReactNode } from "react";
import { ReactLenis } from "lenis/react";

type SmoothScrollProps = {
  children: ReactNode;
};

export function SmoothScroll({ children }: SmoothScrollProps) {
  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        autoToggle: true,
        anchors: true,
        lerp: 0.085,
        duration: 1.15,
        smoothWheel: true,
        syncTouch: false,
        touchMultiplier: 1.1,
        wheelMultiplier: 0.95,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      }}
    >
      {children}
    </ReactLenis>
  );
}
