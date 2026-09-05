import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listEventsAdminApi,
  createEventApi,
  updateEventApi,
  deleteEventApi,
  EventsAdminParams,
  CreateEventPayload,
  UpdateEventPayload,
} from '../api/event';
import { useCalendarEvents } from './useCalendar';

export { useCalendarEvents };

export const useEventsAdmin = (params?: EventsAdminParams) => {
  return useQuery({
    queryKey: ['events', 'admin', params],
    queryFn: async () => {
      const res = await listEventsAdminApi(params);
      return res.data;
    },
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) => createEventApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['publicEvents'] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEventPayload }) =>
      updateEventApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['publicEvents'] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEventApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['publicEvents'] });
    },
  });
};
