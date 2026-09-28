import React, { forwardRef, useEffect, useRef } from 'react';
import Icon from '../icons/Icon';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked = false, indeterminate = false, label, onChange, disabled, className = '', id, ...props }, ref) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const resolvedRef = (ref || internalRef) as React.MutableRefObject<HTMLInputElement | null>;

    useEffect(() => {
      if (resolvedRef.current) {
        resolvedRef.current.indeterminate = Boolean(indeterminate);
      }
    }, [indeterminate, resolvedRef]);

    const isChecked = Boolean(checked) || Boolean(indeterminate);

    return (
      <label
        htmlFor={id}
        className={`inline-flex items-center gap-2 select-none cursor-pointer group ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            ref={resolvedRef}
            id={id}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="sr-only"
            {...props}
          />
          <div
            className={`h-4 w-4 rounded-[5px] border transition-all duration-150 flex items-center justify-center ${
              isChecked
                ? 'bg-gold border-gold text-bg shadow-2xs'
                : 'border-border/90 bg-surface/80 hover:border-gold/60'
            } group-focus-within:ring-2 group-focus-within:ring-gold/30`}
          >
            {indeterminate ? (
              <div className="h-0.5 w-2 bg-bg rounded-full" />
            ) : checked ? (
              <Icon name="Check" size={11} className="stroke-[3.5] text-bg" />
            ) : null}
          </div>
        </div>
        {label && <span className="text-xs font-medium text-text">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
export default Checkbox;
