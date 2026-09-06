import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon, { IconName } from '../icons/Icon';
import { useHasRole } from '../../hooks/useHasRole';
import { useAuthStore } from '../../stores/authStore';
import { useContactMessages } from '../../hooks/useContactMessages';
import Logo from '../shared/Logo';
import ThemeToggle from '../shared/ThemeToggle';

export interface NavItemConfig {
  label: string;
  path: string;
  icon: IconName;
  superAdminOnly?: boolean;
  implemented?: boolean; // Set to true when prompt for the page is implemented
}

const navItems: NavItemConfig[] = [
  // Admin + SuperAdmin Items
  { label: 'Workspace', path: '/admin/workspace', icon: 'Folder', implemented: true },
  { label: 'My Articles', path: '/admin/articles', icon: 'FileText', implemented: true },
  { label: 'Calendar', path: '/admin/calendar', icon: 'Calendar', implemented: true },

  // SuperAdmin Only Items
  { label: 'All Tasks', path: '/admin/tasks', icon: 'CheckSquare', superAdminOnly: true, implemented: true },
  { label: 'Assign Task', path: '/admin/tasks/assign', icon: 'Plus', superAdminOnly: true, implemented: true },
  { label: 'Team Roster', path: '/admin/team', icon: 'Users', superAdminOnly: true, implemented: true },
  { label: 'Topics', path: '/admin/topics', icon: 'Tag', superAdminOnly: true, implemented: true },
  { label: 'Review Queue', path: '/admin/review-queue', icon: 'Eye', superAdminOnly: true, implemented: true },
  { label: 'Events', path: '/admin/events', icon: 'Calendar', superAdminOnly: true, implemented: true },
  { label: 'Analytics', path: '/admin/analytics', icon: 'Activity', superAdminOnly: true, implemented: true },
  { label: 'Contact Inbox', path: '/admin/contact-inbox', icon: 'Mail', superAdminOnly: true, implemented: true },
  { label: 'Audit Log', path: '/admin/audit-log', icon: 'Shield', superAdminOnly: true, implemented: true },
  { label: 'Site Settings', path: '/admin/settings', icon: 'Settings', superAdminOnly: true, implemented: true },
];

export interface SidebarProps {
  onItemClick?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick, className = '' }) => {
  const location = useLocation();
  const isSuperAdmin = useHasRole('superAdmin');
  const user = useAuthStore((state) => state.user);

  const { data: contactData } = useContactMessages({ limit: 1 });
  const unreadContactCount = isSuperAdmin ? contactData?.unreadCount || 0 : 0;

  // Filter items according to role permissions
  const visibleItems = navItems.filter((item) => {
    if (item.superAdminOnly) {
      return isSuperAdmin;
    }
    return true; // Admin + SuperAdmin
  });

  const activeItems = visibleItems.filter((item) => !item.superAdminOnly);
  const superAdminItems = visibleItems.filter((item) => item.superAdminOnly);

  const renderNavGroup = (items: NavItemConfig[], title?: string) => (
    <div className="space-y-1 py-2">
      {title && (
        <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-textMuted/70">
          {title}
        </div>
      )}
      {items.map((item) => {
        const isActive = location.pathname === item.path;

        if (!item.implemented && !isActive) {
          // Render future items as styled disabled links with a 'Soon' badge to prevent 404s
          return (
            <div
              key={item.path}
              className="flex items-center justify-between rounded-md px-3 py-2.5 text-xs font-medium text-textMuted/50 cursor-not-allowed select-none group"
              title={`${item.label} (Coming Soon)`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon name={item.icon} size={16} className="text-textMuted/40" />
                <span>{item.label}</span>
              </div>
              <span className="rounded bg-border/40 px-1.5 py-0.5 text-[9px] font-semibold text-textMuted/50">
                Soon
              </span>
            </div>
          );
        }

        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            className={`flex items-center justify-between rounded-md px-3 py-2.5 text-xs font-medium transition-all duration-150 ${
              isActive
                ? 'bg-gold/15 text-gold border-l-2 border-gold font-bold shadow-sm'
                : 'text-textMuted hover:bg-surface/80 hover:text-text'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Icon
                name={item.icon}
                size={16}
                className={isActive ? 'text-gold' : 'text-textMuted'}
              />
              <span>{item.label}</span>
            </div>

            {item.path === '/admin/contact-inbox' && unreadContactCount > 0 && (
              <span className="rounded-full bg-gold/20 text-gold font-extrabold text-[10px] px-2 py-0.5 border border-gold/40 animate-pulse">
                {unreadContactCount}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside
      className={`flex flex-col h-full bg-surface border-r border-border font-sans select-none ${className}`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center space-x-3">
          <Logo variant="mark" height={32} />
          <div>
            <h2 className="text-sm font-bold text-gold tracking-tight leading-none">Qindil Ops</h2>
            <p className="text-[10px] font-mono text-textMuted mt-0.5">Team Workspace</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Role Badge Indicator */}
      <div className="mx-3 my-3 rounded-md border border-border bg-bg/50 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2 truncate">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-text font-medium truncate">{user?.name || 'Admin'}</span>
        </div>
        <span className="shrink-0 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold uppercase tracking-wider">
          {isSuperAdmin ? 'Super Admin' : 'Admin'}
        </span>
      </div>

      {/* Navigation Links Scrollable Area */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-2 py-2">
        {renderNavGroup(activeItems, 'Operations')}
        {superAdminItems.length > 0 && renderNavGroup(superAdminItems, 'System Administration')}
      </nav>

      {/* Sidebar Footer */}
      <div className="border-t border-border p-3 space-y-2">
        <Link
          to="/"
          onClick={onItemClick}
          className="flex items-center justify-center space-x-2 w-full rounded-lg border border-border bg-bg/80 hover:bg-bg px-3 py-2 text-xs font-semibold text-text hover:border-gold/50 hover:text-gold transition shadow-xs"
        >
          <Icon name="Globe" size={14} className="text-gold" />
          <span>Back to Main Site</span>
        </Link>
        <p className="text-[10px] font-mono text-textMuted/60 text-center">Qindil Platform v2.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
