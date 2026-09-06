import React from 'react';
import Icon from '../icons/Icon';
import Button from '../ui/Button';

export interface FilterBarProps {
  children: React.ReactNode;
  onReset?: () => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({ children, onReset, className = '' }) => {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-surface/80 backdrop-blur-md p-3.5 shadow-apple-sm ${className}`}
    >
      <div className="flex flex-wrap items-center gap-3 flex-1">{children}</div>

      {onReset && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          leftIcon={<Icon name="X" size={14} />}
          className="text-textMuted hover:text-gold"
        >
          Reset Filters
        </Button>
      )}
    </div>
  );
};

export default FilterBar;
