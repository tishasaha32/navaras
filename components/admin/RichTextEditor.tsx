"use client";

import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { CharacterCount } from "@tiptap/extensions";
import { EditorContent, findParentNode, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRef, useState, type ReactNode } from "react";
import type { ActionResult } from "@/app/admin/actions";
import { MAX_AUDIO_MB, MAX_VIDEO_MB } from "@/lib/content/hub";
import { Audio, CAROUSEL_RATIOS, Carousel, CarouselSlide, Column, Columns, LayoutBox, MEDIA_RATIOS, ResizableImage, ResizableYoutube, Video } from "./RichTextBlocks";

type Props = {
  id: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string;
  /** Opens the image library; resolves with the chosen image path. */
  onPickImage?: () => Promise<string | null>;
  /** Stores an audio file; the toolbar shows the audio button only when this is set. */
  onUploadAudio?: (form: FormData) => Promise<ActionResult>;
  /** Stores a video file; the toolbar shows the upload button only when this is set. */
  onUploadVideo?: (form: FormData) => Promise<ActionResult>;
};

const MEDIA_ALIGNMENTS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Centre" },
  { value: "right", label: "Right" },
];

/** Brand colours offered for text (kept in step with the sanitiser's allow-list). */
export const TEXT_COLOURS = [
  { label: "Default", value: "" },
  { label: "Rose", value: "#B8325A" },
  { label: "Maroon", value: "#5E1A26" },
  { label: "Saffron", value: "#C9771A" },
  { label: "Green", value: "#3F6B2A" },
  { label: "Brown", value: "#74503A" },
];

/**
 * Rich editor for course content (Natyashastra Hub lessons): headings, formatting,
 * colour and highlight, alignment, lists, quotes, links, images from the library,
 * audio, uploaded and YouTube videos, tables, two-column and bordered blocks, and carousels
 * that can hold any of those. Output is sanitised on save (lib/content/sanitize.ts).
 */
