import { itemHref, type HubSummary, type SectionSummary } from "@/lib/content/hub";
import type { Progress } from "./types";

export type SectionStatus = "Not started" | "In progress" | "Completed";

export function sectionStats(s: SectionSummary, p: Progress) {
  const read = s.chapters.filter((c) => p.read[c.id]).length;
  const total = s.chapters.length;
  const quizDone = s.quizzes.filter((q) => p.quizzes[q.id]).length;
  const status: SectionStatus = read === 0 ? "Not started" : read === total ? "Completed" : "In progress";
  return { read, total, quizDone, pct: total ? Math.round((read / total) * 100) : 0, status };
}

/** First unread chapter (or the first chapter, or the first quiz) of a section. */
export function nextInSection(s: SectionSummary, p: Progress) {
  const chapter = s.chapters.find((c) => !p.read[c.id]) ?? s.chapters[0];
  if (chapter) return { title: chapter.title, pos: s.chapters.indexOf(chapter) + 1, href: itemHref(s, chapter) };
  const quiz = s.quizzes[0];
  return quiz ? { title: quiz.title, pos: 0, href: itemHref(s, quiz) } : null;
}

/** The section to suggest continuing: the last one opened unless finished, else the first in progress. */
export function currentSection(hub: HubSummary, p: Progress): SectionSummary | undefined {
  const last = p.last && hub.sections.find((s) => s.id === p.last!.section);
  if (last && sectionStats(last, p).status !== "Completed") return last;
  return (
    hub.sections.find((s) => sectionStats(s, p).status === "In progress") ??
    hub.sections.find((s) => sectionStats(s, p).status === "Not started") ??
    hub.sections[0]
  );
}

export function totals(hub: HubSummary, p: Progress) {
  let chapters = 0;
  let read = 0;
  let quizzes = 0;
  for (const s of hub.sections) {
    quizzes += s.quizzes.length;
    for (const c of s.chapters) {
      chapters++;
      if (p.read[c.id]) read++;
    }
  }
  return { chapters, read, quizzes, pct: chapters ? Math.round((read / chapters) * 100) : 0 };
}

export const STATUS_BADGE: Record<SectionStatus, { bg: string; ink: string }> = {
  Completed: { bg: "#4F7A3A", ink: "#FFFFFF" },
  "In progress": { bg: "#E89A2C", ink: "#3B1D12" },
  "Not started": { bg: "#F5E6CA", ink: "#74503A" },
};
