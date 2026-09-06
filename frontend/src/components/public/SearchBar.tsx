import React, { useState, useEffect } from 'react';
import Icon from '../icons/Icon';

export interface SearchBarProps {
  initialValue?: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialValue = '',
  onSearchChange,
  placeholder = 'Search articles, refutations, & topics...',
  className = '',
}) => {
  const [term, setTerm] = useState(initialValue);

  // Sync internal state if initialValue changes externally
  useEffect(() => {
    setTerm(initialValue);
  }, [initialValue]);

  // Debounce changes by ~400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(term);
    }, 400);

    return () => clearTimeout(handler);
  }, [term, onSearchChange]);

  const handleClear = () => {
    setTerm('');
    onSearchChange('');
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="pointer-events-none absolute left-3.5 text-gold">
        <Icon name="Search" size={16} />
      </div>

      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-border/80 bg-surface/80 backdrop-blur-md pl-10 pr-9 py-2.5 text-xs sm:text-sm text-text placeholder:text-textMuted/70 shadow-apple-sm focus:bg-surface focus:border-gold focus:ring-4 focus:ring-gold/15 focus:outline-none transition-all duration-200 font-sans"
      />

      {term && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 rounded-full p-1 text-textMuted hover:text-text hover:bg-bg/80 active:scale-90 transition-all"
          title="Clear search"
        >
          <Icon name="X" size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
