import { promises as fs } from "fs";
import path from "path";
import { AUDIO_NAME, UPLOAD_NAME } from "@/lib/content/images";
import { UPLOAD_DIR } from "@/lib/content/store";

const TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  wav: "audio/wav",
};

/** Start and end (inclusive) of a single `bytes=` range, or null when it can't be served. */
function parseRange(header: string, size: number): [number, number] | null {
  const m = header.match(/^bytes=(\d*)-(\d*)$/);
  if (!m || (!m[1] && !m[2])) return null;
  const start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]));
  const end = m[1] && m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
  return start <= end ? [start, end] : null;
}

export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!UPLOAD_NAME.test(file) && !AUDIO_NAME.test(file)) return new Response("Not found", { status: 404 });
  const headers = {
    "Content-Type": TYPES[file.split(".").pop()!],
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
  };
  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, file));
    // Safari won't play audio from a server that doesn't answer range requests.
    const header = req.headers.get("range");
    if (!header) return new Response(new Uint8Array(data), { headers });
    const range = parseRange(header, data.length);
    if (!range) return new Response(null, { status: 416, headers: { ...headers, "Content-Range": `bytes */${data.length}` } });
    const [start, end] = range;
    return new Response(new Uint8Array(data.subarray(start, end + 1)), {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${data.length}` },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
