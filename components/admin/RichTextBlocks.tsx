import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { Fragment } from "@tiptap/pm/model";
import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import { mergeAttributes, Node, NodeViewWrapper, ReactNodeViewRenderer, type Command, type JSONContent, type NodeViewProps } from "@tiptap/react";
import { AudioPlayer, VideoPlayer } from "@/components/MediaPlayer";
import { embedUrl } from "@/lib/video";

type MediaKind = "audio" | "video";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    richBlocks: {
      setMedia: (kind: MediaKind, attrs: { src: string; title: string }) => ReturnType;
      insertColumns: () => ReturnType;
      /** Takes the blocks out of the columns or box around the cursor. */
      unsetLayout: () => ReturnType;
      insertCarousel: () => ReturnType;
      addSlide: () => ReturnType;
      /** Takes the blocks out of the carousel around the cursor. */
      unsetCarousel: () => ReturnType;
    };
  }
}

const BLOCKS = "paragraph | heading | bulletList | orderedList | blockquote | horizontalRule | image | youtube | audio | video | table";

/** Everything a layout block can hold: all block nodes except layouts, so they can't nest. */
const LAYOUT_CONTENT = `(${BLOCKS})+`;

/** Shapes a carousel can take (kept in step with the sanitiser's allow-list). */
export const CAROUSEL_RATIOS = ["16:9", "1:1"];

/** A slide can also hold layouts, but not another carousel. */
const SLIDE_CONTENT = `(${BLOCKS} | layoutColumns | layoutBox)+`;

const paragraphs = (type: string): JSONContent => ({ type, content: [{ type: "paragraph" }] });

/** Inserts a layout with the cursor in its first paragraph; inserting leaves it in the last. */
const insertLayout =
  (type: string, content: JSONContent[]): Command =>
  ({ chain }) =>
    chain()
      .insertContent({ type, content })
      .command(({ tr }) => {
        const { $from } = tr.selection;
        for (let d = $from.depth; d > 0; d--) {
          if ($from.node(d).type.name === type) tr.setSelection(TextSelection.near(tr.doc.resolve($from.start(d) + 1)));
        }
        return true;
      })
      .run();

/** Replaces the nearest of these nodes around the cursor with the blocks inside it. */
const unwrap =
  (...types: string[]): Command =>
  ({ state, tr, dispatch }) => {
    const { $from } = state.selection;
    for (let d = $from.depth; d > 0; d--) {
      const node = $from.node(d);
      if (!types.includes(node.type.name)) continue;
      let content = Fragment.empty;
      // Columns and slides aren't blocks themselves, so only what's inside them is kept.
      node.forEach((child) => (content = content.append(child.type.isInGroup("block") ? Fragment.from(child) : child.content)));
      if (dispatch) tr.replaceWith($from.before(d), $from.after(d), content);
      return true;
    }
    return false;
  };

/** Narrowest a picture or video can be dragged, in pixels. */
const MIN_WIDTH = 80;

/** Shapes a picture or video can be cropped to (kept in step with the sanitiser's allow-list). */
export const MEDIA_RATIOS = ["16:9", "4:3", "1:1", "9:16"];

/** How wide a picture or video sits in the lesson, on which side, and in what shape. */
const placement = {
  size: {
    default: null,
    parseHTML: (el: HTMLElement) => el.style.width || null,
    renderHTML: (attrs: Record<string, string | null>) => (attrs.size ? { style: `width: ${attrs.size}` } : {}),
  },
  align: {
    default: "center",
    parseHTML: (el: HTMLElement) => el.getAttribute("data-align") ?? "center",
    renderHTML: (attrs: Record<string, string>) => ({ "data-align": attrs.align }),
  },
  ratio: {
    default: null,
    parseHTML: (el: HTMLElement) => el.getAttribute("data-ratio"),
    renderHTML: (attrs: Record<string, string | null>) => (attrs.ratio ? { "data-ratio": attrs.ratio } : {}),
  },
};

const sizeStyle = (size: string | null) => (size ? ({ "--size": size } as React.CSSProperties) : undefined);

