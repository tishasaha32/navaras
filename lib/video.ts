/** Turns a YouTube or Vimeo link into an embeddable player URL, or null if it isn't one. */
export function embedUrl(link: string): string | null {
  let url: URL;
  try {
    url = new URL(link.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\.|^m\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = url.pathname.slice(1);
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    id = url.searchParams.get("v") ?? url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] ?? null;
  }
  if (id && /^[\w-]{6,20}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const vid = url.pathname.match(/(\d{6,12})/)?.[1];
    if (vid) return `https://player.vimeo.com/video/${vid}?autoplay=1`;
  }
  return null;
}
