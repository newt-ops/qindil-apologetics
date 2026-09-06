import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import {
  useArticlesAdmin,
  useCreateArticleDraft,
  useDeleteArticleDraft,
} from '../../../hooks/useArticles';
import { useAdminTopics } from '../../../hooks/useTopics';
import { useTeamMembers } from '../../../hooks/useTeam';
import { useHasRole } from '../../../hooks/useHasRole';
import { ArticleItem } from '../../../api/article';
import { DataTable } from '../../../components/admin/DataTable';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select, { SelectOption } from '../../../components/ui/Select';
import Modal from '../../../components/ui/Modal';
import { Column } from '../../../components/ui/Table';
import { toast } from '../../../hooks/useToast';

export const ArticlesListPage: React.FC = () => {
  const navigate = useNavigate();
  const isSuperAdmin = useHasRole('superAdmin');

  // Filter Bar State
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [topicFilter, setTopicFilter] = useState<string>('');
  const [authorFilter, setAuthorFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New Article Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [createError, setCreateError] = useState('');

  // Delete Draft Modal State
  const [deleteTarget, setDeleteTarget] = useState<ArticleItem | null>(null);

  // Global Unfiltered Query for Master KPIs
  const { data: globalArticlesData } = useArticlesAdmin({});
  const globalArticles = globalArticlesData?.items || [];

  // Filtered Query for the Table
  const { data: articlesData, isLoading } = useArticlesAdmin({
    status: statusFilter || undefined,
    topic: topicFilter || undefined,
    author: isSuperAdmin && authorFilter ? authorFilter : undefined,
    search: searchQuery || undefined,
  });

  const articlesList = articlesData?.items || [];
  const { data: topics = [] } = useAdminTopics();
  const { data: teamResponse } = useTeamMembers();
  const teamMembers = teamResponse?.data || [];

  const createMutation = useCreateArticleDraft();
  const deleteMutation = useDeleteArticleDraft();

  // Metrics Calculation from global collection
  const totalArticles = globalArticles.length;
  const publishedCount = globalArticles.filter((a) => a.status === 'published').length;
  const inReviewCount = globalArticles.filter((a) => a.status === 'inReview').length;
  const draftCount = globalArticles.filter(
    (a) => a.status === 'draft' || a.status === 'changesRequested'
  ).length;
  const totalReadership = globalArticles.reduce((sum, a) => sum + (a.viewCount || 0), 0);

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
        authorId: isSuperAdmin && newAuthor ? newAuthor : undefined,
      });

      setIsNewModalOpen(false);
      setNewTitle('');
      setNewTopic('');
      setNewAuthor('');
      toast.success('Article draft created successfully.');

      const createdId = res.data._id;
      navigate(`/admin/articles/${createdId}/edit`);
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || 'Failed to create article draft.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      toast.success(`Draft "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete article draft.');
    }
  };

  // Define Table Columns
  const columns: Column<ArticleItem>[] = [
    {
      key: 'title',
      header: 'Article Title & Excerpt',
      sortable: true,
      render: (item) => {
        const isEditable = item.status === 'draft' || item.status === 'changesRequested';
        const linkPath = isEditable
          ? `/admin/articles/${item._id}/edit`
          : isSuperAdmin
          ? `/admin/articles/${item._id}/review`
          : `/admin/articles/${item._id}/edit`;

        return (
          <div className="space-y-1 max-w-md">
            <Link
              to={linkPath}
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
        );
      },
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
    ...(isSuperAdmin
      ? [
          {
            key: 'author',
            header: 'Author & Editor',
            render: (item: ArticleItem) => {
              const authorObj = typeof item.author === 'object' ? item.author : null;
              const lastEditedObj = typeof item.lastEditedBy === 'object' ? item.lastEditedBy : null;
              const isDifferentEditor =
                lastEditedObj && authorObj && lastEditedObj._id !== authorObj._id;

              return (
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    {authorObj?.avatarUrl ? (
                      <img
                        src={authorObj.avatarUrl}
                        alt={authorObj.name}
                        className="h-6 w-6 rounded-full border border-gold/30 object-cover"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/10 text-gold font-bold text-[10px]">
                        {authorObj?.name ? authorObj.name[0].toUpperCase() : 'A'}
                      </div>
                    )}
                    <span className="font-medium text-text">{authorObj?.name || 'Author'}</span>
                  </div>

                  {isDifferentEditor && (
                    <div className="text-[10px] text-gold flex items-center gap-1 font-mono">
                      <Icon name="Edit" size={10} className="text-gold" />
                      <span>Edited by {lastEditedObj.name}</span>
                    </div>
                  )}
                </div>
              );
            },
          },
        ]
      : []),
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
        <span className="inline-flex items-center space-x-1 text-xs font-mono font-bold text-textMuted">
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
      render: (item) => {
        const isEditable = item.status === 'draft' || item.status === 'changesRequested';
        const linkPath = isEditable
          ? `/admin/articles/${item._id}/edit`
          : isSuperAdmin
          ? `/admin/articles/${item._id}/review`
          : `/admin/articles/${item._id}/edit`;

        return (
          <div className="flex items-center space-x-1.5">
            <Link to={linkPath}>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Icon name={isEditable ? 'Edit' : 'Eye'} size={13} />}
              >
                {isEditable ? 'Edit' : 'Inspect'}
              </Button>
            </Link>

            {item.status === 'published' && item.slug && (
              <a
                href={`/articles/${item.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                title="View live published article"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gold hover:text-goldHover hover:bg-gold/10"
                >
                  <Icon name="ExternalLink" size={13} />
                </Button>
              </a>
            )}

            {item.status === 'draft' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-danger hover:bg-danger/10 hover:text-danger"
                onClick={() => setDeleteTarget(item)}
                title="Delete draft article"
              >
                <Icon name="Trash2" size={13} />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  // Quick Filter Tabs
  const statusTabs = [
    { value: '', label: 'All Articles', count: totalArticles },
    { value: 'published', label: 'Published', count: publishedCount },
    { value: 'inReview', label: 'In Review', count: inReviewCount },
    { value: 'draft', label: 'Drafts', count: draftCount },
    { value: 'changesRequested', label: 'Changes Requested' },
  ];

  // Prepare select options
  const statusOptions: SelectOption[] = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'inReview', label: 'In Review' },
    { value: 'changesRequested', label: 'Changes Requested' },
    { value: 'approved', label: 'Approved' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
  ];

  const topicOptions: SelectOption[] = [
    { value: '', label: 'All Disciplines' },
    ...topics.map((t) => ({ value: t._id, label: t.name })),
  ];

  const authorOptions: SelectOption[] = [
    { value: '', label: 'All Authors' },
    ...teamMembers.map((m) => ({ value: m._id, label: `${m.name} (${m.email})` })),
  ];

  const modalTopicOptions: SelectOption[] = [
    { value: '', label: 'Select Discipline...' },
    ...topics.map((t) => ({ value: t._id, label: t.name })),
  ];

  const modalAuthorOptions: SelectOption[] = [
    { value: '', label: 'Self (Current User)' },
    ...teamMembers.map((m) => ({ value: m._id, label: `${m.name} (${m.email})` })),
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold mb-2">
            <Icon name="FileText" size={14} />
            <span>{isSuperAdmin ? 'Editorial Subsystem' : 'Author Workspace'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            {isSuperAdmin ? 'Articles Management' : 'My Articles'}
          </h1>
          <p className="text-xs sm:text-sm text-textMuted mt-1">
            {isSuperAdmin
              ? 'Master registry of all scholarly works, peer reviews, drafts, and published papers.'
              : 'Your workspace to author, edit, track review decisions, and manage article drafts.'}
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Icon name="Plus" size={16} />}
          onClick={() => setIsNewModalOpen(true)}
        >
          New Article
        </Button>
      </div>

      {/* Production KPI Metrics Strip (Prompt 42 density) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
        {/* Total Articles */}
        <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              Catalog Total
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/10 text-gold">
              <Icon name="FileText" size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-text">
            {totalArticles}
          </div>
          <div className="mt-0.5 text-[10px] text-textMuted">Scholarly papers</div>
        </div>

        {/* Published */}
        <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              Published Live
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Icon name="Globe" size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-text">
            {publishedCount}
          </div>
          <div className="mt-0.5 text-[10px] text-emerald-500/80 font-medium">Publicly accessible</div>
        </div>

        {/* Review Queue */}
        <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              In Review
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Icon name="Inbox" size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-text">
            {inReviewCount}
          </div>
          <div className="mt-0.5 text-[10px] text-amber-500/80 font-medium">Awaiting decision</div>
        </div>

        {/* Active Drafts */}
        <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              Drafts
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Icon name="Edit" size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-text">
            {draftCount}
          </div>
          <div className="mt-0.5 text-[10px] text-textMuted">In preparation</div>
        </div>

        {/* Readership Views */}
        <div className="col-span-2 sm:col-span-1 lg:col-span-1 rounded-xl border border-border bg-surface p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              Readership
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <Icon name="Eye" size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-text">
            {totalReadership.toLocaleString()}
          </div>
          <div className="mt-0.5 text-[10px] text-textMuted">Cumulative impressions</div>
        </div>
      </div>

      {/* Quick Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/80 text-xs">
        {statusTabs.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`inline-flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-all ${
                isActive
                  ? 'bg-gold text-bg font-bold shadow-sm'
                  : 'text-textMuted hover:bg-surface hover:text-text'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    isActive ? 'bg-bg/20 text-bg' : 'bg-surface border border-border text-textMuted'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Detailed Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-surface border border-border p-3.5 sm:p-4 rounded-xl">
        <Input
          placeholder="Search title or excerpt..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftElement={<Icon name="Search" size={15} className="text-textMuted" />}
        />

        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />

        <Select
          options={topicOptions}
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
        />

        {isSuperAdmin && (
          <Select
            options={authorOptions}
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
          />
        )}
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={articlesList}
        isLoading={isLoading}
        searchPlaceholder="Search in current view..."
      />

      {/* New Article Modal */}
      {isNewModalOpen && (
        <Modal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Create New Scholarly Article"
          size="md"
        >
          <form onSubmit={handleCreateArticleSubmit} className="space-y-4 font-sans">
            <p className="text-xs text-textMuted leading-relaxed">
              Initialize a new research article draft. You will be redirected immediately to the rich authoring workspace.
            </p>

            <Input
              label="Article Title"
              placeholder="e.g., Ontological Foundations of Divine Transcendence"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              error={createError}
            />

            <Select
              label="Research Discipline (Optional)"
              options={modalTopicOptions}
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
            />

            {isSuperAdmin && (
              <Select
                label="Assign Author (SuperAdmin override)"
                options={modalAuthorOptions}
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
              />
            )}

            <div className="flex justify-end space-x-2 pt-3 border-t border-border">
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
                Start Authoring
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Draft Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Confirm Draft Deletion"
          size="sm"
        >
          <div className="space-y-4 font-sans">
            <div className="flex items-start space-x-3 text-danger bg-danger/10 p-3.5 rounded-xl border border-danger/30 text-xs">
              <Icon name="AlertTriangle" size={18} className="shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Permanent Deletion Warning</span>
                <span className="text-text/80">
                  This action cannot be reversed. The draft article "
                  <strong className="text-text font-bold">{deleteTarget.title}</strong>" will be permanently deleted from the database.
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={deleteMutation.isPending}
                onClick={handleDeleteConfirm}
                leftIcon={<Icon name="Trash2" size={14} />}
              >
                Delete Draft
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ArticlesListPage;
