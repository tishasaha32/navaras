import HubBar from "@/components/hub/HubBar";
import LearnerProvider from "@/components/hub/LearnerProvider";
import { getPublicHub } from "@/lib/content/store";

export default async function HubLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const hub = await getPublicHub();
  const chapterIds = hub.sections.flatMap((s) => s.chapters.map((c) => c.id));
  return (
    <LearnerProvider>
      <HubBar chapterIds={chapterIds} />
      {children}
    </LearnerProvider>
  );
}
