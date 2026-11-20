import type { Metadata } from "next";
import { redirect } from "next/navigation";
import RentalBuilder from "@/components/admin/rental/RentalBuilder";
import { getAdmin } from "@/lib/admin-auth";
import { listImages } from "@/lib/content/images";
import { DRESS_CATEGORIES, JEWELLERY_CATEGORIES } from "@/lib/content/pages";
import { readRental } from "@/lib/content/rental";

export const metadata: Metadata = { title: "Dresses" };

export default async function DressesAdminPage() {
  if (!(await getAdmin())) redirect("/admin/login");
  const [rental, library] = await Promise.all([readRental(), listImages()]);
  return <RentalBuilder initial={rental} library={library} categories={{ dresses: DRESS_CATEGORIES, jewellery: JEWELLERY_CATEGORIES }} />;
}
