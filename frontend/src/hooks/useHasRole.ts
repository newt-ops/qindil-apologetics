import { useAuthStore } from '../stores/authStore';

export const useHasRole = (requiredRole: string | string[]): boolean => {
  const user = useAuthStore((state) => state.user);

  if (!user || !user.roles || user.roles.length === 0) {
    return false;
  }

  const roleNames = user.roles.map((r) => (typeof r === 'string' ? r : r.name));

  // superAdmin inherits all admin permissions
  if (roleNames.includes('superAdmin')) {
    return true;
  }

  const targets = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return targets.some((target) => roleNames.includes(target));
};

export default useHasRole;
