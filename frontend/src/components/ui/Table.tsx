import React from 'react';
import Icon from '../icons/Icon';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (item: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor?: (item: T, index: number) => string | number;
  onSort?: (key: string) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  emptyMessage?: string;
  className?: string;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  onSort,
  sortColumn,
  sortDirection = 'asc',
  emptyMessage = 'No data available',
  className = '',
}: TableProps<T>) {
  return (
    <div className={`w-full overflow-x-auto rounded-lg border border-border bg-surface scrollbar-thin ${className}`}>
      <table className="w-full text-left text-sm text-text border-collapse min-w-[600px] sm:min-w-full">
        <thead className="border-b border-border bg-bg/60 text-xs font-semibold uppercase tracking-wider text-textMuted">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={`px-4 py-3 ${
                  col.sortable && onSort ? 'cursor-pointer select-none hover:text-text' : ''
                }`}
                onClick={() => {
                  if (col.sortable && onSort) {
                    onSort(col.key);
                  }
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span>{col.header}</span>
                  {col.sortable && (
                    <span className="text-textMuted">
                      {sortColumn === col.key ? (
                        sortDirection === 'asc' ? (
                          <Icon name="ChevronUp" size={14} className="text-gold" />
                        ) : (
                          <Icon name="ChevronDown" size={14} className="text-gold" />
                        )
                      ) : (
                        <Icon name="ChevronDown" size={14} className="opacity-30" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-textMuted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              const key = keyExtractor ? keyExtractor(item, index) : item._id || item.id || index;
              return (
                <tr key={key} className="hover:bg-bg/40 transition-colors duration-150">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5 align-middle">
                      {col.render ? col.render(item) : item[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
