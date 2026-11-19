import { firebaseEnabled } from "@/lib/firebase-admin";
import { serveFile } from "@/lib/content/serve-file";
import { readStorageFile } from "@/lib/content/uploads";

const TYPES: Record<string, string> = { mp4: "video/mp4", webm: "video/webm" };

/** The site's own videos (like the Dance Company reviews), kept in Firebase Storage under videos/. */
export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!firebaseEnabled || !/^[a-z0-9-]+\.(mp4|webm)$/.test(file)) return new Response("Not found", { status: 404 });
  const stored = await readStorageFile(`videos/${file}`).catch(() => null);
  if (!stored) return new Response("Not found", { status: 404 });
  return serveFile(req, stored, { "Content-Type": TYPES[file.split(".").pop()!], "Cache-Control": "public, max-age=86400" });
}
