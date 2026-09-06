import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'underline' | 'segmented';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className = '',
}) => {
  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex items-center gap-1 p-1 rounded-full bg-surface/80 border border-border/70 backdrop-blur-md overflow-x-auto scrollbar-none shadow-apple-sm ${className}`}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`group relative flex items-center gap-2 whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-gold text-bg shadow-apple-sm font-bold'
                  : 'text-textMuted hover:text-text hover:bg-surface/60'
              }`}
            >
              {tab.icon && <span className="inline-flex shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>

              {typeof tab.count === 'number' && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive ? 'bg-bg/20 text-bg' : 'bg-border/60 text-textMuted'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex border-b border-border/70 overflow-x-auto scrollbar-none ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`group relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-xs sm:text-sm font-semibold transition-colors duration-200 active:scale-98 ${
              isActive ? 'text-gold' : 'text-textMuted hover:text-text'
            }`}
          >
            {tab.icon && <span className="inline-flex shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>

            {typeof tab.count === 'number' && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition-colors ${
                  isActive
                    ? 'bg-gold/20 text-gold'
                    : 'bg-border/60 text-textMuted group-hover:text-text'
                }`}
              >
                {tab.count}
              </span>
            )}

            {/* Active tab gold indicator bar */}
            {isActive && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gold shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
