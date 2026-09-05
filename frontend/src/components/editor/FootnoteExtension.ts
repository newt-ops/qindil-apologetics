import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface FootnoteOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    footnote: {
      insertFootnote: (options: { text: string }) => ReturnType;
    };
  }
}

export const Footnote = Node.create<FootnoteOptions>({
  name: 'footnote',

  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      number: {
        default: 1,
      },
      text: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'sup[data-footnote-text]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'sup',
      mergeAttributes(
        {
          class:
            'footnote-ref inline-flex items-center justify-center font-mono font-bold text-gold cursor-pointer px-1 py-0.5 rounded bg-gold/15 hover:bg-gold/30 text-xs mx-0.5 border border-gold/30 select-none',
          'data-footnote-text': node.attrs.text,
          'data-footnote-number': node.attrs.number,
          title: node.attrs.text,
        },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
      `[${node.attrs.number}]`,
    ];
  },

  addCommands() {
    return {
      insertFootnote:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addProseMirrorPlugins() {
    const extension = this;
    return [
      new Plugin({
        key: new PluginKey('footnoteRenumber'),
        appendTransaction(transactions, _oldState, newState) {
          if (!transactions.some((tr) => tr.docChanged)) return null;

          let tr = newState.tr;
          let index = 1;
          let modified = false;

          newState.doc.descendants((node, pos) => {
            if (node.type.name === extension.name) {
              if (node.attrs.number !== index) {
                tr = tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  number: index,
                });
                modified = true;
              }
              index++;
            }
          });

          return modified ? tr : null;
        },
      }),
    ];
  },
});

export default Footnote;
