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
      <div className="pointer-events-none absolute left-3 text-[#c9a84c]">
        <Icon name="Search" size={16} />
      </div>

      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 pl-9 pr-9 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-[#c9a84c] focus:outline-none transition-colors shadow-inner font-sans"
      />

      {term && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 p-1 text-zinc-400 hover:text-zinc-100 transition-colors"
          title="Clear search"
        >
          <Icon name="X" size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
