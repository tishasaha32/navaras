import type { Metadata } from "next";
import { redirect } from "next/navigation";
import HubBuilder from "@/components/admin/hub/HubBuilder";
import { getAdmin } from "@/lib/admin-auth";
import { listImages } from "@/lib/content/images";
import { getEditableHub } from "@/lib/content/store";

export const metadata: Metadata = { title: "Natyashastra Hub" };

export default async function HubAdminPage() {
  if (!(await getAdmin())) redirect("/admin/login");
  const [{ data, hasDraft }, library] = await Promise.all([getEditableHub(), listImages()]);
  return <HubBuilder initial={data} hasDraft={hasDraft} library={library} />;
}
