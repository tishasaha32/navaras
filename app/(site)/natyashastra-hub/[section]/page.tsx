import { notFound, redirect } from "next/navigation";
import { itemHref } from "@/lib/content/hub";
import { getPublicHub } from "@/lib/content/store";

/** A section's address opens its first chapter. */
export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section: slug } = await params;
  const s = (await getPublicHub()).sections.find((x) => x.slug === slug);
  const first = s?.chapters[0] ?? s?.quizzes[0];
  if (!s || !first) notFound();
  redirect(itemHref(s, first));
}
