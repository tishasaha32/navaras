import type { Metadata } from "next";
import HubLibrary from "@/components/hub/HubLibrary";
import { summarize } from "@/lib/content/hub";
import { getPublicHub } from "@/lib/content/store";

export const metadata: Metadata = {
  title: "Natyashastra Hub",
  description: "The theory behind classical Indian dance, organised into sections and chapters. Free to read.",
};

export default async function HubPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [hub, { category }] = await Promise.all([getPublicHub(), searchParams]);
  return <HubLibrary key={category} hub={summarize(hub)} initialCategory={category} />;
}
