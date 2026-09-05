import apiClient from './client';

export type ContactMessageStatus = 'new' | 'read' | 'archived';

export interface ContactMessageItem {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessagesParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface ContactMessagesResponse {
  items: ContactMessageItem[];
  unreadCount: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ContactMessageDetailResponse {
  message: ContactMessageItem;
  unreadCount: number;
}

export const listContactMessagesApi = async (params?: ContactMessagesParams) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.status) queryParams.set('status', params.status);
  if (params?.search) queryParams.set('search', params.search);

  const response = await apiClient.get<{ success: boolean; data: ContactMessagesResponse }>(
    `/contact-messages?${queryParams.toString()}`
  );
  return response.data;
};

export const getContactMessageApi = async (id: string) => {
  const response = await apiClient.get<{ success: boolean; data: ContactMessageDetailResponse }>(
    `/contact-messages/${id}`
  );
  return response.data;
};

export const archiveContactMessageApi = async (id: string) => {
  const response = await apiClient.patch<{ success: boolean; data: ContactMessageDetailResponse }>(
    `/contact-messages/${id}/archive`
  );
  return response.data;
};
