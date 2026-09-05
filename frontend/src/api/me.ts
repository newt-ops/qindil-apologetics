import apiClient from './client';
import { User } from '../stores/authStore';

export interface MyNotification {
  _id: string;
  recipient: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface MyNotificationsResponse {
  notifications: MyNotification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface UpdateProfilePayload {
  name?: string;
  avatarUrl?: string;
}

export interface TelegramCodeResponse {
  linkCode: string;
  expiresAt: string;
  botUsername: string;
}

export const getMyNotificationsApi = async (params?: { page?: number; limit?: number }) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());

  const response = await apiClient.get<{ success: boolean; data: MyNotification[] }>(
    `/me/notifications?${queryParams.toString()}`
  );
  return response.data;
};

export const markNotificationReadApi = async (id: string) => {
  const response = await apiClient.patch<{ success: boolean; data: MyNotification }>(
    `/me/notifications/${id}/read`
  );
  return response.data;
};

export const updateMyProfileApi = async (data: UpdateProfilePayload) => {
  const response = await apiClient.patch<{ success: boolean; data: User }>(
    '/me/profile',
    data
  );
  return response.data;
};

export const generateTelegramLinkCodeApi = async () => {
  const response = await apiClient.post<{ success: boolean; data: TelegramCodeResponse }>(
    '/me/telegram/generate-code'
  );
  return response.data;
};

export const unlinkTelegramApi = async () => {
  const response = await apiClient.delete<{ success: boolean; data: { message: string } }>(
    '/me/telegram'
  );
  return response.data;
};

