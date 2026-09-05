import { useQuery } from '@tanstack/react-query';
import { listMyCalendarEventsApi } from '../api/event';
import { useAuthStore } from '../stores/authStore';

export const useCalendarEvents = (from?: string, to?: string) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['calendar', 'events', from, to],
    queryFn: async () => {
      const res = await listMyCalendarEventsApi(from, to);
      return res.data || [];
    },
    enabled: isAuthenticated && Boolean(from) && Boolean(to),
  });
};

export default useCalendarEvents;
