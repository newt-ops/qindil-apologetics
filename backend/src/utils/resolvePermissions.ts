import { IUser } from '../models/User.model.js';
import { IRole } from '../models/Role.model.js';

export const resolvePermissions = (user: IUser): string[] => {
  if (!user || !user.roles || !Array.isArray(user.roles)) {
    return [];
  }

  const permissionsSet = new Set<string>();

  for (const roleObj of user.roles) {
    if (typeof roleObj === 'object' && roleObj !== null && 'permissions' in roleObj) {
      const role = roleObj as unknown as IRole;
      if (Array.isArray(role.permissions)) {
        for (const perm of role.permissions) {
          permissionsSet.add(perm);
        }
      }
    }
  }

  const permissions = Array.from(permissionsSet);

  if (permissions.includes('*')) {
    return ['*'];
  }

  return permissions;
};
