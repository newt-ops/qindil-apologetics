import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createArticleProposalApi,
  getMyArticleProposalsApi,
  listArticleProposalsApi,
  rejectArticleProposalApi,
  CreateArticleProposalPayload,
  RejectArticleProposalPayload,
  ListProposalsParams,
} from '../api/articleProposal';

export const PROPOSAL_KEYS = {
  all: ['article-proposals'] as const,
  mine: ['article-proposals', 'mine'] as const,
  list: (params?: ListProposalsParams) => ['article-proposals', 'list', params] as const,
};

export const useMyArticleProposals = () => {
  return useQuery({
    queryKey: PROPOSAL_KEYS.mine,
    queryFn: async () => {
      const res = await getMyArticleProposalsApi();
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useArticleProposals = (params?: ListProposalsParams) => {
  return useQuery({
    queryKey: PROPOSAL_KEYS.list(params),
    queryFn: async () => {
      const res = await listArticleProposalsApi(params);
      return res;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateArticleProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateArticleProposalPayload) => createArticleProposalApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPOSAL_KEYS.all });
    },
  });
};

export const useRejectArticleProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectArticleProposalPayload }) =>
      rejectArticleProposalApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPOSAL_KEYS.all });
    },
  });
};
