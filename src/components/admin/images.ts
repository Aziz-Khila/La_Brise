"use client";

import { createContext } from "react";

const MAX_SIDE = 2400;
const QUALITY = 0.85;

export type AdminImages = {
  /** Resizes and uploads the file; resolves with the URL it will have on the site. */
  upload: (file: File) => Promise<string>;
  /** What to show for an image URL; null when the image only exists after the next publish. */
  display: (src: string) => string | null;
};

export const AdminImagesContext = createContext<AdminImages | null>(null);

const encode = (canvas: HTMLCanvasElement, type: string) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));

const extensions: Record<string, string> = { "image/webp": "webp", "image/png": "png", "image/jpeg": "jpg" };

/** Downscales in the browser so uploads stay small; WebP keeps the transparency of cut-outs. */
export async function resizeImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("Format d’image non supporté.");
  });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // Browsers that cannot encode WebP return a PNG instead; photos then go to JPEG to stay light.
  let blob = await encode(canvas, "image/webp");
  if (blob?.type !== "image/webp") {
    blob = await encode(canvas, file.type === "image/png" ? "image/png" : "image/jpeg");
  }
  if (!blob) throw new Error("Impossible de lire cette image.");

  const name = `${file.name.replace(/\.[^.]+$/, "")}.${extensions[blob.type] ?? "png"}`;
  return new File([blob], name, { type: blob.type });
}
