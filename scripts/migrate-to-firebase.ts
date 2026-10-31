/**
 * Copies content from data/ and public/images into Firebase, then reads it back to check.
 * It never deletes anything local and stops if Firebase already holds a live Hub.
 *
 *   npx tsx --env-file=.env.local scripts/migrate-to-firebase.ts
 */
import { promises as fs } from "fs";
import path from "path";
import { bucket, firestore } from "../lib/firebase-admin";
import { publishHub, publishPage, readContent, saveDraftHub, saveDraftPage } from "../lib/content/firebase-store";
import { upgradeChapters, type Hub } from "../lib/content/hub";
import { hubDocs } from "../lib/content/hub-docs";
import { PAGE_KEYS, type PageDoc, type PageKey } from "../lib/content/pages";
import { DATA_DIR, UPLOAD_DIR } from "../lib/content/paths";

const DECORATIVE = new Set(["divider.svg", "jaal.svg", "logo.png", "mandala-gold.svg", "mandala-light.svg", "toran-garland.svg", "toran-garlands.svg", "toran-leaves.svg", "toran-string.svg", "toran.svg"]);

const TYPES: Record<string, string> = {
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  wav: "audio/wav",
  mp4: "video/mp4",
  webm: "video/webm",
};

type Saved = { live: { pages: Record<PageKey, PageDoc>; hub: Hub }; drafts: Partial<Record<PageKey, PageDoc>> & { hub?: Hub } };

async function copyFiles(folder: string, prefix: string, keep: (name: string) => boolean) {
  const names = (await fs.readdir(folder).catch(() => [] as string[])).filter(keep);
  for (const name of names) {
    await bucket().upload(path.join(folder, name), { destination: `${prefix}/${name}`, metadata: { contentType: TYPES[name.split(".").pop()!] } });
    console.log(`  ${prefix}/${name}`);
  }
  const [stored] = await bucket().getFiles({ prefix: `${prefix}/` });
  const missing = names.filter((n) => !stored.some((f) => f.name === `${prefix}/${n}`));
  if (missing.length) throw new Error(`Missing from Storage: ${missing.join(", ")}`);
  return names.length;
}

async function main() {
  if ((await firestore().doc("content/live").get()).data()?.hub) throw new Error("Firebase already holds a live Hub, so nothing was copied.");

  const saved = JSON.parse(await fs.readFile(path.join(DATA_DIR, "site.json"), "utf8")) as Saved;
  const hub = upgradeChapters(saved.live.hub);
  const draftHub = saved.drafts.hub && upgradeChapters(saved.drafts.hub);

  console.log("Copying files…");
  const uploads = await copyFiles(UPLOAD_DIR, "uploads", (n) => n.split(".").pop()! in TYPES);
  const images = await copyFiles(path.join(process.cwd(), "public/images"), "images", (n) => !DECORATIVE.has(n));

  console.log("Copying content…");
  for (const key of PAGE_KEYS) {
    await publishPage(key, saved.live.pages[key]);
    if (saved.drafts[key]) await saveDraftPage(key, saved.drafts[key]!);
  }
  await publishHub(hub);
  if (draftHub) await saveDraftHub(draftHub);

  console.log("Checking…");
  const stored = await readContent();
  if (!stored.live.hub) throw new Error("The Hub didn't save.");
  const expected = hubDocs(hub);
  const actual = hubDocs(stored.live.hub);
  for (const [docPath, doc] of expected) {
    if (JSON.stringify(sorted(actual.get(docPath))) !== JSON.stringify(sorted(doc))) throw new Error(`Differs in Firebase: ${docPath}`);
  }
  if (actual.size !== expected.size) throw new Error(`Expected ${expected.size} Hub documents, found ${actual.size}.`);
  for (const key of PAGE_KEYS) {
    if (JSON.stringify(sorted(stored.live.pages[key])) !== JSON.stringify(sorted(saved.live.pages[key]))) throw new Error(`Page differs in Firebase: ${key}`);
  }
  console.log(`Done: ${PAGE_KEYS.length} pages, ${expected.size} Hub documents, ${uploads} uploads, ${images} images.`);
}

/** Firestore doesn't keep key order, so compare with keys sorted. */
function sorted(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sorted);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, sorted(v)]));
  return value;
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
