import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listCommentsApi, addCommentApi } from '../api/comment';

export const useComments = (taskId?: string) => {
  return useQuery({
    queryKey: ['comments', taskId],
    queryFn: async () => {
      const res = await listCommentsApi(taskId!);
      return res.data || [];
    },
    enabled: Boolean(taskId),
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, body }: { taskId: string; body: string }) =>
      addCommentApi(taskId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.taskId] });
    },
  });
};
