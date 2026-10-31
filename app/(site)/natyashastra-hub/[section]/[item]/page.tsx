import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SectionReader from "@/components/hub/SectionReader";
import { lessonText, summarize, type Hub } from "@/lib/content/hub";
import { getPublicHub } from "@/lib/content/store";

type Params = { params: Promise<{ section: string; item: string }> };

function find(hub: Hub, sectionSlug: string, itemSlug: string) {
  const idx = hub.sections.findIndex((x) => x.slug === sectionSlug);
  const section = hub.sections[idx];
  if (!section) return null;
  const ci = section.chapters.findIndex((c) => c.slug === itemSlug);
  if (ci !== -1) return { idx, section, view: { kind: "chapter" as const, index: ci } };
  const qi = section.quizzes.findIndex((q) => q.slug === itemSlug);
  if (qi !== -1) return { idx, section, view: { kind: "quiz" as const, index: qi } };
  return null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { section, item } = await params;
  const found = find(await getPublicHub(), section, item);
  if (!found) return { title: "Not found" };
  const { section: s, view } = found;
  const title = view.kind === "chapter" ? s.chapters[view.index].title : `${s.quizzes[view.index].title} — quiz`;
  return {
    title: `${title} · ${s.title} — Natyashastra Hub`,
    description: view.kind === "chapter" ? lessonText(s.chapters[view.index].body).slice(0, 160) : s.desc,
  };
}

export default async function ItemPage({ params }: Params) {
  const { section, item } = await params;
  const hub = await getPublicHub();
  const found = find(hub, section, item);
  if (!found) notFound();
  const summary = summarize(hub);
  const next = hub.sections.length > 1 ? summary.sections[(found.idx + 1) % hub.sections.length] : undefined;
  return (
    <SectionReader
      key={`${found.section.id}-${found.view.kind}-${found.view.index}`}
      section={found.section}
      view={found.view}
      summary={summary}
      categoryName={hub.categories.find((c) => c.id === found.section.cat)?.name ?? ""}
      nextSection={next}
    />
  );
}
