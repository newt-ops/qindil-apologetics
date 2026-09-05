import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getFeaturedArticlesApi,
  getActiveTopicsApi,
  getArticlesApi,
  getArticleBySlugApi,
  submitContactMessageApi,
  getPublicEventsApi,
  ContactPayload,
} from '../api/public';

export const useFeaturedArticles = () => {
  return useQuery({
    queryKey: ['public', 'articles', 'featured'],
    queryFn: async () => {
      const res = await getFeaturedArticlesApi();
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

export const useActiveTopics = () => {
  return useQuery({
    queryKey: ['public', 'topics'],
    queryFn: async () => {
      const res = await getActiveTopicsApi();
      return res.data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
};

export const useArticles = (params: { topic?: string; search?: string; page?: number; limit?: number }) => {
  const { topic = '', search = '', page = 1, limit = 9 } = params;

  return useQuery({
    queryKey: ['public', 'articles', { topic, search, page, limit }],
    queryFn: async () => {
      const res = await getArticlesApi({ topic, search, page, limit });
      return res.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
};

export const useArticleBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['public', 'article', slug],
    queryFn: async () => {
      const res = await getArticleBySlugApi(slug);
      return res.data;
    },
    enabled: !!slug,
    retry: false,
  });
};

export const useSubmitContact = () => {
  return useMutation({
    mutationFn: (data: ContactPayload) => submitContactMessageApi(data),
  });
};

export const usePublicEvents = (params?: { includePast?: boolean }) => {
  const includePast = !!params?.includePast;

  return useQuery({
    queryKey: ['public', 'events', { includePast }],
    queryFn: async () => {
      const res = await getPublicEventsApi({ includePast });
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};
