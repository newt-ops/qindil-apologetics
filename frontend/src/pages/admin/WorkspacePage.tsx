import React from 'react';
import { motion } from 'framer-motion';
import Icon, { IconName } from '../../components/icons/Icon';
import { useMyTasks } from '../../hooks/useTasks';
import { TaskItem, TaskType } from '../../api/task';
import { Badge, EmptyState, Spinner } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';

// Helper to format due dates nicely
function formatDueDate(dateString: string): { formatted: string; isPast: boolean } {
  const dueDate = new Date(dateString);
  const now = new Date();
  const isPast = dueDate < now;
  const formatted = dueDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return { formatted, isPast };
}

// Icon helper for task types
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
  const { formatted, isPast } = formatDueDate(task.dueDate);
  const typeIcon = getTaskTypeIcon(task.type);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'danger';
      case 'done':
        return 'success';
      case 'inProgress':
      case 'inReview':
        return 'inReview';
      case 'pending':
      default:
        return 'muted';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative flex flex-col justify-between rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
        task.isOverdue || (isPast && task.status !== 'done')
          ? 'border-danger/40 bg-danger/5 hover:border-danger/60'
          : 'border-border bg-surface hover:border-gold/40'
      }`}
    >
      <div className="space-y-2.5">
        {/* Header row: Type badge & status pill */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-textMuted uppercase tracking-wider">
            <Icon name={typeIcon} size={14} className="text-gold" />
            <span>{task.type}</span>
          </div>

          <Badge variant={getStatusVariant(task.status)}>
            {task.status === 'inProgress'
              ? 'In Progress'
              : task.status === 'inReview'
              ? 'In Review'
              : task.status}
          </Badge>
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

        {/* Linked Article or Video */}
        {task.linkedArticle && (
          <div className="inline-flex items-center space-x-1.5 rounded-md border border-border bg-bg/60 px-2.5 py-1 text-[11px] text-textMuted">
            <Icon name="FileText" size={12} className="text-gold shrink-0" />
            <span className="truncate max-w-[200px]">{task.linkedArticle.title}</span>
          </div>
        )}

        {task.linkedVideo && (
          <div className="inline-flex items-center space-x-1.5 rounded-md border border-border bg-bg/60 px-2.5 py-1 text-[11px] text-textMuted">
            <Icon name="Video" size={12} className="text-gold shrink-0" />
            <span className="truncate max-w-[200px]">{task.linkedVideo.title}</span>
          </div>
        )}
      </div>

      {/* Footer: Due date */}
      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-2 text-[11px]">
        <span className="text-textMuted">Due Date:</span>
        <span
          className={`font-semibold font-mono ${
            task.isOverdue || (isPast && task.status !== 'done')
              ? 'text-danger flex items-center gap-1 font-bold'
              : 'text-text'
          }`}
        >
          {(task.isOverdue || (isPast && task.status !== 'done')) && (
            <Icon name="AlertCircle" size={12} />
          )}
          {formatted}
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

  return (
    <div className="space-y-8 font-sans">
      {/* Workspace Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold mb-2">
            <Icon name="Folder" size={14} />
            <span>Personal Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            Assigned Operations Tasks
          </h1>
          <p className="text-xs sm:text-sm text-textMuted mt-1">
            Welcome, <span className="text-gold font-semibold">{user?.name}</span>. Here are your assigned tasks grouped by priority.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center space-x-2 rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-text hover:border-gold/40 transition"
          >
            <Icon name="Activity" size={14} />
            <span>Refresh Tasks</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-16 text-gold">
          <Spinner size="lg" />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon="CheckCircle"
          title="No tasks assigned yet"
          description="You currently have no pending or assigned operational tasks in your workspace queue."
          className="py-16"
        />
      ) : (
        <div className="space-y-10">
          {/* Section 1: Overdue Tasks (Highlighted in Red Alert Box) */}
          {overdueTasks.length > 0 && (
            <div className="rounded-xl border border-danger/40 bg-danger/5 p-5 space-y-4 shadow-lg">
              <div className="flex items-center space-x-2 border-b border-danger/30 pb-3">
                <Icon name="AlertCircle" size={20} className="text-danger" />
                <h3 className="text-base font-bold text-danger">Overdue Tasks ({overdueTasks.length})</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {overdueTasks.map((t) => (
                  <TaskCard key={t._id} task={t} />
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Due Soon (Next 7 Days) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center space-x-2">
                <Icon name="Calendar" size={18} className="text-gold" />
                <h3 className="text-base font-bold text-text">Due Soon (Next 7 Days)</h3>
              </div>
              <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-bold text-gold border border-gold/30">
                {dueSoonTasks.length}
              </span>
            </div>

            {dueSoonTasks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-surface/40 p-6 text-center text-xs text-textMuted">
                No tasks due in the next 7 days.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dueSoonTasks.map((t) => (
                  <TaskCard key={t._id} task={t} />
                ))}
              </div>
            )}
          </div>

          {/* Section 3: In Progress Tasks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center space-x-2">
                <Icon name="Activity" size={18} className="text-gold" />
                <h3 className="text-base font-bold text-text">In Progress Tasks</h3>
              </div>
              <span className="rounded-full bg-border/60 px-2.5 py-0.5 text-xs font-bold text-textMuted">
                {inProgressTasks.length}
              </span>
            </div>

            {inProgressTasks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-surface/40 p-6 text-center text-xs text-textMuted">
                No tasks currently marked as in progress.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inProgressTasks.map((t) => (
                  <TaskCard key={t._id} task={t} />
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="space-y-4 opacity-80">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center space-x-2">
                  <Icon name="CheckCircle" size={18} className="text-success" />
                  <h3 className="text-base font-bold text-text">Completed Tasks</h3>
                </div>
                <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-bold text-success border border-success/30">
                  {completedTasks.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedTasks.map((t) => (
                  <TaskCard key={t._id} task={t} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkspacePage;
