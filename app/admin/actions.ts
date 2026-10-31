"use server";

import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { MAX_AUDIO_MB, type Hub } from "@/lib/content/hub";
import { PAGE_SCHEMAS, type PageKey } from "@/lib/content/pages";
import { UPLOAD_DIR, publish, saveDraft } from "@/lib/content/store";
import { parseHub, parsePageDoc } from "@/lib/content/validate";

export type ActionResult = { ok: true; url?: string } | { ok: false; error: string };

/**
 * The admin is open for now. Firebase Authentication will protect it later:
 * check the signed-in user here (every action calls this) and in a middleware for /admin.
 */
async function requireAdmin() {}

/* ---------- Content ---------- */

function refresh() {
  revalidatePath("/", "layout");
}

/** Save a page (landing, dance, weddings, dresses) as a draft, or publish it to the site. */
export async function savePage(pageKey: string, data: unknown, mode: "draft" | "publish"): Promise<ActionResult> {
  await requireAdmin();
  const schema = PAGE_SCHEMAS[pageKey as PageKey];
  if (!schema) return { ok: false, error: "Unknown page." };
  const parsed = parsePageDoc(schema, data);
  if (!parsed.ok) return parsed;
  if (mode === "publish") await publish(schema.key, parsed.doc);
  else await saveDraft(schema.key, parsed.doc);
  refresh();
  return { ok: true };
}

/** Save the whole Natyashastra Hub (categories, sections, chapters, quizzes). */
export async function saveHub(data: unknown, mode: "draft" | "publish"): Promise<ActionResult & { hub?: Hub }> {
  await requireAdmin();
  const parsed = parseHub(data, mode === "publish");
  if (!parsed.ok) return parsed;
  if (mode === "publish") await publish("hub", parsed.hub);
  else await saveDraft("hub", parsed.hub);
  refresh();
  return { ok: true, hub: parsed.hub };
}

/* ---------- Uploads ---------- */

const MAX_UPLOAD = 5 * 1024 * 1024;
const MAX_AUDIO_UPLOAD = MAX_AUDIO_MB * 1024 * 1024;

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
  const name = `${randomUUID()}.${ext}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
  return { ok: true, url: `/uploads/${name}` };
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
  const name = `${randomUUID()}.${ext}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
  return { ok: true, url: `/uploads/${name}` };
}
