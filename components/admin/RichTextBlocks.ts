import { Fragment } from "@tiptap/pm/model";
import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import { mergeAttributes, Node } from "@tiptap/react";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    richBlocks: {
      setAudio: (attrs: { src: string; title: string }) => ReturnType;
      insertColumns: () => ReturnType;
      /** Takes the blocks out of the layout around the cursor. */
      unsetLayout: () => ReturnType;
    };
  }
}

/** Everything a layout block can hold: all block nodes except layouts, so they can't nest. */
const LAYOUT_CONTENT = "(paragraph | heading | bulletList | orderedList | blockquote | horizontalRule | image | youtube | audio | table)+";

/** Audio player for a file from `uploadAudio`. */
export const Audio = Node.create({
  name: "audio",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return { src: { default: null }, title: { default: "" } };
  },

  parseHTML() {
    return [{ tag: "audio[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["audio", mergeAttributes(HTMLAttributes, { controls: "", preload: "metadata" })];
  },

  addCommands() {
    return {
      setAudio:
        (attrs) =>
        ({ chain }) =>
          chain()
            .insertContent({ type: this.name, attrs })
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

/** Two columns side by side; they stack when the lesson is narrow (app/globals.css). */
export const Columns = Node.create({
  name: "layoutColumns",
  group: "block",
  content: "layoutColumn{2}",
  isolating: true,

  parseHTML() {
    return [{ tag: 'div[data-layout="columns"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-layout": "columns" }), 0];
  },

  addCommands() {
    const column = { type: "layoutColumn", content: [{ type: "paragraph" }] };
    return {
      insertColumns:
        () =>
        ({ chain }) =>
          chain()
            .insertContent({ type: this.name, content: [column, column] })
            .command(({ tr }) => {
              // Inserting leaves the cursor in the last column; start typing in the first.
              const { $from } = tr.selection;
              for (let d = $from.depth; d > 0; d--) {
                if ($from.node(d).type.name === this.name) tr.setSelection(TextSelection.near(tr.doc.resolve($from.start(d) + 1)));
              }
              return true;
            })
            .run(),

      unsetLayout:
        () =>
        ({ state, tr, dispatch }) => {
          const { $from } = state.selection;
          for (let d = $from.depth; d > 0; d--) {
            const node = $from.node(d);
            if (node.type.name !== this.name && node.type.name !== "layoutBox") continue;
            let content = node.content;
            if (node.type.name === this.name) {
              content = Fragment.empty;
              node.forEach((col) => (content = content.append(col.content)));
            }
            if (dispatch) tr.replaceWith($from.before(d), $from.after(d), content);
            return true;
          }
          return false;
        },
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
