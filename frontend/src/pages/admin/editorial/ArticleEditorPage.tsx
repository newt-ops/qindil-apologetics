import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import {
  useArticleForEdit,
  useUpdateArticleDraft,
  useSubmitForReview,
  usePublishArticle,
  useDeleteArticle,
} from '../../../hooks/useArticles';
import { useConfirm } from '../../../hooks/useConfirm';
import { useAdminTopics } from '../../../hooks/useTopics';
import { useActiveTopics } from '../../../hooks/usePublicData';
import { RichTextEditor } from '../../../components/editor/RichTextEditor';
import FileUpload from '../../../components/admin/FileUpload';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { AdminPageSkeleton } from '../../../components/ui/Skeleton';
import { toast } from '../../../hooks/useToast';
import { useAuthStore } from '../../../stores/authStore';

function extractTextFromContent(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node.replace(/<[^>]*>/g, ' ');
  if (node.text) return node.text;
  if (Array.isArray(node.content)) {
    return node.content.map(extractTextFromContent).join(' ');
  }
  return '';
}

export const ArticleEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const { data: article, isLoading: isLoadingArticle, isError, error } = useArticleForEdit(id);
  const { data: adminTopics = [] } = useAdminTopics();
  const { data: publicTopics = [] } = useActiveTopics();
  const rawTopics = adminTopics.length > 0 ? adminTopics : publicTopics;

  const updateDraftMutation = useUpdateArticleDraft();
  const submitReviewMutation = useSubmitForReview();
  const publishMutation = usePublishArticle();
  const deleteMutation = useDeleteArticle();
  const { confirm, ConfirmModalElement } = useConfirm();

  // Form Fields
  const [title, setTitle] = useState('');
  const [topicId, setTopicId] = useState('');
  const [content, setContent] = useState<any>('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const isSuperAdmin = user?.roles?.some((r: any) =>
    typeof r === 'string' ? r === 'superAdmin' : r.name === 'superAdmin'
  );

  // Sync state when article data is loaded
  useEffect(() => {
    if (article) {
      const linkedTask = (article as any).linkedTaskId;
      const linkedTaskStatus =
        (article as any).linkedTaskStatus ||
        (typeof linkedTask === 'object' ? linkedTask?.status : undefined);

      if (linkedTaskStatus === 'pending' && !isSuperAdmin) {
        const taskId = typeof linkedTask === 'object' ? linkedTask._id : linkedTask;
        toast.info('Please accept and start your assigned task before accessing the writing workspace.');
        if (taskId) {
          navigate(`/admin/tasks/${taskId}`);
          return;
        }
      }

      setTitle(article.title || '');
      const tId =
        typeof article.topic === 'object' && article.topic
          ? (article.topic as any)._id?.toString() || (article.topic as any).id?.toString() || ''
          : article.topic ? String(article.topic) : '';
      setTopicId(tId);
      setContent(article.content || '');
      setExcerpt(article.excerpt || '');
      setCoverImageUrl(article.coverImageUrl || '');
      setSlug(article.slug || '');
      setLastSavedAt(new Date(article.updatedAt));
    }
  }, [article, navigate, isSuperAdmin]);

  const isAuthor = article
    ? typeof article.author === 'object'
      ? article.author._id === user?._id
      : article.author === user?._id
    : false;

  // SuperAdmin can edit at any time; Authors can edit unless actively under review ('inReview')
  const isEditable = Boolean(
    (isAuthor || isSuperAdmin) &&
    (isSuperAdmin || article?.status !== 'inReview')
  );

  // Live Metrics Calculation
  const plainText = extractTextFromContent(content);
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Metadata Validation Checks
  const isTitleValid = Boolean(title && title.trim().length > 0);
  const isTopicValid = Boolean(topicId && topicId.trim().length > 0);
  const isExcerptValid = Boolean(excerpt && excerpt.trim().length > 0);
  const isCoverImageValid = Boolean(coverImageUrl && coverImageUrl.trim().length > 0);
  const isContentValid = Boolean(
    content &&
      (typeof content === 'string'
        ? content.trim().length > 0
        : typeof content === 'object' && content.content && content.content.length > 0)
  );

  const isMetadataComplete =
    isTitleValid && isTopicValid && isExcerptValid && isCoverImageValid && isContentValid;

  // Simple state setters (NO background autosave!)
  const handleTitleChange = (val: string) => setTitle(val);
  const handleTopicChange = (val: string) => setTopicId(val);
  const handleContentChange = (json: any) => setContent(json);
  const handleExcerptChange = (val: string) => setExcerpt(val);
  const handleCoverImageChange = (url: string) => {
    setCoverImageUrl(url);
    if (url) {
      toast.info('Cover banner uploaded. Click "Save Draft" to keep your updates.');
    } else {
      toast.info('Cover banner removed. Click "Save Draft" to keep your updates.');
    }
  };
  const handleSlugChange = (val: string) => setSlug(val);

  const handleGoBack = () => {
    navigate('/admin/articles');
  };

  // Explicit Manual Save Draft
  const handleManualSave = async () => {
    if (!id || !isEditable) return;

    try {
      const res = await updateDraftMutation.mutateAsync({
        id,
        data: {
          title,
          topic: topicId || undefined,
          content,
          excerpt,
          coverImageUrl,
          slug: slug || undefined,
        },
      });
      const savedTime = res.data?.updatedAt ? new Date(res.data.updatedAt) : new Date();
      setLastSavedAt(savedTime);
      toast.success('Draft saved successfully.');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || 'Failed to save draft.';
      toast.error(msg);
    }
  };

  // Submit for Peer Review
  const handleSubmitForReview = async () => {
    if (!id || !isEditable) return;

    if (!isMetadataComplete) {
      toast.error('All metadata (Title, Topic, Summary, Cover Image, Content) must be completed before submitting.');
      return;
    }

    try {
      await submitReviewMutation.mutateAsync({
        id,
        data: {
          title,
          topic: topicId,
          content,
          excerpt,
          coverImageUrl,
          slug: slug || undefined,
        },
      });
      toast.success('Article submitted for SuperAdmin review!');
      navigate('/admin/workspace');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || 'Failed to submit article for review.';
      toast.error(msg);
    }
  };

  const handlePublishNow = async () => {
    if (!id) return;
    try {
      await publishMutation.mutateAsync(id);
      toast.success('🎉 Article successfully published live!');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || 'Failed to publish article.';
      toast.error(msg);
    }
  };

  const handleDeleteArticle = async () => {
    if (!id) return;
    const ok = await confirm({
      title: 'Delete Article Permanently',
      description: `Are you sure you want to permanently delete "${title || article?.title || 'this article'}"? This action cannot be undone.`,
      confirmText: 'Delete Article',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Article deleted successfully.');
      navigate('/admin/articles');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || 'Failed to delete article.';
      toast.error(msg);
    }
  };

  if (isLoadingArticle) {
    return <AdminPageSkeleton variant="form" />;
  }

  if (isError || !article) {
    const errorMsg =
      (error as any)?.response?.data?.error?.message || 'Article not found or access denied.';
    return (
      <div className="space-y-6 font-sans">
        <button
          onClick={() => navigate('/admin/articles')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-textMuted hover:text-gold transition-colors"
        >
          <Icon name="ArrowLeft" size={14} />
          <span>Back to Articles</span>
        </button>

        <div className="rounded-xl border border-danger/30 bg-danger/5 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger mb-3">
            <Icon name="AlertCircle" size={24} />
          </div>
          <h2 className="text-lg font-bold text-text">Access Restricted</h2>
          <p className="mt-1 text-xs text-textMuted max-w-md mx-auto">{errorMsg}</p>
          <div className="mt-4">
            <Link to="/admin/articles">
              <Button variant="secondary" size="sm">
                Return to My Articles
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const existingTopic = typeof article?.topic === 'object' && article?.topic ? article.topic : null;
  const existingTopicId = existingTopic
    ? ((existingTopic as any)._id?.toString() || (existingTopic as any).id?.toString())
    : null;
  const hasExisting =
    existingTopic &&
    !rawTopics.some(
      (t: any) => ((t as any)._id?.toString() || (t as any).id?.toString()) === existingTopicId
    );
  const combinedTopics = hasExisting ? [existingTopic, ...rawTopics] : rawTopics;

  const topicOptions = [
    { value: '', label: 'Select a Topic...' },
    ...combinedTopics
      .filter((t: any) => t.isActive !== false)
      .map((t: any) => ({
        value: (t as any)._id?.toString() || (t as any).id?.toString() || '',
        label: t.name,
      })),
  ];

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto pb-16">
      {/* Navigation & Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-surface text-textMuted hover:text-gold hover:border-gold/50 transition-colors shrink-0"
            title="Back to Articles"
          >
            <Icon name="ArrowLeft" size={16} />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={article.status} />

              {/* Live Reading Metrics Pill */}
              <div className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border border-border bg-bg/80 text-[11px] font-mono text-textMuted">
                <Icon name="Clock" size={12} className="text-gold" />
                <span>{readingTime} min read</span>
                <span className="text-border">·</span>
                <span>{wordCount.toLocaleString()} words</span>
              </div>
            </div>

            <h1 className="text-lg sm:text-2xl font-extrabold text-text tracking-tight mt-1 truncate max-w-lg">
              {title || 'Untitled Article Draft'}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {article.status === 'published' && article.slug && (
            <a
              href={`/articles/${article.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              title="View live published article"
            >
              <Button variant="ghost" size="sm" className="text-gold hover:text-goldHover hover:bg-gold/10">
                <Icon name="ExternalLink" size={14} />
              </Button>
            </a>
          )}

          {isEditable && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleManualSave}
              isLoading={updateDraftMutation.isPending}
              disabled={submitReviewMutation.isPending || publishMutation.isPending}
              leftIcon={<Icon name="Save" size={14} />}
              className="border-gold/40 text-gold hover:bg-gold/10 font-bold"
            >
              {article.status === 'published' ? 'Save Changes' : 'Save Draft'}
            </Button>
          )}

          {article.status === 'approved' && (
            <Button
              variant="primary"
              size="sm"
              onClick={handlePublishNow}
              isLoading={publishMutation.isPending}
              disabled={updateDraftMutation.isPending}
              leftIcon={<Icon name="Globe" size={14} />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
            >
              Publish Article Now
            </Button>
          )}

          {isEditable && (article.status === 'draft' || article.status === 'changesRequested') && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitForReview}
              isLoading={submitReviewMutation.isPending}
              disabled={!isMetadataComplete || updateDraftMutation.isPending}
              rightIcon={<Icon name="Send" size={14} />}
              title={
                !isMetadataComplete
                  ? 'Complete all metadata fields (Title, Topic, Excerpt, Cover Image, Content) to submit.'
                  : 'Submit for SuperAdmin Review'
              }
            >
              Submit for Review
            </Button>
          )}

          {(isAuthor || isSuperAdmin) && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteArticle}
              isLoading={deleteMutation.isPending}
              disabled={updateDraftMutation.isPending || submitReviewMutation.isPending || publishMutation.isPending}
              leftIcon={<Icon name="Trash2" size={14} />}
              className="bg-danger/10 hover:bg-danger text-danger hover:text-white border border-danger/30 font-semibold"
              title="Delete this article permanently"
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Reviewer Feedback Banner (If Changes Requested) */}
      {article.status === 'changesRequested' && article.reviewNotes && (
        <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 sm:p-5 space-y-2 shadow-sm">
          <div className="flex items-center space-x-2 text-gold font-bold text-sm">
            <Icon name="AlertCircle" size={18} />
            <span>Reviewer Requested Revisions</span>
          </div>
          <p className="text-xs sm:text-sm text-text leading-relaxed whitespace-pre-wrap pl-6 bg-surface/60 p-3.5 rounded-lg border border-gold/20 font-serif italic">
            &quot;{article.reviewNotes}&quot;
          </p>
          <p className="text-[11px] text-textMuted pl-6">
            Make the requested edits below, save draft, and click &quot;Submit for Review&quot; when finished.
          </p>
        </div>
      )}

      {/* Article Authoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Editor Canvas) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gold">
              Article Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              disabled={!isEditable}
              placeholder="Enter a compelling article title..."
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-lg sm:text-xl font-bold text-text focus:border-gold focus:outline-none disabled:opacity-60 transition-colors shadow-sm"
            />
          </div>

          {/* RichTextEditor Canvas */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gold">
              Article Content & Scholarly Body <span className="text-danger">*</span>
            </label>
            <RichTextEditor
              content={content}
              onChange={(json) => handleContentChange(json)}
              editable={isEditable}
            />
          </div>

          {/* Excerpt Textarea */}
          <Textarea
            label="Article Summary / Abstract *"
            placeholder="Write a concise 2-3 sentence abstract for search engines, cards, and metadata indexing..."
            value={excerpt}
            onChange={(e) => handleExcerptChange(e.target.value)}
            disabled={!isEditable}
            rows={3}
          />
        </div>

        {/* Right Sidebar (Metadata Checklist & Settings) */}
        <div className="space-y-6">
          {/* Submission Readiness Checklist */}
          {isEditable && (
            <div className="rounded-xl border border-border bg-surface p-5 space-y-3.5 shadow-sm">
              <h3 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center justify-between border-b border-border pb-3">
                <span className="flex items-center gap-2">
                  <Icon name="CheckCircle" size={14} />
                  Submission Readiness
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-mono ${
                    isMetadataComplete
                      ? 'bg-success/20 text-success font-bold'
                      : 'bg-gold/20 text-gold'
                  }`}
                >
                  {isMetadataComplete ? 'Ready' : 'Incomplete'}
                </span>
              </h3>

              <ul className="space-y-2 text-xs">
                <li className="flex items-center justify-between">
                  <span className="text-textMuted">Article Title</span>
                  {isTitleValid ? (
                    <span className="text-success flex items-center gap-1 font-semibold">
                      <Icon name="Check" size={12} /> Valid
                    </span>
                  ) : (
                    <span className="text-danger flex items-center gap-1">Required</span>
                  )}
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-textMuted">Topic Taxonomy</span>
                  {isTopicValid ? (
                    <span className="text-success flex items-center gap-1 font-semibold">
                      <Icon name="Check" size={12} /> Valid
                    </span>
                  ) : (
                    <span className="text-danger flex items-center gap-1">Required</span>
                  )}
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-textMuted">Summary / Abstract</span>
                  {isExcerptValid ? (
                    <span className="text-success flex items-center gap-1 font-semibold">
                      <Icon name="Check" size={12} /> Valid
                    </span>
                  ) : (
                    <span className="text-danger flex items-center gap-1">Required</span>
                  )}
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-textMuted">Cover Image Banner</span>
                  {isCoverImageValid ? (
                    <span className="text-success flex items-center gap-1 font-semibold">
                      <Icon name="Check" size={12} /> Valid
                    </span>
                  ) : (
                    <span className="text-danger flex items-center gap-1">Required</span>
                  )}
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-textMuted">Article Body Content</span>
                  {isContentValid ? (
                    <span className="text-success flex items-center gap-1 font-semibold">
                      <Icon name="Check" size={12} /> Valid
                    </span>
                  ) : (
                    <span className="text-danger flex items-center gap-1">Required</span>
                  )}
                </li>
              </ul>
            </div>
          )}

          {/* Taxonomy & Cover Card */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Icon name="Settings" size={14} />
              Publishing Metadata
            </h3>

            {/* Topic Select */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider">
                Topic Category <span className="text-danger">*</span>
              </label>
              <Select
                value={topicId}
                onChange={(e) => handleTopicChange(e.target.value)}
                options={topicOptions}
                disabled={!isEditable}
              />
            </div>

            {/* URL Slug */}
            <Input
              label="Custom URL Slug"
              placeholder="e.g. divine-transcendence"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              disabled={!isEditable}
              helperText="Auto-generated from title if left blank."
            />

            {/* Cover Image Upload */}
            <div>
              <FileUpload
                label="Cover Image Banner *"
                folder="qindil/articles"
                value={coverImageUrl}
                onUploadComplete={handleCoverImageChange}
                disabled={!isEditable}
              />
            </div>
          </div>

          {/* Article Provenance Summary */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-3 text-xs text-textMuted shadow-sm">
            <h4 className="font-bold text-text uppercase tracking-wider text-[11px] border-b border-border pb-2">
              Article Details
            </h4>
            <div className="flex justify-between">
              <span>Author:</span>
              <span className="font-semibold text-text">
                {typeof article.author === 'object' ? article.author.name : 'You'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <StatusBadge status={article.status} size="sm" />
            </div>
            <div className="flex justify-between">
              <span>Estimated Read:</span>
              <span className="font-mono text-text">{readingTime} min</span>
            </div>
            <div className="flex justify-between">
              <span>Word Count:</span>
              <span className="font-mono text-text">{wordCount.toLocaleString()} words</span>
            </div>
            <div className="flex justify-between">
              <span>Created:</span>
              <span className="font-mono text-text">
                {new Date(article.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Last Saved:</span>
              <span className="font-mono text-text">
                {lastSavedAt ? lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {ConfirmModalElement}
    </div>
  );
};

export default ArticleEditorPage;
