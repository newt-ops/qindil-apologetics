import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMyNotificationsApi,
  markNotificationReadApi,
  updateMyProfileApi,
  generateTelegramLinkCodeApi,
  unlinkTelegramApi,
  UpdateProfilePayload,
} from '../api/me';
import { useAuthStore } from '../stores/authStore';
import { getMeApi } from '../api/auth';

export const useMyNotifications = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['me', 'notifications', params],
    queryFn: async () => {
      const res = await getMyNotificationsApi(params);
      return res.data || [];
    },
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markNotificationReadApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me', 'notifications'] });
    },
  });
};

export const useUpdateMyProfile = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => updateMyProfileApi(data),
    onSuccess: (res) => {
      if (res?.data) {
        setUser(res.data);
      }
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};

export const useGenerateTelegramCode = () => {
  return useMutation({
    mutationFn: () => generateTelegramLinkCodeApi(),
  });
};

export const useUnlinkTelegram = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => unlinkTelegramApi(),
    onSuccess: async () => {
      try {
        const res = await getMeApi();
        if (res?.data?.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error('Failed to refresh user profile after unlinking Telegram:', err);
      }
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};

