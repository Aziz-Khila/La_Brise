"use client";

import type { Brand, Cta } from "@/config/types";
import { resolveCta } from "@/lib/links";
import { useTour } from "@/lib/useTour";

type CtaButtonProps = {
  cta: Cta;
  brand: Brand;
  variant?: "primary" | "ghost";
  className?: string;
  onClick?: () => void;
};

export function CtaButton({
  cta,
  brand,
  variant = "primary",
  className = "",
  onClick,
}: CtaButtonProps) {
  const startTour = useTour();
  const resolved = resolveCta(cta.action, brand);
  if (!resolved) return null;

  const classes = `btn btn-${variant} ${className}`.trim();

  if (cta.action === "tour") {
    return (
      <button
        type="button"
        className={classes}
        onClick={() => {
          onClick?.();
          startTour();
        }}
      >
        {cta.label}
      </button>
    );
  }

  return (
    <a
      className={classes}
      href={resolved.href}
      onClick={onClick}
      {...(resolved.external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {cta.label}
    </a>
  );
}
