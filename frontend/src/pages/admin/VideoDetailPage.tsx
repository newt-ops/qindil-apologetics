import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useVideoById,
  useMoveStage,
  useUpdateVideoDetails,
} from '../../hooks/useVideos';
import { VideoBoardStage } from '../../api/video';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import FileUpload from '../../components/admin/FileUpload';
import Spinner from '../../components/ui/Spinner';
import Icon from '../../components/icons/Icon';

const STAGES: { key: VideoBoardStage; label: string; bg: string }[] = [
  { key: 'idea', label: 'Idea', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { key: 'scripting', label: 'Scripting', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  { key: 'filming', label: 'Filming', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  { key: 'editing', label: 'Editing', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  { key: 'review', label: 'Review', bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  { key: 'published', label: 'Published', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
];

export const VideoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: video, isLoading, error } = useVideoById(id);
  const moveStageMutation = useMoveStage();
  const updateDetailsMutation = useUpdateVideoDetails();

  // Form State
  const [posterUrl, setPosterUrl] = useState('');
  const [publishedUrl, setPublishedUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (video) {
      setPosterUrl(video.posterUrl || '');
      setPublishedUrl(video.publishedUrl || '');
      setNotes(video.notes || '');
    }
  }, [video]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger/10 p-6 text-center text-danger font-sans space-y-4">
        <Icon name="AlertTriangle" size={32} className="mx-auto" />
        <h3 className="text-lg font-bold">Video Log Not Found</h3>
        <p className="text-xs text-textMuted">
          The requested video production log could not be loaded or you lack permission to view it.
        </p>
        <Link to="/admin/production">
          <Button variant="secondary" size="sm" leftIcon={<Icon name="ArrowLeft" size={14} />}>
            Back to Production Board
          </Button>
        </Link>
      </div>
    );
  }

  const stageIndex = STAGES.findIndex((s) => s.key === video.boardStage);
  const currentStageConfig = STAGES[stageIndex] || STAGES[0];
  const creatorObj = typeof video.contentCreator === 'object' ? video.contentCreator : null;
  const editorObj = typeof video.editor === 'object' ? video.editor : null;
  const taskObj = typeof video.task === 'object' ? video.task : null;
  const categoryObj = typeof video.category === 'object' ? video.category : null;

  const handleMove = async (targetStage: VideoBoardStage) => {
    try {
      await moveStageMutation.mutateAsync({ id: video._id, stage: targetStage });
      setActionSuccess(`Advanced video to ${targetStage.toUpperCase()}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to move video stage.');
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDetailsMutation.mutateAsync({
        id: video._id,
        data: {
          posterUrl: posterUrl.trim() || undefined,
          publishedUrl: publishedUrl.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      });

      setActionSuccess('Video log details updated successfully.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save details.');
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto pb-12">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/production')}
            leftIcon={<Icon name="ArrowLeft" size={16} />}
          >
            Production Board
          </Button>
          <span className="text-textMuted/40">|</span>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-mono font-bold ${currentStageConfig.bg}`}
          >
            Stage: {currentStageConfig.label}
          </span>
        </div>

        {/* Two-Way Link to Linked Task */}
        {taskObj && (
          <Link to={`/admin/tasks/${taskObj._id}`}>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Icon name="FileText" size={14} className="text-gold" />}
            >
              View Linked Task Card
            </Button>
          </Link>
        )}
      </div>

      {/* Action Notification Alert */}
      {actionSuccess && (
        <div className="rounded-lg border border-success/40 bg-success/10 p-3 text-xs font-semibold text-success flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={16} />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="hover:text-white">
            <Icon name="X" size={14} />
          </button>
        </div>
      )}

      {/* Video Details Header Card */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
        <div className="flex items-center space-x-2">
          {video.isRefutation ? (
            <span className="rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
              Refutation Video
            </span>
          ) : (
            <Badge variant="gold">{categoryObj?.name || 'General Video'}</Badge>
          )}

          {video.targetVideoUrl && (
            <a
              href={video.targetVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs text-gold hover:underline font-mono"
            >
              <Icon name="ExternalLink" size={12} />
              <span>Target Refutation Link</span>
            </a>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
          {video.title}
        </h1>

        {/* Team Assignments Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/60 pt-4">
          <div className="flex items-center space-x-3 bg-bg/40 p-3 rounded-lg border border-border/60">
            {creatorObj?.avatarUrl ? (
              <img
                src={creatorObj.avatarUrl}
                alt={creatorObj.name}
                className="h-9 w-9 rounded-full border border-gold/40 object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-gold font-bold text-sm">
                {creatorObj?.name ? creatorObj.name[0].toUpperCase() : 'C'}
              </div>
            )}
            <div>
              <span className="text-[10px] uppercase font-bold text-textMuted tracking-wider block">
                Content Creator
              </span>
              <span className="text-xs font-bold text-text">{creatorObj?.name || 'Unassigned'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-bg/40 p-3 rounded-lg border border-border/60">
            {editorObj?.avatarUrl ? (
              <img
                src={editorObj.avatarUrl}
                alt={editorObj.name}
                className="h-9 w-9 rounded-full border border-gold/40 object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-gold font-bold text-sm">
                {editorObj?.name ? editorObj.name[0].toUpperCase() : 'E'}
              </div>
            )}
            <div>
              <span className="text-[10px] uppercase font-bold text-textMuted tracking-wider block">
                Video Editor
              </span>
              <span className="text-xs font-bold text-text">{editorObj?.name || 'Unassigned'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Progress & Control Bar */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
        <h3 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center space-x-2">
          <Icon name="Activity" size={16} />
          <span>Production Stage Movement</span>
        </h3>

        {/* Stage Stepper Display */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2">
          {STAGES.map((s, idx) => {
            const isCurrent = s.key === video.boardStage;
            const isPassed = idx < stageIndex;

            return (
              <div
                key={s.key}
                className={`rounded-lg p-2.5 text-center text-xs font-semibold border transition-all ${
                  isCurrent
                    ? 'border-gold bg-gold/15 text-gold font-bold shadow-sm'
                    : isPassed
                    ? 'border-border bg-surface/80 text-textMuted'
                    : 'border-border/40 bg-bg/20 text-textMuted/40'
                }`}
              >
                <div className="text-[10px] font-mono text-textMuted mb-0.5">Step {idx + 1}</div>
                <div>{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Stepper Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={stageIndex === 0 || moveStageMutation.isPending}
            onClick={() => handleMove(STAGES[stageIndex - 1].key)}
            leftIcon={<Icon name="ChevronLeft" size={16} />}
          >
            Move back to {stageIndex > 0 ? STAGES[stageIndex - 1].label : 'Start'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            disabled={stageIndex === 5 || moveStageMutation.isPending}
            onClick={() => handleMove(STAGES[stageIndex + 1].key)}
            rightIcon={<Icon name="ChevronRight" size={16} />}
          >
            Advance to {stageIndex < 5 ? STAGES[stageIndex + 1].label : 'Published'}
          </Button>
        </div>
      </div>

      {/* Video Details & Media Editor */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-6">
        <h3 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center space-x-2">
          <Icon name="Settings" size={16} />
          <span>Production Details & Links</span>
        </h3>

        <form onSubmit={handleSaveDetails} className="space-y-4">
          <FileUpload
            label="Video Thumbnail / Poster Image"
            value={posterUrl}
            folder="qindil/videos"
            onUploadComplete={(url) => setPosterUrl(url)}
          />

          <Input
            label="Published Video Link (YouTube / Vimeo)"
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={publishedUrl}
            onChange={(e) => setPublishedUrl(e.target.value)}
            helperText="Attaching a published URL when stage is Published resolves the linked task automatically."
          />

          <Textarea
            label="Internal Production Notes"
            placeholder="Script notes, timecode timestamps, audio instructions, or reviewer feedback..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={updateDetailsMutation.isPending}
              leftIcon={<Icon name="Check" size={14} />}
            >
              Save Production Details
            </Button>
          </div>
        </form>
      </div>

      {/* Chronological Stage History Timeline */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
        <h3 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center space-x-2">
          <Icon name="Calendar" size={16} />
          <span>Chronological Stage History Log ({video.stageHistory.length})</span>
        </h3>

        {video.stageHistory.length === 0 ? (
          <p className="text-xs text-textMuted italic">No stage moves recorded yet.</p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 font-mono text-xs">
            {video.stageHistory.map((item, idx) => {
              const movedByObj = typeof item.movedBy === 'object' ? item.movedBy : null;
              const stageConfig = STAGES.find((s) => s.key === item.stage) || STAGES[0];

              return (
                <div key={idx} className="relative flex items-start space-x-3">
                  <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-gold border-2 border-surface" />
                  <div className="flex-1 bg-bg/50 border border-border/80 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${stageConfig.bg}`}>
                        {stageConfig.label.toUpperCase()}
                      </span>
                      <span className="text-text font-semibold font-sans">
                        Moved stage to "{stageConfig.label}"
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-textMuted text-[11px]">
                      {movedByObj?.avatarUrl && (
                        <img
                          src={movedByObj.avatarUrl}
                          alt={movedByObj.name}
                          className="h-4 w-4 rounded-full object-cover"
                        />
                      )}
                      <span>
                        by <strong className="text-text">{movedByObj?.name || 'User'}</strong> on{' '}
                        {new Date(item.movedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoDetailPage;
