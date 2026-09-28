import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import { useMyArticles, usePublishArticle, useDeleteArticle } from '../../../hooks/useArticles';
import { useConfirm } from '../../../hooks/useConfirm';
import { useMyArticleProposals } from '../../../hooks/useArticleProposals';
import { useMyWorkStats } from '../../../hooks/useMeData';
import { ArticleItem } from '../../../api/article';
import { ArticleProposalItem } from '../../../api/articleProposal';
import { DataTable } from '../../../components/admin/DataTable';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { AdminPageHeader, AdminStatCard, AdminPageSkeleton } from '../../../components/admin';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Column } from '../../../components/ui/Table';
import { toast } from '../../../hooks/useToast';

export const MyArticlesPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: articles = [], isLoading: isArticlesLoading } = useMyArticles();
  const { data: proposals = [], isLoading: isProposalsLoading } = useMyArticleProposals();
  const { data: workStats, isLoading: isStatsLoading } = useMyWorkStats();

  const publishMutation = usePublishArticle();
  const deleteMutation = useDeleteArticle();
  const { confirm, ConfirmModalElement } = useConfirm();

  const [activeTab, setActiveTab] = useState<'articles' | 'proposals'>('articles');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [publishingId, setPublishingId] = useState<string | null>(null);

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
      toast.success('Article deleted successfully.');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || 'Failed to delete article.';
      toast.error(msg);
    }
  };

  if (isArticlesLoading && articles.length === 0) {
    return <AdminPageSkeleton variant="table" />;
  }

  // Metrics calculation
  const totalArticles = articles.length;
  const draftCount = articles.filter((a) => a.status === 'draft').length;
  const inReviewCount = articles.filter((a) => a.status === 'inReview').length;
  const changesRequestedCount = articles.filter((a) => a.status === 'changesRequested').length;
  const approvedCount = articles.filter((a) => a.status === 'approved').length;
  const publishedCount = articles.filter((a) => a.status === 'published').length;
  const totalViews = articles.reduce((sum, a) => sum + (a.viewCount || 0), 0);

  const pendingProposalsCount = proposals.filter((p) => p.status === 'pending').length;

  // Filtered articles
  const filteredArticles = articles.filter((a) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'drafts') return a.status === 'draft' || a.status === 'changesRequested';
    if (statusFilter === 'review') return a.status === 'inReview';
    if (statusFilter === 'approved') return a.status === 'approved';
    if (statusFilter === 'published') return a.status === 'published';
    return a.status === statusFilter;
  });

  const handlePublishArticle = async (articleId: string) => {
    setPublishingId(articleId);
    try {
      await publishMutation.mutateAsync(articleId);
      toast.success('🎉 Article published live to the platform!');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || 'Failed to publish article.';
      toast.error(msg);
    } finally {
      setPublishingId(null);
    }
  };

  const articleColumns: Column<ArticleItem>[] = [
    {
      key: 'title',
      header: 'Article Title & Summary',
      sortable: true,
      className: 'min-w-[180px]',
      render: (item) => (
        <div className="space-y-0.5 max-w-md">
          <Link
            to={`/admin/articles/${item._id}/edit`}
            className="font-bold text-text hover:text-gold transition-colors block text-xs sm:text-[13px] leading-snug"
          >
            {item.title}
          </Link>
          {item.excerpt && (
            <p className="text-[10.5px] text-textMuted line-clamp-1 italic font-serif">
              &quot;{item.excerpt}&quot;
            </p>
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
      key: 'status',
      header: 'Status',
      sortable: true,
      width: '130px',
      render: (item) => {
        if (item.status === 'approved') {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Icon name="CheckCircle" size={11} />
              <span>Approved</span>
            </span>
          );
        }
        return <StatusBadge status={item.status} />;
      },
    },
    {
      key: 'viewCount',
      header: 'Readership',
      sortable: true,
      width: '95px',
      render: (item) => (
        <span className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold text-textMuted">
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
      width: '180px',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end space-x-1.5">
          {item.status === 'approved' && (
            <Button
              variant="primary"
              size="sm"
              className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
              leftIcon={<Icon name="Globe" size={12} />}
              onClick={() => handlePublishArticle(item._id)}
              isLoading={publishingId === item._id}
              title="Publish live to public catalog"
            >
              Publish Live
            </Button>
          )}

          <Link to={`/admin/articles/${item._id}/edit`}>
            <Button variant="secondary" size="sm" className="h-7 px-2 text-xs" leftIcon={<Icon name="Edit" size={12} />}>
              {item.status === 'published' ? 'Edit' : 'Draft'}
            </Button>
          </Link>

          {item.status === 'published' && item.slug && (
            <Link
              to={`/articles/${item.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-lg border border-border bg-bg text-textMuted hover:text-gold hover:border-gold/40 transition shadow-xs"
              title="View published article on site"
            >
              <Icon name="ExternalLink" size={13} />
            </Link>
          )}

          <button
            type="button"
            className="p-1.5 rounded-lg border border-border bg-bg text-textMuted hover:text-danger hover:border-danger/40 transition shadow-xs"
            onClick={() => handleDeleteArticle(item)}
            title="Delete article permanently"
          >
            <Icon name="Trash2" size={13} />
          </button>
        </div>
      ),
    },
  ];

  const proposalColumns: Column<ArticleProposalItem>[] = [
    {
      key: 'title',
      header: 'Proposed Title & Scope',
      render: (item) => (
        <div className="space-y-1 max-w-md">
          <p className="font-bold text-text text-xs sm:text-[13px] leading-snug">{item.title}</p>
          <p className="text-[11px] text-textMuted line-clamp-2 leading-relaxed">{item.summary}</p>
          {item.adminFeedback && (
            <div className="rounded-md border border-danger/30 bg-danger/10 p-2 text-[11px] text-danger mt-1">
              <span className="font-bold">Super Admin Feedback: </span>
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
      header: 'Suggested Due Date',
      width: '140px',
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
      header: 'Review Decision',
      width: '150px',
      render: (item) => {
        if (item.status === 'pending') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Icon name="Clock" size={12} />
              <span>Pending Review</span>
            </span>
          );
        }
        if (item.status === 'approved') {
          const taskId = typeof item.assignedTaskId === 'object' ? item.assignedTaskId?._id : item.assignedTaskId;
          return (
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Icon name="CheckCircle" size={12} />
                <span>Task Assigned</span>
              </span>
              {taskId && (
                <div>
                  <Link
                    to={`/admin/tasks/${taskId}`}
                    className="text-[11px] text-gold hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <span>Open Task</span>
                    <Icon name="ArrowRight" size={10} />
                  </Link>
                </div>
              )}
            </div>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger/10 text-danger border border-danger/30">
            <Icon name="AlertCircle" size={12} />
            <span>Declined</span>
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      width: '110px',
      render: (item) => (
        <span className="text-xs font-mono text-textMuted">
          {new Date(item.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <AdminPageHeader
        badge="Author Workspace"
        title="My Articles & Proposals"
        subtitle="Manage peer-reviewed articles, review decisions, and propose research topics to Super Admin."
        actions={
          <Link to="/admin/proposals/new">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Icon name="Plus" size={15} />}
              className="self-start sm:self-auto shadow-md"
            >
              Propose Article Topic
            </Button>
          </Link>
        }
      />

      {/* Contribution & Output Analytics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <AdminStatCard
          label="Published Live"
          value={workStats?.articles?.published ?? publishedCount}
          helperText="Live on public catalog"
          icon="CheckCircle"
          variant="success"
          isLoading={isStatsLoading}
          onClick={() => {
            setActiveTab('articles');
            setStatusFilter('published');
          }}
        />
        <AdminStatCard
          label="Cumulative Readers"
          value={(workStats?.articles?.totalViews ?? totalViews).toLocaleString()}
          helperText="Total article views"
          icon="Eye"
          variant="gold"
          isLoading={isStatsLoading}
        />
        <AdminStatCard
          label="In Review Queue"
          value={workStats?.articles?.inReview ?? inReviewCount}
          helperText="Awaiting peer review"
          icon="Clock"
          variant="warning"
          isLoading={isStatsLoading}
          onClick={() => {
            setActiveTab('articles');
            setStatusFilter('review');
          }}
        />
        <AdminStatCard
          label="Task Reliability"
          value={`${workStats?.tasks?.completionRate ?? 100}%`}
          helperText={`${workStats?.tasks?.completed ?? 0} operational tasks completed`}
          icon="Activity"
          variant="info"
          isLoading={isStatsLoading}
          onClick={() => navigate('/admin/tasks')}
        />
      </div>

      {/* Governance Notice Banner */}
      <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={18} className="text-gold shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-text">Task-Governed Publishing Workflow</p>
            <p className="text-textMuted text-[11px] mt-0.5 leading-relaxed">
              Articles are written via delegated tasks. Propose an article topic for Super Admin approval, or accept an assigned task from your tasks dashboard. Completed drafts submit for peer review; once approved, you publish them live.
            </p>
          </div>
        </div>
        <Link to="/admin/tasks" className="shrink-0">
          <Button variant="secondary" size="sm" className="text-xs whitespace-nowrap">
            View My Tasks
          </Button>
        </Link>
      </div>

      {/* Primary Section Switcher Tabs */}
      <div className="flex items-center gap-3 border-b border-border/80 pb-2">
        <button
          onClick={() => setActiveTab('articles')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
            activeTab === 'articles'
              ? 'bg-gold text-bg shadow-xs'
              : 'text-textMuted hover:text-text hover:bg-surface'
          }`}
        >
          <Icon name="FileText" size={14} />
          <span>Articles Workspace ({totalArticles})</span>
          {approvedCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-bg font-extrabold animate-pulse">
              {approvedCount} ready to publish
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('proposals')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
            activeTab === 'proposals'
              ? 'bg-gold text-bg shadow-xs'
              : 'text-textMuted hover:text-text hover:bg-surface'
          }`}
        >
          <Icon name="Send" size={14} />
          <span>My Proposals ({proposals.length})</span>
          {pendingProposalsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-bg font-extrabold">
              {pendingProposalsCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'articles' ? (
        <div className="space-y-4">
          {/* Sub-Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-border/60 scrollbar-none">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-surface border border-gold text-gold font-bold'
                  : 'text-textMuted hover:text-text'
              }`}
            >
              All ({totalArticles})
            </button>
            <button
              onClick={() => setStatusFilter('drafts')}
              className={`px-3 py-1 rounded-md font-medium transition whitespace-nowrap ${
                statusFilter === 'drafts'
                  ? 'bg-surface border border-gold text-gold font-bold'
                  : 'text-textMuted hover:text-text'
              }`}
            >
              Drafts ({draftCount + changesRequestedCount})
            </button>
            <button
              onClick={() => setStatusFilter('review')}
              className={`px-3 py-1 rounded-md font-medium transition whitespace-nowrap ${
                statusFilter === 'review'
                  ? 'bg-surface border border-gold text-gold font-bold'
                  : 'text-textMuted hover:text-text'
              }`}
            >
              In Review ({inReviewCount})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1 rounded-md font-medium transition whitespace-nowrap ${
                statusFilter === 'approved'
                  ? 'bg-surface border border-emerald-500 text-emerald-400 font-bold'
                  : 'text-textMuted hover:text-text'
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1 rounded-md font-medium transition whitespace-nowrap ${
                statusFilter === 'published'
                  ? 'bg-surface border border-gold text-gold font-bold'
                  : 'text-textMuted hover:text-text'
              }`}
            >
              Published ({publishedCount})
            </button>
          </div>

          {/* DataTable */}
          <DataTable
            columns={articleColumns}
            data={filteredArticles}
            isLoading={isArticlesLoading}
            searchPlaceholder="Search your articles..."
            emptyState={
              <div className="p-8 text-center text-xs text-textMuted font-sans space-y-2">
                <p>No articles found in this category.</p>
                <p className="text-[11px] text-textMuted/80">
                  Accept an assigned task or submit an article proposal to start drafting.
                </p>
              </div>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          <DataTable
            columns={proposalColumns}
            data={proposals}
            isLoading={isProposalsLoading}
            searchPlaceholder="Search your proposals..."
            emptyState={
              <div className="p-8 text-center text-xs text-textMuted font-sans space-y-3">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <Icon name="FileText" size={20} />
                </div>
                <p className="font-semibold text-text">No Article Proposals Yet</p>
                <p className="text-[11px] text-textMuted max-w-sm mx-auto">
                  Have an apologetics topic or refutation idea? Submit a proposal to Super Admin. Once accepted, you&apos;ll be delegated the task to begin writing.
                </p>
                <Link to="/admin/proposals/new">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Icon name="Plus" size={14} />}
                  >
                    Propose Your First Topic
                  </Button>
                </Link>
              </div>
            }
          />
        </div>
      )}

      {ConfirmModalElement}
    </div>
  );
};

export default MyArticlesPage;
