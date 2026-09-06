import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Icon from '../../../components/icons/Icon';
import { useAssignTask } from '../../../hooks/useTasks';
import { useTeamMembers } from '../../../hooks/useTeam';
import { useActiveTopics } from '../../../hooks/usePublicData';
import { Input, Textarea, Select, Button } from '../../../components/ui';
import { toast } from '../../../hooks/useToast';
import { TaskType } from '../../../api/task';

const assignTaskSchema = z.object({
  type: z.enum(['article', 'video', 'general']),
  title: z.string().min(2, 'Title must be at least 2 characters long'),
  description: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  topicId: z.string().optional(),
  articleTitle: z.string().optional(),
  videoType: z.enum(['refutation', 'normal']).optional(),
  destination: z.enum(['official', 'personal']).optional(),
  targetVideoUrl: z.string().optional(),
});

type FormData = z.infer<typeof assignTaskSchema>;

export const AssignTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const assignTaskMutation = useAssignTask();

  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [assigneeError, setAssigneeError] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState('');

  // Fetch team members
  const { data: teamData, isLoading: isTeamLoading } = useTeamMembers({
    limit: 100,
    includeUsers: false,
  });

  // Fetch active topics
  const { data: topics = [] } = useActiveTopics();

  const teamMembers = teamData?.data || [];

  // Filtered members for selector
  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return teamMembers;
    const q = memberSearch.toLowerCase();
    return teamMembers.filter(
      (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    );
  }, [teamMembers, memberSearch]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(assignTaskSchema),
    defaultValues: {
      type: 'article',
      title: '',
      description: '',
      dueDate: '',
      videoType: 'normal',
      destination: 'official',
    },
  });

  const selectedType = watch('type') as TaskType;
  const selectedVideoType = watch('videoType');

  const toggleAssignee = (userId: string) => {
    setAssigneeError(null);
    setSelectedAssignees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAllAssignees = () => {
    setAssigneeError(null);
    setSelectedAssignees(teamMembers.map((m) => m._id));
  };

  const handleClearAssignees = () => {
    setSelectedAssignees([]);
  };

  // Quick Due Date Presets
  const setDueDatePreset = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(18, 0, 0, 0); // 6:00 PM
    const isoString = d.toISOString().slice(0, 16);
    setValue('dueDate', isoString, { shouldValidate: true });
  };

  const onSubmit = async (formData: FormData) => {
    if (selectedAssignees.length === 0) {
      setAssigneeError('Please select at least one assignee for this task.');
      return;
    }

    if (selectedType === 'article' && !formData.topicId) {
      toast.error('Please select a discipline for the article task.');
      return;
    }

    if (
      selectedType === 'video' &&
      formData.videoType === 'refutation' &&
      !formData.targetVideoUrl?.trim()
    ) {
      toast.error('Target Video URL is required for refutation video tasks.');
      return;
    }

    try {
      await assignTaskMutation.mutateAsync({
        ...formData,
        assignedTo: selectedAssignees,
      });

      toast.success('Task created and assigned successfully!');
      navigate('/admin/tasks');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || 'Failed to assign task.';
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Link
          to="/admin/tasks"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-textMuted hover:text-gold transition-colors"
        >
          <Icon name="ArrowLeft" size={16} />
          <span>Back to All Tasks</span>
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold mb-2">
            <Icon name="Plus" size={14} />
            <span>Task Delegation System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            Assign Operations Task
          </h1>
          <p className="text-xs sm:text-sm text-textMuted mt-1">
            Delegate research articles, refutation video productions, or general team assignments.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 1. Task Type Selector */}
          <Select
            label="Task Classification *"
            options={[
              { value: 'article', label: 'Article Task (Initializes Draft & Workspace)' },
              { value: 'video', label: 'Video Production Task (Enters Production Board)' },
              { value: 'general', label: 'General Operational Task' },
            ]}
            {...register('type')}
          />

          {/* 2. Task Title */}
          <Input
            label="Task Title *"
            placeholder="e.g., Ontological Commentary on Classical Texts"
            error={errors.title?.message}
            {...register('title')}
          />

          {/* 3. Description */}
          <Textarea
            label="Task Description & Guidelines"
            rows={4}
            placeholder="Provide context, required citations, target audience, or specific guidelines for assignees..."
            error={errors.description?.message}
            {...register('description')}
          />

          {/* 4. Assignee Multi-select */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-textMuted">
                Assign Team Members * ({selectedAssignees.length} selected)
              </label>

              <div className="flex items-center space-x-2 text-[11px]">
                <button
                  type="button"
                  onClick={handleSelectAllAssignees}
                  className="text-gold hover:underline font-medium"
                >
                  Select All
                </button>
                <span className="text-border">·</span>
                <button
                  type="button"
                  onClick={handleClearAssignees}
                  className="text-textMuted hover:text-text"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Member search filter */}
            <Input
              placeholder="Filter members by name or email..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              leftElement={<Icon name="Search" size={14} className="text-textMuted" />}
            />

            {isTeamLoading ? (
              <p className="text-xs text-textMuted">Loading team directory...</p>
            ) : filteredMembers.length === 0 ? (
              <p className="text-xs text-textMuted p-3 text-center bg-bg/50 rounded-lg border border-border">
                No matching team members found.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto rounded-xl border border-border bg-bg/40 p-3">
                {filteredMembers.map((member) => {
                  const isChecked = selectedAssignees.includes(member._id);
                  const firstRole =
                    Array.isArray(member.roles) && member.roles.length > 0
                      ? typeof member.roles[0] === 'string'
                        ? member.roles[0]
                        : member.roles[0].name
                      : 'staff';

                  return (
                    <div
                      key={member._id}
                      onClick={() => toggleAssignee(member._id)}
                      className={`flex items-center space-x-2.5 rounded-lg p-2 cursor-pointer border transition-all ${
                        isChecked
                          ? 'border-gold bg-gold/15 text-gold font-bold shadow-2xs'
                          : 'border-border bg-surface text-text hover:border-gold/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="h-4 w-4 rounded border-border text-gold focus:ring-gold accent-gold shrink-0"
                      />
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="h-6 w-6 rounded-full object-cover border border-gold/40 shrink-0"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-gold/20 text-gold flex items-center justify-center text-[10px] font-bold shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="truncate flex-1 min-w-0">
                        <p className="text-xs truncate font-medium">{member.name}</p>
                        <p className="text-[10px] text-textMuted truncate font-mono">
                          {firstRole}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {assigneeError && <p className="text-xs font-medium text-danger">{assigneeError}</p>}
          </div>

          {/* 5. Due Date Picker & Presets */}
          <div className="space-y-2">
            <Input
              label="Task Deadline Date & Time *"
              type="datetime-local"
              error={errors.dueDate?.message}
              {...register('dueDate')}
            />

            {/* Quick preset chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-[11px] text-textMuted">Quick Presets:</span>
              <button
                type="button"
                onClick={() => setDueDatePreset(1)}
                className="px-2 py-0.5 rounded-md border border-border bg-surface text-[11px] hover:border-gold hover:text-gold transition-colors"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setDueDatePreset(3)}
                className="px-2 py-0.5 rounded-md border border-border bg-surface text-[11px] hover:border-gold hover:text-gold transition-colors"
              >
                In 3 Days
              </button>
              <button
                type="button"
                onClick={() => setDueDatePreset(7)}
                className="px-2 py-0.5 rounded-md border border-border bg-surface text-[11px] hover:border-gold hover:text-gold transition-colors"
              >
                In 1 Week
              </button>
              <button
                type="button"
                onClick={() => setDueDatePreset(14)}
                className="px-2 py-0.5 rounded-md border border-border bg-surface text-[11px] hover:border-gold hover:text-gold transition-colors"
              >
                In 2 Weeks
              </button>
            </div>
          </div>

          {/* 6. Type-Specific Fields */}
          {selectedType === 'article' && (
            <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 sm:p-5 space-y-4 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                <Icon name="FileText" size={15} />
                <span>Article Configuration</span>
              </h4>

              <Select
                label="Assign to Research Discipline *"
                placeholder="Select a discipline..."
                options={topics.map((t: any) => ({ value: t._id, label: t.name }))}
                error={errors.topicId?.message}
                {...register('topicId')}
              />

              <Input
                label="Draft Article Title (Optional)"
                placeholder="Defaults to task title if left empty"
                {...register('articleTitle')}
              />
            </div>
          )}

          {selectedType === 'video' && (
            <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 sm:p-5 space-y-4 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                <Icon name="Video" size={15} />
                <span>Video Production Configuration</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Video Type *"
                  options={[
                    { value: 'normal', label: 'Normal Scholarly Video' },
                    { value: 'refutation', label: 'Critical Refutation Video' },
                  ]}
                  {...register('videoType')}
                />

                <Select
                  label="Publishing Destination *"
                  options={[
                    { value: 'official', label: 'Official Qindil Channel' },
                    { value: 'personal', label: 'Personal Creator Account' },
                  ]}
                  {...register('destination')}
                />
              </div>

              {selectedVideoType === 'refutation' && (
                <Input
                  label="Target Video URL (Required for Refutations) *"
                  placeholder="https://youtube.com/watch?v=..."
                  error={errors.targetVideoUrl?.message}
                  {...register('targetVideoUrl')}
                />
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="border-t border-border pt-4 flex justify-end space-x-2">
            <Link to="/admin/tasks">
              <Button type="button" variant="secondary" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={assignTaskMutation.isPending}
              leftIcon={<Icon name="Plus" size={16} />}
              className="px-6"
            >
              Create &amp; Assign Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTaskPage;
