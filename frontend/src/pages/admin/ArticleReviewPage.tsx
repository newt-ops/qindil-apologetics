import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useArticleForEdit,
  useRequestChanges,
  useApproveArticle,
  usePublishArticle,
  useArchiveArticle,
} from '../../hooks/useArticles';
import RichTextEditor from '../../components/editor/RichTextEditor';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Textarea from '../../components/ui/Textarea';
import Spinner from '../../components/ui/Spinner';
import Icon from '../../components/icons/Icon';

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
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger/10 p-6 text-center text-danger font-sans space-y-4">
        <Icon name="AlertTriangle" size={32} className="mx-auto" />
        <h3 className="text-lg font-bold">Article Not Found</h3>
        <p className="text-xs text-textMuted">
          The requested article could not be retrieved or you do not have permission to view it.
        </p>
        <Link to="/admin/review-queue">
          <Button variant="secondary" size="sm" leftIcon={<Icon name="ArrowLeft" size={14} />}>
            Back to Review Queue
          </Button>
        </Link>
      </div>
    );
  }

  const topicName = typeof article.topic === 'object' && article.topic ? article.topic.name : 'Uncategorized';
  const authorObj = typeof article.author === 'object' ? article.author : null;

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
      setActionSuccess('Changes requested successfully! The author has been notified.');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setNotesError(err?.response?.data?.message || 'Failed to submit change request.');
    }
  };

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(article._id);
      setActionSuccess('Article approved successfully!');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to approve article.');
    }
  };

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(article._id);
      setActionSuccess('Article published! It is now live on the public site.');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to publish article.');
    }
  };

  const handleArchive = async () => {
    if (!window.confirm('Are you sure you want to archive this article? It will be removed from the public site.')) {
      return;
    }
    try {
      await archiveMutation.mutateAsync(article._id);
      setActionSuccess('Article archived.');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to archive article.');
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto pb-12">
      {/* Top Action & Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/review-queue')}
            leftIcon={<Icon name="ArrowLeft" size={16} />}
          >
            Review Queue
          </Button>
          <span className="text-textMuted/40">|</span>
          <StatusBadge status={article.status} />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
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
                variant="primary"
                size="sm"
                leftIcon={<Icon name="CheckCircle" size={14} />}
                onClick={handleApprove}
                isLoading={approveMutation.isPending}
              >
                Approve Article
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
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
              <a
                href={`/articles/${article.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" size="sm" leftIcon={<Icon name="ExternalLink" size={14} />}>
                  View Live Article
                </Button>
              </a>
              <Button
                variant="secondary"
                size="sm"
                className="text-amber-400 hover:text-amber-300"
                leftIcon={<Icon name="Archive" size={14} />}
                onClick={handleArchive}
                isLoading={archiveMutation.isPending}
              >
                Archive
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div className="rounded-lg border border-success/40 bg-success/10 p-4 text-xs font-semibold text-success flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={16} />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="hover:text-white">
            <Icon name="X" size={14} />
          </button>
        </div>
      )}

      {/* Status Alert Banner */}
      {article.status === 'changesRequested' && article.reviewNotes && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 space-y-1 text-xs">
          <div className="flex items-center space-x-2 text-amber-400 font-bold">
            <Icon name="AlertTriangle" size={16} />
            <span>Changes Requested by SuperAdmin Reviewer</span>
          </div>
          <p className="text-text/90 italic pl-6">"{article.reviewNotes}"</p>
        </div>
      )}

      {article.status === 'published' && article.publishedAt && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-400 flex items-center space-x-2">
          <Icon name="Globe" size={16} />
          <span>
            Published and live on public site since{' '}
            <strong className="font-mono">
              {new Date(article.publishedAt).toLocaleString()}
            </strong>
          </span>
        </div>
      )}

      {/* Article Review Header Metadata */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Badge variant="gold">{topicName}</Badge>
          <span className="text-xs text-textMuted font-mono">
            ID: {article._id}
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
              Submitted:{' '}
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
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="w-full h-64 sm:h-80 object-cover"
          />
        </div>
      )}

      {/* Main Body Content Read-Only Preview */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 space-y-4">
        <div className="border-b border-border pb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center space-x-2">
            <Icon name="FileText" size={16} />
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
          title="Request Changes on Article"
          size="md"
        >
          <form onSubmit={handleRequestChangesSubmit} className="space-y-4 font-sans">
            <p className="text-xs text-textMuted leading-relaxed">
              Provide constructive reviewer notes explaining what modifications or corrections the author needs to make before approval.
            </p>

            <Textarea
              label="Reviewer Explanation / Notes (Required)"
              placeholder="e.g., Please fix the citation in section 2 and revise the introduction paragraph to align with topic guidelines."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={4}
              required
              error={notesError}
            />

            <div className="flex justify-end space-x-3 pt-2">
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
                Send Request to Author
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ArticleReviewPage;
