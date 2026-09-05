import { useAuthStore } from '../stores/authStore';

export const usePermission = (requiredPermission: string): boolean => {
  const permissions = useAuthStore((state) => state.permissions);

  if (!permissions || permissions.length === 0) {
    return false;
  }

  return permissions.includes('*') || permissions.includes(requiredPermission);
};

export default usePermission;
