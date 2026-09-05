import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/icons/Icon';
import { useTaskDetail, useUpdateTaskStatus } from '../../hooks/useTasks';
import { useComments, useAddComment } from '../../hooks/useComments';
import { TaskStatus } from '../../api/task';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from '../../hooks/useToast';

export const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: task, isLoading: isLoadingTask, isError: isTaskError, error: taskError } = useTaskDetail(id);
  const { data: comments = [], isLoading: isLoadingComments } = useComments(id);

  const updateStatusMutation = useUpdateTaskStatus();
  const addCommentMutation = useAddComment();

  const [commentBody, setCommentBody] = useState('');

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!id) return;
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
      toast.success(`Task status updated to "${newStatus}".`);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Failed to update task status.';
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
      toast.success('Comment added to task thread.');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Failed to post comment.';
      toast.error(msg);
    }
  };

  if (isLoadingTask) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isTaskError || !task) {
    const errorMsg = (taskError as any)?.response?.data?.error?.message || 'Task not found or access denied.';
    return (
      <div className="space-y-6 font-sans">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-textMuted hover:text-gold transition-colors"
        >
          <Icon name="ArrowLeft" size={14} />
          <span>Back</span>
        </button>

        <div className="rounded-xl border border-danger/30 bg-danger/5 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger mb-3">
            <Icon name="AlertCircle" size={24} />
          </div>
          <h2 className="text-lg font-bold text-text">Access Restricted</h2>
          <p className="mt-1 text-xs text-textMuted max-w-md mx-auto">{errorMsg}</p>
          <div className="mt-4">
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

  const isOverdue = task.isOverdue || (new Date(task.dueDate) < new Date() && task.status !== 'done');

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto">
      {/* Top Header / Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-surface text-textMuted hover:text-gold hover:border-gold/50 transition-colors"
            title="Go Back"
          >
            <Icon name="ArrowLeft" size={16} />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="gold">{task.type.toUpperCase()}</Badge>
              <StatusBadge status={task.status} />
              {isOverdue && (
                <Badge variant="danger" className="animate-pulse">
                  OVERDUE
                </Badge>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-text tracking-tight mt-1">
              {task.title}
            </h1>
          </div>
        </div>

        {/* Status Action Selector */}
        <div className="flex items-center space-x-2 bg-surface p-2 rounded-xl border border-border">
          <span className="text-xs font-semibold text-textMuted pl-2">Status:</span>
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
            disabled={updateStatusMutation.isPending}
            className="rounded-lg border border-border bg-bg px-3 py-1.5 text-xs font-bold text-text focus:border-gold focus:outline-none"
          >
            <option value="pending">Pending</option>
            <option value="inProgress">In Progress</option>
            <option value="inReview">In Review</option>
            <option value="done">Completed</option>
          </select>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2-Column Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Summary & Description Card */}
          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <h2 className="text-sm font-bold text-gold uppercase tracking-wider flex items-center gap-2">
              <Icon name="FileText" size={16} />
              Task Details & Description
            </h2>
            <div className="text-sm text-text bg-bg/50 p-4 rounded-lg border border-border/50 min-h-[80px] whitespace-pre-wrap">
              {task.description || 'No detailed instructions provided for this task.'}
            </div>

            {/* Dates & People Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-lg border border-border p-3 bg-bg/30">
                <span className="text-[11px] font-semibold text-textMuted uppercase block mb-1">
                  Due Date
                </span>
                <div className="flex items-center space-x-2">
                  <Icon
                    name="Calendar"
                    size={16}
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
                <span className="text-[11px] font-semibold text-textMuted uppercase block mb-1">
                  Created By
                </span>
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 rounded-full bg-gold/20 flex items-center justify-center text-[10px] font-bold text-gold">
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
              <span className="text-[11px] font-semibold text-textMuted uppercase block mb-2">
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
                  <span className="text-xs text-textMuted font-italic">Unassigned</span>
                )}
              </div>
            </div>
          </div>

          {/* Linked Resource Action Cards */}
          {(task.linkedArticle || task.linkedVideo) && (
            <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
              <h2 className="text-sm font-bold text-gold uppercase tracking-wider flex items-center gap-2">
                <Icon name="ExternalLink" size={16} />
                Linked Operational Content
              </h2>

              {task.linkedArticle && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-border bg-bg/50 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Icon name="FileText" size={16} className="text-gold" />
                      <span className="text-sm font-bold text-text">
                        {task.linkedArticle.title}
                      </span>
                    </div>
                    <p className="text-xs text-textMuted font-mono">
                      Slug: /{task.linkedArticle.slug} • Status: {task.linkedArticle.status}
                    </p>
                  </div>
                  <Link to={`/admin/articles/${task.linkedArticle._id}/edit`}>
                    <Button variant="secondary" size="sm" rightIcon={<Icon name="ArrowRight" size={14} />}>
                      Open Editor
                    </Button>
                  </Link>
                </div>
              )}

              {task.linkedVideo && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-border bg-bg/50 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Icon name="Video" size={16} className="text-gold" />
                      <span className="text-sm font-bold text-text">
                        {task.linkedVideo.title}
                      </span>
                    </div>
                    <p className="text-xs text-textMuted font-mono">
                      Stage: {task.linkedVideo.boardStage || 'Idea'} • Platform: {task.linkedVideo.platform || 'YouTube'}
                    </p>
                  </div>
                  <Link to={`/admin/production/${task.linkedVideo._id}`}>
                    <Button variant="secondary" size="sm" rightIcon={<Icon name="ArrowRight" size={14} />}>
                      Video Production Log
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Internal Comment Thread */}
          <div className="rounded-xl border border-border bg-surface p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-sm font-bold text-gold uppercase tracking-wider flex items-center gap-2">
                <Icon name="MessageSquare" size={16} />
                Task Discussion Thread ({comments.length})
              </h2>
              <span className="text-xs text-textMuted">Internal Admin Notes</span>
            </div>

            {/* Comment List */}
            {isLoadingComments ? (
              <div className="py-8 flex justify-center">
                <Spinner size="md" />
              </div>
            ) : comments.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center">
                <Icon name="MessageSquare" size={24} className="mx-auto text-textMuted mb-2 opacity-50" />
                <p className="text-xs font-semibold text-text">No comments on this task yet.</p>
                <p className="text-[11px] text-textMuted mt-0.5">
                  Post a message below to communicate with assigned team members or task creator.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
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
                      className="rounded-lg border border-border bg-bg/40 p-4 space-y-2 hover:border-gold/30 transition-colors"
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
            <form onSubmit={handleAddComment} className="pt-4 border-t border-border space-y-3">
              <span className="text-xs font-bold text-text block">Post a Comment or Update</span>
              <Textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Type your comment, questions, or status updates here..."
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

        {/* Right Sidebar: Quick Actions & Workflow Timeline */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <h3 className="text-xs font-bold text-gold uppercase tracking-wider">
              Quick Actions & Workflow
            </h3>

            <div className="space-y-2">
              <span className="text-[11px] text-textMuted font-semibold block">Update Status</span>
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
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border border-success/40 bg-success/10 text-success hover:bg-success/20 transition-colors col-span-2 ${
                    task.status === 'done' ? 'ring-1 ring-success' : ''
                  }`}
                >
                  Mark as Completed
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-2">
              <span className="text-[11px] text-textMuted font-semibold block">Task Info</span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-textMuted">Created:</span>
                  <span className="font-mono text-text">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textMuted">Last Updated:</span>
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
