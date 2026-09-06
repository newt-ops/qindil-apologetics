import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useArticleForEdit,
  useRequestChanges,
  useApproveArticle,
  usePublishArticle,
  useArchiveArticle,
} from '../../../hooks/useArticles';
import RichTextEditor from '../../../components/editor/RichTextEditor';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Textarea from '../../../components/ui/Textarea';
import Spinner from '../../../components/ui/Spinner';
import Icon from '../../../components/icons/Icon';
import { toast } from '../../../hooks/useToast';

function extractTextFromContent(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node.replace(/<[^>]*>/g, ' ');
  if (node.text) return node.text;
  if (Array.isArray(node.content)) {
    return node.content.map(extractTextFromContent).join(' ');
  }
  return '';
}

export const ArticleReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: article, isLoading, error } = useArticleForEdit(id);
  const requestChangesMutation = useRequestChanges();
  const approveMutation = useApproveArticle();
  const publishMutation = usePublishArticle();
  const archiveMutation = useArchiveArticle();

  // Request Changes Modal State
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [notesError, setNotesError] = useState('');

  // Archive Confirm Modal State
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/10 p-8 text-center text-danger font-sans space-y-4 max-w-lg mx-auto mt-12">
        <Icon name="AlertTriangle" size={32} className="mx-auto" />
        <h3 className="text-lg font-bold">Article Not Found</h3>
        <p className="text-xs text-textMuted">
          The requested scholarly paper could not be retrieved or you do not possess administrative permissions to review it.
        </p>
        <Link to="/admin/review-queue">
          <Button variant="secondary" size="sm" leftIcon={<Icon name="ArrowLeft" size={14} />}>
            Return to Review Queue
          </Button>
        </Link>
      </div>
    );
  }

  const topicName =
    typeof article.topic === 'object' && article.topic ? article.topic.name : 'Uncategorized';
  const authorObj = typeof article.author === 'object' ? article.author : null;

  const plainText = extractTextFromContent(article.content);
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleRequestChangesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewNotes.trim() || reviewNotes.trim().length < 5) {
      setNotesError('Please provide clear review notes (at least 5 characters).');
      return;
    }

    setNotesError('');
    try {
      await requestChangesMutation.mutateAsync({
        id: article._id,
        reviewNotes: reviewNotes.trim(),
      });
      setIsNotesModalOpen(false);
      toast.success('Changes requested. The author has been notified.');
      navigate('/admin/review-queue');
    } catch (err: any) {
      setNotesError(err?.response?.data?.message || 'Failed to submit change request.');
    }
  };

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(article._id);
      toast.success('Article approved successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to approve article.');
    }
  };

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(article._id);
      toast.success('Article published! It is now live in the public catalog.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to publish article.');
    }
  };

  const handleArchiveConfirm = async () => {
    try {
      await archiveMutation.mutateAsync(article._id);
      setIsArchiveModalOpen(false);
      toast.success('Article archived. It has been removed from the public catalog.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to archive article.');
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto pb-16">
      {/* Top Action & Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/review-queue')}
            leftIcon={<Icon name="ArrowLeft" size={15} />}
          >
            Review Queue
          </Button>
          <span className="text-border">|</span>
          <StatusBadge status={article.status} />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/admin/articles/${article._id}/edit`}>
            <Button variant="secondary" size="sm" leftIcon={<Icon name="Edit" size={13} />}>
              Open in Editor
            </Button>
          </Link>

          {article.status === 'inReview' && (
            <>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Icon name="MessageSquare" size={14} />}
                onClick={() => setIsNotesModalOpen(true)}
                isLoading={requestChangesMutation.isPending}
              >
                Request Changes
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Icon name="Check" size={14} />}
                onClick={handleApprove}
                isLoading={approveMutation.isPending}
              >
                Approve Article
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Icon name="Globe" size={14} />}
                onClick={handlePublish}
                isLoading={publishMutation.isPending}
              >
                Approve & Publish Live
              </Button>
            </>
          )}

          {article.status === 'approved' && (
            <>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Icon name="MessageSquare" size={14} />}
                onClick={() => setIsNotesModalOpen(true)}
                isLoading={requestChangesMutation.isPending}
              >
                Request Changes
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Icon name="Globe" size={14} />}
                onClick={handlePublish}
                isLoading={publishMutation.isPending}
              >
                Publish Live
              </Button>
            </>
          )}

          {article.status === 'published' && (
            <>
              {article.slug && (
                <a
                  href={`/articles/${article.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary" size="sm" leftIcon={<Icon name="ExternalLink" size={14} />}>
                    View Live
                  </Button>
                </a>
              )}
              <Button
                variant="secondary"
                size="sm"
                className="text-amber-500 hover:text-amber-400"
                leftIcon={<Icon name="Archive" size={14} />}
                onClick={() => setIsArchiveModalOpen(true)}
                isLoading={archiveMutation.isPending}
              >
                Archive
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Reading Metrics Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-surface border border-border px-4 py-2.5 rounded-xl text-xs text-textMuted">
        <span className="flex items-center gap-1.5 font-mono">
          <Icon name="Clock" size={13} className="text-gold" />
          <strong className="text-text">{readingTime} min</strong> read
        </span>
        <span className="text-border">|</span>
        <span className="flex items-center gap-1.5 font-mono">
          <Icon name="FileText" size={13} className="text-gold" />
          <strong className="text-text">{wordCount.toLocaleString()}</strong> words
        </span>
        <span className="text-border">|</span>
        <span className="flex items-center gap-1.5">
          <Icon name="Tag" size={13} className="text-gold" />
          <span>Discipline: <strong className="text-gold">{topicName}</strong></span>
        </span>
      </div>

      {/* Status Alerts */}
      {article.status === 'changesRequested' && article.reviewNotes && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-1.5 text-xs">
          <div className="flex items-center space-x-2 text-amber-500 font-bold">
            <Icon name="AlertTriangle" size={16} />
            <span>Changes Requested by Editorial Reviewer</span>
          </div>
          <p className="text-text/90 italic pl-6 font-serif">"{article.reviewNotes}"</p>
        </div>
      )}

      {article.status === 'published' && article.publishedAt && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-medium text-emerald-500 flex items-center space-x-2">
          <Icon name="Globe" size={16} />
          <span>
            Published and accessible on public catalog since{' '}
            <strong className="font-mono">
              {new Date(article.publishedAt).toLocaleString()}
            </strong>
          </span>
        </div>
      )}

      {/* Article Review Header Metadata */}
      <div className="rounded-xl border border-border bg-surface p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2">
          <Badge variant="gold">{topicName}</Badge>
          <span className="text-xs text-textMuted font-mono">
            Slug: /{article.slug || 'untitled'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-text tracking-tight leading-tight">
          {article.title}
        </h1>

        {/* Author & Timestamp Bar */}
        <div className="flex flex-wrap items-center justify-between border-t border-border/60 pt-4 gap-4 text-xs">
          <div className="flex items-center space-x-3">
            {authorObj?.avatarUrl ? (
              <img
                src={authorObj.avatarUrl}
                alt={authorObj.name}
                className="h-9 w-9 rounded-full border border-gold/40 object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-gold font-bold text-sm">
                {authorObj?.name ? authorObj.name[0].toUpperCase() : 'A'}
              </div>
            )}
            <div>
              <div className="font-bold text-text">{authorObj?.name || 'Author'}</div>
              <div className="text-[11px] text-textMuted font-mono">{authorObj?.email}</div>
            </div>
          </div>

          <div className="text-right text-textMuted font-mono space-y-0.5 text-[11px]">
            <div>
              Created:{' '}
              <span className="text-text font-semibold">
                {new Date(article.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div>
              Last Modified:{' '}
              <span className="text-text font-semibold">
                {new Date(article.updatedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Excerpt */}
        {article.excerpt && (
          <div className="rounded-lg border-l-4 border-gold bg-bg/60 p-4 font-serif text-sm italic text-textMuted leading-relaxed">
            "{article.excerpt}"
          </div>
        )}
      </div>

      {/* Cover Image Preview */}
      {article.coverImageUrl && (
        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="w-full h-64 sm:h-80 object-cover"
          />
        </div>
      )}

      {/* Main Body Content Read-Only Preview */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="border-b border-border pb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center space-x-2">
            <Icon name="FileText" size={15} />
            <span>Article Body Content</span>
          </h3>
          <span className="text-[10px] text-textMuted font-mono uppercase">Read-Only Preview</span>
        </div>

        <RichTextEditor content={article.content} editable={false} />
      </div>

      {/* Request Changes Modal */}
      {isNotesModalOpen && (
        <Modal
          isOpen={isNotesModalOpen}
          onClose={() => setIsNotesModalOpen(false)}
          title="Request Revisions on Article"
          size="md"
        >
          <form onSubmit={handleRequestChangesSubmit} className="space-y-4 font-sans">
            <p className="text-xs text-textMuted leading-relaxed">
              Provide constructive reviewer feedback detailing the scholarly corrections or textual adjustments the author needs to complete.
            </p>

            <Textarea
              label="Reviewer Revision Notes *"
              placeholder="e.g., Please fix footnote citations in section 2 and supply primary sources for the historical quotes."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={4}
              required
              error={notesError}
            />

            <div className="flex justify-end space-x-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsNotesModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                isLoading={requestChangesMutation.isPending}
                leftIcon={<Icon name="Send" size={14} />}
              >
                Return to Author
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm Archive Modal */}
      {isArchiveModalOpen && (
        <Modal
          isOpen={isArchiveModalOpen}
          onClose={() => setIsArchiveModalOpen(false)}
          title="Confirm Article Archival"
          size="sm"
        >
          <div className="space-y-4 font-sans">
            <div className="flex items-start space-x-3 text-amber-500 bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/30 text-xs">
              <Icon name="Archive" size={18} className="shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Archive Confirmation</span>
                <span className="text-text/80">
                  This will unpublish "
                  <strong className="text-text font-bold">{article.title}</strong>" and remove it from the public catalog. It will remain preserved in the admin archives.
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsArchiveModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={archiveMutation.isPending}
                onClick={handleArchiveConfirm}
                leftIcon={<Icon name="Archive" size={14} />}
              >
                Archive Article
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ArticleReviewPage;
