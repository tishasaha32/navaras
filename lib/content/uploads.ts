import { createReadStream, promises as fs } from "fs";
import path from "path";
import { Readable } from "stream";
import { bucket, firebaseEnabled } from "@/lib/firebase-admin";
import { UPLOAD_DIR } from "./paths";

/** A stored file, ready to send: `open` streams the given byte range. */
export type StoredFile = { size: number; open: (start: number, end: number) => ReadableStream };

const toWeb = (stream: Readable) => Readable.toWeb(stream) as ReadableStream;

const UPLOAD_LINK_HOURS = 24;

/** Uploaded files, in Firebase Storage under uploads/, or on disk until content moves there. */
export async function saveUpload(name: string, data: Buffer, contentType: string) {
  if (firebaseEnabled) return void (await bucket().file(`uploads/${name}`).save(data, { contentType, resumable: false }));
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), data);
}

export async function deleteUpload(name: string) {
  if (firebaseEnabled) return void (await bucket().file(`uploads/${name}`).delete({ ignoreNotFound: true }));
  await fs.rm(path.join(UPLOAD_DIR, name), { force: true });
}

/** A direct Storage link, so browsers stream audio and video without going through this server. */
export async function storageLink(objectPath: string): Promise<string | null> {
  if (!firebaseEnabled) return null;
  const [url] = await bucket().file(objectPath).getSignedUrl({ version: "v4", action: "read", expires: Date.now() + UPLOAD_LINK_HOURS * 3_600_000 });
  return url;
}

export const uploadLink = (name: string) => storageLink(`uploads/${name}`);

export async function readStorageFile(objectPath: string): Promise<StoredFile | null> {
  const file = bucket().file(objectPath);
  const [exists] = await file.exists();
  if (!exists) return null;
  const [meta] = await file.getMetadata();
  return { size: Number(meta.size), open: (start, end) => toWeb(file.createReadStream({ start, end })) };
}

export async function readUpload(name: string): Promise<StoredFile | null> {
  if (firebaseEnabled) return readStorageFile(`uploads/${name}`);
  const full = path.join(UPLOAD_DIR, name);
  const stat = await fs.stat(full).catch(() => null);
  return stat && { size: stat.size, open: (start, end) => toWeb(createReadStream(full, { start, end })) };
}

/** Names and upload times of everything stored, newest first. */
export async function listUploads(): Promise<string[]> {
  if (firebaseEnabled) {
    const [files] = await bucket().getFiles({ prefix: "uploads/" });
    return files
      .sort((a, b) => String(b.metadata.timeCreated).localeCompare(String(a.metadata.timeCreated)))
      .map((f) => f.name.slice("uploads/".length));
  }
  const names = await fs.readdir(UPLOAD_DIR).catch(() => [] as string[]);
  const entries = await Promise.all(names.map(async (f) => ({ f, t: (await fs.stat(path.join(UPLOAD_DIR, f))).mtimeMs })));
  return entries.sort((a, b) => b.t - a.t).map((e) => e.f);
}
