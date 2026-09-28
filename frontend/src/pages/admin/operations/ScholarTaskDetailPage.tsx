import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import { useTaskDetail, useAcceptTask } from '../../../hooks/useTasks';
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

export const ScholarTaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: task, isLoading: isLoadingTask, isError: isTaskError, error: taskError } = useTaskDetail(id);
  const { data: comments = [], isLoading: isLoadingComments } = useComments(id);

  const acceptTaskMutation = useAcceptTask();
  const addCommentMutation = useAddComment();

  const [commentBody, setCommentBody] = useState('');

  const handleAcceptTask = async () => {
    if (!id) return;
    try {
      const res = await acceptTaskMutation.mutateAsync(id);
      toast.success('Task accepted! Writing draft initialized.');
      if (res?.data?.linkedArticle?._id) {
        navigate(`/admin/articles/${res.data.linkedArticle._id}/edit`);
      } else {
        navigate('/admin/workspace');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Failed to accept task.';
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
            <Button variant="secondary" size="sm" onClick={() => navigate('/admin/workspace')}>
              Return to Workspace
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
      desc: 'Assigned to you by editorial leadership',
      isCompleted: task.status === 'inProgress' || task.status === 'inReview' || task.status === 'approved' || task.status === 'done',
      isCurrent: task.status === 'pending',
    },
    {
      id: 'inProgress',
      label: 'Drafting',
      desc: 'Authoring article draft in workspace',
      isCompleted: task.status === 'inReview' || task.status === 'approved' || task.status === 'done',
      isCurrent: task.status === 'inProgress',
    },
    {
      id: 'inReview',
      label: 'Peer Review',
      desc: 'Submitted and awaiting SuperAdmin review',
      isCompleted: task.status === 'approved' || task.status === 'done',
      isCurrent: task.status === 'inReview',
    },
    {
      id: 'approved',
      label: 'Approved',
      desc: 'Passed editorial review; ready to publish live',
      isCompleted: task.status === 'done',
      isCurrent: task.status === 'approved',
    },
    {
      id: 'done',
      label: 'Completed',
      desc: 'Live on Qindil Apologetics catalog',
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
            onClick={() => navigate('/admin/workspace')}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-surface text-textMuted hover:text-gold hover:border-gold/50 transition-colors shrink-0"
            title="Back to Workspace"
          >
            <Icon name="ArrowLeft" size={16} />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={task.status} />
              <Badge variant="gold" size="sm">{task.type.toUpperCase()}</Badge>
              {task.isOverdue && (
                <span className="inline-flex items-center space-x-1 text-danger font-bold text-xs bg-danger/10 px-2 py-0.5 rounded border border-danger/20">
                  <Icon name="AlertTriangle" size={12} />
                  <span>OVERDUE</span>
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-text tracking-tight mt-1">
              {task.title}
            </h1>
          </div>
        </div>

        {/* Scholar Primary Action Bar */}
        <div className="flex items-center space-x-2">
          {task.status === 'pending' && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleAcceptTask}
              isLoading={acceptTaskMutation.isPending}
              leftIcon={<Icon name="CheckCircle" size={14} />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
            >
              Accept Task &amp; Start Writing
            </Button>
          )}

          {task.status === 'inProgress' && task.linkedArticle && (
            <Link to={`/admin/articles/${task.linkedArticle._id}/edit`}>
              <Button
                variant="primary"
                size="sm"
                rightIcon={<Icon name="ArrowRight" size={14} />}
                className="bg-gold hover:bg-goldHover text-bg font-bold shadow-md"
              >
                Continue Writing
              </Button>
            </Link>
          )}

          {task.status === 'inReview' && task.linkedArticle && (
            <Link to={`/admin/articles/${task.linkedArticle._id}/edit`}>
              <Button variant="secondary" size="sm" leftIcon={<Icon name="Eye" size={14} />}>
                View Submitted Draft
              </Button>
            </Link>
          )}

          {task.status === 'approved' && task.linkedArticle && (
            <Link to={`/admin/articles/${task.linkedArticle._id}/edit`}>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Icon name="Globe" size={14} />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
              >
                Publish Article Now
              </Button>
            </Link>
          )}

          {task.status === 'done' && task.linkedArticle && (
            task.linkedArticle.slug ? (
              <a href={`/articles/${task.linkedArticle.slug}`} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="sm" rightIcon={<Icon name="ExternalLink" size={13} />}>
                  View Live Article
                </Button>
              </a>
            ) : (
              <Link to={`/admin/articles/${task.linkedArticle._id}/edit`}>
                <Button variant="secondary" size="sm" leftIcon={<Icon name="FileText" size={14} />}>
                  View Article
                </Button>
              </Link>
            )
          )}

          <Link to="/admin/workspace">
            <Button variant="ghost" size="sm" leftIcon={<Icon name="Folder" size={14} />}>
              My Workspace
            </Button>
          </Link>
        </div>
      </div>

      {/* Initial Acceptance Banner (Pending state only) */}
      {task.status === 'pending' && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <Icon name="CheckCircle" size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text">New Task Delegated to You</h4>
              <p className="text-xs text-textMuted mt-0.5">
                Click &quot;Accept Task &amp; Start Writing&quot; to initialize your draft and enter the writing workspace.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleAcceptTask}
            isLoading={acceptTaskMutation.isPending}
            leftIcon={<Icon name="CheckCircle" size={16} />}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shrink-0 shadow-md"
          >
            Accept Task &amp; Start Writing
          </Button>
        </div>
      )}

      {/* Automated Lifecycle Tracker Card */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="text-xs font-bold text-gold uppercase tracking-wider mb-4 flex items-center gap-2">
          <Icon name="Activity" size={14} />
          Your Assignment Progress
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

      {/* Main Grid: Brief & Discussion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Task Brief + Discussion */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Brief / Objectives */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-2">
              <Icon name="FileText" size={14} />
              Assignment Brief & Research Guidelines
            </h3>
            <p className="text-xs sm:text-sm text-text leading-relaxed whitespace-pre-wrap">
              {task.description || 'No detailed instructions provided.'}
            </p>
          </div>

          {/* Discussion Thread */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Icon name="MessageSquare" size={14} />
              Discussion & Notes with Editorial Leadership ({comments.length})
            </h3>

            {isLoadingComments ? (
              <div className="py-6 text-center text-xs text-textMuted">Loading directives...</div>
            ) : comments.length === 0 ? (
              <div className="py-8 text-center text-xs text-textMuted border border-dashed border-border/60 rounded-xl">
                No notes or questions posted yet. You can communicate with leadership below.
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {comments.map((c: any) => {
                  const author = typeof c.author === 'object' ? c.author : null;
                  const name = author?.name || 'Leadership';
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
                placeholder="Ask a question or provide research progress updates to the Super Admin..."
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
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Task Timeline & Assignment Details */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-5 space-y-3.5 text-xs text-textMuted shadow-sm">
            <h4 className="font-bold text-text uppercase tracking-wider text-[11px] border-b border-border pb-2">
              Assignment Details
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
              <span>Assigned Date:</span>
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

export default ScholarTaskDetailPage;
