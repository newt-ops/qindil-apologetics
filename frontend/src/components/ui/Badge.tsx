import React from 'react';

export type BadgeVariant =
  | 'draft'
  | 'inReview'
  | 'in_review'
  | 'published'
  | 'archived'
  | 'pending'
  | 'completed'
  | 'rejected'
  | 'success'
  | 'danger'
  | 'gold'
  | 'info'
  | 'muted';

export interface BadgeProps {
  variant?: BadgeVariant | string;
  children: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'muted',
  children,
  size = 'md',
  className = '',
}) => {
  const getVariantClasses = (v: string) => {
    switch (v) {
      case 'published':
      case 'active':
      case 'completed':
      case 'success':
        return 'bg-success/15 text-success border-success/30';
      case 'inReview':
      case 'in_review':
      case 'pending':
      case 'gold':
      case 'info':
        return 'bg-gold/15 text-gold border-gold/30';
      case 'archived':
      case 'rejected':
      case 'failed':
      case 'danger':
        return 'bg-danger/15 text-danger border-danger/30';
      case 'draft':
      case 'muted':
      default:
        return 'bg-border/60 text-textMuted border-border';
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses[size]} ${getVariantClasses(
        variant
      )} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
