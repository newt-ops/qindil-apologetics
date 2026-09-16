import React from 'react';
import Icon, { IconName } from '../icons/Icon';
import Skeleton from '../ui/Skeleton';

export type AdminStatVariant = 'default' | 'gold' | 'danger' | 'success' | 'amber' | 'blue' | 'info' | 'warning';

export interface AdminStatCardProps {
  title?: string;
  label?: string; // alias for title
  value: string | number;
  description?: string;
  helperText?: string; // alias for description
  icon: IconName;
  variant?: AdminStatVariant;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  isActive?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
  className?: string;
}

const variantStyles: Record<
  AdminStatVariant,
  {
    iconBg: string;
    iconColor: string;
    activeBorder: string;
    activeBg: string;
    valueColor: string;
  }
> = {
  default: {
    iconBg: 'bg-surface border border-border',
    iconColor: 'text-textMuted',
    activeBorder: 'border-gold',
    activeBg: 'bg-gold/10',
    valueColor: 'text-text',
  },
  gold: {
    iconBg: 'bg-gold/10 text-gold border border-gold/25',
    iconColor: 'text-gold',
    activeBorder: 'border-gold',
    activeBg: 'bg-gold/10',
    valueColor: 'text-gold',
  },
  danger: {
    iconBg: 'bg-danger/10 text-danger border border-danger/25',
    iconColor: 'text-danger',
    activeBorder: 'border-danger',
    activeBg: 'bg-danger/10',
    valueColor: 'text-danger',
  },
  success: {
    iconBg: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25',
    iconColor: 'text-emerald-500',
    activeBorder: 'border-emerald-500',
    activeBg: 'bg-emerald-500/10',
    valueColor: 'text-emerald-500',
  },
  amber: {
    iconBg: 'bg-amber-500/10 text-amber-500 border border-amber-500/25',
    iconColor: 'text-amber-500',
    activeBorder: 'border-amber-500',
    activeBg: 'bg-amber-500/10',
    valueColor: 'text-amber-500',
  },
  warning: {
    iconBg: 'bg-amber-500/10 text-amber-500 border border-amber-500/25',
    iconColor: 'text-amber-500',
    activeBorder: 'border-amber-500',
    activeBg: 'bg-amber-500/10',
    valueColor: 'text-amber-500',
  },
  blue: {
    iconBg: 'bg-blue-500/10 text-blue-500 border border-blue-500/25',
    iconColor: 'text-blue-500',
    activeBorder: 'border-blue-500',
    activeBg: 'bg-blue-500/10',
    valueColor: 'text-blue-400',
  },
  info: {
    iconBg: 'bg-blue-500/10 text-blue-500 border border-blue-500/25',
    iconColor: 'text-blue-500',
    activeBorder: 'border-blue-500',
    activeBg: 'bg-blue-500/10',
    valueColor: 'text-blue-400',
  },
};

/**
 * Standardized Admin KPI Metric Stat Card
 */
export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  label,
  value,
  description,
  helperText,
  icon,
  variant = 'default',
  trend,
  isActive = false,
  onClick,
  isLoading = false,
  className = '',
}) => {
  const styles = variantStyles[variant] || variantStyles.default;
  const displayTitle = title || label || '';
  const displayDescription = description || helperText;

  if (isLoading) {
    return (
      <div
        className={`rounded-2xl border border-border/80 bg-surface p-4 shadow-apple-card space-y-2.5 ${className}`}
      >
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width={90} height={14} />
          <Skeleton variant="rounded" width={32} height={32} />
        </div>
        <Skeleton variant="text" width={60} height={28} />
        <Skeleton variant="text" width={120} height={12} />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border p-4 shadow-apple-card transition-all duration-200 ${
        onClick ? 'cursor-pointer select-none active:scale-[0.98]' : ''
      } ${
        isActive
          ? `${styles.activeBorder} ${styles.activeBg} shadow-apple-elevated ring-1 ring-gold/30`
          : 'border-border/80 bg-surface/90 hover:border-gold/40'
      } ${className}`}
    >
      {/* Header: Label & Icon Badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted truncate">
          {displayTitle}
        </span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 ${styles.iconBg}`}>
          <Icon name={icon} size={15} className={styles.iconColor} />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className={`mt-2 text-2xl sm:text-3xl font-black font-mono tracking-tight ${styles.valueColor}`}>
        {value}
      </div>

      {/* Subtext: Description or Trend */}
      {(displayDescription || trend) && (
        <div className="mt-1 flex items-center justify-between gap-1 text-[11px] text-textMuted">
          {displayDescription && <span className="truncate">{displayDescription}</span>}

          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 font-bold font-mono text-[10px] shrink-0 ${
                trend.isPositive ? 'text-emerald-500' : 'text-danger'
              }`}
            >
              <Icon name={trend.isPositive ? 'ChevronUp' : 'ChevronDown'} size={12} />
              <span>{trend.value}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminStatCard;
