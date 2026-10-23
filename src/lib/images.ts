import type { CSSProperties } from "react";
import type { ImageRef } from "@/config/types";

/** next/image only accepts local paths here; anything else (empty, half-typed) is skipped instead of crashing. */
export function usableSrc(src: string | undefined): src is string {
  return Boolean(src && src.startsWith("/") && !src.startsWith("//"));
}

export function focusStyle(image: ImageRef): CSSProperties | undefined {
  return image.focus ? { objectPosition: image.focus } : undefined;
}
