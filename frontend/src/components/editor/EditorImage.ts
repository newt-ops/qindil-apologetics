import Image from '@tiptap/extension-image';

export const EditorImage = Image.configure({
  inline: false,
  allowBase64: false,
  HTMLAttributes: {
    class: 'rounded-xl border border-border/80 shadow-lg my-6 max-h-[500px] w-full object-cover mx-auto',
  },
});

export default EditorImage;
