import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon, { IconName } from '../../../components/icons/Icon';
import { useAllTasks } from '../../../hooks/useTasks';
import { useHasRole } from '../../../hooks/useHasRole';
import { TaskItem, TaskType } from '../../../api/task';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { TaskCardSkeleton } from '../../../components/ui/Skeleton';
import { StatusBadge, AdminPageHeader, AdminStatCard, AdminPageSkeleton } from '../../../components/admin';

// Helper to format due dates with relative countdown
function formatDueDate(dateString: string): {
  formatted: string;
  countdown: string;
  isPast: boolean;
  isToday: boolean;
} {
  const dueDate = new Date(dateString);
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const isPast = diffDays < 0;
  const isToday = diffDays === 0;

  let countdown = '';
  if (isPast) {
    countdown = `${Math.abs(diffDays)}d overdue`;
  } else if (isToday) {
    countdown = 'Due today';
  } else {
    countdown = `Due in ${diffDays}d`;
  }

  const formatted = dueDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return { formatted, countdown, isPast, isToday };
}

function getTaskTypeIcon(type: TaskType): IconName {
  switch (type) {
    case 'article':
      return 'FileText';
    case 'video':
      return 'Video';
    case 'general':
    default:
      return 'Folder';
  }
}

const TaskCard: React.FC<{ task: TaskItem }> = ({ task }) => {
  const navigate = useNavigate();
  const isSuperAdmin = useHasRole('superAdmin');
  const { formatted, countdown, isPast, isToday } = formatDueDate(task.dueDate);
  const typeIcon = getTaskTypeIcon(task.type);

  const isOverdue = task.isOverdue || (isPast && task.status !== 'done' && task.status !== 'approved');
  const isPending = task.status === 'pending';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(`/admin/tasks/${task._id}`)}
      className={`group relative flex flex-col justify-between rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer ${
        isPending
          ? 'border-amber-500/50 bg-amber-500/5 hover:border-amber-500/80'
          : isOverdue
          ? 'border-danger/40 bg-danger/5 hover:border-danger/60'
          : 'border-border bg-surface hover:border-gold/50'
      }`}
    >
      <div className="space-y-2.5">
        {/* Header row: Type badge & status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-textMuted uppercase tracking-wider">
            <Icon name={typeIcon} size={14} className="text-gold" />
            <span>{task.type}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            {isPending ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                Awaiting Acceptance
              </span>
            ) : isOverdue ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-danger/20 text-danger border border-danger/30 animate-pulse">
                {countdown}
              </span>
            ) : null}
            <StatusBadge status={task.status} />
          </div>
        </div>

        {/* Task Title */}
        <h4 className="text-sm font-bold text-text group-hover:text-gold transition-colors leading-snug">
          {task.title}
        </h4>

        {/* Task Description */}
        {task.description && (
          <p className="text-xs text-textMuted line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Assignees */}
        {task.assignedTo && task.assignedTo.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {task.assignedTo.map((assignee: any, idx: number) => {
              const name = typeof assignee === 'string' ? 'Team Member' : assignee.name;
              const avatar = typeof assignee === 'object' ? assignee.avatarUrl : undefined;
              return (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1 rounded-full border border-border/80 bg-bg/70 px-2 py-0.5 text-[10px] font-medium text-text shadow-2xs"
                  title={`Assigned to ${name}`}
                >
                  {avatar ? (
                    <img src={avatar} alt={name} className="h-3.5 w-3.5 rounded-full object-cover" />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full bg-gold/20 text-gold flex items-center justify-center text-[9px] font-bold">
                      {name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="truncate max-w-[100px]">{name}</span>
                </span>
              );
            })}
          </div>
        )}

        {/* Linked Artifact Badges */}
        {task.linkedArticle && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              navigate(
                task.status === 'inReview'
                  ? `/admin/articles/${task.linkedArticle!._id}/review`
                  : `/admin/articles/${task.linkedArticle!._id}/edit`
              );
            }}
            className="inline-flex items-center space-x-1.5 rounded-md border border-border bg-bg/60 px-2.5 py-1 text-[11px] text-textMuted hover:text-gold transition-colors cursor-pointer"
          >
            <Icon name="FileText" size={12} className="text-gold shrink-0" />
            <span className="truncate max-w-[200px] font-medium">{task.linkedArticle.title}</span>
          </div>
        )}

        {task.linkedVideo && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/tasks/${task._id}`);
            }}
            className="inline-flex items-center space-x-1.5 rounded-md border border-border bg-bg/60 px-2.5 py-1 text-[11px] text-textMuted hover:text-gold transition-colors cursor-pointer"
          >
            <Icon name="Video" size={12} className="text-gold shrink-0" />
            <span className="truncate max-w-[200px] font-medium">{task.linkedVideo.title}</span>
          </div>
        )}
      </div>

      {/* Footer: Due date & Action Link */}
      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]">
        <div className="flex items-center space-x-1.5">
          <span className="text-textMuted">Due:</span>
          <span
            className={`font-semibold font-mono ${
              isOverdue
                ? 'text-danger font-bold'
                : isToday
                ? 'text-amber-500 font-bold'
                : 'text-text'
            }`}
          >
            {formatted}
          </span>
        </div>

        <span
          className={`inline-flex items-center space-x-1 font-semibold group-hover:translate-x-0.5 transition-transform text-xs ${
            isPending ? 'text-amber-400' : 'text-gold'
          }`}
        >
          <span>{isPending ? (isSuperAdmin ? 'Inspect Delegation' : 'Review & Accept') : 'Open'}</span>
          <Icon name="ArrowRight" size={13} />
        </span>
      </div>
    </motion.div>
  );
};

export const WorkspacePage: React.FC = () => {
  const isSuperAdmin = useHasRole('superAdmin');

  // Load tasks (backend scopes to user's assigned tasks if non-superadmin, or all if superadmin)
  const { data: allTasksData, isLoading, refetch } = useAllTasks({ limit: 100 });

  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'inProgress' | 'inReview' | 'approved' | 'overdue' | 'done'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  // Guard against flashing 0s - show skeleton until tasks load
  if (isLoading && !allTasksData) {
    return <AdminPageSkeleton variant="cards" />;
  }

  const allTeamTasks: TaskItem[] = allTasksData?.data || [];
  const baseTasks = allTeamTasks;

  const now = new Date();
  const pendingTasks = baseTasks.filter((t) => t.status === 'pending');
  const overdueTasks = baseTasks.filter(
    (t) => (t.isOverdue || new Date(t.dueDate) < now) && t.status !== 'done' && t.status !== 'approved'
  );
  const inProgressTasks = baseTasks.filter((t) => t.status === 'inProgress');
  const inReviewTasks = baseTasks.filter((t) => t.status === 'inReview');
  const approvedTasks = baseTasks.filter((t) => t.status === 'approved');
  const completedTasks = baseTasks.filter((t) => t.status === 'done');

  // Filtered tasks based on active tab
  const getDisplayedTasks = () => {
    switch (filterTab) {
      case 'pending':
        return pendingTasks;
      case 'overdue':
        return overdueTasks;
      case 'inProgress':
        return inProgressTasks;
      case 'inReview':
        return inReviewTasks;
      case 'approved':
        return approvedTasks;
      case 'done':
        return completedTasks;
      case 'all':
      default:
        return baseTasks;
    }
  };

  const displayedTasks = getDisplayedTasks();
  const totalTasks = displayedTasks.length;
  const totalPages = Math.max(1, Math.ceil(totalTasks / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalTasks);
  const paginatedTasks = displayedTasks.slice(startIndex, endIndex);

  const handleTabChange = (tab: 'all' | 'pending' | 'inProgress' | 'inReview' | 'approved' | 'overdue' | 'done') => {
    setFilterTab(tab);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Generate smart page numbers array
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safePage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (safePage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages];
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Workspace Header */}
      <AdminPageHeader
        title={isSuperAdmin ? 'Team Operational Workspace' : 'My Assigned Workspace'}
        description={
          isSuperAdmin
            ? 'Collaborative operational workspace for team task tracking, assignment status, and project delivery.'
            : 'Track your assigned research articles, video production milestones, and pending tasks.'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => refetch()}
              leftIcon={<Icon name="RefreshCw" size={14} />}
            >
              Refresh
            </Button>

            {!isSuperAdmin && (
              <Link to="/admin/proposals/new">
                <Button variant="primary" size="sm" leftIcon={<Icon name="Plus" size={14} />}>
                  Propose Topic
                </Button>
              </Link>
            )}

            {isSuperAdmin && (
              <Link to="/admin/tasks/assign">
                <Button variant="primary" size="sm" leftIcon={<Icon name="Plus" size={14} />}>
                  Assign Task
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Action Required Banner for Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Icon name="Clock" size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text flex items-center gap-2">
                  <span>Action Required: {pendingTasks.length} Task{pendingTasks.length > 1 ? 's' : ''} Awaiting Acceptance</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                    Pending
                  </span>
                </h4>
                <p className="text-xs text-textMuted mt-0.5">
                  Assigned tasks must be accepted before content drafting can begin. Accepting an article task automatically initializes your draft.
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleTabChange('pending')}
              leftIcon={<Icon name="Eye" size={14} />}
              className="shrink-0"
            >
              View Pending ({pendingTasks.length})
            </Button>
          </div>
        </div>
      )}

      {/* Production KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        <AdminStatCard
          label="Total Tasks"
          value={baseTasks.length}
          helperText={isSuperAdmin ? 'Team assignments' : 'Your assignments'}
          icon="Folder"
          variant="gold"
          onClick={() => handleTabChange('all')}
        />

        <AdminStatCard
          label="Pending Acceptance"
          value={pendingTasks.length}
          helperText={pendingTasks.length > 0 ? 'Awaiting start' : 'Queue clear'}
          icon="Clock"
          variant={pendingTasks.length > 0 ? 'warning' : 'default'}
          onClick={() => handleTabChange('pending')}
        />

        <AdminStatCard
          label="In Progress"
          value={inProgressTasks.length}
          helperText="Active execution"
          icon="Activity"
          variant="default"
          onClick={() => handleTabChange('inProgress')}
        />

        <AdminStatCard
          label="In Review"
          value={inReviewTasks.length}
          helperText="Awaiting approval"
          icon="Eye"
          variant="warning"
          onClick={() => handleTabChange('inReview')}
        />

        <AdminStatCard
          label="Approved"
          value={approvedTasks.length}
          helperText="Ready to publish"
          icon="CheckCircle"
          variant="gold"
          onClick={() => handleTabChange('approved')}
        />

        <AdminStatCard
          label="Overdue"
          value={overdueTasks.length}
          helperText={overdueTasks.length > 0 ? 'Immediate action' : 'All on track'}
          icon="AlertCircle"
          variant={overdueTasks.length > 0 ? 'danger' : 'default'}
          onClick={() => handleTabChange('overdue')}
        />
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/80 text-xs">
        <button
          onClick={() => handleTabChange('all')}
          className={`inline-flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-all ${
            filterTab === 'all'
              ? 'bg-gold text-bg font-bold shadow-sm'
              : 'text-textMuted hover:bg-surface hover:text-text'
          }`}
        >
          <span>All Tasks</span>
          <span className="rounded-full px-1.5 py-0.2 text-[10px] font-mono bg-surface border border-border">
            {baseTasks.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('pending')}
          className={`inline-flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-all ${
            filterTab === 'pending'
              ? 'bg-amber-500 text-bg font-bold shadow-sm'
              : 'text-textMuted hover:bg-surface hover:text-text'
          }`}
        >
          <span>Pending Acceptance</span>
          <span className="rounded-full px-1.5 py-0.2 text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {pendingTasks.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('inProgress')}
          className={`inline-flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-all ${
            filterTab === 'inProgress'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-textMuted hover:bg-surface hover:text-text'
          }`}
        >
          <span>In Progress</span>
          <span className="rounded-full px-1.5 py-0.2 text-[10px] font-mono bg-blue-500/20 text-blue-400">
            {inProgressTasks.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('inReview')}
          className={`inline-flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-all ${
            filterTab === 'inReview'
              ? 'bg-amber-500 text-bg font-bold shadow-sm'
              : 'text-textMuted hover:bg-surface hover:text-text'
          }`}
        >
          <span>In Review</span>
          <span className="rounded-full px-1.5 py-0.2 text-[10px] font-mono bg-amber-500/20 text-amber-500">
            {inReviewTasks.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('approved')}
          className={`inline-flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-all ${
            filterTab === 'approved'
              ? 'bg-emerald-600 text-white font-bold shadow-sm'
              : 'text-textMuted hover:bg-surface hover:text-text'
          }`}
        >
          <span>Approved</span>
          <span className="rounded-full px-1.5 py-0.2 text-[10px] font-mono bg-emerald-500/20 text-emerald-400">
            {approvedTasks.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('overdue')}
          className={`inline-flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-all ${
            filterTab === 'overdue'
              ? 'bg-danger text-white font-bold shadow-sm'
              : 'text-textMuted hover:bg-surface hover:text-text'
          }`}
        >
          <span>Overdue</span>
          <span className="rounded-full px-1.5 py-0.2 text-[10px] font-mono bg-danger/20 text-danger border border-danger/30">
            {overdueTasks.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('done')}
          className={`inline-flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-all ${
            filterTab === 'done'
              ? 'bg-emerald-600 text-white font-bold shadow-sm'
              : 'text-textMuted hover:bg-surface hover:text-text'
          }`}
        >
          <span>Completed</span>
          <span className="rounded-full px-1.5 py-0.2 text-[10px] font-mono bg-emerald-500/20 text-emerald-500">
            {completedTasks.length}
          </span>
        </button>
      </div>

      {/* Task Cards Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <TaskCardSkeleton key={i} />
          ))}
        </div>
      ) : displayedTasks.length === 0 ? (
        <EmptyState
          icon="CheckCircle"
          title={
            filterTab === 'all'
              ? 'No tasks in this workspace'
              : `No ${filterTab} tasks found`
          }
          description="No team tasks matching the selected filter category."
          className="py-16"
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedTasks.map((t) => (
              <TaskCard key={t._id} task={t} />
            ))}
          </div>

          {/* Bottom Pagination & Page Navigation Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/70 pt-4 text-xs text-textMuted">
            {/* Left: Summary & Page Size selector */}
            <div className="flex items-center flex-wrap gap-3">
              <div>
                Showing <span className="font-bold text-text">{startIndex + 1}</span>–
                <span className="font-bold text-text">{endIndex}</span> of{' '}
                <span className="font-bold text-text">{totalTasks}</span> tasks
              </div>

              {totalTasks > 9 && (
                <div className="flex items-center space-x-1.5 pl-3 border-l border-border/60">
                  <span className="text-[11px]">Show:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="bg-surface border border-border/80 rounded-lg px-2 py-1 text-xs text-text outline-none focus:border-gold/50 cursor-pointer"
                  >
                    {[9, 18, 27, 36].map((size) => (
                      <option key={size} value={size}>
                        {size} per page
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Right: Page Navigation Buttons */}
            {totalPages > 1 && (
              <div className="flex items-center space-x-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  leftIcon={<Icon name="ChevronLeft" size={14} />}
                  className="px-2.5 py-1 text-xs"
                >
                  Prev
                </Button>

                <div className="flex items-center space-x-1">
                  {getPageNumbers().map((num, idx) =>
                    num === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-1 text-textMuted select-none">
                        …
                      </span>
                    ) : (
                      <button
                        key={`page-${num}`}
                        onClick={() => setCurrentPage(Number(num))}
                        className={`h-7 min-w-[28px] px-2 rounded-lg text-xs font-semibold transition-all ${
                          safePage === num
                            ? 'bg-gold text-bg shadow-sm font-bold'
                            : 'bg-surface border border-border/80 text-textMuted hover:text-text hover:border-gold/40'
                        }`}
                      >
                        {num}
                      </button>
                    )
                  )}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  rightIcon={<Icon name="ChevronRight" size={14} />}
                  className="px-2.5 py-1 text-xs"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspacePage;
