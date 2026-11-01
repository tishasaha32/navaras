/**
 * Natyashastra Hub content: categories group sections; each section holds ordered
 * chapters (free to read) and quizzes (login required).
 */

export type Status = "draft" | "published";

export type Category = { id: string; name: string; dev: string };

export type Chapter = {
  id: string;
  slug: string;
  status: Status;
  title: string;
  /** The whole lesson (sanitised rich text). */
  body: string;
  thumb: string;
};

export type Question = { text: string; options: string[]; answer: number; explain: string };

export type Quiz = {
  id: string;
  slug: string;
  status: Status;
  title: string;
  type: string;
  pass: number;
  questions: Question[];
};

export type HubSection = {
  id: string;
  slug: string;
  status: Status;
  cat: string;
  title: string;
  dev: string;
  desc: string;
  img: string;
  chapters: Chapter[];
  quizzes: Quiz[];
};

export type Hub = { categories: Category[]; sections: HubSection[] };

export const QUIZ_TYPES = [
  "Multiple choice",
  "True or false",
  "Match the pairs",
  "Picture quiz",
  "Fill in the blanks",
  "Watch and answer",
  "Flashcards",
] as const;

export const MAX_AUDIO_MB = 25;

/** Largest upload of any kind. `serverActions.bodySizeLimit` in next.config.ts must stay just above this. */
export const MAX_VIDEO_MB = 100;

/** Slugs the hub routes use for their own pages. */
export const RESERVED_SLUGS = new Set(["login", "my-learning", "dashboard"]);

export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "untitled"
  );
}

/** Returns `base`, or `base-2`, `base-3`… so it doesn't clash with `taken`. */
export function uniqueSlug(base: string, taken: Set<string>): string {
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
  taken.add(slug);
  return slug;
}

/** Recompute every slug from its title, unique within its parent. */
export function assignSlugs(hub: Hub): Hub {
  const secTaken = new Set(RESERVED_SLUGS);
  for (const s of hub.sections) {
    s.slug = uniqueSlug(slugify(s.title), secTaken);
    const itemTaken = new Set<string>(["quiz"]);
    for (const c of s.chapters) c.slug = uniqueSlug(slugify(c.title), itemTaken);
    for (const q of s.quizzes) q.slug = uniqueSlug(slugify(q.title), itemTaken);
  }
  return hub;
}

/* ---------- Lesson text ---------- */

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Lesson HTML from a plain explanation and key points. */
export function lessonBody(summary: string, points: string[], rest = ""): string {
  const paragraphs = summary
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p)}</p>`);
  const items = points.filter(Boolean).map((p) => `<li><p>${escapeHtml(p)}</p></li>`);
  const list = items.length ? `<h3>Key points</h3><ul>${items.join("")}</ul>` : "";
  return [...paragraphs, rest, list].join("");
}

/** Chapters saved before lessons moved into `body` kept their text in `summary` and `points`. */
export function upgradeChapters(hub: Hub): Hub {
  for (const s of hub.sections) {
    s.chapters = s.chapters.map(({ id, slug, status, title, body, thumb, ...old }: Chapter & { summary?: string; points?: string[] }) => ({
      id,
      slug,
      status,
      title,
      body: lessonBody(old.summary ?? "", old.points ?? [], body),
      thumb,
    }));
  }
  return hub;
}

/** Plain text of a lesson, for search-engine descriptions. */
export function lessonText(body: string): string {
  return body
    .replace(/<\/(p|h[2-4]|li|blockquote)>/g, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/* ---------- Public view ---------- */

/**
 * Only what visitors may see: published sections, chapters and quizzes with questions.
 * Admins previewing drafts (`includeDrafts`) also see draft items.
 */
/** Draft sections holding published chapters or quizzes, which visitors therefore can't reach. */
export function sectionsHidingContent(hub: Hub): HubSection[] {
  return hub.sections.filter((s) => s.status === "draft" && [...s.chapters, ...s.quizzes].some((x) => x.status === "published"));
}

export function publicHub(hub: Hub, includeDrafts = false): Hub {
  const shown = (x: { status: Status }) => includeDrafts || x.status === "published";
  const sections = hub.sections
    .filter(shown)
    .map((s) => ({
      ...s,
      chapters: s.chapters.filter(shown),
      quizzes: s.quizzes.filter((q) => shown(q) && q.questions.length > 0),
    }))
    .filter((s) => s.chapters.length > 0 || s.quizzes.length > 0);
  return { categories: hub.categories, sections };
}

/** Lightweight shape for cards, progress and the dashboard (no lesson bodies). */
export type SectionSummary = {
  id: string;
  slug: string;
  cat: string;
  title: string;
  dev: string;
  desc: string;
  img: string;
  chapters: { id: string; slug: string; title: string }[];
  quizzes: { id: string; slug: string; title: string; type: string }[];
};

export type HubSummary = { categories: Category[]; sections: SectionSummary[] };

export function summarize(hub: Hub): HubSummary {
  return {
    categories: hub.categories,
    sections: hub.sections.map((s) => ({
      id: s.id,
      slug: s.slug,
      cat: s.cat,
      title: s.title,
      dev: s.dev,
      desc: s.desc,
      img: s.img,
      chapters: s.chapters.map((c) => ({ id: c.id, slug: c.slug, title: c.title })),
      quizzes: s.quizzes.map((q) => ({ id: q.id, slug: q.slug, title: q.title, type: q.type })),
    })),
  };
}

export const HUB_PATH = "/natyashastra-hub";

export function sectionHref(s: { slug: string }) {
  return `${HUB_PATH}/${s.slug}`;
}

export function itemHref(s: { slug: string }, item: { slug: string }) {
  return `${HUB_PATH}/${s.slug}/${item.slug}`;
}
