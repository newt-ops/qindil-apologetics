import React, { forwardRef } from 'react';
import Spinner from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variantClasses = {
      primary: 'bg-gold text-bg hover:bg-goldHover active:scale-[0.98]',
      secondary:
        'border border-border bg-surface text-text hover:bg-surface/80 hover:border-gold/30 active:scale-[0.98]',
      danger: 'bg-danger text-white hover:bg-danger/80 active:scale-[0.98]',
      ghost: 'text-textMuted hover:text-text hover:bg-surface/60 active:scale-[0.98]',
    };

    const sizeClasses = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3 gap-2.5',
    };

    const spinnerSizeMap = {
      sm: 'sm' as const,
      md: 'sm' as const,
      lg: 'md' as const,
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner size={spinnerSizeMap[size]} className={variant === 'primary' ? 'border-bg border-t-transparent' : ''} />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
