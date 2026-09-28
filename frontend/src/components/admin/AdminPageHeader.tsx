import React from 'react';
import { IconName } from '../icons/Icon';
import AdminBreadcrumbs, { BreadcrumbItem } from './AdminBreadcrumbs';

export interface AdminPageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string; // alias for description
  badge?: string;
  discipline?: string; // alias for badge
  topic?: string; // alias for badge
  badgeIcon?: IconName;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Standardized Admin Page Header Component
 * Provides unified visual hierarchy, category badges, breadcrumb integration, and action bars.
 */
export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  description,
  subtitle,
  breadcrumbs,
  actions,
  children,
  className = '',
}) => {
  const displayDescription = description || subtitle;
  return (
    <div className={`space-y-4 border-b border-border/70 pb-5 font-sans ${className}`}>
      {/* Optional Breadcrumb Trail */}
      {breadcrumbs && <AdminBreadcrumbs items={breadcrumbs} className="mb-2" />}

      {/* Main Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0 flex-1">
          {/* Page Heading */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight truncate">
            {title}
          </h1>

          {/* Descriptive Subtitle */}
          {displayDescription && (
            <p className="text-xs sm:text-sm text-textMuted max-w-3xl leading-relaxed">
              {displayDescription}
            </p>
          )}
        </div>

        {/* Action Controls Slot */}
        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">{actions}</div>
        )}
      </div>

      {/* Optional Bottom Extension Slot (e.g., KPI Strip, Tab Bar, Filter Dock) */}
      {children && <div className="pt-2">{children}</div>}
    </div>
  );
};

export default AdminPageHeader;
