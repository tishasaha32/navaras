import { redirect } from "next/navigation";
import { ADMIN_HOME } from "@/lib/admin-email";

export default function AdminHome() {
  redirect(ADMIN_HOME);
}
