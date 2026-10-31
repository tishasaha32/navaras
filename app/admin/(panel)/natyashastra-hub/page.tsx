import type { Metadata } from "next";
import HubBuilder from "@/components/admin/hub/HubBuilder";
import { listImages } from "@/lib/content/images";
import { getEditable } from "@/lib/content/store";

export const metadata: Metadata = { title: "Natyashastra Hub" };

export default async function HubAdminPage() {
  const [{ data, hasDraft }, library] = await Promise.all([getEditable("hub"), listImages()]);
  return <HubBuilder initial={data} hasDraft={hasDraft} library={library} />;
}
