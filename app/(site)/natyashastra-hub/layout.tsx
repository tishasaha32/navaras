import HubBar from "@/components/hub/HubBar";
import HubHeader from "@/components/hub/HubHeader";
import LearnerProvider from "@/components/hub/LearnerProvider";
import { getPublicHub } from "@/lib/content/store";

export default async function HubLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const hub = await getPublicHub();
  const chapterIds = hub.sections.flatMap((s) => s.chapters.map((c) => c.id));
  return (
    <LearnerProvider>
      <HubHeader categories={hub.categories.filter((c) => hub.sections.some((s) => s.cat === c.id))} />
      <main>
        <HubBar chapterIds={chapterIds} />
        {children}
      </main>
    </LearnerProvider>
  );
}
