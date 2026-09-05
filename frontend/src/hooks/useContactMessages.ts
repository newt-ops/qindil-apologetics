import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listContactMessagesApi,
  getContactMessageApi,
  archiveContactMessageApi,
  ContactMessagesParams,
} from '../api/contact';

export const useContactMessages = (params?: ContactMessagesParams) => {
  return useQuery({
    queryKey: ['contactMessages', params],
    queryFn: async () => {
      const res = await listContactMessagesApi(params);
      return res.data;
    },
  });
};

export const useContactMessageDetail = (id?: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['contactMessages', 'detail', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await getContactMessageApi(id);
      // Invalidate contactMessages list to refresh read statuses and unread counter
      queryClient.invalidateQueries({ queryKey: ['contactMessages'] });
      return res.data;
    },
    enabled: Boolean(id),
  });
};

export const useArchiveContactMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveContactMessageApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactMessages'] });
    },
  });
};
