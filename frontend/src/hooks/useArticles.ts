import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyArticlesApi,
  getArticleForEditApi,
  updateArticleDraftApi,
  submitForReviewApi,
  getReviewQueueApi,
  requestChangesApi,
  approveArticleApi,
  publishArticleApi,
  archiveArticleApi,
  createArticleDraftApi,
  listArticlesAdminApi,
  deleteArticleDraftApi,
  UpdateArticleDraftPayload,
  CreateArticleDraftPayload,
  ListArticlesAdminParams,
} from '../api/article';
import { useAuthStore } from '../stores/authStore';

export const useMyArticles = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['articles', 'mine'],
    queryFn: async () => {
      const res = await getMyArticlesApi();
      return res.data || [];
    },
    enabled: isAuthenticated,
  });
};

export const useArticlesAdmin = (params?: ListArticlesAdminParams) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['articles', 'admin', params],
    queryFn: async () => {
      const res = await listArticlesAdminApi(params);
      if (Array.isArray(res.data)) {
        return { items: res.data, pagination: { total: res.data.length, page: 1, limit: 50, pages: 1 } };
      }
      return res.data || { items: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    },
    enabled: isAuthenticated,
  });
};

export const useCreateArticleDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateArticleDraftPayload) => createArticleDraftApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
};

export const useDeleteArticleDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteArticleDraftApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
};

export const useArticleForEdit = (id?: string) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['articles', 'edit', id],
    queryFn: async () => {
      const res = await getArticleForEditApi(id!);
      return res.data;
    },
    enabled: isAuthenticated && Boolean(id),
  });
};

export const useUpdateArticleDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateArticleDraftPayload }) =>
      updateArticleDraftApi(id, data),
    onSuccess: (res, variables) => {
      queryClient.setQueryData(['articles', 'edit', variables.id], res.data);
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
};

export const useSubmitForReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: UpdateArticleDraftPayload }) =>
      submitForReviewApi(id, data),
    onSuccess: (res, variables) => {
      queryClient.setQueryData(['articles', 'edit', variables.id], res.data);
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
};

export const useReviewQueue = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['articles', 'review-queue'],
    queryFn: async () => {
      const res = await getReviewQueueApi();
      return res.data || [];
    },
    enabled: isAuthenticated,
  });
};

export const useRequestChanges = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reviewNotes }: { id: string; reviewNotes: string }) =>
      requestChangesApi(id, reviewNotes),
    onSuccess: (res, variables) => {
      queryClient.setQueryData(['articles', 'edit', variables.id], res.data);
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
};

export const useApproveArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveArticleApi(id),
    onSuccess: (res, variables) => {
      queryClient.setQueryData(['articles', 'edit', variables], res.data);
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
};

export const usePublishArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => publishArticleApi(id),
    onSuccess: (res, variables) => {
      queryClient.setQueryData(['articles', 'edit', variables], res.data);
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
};

export const useArchiveArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveArticleApi(id),
    onSuccess: (res, variables) => {
      queryClient.setQueryData(['articles', 'edit', variables], res.data);
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
};

export default useArticlesAdmin;


