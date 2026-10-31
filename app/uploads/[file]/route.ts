import { AUDIO_NAME, UPLOAD_NAME, VIDEO_NAME } from "@/lib/content/images";
import { serveFile } from "@/lib/content/serve-file";
import { readUpload } from "@/lib/content/uploads";

const TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  wav: "audio/wav",
  mp4: "video/mp4",
  webm: "video/webm",
};

export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!UPLOAD_NAME.test(file) && !AUDIO_NAME.test(file) && !VIDEO_NAME.test(file)) return new Response("Not found", { status: 404 });
  const stored = await readUpload(file).catch(() => null);
  if (!stored) return new Response("Not found", { status: 404 });
  return serveFile(req, stored, { "Content-Type": TYPES[file.split(".").pop()!], "Cache-Control": "public, max-age=31536000, immutable" });
}
