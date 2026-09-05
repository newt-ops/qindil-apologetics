import apiClient from './client';

export interface AuditActor {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface AuditLogItem {
  _id: string;
  actor: AuditActor;
  action: string;
  targetType?: string;
  targetModel?: string;
  targetId?: string;
  metadata?: Record<string, any>;
  details?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogParams {
  page?: number;
  limit?: number;
  action?: string;
  actor?: string;
  targetType?: string;
  search?: string;
}

export interface AuditLogResponse {
  items: AuditLogItem[];
  availableActions: string[];
  availableTargetModels: string[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const listAuditLogApi = async (params?: AuditLogParams) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.action) queryParams.set('action', params.action);
  if (params?.actor) queryParams.set('actor', params.actor);
  if (params?.targetType) queryParams.set('targetType', params.targetType);
  if (params?.search) queryParams.set('search', params.search);

  const response = await apiClient.get<{ success: boolean; data: AuditLogResponse }>(
    `/audit-log?${queryParams.toString()}`
  );
  return response.data;
};
