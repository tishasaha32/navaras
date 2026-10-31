import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { draftMode } from "next/headers";
import path from "path";
import { cache } from "react";
import { firebaseEnabled } from "@/lib/firebase-admin";
import { publishHub, readContent, saveDraftHub } from "./firebase-store";
import { publicHub, upgradeChapters, type Hub } from "./hub";
import { uploadsUsed } from "./hub-docs";
import { seedHub } from "./hub-seed";
import { PAGE_KEYS, PAGE_SCHEMAS, normalizePageDoc, type PageDoc, type PageKey } from "./pages";
import { DATA_DIR } from "./paths";
import { deleteUpload } from "./uploads";

/**
 * Content store. The Hub has a live copy that the site shows and an optional draft that only
 * the admin sees until it is published. It lives in Firestore (firebase-store.ts) when
 * CONTENT_STORE=firebase, else in `data/site.json`. The four main pages change shape often,
 * so they live in the code (pages.ts) and aren't edited in the admin.
 *
 * This module is the only place the site and the admin reach content from.
 */
const CONTENT_FILE = path.join(DATA_DIR, "site.json");

/** How long visitors' pages reuse one read of Firestore; each read costs about 60 documents. */
const CACHE_MS = 5 * 60 * 1000;

export type Site = { pages: Record<PageKey, PageDoc>; hub: Hub };
type StoreFile = { version: 2; live: { hub: Hub }; drafts: { hub?: Hub } };

const PAGES = Object.fromEntries(PAGE_KEYS.map((k) => [k, normalizePageDoc(PAGE_SCHEMAS[k], undefined)])) as Site["pages"];

function seed(): StoreFile {
  return { version: 2, live: { hub: seedHub() }, drafts: {} };
}

function normalize(file: { live?: { hub?: Hub }; drafts?: { hub?: Hub } }): StoreFile {
  const hub = file.live?.hub;
  const draft = file.drafts?.hub;
  return { version: 2, live: { hub: hub ? upgradeChapters(hub) : seedHub() }, drafts: draft ? { hub: upgradeChapters(draft) } : {} };
}

async function readFromDisk(): Promise<StoreFile> {
  try {
    return normalize(JSON.parse(await fs.readFile(CONTENT_FILE, "utf8")) as StoreFile);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    const fresh = seed();
    await writeToDisk(fresh);
    return fresh;
  }
}

async function writeToDisk(file: StoreFile) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${CONTENT_FILE}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(file, null, 2), "utf8");
  await fs.rename(tmp, CONTENT_FILE);
}

const readFromFirebase = async () => normalize(await readContent());

const readFresh = () => (firebaseEnabled ? readFromFirebase() : readFromDisk());

let cached: { file: Promise<StoreFile>; at: number } | null = null;

function readCached() {
  if (!firebaseEnabled) return readFromDisk();
  if (!cached || Date.now() - cached.at > CACHE_MS) {
    const file = readFromFirebase();
    file.catch(() => (cached = null));
    cached = { file, at: Date.now() };
  }
  return cached.file;
}

const readForVisitors = cache(readCached);
const readForAdmin = cache(readFresh);

/** What visitors see — or, while an admin previews (Next draft mode), the saved drafts. */
export async function getLive(): Promise<Site> {
  if (!(await draftMode()).isEnabled) return { pages: PAGES, hub: (await readForVisitors()).live.hub };
  const file = await readForAdmin();
  return { pages: PAGES, hub: file.drafts.hub ?? file.live.hub };
}

/** Public view of the Hub for this request (drafts included while an admin previews). */
export async function getPublicHub(): Promise<Hub> {
  return publicHub((await getLive()).hub, (await draftMode()).isEnabled);
}

/** What the admin edits: the saved draft if there is one, else the live copy. */
export async function getEditableHub(): Promise<{ data: Hub; hasDraft: boolean }> {
  const file = await readForAdmin();
  return { data: file.drafts.hub ?? file.live.hub, hasDraft: Boolean(file.drafts.hub) };
}

let queue: Promise<unknown> = Promise.resolve();

/** Applies one save in turn, then deletes any uploaded file that save stopped using. */
function change(apply: () => Promise<void>): Promise<void> {
  const run = queue.then(async () => {
    const before = uploadsUsed(await readFresh());
    await apply();
    cached = null;
    const after = uploadsUsed(await readFresh());
    await Promise.all([...before].filter((name) => !after.has(name)).map((name) => deleteUpload(name).catch(console.error)));
  });
  queue = run.catch(() => undefined);
  return run;
}

async function editFile(edit: (file: StoreFile) => void) {
  const file = await readFromDisk();
  edit(file);
  await writeToDisk(file);
}

export function saveDraft(hub: Hub) {
  return change(() => (firebaseEnabled ? saveDraftHub(hub) : editFile((file) => void (file.drafts.hub = hub))));
}

export function publish(hub: Hub) {
  return change(() => {
    if (firebaseEnabled) return publishHub(hub);
    return editFile((file) => {
      file.live.hub = hub;
      delete file.drafts.hub;
    });
  });
}

/** Deletes an uploaded file nothing uses any more. Returns false if something still does. */
export async function deleteUnusedUpload(name: string): Promise<boolean> {
  if (uploadsUsed(await readFresh()).has(name)) return false;
  await deleteUpload(name);
  return true;
}
