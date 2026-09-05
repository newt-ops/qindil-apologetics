import { z } from 'zod';

export const assignTaskSchema = z.object({
  type: z.enum(['article', 'video', 'general'], {
    required_error: 'Task type is required',
    invalid_type_error: 'Task type must be article, video, or general',
  }),
  title: z.string().min(2, 'Title must be at least 2 characters long'),
  description: z.string().optional(),
  assignedTo: z
    .array(z.string().min(1, 'Assignee ID cannot be empty'))
    .min(1, 'At least one assignee is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  topicId: z.string().optional(),
  articleTitle: z.string().optional(),
  videoCategoryId: z.string().optional(),
  isRefutation: z.boolean().optional(),
  targetVideoUrl: z.string().optional(),
}).refine((data) => {
  if (data.type === 'article' && !data.topicId) {
    return false;
  }
  return true;
}, {
  message: 'topicId is required when task type is "article"',
  path: ['topicId'],
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(['pending', 'inProgress', 'inReview', 'done', 'overdue'], {
    required_error: 'Status is required',
  }),
});

export type AssignTaskPayload = z.infer<typeof assignTaskSchema>;
export type UpdateTaskStatusPayload = z.infer<typeof updateTaskStatusSchema>;
