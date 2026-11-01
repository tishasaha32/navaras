import sanitizeHtml from "sanitize-html";
import { isAllowedAudioPath, isAllowedImagePath, isAllowedVideoPath } from "./images";

const ALIGN = [/^(left|right|center|justify)$/];
const COLOUR = [/^#[0-9a-f]{3,8}$/i, /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*[\d.]+\s*)?\)$/];
const SIZE = [/^\d{1,4}px$/];
const PERCENT = [/^\d{1,3}%$/];
const MEDIA_ALIGN = { name: "data-align", values: ["left", "center", "right"] };
const MEDIA_RATIO = { name: "data-ratio", values: ["16:9", "4:3", "1:1", "9:16"] };

/** Allow only what the course-content editor (components/admin/RichTextEditor.tsx) can produce. */
export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "s", "mark", "sub", "sup", "span",
      "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "a", "hr", "img", "audio", "video", "div", "iframe",
      "table", "colgroup", "col", "thead", "tbody", "tr", "th", "td",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "loading", MEDIA_ALIGN, MEDIA_RATIO],
      audio: ["src", "title", "controls", { name: "preload", values: ["metadata"] }],
      video: ["src", "title", "controls", "playsinline", { name: "preload", values: ["metadata"] }, MEDIA_ALIGN, MEDIA_RATIO],
      div: ["data-youtube-video", { name: "data-layout", values: ["columns", "column", "box", "carousel", "slide"] }, { name: "data-ratio", values: ["16:9", "1:1"] }],
      iframe: ["src", "width", "height", "allowfullscreen", "allow", "title", MEDIA_ALIGN, MEDIA_RATIO],
      th: ["colspan", "rowspan", "colwidth", "style"],
      td: ["colspan", "rowspan", "colwidth", "style"],
      "*": ["style"],
    },
    allowedStyles: {
      "*": { "text-align": ALIGN, color: COLOUR },
      div: { "--split": [/^[2-8][05]$/] },
      img: { width: PERCENT },
      video: { width: PERCENT },
      iframe: { width: PERCENT },
      table: { "min-width": SIZE, width: SIZE },
      col: { "min-width": SIZE, width: SIZE },
      th: { "min-width": SIZE, width: SIZE },
      td: { "min-width": SIZE, width: SIZE },
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: [], audio: [], video: [], iframe: ["https"] },
    allowedIframeHostnames: ["www.youtube-nocookie.com", "www.youtube.com"],
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
    exclusiveFilter: (frame) =>
      // Images, audio and video only from the site's own uploads, embeds only from YouTube
      // (blocked ones lose their src); drop empty paragraphs (Tiptap adds one after lists).
      (frame.tag === "img" && !isAllowedImagePath(frame.attribs.src ?? "")) ||
      (frame.tag === "audio" && !isAllowedAudioPath(frame.attribs.src ?? "")) ||
      (frame.tag === "video" && !isAllowedVideoPath(frame.attribs.src ?? "")) ||
      (frame.tag === "iframe" && !frame.attribs.src) ||
      (frame.tag === "p" && !frame.text.trim() && !frame.mediaChildren.length),
  }).trim();
}
