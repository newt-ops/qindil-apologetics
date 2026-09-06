import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import {
  useVideoById,
  useAcceptVideoTask,
  useUpdateVideoDetails,
  useSubmitVideoTask,
  useReviewVideoTask,
  usePostVideoTask,
} from '../../../hooks/useVideos';
import { useAuthStore } from '../../../stores/authStore';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import FileUpload from '../../../components/admin/FileUpload';
import { VideoEmbed } from '../../../components/admin/VideoEmbed';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/ui/Spinner';
import { toast } from '../../../hooks/useToast';

export const VideoTaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const { data: video, isLoading, isError, refetch } = useVideoById(id);
  const acceptTaskMutation = useAcceptVideoTask();
  const updateDetailsMutation = useUpdateVideoDetails();
  const submitVideoMutation = useSubmitVideoTask();
  const reviewVideoMutation = useReviewVideoTask();
  const postVideoMutation = usePostVideoTask();

  const [posterUrl, setPosterUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submittedUrl, setSubmittedUrl] = useState('');
  const [publishedUrl, setPublishedUrl] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    if (video) {
      setPosterUrl(video.posterUrl || '');
      setNotes(video.notes || '');
      setSubmittedUrl(video.submittedUrl || '');
      setPublishedUrl(video.publishedUrl || '');
      setReviewNotes(video.reviewNotes || '');
    }
  }, [video]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !video) {
    return (
      <div className="space-y-6 font-sans max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/admin/tasks')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-textMuted hover:text-gold transition-colors"
        >
          <Icon name="ArrowLeft" size={14} />
          <span>Back to All Tasks</span>
        </button>

        <div className="rounded-xl border border-danger/30 bg-danger/5 p-8 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
            <Icon name="AlertCircle" size={24} />
          </div>
          <h2 className="text-lg font-bold text-text">Video Task Not Found</h2>
          <p className="text-xs text-textMuted max-w-md mx-auto">
            The requested video production task could not be loaded or you lack permission to view it.
          </p>
        </div>
      </div>
    );
  }

  const linkedTask = typeof video.linkedTaskId === 'object' ? video.linkedTaskId : null;
  const isPending = linkedTask?.status === 'pending';
  const creatorObj = typeof video.creator === 'object' ? video.creator : null;
  const creatorName = creatorObj?.name || 'Creator';
  const isCreator = user?._id === (creatorObj?._id || video.creator);
  const isSuperAdmin = user?.roles?.some((r: any) =>
    typeof r === 'string' ? r === 'superAdmin' : r.name === 'superAdmin'
  );

  const isPersonal = video.destination === 'personal';

  const handleAcceptTask = async () => {
    try {
      await acceptTaskMutation.mutateAsync(video._id);
      toast.success('Video task accepted! Workspace unlocked.');
      refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Failed to accept video task.';
      toast.error(msg);
    }
  };

  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDetailsMutation.mutateAsync({
        id: video._id,
        data: {
          posterUrl: posterUrl.trim() || undefined,
          notes: notes.trim() || undefined,
          submittedUrl: submittedUrl.trim() || undefined,
        },
      });
      toast.success('Video workspace details saved.');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Failed to save workspace.';
      toast.error(msg);
    }
  };

  const handleSubmitVideo = async () => {
    if (isPersonal && (!submittedUrl || !submittedUrl.trim())) {
      toast.error('Please enter the submitted video URL before submitting.');
      return;
    }
    try {
      await submitVideoMutation.mutateAsync({
        id: video._id,
        data: { submittedUrl: submittedUrl.trim() || undefined },
      });
      toast.success('Video task submitted successfully!');
      refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Failed to submit video task.';
      toast.error(msg);
    }
  };

  const handleReviewDecision = async (decision: 'approve' | 'requestChanges') => {
    if (decision === 'requestChanges' && (!reviewNotes || !reviewNotes.trim())) {
      toast.error('Please enter review notes explaining requested changes.');
      return;
    }
    try {
      await reviewVideoMutation.mutateAsync({
        id: video._id,
        data: { decision, reviewNotes: reviewNotes.trim() || undefined },
      });
      toast.success(
        decision === 'approve' ? 'Video approved!' : 'Changes requested and notified to creator.'
      );
      refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Failed to process review.';
      toast.error(msg);
    }
  };

  const handlePostVideo = async () => {
    if (!publishedUrl || !publishedUrl.trim()) {
      toast.error('Please enter the final published video URL.');
      return;
    }
    try {
      await postVideoMutation.mutateAsync({
        id: video._id,
        data: { publishedUrl: publishedUrl.trim() },
      });
      toast.success('Video posted live and task completed!');
      refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Failed to post video.';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto pb-16">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin/tasks')}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-surface text-textMuted hover:text-gold hover:border-gold/50 transition-colors"
            title="Back to Tasks"
          >
            <Icon name="ArrowLeft" size={16} />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <StatusBadge status={video.status} />
              <span className="text-xs font-semibold text-gold uppercase tracking-wider px-2 py-0.5 rounded bg-gold/10 border border-gold/20">
                {video.videoType === 'refutation' ? 'Refutation Paper' : 'Normal Video'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-text tracking-tight mt-1 truncate max-w-lg">
              {video.title}
            </h1>
          </div>
        </div>

        {linkedTask && (
          <Link to={`/admin/tasks/${linkedTask._id}`}>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Icon name="FileText" size={14} className="text-gold" />}
            >
              View Linked Task
            </Button>
          </Link>
        )}
      </div>

      {/* Warning Banner for Changes Requested */}
      {video.status === 'changesRequested' && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-5 space-y-2">
          <div className="flex items-center gap-2 text-warning font-bold text-sm">
            <Icon name="AlertTriangle" size={18} />
            <span>SuperAdmin Requested Revision Changes</span>
          </div>
          {video.reviewNotes && (
            <p className="text-xs text-textMuted leading-relaxed pl-6 border-l-2 border-warning/40">
              "{video.reviewNotes}"
            </p>
          )}
        </div>
      )}

      {/* Posted / Published Success Banner */}
      {(video.status === 'posted' || video.status === 'published') && (
        <div className="rounded-xl border border-success/40 bg-success/10 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-success font-bold text-sm">
              <Icon name="CheckCircle" size={18} />
              <span>Video Published Live</span>
            </div>
            {video.publishedAt && (
              <span className="text-[11px] text-textMuted">
                {new Date(video.publishedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
          {video.publishedUrl && (
            <VideoEmbed url={video.publishedUrl} title="Published Video" />
          )}
        </div>
      )}

      {/* Task Brief & Overview Card */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-4 shadow-md">
        <h2 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
          <Icon name="Video" size={16} />
          Video Task Brief & Parameters
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-textMuted font-medium">Video Type:</span>
            <p className="font-bold text-text">
              {video.videoType === 'refutation' ? 'Refutation Video Paper' : 'Normal Video'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-textMuted font-medium">Publish Destination:</span>
            <p className="font-bold text-gold">
              {isPersonal ? 'Personal Account' : 'Official Qindil Channel / Account'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-textMuted font-medium">Assigned Creator:</span>
            <p className="font-bold text-text">{creatorName}</p>
          </div>
        </div>

        {/* Target Video URL & Embed for Refutations */}
        {video.videoType === 'refutation' && video.targetVideoUrl && (
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-bold text-gold uppercase tracking-wider block">
              Target Refutation Video
            </span>
            <VideoEmbed url={video.targetVideoUrl} title="Target Refutation Video" />
          </div>
        )}
      </div>

      {/* Accept & Start Task Gate (If Pending) */}
      {isPending && (
        <div className="rounded-xl border border-gold/40 bg-gold/10 p-6 text-center space-y-4 shadow-lg">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/20 text-gold">
            <Icon name="Lock" size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text">Task Awaiting Acceptance</h3>
            <p className="text-xs text-textMuted max-w-md mx-auto">
              {isCreator
                ? 'Review the task brief above and click below to accept and start working on this video task.'
                : `Assigned creator ${creatorName} has not yet accepted this task.`}
            </p>
          </div>

          {(isCreator || isSuperAdmin) && (
            <Button
              variant="primary"
              size="md"
              onClick={handleAcceptTask}
              isLoading={acceptTaskMutation.isPending}
              leftIcon={<Icon name="Check" size={16} />}
            >
              Accept & Start Video Task
            </Button>
          )}
        </div>
      )}

      {/* SuperAdmin Review Action Bar (When Submitted) */}
      {video.status === 'submitted' && isSuperAdmin && isPersonal && (
        <div className="rounded-xl border border-gold/40 bg-gold/5 p-6 space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-gold uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
            <Icon name="Shield" size={18} />
            SuperAdmin Review & Approval
          </h3>

          {video.submittedUrl && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-textMuted">Submitted Creator Video:</span>
              <VideoEmbed url={video.submittedUrl} title="Creator Submission" />
            </div>
          )}

          <Textarea
            label="Reviewer Feedback / Notes"
            placeholder="Add review feedback or explain requested changes..."
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={3}
          />

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleReviewDecision('approve')}
              isLoading={reviewVideoMutation.isPending}
              leftIcon={<Icon name="Check" size={14} />}
            >
              Approve Video
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleReviewDecision('requestChanges')}
              isLoading={reviewVideoMutation.isPending}
              leftIcon={<Icon name="AlertTriangle" size={14} />}
              className="border-warning/50 text-warning hover:bg-warning/10"
            >
              Request Changes
            </Button>
          </div>
        </div>
      )}

      {/* SuperAdmin Post Action Bar (When Submitted Official OR Approved Personal) */}
      {isSuperAdmin &&
        (video.status === 'submitted' || video.status === 'approved') &&
        (video.status === 'approved' || !isPersonal) && (
          <div className="rounded-xl border border-gold/40 bg-gold/5 p-6 space-y-4 shadow-lg">
            <h3 className="text-sm font-bold text-gold uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Icon name="Send" size={18} />
              Publish Video Live
            </h3>

            {video.submittedUrl && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-textMuted">Creator Work Submission:</span>
                <VideoEmbed url={video.submittedUrl} title="Submitted Video" />
              </div>
            )}

            <Input
              label="Final Published Video URL"
              type="url"
              placeholder="https://youtube.com/watch?v=... or https://tiktok.com/@..."
              value={publishedUrl}
              onChange={(e) => setPublishedUrl(e.target.value)}
              helperText="Paste the live URL once published on the channel."
            />

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handlePostVideo}
                isLoading={postVideoMutation.isPending}
                leftIcon={<Icon name="Send" size={14} />}
              >
                Post Video Live & Finalize Task
              </Button>
            </div>
          </div>
        )}

      {/* Production Workspace (Unlocked once accepted) */}
      {!isPending && (
        <form onSubmit={handleSaveWorkspace} className="space-y-6">
          <div className="rounded-xl border border-border bg-surface p-6 space-y-6 shadow-md">
            <h3 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Icon name="Settings" size={16} />
              Production Workspace
            </h3>

            {/* Poster Upload */}
            <FileUpload
              label="Video Thumbnail / Poster Banner"
              folder="qindil/videos"
              value={posterUrl}
              onUploadComplete={(url) => setPosterUrl(url)}
            />

            {/* Submitted URL */}
            <Input
              label="Completed Video Submission Link"
              type="url"
              placeholder="https://drive.google.com/... or https://youtube.com/..."
              value={submittedUrl}
              onChange={(e) => setSubmittedUrl(e.target.value)}
              helperText={
                isPersonal
                  ? 'Required: Paste your finished video link before submitting.'
                  : 'Optional: Upload link or drive folder for official publishing.'
              }
            />

            {/* Internal Notes */}
            <Textarea
              label="Internal Production & Script Notes"
              placeholder="Add script notes, timecodes, citations, or references..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />

            <div className="flex justify-between items-center pt-2">
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                isLoading={updateDetailsMutation.isPending}
                leftIcon={<Icon name="Check" size={14} />}
              >
                Save Workspace Details
              </Button>

              {/* Submit Task Action Button for Creator */}
              {(isCreator || isSuperAdmin) &&
                (video.status === 'inProgress' || video.status === 'changesRequested') && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleSubmitVideo}
                    isLoading={submitVideoMutation.isPending}
                    leftIcon={<Icon name="Send" size={14} />}
                  >
                    Submit Video Task
                  </Button>
                )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default VideoTaskDetailPage;

