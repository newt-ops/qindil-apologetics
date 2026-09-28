import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import { useMyTasks, useAcceptTask } from '../../../hooks/useTasks';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { AdminPageSkeleton } from '../../../components/ui/Skeleton';
import { toast } from '../../../hooks/useToast';

function formatCountdown(dateString: string): { text: string; isPast: boolean; isToday: boolean } {
  const dueDate = new Date(dateString);
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `${Math.abs(diffDays)}d overdue`, isPast: true, isToday: false };
  } else if (diffDays === 0) {
    return { text: 'Due today', isPast: false, isToday: true };
  } else {
    return { text: `Due in ${diffDays}d`, isPast: false, isToday: false };
  }
}

export const MyTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { tasks = [], isLoading, refetch } = useMyTasks();
  const acceptTaskMutation = useAcceptTask();

  // Filters state
  const [typeFilter, setTypeFilter] = useState<'all' | 'article' | 'video'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'dueSoon' | 'newest' | 'oldest'>('dueSoon');

  // Stats calculation
  const totalTasks = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const articleTasksCount = tasks.filter((t) => t.type === 'article').length;
  const videoTasksCount = tasks.filter((t) => t.type === 'video').length;
  const inProgressCount = tasks.filter((t) => t.status === 'inProgress').length;
  const inReviewCount = tasks.filter((t) => t.status === 'inReview').length;
  const approvedCount = tasks.filter((t) => t.status === 'approved').length;
  const overdueCount = tasks.filter((t) => {
    const isPast = new Date(t.dueDate) < new Date() && t.status !== 'done' && t.status !== 'approved';
    return Boolean(t.isOverdue || isPast);
  }).length;
  const completedCount = tasks.filter((t) => t.status === 'done').length;

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Type filter
        if (typeFilter !== 'all' && task.type !== typeFilter) {
          return false;
        }

        // Status filter
        if (statusFilter === 'pending' && task.status !== 'pending') return false;
        if (statusFilter === 'inProgress' && task.status !== 'inProgress') return false;
        if (statusFilter === 'inReview' && task.status !== 'inReview') return false;
        if (statusFilter === 'approved' && task.status !== 'approved') return false;
        if (statusFilter === 'done' && task.status !== 'done') return false;
        if (statusFilter === 'overdue') {
          const isPast = new Date(task.dueDate) < new Date() && task.status !== 'done' && task.status !== 'approved';
          if (!task.isOverdue && !isPast) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchTitle = task.title?.toLowerCase().includes(query);
          const matchDesc = task.description?.toLowerCase().includes(query);
          const matchArticle = task.linkedArticle?.title?.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc && !matchArticle) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        // dueSoon (nearest deadline first)
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [tasks, typeFilter, statusFilter, searchQuery, sortBy]);

  const handleAcceptTask = async (taskId: string) => {
    try {
      const res = await acceptTaskMutation.mutateAsync(taskId);
      toast.success('Task accepted! Writing draft initialized.');
      if (res?.data?.linkedArticle?._id) {
        navigate(`/admin/articles/${res.data.linkedArticle._id}/edit`);
      } else {
        refetch();
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Failed to accept task.';
      toast.error(msg);
    }
  };

  if (isLoading && tasks.length === 0) {
    return <AdminPageSkeleton variant="table" />;
  }

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight">
              My Assigned Tasks
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-gold/15 text-gold border border-gold/30">
              {totalTasks} Total
            </span>
          </div>
          <p className="text-xs text-textMuted mt-1">
            Track, execute, and deliver your assigned scholarly article manuscripts and video productions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<Icon name="RefreshCw" size={13} />}
          >
            Refresh
          </Button>
          <Link to="/admin/articles">
            <Button variant="ghost" size="sm" leftIcon={<Icon name="FileText" size={14} />}>
              My Articles
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        {/* Total Tasks */}
        <div
          onClick={() => {
            setTypeFilter('all');
            setStatusFilter('all');
          }}
          className={`rounded-2xl border p-4 transition-all cursor-pointer ${
            typeFilter === 'all' && statusFilter === 'all'
              ? 'border-gold bg-gold/10 shadow-sm'
              : 'border-border bg-surface hover:border-gold/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted font-mono">
              All Tasks
            </span>
            <Icon name="CheckSquare" size={15} className="text-gold" />
          </div>
          <p className="text-2xl font-black text-text mt-2 font-mono">{totalTasks}</p>
        </div>

        {/* Article Tasks */}
        <div
          onClick={() => setTypeFilter((prev) => (prev === 'article' ? 'all' : 'article'))}
          className={`rounded-2xl border p-4 transition-all cursor-pointer ${
            typeFilter === 'article'
              ? 'border-gold bg-gold/10 shadow-sm'
              : 'border-border bg-surface hover:border-gold/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted font-mono">
              Articles
            </span>
            <Icon name="FileText" size={15} className="text-gold" />
          </div>
          <p className="text-2xl font-black text-text mt-2 font-mono">{articleTasksCount}</p>
        </div>

        {/* Video Tasks */}
        <div
          onClick={() => setTypeFilter((prev) => (prev === 'video' ? 'all' : 'video'))}
          className={`rounded-2xl border p-4 transition-all cursor-pointer ${
            typeFilter === 'video'
              ? 'border-indigo-500 bg-indigo-500/10 shadow-sm'
              : 'border-border bg-surface hover:border-indigo-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted font-mono">
              Videos
            </span>
            <Icon name="Video" size={15} className="text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-indigo-400 mt-2 font-mono">{videoTasksCount}</p>
        </div>

        {/* In Progress */}
        <div
          onClick={() => setStatusFilter((prev) => (prev === 'inProgress' ? 'all' : 'inProgress'))}
          className={`rounded-2xl border p-4 transition-all cursor-pointer ${
            statusFilter === 'inProgress'
              ? 'border-blue-500 bg-blue-500/10 shadow-sm'
              : 'border-border bg-surface hover:border-blue-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted font-mono">
              In Progress
            </span>
            <Icon name="Clock" size={15} className="text-blue-400" />
          </div>
          <p className="text-2xl font-black text-blue-400 mt-2 font-mono">{inProgressCount}</p>
        </div>

        {/* In Review */}
        <div
          onClick={() => setStatusFilter((prev) => (prev === 'inReview' ? 'all' : 'inReview'))}
          className={`rounded-2xl border p-4 transition-all cursor-pointer ${
            statusFilter === 'inReview'
              ? 'border-amber-500 bg-amber-500/10 shadow-sm'
              : 'border-border bg-surface hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted font-mono">
              In Review
            </span>
            <Icon name="Eye" size={15} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2 font-mono">{inReviewCount}</p>
        </div>

        {/* Approved */}
        <div
          onClick={() => setStatusFilter((prev) => (prev === 'approved' ? 'all' : 'approved'))}
          className={`rounded-2xl border p-4 transition-all cursor-pointer ${
            statusFilter === 'approved'
              ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
              : 'border-border bg-surface hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted font-mono">
              Approved
            </span>
            <Icon name="CheckCircle" size={15} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2 font-mono">{approvedCount}</p>
        </div>

        {/* Overdue */}
        <div
          onClick={() => setStatusFilter((prev) => (prev === 'overdue' ? 'all' : 'overdue'))}
          className={`rounded-2xl border p-4 transition-all cursor-pointer ${
            statusFilter === 'overdue'
              ? 'border-danger bg-danger/10 shadow-sm'
              : 'border-border bg-surface hover:border-danger/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted font-mono">
              Overdue
            </span>
            <Icon name="AlertTriangle" size={15} className={overdueCount > 0 ? 'text-danger animate-pulse' : 'text-textMuted'} />
          </div>
          <p className={`text-2xl font-black mt-2 font-mono ${overdueCount > 0 ? 'text-danger' : 'text-text'}`}>
            {overdueCount}
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-border bg-surface p-4 space-y-4 shadow-sm">
        {/* Row 1: Type Switcher & Search & Sort */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Type Toggle Tabs */}
          <div className="inline-flex rounded-xl border border-border bg-bg p-1 self-start">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                typeFilter === 'all'
                  ? 'bg-gold text-bg shadow-sm'
                  : 'text-textMuted hover:text-text'
              }`}
            >
              All Types ({totalTasks})
            </button>
            <button
              onClick={() => setTypeFilter('article')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                typeFilter === 'article'
                  ? 'bg-gold text-bg shadow-sm'
                  : 'text-textMuted hover:text-text'
              }`}
            >
              <Icon name="FileText" size={13} />
              <span>Articles ({articleTasksCount})</span>
            </button>
            <button
              onClick={() => setTypeFilter('video')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                typeFilter === 'video'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-textMuted hover:text-text'
              }`}
            >
              <Icon name="Video" size={13} />
              <span>Videos ({videoTasksCount})</span>
            </button>
          </div>

          {/* Search & Sort */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Input
                placeholder="Search tasks or articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftElement={<Icon name="Search" size={14} className="text-textMuted" />}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-textMuted hover:text-text"
                >
                  <Icon name="X" size={13} />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text focus:border-gold focus:outline-none"
            >
              <option value="dueSoon">Deadline: Urgent First</option>
              <option value="newest">Assigned: Newest First</option>
              <option value="oldest">Assigned: Oldest First</option>
            </select>
          </div>
        </div>

        {/* Row 2: Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted mr-1">
            Status:
          </span>
          {[
            { id: 'all', label: `All Statuses (${totalTasks})` },
            { id: 'pending', label: `Pending Acceptance (${pendingCount})` },
            { id: 'inProgress', label: `In Progress (${inProgressCount})` },
            { id: 'inReview', label: `In Review (${inReviewCount})` },
            { id: 'approved', label: `Approved (${approvedCount})` },
            { id: 'done', label: `Completed (${completedCount})` },
            { id: 'overdue', label: `Overdue (${overdueCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                statusFilter === tab.id
                  ? 'bg-gold/20 text-gold border border-gold/40 font-bold'
                  : 'bg-bg/60 text-textMuted hover:bg-bg hover:text-text border border-border/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
          {(typeFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setTypeFilter('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="text-xs text-gold hover:underline ml-auto font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Task List / Cards */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 text-gold">
            <Icon name="CheckSquare" size={26} />
          </div>
          <h3 className="text-base font-bold text-text">No Tasks Found</h3>
          <p className="text-xs text-textMuted max-w-md mx-auto">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'No tasks match your current filter criteria. Try resetting your search or filter tags.'
              : 'You currently have no tasks assigned to you. When leadership delegates research or video tasks, they will appear here.'}
          </p>
          {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setTypeFilter('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
            >
              Clear All Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
            const countdown = formatCountdown(task.dueDate);
            const isOverdue = task.isOverdue || (countdown.isPast && task.status !== 'done');
            const isArticle = task.type === 'article';
            const isVideo = task.type === 'video';

            return (
              <div
                key={task._id}
                className="rounded-2xl border border-border bg-surface hover:border-gold/40 transition-all p-5 shadow-sm flex flex-col justify-between space-y-4"
              >
                {/* Top Row: Type Badge + Status + Countdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      {isArticle ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gold/15 text-gold border border-gold/30">
                          <Icon name="BookOpen" size={12} />
                          Article
                        </span>
                      ) : isVideo ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                          <Icon name="Video" size={12} />
                          Video
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-surface border border-border text-textMuted">
                          <Icon name="CheckSquare" size={12} />
                          General
                        </span>
                      )}

                      <StatusBadge status={task.status} size="sm" />
                    </div>

                    {/* Countdown Pill */}
                    <div
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono ${
                        isOverdue
                          ? 'bg-danger/15 text-danger border border-danger/30 font-bold animate-pulse'
                          : countdown.isToday
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold'
                          : 'bg-bg/80 text-textMuted border border-border'
                      }`}
                    >
                      <Icon name="Clock" size={11} />
                      <span>{countdown.text}</span>
                    </div>
                  </div>

                  {/* Task Title */}
                  <Link
                    to={`/admin/tasks/${task._id}`}
                    className="block group"
                  >
                    <h3 className="text-base font-bold text-text group-hover:text-gold transition-colors leading-snug line-clamp-1">
                      {task.title}
                    </h3>
                  </Link>

                  {/* Task Description */}
                  {task.description && (
                    <p className="text-xs text-textMuted line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Linked Content Card */}
                {isArticle && task.linkedArticle && (
                  <div className="rounded-xl border border-border/80 bg-bg/50 p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      {task.linkedArticle.coverImageUrl ? (
                        <img
                          src={task.linkedArticle.coverImageUrl}
                          alt={task.linkedArticle.title}
                          className="h-10 w-10 rounded-lg object-cover border border-gold/30 shrink-0"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold shrink-0">
                          <Icon name="FileText" size={18} />
                        </div>
                      )}
                      <div className="truncate">
                        <p className="text-xs font-semibold text-text truncate">
                          {task.linkedArticle.title}
                        </p>
                        <p className="text-[10px] text-textMuted font-mono">
                          Article Status: {task.linkedArticle.status}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={task.linkedArticle.status} size="sm" />
                  </div>
                )}

                {isVideo && (
                  <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 space-y-1.5 text-xs text-textMuted">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-indigo-300">
                        {task.videoType === 'refutation' ? 'Refutation Production' : 'Standard Video'}
                      </span>
                      <span className="text-[10px] font-mono text-textMuted">
                        {task.destination === 'official' ? 'Official Channel' : 'Personal Platform'}
                      </span>
                    </div>
                    {task.targetVideoUrl && (
                      <a
                        href={task.targetVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-gold hover:underline truncate max-w-full"
                      >
                        <Icon name="ExternalLink" size={11} />
                        <span className="truncate">Refuting: {task.targetVideoUrl}</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Footer: Date & Direct Actions */}
                <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-textMuted">
                    Deadline: {new Date(task.dueDate).toLocaleDateString()}
                  </span>

                  <div className="flex items-center space-x-2">
                    {/* Role / Type Specific Action Button */}
                    {isArticle ? (
                      task.status === 'pending' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAcceptTask(task._id)}
                          isLoading={acceptTaskMutation.isPending}
                          leftIcon={<Icon name="CheckCircle" size={13} />}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                        >
                          Accept Task
                        </Button>
                      ) : task.status === 'inProgress' && task.linkedArticle ? (
                        <Link to={`/admin/articles/${task.linkedArticle._id}/edit`}>
                          <Button
                            variant="primary"
                            size="sm"
                            rightIcon={<Icon name="ArrowRight" size={12} />}
                            className="bg-gold hover:bg-goldHover text-bg font-bold text-xs"
                          >
                            Continue Writing
                          </Button>
                        </Link>
                      ) : task.status === 'inReview' && task.linkedArticle ? (
                        <Link to={`/admin/articles/${task.linkedArticle._id}/edit`}>
                          <Button variant="secondary" size="sm" leftIcon={<Icon name="Eye" size={12} />} className="text-xs">
                            View Draft
                          </Button>
                        </Link>
                      ) : task.status === 'approved' && task.linkedArticle ? (
                        <Link to={`/admin/articles/${task.linkedArticle._id}/edit`}>
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<Icon name="Globe" size={12} />}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                          >
                            Publish Live
                          </Button>
                        </Link>
                      ) : task.status === 'done' && task.linkedArticle ? (
                        task.linkedArticle.status === 'published' && task.linkedArticle.slug ? (
                          <a href={`/articles/${task.linkedArticle.slug}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" rightIcon={<Icon name="ExternalLink" size={12} />} className="text-gold text-xs">
                              View Live
                            </Button>
                          </a>
                        ) : (
                          <Link to={`/admin/articles/${task.linkedArticle._id}/edit`}>
                            <Button variant="secondary" size="sm" leftIcon={<Icon name="FileText" size={12} />} className="text-xs">
                              Article
                            </Button>
                          </Link>
                        )
                      ) : null
                    ) : isVideo ? (
                      <Link to={`/admin/videos/${task.linkedVideo?._id || task._id}`}>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Icon name="Video" size={12} />}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                        >
                          Video Studio
                        </Button>
                      </Link>
                    ) : null}

                    {/* Secondary Link to Task Detail */}
                    <Link to={`/admin/tasks/${task._id}`}>
                      <Button variant="secondary" size="sm" className="text-xs">
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;
