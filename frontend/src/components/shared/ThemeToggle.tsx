import React from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../../stores/themeStore';
import Icon from '../icons/Icon';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center space-x-2 rounded-md p-2 text-textMuted hover:bg-surface hover:text-gold transition-colors duration-150 focus:outline-none ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        key={theme}
        initial={{ scale: 0.8, rotate: -30, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Icon name="Sun" size={18} className="text-gold" />
        ) : (
          <Icon name="Moon" size={18} className="text-gold" />
        )}
      </motion.div>
      {showLabel && (
        <span className="text-xs font-medium text-text">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
