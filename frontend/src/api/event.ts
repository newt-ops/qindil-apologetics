import apiClient from './client';

export type EventType = 'deadline' | 'meeting' | 'publicEvent' | 'other';
export type EventVisibility = 'public' | 'team';

export interface CalendarEventTask {
  _id: string;
  title: string;
  type: string;
  status: string;
  dueDate: string;
}

export interface CalendarEventItem {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  allDay: boolean;
  type: EventType;
  visibility: EventVisibility;
  location?: string;
  relatedTask?: CalendarEventTask;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  allDay?: boolean;
  type: EventType;
  visibility: EventVisibility;
  location?: string;
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  allDay?: boolean;
  type?: EventType;
  visibility?: EventVisibility;
  location?: string;
}

export interface EventsAdminParams {
  page?: number;
  limit?: number;
  type?: string;
  visibility?: string;
  search?: string;
}

export interface EventsAdminResponse {
  items: CalendarEventItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const listMyCalendarEventsApi = async (from?: string, to?: string) => {
  const queryParams = new URLSearchParams();
  if (from) queryParams.set('from', from);
  if (to) queryParams.set('to', to);

  const response = await apiClient.get<{ success: boolean; data: CalendarEventItem[] }>(
    `/events/mine?${queryParams.toString()}`
  );
  return response.data;
};

export const listEventsAdminApi = async (params?: EventsAdminParams) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.type) queryParams.set('type', params.type);
  if (params?.visibility) queryParams.set('visibility', params.visibility);
  if (params?.search) queryParams.set('search', params.search);

  const response = await apiClient.get<{ success: boolean; data: EventsAdminResponse }>(
    `/events?${queryParams.toString()}`
  );
  return response.data;
};

export const createEventApi = async (payload: CreateEventPayload) => {
  const response = await apiClient.post<{ success: boolean; data: CalendarEventItem }>(
    '/events',
    payload
  );
  return response.data;
};

export const updateEventApi = async (id: string, payload: UpdateEventPayload) => {
  const response = await apiClient.patch<{ success: boolean; data: CalendarEventItem }>(
    `/events/${id}`,
    payload
  );
  return response.data;
};

export const deleteEventApi = async (id: string) => {
  const response = await apiClient.delete<{ success: boolean; data: { message: string } }>(
    `/events/${id}`
  );
  return response.data;
};
