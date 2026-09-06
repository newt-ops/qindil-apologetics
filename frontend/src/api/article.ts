import apiClient from './client';
import { User } from '../stores/authStore';

export type ArticleStatus =
  | 'draft'
  | 'inReview'
  | 'changesRequested'
  | 'approved'
  | 'published'
  | 'archived';

export interface ArticleTopic {
  _id: string;
  name: string;
  slug: string;
}

export interface ArticleItem {
  _id: string;
  title: string;
  slug?: string;
  topic?: ArticleTopic | string;
  author: User | string;
  lastEditedBy?: User | string;
  content?: string;
  excerpt?: string;
  coverImageUrl?: string;
  status: ArticleStatus;
  reviewNotes?: string;
  publishedAt?: string;
  lastAutosavedAt?: string;
  viewCount: number;
  linkedTaskId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateArticleDraftPayload {
  title?: string;
  slug?: string;
  topic?: string;
  content?: any;
  excerpt?: string;
  coverImageUrl?: string;
}

export const getMyArticlesApi = async () => {
  const response = await apiClient.get<{ success: boolean; data: ArticleItem[] }>(
    '/articles/mine'
  );
  return response.data;
};

export const getArticleForEditApi = async (id: string) => {
  const response = await apiClient.get<{ success: boolean; data: ArticleItem }>(
    `/articles/${id}/edit`
  );
  return response.data;
};

export const updateArticleDraftApi = async (id: string, data: UpdateArticleDraftPayload) => {
  const response = await apiClient.patch<{ success: boolean; data: ArticleItem }>(
    `/articles/${id}`,
    data
  );
  return response.data;
};

export const autosaveArticleApi = async (id: string, data: UpdateArticleDraftPayload) => {
  const response = await apiClient.patch<{ success: boolean; data: ArticleItem }>(
    `/articles/${id}/autosave`,
    data
  );
  return response.data;
};

export const submitForReviewApi = async (id: string, data?: UpdateArticleDraftPayload) => {
  const response = await apiClient.patch<{ success: boolean; data: ArticleItem }>(
    `/articles/${id}/submit`,
    data || {}
  );
  return response.data;
};

export type ReviewDecision = 'approve' | 'requestChanges' | 'publish';

export const reviewArticleApi = async (
  id: string,
  decision: ReviewDecision,
  reviewNotes?: string
) => {
  const response = await apiClient.patch<{ success: boolean; data: ArticleItem }>(
    `/articles/${id}/review`,
    { decision, reviewNotes }
  );
  return response.data;
};

export const getReviewQueueApi = async () => {
  const response = await apiClient.get<{ success: boolean; data: ArticleItem[] }>(
    '/articles/review-queue'
  );
  return response.data;
};

export const requestChangesApi = async (id: string, reviewNotes: string) => {
  const response = await apiClient.patch<{ success: boolean; data: ArticleItem }>(
    `/articles/${id}/request-changes`,
    { reviewNotes }
  );
  return response.data;
};

export const approveArticleApi = async (id: string) => {
  const response = await apiClient.patch<{ success: boolean; data: ArticleItem }>(
    `/articles/${id}/approve`
  );
  return response.data;
};

export const publishArticleApi = async (id: string) => {
  const response = await apiClient.patch<{ success: boolean; data: ArticleItem }>(
    `/articles/${id}/publish`
  );
  return response.data;
};

export const archiveArticleApi = async (id: string) => {
  const response = await apiClient.patch<{ success: boolean; data: ArticleItem }>(
    `/articles/${id}/archive`
  );
  return response.data;
};

export interface CreateArticleDraftPayload {
  title: string;
  topic?: string;
  topicId?: string;
  authorId?: string;
}

export interface ListArticlesAdminParams {
  status?: string;
  topic?: string;
  author?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ArticlesListResponseData {
  items: ArticleItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const createArticleDraftApi = async (data: CreateArticleDraftPayload) => {
  const response = await apiClient.post<{ success: boolean; data: ArticleItem }>(
    '/articles',
    data
  );
  return response.data;
};

export const listArticlesAdminApi = async (params?: ListArticlesAdminParams) => {
  const response = await apiClient.get<{
    success: boolean;
    data: ArticlesListResponseData | ArticleItem[];
  }>('/articles', { params });
  return response.data;
};

export const deleteArticleDraftApi = async (id: string) => {
  const response = await apiClient.delete<{ success: boolean; data: { message: string } }>(
    `/articles/${id}`
  );
  return response.data;
};
