import { firebaseEnabled } from "@/lib/firebase-admin";
import { serveFile } from "@/lib/content/serve-file";
import { readStorageFile } from "@/lib/content/uploads";

const TYPES: Record<string, string> = { svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp" };

/** The site's own pictures, kept in Firebase Storage. Files still in public/images are served before this. */
export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!firebaseEnabled || !/^[a-z0-9-]+\.(svg|png|jpe?g|webp)$/.test(file)) return new Response("Not found", { status: 404 });
  const stored = await readStorageFile(`images/${file}`).catch(() => null);
  if (!stored) return new Response("Not found", { status: 404 });
  return serveFile(req, stored, { "Content-Type": TYPES[file.split(".").pop()!], "Cache-Control": "public, max-age=86400" });
}
