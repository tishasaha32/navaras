import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { draftMode } from "next/headers";
import path from "path";
import { cache } from "react";
import { firebaseEnabled } from "@/lib/firebase-admin";
import { publishHub, publishPage, readContent, saveDraftHub, saveDraftPage } from "./firebase-store";
import { publicHub, upgradeChapters, type Hub } from "./hub";
import { uploadsUsed } from "./hub-docs";
import { seedHub } from "./hub-seed";
import { PAGE_KEYS, PAGE_SCHEMAS, normalizePageDoc, type PageDoc, type PageKey } from "./pages";
import { DATA_DIR } from "./paths";
import { deleteUpload } from "./uploads";

/**
 * Content store. Every editable area — the four pages and the Hub — has a live copy that the
 * site shows and an optional draft that only the admin sees until it is published. Content
 * lives in Firestore (firebase-store.ts) when CONTENT_STORE=firebase, else in `data/site.json`.
 *
 * This module is the only place the site and the admin reach content from.
 */
const CONTENT_FILE = path.join(DATA_DIR, "site.json");

/** How long visitors' pages reuse one read of Firestore; each read costs about 60 documents. */
const CACHE_MS = 5 * 60 * 1000;

export type AreaKey = PageKey | "hub";
export type Site = { pages: Record<PageKey, PageDoc>; hub: Hub };
type Drafts = Partial<{ [K in PageKey]: PageDoc } & { hub: Hub }>;
type StoreFile = { version: 2; live: Site; drafts: Drafts };

function seed(): StoreFile {
  return {
    version: 2,
    live: {
      pages: Object.fromEntries(PAGE_KEYS.map((k) => [k, normalizePageDoc(PAGE_SCHEMAS[k], undefined)])) as Site["pages"],
      hub: seedHub(),
    },
    drafts: {},
  };
}

function normalize(file: Partial<StoreFile>): StoreFile {
  const base = seed();
  const pages = Object.fromEntries(
    PAGE_KEYS.map((k) => [k, normalizePageDoc(PAGE_SCHEMAS[k], file.live?.pages?.[k])]),
  ) as Site["pages"];
  const drafts: Drafts = {};
  for (const k of PAGE_KEYS) {
    const d = file.drafts?.[k];
    if (d) drafts[k] = normalizePageDoc(PAGE_SCHEMAS[k], d);
  }
  if (file.drafts?.hub) drafts.hub = upgradeChapters(file.drafts.hub);
  return { version: 2, live: { pages, hub: file.live?.hub ? upgradeChapters(file.live.hub) : base.live.hub }, drafts };
}

async function readFromDisk(): Promise<StoreFile> {
  try {
    return normalize(JSON.parse(await fs.readFile(CONTENT_FILE, "utf8")) as Partial<StoreFile>);
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

async function readFromFirebase(): Promise<StoreFile> {
  const { live, drafts } = await readContent();
  return normalize({ live: live as Site, drafts: drafts as Drafts });
}

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
  if (!(await draftMode()).isEnabled) return (await readForVisitors()).live;
  const file = await readForAdmin();
  const pages = { ...file.live.pages };
  for (const k of PAGE_KEYS) if (file.drafts[k]) pages[k] = file.drafts[k]!;
  return { pages, hub: file.drafts.hub ?? file.live.hub };
}

/** Public view of the Hub for this request (drafts included while an admin previews). */
export async function getPublicHub(): Promise<Hub> {
  return publicHub((await getLive()).hub, (await draftMode()).isEnabled);
}

/** What the admin edits: the saved draft if there is one, else the live copy. */
export async function getEditable<K extends AreaKey>(key: K): Promise<{ data: K extends "hub" ? Hub : PageDoc; hasDraft: boolean }> {
  const file = await readForAdmin();
  const draft = file.drafts[key];
  const live = key === "hub" ? file.live.hub : file.live.pages[key as PageKey];
  return { data: (draft ?? live) as K extends "hub" ? Hub : PageDoc, hasDraft: Boolean(draft) };
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

export function saveDraft(key: AreaKey, data: PageDoc | Hub) {
  return change(() => {
    if (!firebaseEnabled) return editFile((file) => void ((file.drafts as Record<string, unknown>)[key] = data));
    return key === "hub" ? saveDraftHub(data as Hub) : saveDraftPage(key, data as PageDoc);
  });
}

export function publish(key: AreaKey, data: PageDoc | Hub) {
  return change(() => {
    if (firebaseEnabled) return key === "hub" ? publishHub(data as Hub) : publishPage(key, data as PageDoc);
    return editFile((file) => {
      if (key === "hub") file.live.hub = data as Hub;
      else file.live.pages[key] = data as PageDoc;
      delete file.drafts[key];
    });
  });
}

/** Deletes an uploaded file nothing uses any more. Returns false if something still does. */
export async function deleteUnusedUpload(name: string): Promise<boolean> {
  if (uploadsUsed(await readFresh()).has(name)) return false;
  await deleteUpload(name);
  return true;
}
