import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import { useTaskDetail } from '../../../hooks/useTasks';
import { useComments, useAddComment } from '../../../hooks/useComments';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
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

export const SuperAdminTaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: task, isLoading: isLoadingTask, isError: isTaskError, error: taskError } = useTaskDetail(id);
  const { data: comments = [], isLoading: isLoadingComments } = useComments(id);
  const addCommentMutation = useAddComment();

  const [commentBody, setCommentBody] = useState('');

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
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Failed to post comment.';
      toast.error(msg);
    }
  };

  if (isLoadingTask) {
    return <AdminPageSkeleton variant="detail" />;
  }

  if (isTaskError || !task) {
    const errorMsg =
      (taskError as any)?.response?.data?.error?.message ||
      (taskError as any)?.response?.data?.message ||
      'Task not found or access denied.';
    return (
      <div className="space-y-6 font-sans max-w-lg mx-auto mt-12 text-center">
        <div className="rounded-2xl border border-danger/30 bg-danger/5 p-8 space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
            <Icon name="AlertCircle" size={24} />
          </div>
          <h2 className="text-lg font-bold text-text">Task Unavailable</h2>
          <p className="text-xs text-textMuted max-w-md mx-auto">{errorMsg}</p>
          <div className="pt-2">
            <Button variant="secondary" size="sm" onClick={() => navigate('/admin/tasks')}>
              Return to All Tasks
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const countdown = formatCountdown(task.dueDate);
  const isOverdue = task.isOverdue || (countdown.isPast && task.status !== 'done' && task.status !== 'approved');

  // Stages for the automated lifecycle tracker
  const stages = [
    {
      id: 'pending',
      label: 'Delegated',
      desc: 'Assigned to scholar',
      isCompleted: task.status === 'inProgress' || task.status === 'inReview' || task.status === 'approved' || task.status === 'done',
      isCurrent: task.status === 'pending',
    },
    {
      id: 'inProgress',
      label: 'Drafting',
      desc: 'Scholar authoring draft in workspace',
      isCompleted: task.status === 'inReview' || task.status === 'approved' || task.status === 'done',
      isCurrent: task.status === 'inProgress',
    },
    {
      id: 'inReview',
      label: 'Peer Review',
      desc: 'SuperAdmin reviewing submitted draft',
      isCompleted: task.status === 'approved' || task.status === 'done',
      isCurrent: task.status === 'inReview',
    },
    {
      id: 'approved',
      label: 'Approved',
      desc: 'Passed editorial review; ready for release',
      isCompleted: task.status === 'done',
      isCurrent: task.status === 'approved',
    },
    {
      id: 'done',
      label: 'Completed',
      desc: 'Live on public catalog',
      isCompleted: task.status === 'done',
      isCurrent: task.status === 'done',
    },
  ];

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto pb-16">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin/tasks')}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-surface text-textMuted hover:text-gold hover:border-gold/50 transition-colors shrink-0"
            title="Back to All Tasks"
          >
            <Icon name="ArrowLeft" size={16} />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={task.status} />
              <Badge variant="gold" size="sm">{task.type.toUpperCase()}</Badge>
              {isOverdue && (
                <Badge variant="danger" size="sm" className="animate-pulse">
                  OVERDUE
                </Badge>
              )}
            </div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-text tracking-tight mt-1">
              {task.title}
            </h1>
          </div>
        </div>

        {/* Manager Quick Navigation Actions */}
        <div className="flex items-center space-x-2">
          {task.linkedArticle && task.status === 'inReview' && (
            <Link to={`/admin/articles/${task.linkedArticle._id}/review`}>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Icon name="Eye" size={14} />}
                className="bg-gold hover:bg-goldHover text-bg font-bold shadow-md"
              >
                Review in Queue
              </Button>
            </Link>
          )}

          {task.linkedArticle && (
            <Link to={`/admin/articles/${task.linkedArticle._id}`}>
              <Button variant="secondary" size="sm" leftIcon={<Icon name="Eye" size={14} />}>
                Inspect
              </Button>
            </Link>
          )}

          {task.linkedArticle && (
            <Link to={`/admin/articles/${task.linkedArticle._id}/edit`}>
              <Button variant="secondary" size="sm" leftIcon={<Icon name="Edit" size={14} />}>
                Open Editor
              </Button>
            </Link>
          )}

          {task.linkedArticle?.slug && (task.status === 'done' || task.linkedArticle?.status === 'published') && (
            <a href={`/articles/${task.linkedArticle.slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="sm" rightIcon={<Icon name="ExternalLink" size={13} />}>
                View Live
              </Button>
            </a>
          )}

          <Link to="/admin/tasks">
            <Button variant="ghost" size="sm" leftIcon={<Icon name="List" size={14} />}>
              All Tasks
            </Button>
          </Link>
        </div>
      </div>

      {/* Automated Lifecycle Tracker Card */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="text-xs font-bold text-gold uppercase tracking-wider mb-4 flex items-center gap-2">
          <Icon name="Activity" size={14} />
          Workflow Lifecycle Progress
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {stages.map((stage, idx) => (
            <div
              key={stage.id}
              className={`p-3.5 rounded-xl border transition-all ${
                stage.isCurrent
                  ? 'border-gold bg-gold/10 shadow-sm'
                  : stage.isCompleted
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-border/60 bg-bg/50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-textMuted">
                  Step 0{idx + 1}
                </span>
                {stage.isCompleted ? (
                  <Icon name="CheckCircle" size={14} className="text-emerald-500" />
                ) : stage.isCurrent ? (
                  <div className="h-2 w-2 rounded-full bg-gold animate-ping" />
                ) : null}
              </div>
              <p className={`text-xs font-bold ${stage.isCurrent ? 'text-gold' : 'text-text'}`}>
                {stage.label}
              </p>
              <p className="text-[11px] text-textMuted mt-0.5 leading-snug">{stage.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Description + Discussion on Left, Metadata & Assignees on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Task Brief + Discussion */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Brief / Objectives */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-2">
              <Icon name="FileText" size={14} />
              Task Brief & Research Guidelines
            </h3>
            <p className="text-xs sm:text-sm text-text leading-relaxed whitespace-pre-wrap">
              {task.description || 'No detailed instructions provided.'}
            </p>
          </div>

          {/* Linked Article Card */}
          {task.linkedArticle && (
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                  <Icon name="BookOpen" size={14} />
                  Associated Scholarly Article
                </span>
                <StatusBadge status={task.linkedArticle.status} size="sm" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <h4 className="text-sm font-bold text-text">{task.linkedArticle.title}</h4>
                  <p className="text-xs text-textMuted mt-0.5">
                    Assigned draft created for this research objective.
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  {task.status === 'inReview' ? (
                    <Link to={`/admin/articles/${task.linkedArticle._id}/review`}>
                      <Button variant="primary" size="sm" leftIcon={<Icon name="Eye" size={14} />} className="bg-gold hover:bg-goldHover text-bg font-bold">
                        Review Submission
                      </Button>
                    </Link>
                  ) : (
                    <Link to={`/admin/articles/${task.linkedArticle._id}`}>
                      <Button variant="secondary" size="sm" leftIcon={<Icon name="Eye" size={14} />}>
                        Inspect Draft
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Discussion Thread */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Icon name="MessageSquare" size={14} />
              Team Discussion & Directives ({comments.length})
            </h3>

            {isLoadingComments ? (
              <div className="py-6 text-center text-xs text-textMuted">Loading directives...</div>
            ) : comments.length === 0 ? (
              <div className="py-8 text-center text-xs text-textMuted border border-dashed border-border/60 rounded-xl">
                No instructions or notes posted yet. Post directives below.
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {comments.map((c: any) => {
                  const author = typeof c.author === 'object' ? c.author : null;
                  const name = author?.name || 'Staff Member';
                  const email = author?.email || '';
                  return (
                    <div key={c._id} className="p-3 rounded-xl border border-border/70 bg-bg/50 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gold">{name}</span>
                          {email && <span className="text-[10px] text-textMuted font-mono">({email})</span>}
                        </div>
                        <span className="text-[10px] text-textMuted font-mono">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-text leading-relaxed whitespace-pre-wrap">{c.body}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Comment Post Form */}
            <form onSubmit={handleAddComment} className="pt-2 space-y-2.5">
              <Textarea
                placeholder="Post a managerial directive, source link, or feedback to the scholar..."
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={addCommentMutation.isPending}
                  leftIcon={<Icon name="Send" size={13} />}
                >
                  Post Directive
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Assigned Scholars & Task Provenance */}
        <div className="space-y-6">
          {/* Assigned Scholar(s) Card */}
          <div className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Icon name="Users" size={14} />
              Assigned Scholars
            </h3>

            {task.assignedTo && task.assignedTo.length > 0 ? (
              <div className="space-y-3">
                {task.assignedTo.map((assignee: any) => {
                  const isObj = typeof assignee === 'object' && assignee;
                  const name = isObj ? assignee.name : 'Assigned Scholar';
                  const email = isObj ? assignee.email : '';
                  const avatar = isObj?.avatarUrl;

                  return (
                    <div key={isObj ? assignee._id : assignee} className="flex items-center space-x-3 p-2 rounded-xl bg-bg/40 border border-border/50">
                      {avatar ? (
                        <img src={avatar} alt={name} className="h-10 w-10 rounded-full object-cover border border-gold/40" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold font-bold text-xs border border-gold/30">
                          {name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="truncate">
                        <p className="text-xs font-bold text-text truncate">{name}</p>
                        {email && <p className="text-[10px] text-textMuted font-mono truncate">{email}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-textMuted">No scholars assigned to this task.</p>
            )}
          </div>

          {/* Task Metadata & Timestamps */}
          <div className="rounded-2xl border border-border bg-surface p-5 space-y-3.5 text-xs text-textMuted shadow-sm">
            <h4 className="font-bold text-text uppercase tracking-wider text-[11px] border-b border-border pb-2">
              Task Details
            </h4>

            <div className="flex justify-between">
              <span>Status:</span>
              <StatusBadge status={task.status} size="sm" />
            </div>

            <div className="flex justify-between">
              <span>Task Type:</span>
              <span className="font-semibold text-text uppercase">{task.type}</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Deadline:</span>
              <span className={`font-mono font-bold ${isOverdue ? 'text-danger' : 'text-text'}`}>
                {new Date(task.dueDate).toLocaleDateString()} ({countdown.text})
              </span>
            </div>

            <div className="flex justify-between">
              <span>Created Date:</span>
              <span className="font-mono text-text">
                {new Date(task.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminTaskDetailPage;
