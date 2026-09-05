import apiClient from './client';
import { User } from '../stores/authStore';

export type TaskType = 'article' | 'video' | 'general';
export type TaskStatus = 'pending' | 'inProgress' | 'inReview' | 'done' | 'overdue';

export interface LinkedArticle {
  _id: string;
  title: string;
  slug: string;
  coverImageUrl?: string;
  status: string;
}

export interface LinkedVideo {
  _id: string;
  title: string;
  boardStage?: string;
  videoUrl?: string;
  platform?: string;
}

export interface TaskItem {
  _id: string;
  type: TaskType;
  title: string;
  description?: string;
  assignedTo: (User | string)[];
  createdBy: User | string;
  dueDate: string;
  status: TaskStatus;
  isOverdue?: boolean;
  linkedArticle?: LinkedArticle;
  linkedVideo?: LinkedVideo;
  createdAt: string;
  updatedAt: string;
}

export interface AssignTaskPayload {
  type: TaskType;
  title: string;
  description?: string;
  assignedTo: string[];
  dueDate: string;
  topicId?: string;
  articleTitle?: string;
  videoCategoryId?: string;
  isRefutation?: boolean;
  targetVideoUrl?: string;
}

export interface ListTasksParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  assignee?: string;
}

export interface ListTasksResponse {
  success: boolean;
  data: TaskItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const getMyTasksApi = async () => {
  const response = await apiClient.get<{ success: boolean; data: TaskItem[] }>(
    '/tasks/mine'
  );
  return response.data;
};

export const assignTaskApi = async (data: AssignTaskPayload) => {
  const response = await apiClient.post<{ success: boolean; data: TaskItem }>(
    '/tasks',
    data
  );
  return response.data;
};

export const listAllTasksApi = async (params?: ListTasksParams) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.status) queryParams.set('status', params.status);
  if (params?.type) queryParams.set('type', params.type);
  if (params?.assignee) queryParams.set('assignee', params.assignee);

  const response = await apiClient.get<ListTasksResponse>(
    `/tasks?${queryParams.toString()}`
  );
  return response.data;
};

export const getTaskByIdApi = async (id: string) => {
  const response = await apiClient.get<{ success: boolean; data: TaskItem }>(
    `/tasks/${id}`
  );
  return response.data;
};

export const updateTaskStatusApi = async (id: string, status: TaskStatus) => {
  const response = await apiClient.patch<{ success: boolean; data: TaskItem }>(
    `/tasks/${id}/status`,
    { status }
  );
  return response.data;
};
