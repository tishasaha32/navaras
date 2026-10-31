import { promises as fs } from "fs";
import path from "path";
import { UPLOAD_DIR } from "./store";

/** Decorative assets that make no sense as content images. */
const DECORATIVE = new Set(["divider.svg", "toran.svg", "jaal.svg", "mandala-gold.svg", "mandala-light.svg", "logo.png"]);

export const UPLOAD_NAME = /^[a-f0-9-]{36}\.(png|jpe?g|webp|gif)$/;

/** Audio uploads. Kept apart from images so they never appear in the image library. */
export const AUDIO_NAME = /^[a-f0-9-]{36}\.(mp3|m4a|wav)$/;

/** Images the admin can pick from: built-in illustrations plus uploads. */
export async function listImages(): Promise<string[]> {
  const builtIn = (await fs.readdir(path.join(process.cwd(), "public/images")))
    .filter((f) => !DECORATIVE.has(f))
    .sort()
    .map((f) => `/images/${f}`);
  let uploads: string[] = [];
  try {
    const entries = await Promise.all(
      (await fs.readdir(UPLOAD_DIR))
        .filter((f) => UPLOAD_NAME.test(f))
        .map(async (f) => ({ f, t: (await fs.stat(path.join(UPLOAD_DIR, f))).mtimeMs })),
    );
    uploads = entries.sort((a, b) => b.t - a.t).map((e) => `/uploads/${e.f}`);
  } catch {
    /* no uploads yet */
  }
  return [...uploads, ...builtIn];
}

export function isAllowedImagePath(src: string): boolean {
  return /^\/images\/[a-z0-9-]+\.(svg|png|jpe?g|webp)$/.test(src) || /^\/uploads\/[a-f0-9-]{36}\.(png|jpe?g|webp|gif)$/.test(src);
}

export function isAllowedAudioPath(src: string): boolean {
  return src.startsWith("/uploads/") && AUDIO_NAME.test(src.slice("/uploads/".length));
}
