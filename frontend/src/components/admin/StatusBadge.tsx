import React from 'react';
import { Badge, BadgeVariant } from '../ui/Badge';

export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const getBadgeVariantAndLabel = (s: string): { variant: BadgeVariant; label: string } => {
    switch (s) {
      // Articles & Content
      case 'published':
      case 'active':
        return { variant: 'published', label: 'Published' };
      case 'inReview':
      case 'in_review':
        return { variant: 'inReview', label: 'In Review' };
      case 'draft':
        return { variant: 'draft', label: 'Draft' };
      case 'archived':
        return { variant: 'archived', label: 'Archived' };
      case 'rejected':
        return { variant: 'rejected', label: 'Rejected' };

      // Tasks
      case 'pending':
        return { variant: 'pending', label: 'Pending' };
      case 'inProgress':
      case 'in_progress':
        return { variant: 'inReview', label: 'In Progress' };
      case 'done':
      case 'completed':
        return { variant: 'success', label: 'Completed' };
      case 'overdue':
        return { variant: 'danger', label: 'Overdue' };

      // Media / VideoLogs
      case 'editing':
        return { variant: 'gold', label: 'Editing' };

      // Events
      case 'upcoming':
        return { variant: 'gold', label: 'Upcoming' };
      case 'cancelled':
        return { variant: 'danger', label: 'Cancelled' };

      default:
        return { variant: 'muted', label: s };
    }
  };

  const { variant, label } = getBadgeVariantAndLabel(status);

  return (
    <Badge variant={variant} size={size} className={className}>
      {label}
    </Badge>
  );
};

export default StatusBadge;