/** Grips on both sides of a picture or video. The width only saves on release, so one drag is one undo. */
function ResizeHandles({ align, onResize }: { align: string; onResize: (size: string) => void }) {
  const start = (e: React.PointerEvent<HTMLButtonElement>, side: 1 | -1) => {
    e.preventDefault();
    const handle = e.currentTarget;
    const box = handle.parentElement!;
    const room = box.parentElement!.clientWidth;
    const cap = getComputedStyle(box).maxWidth;
    const max = cap.endsWith("px") ? Math.min(room, parseFloat(cap)) : room;
    const from = box.offsetWidth;
    const startX = e.clientX;
    // A centred block grows on both sides, so it has to follow the pointer at twice the distance.
    const grow = align === "center" ? 2 : 1;
    const move = (m: PointerEvent) => {
      box.style.width = `${Math.round(Math.min(max, Math.max(MIN_WIDTH, from + side * grow * (m.clientX - startX))))}px`;
    };
    handle.setPointerCapture(e.pointerId);
    handle.addEventListener("pointermove", move);
    handle.addEventListener(
      "lostpointercapture",
      () => {
        handle.removeEventListener("pointermove", move);
        onResize(`${Math.round((box.offsetWidth / room) * 100)}%`);
        box.style.width = "";
      },
      { once: true },
    );
  };

  return (
    <>
      <button type="button" className="rte-handle rte-handle--left" aria-label="Drag to resize" title="Drag to resize" onPointerDown={(e) => start(e, -1)} onDragStart={(e) => e.preventDefault()} />
      <button type="button" className="rte-handle rte-handle--right" aria-label="Drag to resize" title="Drag to resize" onPointerDown={(e) => start(e, 1)} onDragStart={(e) => e.preventDefault()} />
    </>
  );
}

function ImageView({ node, updateAttributes }: NodeViewProps) {
  const { src, alt, title, size, align, ratio } = node.attrs;
  return (
    <NodeViewWrapper className="rte-image" data-align={align} style={sizeStyle(size)}>
      <img src={src} alt={alt ?? ""} title={title ?? undefined} data-ratio={ratio ?? undefined} />
      <ResizeHandles align={align} onResize={(size) => updateAttributes({ size })} />
    </NodeViewWrapper>
  );
}

function VideoView({ node, updateAttributes }: NodeViewProps) {
  const { src, title, size, align, ratio } = node.attrs;
  return (
    <NodeViewWrapper>
      <VideoPlayer src={src} title={title} size={size} align={align} ratio={ratio}>
        <ResizeHandles align={align} onResize={(size) => updateAttributes({ size })} />
      </VideoPlayer>
    </NodeViewWrapper>
  );
}

function YoutubeView({ node, updateAttributes }: NodeViewProps) {
  const { src, size, align, ratio } = node.attrs;
  return (
    <NodeViewWrapper className="rte-image rte-image--embed" data-align={align} style={sizeStyle(size)}>
      <iframe src={embedUrl(src)?.replace("autoplay=1", "autoplay=0")} title="YouTube video" data-ratio={ratio ?? undefined} />
      <ResizeHandles align={align} onResize={(size) => updateAttributes({ size })} />
    </NodeViewWrapper>
  );
}

/** Pictures from the library, which can be resized, aligned and cropped in place. */
export const ResizableImage = Image.extend({
  addAttributes() {
    return { ...this.parent?.(), ...placement };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
});

export const ResizableYoutube = Youtube.extend({
  addAttributes() {
    return { ...this.parent?.(), ...placement };
  },

  addNodeView() {
    return ReactNodeViewRenderer(YoutubeView);
  },
});

/** A file from `uploadAudio` or `uploadVideo`. The editor shows the same player as the lesson. */
const mediaNode = (name: MediaKind, Player: typeof AudioPlayer, attrs: Record<string, string>) =>
  Node.create({
    name,
    group: "block",
    atom: true,
    draggable: true,

    addAttributes() {
      return { src: { default: null }, title: { default: "" } };
    },

    parseHTML() {
      return [{ tag: `${name}[src]` }];
    },

    renderHTML({ HTMLAttributes }) {
      return [name, mergeAttributes(HTMLAttributes, attrs)];
    },

    addNodeView() {
      return ReactNodeViewRenderer(function MediaView({ node }: NodeViewProps) {
        return (
          <NodeViewWrapper>
            <Player src={node.attrs.src} title={node.attrs.title} />
          </NodeViewWrapper>
        );
      });
    },
  });

export const Audio = mediaNode("audio", AudioPlayer, { controls: "", preload: "metadata" }).extend({
  addCommands() {
    return {
      setMedia:
        (kind, attrs) =>
        ({ chain }) =>
          chain()
            .insertContent({ type: kind, attrs })
            // Move to text after the player, or the next keystroke would replace a selected player.
            .command(({ tr, state }) => {
              if (!(tr.selection instanceof NodeSelection)) return true;
              const pos = tr.selection.to;
              if (!tr.doc.resolve(pos).nodeAfter?.isTextblock) tr.insert(pos, state.schema.nodes.paragraph.create());
              tr.setSelection(TextSelection.create(tr.doc, pos + 1));
              return true;
            })
            .run(),
    };
  },
});

export const Video = mediaNode("video", VideoPlayer, { controls: "", preload: "metadata", playsinline: "" }).extend({
  addAttributes() {
    return { ...this.parent?.(), ...placement };
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoView);
  },
});

