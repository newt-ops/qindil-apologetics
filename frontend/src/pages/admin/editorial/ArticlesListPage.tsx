import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import {
  useArticlesAdmin,
  useDeleteArticleDraft,
} from '../../../hooks/useArticles';
import { useAdminTopics } from '../../../hooks/useTopics';
import { useTeamMembers } from '../../../hooks/useTeam';
import { useHasRole } from '../../../hooks/useHasRole';
import { useArticleProposals, useRejectArticleProposal } from '../../../hooks/useArticleProposals';
import { ArticleItem } from '../../../api/article';
import { ArticleProposalItem } from '../../../api/articleProposal';
import { DataTable } from '../../../components/admin/DataTable';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { AdminPageHeader, AdminStatCard } from '../../../components/admin';
import { useConfirm } from '../../../hooks/useConfirm';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import Select, { SelectOption } from '../../../components/ui/Select';
import Modal from '../../../components/ui/Modal';
import { Column } from '../../../components/ui/Table';
import { AdminPageSkeleton } from '../../../components/ui/Skeleton';
import { useAuthStore } from '../../../stores/authStore';
import { toast } from '../../../hooks/useToast';

export const ArticlesListPage: React.FC = () => {
  const { user } = useAuthStore();
  const isSuperAdmin = useHasRole('superAdmin');
  const { confirm, ConfirmModalElement } = useConfirm();

  // Top Section Tab
  const [mainTab, setMainTab] = useState<'articles' | 'proposals'>('articles');

  // Filter Bar State
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [topicFilter, setTopicFilter] = useState<string>('');
  const [authorFilter, setAuthorFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Proposals & Rejection State
  const { data: proposalsData, isLoading: isLoadingProposals } = useArticleProposals();
  const proposals = proposalsData?.data || [];
  const pendingProposalsCount = proposals.filter((p) => p.status === 'pending').length;

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedProposalToReject, setSelectedProposalToReject] = useState<ArticleProposalItem | null>(null);
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const rejectMutation = useRejectArticleProposal();

  // Global Unfiltered Query for Master KPIs
  const { data: globalArticlesData, isLoading: isLoadingGlobal } = useArticlesAdmin({});
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

  const deleteMutation = useDeleteArticleDraft();

  // Metrics Calculation from global collection
  const totalArticles = globalArticles.length;
  const publishedCount = globalArticles.filter((a) => a.status === 'published').length;
  const inReviewCount = globalArticles.filter((a) => a.status === 'inReview').length;
  const draftCount = globalArticles.filter(
    (a) => a.status === 'draft' || a.status === 'changesRequested'
  ).length;
  const totalReadership = globalArticles.reduce((sum, a) => sum + (a.viewCount || 0), 0);

  // Prevent flashing of 0 or default values - show skeleton until real data is loaded
  if ((isLoadingGlobal || isLoading) && !globalArticlesData && !articlesData) {
    return <AdminPageSkeleton variant="table" />;
  }

  const handleDeleteArticle = async (item: ArticleItem) => {
    const ok = await confirm({
      title: 'Delete Article Permanently',
      description: `Are you sure you want to permanently delete "${item.title}"? This action cannot be undone.`,
      confirmText: 'Delete Article',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await deleteMutation.mutateAsync(item._id);
      toast.success(`Article "${item.title}" deleted.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete article.');
    }
  };

  // Define Table Columns
  const columns: Column<ArticleItem>[] = [
    {
      key: 'title',
      header: 'Article Title & Excerpt',
      sortable: true,
      render: (item) => {
        const linkPath = isSuperAdmin
          ? (item.status === 'inReview' ? `/admin/articles/${item._id}/review` : `/admin/articles/${item._id}`)
          : `/admin/articles/${item._id}/edit`;

        return (
          <div className="space-y-0.5 min-w-[200px] max-w-md">
            <Link
              to={linkPath}
              className="font-semibold text-text hover:text-gold transition-colors block text-xs sm:text-[13px] leading-snug"
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
      width: '120px',
      render: (item) => {
        const topicName = typeof item.topic === 'object' && item.topic ? item.topic.name : '—';
        return topicName !== '—' ? (
          <Badge variant="gold" size="sm">{topicName}</Badge>
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
            width: '150px',
            render: (item: ArticleItem) => {
              const authorObj = typeof item.author === 'object' ? item.author : null;
              const lastEditedObj = typeof item.lastEditedBy === 'object' ? item.lastEditedBy : null;
              const isDifferentEditor =
                lastEditedObj && authorObj && lastEditedObj._id !== authorObj._id;

              return (
                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center space-x-1.5">
                    {authorObj?.avatarUrl ? (
                      <img
                        src={authorObj.avatarUrl}
                        alt={authorObj.name}
                        className="h-5 w-5 rounded-full border border-gold/30 object-cover shrink-0"
                      />
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/10 text-gold font-bold text-[9px] shrink-0">
                        {authorObj?.name ? authorObj.name[0].toUpperCase() : 'A'}
                      </div>
                    )}
                    <span className="font-medium text-text text-xs truncate max-w-[110px]">{authorObj?.name || 'Author'}</span>
                  </div>

                  {isDifferentEditor && (
                    <div className="text-[10px] text-gold/80 flex items-center gap-1 font-mono truncate">
                      <Icon name="Edit" size={9} className="text-gold shrink-0" />
                      <span className="truncate">by {lastEditedObj.name}</span>
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
      width: '110px',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'viewCount',
      header: 'Readership',
      sortable: true,
      width: '95px',
      render: (item) => (
        <span className="inline-flex items-center space-x-1 text-xs font-mono font-medium text-textMuted">
          <Icon name="Eye" size={12} className="text-gold" />
          <span>{item.viewCount || 0}</span>
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Last Modified',
      sortable: true,
      width: '110px',
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
      width: '120px',
      align: 'right',
      render: (item) => {
        if (isSuperAdmin) {
          const isReview = item.status === 'inReview';
          return (
            <div className="flex items-center justify-end space-x-1">
              <Link to={isReview ? `/admin/articles/${item._id}/review` : `/admin/articles/${item._id}`}>
                <Button
                  variant={isReview ? 'primary' : 'secondary'}
                  size="sm"
                  className="h-7 px-2.5 text-xs font-bold"
                  leftIcon={<Icon name="Eye" size={12} />}
                >
                  {isReview ? 'Review' : 'Inspect'}
                </Button>
              </Link>
            </div>
          );
        }

        const authorId = typeof item.author === 'object' && item.author ? item.author._id : item.author;
        const isAuthor = Boolean(user?._id && authorId && String(authorId) === String(user._id));
        const canEdit = isSuperAdmin || (isAuthor && item.status !== 'inReview');
        const canDelete = isSuperAdmin || isAuthor;

        return (
          <div className="flex items-center justify-end space-x-1">
            <Link to={`/admin/articles/${item._id}/edit`}>
              <Button
                variant={canEdit ? 'primary' : 'secondary'}
                size="sm"
                className="h-7 px-2.5 text-xs"
                leftIcon={<Icon name={canEdit ? 'Edit' : 'Eye'} size={12} />}
              >
                {canEdit ? 'Edit' : 'View'}
              </Button>
            </Link>

            {item.status === 'published' && item.slug && (
              <a
                href={`/articles/${item.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                title="View live published article"
              >
                <button
                  type="button"
                  className="p-1 rounded-md text-gold hover:text-goldHover hover:bg-gold/10 transition-colors"
                >
                  <Icon name="ExternalLink" size={13} />
                </button>
              </a>
            )}

            {canDelete && (
              <button
                type="button"
                className="p-1 rounded-md text-textMuted hover:text-danger hover:bg-danger/10 transition-colors"
                onClick={() => handleDeleteArticle(item)}
                title="Delete article permanently"
              >
                <Icon name="Trash2" size={13} />
              </button>
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
    { value: '', label: 'All Topics' },
    ...topics.map((t) => ({ value: t._id, label: t.name })),
  ];

  const authorOptions: SelectOption[] = [
    { value: '', label: 'All Authors' },
    ...teamMembers.map((m) => ({ value: m._id, label: `${m.name} (${m.email})` })),
  ];


  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProposalToReject || !rejectionFeedback.trim()) {
      toast.error('Please enter constructive feedback for the author.');
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        id: selectedProposalToReject._id,
        data: { adminFeedback: rejectionFeedback.trim() },
      });
      toast.success('Proposal declined. Author has been notified with your feedback.');
      setRejectModalOpen(false);
      setSelectedProposalToReject(null);
      setRejectionFeedback('');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || 'Failed to decline proposal.';
      toast.error(msg);
    }
  };

  const proposalColumns: Column<ArticleProposalItem>[] = [
    {
      key: 'author',
      header: 'Author / Proposer',
      width: '180px',
      render: (item) => {
        const authorObj = typeof item.author === 'object' ? item.author : null;
        return (
          <div className="flex items-center space-x-2">
            {authorObj?.avatarUrl ? (
              <img
                src={authorObj.avatarUrl}
                alt={authorObj.name}
                className="h-7 w-7 rounded-full border border-gold/30 object-cover shrink-0"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/15 text-gold font-bold text-xs shrink-0">
                {authorObj?.name ? authorObj.name[0].toUpperCase() : 'A'}
              </div>
            )}
            <div className="truncate min-w-0">
              <p className="font-semibold text-text text-xs truncate">{authorObj?.name || 'Member'}</p>
              <p className="text-[10px] text-textMuted font-mono truncate">{authorObj?.email || ''}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'title',
      header: 'Proposed Title & Thesis Scope',
      render: (item) => (
        <div className="space-y-1 max-w-md">
          <p className="font-bold text-text text-xs sm:text-[13px] leading-snug">{item.title}</p>
          <p className="text-[11px] text-textMuted line-clamp-2 leading-relaxed">{item.summary}</p>
          {item.adminFeedback && (
            <div className="rounded-md border border-danger/30 bg-danger/10 p-2 text-[11px] text-danger mt-1">
              <span className="font-bold">Decline Reason: </span>
              {item.adminFeedback}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'topic',
      header: 'Topic',
      width: '120px',
      render: (item) => {
        const topicName = typeof item.topic === 'object' && item.topic ? item.topic.name : '—';
        return topicName !== '—' ? (
          <Badge variant="gold" size="sm">{topicName}</Badge>
        ) : (
          <span className="text-xs text-textMuted">—</span>
        );
      },
    },
    {
      key: 'proposedDueDate',
      header: 'Suggested Deadline',
      width: '130px',
      render: (item) => (
        <span className="text-xs font-mono text-textMuted">
          {item.proposedDueDate
            ? new Date(item.proposedDueDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Flexible'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (item) => {
        if (item.status === 'pending') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Icon name="Clock" size={11} />
              <span>Pending</span>
            </span>
          );
        }
        if (item.status === 'approved') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Icon name="CheckCircle" size={11} />
              <span>Task Assigned</span>
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-danger/10 text-danger border border-danger/30">
            <Icon name="AlertCircle" size={11} />
            <span>Declined</span>
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '180px',
      align: 'right',
      render: (item) => {
        if (item.status === 'pending') {
          const authorId = typeof item.author === 'object' ? item.author._id : item.author;
          const topicId = typeof item.topic === 'object' ? item.topic?._id : (item.topic || '');
          const assignUrl = `/admin/tasks/assign?proposalId=${item._id}&memberId=${authorId}&title=${encodeURIComponent(
            item.title
          )}&topicId=${topicId || ''}&description=${encodeURIComponent(
            item.summary || ''
          )}&dueDate=${item.proposedDueDate || ''}`;

          return (
            <div className="flex items-center justify-end space-x-1.5">
              <Link to={assignUrl}>
                <Button
                  variant="primary"
                  size="sm"
                  className="h-7 px-2.5 text-xs bg-gold text-bg font-bold hover:bg-goldHover shadow-2xs"
                  leftIcon={<Icon name="Check" size={12} />}
                  title="Approve proposal & delegate task"
                >
                  Accept &amp; Assign
                </Button>
              </Link>
              <Button
                variant="danger"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  setSelectedProposalToReject(item);
                  setRejectModalOpen(true);
                }}
                title="Decline proposal"
              >
                Decline
              </Button>
            </div>
          );
        }

        if (item.status === 'approved') {
          const taskId = typeof item.assignedTaskId === 'object' ? item.assignedTaskId?._id : item.assignedTaskId;
          return taskId ? (
            <Link to={`/admin/tasks/${taskId}`}>
              <Button variant="secondary" size="sm" className="h-7 px-2 text-xs" leftIcon={<Icon name="ExternalLink" size={11} />}>
                View Task
              </Button>
            </Link>
          ) : (
            <span className="text-xs text-textMuted">Assigned</span>
          );
        }

        return <span className="text-xs text-textMuted">Closed</span>;
      },
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <AdminPageHeader
        title={isSuperAdmin ? 'Articles Management' : 'My Articles'}
        subtitle={
          isSuperAdmin
            ? 'Master registry of all scholarly works, peer reviews, drafts, and published papers.'
            : 'Your workspace to author, edit, track review decisions, and manage article drafts.'
        }
        actions={
          isSuperAdmin ? (
            <Link to="/admin/tasks/assign?type=article">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Icon name="Plus" size={16} />}
              >
                Assign Article Task
              </Button>
            </Link>
          ) : null
        }
      />

      {/* Main View Selector Tabs (Catalog vs Author Proposals) */}
      {isSuperAdmin && (
        <div className="flex items-center gap-3 border-b border-border/80 pb-2">
          <button
            onClick={() => setMainTab('articles')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              mainTab === 'articles'
                ? 'bg-gold text-bg shadow-xs'
                : 'text-textMuted hover:text-text hover:bg-surface'
            }`}
          >
            <Icon name="FileText" size={14} />
            <span>Catalog &amp; Articles ({totalArticles})</span>
          </button>
          <button
            onClick={() => setMainTab('proposals')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              mainTab === 'proposals'
                ? 'bg-gold text-bg shadow-xs'
                : 'text-textMuted hover:text-text hover:bg-surface'
            }`}
          >
            <Icon name="Inbox" size={14} />
            <span>Author Proposals ({proposals.length})</span>
            {pendingProposalsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-bg font-extrabold animate-pulse">
                {pendingProposalsCount} Pending
              </span>
            )}
          </button>
        </div>
      )}

      {mainTab === 'articles' ? (
        <>
          {/* Production KPI Metrics Strip (Prompt 42 density) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
            <AdminStatCard
              label="Catalog Total"
              value={totalArticles}
              helperText="Scholarly papers"
              icon="FileText"
              variant="gold"
              onClick={() => setStatusFilter('')}
            />
            <AdminStatCard
              label="Published Live"
              value={publishedCount}
              helperText="Publicly accessible"
              icon="Globe"
              variant="success"
              onClick={() => setStatusFilter('published')}
            />
            <AdminStatCard
              label="In Review"
              value={inReviewCount}
              helperText="Awaiting decision"
              icon="Inbox"
              variant="warning"
              onClick={() => setStatusFilter('inReview')}
            />
            <AdminStatCard
              label="Drafts"
              value={draftCount}
              helperText="In preparation"
              icon="Edit"
              variant="info"
              onClick={() => setStatusFilter('draft')}
            />
            <AdminStatCard
              label="Readership"
              value={totalReadership.toLocaleString()}
              helperText="Cumulative impressions"
              icon="Eye"
              variant="default"
            />
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
            selectable={isSuperAdmin}
            bulkActions={(selectedIds, clearSelection) => (
              <div className="flex items-center space-x-2">
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<Icon name="Trash2" size={13} />}
                  onClick={async () => {
                    const selectedArticles = articlesList.filter((a: ArticleItem) => selectedIds.includes(a._id));
                    const draftItems = selectedArticles.filter(
                      (a: ArticleItem) => a.status === 'draft' || a.status === 'changesRequested'
                    );
                    if (draftItems.length === 0) {
                      toast.info('Only draft articles can be bulk deleted.');
                      return;
                    }
                    const ok = await confirm({
                      title: 'Bulk Delete Drafts',
                      description: `Are you sure you want to permanently delete ${draftItems.length} draft article(s)?`,
                      confirmText: `Delete ${draftItems.length} Drafts`,
                      variant: 'danger',
                    });
                    if (!ok) return;

                    for (const item of draftItems) {
                      await deleteMutation.mutateAsync(item._id);
                    }
                    toast.success(`${draftItems.length} drafts deleted successfully.`);
                    clearSelection();
                  }}
                >
                  Delete Selected Drafts
                </Button>
              </div>
            )}
          />
        </>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-start space-x-3">
              <Icon name="Inbox" size={18} className="text-gold shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-text">Author Topic Proposals</p>
                <p className="text-textMuted text-[11px] mt-0.5 leading-relaxed">
                  Team members submit proposals with their working title, thesis, and research topic. When you click &quot;Accept &amp; Assign&quot;, you are redirected to the task delegation page to initialize their draft and notify them via Telegram.
                </p>
              </div>
            </div>
            <Link to="/admin/proposals/new">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Icon name="Plus" size={14} />}
                className="shrink-0 font-bold"
              >
                Propose Topic
              </Button>
            </Link>
          </div>

          <DataTable
            columns={proposalColumns}
            data={proposals}
            isLoading={isLoadingProposals}
            searchPlaceholder="Search proposals by title or author..."
            emptyState={
              <div className="p-8 text-center text-xs text-textMuted font-sans space-y-3">
                <p className="font-semibold text-text">No Member Proposals Found</p>
                <p className="text-[11px] text-textMuted max-w-sm mx-auto">
                  Team members submit proposals for new scholarly articles. You can also directly propose a topic yourself.
                </p>
                <Link to="/admin/proposals/new">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Icon name="Plus" size={14} />}
                  >
                    Propose Article Topic
                  </Button>
                </Link>
              </div>
            }
          />
        </div>
      )}

      {/* Decline Proposal Modal */}
      {rejectModalOpen && selectedProposalToReject && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => {
            setRejectModalOpen(false);
            setSelectedProposalToReject(null);
            setRejectionFeedback('');
          }}
          title="Decline Article Proposal"
          size="md"
        >
          <form onSubmit={handleRejectSubmit} className="space-y-4 font-sans">
            <p className="text-xs text-textMuted leading-relaxed">
              Provide feedback or context for declining &quot;{selectedProposalToReject.title}&quot;. This feedback will be sent immediately to the author via Telegram and Web notifications.
            </p>

            <Textarea
              label="Feedback &amp; Reason for Declining *"
              placeholder="e.g. A similar article has recently been published, or please narrow down the thesis scope to focus on..."
              rows={4}
              value={rejectionFeedback}
              onChange={(e) => setRejectionFeedback(e.target.value)}
              required
              autoFocus
            />

            <div className="flex justify-end space-x-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setRejectModalOpen(false);
                  setSelectedProposalToReject(null);
                  setRejectionFeedback('');
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                isLoading={rejectMutation.isPending}
                leftIcon={<Icon name="AlertCircle" size={14} />}
              >
                Decline &amp; Send Feedback
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Sensitive Confirmation Dialog */}
      {ConfirmModalElement}
    </div>
  );
};

export default ArticlesListPage;
