import React from 'react';
import { RichTextEditor } from '../editor/RichTextEditor';

interface ContentRendererProps {
  content: any;
  className?: string;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  return <RichTextEditor content={content} editable={false} className={className} />;
};

export default ContentRenderer;
