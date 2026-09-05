import React from 'react';
import { Editor } from '@tiptap/react';
import Icon, { IconName } from '../icons/Icon';

export interface EditorToolbarProps {
  editor: Editor | null;
  onOpenImageUpload?: () => void;
  onOpenLinkModal?: () => void;
  onOpenFootnoteModal?: () => void;
  className?: string;
}

interface ToolbarButton {
  label: string;
  icon: IconName;
  action: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  onOpenImageUpload,
  onOpenLinkModal,
  onOpenFootnoteModal,
  className = '',
}) => {
  if (!editor) return null;

  const isTableActive = editor.isActive('table');
  const isLinkActive = editor.isActive('link');

  const mainButtons: (ToolbarButton | 'divider')[] = [
    {
      label: 'Bold',
      icon: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
    },
    {
      label: 'Italic',
      icon: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
    },
    {
      label: 'Strikethrough',
      icon: 'Strikethrough',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
    },
    'divider',
    {
      label: 'Heading 2',
      icon: 'Heading2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
    },
    {
      label: 'Heading 3',
      icon: 'Heading3',
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 }),
    },
    'divider',
    {
      label: 'Bullet List',
      icon: 'List',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
    },
    {
      label: 'Numbered List',
      icon: 'ListOrdered',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
    },
    {
      label: 'Quote',
      icon: 'Quote',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
    },
    {
      label: 'Code Block',
      icon: 'Code',
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive('codeBlock'),
    },
    'divider',
    ...(onOpenLinkModal
      ? [
          {
            label: isLinkActive ? 'Edit Link' : 'Add Link',
            icon: 'Link' as IconName,
            action: onOpenLinkModal,
            isActive: isLinkActive,
          },
          ...(isLinkActive
            ? [
                {
                  label: 'Remove Link',
                  icon: 'Unlink' as IconName,
                  action: () => editor.chain().focus().unsetLink().run(),
                },
              ]
            : []),
          'divider' as const,
        ]
      : []),
    {
      label: 'Insert 3x3 Table',
      icon: 'Table',
      action: () =>
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
      isActive: isTableActive,
    },
    ...(onOpenFootnoteModal
      ? [
          {
            label: 'Insert Footnote Citation',
            icon: 'BookMarked' as IconName,
            action: onOpenFootnoteModal,
            isActive: false,
          },
        ]
      : []),
    'divider',
    ...(onOpenImageUpload
      ? [
          {
            label: 'Insert Image',
            icon: 'Image' as IconName,
            action: onOpenImageUpload,
            isActive: false,
          },
          'divider' as const,
        ]
      : []),
    {
      label: 'Undo',
      icon: 'Undo',
      action: () => editor.chain().focus().undo().run(),
      disabled: !editor.can().undo(),
    },
    {
      label: 'Redo',
      icon: 'Redo',
      action: () => editor.chain().focus().redo().run(),
      disabled: !editor.can().redo(),
    },
  ];

  return (
    <div className={`space-y-1.5 bg-surface/95 border border-border p-2 rounded-t-xl sticky top-0 z-10 backdrop-blur-md select-none ${className}`}>
      {/* Primary Formatting Bar */}
      <div className="flex flex-wrap items-center gap-1">
        {mainButtons.map((btn, index) => {
          if (btn === 'divider') {
            return <div key={`divider-${index}`} className="h-5 w-px bg-border/80 mx-1 shrink-0" />;
          }

          return (
            <button
              key={btn.label}
              type="button"
              onClick={btn.action}
              disabled={btn.disabled}
              title={btn.label}
              className={`inline-flex items-center justify-center h-8 w-8 rounded-lg text-xs font-semibold transition-colors duration-150 ${
                btn.isActive
                  ? 'bg-gold/20 text-gold border border-gold/40 shadow-sm'
                  : btn.disabled
                  ? 'text-textMuted/40 cursor-not-allowed'
                  : 'text-textMuted hover:bg-bg hover:text-text'
              }`}
            >
              <Icon name={btn.icon} size={15} />
            </button>
          );
        })}
      </div>

      {/* Table Context Controls (Visible when cursor is inside a table) */}
      {isTableActive && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-border/60 text-[11px]">
          <span className="font-bold text-gold px-1 flex items-center gap-1">
            <Icon name="Table" size={12} />
            Table Controls:
          </span>

          <button
            type="button"
            onClick={() => editor.chain().focus().addRowBefore().run()}
            className="px-2 py-1 rounded bg-bg text-textMuted hover:text-text border border-border hover:border-gold/40 transition-colors"
          >
            + Row Above
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="px-2 py-1 rounded bg-bg text-textMuted hover:text-text border border-border hover:border-gold/40 transition-colors"
          >
            + Row Below
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="px-2 py-1 rounded bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 transition-colors"
          >
            - Delete Row
          </button>

          <div className="h-4 w-px bg-border mx-0.5" />

          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            className="px-2 py-1 rounded bg-bg text-textMuted hover:text-text border border-border hover:border-gold/40 transition-colors"
          >
            + Col Left
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="px-2 py-1 rounded bg-bg text-textMuted hover:text-text border border-border hover:border-gold/40 transition-colors"
          >
            + Col Right
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="px-2 py-1 rounded bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 transition-colors"
          >
            - Delete Col
          </button>

          <div className="h-4 w-px bg-border mx-0.5" />

          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="px-2 py-1 rounded bg-danger text-bg font-bold hover:bg-danger/80 transition-colors"
          >
            Delete Table
          </button>
        </div>
      )}
    </div>
  );
};

export default EditorToolbar;
