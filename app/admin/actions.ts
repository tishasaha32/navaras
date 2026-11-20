"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { MAX_AUDIO_MB, MAX_VIDEO_MB, type Hub } from "@/lib/content/hub";
import { AUDIO_NAME, UPLOAD_NAME, VIDEO_NAME, listImages } from "@/lib/content/images";
import { deleteUnusedUpload, publish, saveDraft } from "@/lib/content/store";
import { saveUpload } from "@/lib/content/uploads";
import { parseHub } from "@/lib/content/validate";

export type ActionResult = { ok: true; url?: string } | { ok: false; error: string };


/* ---------- Content ---------- */

function refresh() {
  revalidatePath("/", "layout");
}

const isUploadName = (name: unknown): name is string => typeof name === "string" && [UPLOAD_NAME, AUDIO_NAME, VIDEO_NAME].some((re) => re.test(name));

/**
 * Save the whole Natyashastra Hub (categories, sections, chapters, quizzes).
 * `uploaded` lists files the editor uploaded since it opened: any the saved content doesn't use are deleted,
 * so media removed before it was ever saved doesn't stay in Storage.
 */
export async function saveHub(data: unknown, mode: "draft" | "publish", uploaded: unknown = []): Promise<ActionResult & { hub?: Hub }> {
  await requireAdmin();
  const parsed = parseHub(data, mode === "publish");
  if (!parsed.ok) return parsed;
  const discardable = Array.isArray(uploaded) ? uploaded.filter(isUploadName) : [];
  if (mode === "publish") await publish(parsed.hub, discardable);
  else await saveDraft(parsed.hub, discardable);
  refresh();
  return { ok: true, hub: parsed.hub };
}

/* ---------- Uploads ---------- */

const MAX_UPLOAD = 5 * 1024 * 1024;
const MAX_AUDIO_UPLOAD = MAX_AUDIO_MB * 1024 * 1024;
const MAX_VIDEO_UPLOAD = MAX_VIDEO_MB * 1024 * 1024;

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  wav: "audio/wav",
  mp4: "video/mp4",
  webm: "video/webm",
};

async function store(buf: Buffer, ext: string): Promise<ActionResult> {
  const name = `${randomUUID()}.${ext}`;
  await saveUpload(name, buf, CONTENT_TYPES[ext]);
  return { ok: true, url: `/uploads/${name}` };
}

/** The image library as it is now: saves delete uploads the content stopped using. */
export async function libraryImages(): Promise<string[]> {
  await requireAdmin();
  return listImages();
}

/** Removes an uploaded image from the library, unless a page, chapter or draft still shows it. */
export async function deleteImage(url: string): Promise<ActionResult> {
  await requireAdmin();
  const name = url.replace(/^\/uploads\//, "");
  if (!UPLOAD_NAME.test(name)) return { ok: false, error: "Only uploaded images can be deleted." };
  if (!(await deleteUnusedUpload(name))) return { ok: false, error: "This image is still used on the site. Remove it from there and publish first." };
  return { ok: true };
}

function sniffImage(buf: Buffer): "png" | "jpg" | "webp" | "gif" | null {
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  if (/^GIF8[79]a$/.test(buf.subarray(0, 6).toString("ascii"))) return "gif";
  return null;
}

export async function uploadImage(form: FormData): Promise<ActionResult> {
  await requireAdmin();
  const file = form.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file received." };
  if (file.size > MAX_UPLOAD) return { ok: false, error: "Images must be 5 MB or smaller." };
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniffImage(buf);
  if (!ext) return { ok: false, error: "Upload a PNG, JPEG, WebP or GIF image." };
  return store(buf, ext);
}

/** Formats every browser plays, iPhones included: the extension comes from the bytes, never the file name. */
function sniffAudio(buf: Buffer): "mp3" | "m4a" | "wav" | null {
  if (buf.subarray(0, 3).toString("ascii") === "ID3") return "mp3";
  // MPEG audio frame sync, with a valid layer, bitrate and sample rate (rules out AAC and JPEG).
  if (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0 && (buf[1] & 0x06) !== 0 && buf[2] >> 4 !== 15 && ((buf[2] >> 2) & 3) !== 3) return "mp3";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WAVE") return "wav";
  if (buf.subarray(4, 8).toString("ascii") === "ftyp" && /^(M4A |M4B |mp42|isom)$/.test(buf.subarray(8, 12).toString("ascii"))) return "m4a";
  return null;
}

export async function uploadAudio(form: FormData): Promise<ActionResult> {
  await requireAdmin();
  const file = form.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file received." };
  if (file.size > MAX_AUDIO_UPLOAD) return { ok: false, error: `Audio must be ${MAX_AUDIO_MB} MB or smaller.` };
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniffAudio(buf);
  if (!ext) return { ok: false, error: "Upload an MP3, M4A or WAV file." };
  return store(buf, ext);
}

/** MP4 plays everywhere and WebM nearly so; MOV is left out because most browsers can't play what phones record in it. */
function sniffVideo(buf: Buffer): "mp4" | "webm" | null {
  if (buf.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) return "webm";
  if (buf.subarray(4, 8).toString("ascii") === "ftyp" && /^(isom|iso[2-9]|mp4[12]|avc1|M4V |dash)$/.test(buf.subarray(8, 12).toString("ascii"))) return "mp4";
  return null;
}

export async function uploadVideo(form: FormData): Promise<ActionResult> {
  await requireAdmin();
  const file = form.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file received." };
  if (file.size > MAX_VIDEO_UPLOAD) return { ok: false, error: `The video must be ${MAX_VIDEO_MB} MB or smaller.` };
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniffVideo(buf);
  if (!ext) return { ok: false, error: "Upload an MP4 or WebM video." };
  return store(buf, ext);
}
