import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import { useArticleForEdit } from '../../../hooks/useArticles';
import { RichTextEditor } from '../../../components/editor/RichTextEditor';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { AdminPageSkeleton } from '../../../components/ui/Skeleton';

function extractTextFromContent(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node.replace(/<[^>]*>/g, ' ');
  if (node.text) return node.text;
  if (Array.isArray(node.content)) {
    return node.content.map(extractTextFromContent).join(' ');
  }
  return '';
}

export const SuperAdminArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: article, isLoading, isError, error } = useArticleForEdit(id);

  if (isLoading) {
    return <AdminPageSkeleton variant="detail" />;
  }

  if (isError || !article) {
    const errorMsg =
      (error as any)?.response?.data?.error?.message || 'Article not found or access denied.';
    return (
      <div className="space-y-6 font-sans max-w-2xl mx-auto mt-12 text-center">
        <div className="rounded-2xl border border-danger/30 bg-danger/5 p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger mb-3">
            <Icon name="AlertCircle" size={24} />
          </div>
          <h2 className="text-lg font-bold text-text">Article Inspection Restricted</h2>
          <p className="mt-1 text-xs text-textMuted">{errorMsg}</p>
          <div className="mt-5 flex justify-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => navigate('/admin/articles')}>
              Return to Articles
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/admin/tasks')}>
              Team Tasks
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const author = typeof article.author === 'object' && article.author ? article.author : null;
  const authorName = author ? author.name : 'Unknown Scholar';
  const authorEmail = author ? author.email : '';
  const authorAvatar = (author as any)?.avatarUrl || '';

  const topicObj = typeof article.topic === 'object' && article.topic ? article.topic : null;
  const topicName = topicObj ? topicObj.name : 'Unassigned';

  const linkedTaskId =
    typeof (article as any).linkedTaskId === 'object' && (article as any).linkedTaskId
      ? (article as any).linkedTaskId._id
      : (article as any).linkedTaskId;

  const plainText = extractTextFromContent(article.content);
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto pb-16">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin/articles')}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-surface text-textMuted hover:text-gold hover:border-gold/50 transition-colors shrink-0"
            title="Back to Articles"
          >
            <Icon name="ArrowLeft" size={16} />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={article.status} />
              <Badge variant="gold" size="sm">{topicName}</Badge>

              <div className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border border-border bg-bg/80 text-[11px] font-mono text-textMuted">
                <Icon name="Clock" size={12} className="text-gold" />
                <span>{readingTime} min read</span>
                <span className="text-border">·</span>
                <span>{wordCount.toLocaleString()} words</span>
              </div>
            </div>

            <h1 className="text-lg sm:text-2xl font-extrabold text-text tracking-tight mt-1">
              {article.title || 'Untitled Scholarly Draft'}
            </h1>
          </div>
        </div>

        {/* Manager Actions */}
        <div className="flex items-center space-x-2">
          {linkedTaskId && (
            <Link to={`/admin/tasks/${linkedTaskId}`}>
              <Button variant="secondary" size="sm" leftIcon={<Icon name="CheckSquare" size={14} />}>
                Assigned Task
              </Button>
            </Link>
          )}

          {article.status === 'inReview' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/admin/articles/${article._id}/review`)}
              leftIcon={<Icon name="Eye" size={14} />}
              className="bg-gold hover:bg-goldHover text-bg font-bold shadow-md"
            >
              Review in Moderation Queue
            </Button>
          )}

          {article.status === 'published' && article.slug && (
            <a
              href={`/articles/${article.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              title="View live published article"
            >
              <Button variant="secondary" size="sm" rightIcon={<Icon name="ExternalLink" size={13} />}>
                View Live Article
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Cover Image & Scholarly Body */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Image Banner (Strictly Read-Only for Super Admin) */}
          <div className="rounded-2xl border border-border bg-surface p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                <Icon name="Image" size={14} />
                Cover Banner
              </span>
              <span className="text-[11px] text-textMuted font-mono">
                {article.coverImageUrl ? 'Uploaded by Scholar' : 'Not Uploaded'}
              </span>
            </div>

            {article.coverImageUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-gold/30 bg-bg aspect-video max-h-[360px] flex items-center justify-center">
                <img
                  src={article.coverImageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-bg/50 p-8 text-center">
                <Icon name="Image" size={28} className="mx-auto text-textMuted/40 mb-2" />
                <p className="text-xs font-medium text-textMuted">
                  The scholar has not uploaded a cover image banner for this article draft yet.
                </p>
                <p className="text-[11px] text-textMuted/70 mt-1">
                  Banner uploading and modification is managed by the assigned author.
                </p>
              </div>
            )}
          </div>

          {/* Abstract / Summary Card */}
          {article.excerpt && (
            <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5 space-y-2 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                <Icon name="FileText" size={14} />
                Summary / Abstract
              </span>
              <p className="text-xs sm:text-sm text-text leading-relaxed font-serif italic pl-2 border-l-2 border-gold">
                &quot;{article.excerpt}&quot;
              </p>
            </div>
          )}

          {/* Scholarly Body Inspection (Read-Only) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gold">
                Scholarly Body Content
              </label>
              <span className="text-[11px] text-textMuted font-mono">Read-Only Preview</span>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <RichTextEditor
                content={article.content}
                onChange={() => {}}
                editable={false}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Author Information & Management Details */}
        <div className="space-y-6">
          {/* Assigned Scholar Author Card */}
          <div className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Icon name="Users" size={14} />
              Assigned Author
            </h3>

            <div className="flex items-center space-x-3">
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="h-12 w-12 rounded-full object-cover border border-gold/40"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold font-bold text-sm border border-gold/30">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="truncate">
                <p className="text-sm font-bold text-text truncate">{authorName}</p>
                {authorEmail && (
                  <p className="text-xs text-textMuted truncate font-mono">{authorEmail}</p>
                )}
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-surface border border-border text-textMuted font-mono">
                  Content Scholar
                </span>
              </div>
            </div>
          </div>

          {/* Review History / Notes if any */}
          {article.reviewNotes && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-2 shadow-sm">
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2 border-b border-amber-500/20 pb-2">
                <Icon name="AlertCircle" size={14} />
                Latest Review Notes
              </h3>
              <p className="text-xs text-text leading-relaxed whitespace-pre-wrap font-serif italic">
                &quot;{article.reviewNotes}&quot;
              </p>
            </div>
          )}

          {/* Article Provenance & Publishing Metadata */}
          <div className="rounded-2xl border border-border bg-surface p-5 space-y-3.5 text-xs text-textMuted shadow-sm">
            <h4 className="font-bold text-text uppercase tracking-wider text-[11px] border-b border-border pb-2">
              Article Provenance
            </h4>

            <div className="flex justify-between">
              <span>Status:</span>
              <StatusBadge status={article.status} size="sm" />
            </div>

            <div className="flex justify-between">
              <span>Topic:</span>
              <span className="font-semibold text-text">{topicName}</span>
            </div>

            <div className="flex justify-between">
              <span>Custom Slug:</span>
              <span className="font-mono text-text truncate max-w-[160px] text-right">
                {article.slug || '—'}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Estimated Reading:</span>
              <span className="font-mono text-text">{readingTime} min</span>
            </div>

            <div className="flex justify-between">
              <span>Word Count:</span>
              <span className="font-mono text-text">{wordCount.toLocaleString()} words</span>
            </div>

            <div className="flex justify-between">
              <span>Created Date:</span>
              <span className="font-mono text-text">
                {new Date(article.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Last Modified:</span>
              <span className="font-mono text-text">
                {new Date(article.updatedAt).toLocaleString()}
              </span>
            </div>

            {(article as any).publishedAt && (
              <div className="flex justify-between">
                <span>Published Date:</span>
                <span className="font-mono text-text">
                  {new Date((article as any).publishedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminArticleDetailPage;
