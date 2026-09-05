import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/icons/Icon';
import { useArticleForEdit, useUpdateArticleDraft, useSubmitForReview } from '../../hooks/useArticles';
import { useAdminTopics } from '../../hooks/useTopics';
import { RichTextEditor } from '../../components/editor/RichTextEditor';
import FileUpload from '../../components/admin/FileUpload';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from '../../hooks/useToast';

export const ArticleEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: article, isLoading: isLoadingArticle, isError, error } = useArticleForEdit(id);
  const { data: topics = [] } = useAdminTopics();

  const updateDraftMutation = useUpdateArticleDraft();
  const submitReviewMutation = useSubmitForReview();

  // Form Fields
  const [title, setTitle] = useState('');
  const [topicId, setTopicId] = useState('');
  const [content, setContent] = useState<any>('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [slug, setSlug] = useState('');

  // Autosave & Dirty State
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const isInitialLoadRef = useRef(true);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state when article data is loaded
  useEffect(() => {
    if (article) {
      setTitle(article.title || '');
      const tId = typeof article.topic === 'object' && article.topic ? article.topic._id : article.topic || '';
      setTopicId(tId);
      setContent(article.content || '');
      setExcerpt(article.excerpt || '');
      setCoverImageUrl(article.coverImageUrl || '');
      setSlug(article.slug || '');
      setLastSavedAt(new Date(article.updatedAt));
      setSaveStatus('saved');

      // Reset initial load flag after hydration
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 300);
    }
  }, [article]);

  const isEditable = article?.status === 'draft' || article?.status === 'changesRequested';

  // Debounced Autosave Trigger
  const triggerAutosave = () => {
    if (!id || !isEditable || isInitialLoadRef.current) return;

    setSaveStatus('unsaved');

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await updateDraftMutation.mutateAsync({
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
        setSaveStatus('saved');
        setLastSavedAt(new Date());
      } catch (err) {
        console.error('Autosave error:', err);
        setSaveStatus('unsaved');
      }
    }, 2000);
  };

  // Field change wrappers with autosave trigger
  const handleTitleChange = (val: string) => {
    setTitle(val);
    triggerAutosave();
  };

  const handleTopicChange = (val: string) => {
    setTopicId(val);
    triggerAutosave();
  };

  const handleContentChange = (json: any) => {
    setContent(json);
    triggerAutosave();
  };

  const handleExcerptChange = (val: string) => {
    setExcerpt(val);
    triggerAutosave();
  };

  const handleCoverImageChange = (url: string) => {
    setCoverImageUrl(url);
    triggerAutosave();
  };

  const handleSlugChange = (val: string) => {
    setSlug(val);
    triggerAutosave();
  };

  // Immediate Manual Save
  const handleManualSave = async () => {
    if (!id || !isEditable) return;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    setSaveStatus('saving');
    try {
      await updateDraftMutation.mutateAsync({
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
      setSaveStatus('saved');
      setLastSavedAt(new Date());
      toast.success('Draft saved successfully.');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Failed to save draft.';
      toast.error(msg);
      setSaveStatus('unsaved');
    }
  };

  // Submit for Review
  const handleSubmitForReview = async () => {
    if (!id || !isEditable) return;

    if (!title.trim()) {
      toast.error('Article title is required before submitting for review.');
      return;
    }
    if (!topicId) {
      toast.error('Please select a Topic for the article before submitting.');
      return;
    }
    if (!content) {
      toast.error('Article content cannot be empty.');
      return;
    }

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

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
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Failed to submit article for review.';
      toast.error(msg);
    }
  };

  if (isLoadingArticle) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !article) {
    const errorMsg = (error as any)?.response?.data?.error?.message || 'Article not found or access denied.';
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

  const topicOptions = [
    { value: '', label: 'Select a Topic...' },
    ...topics
      .filter((t) => t.isActive)
      .map((t) => ({
        value: t._id,
        label: t.name,
      })),
  ];

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto">
      {/* Navigation & Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin/articles')}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-surface text-textMuted hover:text-gold hover:border-gold/50 transition-colors"
            title="Back to My Articles"
          >
            <Icon name="ArrowLeft" size={16} />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <StatusBadge status={article.status} />

              {/* Autosave Status Indicator */}
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border border-border bg-bg/80 text-[11px] font-mono">
                {saveStatus === 'saving' && (
                  <>
                    <Spinner size="sm" />
                    <span className="text-gold">Saving...</span>
                  </>
                )}
                {saveStatus === 'saved' && (
                  <>
                    <Icon name="Check" size={12} className="text-success" />
                    <span className="text-textMuted">
                      Saved {lastSavedAt ? lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </>
                )}
                {saveStatus === 'unsaved' && (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                    <span className="text-gold">Unsaved changes</span>
                  </>
                )}
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-text tracking-tight mt-1 truncate max-w-lg">
              {title || 'Untitled Article Draft'}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditable && (
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleManualSave}
              isLoading={updateDraftMutation.isPending}
            >
              Save Draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitForReview}
              isLoading={submitReviewMutation.isPending}
              rightIcon={<Icon name="Send" size={14} />}
            >
              Submit for Review
            </Button>
          </div>
        )}
      </div>

      {/* Reviewer Feedback Banner (If Changes Requested) */}
      {article.status === 'changesRequested' && article.reviewNotes && (
        <div className="rounded-xl border border-gold/40 bg-gold/10 p-5 space-y-2 shadow-md">
          <div className="flex items-center space-x-2 text-gold font-bold text-sm">
            <Icon name="AlertCircle" size={18} />
            <span>Reviewer Requested Changes</span>
          </div>
          <p className="text-xs text-text leading-relaxed whitespace-pre-wrap pl-6 bg-surface/40 p-3 rounded-lg border border-gold/20 font-serif italic">
            "{article.reviewNotes}"
          </p>
          <p className="text-[11px] text-textMuted pl-6">
            Make the requested edits below and click "Submit for Review" when finished.
          </p>
        </div>
      )}

      {/* Read-Only Locked Banner (If In Review or Published) */}
      {!isEditable && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 flex items-center space-x-3 text-blue-400 text-xs font-semibold shadow-sm">
          <Icon name="Info" size={20} className="shrink-0" />
          <div>
            <p className="font-bold text-text">Editing Locked</p>
            <p className="text-textMuted text-[11px] mt-0.5">
              This article is currently <span className="text-gold font-bold">{article.status}</span>. Editing is disabled until SuperAdmin review completes.
            </p>
          </div>
        </div>
      )}

      {/* Article Authoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Editor Canvas) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gold">
              Article Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              disabled={!isEditable}
              placeholder="Enter a compelling article title..."
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-lg font-bold text-text focus:border-gold focus:outline-none disabled:opacity-60 transition-colors"
            />
          </div>

          {/* RichTextEditor Canvas */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gold">
              Article Content & Body
            </label>
            <RichTextEditor
              content={content}
              onChange={(json) => handleContentChange(json)}
              editable={isEditable}
            />
          </div>

          {/* Excerpt Textarea */}
          <Textarea
            label="Article Summary / Excerpt"
            placeholder="Write a brief 2-3 sentence overview for search engines and article cards..."
            value={excerpt}
            onChange={(e) => handleExcerptChange(e.target.value)}
            disabled={!isEditable}
            rows={3}
          />
        </div>

        {/* Right Sidebar (Metadata & Settings) */}
        <div className="space-y-6">
          {/* Taxonomy & Cover Card */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-5 shadow-md">
            <h3 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Icon name="Settings" size={14} />
              Metadata & Publishing Settings
            </h3>

            {/* Topic Select */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider">
                Topic Category
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
              placeholder="e.g. theology-apologetics"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              disabled={!isEditable}
              helperText="Auto-generated from title if left blank."
            />

            {/* Cover Image Upload */}
            <div>
              <FileUpload
                label="Cover Image Banner"
                folder="qindil/articles"
                value={coverImageUrl}
                onUploadComplete={handleCoverImageChange}
              />
            </div>
          </div>

          {/* Article Info Summary */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-3 text-xs text-textMuted">
            <h4 className="font-bold text-text uppercase tracking-wider text-[11px] border-b border-border pb-2">
              Article Information
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
              <span>Created:</span>
              <span className="font-mono text-text">
                {new Date(article.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Last Modified:</span>
              <span className="font-mono text-text">
                {new Date(article.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditorPage;
