import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettingsApi, updateSettingsApi, UpdateSettingsPayload } from '../api/settings';

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await getSettingsApi();
      return res.data;
    },
    staleTime: 1000 * 15, // 15 seconds
    refetchOnWindowFocus: true,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSettingsPayload) => updateSettingsApi(payload),
    onSuccess: (data) => {
      if (data?.data) {
        queryClient.setQueryData(['settings'], data.data);
      }
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};
