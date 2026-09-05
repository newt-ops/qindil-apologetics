import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/icons/Icon';
import {
  useArticlesAdmin,
  useCreateArticleDraft,
  useDeleteArticleDraft,
} from '../../hooks/useArticles';
import { useAdminTopics } from '../../hooks/useTopics';
import { useTeamMembers } from '../../hooks/useTeam';
import { useHasRole } from '../../hooks/useHasRole';
import { ArticleItem } from '../../api/article';
import { DataTable } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select, { SelectOption } from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import { Column } from '../../components/ui/Table';

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
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Queries & Mutations
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
      setDeleteTarget(null);
      setActionSuccess(`Article draft "${deleteTarget.title}" deleted successfully.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete article draft.');
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
              className="font-bold text-text hover:text-gold transition-colors block text-sm"
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
      header: 'Topic',
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
            header: 'Author',
            render: (item: ArticleItem) => {
              const authorObj = typeof item.author === 'object' ? item.author : null;
              return (
                <div className="flex items-center space-x-2 text-xs">
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
                  <span className="font-medium text-text">{authorObj?.name || 'Unknown Author'}</span>
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
      header: 'Views',
      sortable: true,
      render: (item) => (
        <span className="inline-flex items-center space-x-1 text-xs font-mono font-bold text-textMuted">
          <Icon name="Eye" size={14} className="text-gold" />
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
          <div className="flex items-center space-x-2">
            <Link to={linkPath}>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Icon name={isEditable ? 'Edit' : 'Eye'} size={14} />}
              >
                {isEditable ? 'Edit' : 'View'}
              </Button>
            </Link>

            {item.status === 'draft' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-danger hover:bg-danger/10 hover:text-danger"
                onClick={() => setDeleteTarget(item)}
                title="Delete draft article"
              >
                <Icon name="Trash2" size={14} />
              </Button>
            )}
          </div>
        );
      },
    },
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
    { value: '', label: 'All Topics' },
    ...topics.map((t) => ({ value: t._id, label: t.name })),
  ];

  const authorOptions: SelectOption[] = [
    { value: '', label: 'All Authors' },
    ...teamMembers.map((m) => ({ value: m._id, label: `${m.name} (${m.email})` })),
  ];

  const modalTopicOptions: SelectOption[] = [
    { value: '', label: 'Select Topic...' },
    ...topics.map((t) => ({ value: t._id, label: t.name })),
  ];

  const modalAuthorOptions: SelectOption[] = [
    { value: '', label: 'Self (Current User)' },
    ...teamMembers.map((m) => ({ value: m._id, label: `${m.name} (${m.email})` })),
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold mb-2">
            <Icon name="FileText" size={14} />
            <span>{isSuperAdmin ? 'System Administration' : 'Author Workspace'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            {isSuperAdmin ? 'Articles Management' : 'My Articles'}
          </h1>
          <p className="text-xs sm:text-sm text-textMuted mt-1">
            {isSuperAdmin
              ? 'Central repository of all team articles. Filter, inspect review status, or create new drafts.'
              : 'Your personal workspace to write, edit, track submission status, and manage article drafts.'}
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

      {/* Action Notification Toast */}
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

      {/* Custom Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-surface border border-border p-4 rounded-xl">
        <Input
          placeholder="Search title or excerpt..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftElement={<Icon name="Search" size={16} className="text-textMuted" />}
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
        searchPlaceholder="Filter listed articles..."
      />

      {/* New Article Modal */}
      {isNewModalOpen && (
        <Modal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Create New Article Draft"
          size="md"
        >
          <form onSubmit={handleCreateArticleSubmit} className="space-y-4 font-sans">
            <p className="text-xs text-textMuted leading-relaxed">
              Enter a title and select an optional topic to initialize a new article draft. You will be redirected straight to the editor.
            </p>

            <Input
              label="Article Title"
              placeholder="e.g., Analyzing Textual Variants in Ancient Manuscripts"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              error={createError}
            />

            <Select
              label="Topic Taxonomy (Optional)"
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

            <div className="flex justify-end space-x-3 pt-3 border-t border-border">
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
                Start Writing
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
            <div className="flex items-center space-x-3 text-danger bg-danger/10 p-3 rounded-lg border border-danger/30 text-xs">
              <Icon name="AlertTriangle" size={20} className="shrink-0" />
              <span>
                This action cannot be undone. Draft article "<strong>{deleteTarget.title}</strong>" will be permanently deleted.
              </span>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
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
