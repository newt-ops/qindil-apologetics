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
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex border-b border-border overflow-x-auto scrollbar-none ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`group relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
              isActive ? 'text-gold' : 'text-textMuted hover:text-text'
            }`}
          >
            {tab.icon && <span className="inline-flex shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>

            {typeof tab.count === 'number' && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
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
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-sm bg-gold" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
