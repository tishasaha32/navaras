"use client";

/** Uploaded images are kept under this size. */
export const MAX_IMAGE_BYTES = 400 * 1024;

/** Longest side kept: sharp on large and high-density screens, far smaller than camera originals. */
const MAX_EDGE = 2400;

/** Quality never goes below this; past it the image is made smaller instead, which looks better than blocky compression. */
const MIN_QUALITY = 0.6;
const MAX_QUALITY = 0.92;

const encode = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

function draw(source: ImageBitmap, scale: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** WebP keeps transparency and compresses best; browsers that can't encode it fall back to JPEG. */
async function pickType(canvas: HTMLCanvasElement): Promise<string> {
  const probe = await encode(canvas, "image/webp", 0.8);
  return probe?.type === "image/webp" ? "image/webp" : "image/jpeg";
}

/** The highest quality at this size that fits the limit, or null if even the lowest doesn't. */
async function bestFit(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  const top = await encode(canvas, type, MAX_QUALITY);
  if (top && top.size <= MAX_IMAGE_BYTES) return top;
  let lo = MIN_QUALITY;
  let hi = MAX_QUALITY;
  let best: Blob | null = null;
  for (let i = 0; i < 6; i++) {
    const q = (lo + hi) / 2;
    const blob = await encode(canvas, type, q);
    if (blob && blob.size <= MAX_IMAGE_BYTES) {
      best = blob;
      lo = q;
    } else hi = q;
  }
  if (best) return best;
  const floor = await encode(canvas, type, MIN_QUALITY);
  return floor && floor.size <= MAX_IMAGE_BYTES ? floor : null;
}

/**
 * Shrinks an image to under 400 KB before upload, keeping as much quality as fits.
 * Images already under the limit and GIFs (which may be animated) are left untouched.
 */
export async function compressImage(file: File): Promise<File> {
  if (file.type === "image/gif" || file.size <= MAX_IMAGE_BYTES) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file; // Not decodable here; the server decides whether to accept it.
  }

  try {
    let scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    let canvas = draw(bitmap, scale);
    const type = await pickType(canvas);

    for (let attempt = 0; attempt < 8; attempt++) {
      const blob = await bestFit(canvas, type);
      if (blob) {
        if (blob.size >= file.size) return file;
        const ext = type === "image/webp" ? "webp" : "jpg";
        const base = file.name.replace(/\.[^.]+$/, "") || "image";
        return new File([blob], `${base}.${ext}`, { type, lastModified: Date.now() });
      }
      scale *= 0.85;
      canvas = draw(bitmap, scale);
    }
    return file;
  } finally {
    bitmap.close();
  }
}
