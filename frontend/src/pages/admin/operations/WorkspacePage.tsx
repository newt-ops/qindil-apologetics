import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon, { IconName } from '../../../components/icons/Icon';
import { useMyTasks } from '../../../hooks/useTasks';
import { TaskItem, TaskType } from '../../../api/task';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { useAuthStore } from '../../../stores/authStore';

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
  const { formatted, countdown, isPast, isToday } = formatDueDate(task.dueDate);
  const typeIcon = getTaskTypeIcon(task.type);

  const isOverdue = task.isOverdue || (isPast && task.status !== 'done');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(`/admin/tasks/${task._id}`)}
      className={`group relative flex flex-col justify-between rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer ${
        isOverdue
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
            {isOverdue && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-danger/20 text-danger border border-danger/30 animate-pulse">
                {countdown}
              </span>
            )}
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

        {/* Linked Resources */}
        {task.linkedArticle && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              const articleId = task.linkedArticle?._id;
              if (articleId) {
                navigate(`/admin/articles/${articleId}/edit`);
              }
            }}
            className="inline-flex items-center space-x-1.5 rounded-md border border-gold/30 bg-gold/5 px-2.5 py-1 text-[11px] text-gold hover:bg-gold/15 transition-colors cursor-pointer"
            title="Open linked article in editor"
          >
            <Icon name="FileText" size={12} className="shrink-0" />
            <span className="truncate max-w-[200px] font-medium">{task.linkedArticle.title}</span>
            <Icon name="ExternalLink" size={10} className="shrink-0 opacity-70" />
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

        <span className="inline-flex items-center space-x-1 text-gold font-semibold group-hover:translate-x-0.5 transition-transform text-xs">
          <span>Open</span>
          <Icon name="ArrowRight" size={13} />
        </span>
      </div>
    </motion.div>
  );
};

export const WorkspacePage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const {
    tasks,
    overdueTasks,
    dueSoonTasks,
    inProgressTasks,
    completedTasks,
    isLoading,
    refetch,
  } = useMyTasks();

  const [filterTab, setFilterTab] = useState<'all' | 'overdue' | 'dueSoon' | 'inProgress' | 'done'>('all');

  // Filtered tasks based on active tab
  const getDisplayedTasks = () => {
    switch (filterTab) {
      case 'overdue':
        return overdueTasks;
      case 'dueSoon':
        return dueSoonTasks;
      case 'inProgress':
        return inProgressTasks;
      case 'done':
        return completedTasks;
      case 'all':
      default:
        return tasks;
    }
  };

  const displayedTasks = getDisplayedTasks();

  return (
    <div className="space-y-6 font-sans">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold mb-2">
            <Icon name="Folder" size={14} />
            <span>Personal Operations Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            Assigned Operations Tasks
          </h1>
          <p className="text-xs sm:text-sm text-textMuted mt-1">
            Welcome, <span className="text-gold font-semibold">{user?.name}</span>. Track your active task assignments, deadlines, and workflow drafts.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<Icon name="RefreshCw" size={14} />}
          >
            Refresh
          </Button>

          <Link to="/admin/articles/mine">
            <Button variant="primary" size="sm" leftIcon={<Icon name="FileText" size={14} />}>
              My Drafts
            </Button>
          </Link>
        </div>
      </div>

      {/* Production KPI Metrics Strip (Prompt 42 density) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Assigned */}
        <div
          onClick={() => setFilterTab('all')}
          className={`rounded-xl border p-3.5 sm:p-4 shadow-sm cursor-pointer transition-all ${
            filterTab === 'all'
              ? 'border-gold bg-gold/10 shadow-md'
              : 'border-border bg-surface hover:border-gold/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              Assigned Tasks
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/10 text-gold">
              <Icon name="Folder" size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-text">
            {tasks.length}
          </div>
          <div className="mt-0.5 text-[10px] text-textMuted">Total in your queue</div>
        </div>

        {/* Overdue */}
        <div
          onClick={() => setFilterTab('overdue')}
          className={`rounded-xl border p-3.5 sm:p-4 shadow-sm cursor-pointer transition-all ${
            filterTab === 'overdue'
              ? 'border-danger bg-danger/10 shadow-md'
              : 'border-border bg-surface hover:border-danger/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              Overdue
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-danger/10 text-danger">
              <Icon name="AlertCircle" size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-danger">
            {overdueTasks.length}
          </div>
          <div className="mt-0.5 text-[10px] text-danger/80 font-medium">Requires immediate action</div>
        </div>

        {/* Due Soon (7d) */}
        <div
          onClick={() => setFilterTab('dueSoon')}
          className={`rounded-xl border p-3.5 sm:p-4 shadow-sm cursor-pointer transition-all ${
            filterTab === 'dueSoon'
              ? 'border-amber-500 bg-amber-500/10 shadow-md'
              : 'border-border bg-surface hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              Due Soon (7d)
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Icon name="Calendar" size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-amber-500">
            {dueSoonTasks.length}
          </div>
          <div className="mt-0.5 text-[10px] text-amber-500/80 font-medium">Upcoming deadlines</div>
        </div>

        {/* In Progress */}
        <div
          onClick={() => setFilterTab('inProgress')}
          className={`rounded-xl border p-3.5 sm:p-4 shadow-sm cursor-pointer transition-all ${
            filterTab === 'inProgress'
              ? 'border-blue-500 bg-blue-500/10 shadow-md'
              : 'border-border bg-surface hover:border-blue-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              In Progress
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Icon name="Activity" size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-blue-400">
            {inProgressTasks.length}
          </div>
          <div className="mt-0.5 text-[10px] text-textMuted">Active assignments</div>
        </div>
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/80 text-xs">
        <button
          onClick={() => setFilterTab('all')}
          className={`inline-flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-all ${
            filterTab === 'all'
              ? 'bg-gold text-bg font-bold shadow-sm'
              : 'text-textMuted hover:bg-surface hover:text-text'
          }`}
        >
          <span>All Tasks</span>
          <span className="rounded-full px-1.5 py-0.2 text-[10px] font-mono bg-surface border border-border">
            {tasks.length}
          </span>
        </button>

        <button
          onClick={() => setFilterTab('overdue')}
          className={`inline-flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-all ${
            filterTab === 'overdue'
              ? 'bg-danger text-white font-bold shadow-sm'
              : 'text-textMuted hover:bg-surface hover:text-text'
          }`}
        >
          <span>Overdue</span>
          <span className="rounded-full px-1.5 py-0.2 text-[10px] font-mono bg-danger/20 text-danger">
            {overdueTasks.length}
          </span>
        </button>

        <button
          onClick={() => setFilterTab('dueSoon')}
          className={`inline-flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-all ${
            filterTab === 'dueSoon'
              ? 'bg-amber-500 text-bg font-bold shadow-sm'
              : 'text-textMuted hover:bg-surface hover:text-text'
          }`}
        >
          <span>Due Soon</span>
          <span className="rounded-full px-1.5 py-0.2 text-[10px] font-mono bg-amber-500/20 text-amber-500">
            {dueSoonTasks.length}
          </span>
        </button>

        <button
          onClick={() => setFilterTab('inProgress')}
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
          onClick={() => setFilterTab('done')}
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
        <div className="flex items-center justify-center p-16 text-gold">
          <Spinner size="lg" />
        </div>
      ) : displayedTasks.length === 0 ? (
        <EmptyState
          icon="CheckCircle"
          title={
            filterTab === 'all'
              ? 'No tasks assigned yet'
              : `No ${filterTab} tasks found`
          }
          description="Your workspace queue is clear for this filter category."
          className="py-16"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedTasks.map((t) => (
            <TaskCard key={t._id} task={t} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkspacePage;
