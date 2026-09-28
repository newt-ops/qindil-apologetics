import apiClient from './client';
import { User } from '../stores/authStore';
import { ArticleTopic } from './article';

export type ProposalStatus = 'pending' | 'approved' | 'rejected';

export interface ArticleProposalItem {
  _id: string;
  author: User | { _id: string; name: string; email: string; avatarUrl?: string };
  title: string;
  topic?: ArticleTopic | { _id: string; name: string; slug: string };
  summary: string;
  proposedDueDate?: string;
  status: ProposalStatus;
  adminFeedback?: string;
  assignedTaskId?: { _id: string; title: string; status: string; dueDate: string } | string;
  reviewedBy?: User | { _id: string; name: string; email: string };
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleProposalPayload {
  title: string;
  topic?: string;
  summary: string;
  proposedDueDate?: string;
}

export interface RejectArticleProposalPayload {
  adminFeedback: string;
}

export const createArticleProposalApi = async (data: CreateArticleProposalPayload) => {
  const response = await apiClient.post<{ success: boolean; data: ArticleProposalItem }>(
    '/article-proposals',
    data
  );
  return response.data;
};

export const getMyArticleProposalsApi = async () => {
  const response = await apiClient.get<{ success: boolean; data: ArticleProposalItem[] }>(
    '/article-proposals/mine'
  );
  return response.data;
};

export interface ListProposalsParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const listArticleProposalsApi = async (params?: ListProposalsParams) => {
  const response = await apiClient.get<{
    success: boolean;
    data: ArticleProposalItem[];
    meta?: { page: number; limit: number; total: number; pages: number };
  }>('/article-proposals', { params });
  return response.data;
};

export const rejectArticleProposalApi = async (id: string, data: RejectArticleProposalPayload) => {
  const response = await apiClient.patch<{ success: boolean; data: ArticleProposalItem }>(
    `/article-proposals/${id}/reject`,
    data
  );
  return response.data;
};
