import type { Hub } from "./hub";

export type Doc = Record<string, unknown>;

/**
 * The Hub as one Firestore document per category, section, chapter and quiz, keyed by path.
 * `order` keeps each list in the admin's order; chapters and quizzes sit under their section.
 */
export function hubDocs(hub: Hub): Map<string, Doc> {
  const docs = new Map<string, Doc>();
  hub.categories.forEach(({ id, ...category }, order) => docs.set(`categories/${id}`, { ...category, order }));
  hub.sections.forEach(({ id, chapters, quizzes, ...section }, order) => {
    docs.set(`sections/${id}`, { ...section, order });
    chapters.forEach(({ id: chapter, ...data }, i) => docs.set(`sections/${id}/chapters/${chapter}`, { ...data, order: i }));
    quizzes.forEach(({ id: quiz, ...data }, i) => docs.set(`sections/${id}/quizzes/${quiz}`, { ...data, order: i }));
  });
  return docs;
}

/** What has to change to turn `before` into `after`: removed documents are deleted, unchanged ones are left alone. */
export function hubChanges(before: Hub | null, after: Hub | null) {
  const from = before ? hubDocs(before) : new Map<string, Doc>();
  const to = after ? hubDocs(after) : new Map<string, Doc>();
  const sets = [...to].filter(([path, doc]) => JSON.stringify(from.get(path)) !== JSON.stringify(doc));
  const deletes = [...from.keys()].filter((path) => !to.has(path));
  return { sets, deletes };
}

/** Every uploaded file some content points at, drafts included. */
export function uploadsUsed(content: unknown): Set<string> {
  return new Set([...JSON.stringify(content).matchAll(/\/uploads\/([a-f0-9-]{36}\.[a-z0-9]+)/g)].map((m) => m[1]));
}
