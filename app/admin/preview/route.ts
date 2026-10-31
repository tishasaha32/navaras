import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

/** Turns on draft preview and opens the page. (Will be admin-only once Firebase auth protects /admin.) */
export async function GET(req: Request) {
  const path = new URL(req.url).searchParams.get("path") ?? "/";
  (await draftMode()).enable();
  redirect(path.startsWith("/") && !path.startsWith("//") ? path : "/");
}
