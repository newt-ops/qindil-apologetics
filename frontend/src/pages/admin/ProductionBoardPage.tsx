import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/icons/Icon';
import {
  useBoard,
  useMoveStage,
  useUpdateVideoDetails,
} from '../../hooks/useVideos';
import { useHasRole } from '../../hooks/useHasRole';
import { VideoLogItem, VideoBoardStage } from '../../api/video';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import FileUpload from '../../components/admin/FileUpload';
import Spinner from '../../components/ui/Spinner';

interface StageColumnConfig {
  key: VideoBoardStage;
  label: string;
  description: string;
  headerBg: string;
  badgeBg: string;
}

const STAGES_CONFIG: StageColumnConfig[] = [
  {
    key: 'idea',
    label: 'Idea',
    description: 'Initial concepts & research',
    headerBg: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  {
    key: 'scripting',
    label: 'Scripting',
    description: 'Outline & text drafting',
    headerBg: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  },
  {
    key: 'filming',
    label: 'Filming',
    description: 'Recording & audio capture',
    headerBg: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
  {
    key: 'editing',
    label: 'Editing',
    description: 'Post-production & cuts',
    headerBg: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
  },
  {
    key: 'review',
    label: 'Review',
    description: 'Editorial & fact checking',
    headerBg: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
    badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  },
  {
    key: 'published',
    label: 'Published',
    description: 'Live on video channels',
    headerBg: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
];

export const ProductionBoardPage: React.FC = () => {
  const isSuperAdmin = useHasRole('superAdmin');

  const { data: videos = [], isLoading } = useBoard();
  const moveStageMutation = useMoveStage();
  const updateDetailsMutation = useUpdateVideoDetails();

  // Edit Video Modal State
  const [editTarget, setEditTarget] = useState<VideoLogItem | null>(null);
  const [posterUrl, setPosterUrl] = useState('');
  const [publishedUrl, setPublishedUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [activeMobileStage, setActiveMobileStage] = useState<VideoBoardStage>('scripting');

  const openEditModal = (video: VideoLogItem) => {
    setEditTarget(video);
    setPosterUrl(video.posterUrl || '');
    setPublishedUrl(video.publishedUrl || '');
    setNotes(video.notes || '');
  };

  const handleMoveStage = async (video: VideoLogItem, targetStage: VideoBoardStage) => {
    try {
      await moveStageMutation.mutateAsync({ id: video._id, stage: targetStage });
      setActionSuccess(`Moved "${video.title}" to ${targetStage.toUpperCase()}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to move video stage.');
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    try {
      await updateDetailsMutation.mutateAsync({
        id: editTarget._id,
        data: {
          posterUrl: posterUrl.trim() || undefined,
          publishedUrl: publishedUrl.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      });

      setEditTarget(null);
      setActionSuccess(`Updated details for "${editTarget.title}"`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update video details.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold mb-2">
            <Icon name="Video" size={14} />
            <span>{isSuperAdmin ? 'SuperAdmin Overview' : 'Assigned Productions'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            Production Board
          </h1>
          <p className="text-xs sm:text-sm text-textMuted mt-1">
            Kanban workflow tracking apologetics video logs across production stages.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-textMuted bg-surface px-3 py-1.5 rounded-lg border border-border">
          <Icon name="Activity" size={14} className="text-gold" />
          <span>Total Videos: <strong className="text-gold">{videos.length}</strong></span>
        </div>
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

      {/* Mobile Stage Selector Tab Strip */}
      <div className="md:hidden flex overflow-x-auto gap-2 pb-2 scrollbar-none border-b border-border select-none">
        {STAGES_CONFIG.map((s) => {
          const count = videos.filter((v) => v.boardStage === s.key).length;
          const isSelected = activeMobileStage === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setActiveMobileStage(s.key)}
              className={`flex items-center space-x-1.5 shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-gold text-bg shadow-md'
                  : 'bg-surface text-textMuted hover:text-text border border-border'
              }`}
            >
              <span>{s.label}</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${isSelected ? 'bg-bg/30 text-bg' : 'bg-border text-textMuted'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 overflow-x-auto pb-6 select-none">
        {STAGES_CONFIG.map((stageConfig, stageIndex) => {
          const stageVideos = videos.filter((v) => v.boardStage === stageConfig.key);
          const isMobileVisible = activeMobileStage === stageConfig.key;

          return (
            <div
              key={stageConfig.key}
              className={`flex flex-col rounded-xl border border-border/80 bg-surface/50 overflow-hidden ${
                isMobileVisible ? 'flex' : 'hidden md:flex'
              } w-full md:min-w-[260px]`}
            >
              {/* Stage Header */}
              <div className={`p-3 border-b flex items-center justify-between ${stageConfig.headerBg}`}>
                <div>
                  <h3 className="text-sm font-bold tracking-tight leading-none">
                    {stageConfig.label}
                  </h3>
                  <p className="text-[10px] opacity-80 mt-0.5">{stageConfig.description}</p>
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-mono font-bold ${stageConfig.badgeBg}`}
                >
                  {stageVideos.length}
                </span>
              </div>

              {/* Cards Column Body */}
              <div className="p-2 space-y-3 flex-1 min-h-[480px] bg-bg/20 overflow-y-auto">
                {stageVideos.length === 0 ? (
                  <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border/40 text-[11px] text-textMuted/50 italic text-center p-3">
                    No videos in {stageConfig.label}
                  </div>
                ) : (
                  stageVideos.map((video) => {
                    const creatorObj = typeof video.contentCreator === 'object' ? video.contentCreator : null;
                    const editorObj = typeof video.editor === 'object' ? video.editor : null;
                    const taskObj = typeof video.task === 'object' ? video.task : null;

                    const isOverdue =
                      taskObj?.dueDate &&
                      new Date(taskObj.dueDate) < new Date() &&
                      taskObj.status !== 'done';

                    return (
                      <div
                        key={video._id}
                        className="group relative rounded-lg border border-border bg-surface p-3 space-y-3 shadow-sm hover:border-gold/50 transition-all duration-150"
                      >
                        {/* Refutation or Category Badge */}
                        <div className="flex items-center justify-between text-[10px]">
                          {video.isRefutation ? (
                            <span className="rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 font-bold uppercase tracking-wider">
                              Refutation
                            </span>
                          ) : (
                            <Badge variant="gold">
                              {typeof video.category === 'object' && video.category
                                ? video.category.name
                                : 'Video'}
                            </Badge>
                          )}

                          {/* Due Date Indicator */}
                          {taskObj?.dueDate && (
                            <span
                              className={`font-mono text-[10px] flex items-center space-x-1 ${
                                isOverdue ? 'text-danger font-bold animate-pulse' : 'text-textMuted'
                              }`}
                            >
                              <Icon name="Calendar" size={10} />
                              <span>
                                {new Date(taskObj.dueDate).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <Link
                          to={`/admin/production/${video._id}`}
                          className="font-bold text-text hover:text-gold transition-colors block text-xs line-clamp-2 leading-snug"
                        >
                          {video.title}
                        </Link>

                        {/* Poster Thumbnail */}
                        {video.posterUrl && (
                          <div className="rounded overflow-hidden border border-border h-24 bg-bg">
                            <img
                              src={video.posterUrl}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Published URL Link pill */}
                        {video.publishedUrl && (
                          <a
                            href={video.publishedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-[10px] text-gold hover:underline font-mono truncate max-w-full"
                          >
                            <Icon name="ExternalLink" size={10} />
                            <span className="truncate">{video.publishedUrl}</span>
                          </a>
                        )}

                        {/* Team Members */}
                        <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[10px] text-textMuted">
                          <div className="flex items-center space-x-2">
                            {/* Creator */}
                            <div className="flex items-center space-x-1" title={`Creator: ${creatorObj?.name}`}>
                              <span className="font-semibold text-textMuted/70">C:</span>
                              {creatorObj?.avatarUrl ? (
                                <img
                                  src={creatorObj.avatarUrl}
                                  alt={creatorObj.name}
                                  className="h-4 w-4 rounded-full border border-gold/30 object-cover"
                                />
                              ) : (
                                <span className="font-bold text-text truncate max-w-[50px]">
                                  {creatorObj?.name || 'Self'}
                                </span>
                              )}
                            </div>

                            {/* Editor */}
                            <div className="flex items-center space-x-1" title={`Editor: ${editorObj?.name}`}>
                              <span className="font-semibold text-textMuted/70">E:</span>
                              {editorObj?.avatarUrl ? (
                                <img
                                  src={editorObj.avatarUrl}
                                  alt={editorObj.name}
                                  className="h-4 w-4 rounded-full border border-gold/30 object-cover"
                                />
                              ) : (
                                <span className="font-bold text-text truncate max-w-[50px]">
                                  {editorObj?.name || 'Self'}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => openEditModal(video)}
                            className="text-textMuted hover:text-gold transition-colors p-1"
                            title="Edit poster, published URL, or notes"
                          >
                            <Icon name="Settings" size={12} />
                          </button>
                        </div>

                        {/* Stage Control Action Buttons */}
                        <div className="flex items-center justify-between pt-1 gap-1 border-t border-border/40">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={stageIndex === 0 || moveStageMutation.isPending}
                            onClick={() =>
                              handleMoveStage(video, STAGES_CONFIG[stageIndex - 1].key)
                            }
                            className="text-[10px] px-2 py-1 h-7"
                            title={
                              stageIndex > 0
                                ? `Move back to ${STAGES_CONFIG[stageIndex - 1].label}`
                                : 'First stage'
                            }
                          >
                            <Icon name="ChevronLeft" size={12} />
                            <span>{stageIndex > 0 ? STAGES_CONFIG[stageIndex - 1].label : ''}</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={stageIndex === 5 || moveStageMutation.isPending}
                            onClick={() =>
                              handleMoveStage(video, STAGES_CONFIG[stageIndex + 1].key)
                            }
                            className="text-[10px] px-2 py-1 h-7 text-gold hover:text-gold"
                            title={
                              stageIndex < 5
                                ? `Advance to ${STAGES_CONFIG[stageIndex + 1].label}`
                                : 'Published'
                            }
                          >
                            <span>{stageIndex < 5 ? STAGES_CONFIG[stageIndex + 1].label : ''}</span>
                            <Icon name="ChevronRight" size={12} />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Details Modal */}
      {editTarget && (
        <Modal
          isOpen={Boolean(editTarget)}
          onClose={() => setEditTarget(null)}
          title={`Edit Video Details: "${editTarget.title}"`}
          size="md"
        >
          <form onSubmit={handleSaveDetails} className="space-y-4 font-sans">
            <FileUpload
              label="Video Poster / Thumbnail Image"
              value={posterUrl}
              folder="qindil/videos"
              onUploadComplete={(url) => setPosterUrl(url)}
            />

            <Input
              label="Published Video Link (YouTube / Vimeo URL)"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={publishedUrl}
              onChange={(e) => setPublishedUrl(e.target.value)}
              helperText="Setting a published link when video is in Published stage automatically marks task complete."
            />

            <Textarea
              label="Internal Production Notes"
              placeholder="Add scripting references, timecodes, or editing instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />

            <div className="flex justify-end space-x-3 pt-3 border-t border-border">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setEditTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={updateDetailsMutation.isPending}
                leftIcon={<Icon name="Check" size={14} />}
              >
                Save Details
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ProductionBoardPage;
