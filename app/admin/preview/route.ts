import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin-auth";

/** Turns on draft preview and opens the page: for the admin only, since drafts aren’t public. */
export async function GET(req: Request) {
  if (!(await getAdmin())) redirect("/admin/login");
  const path = new URL(req.url).searchParams.get("path") ?? "/";
  (await draftMode()).enable();
  redirect(path.startsWith("/") && !path.startsWith("//") ? path : "/");
}
