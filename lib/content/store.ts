import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { draftMode } from "next/headers";
import path from "path";
import { cache } from "react";
import { getAdmin } from "@/lib/admin-auth";
import { firebaseEnabled } from "@/lib/firebase-admin";
import { readContent, writeContent, type HubChange } from "./firebase-store";
import { hideDraftedInLive, publicHub, upgradeChapters, type Hub } from "./hub";
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

/** How long visitors' pages reuse one read of Firestore, for servers that didn't make the last save themselves. */
const CACHE_MS = 60 * 1000;

/** How long the admin can trust the copy its own save left behind. */
const SAVED_MS = 5 * 1000;

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

/** On globalThis because each page gets its own copy of this module, and a save in the admin must clear what the site's pages hold. */
const shared = globalThis as typeof globalThis & {
  contentCache?: { file: StoreFile; at: number; refreshing?: boolean; saved?: boolean } | null;
  contentSaves?: number;
};

async function fetchForCache() {
  const saves = shared.contentSaves;
  const file = await readFromFirebase();
  // A read that began before a save may be missing it, so it mustn't replace what comes after.
  if (shared.contentSaves === saves) shared.contentCache = { file, at: Date.now() };
  return file;
}

/** Visitors never wait on an expired copy: it's served while a fresher one loads, and stays if that read fails. */
async function readCached() {
  if (!firebaseEnabled) return readFromDisk();
  const cached = shared.contentCache;
  if (!cached) return fetchForCache();
  if (Date.now() - cached.at > CACHE_MS && !cached.refreshing) {
    cached.refreshing = true;
    fetchForCache().catch((err) => {
      console.error(err);
      cached.refreshing = false;
    });
  }
  return cached.file;
}

/** Next re-renders the admin page after every save, and that shouldn't read back what was just written. */
async function readCurrent() {
  const cached = shared.contentCache;
  return cached?.saved && Date.now() - cached.at < SAVED_MS ? cached.file : readFresh();
}

const readForVisitors = cache(readCached);
const readForAdmin = cache(readCurrent);

/**
 * Whether this request shows saved drafts: only while the signed-in admin previews (Next draft mode).
 * A preview left switched on in any other browser shows the live site.
 */
export const isPreviewing = cache(async () => (await draftMode()).isEnabled && Boolean(await getAdmin()));

/** What visitors see — or, while the admin previews, the saved drafts. */
export async function getLive(): Promise<Site> {
  if (!(await isPreviewing())) return { pages: PAGES, hub: (await readForVisitors()).live.hub };
  const file = await readForAdmin();
  return { pages: PAGES, hub: file.drafts.hub ?? file.live.hub };
}

/** Public view of the Hub for this request (drafts included while an admin previews). */
export async function getPublicHub(): Promise<Hub> {
  return publicHub((await getLive()).hub, await isPreviewing());
}

/** What the admin edits: the saved draft if there is one, else the live copy. */
export async function getEditableHub(): Promise<{ data: Hub; hasDraft: boolean }> {
  const file = await readForAdmin();
  return { data: file.drafts.hub ?? file.live.hub, hasDraft: Boolean(file.drafts.hub) };
}

let queue: Promise<unknown> = Promise.resolve();

/**
 * Applies one save in turn, then deletes any uploaded file that save stopped using, and any of
 * `uploaded` (files the editor added since it opened) that nothing uses.
 * Reads once: everything after that is worked out from what the save is writing.
 */
function change({ live: newLive, draft }: HubChange, uploaded: string[], hideDrafted = false): Promise<void> {
  const run = queue.then(async () => {
    const stored = firebaseEnabled ? await readContent() : null;
    const before = stored ? normalize(stored) : await readFromDisk();
    let live = newLive;
    if (hideDrafted && draft && !live) {
      const hidden = hideDraftedInLive(before.live.hub, draft);
      if (hidden !== before.live.hub) live = hidden;
    }
    const after: StoreFile = {
      version: 2,
      live: { hub: live ?? before.live.hub },
      drafts: draft === undefined ? before.drafts : draft ? { hub: draft } : {},
    };
    if (stored) await writeContent(stored, { live, draft });
    else await writeToDisk(after);
    shared.contentCache = { file: after, at: Date.now(), saved: true };
    shared.contentSaves = (shared.contentSaves ?? 0) + 1;
    const used = uploadsUsed(after);
    const unused = new Set([...uploadsUsed(before), ...uploaded].filter((name) => !used.has(name)));
    await Promise.all([...unused].map((name) => deleteUpload(name).catch(console.error)));
  });
  queue = run.catch(() => undefined);
  return run;
}

/** Saves the draft. Anything it marks as Draft also leaves the live site now; the rest waits for Publish. */
export function saveDraft(hub: Hub, uploaded: string[] = []) {
  return change({ draft: hub }, uploaded, true);
}

export function publish(hub: Hub, uploaded: string[] = []) {
  return change({ live: hub, draft: null }, uploaded);
}

/** Deletes an uploaded file nothing uses any more. Returns false if something still does. */
export async function deleteUnusedUpload(name: string): Promise<boolean> {
  if (uploadsUsed(await readFresh()).has(name)) return false;
  await deleteUpload(name);
  return true;
}
