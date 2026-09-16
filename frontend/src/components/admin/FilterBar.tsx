import React from 'react';
import Icon from '../icons/Icon';
import Button from '../ui/Button';

export interface FilterBarProps {
  children: React.ReactNode;
  onReset?: () => void;
  activeFiltersCount?: number;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  children,
  onReset,
  activeFiltersCount = 0,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-surface/80 backdrop-blur-md p-3.5 shadow-apple-sm ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2.5 flex-1">{children}</div>

      <div className="flex items-center gap-2 shrink-0">
        {activeFiltersCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold/15 text-gold border border-gold/30">
            <span>{activeFiltersCount}</span>
            <span>active</span>
          </span>
        )}

        {onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            leftIcon={<Icon name="X" size={13} />}
            className="text-textMuted hover:text-gold text-xs"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
