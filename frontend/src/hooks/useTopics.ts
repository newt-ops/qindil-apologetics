import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listAdminTopicsApi,
  getTopicByIdApi,
  createTopicApi,
  updateTopicApi,
  deleteTopicApi,
  reorderTopicsApi,
  CreateTopicPayload,
  UpdateTopicPayload,
} from '../api/topic';
import { useAuthStore } from '../stores/authStore';

export const useAdminTopics = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['topics', 'admin'],
    queryFn: async () => {
      const res = await listAdminTopicsApi();
      return res.data || [];
    },
    enabled: isAuthenticated,
  });
};

export const useTopic = (id?: string) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['topics', 'detail', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await getTopicByIdApi(id);
      return res.data;
    },
    enabled: isAuthenticated && Boolean(id),
  });
};

export const useCreateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTopicPayload) => createTopicApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });
};

export const useUpdateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTopicPayload }) =>
      updateTopicApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });
};

export const useDeleteTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTopicApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });
};

export const useReorderTopics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedIds: string[]) => reorderTopicsApi(orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });
};

export default useAdminTopics;
