import apiClient from './client';

export interface TopicItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  coverImageUrl?: string;
  order: number;
  isActive: boolean;
  articleCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTopicPayload {
  name: string;
  slug?: string;
  description?: string;
  coverImageUrl?: string;
  order?: number;
}

export interface UpdateTopicPayload {
  name?: string;
  slug?: string;
  description?: string;
  coverImageUrl?: string;
  order?: number;
  isActive?: boolean;
}

export const listAdminTopicsApi = async () => {
  const response = await apiClient.get<{ success: boolean; data: TopicItem[] }>('/topics');
  return response.data;
};

export const createTopicApi = async (data: CreateTopicPayload) => {
  const response = await apiClient.post<{ success: boolean; data: TopicItem }>('/topics', data);
  return response.data;
};

export const updateTopicApi = async (id: string, data: UpdateTopicPayload) => {
  const response = await apiClient.patch<{ success: boolean; data: TopicItem }>(
    `/topics/${id}`,
    data
  );
  return response.data;
};

export const deleteTopicApi = async (id: string) => {
  const response = await apiClient.delete<{ success: boolean; data: any }>(`/topics/${id}`);
  return response.data;
};

export const reorderTopicsApi = async (orderedIds: string[]) => {
  const response = await apiClient.patch<{ success: boolean; data: TopicItem[] }>(
    '/topics/reorder',
    { orderedIds }
  );
  return response.data;
};
