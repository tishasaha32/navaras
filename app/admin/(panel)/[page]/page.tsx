import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageEditor from "@/components/admin/PageEditor";
import { listImages } from "@/lib/content/images";
import { pageBySlug } from "@/lib/content/pages";
import { getEditable } from "@/lib/content/store";

type Params = { params: Promise<{ page: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return { title: pageBySlug((await params).page)?.label ?? "Not found" };
}

export default async function PageEditorPage({ params }: Params) {
  const schema = pageBySlug((await params).page);
  if (!schema) notFound();
  const [{ data, hasDraft }, library] = await Promise.all([getEditable(schema.key), listImages()]);
  return <PageEditor key={schema.key} pageKey={schema.key} initial={data} hasDraft={hasDraft} library={library} />;
}
