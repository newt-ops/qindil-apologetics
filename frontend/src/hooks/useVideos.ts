import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getVideoByIdApi,
  acceptVideoTaskApi,
  updateVideoDetailsApi,
  submitVideoTaskApi,
  reviewVideoTaskApi,
  postVideoTaskApi,
  UpdateVideoDetailsPayload,
  SubmitVideoPayload,
  ReviewVideoPayload,
  PostVideoPayload,
} from '../api/video';
import { useAuthStore } from '../stores/authStore';

export const useVideoById = (id?: string) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['videos', 'detail', id],
    queryFn: async () => {
      const res = await getVideoByIdApi(id!);
      return res.data;
    },
    enabled: isAuthenticated && Boolean(id),
  });
};

export const useAcceptVideoTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => acceptVideoTaskApi(id),
    onSuccess: (res, variables) => {
      queryClient.setQueryData(['videos', 'detail', variables], res.data);
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateVideoDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVideoDetailsPayload }) =>
      updateVideoDetailsApi(id, data),
    onSuccess: (res, variables) => {
      queryClient.setQueryData(['videos', 'detail', variables.id], res.data);
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useSubmitVideoTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: SubmitVideoPayload }) =>
      submitVideoTaskApi(id, data),
    onSuccess: (res, variables) => {
      queryClient.setQueryData(['videos', 'detail', variables.id], res.data);
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useReviewVideoTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewVideoPayload }) =>
      reviewVideoTaskApi(id, data),
    onSuccess: (res, variables) => {
      queryClient.setQueryData(['videos', 'detail', variables.id], res.data);
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const usePostVideoTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PostVideoPayload }) =>
      postVideoTaskApi(id, data),
    onSuccess: (res, variables) => {
      queryClient.setQueryData(['videos', 'detail', variables.id], res.data);
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export default useVideoById;

