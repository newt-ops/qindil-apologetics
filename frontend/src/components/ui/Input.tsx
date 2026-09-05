import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftElement,
      rightElement,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-textMuted">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftElement && (
            <div className="absolute left-3 flex items-center pointer-events-none text-textMuted">
              {leftElement}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-md border bg-surface py-2.5 text-sm text-text placeholder-textMuted transition duration-200 focus:outline-none focus:ring-1 ${
              error
                ? 'border-danger focus:border-danger focus:ring-danger'
                : 'border-border focus:border-gold focus:ring-gold'
            } ${leftElement ? 'pl-10' : 'px-4'} ${rightElement ? 'pr-10' : 'px-4'} ${className}`}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3 flex items-center text-textMuted">
              {rightElement}
            </div>
          )}
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

Input.displayName = 'Input';

export default Input;
