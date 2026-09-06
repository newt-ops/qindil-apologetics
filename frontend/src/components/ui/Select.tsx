import React, { forwardRef } from 'react';
import Icon from '../icons/Icon';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, helperText, options, placeholder, className = '', id, ...props },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-textMuted">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            className={`w-full appearance-none rounded-xl border bg-surface/80 backdrop-blur-sm px-4 py-2.5 pr-10 text-sm text-text shadow-apple-sm transition-all duration-200 focus:outline-none focus:bg-surface focus:ring-4 ${
              error
                ? 'border-danger focus:border-danger focus:ring-danger/20'
                : 'border-border/80 hover:border-border focus:border-gold focus:ring-gold/15'
            } ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-surface text-textMuted">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-surface text-text">
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 pointer-events-none text-textMuted">
            <Icon name="ChevronDown" size={16} />
          </div>
        </div>

        {error ? (
          <p className="text-xs text-danger font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-textMuted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
