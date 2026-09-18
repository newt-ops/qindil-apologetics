import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon, { IconName } from '../icons/Icon';
import { useHasRole } from '../../hooks/useHasRole';
import { useContactMessages } from '../../hooks/useContactMessages';
import Logo from '../shared/Logo';
import ThemeToggle from '../shared/ThemeToggle';

export interface NavItemConfig {
  label: string;
  path: string;
  icon: IconName;
  superAdminOnly?: boolean;
  implemented?: boolean;
}

const navItems: NavItemConfig[] = [
  // Workspace & Editorial
  { label: 'Workspace', path: '/admin/workspace', icon: 'Folder', implemented: true },
  { label: 'Articles', path: '/admin/articles', icon: 'FileText', implemented: true },
  { label: 'Calendar', path: '/admin/calendar', icon: 'Calendar', implemented: true },

  // Operations & Management (SuperAdmin)
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
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenCommandPalette?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onItemClick,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  className = '',
}) => {
  const location = useLocation();
  const isSuperAdmin = useHasRole('superAdmin');

  const { data: contactData } = useContactMessages({ limit: 1 });
  const unreadContactCount = isSuperAdmin ? contactData?.unreadCount || 0 : 0;

  // Filter items according to role permissions and dynamic labels
  const visibleItems = navItems
    .map((item) => {
      if (item.path === '/admin/articles') {
        return {
          ...item,
          label: isSuperAdmin ? 'All Articles' : 'My Articles',
        };
      }
      return item;
    })
    .filter((item) => {
      if (item.superAdminOnly) {
        return isSuperAdmin;
      }
      return true;
    });

  const activeItems = visibleItems.filter((item) => !item.superAdminOnly);
  const superAdminItems = visibleItems.filter((item) => item.superAdminOnly);

  const renderNavGroup = (items: NavItemConfig[], title?: string) => (
    <div className="space-y-1 py-1">
      {title && !isCollapsed && (
        <div className="px-3 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-textMuted/60 font-mono">
          {title}
        </div>
      )}
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        const hasBadge = item.path === '/admin/contact-inbox' && unreadContactCount > 0;

        if (!item.implemented && !isActive) {
          return isCollapsed ? (
            <div
              key={item.path}
              className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl text-textMuted/40 cursor-not-allowed select-none"
              title={`${item.label} (Coming Soon)`}
            >
              <Icon name={item.icon} size={17} />
            </div>
          ) : (
            <div
              key={item.path}
              className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-textMuted/50 cursor-not-allowed select-none group"
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

        return isCollapsed ? (
          <Link
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            title={item.label}
            className={`relative flex h-10 w-10 mx-auto items-center justify-center rounded-xl transition-all duration-150 active:scale-95 ${
              isActive
                ? 'bg-gold/15 text-gold border border-gold/40 shadow-apple-sm'
                : 'text-textMuted hover:bg-surface/90 hover:text-text'
            }`}
          >
            <Icon
              name={item.icon}
              size={18}
              className={isActive ? 'text-gold' : 'text-textMuted'}
            />
            {hasBadge && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold animate-pulse" />
            )}
          </Link>
        ) : (
          <Link
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 active:scale-[0.99] ${
              isActive
                ? 'bg-gold/15 text-gold font-bold shadow-apple-sm'
                : 'text-textMuted hover:bg-surface/90 hover:text-text'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <Icon
                name={item.icon}
                size={16}
                className={`shrink-0 transition-colors ${
                  isActive ? 'text-gold' : 'text-textMuted group-hover:text-text'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </div>

            {hasBadge && (
              <span className="rounded-full bg-gold/20 text-gold font-extrabold text-[10px] px-2 py-0.5 border border-gold/40 animate-pulse shrink-0">
                {unreadContactCount}
              </span>
            )}

            {isActive && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-gold shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside
      className={`flex flex-col h-full bg-surface dark:bg-zinc-950 md:backdrop-blur-xl border-r border-border/80 font-sans select-none transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${className}`}
    >
      {/* Brand Header */}
      <div
        className={`flex items-center border-b border-border/60 px-3.5 py-3 ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        <Link to="/admin" onClick={onItemClick} className="flex items-center space-x-3 group">
          <Logo variant="mark" height={32} />
          {!isCollapsed && (
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gold tracking-tight leading-none group-hover:text-goldHover transition-colors">
                Qindil Ops
              </h2>
              <p className="text-[10px] font-mono text-textMuted/80 mt-1">
                Internal Workspace
              </p>
            </div>
          )}
        </Link>

        {!isCollapsed && (
          <div className="flex items-center space-x-1.5">
            <ThemeToggle />
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border/80 p-1.5 text-textMuted hover:bg-bg hover:text-text active:scale-90 transition-all md:hidden"
                aria-label="Close Mobile Sidebar"
              >
                <Icon name="X" size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation Links Scrollable Area */}
      <nav className="flex-1 overflow-y-auto px-2.5 space-y-1 py-2 scrollbar-none overscroll-contain">
        {renderNavGroup(activeItems, 'Operations')}
        {superAdminItems.length > 0 && renderNavGroup(superAdminItems, 'System Administration')}
      </nav>

      {/* Sidebar Footer */}
      <div className="border-t border-border/60 p-2.5 space-y-2 pb-4 md:pb-2.5">
        {/* Back to Main Site */}
        {isCollapsed ? (
          <Link
            to="/"
            onClick={onItemClick}
            title="Back to Main Public Site"
            className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl border border-border/80 bg-surface hover:bg-bg text-gold transition-all shadow-apple-sm active:scale-95"
          >
            <Icon name="Globe" size={16} />
          </Link>
        ) : (
          <Link
            to="/"
            onClick={onItemClick}
            className="flex items-center justify-center space-x-2 w-full rounded-xl border border-border/80 bg-surface hover:bg-bg px-3.5 py-2 text-xs font-semibold text-text hover:border-gold/50 hover:text-gold active:scale-98 transition-all shadow-apple-sm"
          >
            <Icon name="Globe" size={14} className="text-gold" />
            <span>Back to Main Site</span>
          </Link>
        )}

        {/* Desktop Collapse / Expand Toggle Button */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden md:flex items-center justify-center space-x-1.5 w-full rounded-xl border border-border/80 bg-surface hover:bg-bg/80 py-1.5 text-xs text-textMuted hover:text-text transition-all active:scale-98 shadow-apple-sm"
          >
            <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={14} />
            {!isCollapsed && <span className="text-[11px]">Collapse</span>}
          </button>
        )}

        {!isCollapsed && (
          <p className="text-[10px] font-mono text-textMuted/60 text-center pt-0.5">
            Qindil Operations v2.0
          </p>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
