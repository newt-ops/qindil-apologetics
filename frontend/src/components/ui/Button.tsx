import React, { forwardRef } from 'react';
import Spinner from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
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
      pill = false,
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
      'inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-gold/40 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.97]';

    const variantClasses = {
      primary:
        'bg-gold text-bg shadow-[0_2px_10px_rgba(201,168,76,0.25),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:bg-goldHover hover:shadow-[0_4px_16px_rgba(201,168,76,0.35)]',
      secondary:
        'border border-border/80 bg-surface/90 backdrop-blur-md text-text shadow-apple-sm hover:bg-surface hover:border-gold/40 hover:shadow-apple-md',
      danger:
        'bg-danger text-white shadow-[0_2px_10px_rgba(220,38,38,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:bg-danger/90',
      ghost: 'text-textMuted hover:text-text hover:bg-surface/70',
    };

    const sizeClasses = {
      sm: `text-xs px-3.5 py-1.5 gap-1.5 ${pill ? 'rounded-full' : 'rounded-lg'}`,
      md: `text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 gap-2 ${pill ? 'rounded-full' : 'rounded-xl'}`,
      lg: `text-sm sm:text-base px-6 sm:px-7 py-2.5 sm:py-3.5 gap-2.5 ${pill ? 'rounded-full' : 'rounded-2xl'}`,
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
