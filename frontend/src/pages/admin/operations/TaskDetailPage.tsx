import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import { useTaskDetail, useUpdateTaskStatus, useAcceptTask } from '../../../hooks/useTasks';
import { useComments, useAddComment } from '../../../hooks/useComments';
import { useAuthStore } from '../../../stores/authStore';
import { TaskStatus } from '../../../api/task';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
import { Spinner } from '../../../components/ui/Spinner';
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

export const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const { data: task, isLoading: isLoadingTask, isError: isTaskError, error: taskError } = useTaskDetail(id);
  const { data: comments = [], isLoading: isLoadingComments } = useComments(id);

  const updateStatusMutation = useUpdateTaskStatus();
  const acceptTaskMutation = useAcceptTask();
  const addCommentMutation = useAddComment();

  const [commentBody, setCommentBody] = useState('');

  const isAssignee = task?.assignedTo?.some((u: any) =>
    typeof u === 'string' ? u === user?._id : u._id === user?._id
  );

  const handleAcceptTask = async () => {
    if (!id) return;
    try {
      const res = await acceptTaskMutation.mutateAsync(id);
      toast.success('Task accepted! Writing draft initialized.');
      if (res?.data?.linkedArticle?._id) {
        navigate(`/admin/articles/${res.data.linkedArticle._id}/edit`);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || 'Failed to accept task.';
      toast.error(msg);
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!id) return;
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
      toast.success(`Task status updated to "${newStatus}".`);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || 'Failed to update task status.';
      toast.error(msg);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!commentBody.trim()) {
      toast.error('Comment body cannot be empty.');
      return;
    }

    try {
      await addCommentMutation.mutateAsync({ taskId: id, body: commentBody.trim() });
      setCommentBody('');
      toast.success('Comment added to discussion thread.');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || 'Failed to post comment.';
      toast.error(msg);
    }
  };

  if (isLoadingTask) {
    return (
      <div className="flex h-64 items-center justify-center text-gold">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isTaskError || !task) {
    const errorMsg =
      (taskError as any)?.response?.data?.error?.message ||
      (taskError as any)?.response?.data?.message ||
      'Task not found or access denied.';
    return (
      <div className="space-y-6 font-sans max-w-lg mx-auto mt-12">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-textMuted hover:text-gold transition-colors"
        >
          <Icon name="ArrowLeft" size={14} />
          <span>Go Back</span>
        </button>

        <div className="rounded-2xl border border-danger/30 bg-danger/5 p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
            <Icon name="AlertCircle" size={24} />
          </div>
          <h2 className="text-lg font-bold text-text">Task Unavailable</h2>
          <p className="text-xs text-textMuted max-w-md mx-auto">{errorMsg}</p>
          <div className="pt-2">
            <Link to="/admin/workspace">
              <Button variant="secondary" size="sm">
                Return to Workspace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const countdown = formatCountdown(task.dueDate);
  const isOverdue = task.isOverdue || (countdown.isPast && task.status !== 'done');

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto pb-16">
      {/* Top Header / Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-surface text-textMuted hover:text-gold hover:border-gold/50 transition-colors shrink-0"
            title="Go Back"
          >
            <Icon name="ArrowLeft" size={16} />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="gold">{task.type.toUpperCase()}</Badge>
              <StatusBadge status={task.status} />
              {isOverdue && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-danger/20 text-danger border border-danger/30 animate-pulse">
                  {countdown.text}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-text tracking-tight mt-1">
              {task.title}
            </h1>
          </div>
        </div>

        {/* Status Action Selector */}
        <div className="flex items-center space-x-2 bg-surface p-1.5 rounded-xl border border-border">
          <span className="text-xs font-semibold text-textMuted pl-2">Status:</span>
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
            disabled={updateStatusMutation.isPending}
            className="rounded-lg border border-border bg-bg px-3 py-1.5 text-xs font-bold text-text focus:border-gold focus:outline-none cursor-pointer"
          >
            <option value="pending">Pending Acceptance</option>
            <option value="inProgress">In Progress</option>
            <option value="inReview">In Review</option>
            <option value="done">Completed</option>
          </select>
        </div>
      </div>

      {/* Accept & Start Banner for Pending Assignee */}
      {task.status === 'pending' && isAssignee && (
        <div className="rounded-2xl border border-gold/40 bg-gradient-to-r from-gold/15 via-gold/5 to-transparent p-5 sm:p-6 space-y-4 shadow-md">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 rounded-xl bg-gold/20 text-gold shrink-0">
              <Icon name="BookOpen" size={24} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-text">Task Assignment Pending Acceptance</h3>
              <p className="text-xs text-textMuted mt-1 leading-relaxed">
                You are assigned to this operational assignment. Confirm acceptance to initiate writing draft tracking and unlock your personal workspace tools.
              </p>
            </div>
          </div>
          <div className="pt-1 flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              isLoading={acceptTaskMutation.isPending}
              onClick={handleAcceptTask}
              leftIcon={<Icon name="CheckCircle" size={18} />}
            >
              Accept &amp; Start Assignment
            </Button>
          </div>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2-Column Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Summary & Description Card */}
          <div className="rounded-xl border border-border bg-surface p-5 sm:p-6 space-y-4 shadow-sm">
            <h2 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-2">
              <Icon name="FileText" size={15} />
              <span>Assignment Scope &amp; Instructions</span>
            </h2>
            <div className="text-xs sm:text-sm text-text bg-bg/50 p-4 rounded-xl border border-border/60 min-h-[80px] whitespace-pre-wrap leading-relaxed">
              {task.description || 'No detailed instructions cataloged for this task.'}
            </div>

            {/* Dates & People Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="rounded-lg border border-border p-3 bg-bg/30">
                <span className="text-[10px] font-bold text-textMuted uppercase block mb-1">
                  Designated Deadline
                </span>
                <div className="flex items-center space-x-2">
                  <Icon
                    name="Calendar"
                    size={15}
                    className={isOverdue ? 'text-danger' : 'text-gold'}
                  />
                  <span
                    className={`text-xs font-mono font-bold ${
                      isOverdue ? 'text-danger' : 'text-text'
                    }`}
                  >
                    {new Date(task.dueDate).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-border p-3 bg-bg/30">
                <span className="text-[10px] font-bold text-textMuted uppercase block mb-1">
                  Delegated By
                </span>
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 rounded-full bg-gold/20 flex items-center justify-center text-[10px] font-bold text-gold">
                    {typeof task.createdBy === 'string'
                      ? 'U'
                      : task.createdBy.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-text">
                    {typeof task.createdBy === 'string' ? task.createdBy : task.createdBy.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Assignees */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-textMuted uppercase block mb-2">
                Assigned Team Members ({task.assignedTo?.length || 0})
              </span>
              <div className="flex flex-wrap gap-2">
                {task.assignedTo && task.assignedTo.length > 0 ? (
                  task.assignedTo.map((assignee: any, idx: number) => {
                    const isUserObj = typeof assignee === 'object' && assignee !== null;
                    const name = isUserObj ? assignee.name : assignee;
                    let roleStr = '';
                    if (isUserObj && Array.isArray(assignee.roles) && assignee.roles.length > 0) {
                      const r = assignee.roles[0];
                      roleStr = typeof r === 'string' ? r : r.name;
                    }

                    return (
                      <div
                        key={idx}
                        className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-xs font-semibold text-text"
                      >
                        <div className="h-5 w-5 rounded-full bg-gold/20 text-gold flex items-center justify-center text-[10px] font-bold">
                          {name?.charAt(0) || 'U'}
                        </div>
                        <span>{name}</span>
                        {roleStr && (
                          <span className="text-[10px] text-gold font-mono uppercase">
                            ({roleStr})
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <span className="text-xs text-textMuted italic">Unassigned</span>
                )}
              </div>
            </div>
          </div>

          {/* Linked Content Card */}
          {(task.type === 'article' || task.linkedArticle || task.linkedVideo) && (
            <div className="rounded-xl border border-border bg-surface p-5 sm:p-6 space-y-3 shadow-sm">
              <h2 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-2">
                <Icon name="ExternalLink" size={15} />
                <span>Linked Operational Content</span>
              </h2>

              {task.type === 'article' && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-border bg-bg/50 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Icon name="FileText" size={16} className="text-gold" />
                      <span className="text-sm font-bold text-text">
                        {task.linkedArticle ? task.linkedArticle.title : task.title}
                      </span>
                    </div>
                    <p className="text-xs text-textMuted font-mono">
                      {task.linkedArticle
                        ? `Slug: /${task.linkedArticle.slug || ''} • Status: ${task.linkedArticle.status}`
                        : 'Draft creation pending task acceptance.'}
                    </p>
                  </div>

                  {task.linkedArticle ? (
                    <Link to={`/admin/articles/${task.linkedArticle._id}/edit`}>
                      <Button variant="primary" size="sm" rightIcon={<Icon name="ArrowRight" size={14} />}>
                        Continue Writing
                      </Button>
                    </Link>
                  ) : task.status === 'pending' && isAssignee ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleAcceptTask}
                      isLoading={acceptTaskMutation.isPending}
                    >
                      Accept &amp; Start
                    </Button>
                  ) : (
                    <span className="text-xs text-amber-500 font-mono bg-amber-500/10 px-2.5 py-1 rounded">
                      Pending Acceptance
                    </span>
                  )}
                </div>
              )}

              {task.linkedVideo && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-border bg-bg/50 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Icon name="Video" size={16} className="text-gold" />
                      <span className="text-sm font-bold text-text">
                        {task.linkedVideo.title}
                      </span>
                    </div>
                    <p className="text-xs text-textMuted font-mono">
                      Type: {task.linkedVideo.videoType === 'refutation' ? 'Refutation Video Paper' : 'Scholarly Content'} • Status: {task.linkedVideo.status || 'inProgress'}
                    </p>
                  </div>
                  <Link to={`/admin/videos/${task.linkedVideo._id}`}>
                    <Button variant="secondary" size="sm" rightIcon={<Icon name="ArrowRight" size={14} />}>
                      Open Video Board
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Internal Comment Thread */}
          <div className="rounded-xl border border-border bg-surface p-5 sm:p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-2">
                <Icon name="MessageSquare" size={15} />
                <span>Internal Discussion ({comments.length})</span>
              </h2>
              <span className="text-[11px] text-textMuted font-mono">Staff Thread</span>
            </div>

            {/* Comment List */}
            {isLoadingComments ? (
              <div className="py-8 flex justify-center text-gold">
                <Spinner size="md" />
              </div>
            ) : comments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <Icon name="MessageSquare" size={24} className="mx-auto text-textMuted mb-2 opacity-50" />
                <p className="text-xs font-semibold text-text">No comments on this assignment yet.</p>
                <p className="text-[11px] text-textMuted mt-0.5">
                  Post a message below to communicate with assignees or delegators.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => {
                  const authorName = c.author?.name || 'Admin';
                  let authorRole = 'admin';
                  if (Array.isArray(c.author?.roles) && c.author.roles.length > 0) {
                    const r = c.author.roles[0];
                    authorRole = typeof r === 'string' ? r : r.name;
                  }
                  const dateStr = new Date(c.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={c._id}
                      className="rounded-xl border border-border bg-bg/40 p-4 space-y-2 hover:border-gold/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-7 w-7 rounded-full bg-gold/20 flex items-center justify-center text-xs font-extrabold text-gold">
                            {authorName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-text">{authorName}</span>
                            <span className="ml-2 text-[10px] font-mono text-gold/80 bg-gold/10 px-1.5 py-0.5 rounded">
                              {authorRole}
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] text-textMuted font-mono">{dateStr}</span>
                      </div>

                      <p className="text-xs text-text leading-relaxed whitespace-pre-wrap pl-9">
                        {c.body}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="pt-3 border-t border-border space-y-3">
              <span className="text-xs font-bold text-text block">Post Comment or Update</span>
              <Textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Type your notes, status reports, or questions here..."
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={addCommentMutation.isPending}
                  leftIcon={<Icon name="Send" size={14} />}
                >
                  Post Comment
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Quick Actions Card */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-gold uppercase tracking-wider">
              Workflow Status
            </h3>

            <div className="space-y-2">
              <span className="text-[11px] text-textMuted font-semibold block">Quick Transition</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange('inProgress')}
                  disabled={task.status === 'inProgress'}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    task.status === 'inProgress'
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-border bg-bg text-textMuted hover:text-text hover:border-gold/50'
                  }`}
                >
                  In Progress
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('inReview')}
                  disabled={task.status === 'inReview'}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    task.status === 'inReview'
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-border bg-bg text-textMuted hover:text-text hover:border-gold/50'
                  }`}
                >
                  In Review
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('done')}
                  disabled={task.status === 'done'}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors col-span-2 ${
                    task.status === 'done' ? 'ring-1 ring-emerald-500' : ''
                  }`}
                >
                  Mark as Completed
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-border space-y-2">
              <span className="text-[11px] text-textMuted font-semibold block">Metadata</span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-textMuted">Created:</span>
                  <span className="font-mono text-text">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textMuted">Last Modified:</span>
                  <span className="font-mono text-text">
                    {new Date(task.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
