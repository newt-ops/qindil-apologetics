import { IUser } from '../../models/User.model.js';
import { TelegramTemplateResult, renderUserDashboard } from './user.template.js';
import { renderAdminDashboard } from './admin.template.js';
import { renderSuperAdminDashboard } from './superadmin.template.js';
import { renderGuestDashboard } from './guest.template.js';

export * from './user.template.js';
export * from './admin.template.js';
export * from './superadmin.template.js';
export * from './guest.template.js';

/**
 * Dispatch and render the appropriate modular dashboard template according to the user's role.
 */
export const renderDashboardByRole = async (user?: IUser | null): Promise<TelegramTemplateResult> => {
  if (!user) {
    return renderGuestDashboard();
  }

  const roleNames = Array.isArray(user.roles)
    ? (user.roles as any[]).map((r: any) =>
        (typeof r === 'string' ? r : r.name || '').toLowerCase()
      )
    : [];

  const isSuperAdmin = roleNames.includes('superadmin');
  const isAdmin = roleNames.includes('admin') || roleNames.includes('editor') || roleNames.includes('author');

  if (isSuperAdmin) {
    return renderSuperAdminDashboard(user);
  }

  if (isAdmin) {
    return renderAdminDashboard(user);
  }

  return renderUserDashboard(user);
};

export default renderDashboardByRole;
