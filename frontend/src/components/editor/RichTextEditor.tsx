import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import EditorImage from './EditorImage';
import Footnote from './FootnoteExtension';
import EditorToolbar from './EditorToolbar';
import FileUpload from '../admin/FileUpload';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Icon from '../icons/Icon';

export interface RichTextEditorProps {
  content?: JSONContent | string | null;
  onChange?: (json: JSONContent, html: string) => void;
  editable?: boolean;
  placeholder?: string;
  className?: string;
  editorClassName?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  editable = true,
  className = '',
  editorClassName = '',
}) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Link Modal state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkNewTab, setLinkNewTab] = useState(true);

  // Footnote Modal state
  const [isFootnoteModalOpen, setIsFootnoteModalOpen] = useState(false);
  const [footnoteText, setFootnoteText] = useState('');

  // Helper to parse incoming content prop into JSONContent or HTML string
  const parseInitialContent = (input: any): any => {
    if (!input) return '';
    if (typeof input === 'object') return input;
    if (typeof input === 'string') {
      try {
        return JSON.parse(input);
      } catch {
        return input; // Raw HTML string or plain text
      }
    }
    return '';
  };

  const initialContent = parseInitialContent(content);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      EditorImage,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class:
            'w-full border-collapse border border-border my-6 overflow-hidden rounded-lg shadow-sm',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class:
            'bg-surface border border-border px-4 py-2 text-left font-bold text-gold text-xs uppercase tracking-wider',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border/80 px-4 py-2 text-sm text-text bg-bg/30',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-gold underline hover:text-goldHover transition-colors font-medium',
        },
      }),
      Footnote,
    ],
    content: initialContent,
    editable,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getJSON(), editor.getHTML());
      }
    },
  });

  // Re-sync editor content if content prop changes externally
  useEffect(() => {
    if (editor && content !== undefined && content !== null) {
      const parsed = parseInitialContent(content);
      const currentJson = JSON.stringify(editor.getJSON());
      const incomingJson = typeof parsed === 'object' ? JSON.stringify(parsed) : parsed;

      if (currentJson !== incomingJson) {
        editor.commands.setContent(parsed, false);
      }
    }
  }, [content, editor]);

  // Update editable mode if prop changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  // Image insertion handler
  const handleImageInsert = (url: string) => {
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
      setIsImageModalOpen(false);
    }
  };

  // Link insertion handler
  const handleOpenLinkModal = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setLinkNewTab(true);
    setIsLinkModalOpen(true);
  };

  const handleApplyLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;

    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({
          href: linkUrl.trim(),
          target: linkNewTab ? '_blank' : '_self',
        })
        .run();
    }

    setIsLinkModalOpen(false);
    setLinkUrl('');
  };

  // Footnote insertion handler
  const handleApplyFootnote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor || !footnoteText.trim()) return;

    editor.chain().focus().insertFootnote({ text: footnoteText.trim() }).run();

    setIsFootnoteModalOpen(false);
    setFootnoteText('');
  };

  // Footnotes extraction helper
  const extractFootnotes = (doc: any): { number: number; text: string }[] => {
    const list: { number: number; text: string }[] = [];
    let count = 1;

    const traverse = (node: any) => {
      if (!node) return;
      if (node.type === 'footnote') {
        list.push({
          number: node.attrs?.number || count,
          text: node.attrs?.text || '',
        });
        count++;
      }
      if (Array.isArray(node.content)) {
        node.content.forEach(traverse);
      }
    };

    traverse(doc);
    return list;
  };

  const docJson = editor ? editor.getJSON() : null;
  const footnotesList = docJson ? extractFootnotes(docJson) : [];

  if (!editable) {
    return (
      <div className={`prose prose-invert max-w-none text-text/90 leading-relaxed font-sans ${className}`}>
        <EditorContent editor={editor} className={editorClassName} />

        {/* Read-Only Footnotes List */}
        {footnotesList.length > 0 && (
          <div className="mt-10 pt-6 border-t border-border/80 font-sans space-y-3">
            <h4 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="BookMarked" size={14} />
              Citations & References ({footnotesList.length})
            </h4>
            <ol className="space-y-1.5 text-xs text-textMuted font-sans pl-4 list-decimal">
              {footnotesList.map((fn, idx) => (
                <li key={idx} className="leading-relaxed">
                  <span className="font-bold text-gold font-mono mr-1">[{fn.number}]</span>
                  <span className="text-text">{fn.text}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full rounded-xl border border-border bg-surface overflow-hidden shadow-md font-sans ${className}`}>
      {/* Editor Toolbar */}
      <EditorToolbar
        editor={editor}
        onOpenImageUpload={() => setIsImageModalOpen(true)}
        onOpenLinkModal={handleOpenLinkModal}
        onOpenFootnoteModal={() => setIsFootnoteModalOpen(true)}
      />

      {/* Editor Canvas */}
      <div className="p-4 bg-bg/40 min-h-[350px]">
        <EditorContent
          editor={editor}
          className={`prose prose-invert max-w-none text-text focus:outline-none min-h-[320px] ${editorClassName}`}
        />

        {/* Live Footnotes Preview inside Editor */}
        {footnotesList.length > 0 && (
          <div className="mt-8 pt-4 border-t border-border/60 text-xs font-sans space-y-2 select-none">
            <span className="font-bold text-gold/90 uppercase text-[10px] tracking-wider flex items-center gap-1">
              <Icon name="BookMarked" size={12} />
              Document Citations List ({footnotesList.length})
            </span>
            <div className="space-y-1">
              {footnotesList.map((fn, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-textMuted text-[11px]">
                  <span className="font-bold text-gold font-mono">[{fn.number}]</span>
                  <span className="text-text/80">{fn.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Upload Modal */}
      {isImageModalOpen && (
        <Modal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          title="Insert Image"
          size="md"
        >
          <div className="space-y-4 font-sans">
            <div className="flex items-center space-x-2 text-xs text-textMuted">
              <Icon name="Image" size={16} className="text-gold" />
              <span>Upload an image to insert into the document content.</span>
            </div>

            <FileUpload
              folder="qindil/articles"
              onUploadComplete={handleImageInsert}
              label="Article Image"
            />
          </div>
        </Modal>
      )}

      {/* Link Insertion Modal */}
      {isLinkModalOpen && (
        <Modal
          isOpen={isLinkModalOpen}
          onClose={() => setIsLinkModalOpen(false)}
          title="Insert / Edit Link"
          size="sm"
        >
          <form onSubmit={handleApplyLink} className="space-y-4 font-sans">
            <Input
              label="URL / Hyperlink"
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              required
            />

            <label className="flex items-center space-x-2 text-xs font-semibold text-text cursor-pointer">
              <input
                type="checkbox"
                checked={linkNewTab}
                onChange={(e) => setLinkNewTab(e.target.checked)}
                className="rounded border-border bg-bg text-gold focus:ring-gold"
              />
              <span>Open link in new tab (`target="_blank"`)</span>
            </label>

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsLinkModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Apply Link
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Footnote Insertion Modal */}
      {isFootnoteModalOpen && (
        <Modal
          isOpen={isFootnoteModalOpen}
          onClose={() => setIsFootnoteModalOpen(false)}
          title="Insert Footnote / Citation"
          size="sm"
        >
          <form onSubmit={handleApplyFootnote} className="space-y-4 font-sans">
            <Input
              label="Citation Reference / Footnote Text"
              placeholder="e.g. Sahih Al-Bukhari #1234, Vol. 2"
              value={footnoteText}
              onChange={(e) => setFootnoteText(e.target.value)}
              required
            />

            <p className="text-[11px] text-textMuted leading-relaxed">
              Footnotes will automatically insert a numbered marker (e.g. <sup>[1]</sup>) at the selection and append to the document reference list.
            </p>

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsFootnoteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Insert Footnote
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default RichTextEditor;
