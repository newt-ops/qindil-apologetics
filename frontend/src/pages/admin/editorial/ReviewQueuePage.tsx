import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import { useReviewQueue, useReviewArticle } from '../../../hooks/useArticles';
import { ArticleItem } from '../../../api/article';
import { RichTextEditor } from '../../../components/editor/RichTextEditor';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { AdminPageHeader } from '../../../components/admin';
import { useConfirm } from '../../../hooks/useConfirm';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
import { Spinner } from '../../../components/ui/Spinner';
import Modal from '../../../components/ui/Modal';
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

export const ReviewQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: queue = [], isLoading, refetch } = useReviewQueue();
  const reviewMutation = useReviewArticle();
  const { confirm, ConfirmModalElement } = useConfirm();

  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);

  // Decision Modal state for "Request Changes"
  const [isRequestChangesOpen, setIsRequestChangesOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  const handleSelectArticle = (article: ArticleItem) => {
    setSelectedArticle(article);
  };

  const handleDecision = async (
    articleId: string,
    decision: 'approve' | 'requestChanges' | 'publish',
    notes?: string
  ) => {
    try {
      await reviewMutation.mutateAsync({
        id: articleId,
        decision,
        reviewNotes: notes,
      });

      if (decision === 'requestChanges') {
        toast.success('Changes requested. Article returned to author draft workspace.');
        setIsRequestChangesOpen(false);
        setReviewNotes('');
      } else if (decision === 'approve') {
        toast.success('Article approved for publication queue.');
      } else if (decision === 'publish') {
        toast.success('Article approved and published live to public catalog.');
      }

      setSelectedArticle(null);
      refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || 'Failed to submit review decision.';
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Selected Article Full-Page Inspection Canvas
  if (selectedArticle) {
    const authorName =
      typeof selectedArticle.author === 'object' && selectedArticle.author
        ? selectedArticle.author.name
        : 'Unknown Author';
    const authorEmail =
      typeof selectedArticle.author === 'object' && selectedArticle.author
        ? selectedArticle.author.email
        : '';
    const topicName =
      typeof selectedArticle.topic === 'object' && selectedArticle.topic
        ? selectedArticle.topic.name
        : 'General';

    const plainText = extractTextFromContent(selectedArticle.content);
    const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    return (
      <div className="space-y-6 font-sans max-w-6xl mx-auto pb-16">
        {/* Navigation & Top Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedArticle(null)}
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-surface text-textMuted hover:text-gold hover:border-gold/50 transition-colors shrink-0"
              title="Return to Review Queue"
            >
              <Icon name="ArrowLeft" size={16} />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <StatusBadge status={selectedArticle.status} />
                <span className="text-xs font-mono text-textMuted">
                  Submitted {new Date(selectedArticle.updatedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-extrabold text-text tracking-tight mt-1 truncate max-w-xl">
                {selectedArticle.title}
              </h1>
            </div>
          </div>

          {/* SuperAdmin Review Decision Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsRequestChangesOpen(true)}
              isLoading={reviewMutation.isPending}
              leftIcon={<Icon name="AlertCircle" size={14} />}
            >
              Request Changes
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDecision(selectedArticle._id, 'approve')}
              isLoading={reviewMutation.isPending}
              leftIcon={<Icon name="Check" size={14} />}
            >
              Approve Only
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={async () => {
                const ok = await confirm({
                  title: 'Publish Article Live',
                  description: `Are you sure you want to approve and publish "${selectedArticle.title}" live? It will be immediately accessible on the public platform.`,
                  confirmText: 'Publish Live',
                  variant: 'primary',
                });
                if (!ok) return;
                handleDecision(selectedArticle._id, 'publish');
              }}
              isLoading={reviewMutation.isPending}
              leftIcon={<Icon name="Globe" size={14} />}
            >
              Approve & Publish Live
            </Button>
          </div>
        </div>

        {/* Reading Metrics Bar */}
        <div className="flex flex-wrap items-center gap-4 bg-surface border border-border px-4 py-2.5 rounded-xl text-xs text-textMuted">
          <span className="flex items-center gap-1.5 font-mono">
            <Icon name="Clock" size={13} className="text-gold" />
            <strong className="text-text">{readingTime} min</strong> estimated read
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

        {/* Article Preview & Metadata Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Title Display */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gold uppercase tracking-wider">
                Article Title
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-text leading-tight">
                {selectedArticle.title}
              </h2>
            </div>

            {/* Excerpt Display */}
            {selectedArticle.excerpt && (
              <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 space-y-1">
                <span className="text-[10px] font-bold text-gold uppercase tracking-wider block">
                  Abstract / Summary
                </span>
                <p className="text-xs sm:text-sm text-text/90 italic leading-relaxed font-serif">
                  "{selectedArticle.excerpt}"
                </p>
              </div>
            )}

            {/* Content Body Preview */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gold uppercase tracking-wider block">
                Scholarly Body Content
              </span>
              <div className="rounded-xl border border-border bg-surface p-6 sm:p-8">
                <RichTextEditor content={selectedArticle.content} editable={false} />
              </div>
            </div>
          </div>

          {/* Right Inspection Metadata Column */}
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-surface p-5 space-y-4 shadow-sm text-xs">
              <h3 className="font-bold text-gold uppercase tracking-wider text-[11px] border-b border-border pb-3 flex items-center gap-2">
                <Icon name="Info" size={14} />
                Submission Provenance
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-textMuted">Author:</span>
                  <div className="text-right">
                    <span className="font-bold text-text block">{authorName}</span>
                    {authorEmail && <span className="text-[10px] text-textMuted font-mono">{authorEmail}</span>}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-textMuted">Discipline:</span>
                  <span className="font-semibold text-gold">{topicName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-textMuted">URL Slug:</span>
                  <span className="font-mono text-text text-[11px]">
                    {selectedArticle.slug ? `/${selectedArticle.slug}` : 'Auto-generated'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-textMuted">Submission Date:</span>
                  <span className="font-mono text-text text-[11px]">
                    {new Date(selectedArticle.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Cover Image Banner Preview */}
              {selectedArticle.coverImageUrl ? (
                <div className="space-y-1.5 pt-3 border-t border-border">
                  <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block">
                    Cover Banner
                  </span>
                  <img
                    src={selectedArticle.coverImageUrl}
                    alt={selectedArticle.title}
                    className="w-full h-36 object-cover rounded-lg border border-border"
                  />
                </div>
              ) : (
                <div className="pt-3 border-t border-border text-[11px] text-amber-500 font-semibold flex items-center gap-1.5">
                  <Icon name="AlertTriangle" size={14} />
                  <span>No cover banner uploaded</span>
                </div>
              )}
            </div>

            {/* Direct Editor Launch Card */}
            <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 text-center space-y-2">
              <p className="text-xs text-textMuted">
                Need to fine-tune typography or make corrections directly?
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => navigate(`/admin/articles/${selectedArticle._id}/edit`)}
                leftIcon={<Icon name="Edit" size={14} />}
              >
                Open Full Editor
              </Button>
            </div>
          </div>
        </div>

        {/* Request Changes Modal */}
        {isRequestChangesOpen && (
          <Modal
            isOpen={isRequestChangesOpen}
            onClose={() => setIsRequestChangesOpen(false)}
            title="Request Revisions on Article"
            size="md"
          >
            <div className="space-y-4 font-sans">
              <p className="text-xs text-textMuted leading-relaxed">
                Provide clear, actionable feedback for <strong className="text-text">{authorName}</strong> detailing the scholarly revisions required prior to live publication.
              </p>

              <Textarea
                label="Editorial Revision Notes *"
                placeholder="e.g., Please verify the translation of the classical Arabic text in section 2 and supply primary source citations for footnote 4."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={4}
                required
              />

              <div className="flex justify-end space-x-2 pt-2 border-t border-border">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsRequestChangesOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() =>
                    handleDecision(selectedArticle._id, 'requestChanges', reviewNotes)
                  }
                  isLoading={reviewMutation.isPending}
                  disabled={!reviewNotes.trim()}
                  leftIcon={<Icon name="Send" size={14} />}
                >
                  Return for Revision
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Sensitive Confirmation Dialog */}
        {ConfirmModalElement}
      </div>
    );
  }

  // Queue Master List View
  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto pb-12">
      {/* Header */}
      <AdminPageHeader
        discipline="Editorial Subsystem"
        title="Peer Review Queue"
        subtitle="SuperAdmin editorial oversight for vetting, approving, requesting revisions, and publishing research papers."
        actions={
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-gold/20 text-gold border border-gold/30">
              {queue.length} Pending
            </span>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Icon name="RefreshCw" size={13} />}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* Peer Review Guidelines Banner */}
      <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 shadow-sm">
        <div className="flex items-center space-x-2 text-xs font-bold text-gold uppercase tracking-wider mb-2">
          <Icon name="Shield" size={15} />
          <span>Editorial Vetting Criteria</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-textMuted mt-3">
          <div className="p-2.5 rounded-lg bg-bg/60 border border-border/60">
            <strong className="text-text block mb-0.5">1. Source Authenticity</strong>
            Direct citations from canonical primary texts with scholarly references.
          </div>
          <div className="p-2.5 rounded-lg bg-bg/60 border border-border/60">
            <strong className="text-text block mb-0.5">2. Scholarly Tone</strong>
            Objective, measured discourse adhering to academic apologetic standards.
          </div>
          <div className="p-2.5 rounded-lg bg-bg/60 border border-border/60">
            <strong className="text-text block mb-0.5">3. Rigorous Citations</strong>
            Formatted footnotes, transliterations, and complete bibliographical data.
          </div>
          <div className="p-2.5 rounded-lg bg-bg/60 border border-border/60">
            <strong className="text-text block mb-0.5">4. Media Polish</strong>
            High-resolution 16:9 banner and concise abstract for digital distribution.
          </div>
        </div>
      </div>

      {/* Empty Queue State */}
      {queue.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
            <Icon name="CheckCircle" size={24} />
          </div>
          <h3 className="text-base font-bold text-text">Review Queue Clear</h3>
          <p className="text-xs text-textMuted max-w-sm mx-auto">
            There are currently no article submissions awaiting review. All submitted drafts have been processed.
          </p>
        </div>
      ) : (
        /* Queue Cards Grid (Prompt 42 compliant) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {queue.map((article) => {
            const authorName =
              typeof article.author === 'object' && article.author
                ? article.author.name
                : 'Author';
            const topicName =
              typeof article.topic === 'object' && article.topic
                ? article.topic.name
                : 'General';

            const plainText = extractTextFromContent(article.content);
            const words = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
            const readTime = Math.max(1, Math.ceil(words / 200));

            return (
              <div
                key={article._id}
                onClick={() => handleSelectArticle(article)}
                className="group cursor-pointer rounded-xl border border-border bg-surface p-5 space-y-3 hover:border-gold/50 transition-all duration-200 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold px-2 py-0.5 rounded bg-gold/10 border border-gold/20">
                      {topicName}
                    </span>
                    <span className="text-[11px] font-mono text-textMuted">
                      {new Date(article.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-text group-hover:text-gold transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h3>

                  {article.excerpt && (
                    <p className="text-xs text-textMuted line-clamp-2 leading-relaxed italic font-serif">
                      "{article.excerpt}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/80 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-[10px]">
                      {authorName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-text">{authorName}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-[11px] font-mono text-textMuted flex items-center gap-1">
                      <Icon name="Clock" size={11} className="text-gold" />
                      <span>{readTime}m</span>
                    </span>
                    <span className="inline-flex items-center space-x-1 text-gold font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
                      <span>Inspect</span>
                      <Icon name="ArrowRight" size={13} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sensitive Confirmation Dialog */}
      {ConfirmModalElement}
    </div>
  );
};

export default ReviewQueuePage;