export const Column = Node.create({
  name: "layoutColumn",
  content: LAYOUT_CONTENT,
  isolating: true,

  parseHTML() {
    return [{ tag: 'div[data-layout="column"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-layout": "column" }), 0];
  },
});

/** Share of the row the first column can take, in percent (kept in step with the sanitiser's allow-list). */
const SPLIT = { min: 20, max: 80, step: 5, even: 50 };

/** Two columns side by side; they stack when the lesson is narrow (app/globals.css). */
export const Columns = Node.create({
  name: "layoutColumns",
  group: "block",
  content: "layoutColumn{2}",
  isolating: true,

  addAttributes() {
    return {
      split: {
        default: null,
        parseHTML: (el) => Number(el.style.getPropertyValue("--split")) || null,
        renderHTML: (attrs) => (attrs.split ? { style: `--split: ${attrs.split}` } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-layout="columns"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-layout": "columns" }), 0];
  },

  /** Adds a bar between the columns. The split only saves on release, so one drag is one undo. */
  addNodeView() {
    return ({ node, getPos, editor }) => {
      let current = node;
      const dom = document.createElement("div");
      dom.className = "rte-columns";
      const contentDOM = dom.appendChild(document.createElement("div"));
      contentDOM.setAttribute("data-layout", "columns");
      const handle = dom.appendChild(document.createElement("button"));
      handle.type = "button";
      handle.className = "rte-columns__handle";
      handle.contentEditable = "false";
      handle.title = handle.ariaLabel = "Drag to resize the columns";

      const show = (split: number | null) => (split ? dom.style.setProperty("--split", String(split)) : dom.style.removeProperty("--split"));
      show(node.attrs.split);

      handle.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        const { left, width } = contentDOM.getBoundingClientRect();
        const saved = current.attrs.split ?? SPLIT.even;
        let split = saved;
        const move = (m: PointerEvent) => {
          const share = Math.round(((m.clientX - left) / width) * (100 / SPLIT.step)) * SPLIT.step;
          split = Math.min(SPLIT.max, Math.max(SPLIT.min, share));
          show(split);
          handle.dataset.label = `${split}% / ${100 - split}%`;
        };
        handle.setPointerCapture(e.pointerId);
        handle.addEventListener("pointermove", move);
        handle.addEventListener(
          "lostpointercapture",
          () => {
            handle.removeEventListener("pointermove", move);
            delete handle.dataset.label;
            const pos = getPos();
            if (split !== saved && pos !== undefined) editor.view.dispatch(editor.state.tr.setNodeAttribute(pos, "split", split));
          },
          { once: true },
        );
      });

      return {
        dom,
        contentDOM,
        stopEvent: (e) => e.target === handle,
        ignoreMutation: (m) => !contentDOM.contains(m.target),
        update: (updated) => {
          if (updated.type !== current.type) return false;
          current = updated;
          show(updated.attrs.split);
          return true;
        },
      };
    };
  },

  addCommands() {
    return {
      insertColumns: () => insertLayout(this.name, [paragraphs("layoutColumn"), paragraphs("layoutColumn")]),
      unsetLayout: () => unwrap(this.name, "layoutBox"),
    };
  },
});

/** A single full-width column with a border. */
export const LayoutBox = Node.create({
  name: "layoutBox",
  group: "block",
  content: LAYOUT_CONTENT,
  isolating: true,

  parseHTML() {
    return [{ tag: 'div[data-layout="box"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-layout": "box" }), 0];
  },
});

export const CarouselSlide = Node.create({
  name: "carouselSlide",
  content: SLIDE_CONTENT,
  isolating: true,

  parseHTML() {
    return [{ tag: 'div[data-layout="slide"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-layout": "slide" }), 0];
  },
});

/** Slides of any blocks. The editor stacks them; lessons show one at a time (components/Carousel.tsx). */
export const Carousel = Node.create({
  name: "carousel",
  group: "block",
  content: "carouselSlide+",
  isolating: true,

  addAttributes() {
    return {
      ratio: {
        default: CAROUSEL_RATIOS[0],
        parseHTML: (el) => el.getAttribute("data-ratio") ?? CAROUSEL_RATIOS[0],
        renderHTML: (attrs) => ({ "data-ratio": attrs.ratio }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-layout="carousel"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-layout": "carousel" }), 0];
  },

  addCommands() {
    return {
      insertCarousel: () => insertLayout(this.name, [paragraphs("carouselSlide"), paragraphs("carouselSlide")]),

      addSlide:
        () =>
        ({ state, tr, dispatch }) => {
          const { $from } = state.selection;
          for (let d = $from.depth; d > 0; d--) {
            if ($from.node(d).type.name !== "carouselSlide") continue;
            const pos = $from.after(d);
            if (dispatch) {
              tr.insert(pos, state.schema.nodes.carouselSlide.createAndFill()!);
              tr.setSelection(TextSelection.near(tr.doc.resolve(pos + 1)));
            }
            return true;
          }
          return false;
        },

      unsetCarousel: () => unwrap(this.name),
    };
  },
});
