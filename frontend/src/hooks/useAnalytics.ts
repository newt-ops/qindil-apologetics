import { useQuery } from '@tanstack/react-query';
import {
  getAnalyticsOverviewApi,
  getArticlesOverTimeApi,
  getTeamActivityApi,
} from '../api/analytics';

export const useAnalyticsOverview = () => {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      const res = await getAnalyticsOverviewApi();
      return res.data;
    },
  });
};

export const useArticlesOverTime = (range: string = '30d') => {
  return useQuery({
    queryKey: ['analytics', 'articles-over-time', range],
    queryFn: async () => {
      const res = await getArticlesOverTimeApi(range);
      return res.data;
    },
  });
};

export const useTeamActivity = (range: string = '30d') => {
  return useQuery({
    queryKey: ['analytics', 'team-activity', range],
    queryFn: async () => {
      const res = await getTeamActivityApi(range);
      return res.data;
    },
  });
};
