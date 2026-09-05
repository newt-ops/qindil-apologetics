import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Icon from '../../components/icons/Icon';
import { useAssignTask } from '../../hooks/useTasks';
import { useTeamMembers } from '../../hooks/useTeam';
import { useActiveTopics } from '../../hooks/usePublicData';
import { Input, Textarea, Select, Button } from '../../components/ui';
import { toast } from '../../hooks/useToast';
import { TaskType } from '../../api/task';

const assignTaskSchema = z.object({
  type: z.enum(['article', 'video', 'general']),
  title: z.string().min(2, 'Title must be at least 2 characters long'),
  description: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  topicId: z.string().optional(),
  articleTitle: z.string().optional(),
  videoCategoryId: z.string().optional(),
  isRefutation: z.boolean().optional(),
  targetVideoUrl: z.string().optional(),
});

type FormData = z.infer<typeof assignTaskSchema>;

export const AssignTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const assignTaskMutation = useAssignTask();

  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [assigneeError, setAssigneeError] = useState<string | null>(null);

  // Fetch team members (admin & superAdmin only)
  const { data: teamData, isLoading: isTeamLoading } = useTeamMembers({
    limit: 100,
    includeUsers: false,
  });

  // Fetch active topics for article task assignment
  const { data: topics = [] } = useActiveTopics();

  const teamMembers = teamData?.data || [];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(assignTaskSchema),
    defaultValues: {
      type: 'article',
      title: '',
      description: '',
      dueDate: '',
      isRefutation: false,
    },
  });

  const selectedType = watch('type') as TaskType;

  const toggleAssignee = (userId: string) => {
    setAssigneeError(null);
    setSelectedAssignees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const onSubmit = async (formData: FormData) => {
    if (selectedAssignees.length === 0) {
      setAssigneeError('Please select at least one assignee for this task.');
      return;
    }

    if (selectedType === 'article' && !formData.topicId) {
      toast.error('Please select a topic for the article task.');
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
      const msg = err?.response?.data?.error?.message || 'Failed to assign task.';
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
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

      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold mb-2">
            <Icon name="Plus" size={14} />
            <span>SuperAdmin Task Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-text tracking-tight">
            Assign New Operation Task
          </h1>
          <p className="text-xs text-textMuted mt-1">
            Create an article, video, or general operational task and assign it to team members.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 1. Task Type Selector */}
          <Select
            label="Task Type *"
            options={[
              { value: 'article', label: 'Article Task (Drafts Article & Assigns Author)' },
              { value: 'video', label: 'Video Production Task (Creates VideoLog Board Item)' },
              { value: 'general', label: 'General Operational Task' },
            ]}
            {...register('type')}
          />

          {/* 2. Task Title */}
          <Input
            label="Task Title *"
            placeholder="e.g. Research Commentary on Fine-Tuning"
            error={errors.title?.message}
            {...register('title')}
          />

          {/* 3. Description */}
          <Textarea
            label="Task Description & Guidelines"
            rows={4}
            placeholder="Provide guidelines, sources, or specific instructions for assignees..."
            error={errors.description?.message}
            {...register('description')}
          />

          {/* 4. Assignee Multi-select */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-textMuted">
              Assign Team Members * ({selectedAssignees.length} selected)
            </label>

            {isTeamLoading ? (
              <p className="text-xs text-textMuted">Loading team members...</p>
            ) : teamMembers.length === 0 ? (
              <p className="text-xs text-danger">No active team members available.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto rounded-lg border border-border bg-bg/50 p-3">
                {teamMembers.map((member) => {
                  const isChecked = selectedAssignees.includes(member._id);
                  return (
                    <div
                      key={member._id}
                      onClick={() => toggleAssignee(member._id)}
                      className={`flex items-center space-x-3 rounded-md p-2.5 cursor-pointer border transition-colors ${
                        isChecked
                          ? 'border-gold bg-gold/15 text-gold font-bold'
                          : 'border-border bg-surface text-text hover:border-gold/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Handled by parent div
                        className="h-4 w-4 rounded border-border text-gold focus:ring-gold accent-gold"
                      />
                      <div className="truncate">
                        <p className="text-xs truncate">{member.name}</p>
                        <p className="text-[10px] text-textMuted truncate">{member.email}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {assigneeError && <p className="text-xs font-medium text-danger">{assigneeError}</p>}
          </div>

          {/* 5. Due Date Picker */}
          <Input
            label="Due Date & Time *"
            type="datetime-local"
            error={errors.dueDate?.message}
            {...register('dueDate')}
          />

          {/* 6. Type-Specific Fields */}
          {selectedType === 'article' && (
            <div className="rounded-lg border border-gold/30 bg-gold/5 p-4 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                <Icon name="FileText" size={14} />
                <span>Article Task Configuration</span>
              </h4>

              <Select
                label="Assign to Topic *"
                placeholder="Select a topic..."
                options={topics.map((t: any) => ({ value: t._id, label: t.name }))}
                error={errors.topicId?.message}
                {...register('topicId')}
              />

              <Input
                label="Pre-filled Article Title (Optional)"
                placeholder="Defaults to task title if left empty"
                {...register('articleTitle')}
              />
            </div>
          )}

          {selectedType === 'video' && (
            <div className="rounded-lg border border-gold/30 bg-gold/5 p-4 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                <Icon name="Video" size={14} />
                <span>Video Production Task Configuration</span>
              </h4>

              <Input
                label="Target Video URL (Optional)"
                placeholder="https://youtube.com/watch?v=..."
                {...register('targetVideoUrl')}
              />

              <div className="flex items-center space-x-2 pt-1">
                <input
                  id="isRefutation"
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-gold focus:ring-gold accent-gold"
                  {...register('isRefutation')}
                />
                <label htmlFor="isRefutation" className="text-xs font-semibold text-text select-none cursor-pointer">
                  This video task is a Refutation Paper
                </label>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="border-t border-border pt-4 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={assignTaskMutation.isPending}
              leftIcon={<Icon name="Plus" size={16} />}
              className="px-6"
            >
              Create & Assign Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTaskPage;
