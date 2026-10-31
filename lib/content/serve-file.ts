import type { StoredFile } from "./uploads";

/** Start and end (inclusive) of a single `bytes=` range, or null when it can't be served. */
function parseRange(header: string, size: number): [number, number] | null {
  const m = header.match(/^bytes=(\d*)-(\d*)$/);
  if (!m || (!m[1] && !m[2])) return null;
  const start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]));
  const end = m[1] && m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
  return start <= end ? [start, end] : null;
}

/** Streams the file, so a long video is never read into memory for one request. */
export function serveFile(req: Request, file: StoredFile, base: Record<string, string>) {
  const headers = { ...base, "X-Content-Type-Options": "nosniff", "Accept-Ranges": "bytes" };
  const { size, open } = file;
  // Safari won't play audio or video from a server that doesn't answer range requests.
  const header = req.headers.get("range");
  if (!header) return new Response(size ? open(0, size - 1) : null, { headers: { ...headers, "Content-Length": String(size) } });
  const range = parseRange(header, size);
  if (!range) return new Response(null, { status: 416, headers: { ...headers, "Content-Range": `bytes */${size}` } });
  const [start, end] = range;
  return new Response(open(start, end), {
    status: 206,
    headers: { ...headers, "Content-Length": String(end - start + 1), "Content-Range": `bytes ${start}-${end}/${size}` },
  });
}
