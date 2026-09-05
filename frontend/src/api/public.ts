import apiClient from './client';

export interface PublicTopic {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  coverImageUrl?: string;
  order: number;
}

export interface PublicArticleAuthor {
  _id: string;
  name: string;
  avatarUrl?: string;
}

export interface PublicArticleTopic {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface PublicArticle {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: any;
  coverImageUrl?: string;
  publishedAt: string;
  updatedAt?: string;
  viewCount?: number;
  topic?: PublicArticleTopic;
  author?: PublicArticleAuthor;
}

export interface ArticlesPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ArticlesResponse {
  articles: PublicArticle[];
  pagination: ArticlesPaginationMeta;
  topic?: PublicTopic | null;
}

export interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface PublicEvent {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  allDay: boolean;
  location?: string;
}

export const getFeaturedArticlesApi = async () => {
  const response = await apiClient.get<{ success: boolean; data: PublicArticle[] }>(
    '/public/articles/featured'
  );
  return response.data;
};

export const getActiveTopicsApi = async () => {
  const response = await apiClient.get<{ success: boolean; data: PublicTopic[] }>(
    '/public/topics'
  );
  return response.data;
};

export const getArticlesApi = async (params: { topic?: string; search?: string; page?: number; limit?: number }) => {
  const queryParams = new URLSearchParams();
  if (params.topic) queryParams.set('topic', params.topic);
  if (params.search) queryParams.set('search', params.search);
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());

  const response = await apiClient.get<{ success: boolean; data: ArticlesResponse }>(
    `/public/articles?${queryParams.toString()}`
  );
  return response.data;
};

export const getArticleBySlugApi = async (slug: string) => {
  const response = await apiClient.get<{ success: boolean; data: PublicArticle }>(
    `/public/articles/${slug}`
  );
  return response.data;
};

export const incrementViewCountApi = async (slug: string) => {
  const response = await apiClient.patch<{ success: boolean; data: { viewCount: number } }>(
    `/public/articles/${slug}/view`
  );
  return response.data;
};

export const submitContactMessageApi = async (data: ContactPayload) => {
  const response = await apiClient.post<{ success: boolean; data: { message: string } }>(
    '/public/contact',
    data
  );
  return response.data;
};

export const getPublicEventsApi = async (params?: { includePast?: boolean }) => {
  const queryParams = new URLSearchParams();
  if (params?.includePast) queryParams.set('includePast', 'true');

  const response = await apiClient.get<{ success: boolean; data: PublicEvent[] }>(
    `/public/events?${queryParams.toString()}`
  );
  return response.data;
};