export default function RichTextEditor({ id, value, onChange, placeholder, invalid, describedBy, onPickImage, onUploadAudio, onUploadVideo }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        code: false,
        codeBlock: false,
        link: {
          openOnClick: false,
          autolink: true,
          protocols: ["http", "https", "mailto", "tel"],
          HTMLAttributes: { rel: "noopener noreferrer", target: null },
        },
      }),
      Placeholder.configure({ placeholder: placeholder ?? "Start writing…" }),
      TextStyle,
      Color,
      Highlight,
      Subscript,
      Superscript,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      ResizableImage.configure({ HTMLAttributes: { loading: "lazy" } }),
      ResizableYoutube.configure({ nocookie: true, modestBranding: true, width: 640, height: 360 }),
      TableKit.configure({ table: { resizable: false } }),
      Audio,
      Video,
      Column,
      Columns,
      LayoutBox,
      Carousel,
      CarouselSlide,
      CharacterCount,
    ],
    content: value,
    editorProps: {
      attributes: {
        id,
        class: "rich rte__content",
        role: "textbox",
        "aria-multiline": "true",
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
        ...(invalid ? { "aria-invalid": "true" } : {}),
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  return (
    <div className={`rte${invalid ? " rte--invalid" : ""}`}>
      {editor ? <Toolbar editor={editor} onPickImage={onPickImage} onUploadAudio={onUploadAudio} onUploadVideo={onUploadVideo} /> : <div className="rte__toolbar" aria-hidden="true" />}
      <EditorContent editor={editor} />
      {editor && <Footer editor={editor} />}
    </div>
  );
}

function Toolbar({ editor, onPickImage, onUploadAudio, onUploadVideo }: { editor: Editor } & Pick<Props, "onPickImage" | "onUploadAudio" | "onUploadVideo">) {
  const [uploading, setUploading] = useState<"audio" | "video" | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const carousel = findParentNode((n) => n.type.name === "carousel")(e.state.selection)?.node;
      const media = ["image", "video", "youtube"].find((type) => e.isActive(type)) ?? "";
      return {
        block: e.isActive("heading", { level: 2 }) ? "h2" : e.isActive("heading", { level: 3 }) ? "h3" : e.isActive("heading", { level: 4 }) ? "h4" : "p",
        bold: e.isActive("bold"),
        italic: e.isActive("italic"),
        underline: e.isActive("underline"),
        strike: e.isActive("strike"),
        highlight: e.isActive("highlight"),
        sub: e.isActive("subscript"),
        sup: e.isActive("superscript"),
        color: (e.getAttributes("textStyle").color as string | undefined) ?? "",
        left: e.isActive({ textAlign: "left" }),
        center: e.isActive({ textAlign: "center" }),
        right: e.isActive({ textAlign: "right" }),
        justify: e.isActive({ textAlign: "justify" }),
        bullet: e.isActive("bulletList"),
        ordered: e.isActive("orderedList"),
        quote: e.isActive("blockquote"),
        link: e.isActive("link"),
        table: e.isActive("table"),
        layout: e.isActive("layoutColumns") ? "2 columns" : e.isActive("layoutBox") ? "Bordered box" : "",
        slides: carousel?.childCount ?? 0,
        ratio: carousel?.attrs.ratio as string | undefined,
        media,
        mediaAlign: media ? (e.getAttributes(media).align as string) : "",
        mediaSize: media ? (e.getAttributes(media).size as string | null) : null,
        mediaRatio: media ? (e.getAttributes(media).ratio as string | null) : null,
        canUndo: e.can().undo(),
        canRedo: e.can().redo(),
      };
    },
  });

  const chain = () => editor.chain().focus();

  const setBlock = (v: string) => {
    if (v === "p") chain().setParagraph().run();
    else chain().setHeading({ level: Number(v[1]) as 2 | 3 | 4 }).run();
  };

  const setLink = () => {
    const prev = (editor.getAttributes("link").href as string | undefined) ?? "https://";
    const url = window.prompt("Link URL (leave empty to remove)", prev);
    if (url === null) return;
    if (url.trim() === "") return void chain().extendMarkRange("link").unsetLink().run();
    if (!/^(https?:\/\/|mailto:|tel:)/i.test(url.trim())) return window.alert("Links must start with https://, http://, mailto: or tel:");
    chain().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const addImage = async () => {
    const src = await onPickImage?.();
    if (!src) return;
    const alt = window.prompt("Describe the image for people who can’t see it (alt text)", "") ?? "";
    chain().setImage({ src, alt }).run();
  };

  const addMedia = async (kind: "audio" | "video", file: File) => {
    const [maxMb, upload] = kind === "audio" ? [MAX_AUDIO_MB, onUploadAudio!] : [MAX_VIDEO_MB, onUploadVideo!];
    setUploadError(null);
    if (file.size > maxMb * 1024 * 1024) return setUploadError(`The ${kind} must be ${maxMb} MB or smaller.`);
    const title = window.prompt(`Name this ${kind} for people using screen readers`, file.name.replace(/\.[^.]+$/, ""));
    if (title === null) return;
    const form = new FormData();
    form.append("file", file);
    setUploading(kind);
    try {
      const res = await upload(form);
      if (!res.ok) setUploadError(res.error);
      else if (res.url && !editor.isDestroyed) chain().setMedia(kind, { src: res.url, title: title.trim() }).run();
    } catch {
      setUploadError("The upload didn’t finish. Check your connection and try again.");
    } finally {
      setUploading(null);
    }
  };

  const addVideo = () => {
    const url = window.prompt("YouTube link");
    if (!url) return;
    if (!chain().setYoutubeVideo({ src: url.trim() }).run()) window.alert("That doesn’t look like a YouTube link.");
  };

  const colourValue = TEXT_COLOURS.some((c) => c.value.toLowerCase() === s.color.toLowerCase()) ? s.color.toUpperCase() : "";

  return (
    <div className="rte__toolbar" role="toolbar" aria-label="Formatting">
      <Btn label="Undo" disabled={!s.canUndo} onClick={() => chain().undo().run()}>
        <Icon d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3" />
      </Btn>
      <Btn label="Redo" disabled={!s.canRedo} onClick={() => chain().redo().run()}>
        <Icon d="m15 14 5-5-5-5M20 9H10a6 6 0 0 0 0 12h3" />
      </Btn>
      <Sep />
      <select className="rte__select" aria-label="Text style" value={s.block} onChange={(e) => setBlock(e.target.value)}>
        <option value="p">Paragraph</option>
        <option value="h2">Heading</option>
        <option value="h3">Subheading</option>
        <option value="h4">Small heading</option>
      </select>
      <Sep />
      <Btn label="Bold" active={s.bold} onClick={() => chain().toggleBold().run()}>
        <b>B</b>
      </Btn>
      <Btn label="Italic" active={s.italic} onClick={() => chain().toggleItalic().run()}>
        <i>I</i>
      </Btn>
      <Btn label="Underline" active={s.underline} onClick={() => chain().toggleUnderline().run()}>
        <u>U</u>
      </Btn>
      <Btn label="Strikethrough" active={s.strike} onClick={() => chain().toggleStrike().run()}>
        <s>S</s>
      </Btn>
      <Btn label="Highlight" active={s.highlight} onClick={() => chain().toggleHighlight().run()}>
        <Icon d="m9 11-6 6v3h9l3-3M22 12l-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
      </Btn>
      <select
        className="rte__select"
        aria-label="Text colour"
        value={colourValue}
        style={{ color: colourValue || undefined }}
        onChange={(e) => (e.target.value ? chain().setColor(e.target.value).run() : chain().unsetColor().run())}
      >
        {TEXT_COLOURS.map((c) => (
          <option key={c.label} value={c.value.toUpperCase()} style={{ color: c.value || undefined }}>
            {c.label === "Default" ? "Colour" : c.label}
          </option>
        ))}
      </select>
      <Btn label="Subscript" active={s.sub} onClick={() => chain().toggleSubscript().run()}>
        <span>
          x<sub>2</sub>
        </span>
      </Btn>
      <Btn label="Superscript" active={s.sup} onClick={() => chain().toggleSuperscript().run()}>
        <span>
          x<sup>2</sup>
        </span>
      </Btn>
      <Sep />
      <Btn label="Align left" active={s.left} onClick={() => chain().setTextAlign("left").run()}>
        <Icon d="M4 6h16M4 12h10M4 18h14" />
      </Btn>
      <Btn label="Align centre" active={s.center} onClick={() => chain().setTextAlign("center").run()}>
        <Icon d="M4 6h16M7 12h10M5 18h14" />
      </Btn>
      <Btn label="Align right" active={s.right} onClick={() => chain().setTextAlign("right").run()}>
        <Icon d="M4 6h16M10 12h10M6 18h14" />
      </Btn>
      <Btn label="Justify" active={s.justify} onClick={() => chain().setTextAlign("justify").run()}>
        <Icon d="M4 6h16M4 12h16M4 18h16" />
      </Btn>
      <Sep />
      <Btn label="Bulleted list" active={s.bullet} onClick={() => chain().toggleBulletList().run()}>
        <Icon d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
      </Btn>
      <Btn label="Numbered list" active={s.ordered} onClick={() => chain().toggleOrderedList().run()}>
        <Icon d="M10 6h10M10 12h10M10 18h10M4 5h1v4M4 9h2M4 15h2l-2 3h2" />
      </Btn>
      <Btn label="Quote or shloka" active={s.quote} onClick={() => chain().toggleBlockquote().run()}>
        <Icon d="M7 7h4v4H8v3M14 7h4v4h-3v3" />
      </Btn>
      <Btn label="Divider" onClick={() => chain().setHorizontalRule().run()}>
        <Icon d="M4 12h16" />
      </Btn>
      <Sep />
      <Btn label="Link" active={s.link} onClick={setLink}>
        <Icon d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
      </Btn>
      {onPickImage && (
        <Btn label="Image" onClick={() => void addImage()}>
          <Icon d="M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15.5 9.5h.01" />
        </Btn>
      )}
      {onUploadAudio && (
        <UploadBtn label="Audio" accept=".mp3,.m4a,.wav,audio/mpeg,audio/mp4,audio/x-m4a,audio/wav" disabled={Boolean(uploading)} onFile={(f) => void addMedia("audio", f)}>
          <Icon d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
        </UploadBtn>
      )}
      {onUploadVideo && (
        <UploadBtn label="Upload video" accept=".mp4,.webm,video/mp4,video/webm" disabled={Boolean(uploading)} onFile={(f) => void addMedia("video", f)}>
          <Icon d="M4 5h16v14H4zM4 9h16M4 15h16M9 5v4M15 5v4M9 15v4M15 15v4" />
        </UploadBtn>
      )}
      <Btn label="YouTube video" onClick={addVideo}>
        <Icon d="M3 7.5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM10 9l5 3-5 3z" />
      </Btn>
      <Btn label="Table" active={s.table} onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
        <Icon d="M4 5h16v14H4zM4 10h16M4 15h16M10 5v14" />
      </Btn>
      <Btn label="Two columns" active={s.layout === "2 columns"} disabled={Boolean(s.layout)} onClick={() => chain().insertColumns().run()}>
        <Icon d="M4 5h7v14H4zM13 5h7v14h-7z" />
      </Btn>
      <Btn label="One column with border" active={s.layout === "Bordered box"} disabled={Boolean(s.layout)} onClick={() => chain().wrapIn("layoutBox").run()}>
        <Icon d="M4 5h16v14H4zM8 10h8M8 14h8" />
      </Btn>
      <Btn label="Carousel" active={s.slides > 0} disabled={s.slides > 0 || Boolean(s.layout) || s.table} onClick={() => chain().insertCarousel().run()}>
        <Icon d="M7 5h10v14H7zM3 8v8M21 8v8" />
      </Btn>
      <Btn label="Clear formatting" onClick={() => chain().unsetAllMarks().clearNodes().run()}>
        <Icon d="M6 6h12M12 6l-3 12M4 20 20 4" />
      </Btn>

      {s.table && (
        <div className="rte__table-tools" role="group" aria-label="Table">
          <span>Table:</span>
          <TextBtn onClick={() => chain().addRowAfter().run()}>+ Row</TextBtn>
          <TextBtn onClick={() => chain().addColumnAfter().run()}>+ Column</TextBtn>
          <TextBtn onClick={() => chain().deleteRow().run()}>− Row</TextBtn>
          <TextBtn onClick={() => chain().deleteColumn().run()}>− Column</TextBtn>
          <TextBtn onClick={() => chain().toggleHeaderRow().run()}>Header row</TextBtn>
          <TextBtn onClick={() => chain().mergeOrSplit().run()}>Merge / split</TextBtn>
          <TextBtn danger onClick={() => chain().deleteTable().run()}>
            Delete table
          </TextBtn>
        </div>
      )}

      {s.layout && (
        <div className="rte__table-tools" role="group" aria-label="Layout">
          <span>{s.layout}:</span>
          <TextBtn onClick={() => chain().unsetLayout().run()}>Remove layout, keep content</TextBtn>
        </div>
      )}

      {s.media && (
        <div className="rte__table-tools" role="group" aria-label={s.media === "image" ? "Image" : "Video"}>
          <span>{s.media === "image" ? "Image:" : "Video:"}</span>
          {MEDIA_ALIGNMENTS.map(({ value, label }) => (
            <TextBtn key={value} active={s.mediaAlign === value} onClick={() => chain().updateAttributes(s.media, { align: value }).run()}>
              {label}
            </TextBtn>
          ))}
          {s.mediaSize && <TextBtn onClick={() => chain().updateAttributes(s.media, { size: null }).run()}>Reset size</TextBtn>}
          <span>Shape:</span>
          <TextBtn active={!s.mediaRatio} onClick={() => chain().updateAttributes(s.media, { ratio: null }).run()}>
            Original
          </TextBtn>
          {MEDIA_RATIOS.map((ratio) => (
            <TextBtn key={ratio} active={s.mediaRatio === ratio} onClick={() => chain().updateAttributes(s.media, { ratio }).run()}>
              {ratio}
            </TextBtn>
          ))}
        </div>
      )}

      {s.slides > 0 && (
        <div className="rte__table-tools" role="group" aria-label="Carousel">
          <span>Carousel:</span>
          {CAROUSEL_RATIOS.map((ratio) => (
            <TextBtn key={ratio} active={s.ratio === ratio} onClick={() => chain().updateAttributes("carousel", { ratio }).run()}>
              {ratio}
            </TextBtn>
          ))}
          <TextBtn onClick={() => chain().addSlide().run()}>+ Slide</TextBtn>
          {s.slides > 1 && <TextBtn onClick={() => chain().deleteNode("carouselSlide").run()}>− Slide</TextBtn>}
          <TextBtn onClick={() => chain().unsetCarousel().run()}>Remove carousel, keep content</TextBtn>
          <TextBtn danger onClick={() => chain().deleteNode("carousel").run()}>
            Delete carousel
          </TextBtn>
        </div>
      )}

      {uploading && (
        <div className="rte__table-tools" role="status">
          Uploading {uploading}…
        </div>
      )}
      {uploadError && (
        <div className="rte__table-tools" role="alert" style={{ color: "var(--a-danger)" }}>
          {uploadError}
          <TextBtn onClick={() => setUploadError(null)}>Dismiss</TextBtn>
        </div>
      )}
    </div>
  );
}

function Footer({ editor }: { editor: Editor }) {
  const words = useEditorState({ editor, selector: ({ editor: e }) => e.storage.characterCount.words() as number });
  const minutes = Math.max(1, Math.round(words / 200));
  return (
    <div className="rte__footer" aria-live="polite">
      {words} {words === 1 ? "word" : "words"} · about {minutes} min read
    </div>
  );
}

function Sep() {
  return <span className="rte__sep" aria-hidden="true" />;
}

function Btn({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="rte__btn"
      aria-label={label}
      title={label}
      aria-pressed={active ?? undefined}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function UploadBtn({
  label,
  accept,
  disabled,
  onFile,
  children,
}: {
  label: string;
  accept: string;
  disabled: boolean;
  onFile: (file: File) => void;
  children: ReactNode;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <Btn label={label} disabled={disabled} onClick={() => input.current?.click()}>
        {children}
      </Btn>
      <input
        ref={input}
        type="file"
        accept={accept}
        aria-label={`${label} file`}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </>
  );
}

function TextBtn({ onClick, active, danger, children }: { onClick: () => void; active?: boolean; danger?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      className="rte__text-btn"
      aria-pressed={active}
      style={danger ? { color: "var(--a-danger)" } : undefined}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Icon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
