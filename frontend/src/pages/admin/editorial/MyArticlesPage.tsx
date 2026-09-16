import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import { useMyArticles, useCreateArticleDraft } from '../../../hooks/useArticles';
import { useAdminTopics } from '../../../hooks/useTopics';
import { ArticleItem } from '../../../api/article';
import { DataTable } from '../../../components/admin/DataTable';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { AdminPageHeader, AdminStatCard } from '../../../components/admin';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Column } from '../../../components/ui/Table';
import { toast } from '../../../hooks/useToast';

export const MyArticlesPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: articles = [], isLoading } = useMyArticles();
  const { data: topics = [] } = useAdminTopics();
  const createMutation = useCreateArticleDraft();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [createError, setCreateError] = useState('');

  // Metrics calculation
  const totalArticles = articles.length;
  const draftCount = articles.filter((a) => a.status === 'draft').length;
  const inReviewCount = articles.filter((a) => a.status === 'inReview').length;
  const changesRequestedCount = articles.filter((a) => a.status === 'changesRequested').length;
  const publishedCount = articles.filter((a) => a.status === 'published').length;
  const totalViews = articles.reduce((sum, a) => sum + (a.viewCount || 0), 0);

  // Filtered articles
  const filteredArticles = articles.filter((a) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'drafts') return a.status === 'draft' || a.status === 'changesRequested';
    if (statusFilter === 'review') return a.status === 'inReview';
    if (statusFilter === 'published') return a.status === 'published';
    return a.status === statusFilter;
  });

  const handleCreateArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || newTitle.trim().length < 2) {
      setCreateError('Article title must be at least 2 characters long.');
      return;
    }

    setCreateError('');
    try {
      const res = await createMutation.mutateAsync({
        title: newTitle.trim(),
        topicId: newTopic || undefined,
      });

      setIsNewModalOpen(false);
      setNewTitle('');
      setNewTopic('');
      toast.success('New article draft initiated.');

      const createdId = res.data._id;
      navigate(`/admin/articles/${createdId}/edit`);
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || 'Failed to create article draft.');
    }
  };

  const columns: Column<ArticleItem>[] = [
    {
      key: 'title',
      header: 'Article Title & Summary',
      sortable: true,
      render: (item) => (
        <div className="space-y-1 max-w-md">
          <Link
            to={`/admin/articles/${item._id}/edit`}
            className="font-bold text-text hover:text-gold transition-colors block text-sm leading-snug"
          >
            {item.title}
          </Link>
          {item.excerpt && (
            <p className="text-[11px] text-textMuted line-clamp-1 italic font-serif">
              "{item.excerpt}"
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'topic',
      header: 'Discipline',
      render: (item) => {
        const topicName = typeof item.topic === 'object' && item.topic ? item.topic.name : '—';
        return topicName !== '—' ? (
          <Badge variant="gold">{topicName}</Badge>
        ) : (
          <span className="text-xs text-textMuted">—</span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'viewCount',
      header: 'Readership',
      sortable: true,
      render: (item) => (
        <span className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold text-textMuted">
          <Icon name="Eye" size={13} className="text-gold" />
          <span>{item.viewCount || 0}</span>
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Last Modified',
      sortable: true,
      render: (item) => (
        <span className="text-xs font-mono text-textMuted">
          {new Date(item.updatedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center space-x-2">
          <Link to={`/admin/articles/${item._id}/edit`}>
            <Button variant="secondary" size="sm" leftIcon={<Icon name="Edit" size={13} />}>
              {item.status === 'published' ? 'Edit Copy' : 'Edit Draft'}
            </Button>
          </Link>

          {item.status === 'published' && item.slug && (
            <Link
              to={`/articles/${item.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg border border-border bg-bg text-textMuted hover:text-gold hover:border-gold/40 transition shadow-xs"
              title="View published article on site"
            >
              <Icon name="ExternalLink" size={14} />
            </Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <AdminPageHeader
        discipline="Author Workspace"
        title="My Articles"
        subtitle="Author dashboard to draft, edit, and track peer review status of your apologetics papers."
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Icon name="Plus" size={15} />}
            onClick={() => setIsNewModalOpen(true)}
            className="self-start sm:self-auto shadow-md"
          >
            Write New Article
          </Button>
        }
      />

      {/* Production Stats Strip - Prompt 42: Compact 4-card strip on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <AdminStatCard
          label="Active Drafts"
          value={draftCount + changesRequestedCount}
          helperText="In progress or revisions"
          icon="Edit"
          variant="gold"
          isLoading={isLoading}
          onClick={() => setStatusFilter('drafts')}
        />
        <AdminStatCard
          label="In Review Queue"
          value={inReviewCount}
          helperText="Awaiting editorial evaluation"
          icon="Clock"
          variant="warning"
          isLoading={isLoading}
          onClick={() => setStatusFilter('review')}
        />
        <AdminStatCard
          label="Published Live"
          value={publishedCount}
          helperText="Live on public platform"
          icon="CheckCircle"
          variant="success"
          isLoading={isLoading}
          onClick={() => setStatusFilter('published')}
        />
        <AdminStatCard
          label="Total Readers"
          value={totalViews.toLocaleString()}
          helperText="Cumulative views"
          icon="Eye"
          variant="default"
          isLoading={isLoading}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-border/70 scrollbar-none">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
            statusFilter === 'all'
              ? 'bg-gold text-bg font-bold shadow-xs'
              : 'bg-surface border border-border text-textMuted hover:text-text'
          }`}
        >
          All Papers ({totalArticles})
        </button>
        <button
          onClick={() => setStatusFilter('drafts')}
          className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
            statusFilter === 'drafts'
              ? 'bg-gold text-bg font-bold shadow-xs'
              : 'bg-surface border border-border text-textMuted hover:text-text'
          }`}
        >
          Drafts ({draftCount + changesRequestedCount})
        </button>
        <button
          onClick={() => setStatusFilter('review')}
          className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
            statusFilter === 'review'
              ? 'bg-gold text-bg font-bold shadow-xs'
              : 'bg-surface border border-border text-textMuted hover:text-text'
          }`}
        >
          In Review ({inReviewCount})
        </button>
        <button
          onClick={() => setStatusFilter('published')}
          className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
            statusFilter === 'published'
              ? 'bg-gold text-bg font-bold shadow-xs'
              : 'bg-surface border border-border text-textMuted hover:text-text'
          }`}
        >
          Published ({publishedCount})
        </button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredArticles}
        isLoading={isLoading}
        searchPlaceholder="Search your articles..."
        emptyState={
          <div className="p-8 text-center text-xs text-textMuted font-sans">
            No articles found matching this filter.
          </div>
        }
      />

      {/* New Article Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Start New Article Draft"
      >
        <form onSubmit={handleCreateArticleSubmit} className="space-y-4 pt-2">
          {createError && (
            <div className="rounded-lg border border-danger/40 bg-danger/10 p-2.5 text-xs text-danger font-semibold">
              {createError}
            </div>
          )}

          <Input
            label="Article Title *"
            placeholder="e.g. The Kalam Cosmological Argument & Modern Quantum Fluctuations"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            autoFocus
          />

          <Select
            label="Research Discipline / Topic"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            options={[
              { value: '', label: 'Select a Discipline...' },
              ...topics.map((t) => ({ value: t._id, label: t.name })),
            ]}
          />

          <div className="flex items-center justify-end space-x-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsNewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createMutation.isPending}
              leftIcon={<Icon name="Plus" size={14} />}
            >
              Create Draft &amp; Open Editor
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyArticlesPage;
