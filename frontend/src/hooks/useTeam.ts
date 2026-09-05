import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listTeamApi,
  getTeamMemberApi,
  updateMemberRoleApi,
  updateMemberStatusApi,
  ListTeamParams,
} from '../api/team';

export const useTeamMembers = (params?: ListTeamParams) => {
  return useQuery({
    queryKey: ['team', params],
    queryFn: () => listTeamApi(params),
  });
};

export const useTeamMember = (id?: string) => {
  return useQuery({
    queryKey: ['team', 'member', id],
    queryFn: () => getTeamMemberApi(id!),
    enabled: Boolean(id),
  });
};

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'user' | 'admin' | 'superAdmin' }) =>
      updateMemberRoleApi(id, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      queryClient.invalidateQueries({ queryKey: ['team', 'member', variables.id] });
    },
  });
};

export const useUpdateMemberStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateMemberStatusApi(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      queryClient.invalidateQueries({ queryKey: ['team', 'member', variables.id] });
    },
  });
};
