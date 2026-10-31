import { promises as fs } from "fs";
import path from "path";
import { bucket, firebaseEnabled } from "@/lib/firebase-admin";
import { listUploads } from "./uploads";

/** Decorative assets that make no sense as content images. */
const DECORATIVE = new Set(["divider.svg", "toran.svg", "jaal.svg", "mandala-gold.svg", "mandala-light.svg", "logo.png"]);

export const UPLOAD_NAME = /^[a-f0-9-]{36}\.(png|jpe?g|webp|gif)$/;

/** Audio uploads. Kept apart from images so they never appear in the image library. */
export const AUDIO_NAME = /^[a-f0-9-]{36}\.(mp3|m4a|wav)$/;

/** Video uploads, kept apart for the same reason. */
export const VIDEO_NAME = /^[a-f0-9-]{36}\.(mp4|webm)$/;

/** Images the admin can pick from: built-in illustrations plus uploads. */
export async function listImages(): Promise<string[]> {
  const builtIn = (await builtInImages())
    .filter((f) => !DECORATIVE.has(f))
    .sort()
    .map((f) => `/images/${f}`);
  const uploads = (await listUploads()).filter((f) => UPLOAD_NAME.test(f)).map((f) => `/uploads/${f}`);
  return [...uploads, ...builtIn];
}

async function builtInImages(): Promise<string[]> {
  if (!firebaseEnabled) return fs.readdir(path.join(process.cwd(), "public/images"));
  const [files] = await bucket().getFiles({ prefix: "images/" });
  return files.map((f) => f.name.slice("images/".length));
}

export function isAllowedImagePath(src: string): boolean {
  return /^\/images\/[a-z0-9-]+\.(svg|png|jpe?g|webp)$/.test(src) || /^\/uploads\/[a-f0-9-]{36}\.(png|jpe?g|webp|gif)$/.test(src);
}

export function isAllowedAudioPath(src: string): boolean {
  return src.startsWith("/uploads/") && AUDIO_NAME.test(src.slice("/uploads/".length));
}

export function isAllowedVideoPath(src: string): boolean {
  return src.startsWith("/uploads/") && VIDEO_NAME.test(src.slice("/uploads/".length));
}
