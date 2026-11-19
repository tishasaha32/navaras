import { firebaseEnabled } from "@/lib/firebase-admin";
import { storageLink } from "@/lib/content/uploads";

/**
 * The site's own videos (Dance Company reviews, wedding sangeets), kept in Firebase Storage under
 * videos/. Browsers are sent straight to Storage, which streams long videos far more reliably than
 * this server can when several start loading at once. The link lasts a day; browsers reuse it for an hour.
 * A missing file gets Storage's own not-found answer.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!firebaseEnabled || !/^[a-z0-9-]+\.(mp4|webm)$/.test(file)) return new Response("Not found", { status: 404 });
  const link = await storageLink(`videos/${file}`).catch(() => null);
  if (!link) return new Response("Video unavailable", { status: 503 });
  return new Response(null, { status: 302, headers: { Location: link, "Cache-Control": "private, max-age=3600" } });
}
