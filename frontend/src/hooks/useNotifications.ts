import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyNotificationsApi, markNotificationReadApi, MyNotification } from '../api/me';
import { useAuthStore } from '../stores/authStore';

export interface UseNotificationsOptions {
  page?: number;
  limit?: number;
  refetchInterval?: number;
}

export const useNotifications = (options?: UseNotificationsOptions) => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const refetchInterval = options?.refetchInterval ?? 30000; // 30 seconds default polling

  const query = useQuery({
    queryKey: ['me', 'notifications', page, limit],
    queryFn: async () => {
      const res = await getMyNotificationsApi({ page, limit });
      return res.data || [];
    },
    enabled: isAuthenticated,
    refetchInterval,
  });

  const notifications: MyNotification[] = query.data || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationReadApi(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<MyNotification[]>(['me', 'notifications', page, limit], (old) => {
        if (!old) return [];
        return old.map((item) => (item._id === id ? { ...item, read: true } : item));
      });
      queryClient.invalidateQueries({ queryKey: ['me', 'notifications'] });
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    markAsRead: markReadMutation.mutate,
    markAsReadAsync: markReadMutation.mutateAsync,
    isMarkingRead: markReadMutation.isPending,
  };
};

export default useNotifications;
