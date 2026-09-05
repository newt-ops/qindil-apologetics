import { useQuery } from '@tanstack/react-query';
import { listAuditLogApi, AuditLogParams } from '../api/audit';

export const useAuditLog = (params?: AuditLogParams) => {
  return useQuery({
    queryKey: ['auditLog', params],
    queryFn: async () => {
      const res = await listAuditLogApi(params);
      return res.data;
    },
  });
};
