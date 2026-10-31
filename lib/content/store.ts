import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { draftMode } from "next/headers";
import path from "path";
import { cache } from "react";
import { publicHub, upgradeChapters, type Hub } from "./hub";
import { seedHub } from "./hub-seed";
import { PAGE_KEYS, PAGE_SCHEMAS, normalizePageDoc, type PageDoc, type PageKey } from "./pages";

/**
 * File-backed content store. Content lives in `data/site.json` (override the folder with
 * CONTENT_DIR). Every editable area — the four pages and the Hub — has a live copy that the
 * site shows and an optional draft that only the admin sees until it is published.
 *
 * This module is the only place that touches storage, so it can be swapped for Firestore
 * without changing the pages or the admin.
 */
export const DATA_DIR = process.env.CONTENT_DIR ?? path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const CONTENT_FILE = path.join(DATA_DIR, "site.json");

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

const readOnce = cache(readFromDisk);

/** What visitors see — or, while an admin previews (Next draft mode), the saved drafts. */
export async function getLive(): Promise<Site> {
  const file = await readOnce();
  if (!(await draftMode()).isEnabled) return file.live;
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
  const file = await readOnce();
  const draft = file.drafts[key];
  const live = key === "hub" ? file.live.hub : file.live.pages[key as PageKey];
  return { data: (draft ?? live) as K extends "hub" ? Hub : PageDoc, hasDraft: Boolean(draft) };
}

let queue: Promise<unknown> = Promise.resolve();

function mutate(change: (file: StoreFile) => void): Promise<void> {
  const run = queue.then(async () => {
    const file = await readFromDisk();
    change(file);
    await writeToDisk(file);
  });
  queue = run.catch(() => undefined);
  return run;
}

export function saveDraft(key: AreaKey, data: PageDoc | Hub) {
  return mutate((file) => {
    (file.drafts as Record<string, unknown>)[key] = data;
  });
}

export function publish(key: AreaKey, data: PageDoc | Hub) {
  return mutate((file) => {
    if (key === "hub") file.live.hub = data as Hub;
    else file.live.pages[key] = data as PageDoc;
    delete file.drafts[key];
  });
}
