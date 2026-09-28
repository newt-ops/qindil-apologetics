import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import { useTopic, useCreateTopic, useUpdateTopic } from '../../../hooks/useTopics';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { AdminPageSkeleton } from '../../../components/ui/Skeleton';
import FileUpload from '../../../components/admin/FileUpload';
import { toast } from '../../../hooks/useToast';

const formatSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export const TopicFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const { data: topic, isLoading: isLoadingTopic } = useTopic(id);
  const createTopicMutation = useCreateTopic();
  const updateTopicMutation = useUpdateTopic();

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [order, setOrder] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [formError, setFormError] = useState('');

  // Hydrate data when editing
  useEffect(() => {
    if (topic && isEditing) {
      setName(topic.name || '');
      setSlug(topic.slug || '');
      setDescription(topic.description || '');
      setCoverImageUrl(topic.coverImageUrl || '');
      setOrder(typeof topic.order === 'number' ? topic.order : '');
      setIsActive(topic.isActive ?? true);
      setIsSlugManuallyEdited(true);
    }
  }, [topic, isEditing]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManuallyEdited) {
      setSlug(formatSlug(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    setSlug(formatSlug(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setFormError('Topic name is required.');
      toast.error('Topic name is required.');
      return;
    }

    if (name.trim().length < 2) {
      setFormError('Topic name must be at least 2 characters.');
      toast.error('Topic name must be at least 2 characters.');
      return;
    }

    setFormError('');

    const sanitizedSlug = slug.trim() ? slug.trim() : undefined;
    const sanitizedDescription = description.trim() ? description.trim() : undefined;
    const sanitizedCover = coverImageUrl.trim() ? coverImageUrl.trim() : undefined;
    const sanitizedOrder = order === '' || isNaN(Number(order)) ? undefined : Math.round(Number(order));

    try {
      if (isEditing && id) {
        await updateTopicMutation.mutateAsync({
          id,
          data: {
            name: name.trim(),
            slug: sanitizedSlug,
            description: sanitizedDescription,
            coverImageUrl: sanitizedCover,
            order: sanitizedOrder,
            isActive,
          },
        });
        toast.success(`Topic "${name}" updated successfully.`);
      } else {
        await createTopicMutation.mutateAsync({
          name: name.trim(),
          slug: sanitizedSlug,
          description: sanitizedDescription,
          coverImageUrl: sanitizedCover,
          order: sanitizedOrder,
        });
        toast.success(`Topic "${name}" created and added to catalog.`);
      }

      navigate('/admin/topics');
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Failed to save topic.';
      setFormError(msg);
      toast.error(msg);
    }
  };

  const isSaving = createTopicMutation.isPending || updateTopicMutation.isPending;

  if (isEditing && isLoadingTopic && !topic) {
    return <AdminPageSkeleton variant="form" />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans pb-16">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <Link
            to="/admin/topics"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-textMuted hover:text-gold transition-colors"
          >
            <Icon name="ArrowLeft" size={15} />
            <span>Back to Topics Management</span>
          </Link>
          <div className="flex items-center space-x-3 pt-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 text-gold border border-gold/30">
              <Icon name="Tag" size={18} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-text tracking-tight">
                {isEditing ? `Edit Topic: ${topic?.name || ''}` : 'Create Research Topic'}
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                {isEditing
                  ? 'Update research domain scope, banner aesthetics, URL path, and catalog visibility.'
                  : 'Define a primary research domain, public taxonomy, banner aesthetics, and URL routing.'}
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <Link to="/admin/topics">
            <Button type="button" variant="secondary" size="md">
              Cancel
            </Button>
          </Link>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleSubmit}
            isLoading={isSaving}
            leftIcon={<Icon name="Save" size={16} />}
            className="px-5 shadow-md"
          >
            {isEditing ? 'Save Changes' : 'Create Topic'}
          </Button>
        </div>
      </div>

      {formError && (
        <div className="rounded-xl border border-danger/40 bg-danger/10 p-4 text-xs font-semibold text-danger flex items-center gap-2">
          <Icon name="AlertCircle" size={16} className="shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Main 2-Column Responsive Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Primary Content & Configuration (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Core Taxonomy */}
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center space-x-2 border-b border-border/80 pb-3">
              <Icon name="FileText" size={16} className="text-gold" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-text">
                Primary Taxonomy Details
              </h3>
            </div>

            <div className="space-y-4">
              {/* Topic Name */}
              <Input
                label="Topic Title *"
                placeholder="e.g. Rational Theology & Classical Theism"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                autoFocus
                helperText="Use concise, formal scholarly naming for the research category."
              />

              {/* URL Slug */}
              <div className="space-y-1.5">
                <Input
                  label="URL Path Slug *"
                  placeholder="e.g. rational-theology"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  required
                />
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-textMuted bg-bg/60 px-3 py-1.5 rounded-lg border border-border/70">
                  <span className="text-gold">Public URL:</span>
                  <span className="truncate">/topics/{slug || 'topic-slug'}</span>
                </div>
              </div>

              {/* Description & Scope */}
              <Textarea
                label="Theological & Scholarly Scope"
                placeholder="Detail the intellectual and theological scope of this topic. Summarize core debates, classical references (e.g. Kalam, Ibn Sina, Al-Ghazali, Ibn Taymiyyah), and modern skeptical challenges addressed under this domain..."
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                helperText="Displayed at the top of the public topic archive and on topic index cards."
              />
            </div>
          </div>

          {/* Card 2: Catalog Visibility & Ordering */}
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center space-x-2 border-b border-border/80 pb-3">
              <Icon name="Activity" size={16} className="text-gold" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-text">
                Catalog Display &amp; Visibility
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Active Toggle Card */}
              <div
                onClick={() => setIsActive(!isActive)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                  isActive
                    ? 'border-emerald-500/40 bg-emerald-500/5 text-text'
                    : 'border-border bg-bg/40 text-textMuted'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => {}}
                  className="h-4 w-4 mt-0.5 rounded border-border text-emerald-500 focus:ring-emerald-500 accent-emerald-500 shrink-0"
                />
                <div>
                  <h4 className="text-xs font-bold text-text flex items-center gap-1.5">
                    <span>Publicly Active in Catalog</span>
                    {isActive ? (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-mono">
                        Active
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-border text-textMuted font-mono">
                        Hidden
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-textMuted mt-1 leading-relaxed">
                    When active, this topic is visible in the public header menu, topic explorer, and article categorization dropdowns.
                  </p>
                </div>
              </div>

              {/* Sort Order */}
              <div className="space-y-1.5">
                <Input
                  label="Display Sort Position"
                  type="number"
                  placeholder="e.g. 1"
                  value={order === '' ? '' : order}
                  onChange={(e) => setOrder(e.target.value === '' ? '' : Number(e.target.value))}
                  helperText="Lower numbers appear first on the public homepage and topic filters."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Aesthetics, Live Preview & Guidelines */}
        <div className="space-y-6">
          {/* Card 1: Visual Identity (Cover Banner) */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-border/80 pb-3">
              <Icon name="Image" size={16} className="text-gold" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-text">
                Visual Banner Identity
              </h3>
            </div>

            <p className="text-xs text-textMuted leading-relaxed">
              Upload a high-resolution banner image. Recommended aspect ratio: 16:9 or 3:1 (1200×400px).
            </p>

            <FileUpload
              folder="qindil/topics"
              value={coverImageUrl}
              onUploadComplete={(url) => setCoverImageUrl(url)}
              label="Topic Banner Image"
            />
          </div>

          {/* Card 2: Live Public Card Preview */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
              <div className="flex items-center space-x-1.5">
                <Icon name="Eye" size={15} className="text-gold" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-text">
                  Live Public Preview
                </h3>
              </div>
              <span className="text-[10px] font-mono text-gold uppercase tracking-wider">
                Catalog Card
              </span>
            </div>

            {/* Render Public Card Simulation */}
            <div className="rounded-xl border border-border/80 bg-bg overflow-hidden shadow-md group">
              {/* Card Banner Image or Fallback */}
              <div className="h-32 w-full bg-linear-to-br from-gold/20 via-surface to-bg relative overflow-hidden border-b border-border/60 flex items-center justify-center">
                {coverImageUrl ? (
                  <img
                    src={coverImageUrl}
                    alt={name || 'Topic banner'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <div className="h-10 w-10 mx-auto rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-bold text-lg mb-1">
                      {name ? name.charAt(0).toUpperCase() : 'Q'}
                    </div>
                    <span className="text-[10px] font-mono text-textMuted">No banner uploaded</span>
                  </div>
                )}
                {isActive && (
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 backdrop-blur-xs">
                    Public
                  </span>
                )}
              </div>

              {/* Card Details */}
              <div className="p-4 space-y-2">
                <h4 className="text-sm font-bold text-text truncate">
                  {name || 'Untitled Research Topic'}
                </h4>
                <p className="text-xs text-textMuted line-clamp-2 leading-relaxed">
                  {description ||
                    'Scholarly papers and philosophical refutations curated under this domain.'}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px]">
                  <span className="text-textMuted font-mono flex items-center gap-1">
                    <Icon name="FileText" size={12} className="text-gold" />
                    <span>{topic?.articleCount ?? 0} papers</span>
                  </span>
                  <span className="text-gold font-semibold flex items-center gap-0.5">
                    <span>Explore</span>
                    <Icon name="ArrowRight" size={11} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Curation Guidelines */}
          <div className="rounded-2xl border border-gold/20 bg-gold/5 p-5 text-xs text-textMuted space-y-2.5">
            <h4 className="font-bold text-gold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Icon name="Info" size={14} />
              <span>Taxonomy Best Practices</span>
            </h4>
            <ul className="space-y-1.5 pl-4 list-disc marker:text-gold text-[11px] leading-relaxed">
              <li>
                <strong className="text-text">Distinct Boundaries:</strong> Ensure topics do not heavily overlap to keep article search precision high.
              </li>
              <li>
                <strong className="text-text">URL Stability:</strong> Once published, avoid modifying the slug to preserve external backlinks and search engine indexing.
              </li>
              <li>
                <strong className="text-text">Cross-Media:</strong> Articles and video productions can both be assigned directly to this research domain.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="lg:col-span-3 flex items-center justify-end space-x-3 pt-4 border-t border-border">
          <Link to="/admin/topics">
            <Button type="button" variant="secondary" size="md">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
            leftIcon={<Icon name="Save" size={16} />}
            className="px-6 shadow-md"
          >
            {isEditing ? 'Save Changes' : 'Create Topic'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TopicFormPage;
