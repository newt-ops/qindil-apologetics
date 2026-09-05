import apiClient from './client';
import { User } from '../stores/authStore';

export interface CommentItem {
  _id: string;
  task: string;
  author: User;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export const listCommentsApi = async (taskId: string) => {
  const response = await apiClient.get<{ success: boolean; data: CommentItem[] }>(
    `/tasks/${taskId}/comments`
  );
  return response.data;
};

export const addCommentApi = async (taskId: string, body: string) => {
  const response = await apiClient.post<{ success: boolean; data: CommentItem }>(
    `/tasks/${taskId}/comments`,
    { body }
  );
  return response.data;
};
