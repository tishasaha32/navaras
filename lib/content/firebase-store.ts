import type { Firestore, QueryDocumentSnapshot, WriteBatch } from "firebase-admin/firestore";
import { firestore } from "@/lib/firebase-admin";
import type { Category, Chapter, Hub, HubSection, Quiz } from "./hub";
import { hubChanges } from "./hub-docs";

/**
 * The Natyashastra Hub in Firestore:
 *   content/{live|draft}                                   { hub: true } once it holds a Hub
 *   content/{live|draft}/categories/{id}
 *   content/{live|draft}/sections/{id}                     with `cat`, the category's id
 *   content/{live|draft}/sections/{id}/chapters/{id}
 *   content/{live|draft}/sections/{id}/quizzes/{id}
 * Lists are stored with an `order` field. Only the server reads or writes these.
 */
type Version = "live" | "draft";

export type Stored = { live: { hub?: Hub }; drafts: { hub?: Hub } };

/** Firestore takes at most 500 writes at a time. */
const BATCH = 400;

const root = (db: Firestore, version: Version) => db.collection("content").doc(version);

function fields<T>(doc: QueryDocumentSnapshot) {
  const data = doc.data();
  delete data.order;
  return { id: doc.id, ...data } as T;
}

async function readHub(db: Firestore, version: Version): Promise<Hub | undefined> {
  const ref = root(db, version);
  if (!(await ref.get()).data()?.hub) return undefined;
  const [categories, sections] = await Promise.all([ref.collection("categories").orderBy("order").get(), ref.collection("sections").orderBy("order").get()]);
  return {
    categories: categories.docs.map((d) => fields<Category>(d)),
    sections: await Promise.all(
      sections.docs.map(async (d) => {
        const [chapters, quizzes] = await Promise.all([d.ref.collection("chapters").orderBy("order").get(), d.ref.collection("quizzes").orderBy("order").get()]);
        return { ...fields<HubSection>(d), chapters: chapters.docs.map((c) => fields<Chapter>(c)), quizzes: quizzes.docs.map((q) => fields<Quiz>(q)) };
      }),
    ),
  };
}

export async function readContent(): Promise<Stored> {
  const db = firestore();
  const [live, draft] = await Promise.all([readHub(db, "live"), readHub(db, "draft")]);
  return { live: { hub: live }, drafts: { hub: draft } };
}

async function writeHub(db: Firestore, version: Version, before: Hub | undefined, after: Hub | null) {
  const { sets, deletes } = hubChanges(before ?? null, after);
  const ref = root(db, version);
  const writes = [
    ...sets.map(([path, doc]) => (b: WriteBatch) => b.set(db.doc(`${ref.path}/${path}`), doc)),
    ...deletes.map((path) => (b: WriteBatch) => b.delete(db.doc(`${ref.path}/${path}`))),
  ];
  for (let i = 0; i < writes.length; i += BATCH) {
    const batch = db.batch();
    writes.slice(i, i + BATCH).forEach((write) => write(batch));
    await batch.commit();
  }
  await ref.set({ hub: Boolean(after) });
}

export async function saveDraftHub(hub: Hub) {
  const db = firestore();
  await writeHub(db, "draft", await readHub(db, "draft"), hub);
}

/** Puts the Hub live and removes its draft, so anything deleted is gone from both. */
export async function publishHub(hub: Hub) {
  const db = firestore();
  await writeHub(db, "live", await readHub(db, "live"), hub);
  await writeHub(db, "draft", await readHub(db, "draft"), null);
}
