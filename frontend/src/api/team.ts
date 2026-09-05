import apiClient from './client';
import { User } from '../stores/authStore';

export interface ListTeamParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  includeUsers?: boolean;
}

export interface ListTeamResponse {
  success: boolean;
  data: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const listTeamApi = async (params?: ListTeamParams) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.search) queryParams.set('search', params.search);
  if (params?.role) queryParams.set('role', params.role);
  if (params?.includeUsers) queryParams.set('includeUsers', 'true');

  const response = await apiClient.get<ListTeamResponse>(
    `/team?${queryParams.toString()}`
  );
  return response.data;
};

export const getTeamMemberApi = async (id: string) => {
  const response = await apiClient.get<{ success: boolean; data: User }>(
    `/team/${id}`
  );
  return response.data;
};

export const updateMemberRoleApi = async (id: string, role: 'user' | 'admin' | 'superAdmin') => {
  const response = await apiClient.patch<{ success: boolean; data: User }>(
    `/team/${id}/role`,
    { role }
  );
  return response.data;
};

export const updateMemberStatusApi = async (id: string, isActive: boolean) => {
  const response = await apiClient.patch<{ success: boolean; data: User }>(
    `/team/${id}/status`,
    { isActive }
  );
  return response.data;
};
