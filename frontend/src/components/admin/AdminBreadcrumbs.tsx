import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../icons/Icon';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface AdminBreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const routeMap: Record<string, string> = {
  admin: 'Admin',
  workspace: 'Workspace',
  articles: 'Articles',
  tasks: 'Tasks',
  assign: 'Assign',
  calendar: 'Calendar',
  team: 'Team Roster',
  topics: 'Topics',
  'review-queue': 'Review Queue',
  events: 'Events',
  analytics: 'Analytics',
  'contact-inbox': 'Contact Inbox',
  'audit-log': 'Audit Log',
  settings: 'Settings',
  edit: 'Editor',
  create: 'New',
  videos: 'Videos',
};

export const AdminBreadcrumbs: React.FC<AdminBreadcrumbsProps> = ({ items, className = '' }) => {
  const location = useLocation();

  const breadcrumbs: BreadcrumbItem[] = React.useMemo(() => {
    if (items && items.length > 0) return items;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const result: BreadcrumbItem[] = [];

    let currentPath = '';
    pathSegments.forEach((segment, idx) => {
      currentPath += `/${segment}`;
      const isLast = idx === pathSegments.length - 1;
      const label = routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

      result.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    });

    return result;
  }, [items, location.pathname]);

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`hidden lg:flex items-center space-x-1.5 text-xs text-textMuted font-medium ${className}`}
    >
      {breadcrumbs.map((crumb, idx) => {
        const isLast = idx === breadcrumbs.length - 1;

        return (
          <React.Fragment key={crumb.label + idx}>
            {idx > 0 && (
              <Icon
                name="ChevronRight"
                size={12}
                className="text-textMuted/50 shrink-0 select-none"
              />
            )}

            {isLast ? (
              <span className="font-semibold text-text truncate max-w-[160px]">{crumb.label}</span>
            ) : crumb.href ? (
              <Link
                to={crumb.href}
                className="hover:text-gold transition-colors truncate max-w-[140px]"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="truncate max-w-[140px]">{crumb.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default AdminBreadcrumbs;
