import { redirect } from "next/navigation";
import { PAGE_SCHEMAS } from "@/lib/content/pages";

export default function AdminHome() {
  redirect(`/admin/${PAGE_SCHEMAS.landing.slug}`);
}
