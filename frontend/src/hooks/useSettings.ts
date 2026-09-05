import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettingsApi, updateSettingsApi, UpdateSettingsPayload } from '../api/settings';

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await getSettingsApi();
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSettingsPayload) => updateSettingsApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};
