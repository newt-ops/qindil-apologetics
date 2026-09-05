import React from 'react';
import { useThemeStore } from '../../stores/themeStore';

interface LogoProps {
  variant?: 'full' | 'mark';
  height?: number;
  className?: string;
  alt?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  height = 36,
  className = '',
  alt = 'Qindil Logo',
}) => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  let logoSrc = '/logo/logo-mark.svg';

  if (variant === 'full') {
    logoSrc = isDark ? '/logo/logo-dark.svg' : '/logo/logo-light.svg';
  }

  return (
    <img
      src={logoSrc}
      alt={alt}
      style={{ height: `${height}px` }}
      className={`inline-block w-auto object-contain transition-all duration-200 select-none ${className}`}
    />
  );
};

export default Logo;
