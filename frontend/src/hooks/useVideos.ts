import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBoardApi,
  getVideoByIdApi,
  moveStageApi,
  updateVideoDetailsApi,
  VideoBoardStage,
  UpdateVideoDetailsPayload,
} from '../api/video';
import { useAuthStore } from '../stores/authStore';

export const useBoard = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['videos', 'board'],
    queryFn: async () => {
      const res = await getBoardApi();
      return res.data || [];
    },
    enabled: isAuthenticated,
  });
};

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

export const useMoveStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: VideoBoardStage }) =>
      moveStageApi(id, stage),
    onSuccess: (res, variables) => {
      queryClient.setQueryData(['videos', 'detail', variables.id], res.data);
      queryClient.invalidateQueries({ queryKey: ['videos', 'board'] });
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
      queryClient.invalidateQueries({ queryKey: ['videos', 'board'] });
    },
  });
};

export default useBoard;

