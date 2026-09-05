import React from 'react';
import Icon, { IconName } from '../icons/Icon';
import Button from './Button';

export interface EmptyStateProps {
  icon?: IconName | React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'FileText',
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/50 p-8 text-center sm:p-12 ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-border/40 text-gold mb-4">
        {typeof icon === 'string' ? (
          <Icon name={icon as IconName} size={28} />
        ) : (
          icon
        )}
      </div>

      <h3 className="text-lg font-bold text-text mb-1">{title}</h3>

      {description && (
        <p className="max-w-md text-sm text-textMuted mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
