import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminLogin from "@/components/admin/AdminLogin";
import { getAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin");
  return <AdminLogin />;
}
