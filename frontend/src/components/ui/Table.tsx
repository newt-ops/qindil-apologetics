import React from 'react';
import Icon from '../icons/Icon';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
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
    <div className={`w-full overflow-hidden rounded-xl border border-border/70 bg-surface/80 shadow-2xs ${className}`}>
      <div className="w-full overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse text-xs sm:text-[13px] text-text min-w-[540px] sm:min-w-full">
          <thead className="border-b border-border/70 bg-bg/60 dark:bg-zinc-950/40 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-textMuted select-none">
            <tr>
              {columns.map((col) => {
                const isSelect = col.key === '__select__';
                const alignClass =
                  col.align === 'center' || isSelect
                    ? 'text-center'
                    : col.align === 'right'
                    ? 'text-right'
                    : 'text-left';

                return (
                  <th
                    key={col.key}
                    style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                    className={`${
                      isSelect ? 'w-10 min-w-[40px] max-w-[40px] px-1 py-2' : 'px-3 sm:px-3.5 py-2.5'
                    } ${alignClass} ${
                      isSelect
                        ? 'sticky left-0 z-20 bg-surface/95 dark:bg-zinc-900/95 backdrop-blur-sm'
                        : ''
                    } ${
                      col.sortable && onSort ? 'cursor-pointer select-none hover:text-text hover:bg-bg/40 transition-colors' : ''
                    } ${col.className || ''}`}
                    onClick={() => {
                      if (col.sortable && onSort) {
                        onSort(col.key);
                      }
                    }}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'center' || isSelect
                          ? 'justify-center'
                          : col.align === 'right'
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      {typeof col.header === 'string' ? <span>{col.header}</span> : col.header}
                      {col.sortable && (
                        <span className="text-textMuted shrink-0">
                          {sortColumn === col.key ? (
                            sortDirection === 'asc' ? (
                              <Icon name="ChevronUp" size={13} className="text-gold" />
                            ) : (
                              <Icon name="ChevronDown" size={13} className="text-gold" />
                            )
                          ) : (
                            <Icon name="ChevronDown" size={13} className="opacity-25" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-xs text-textMuted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const key = keyExtractor ? keyExtractor(item, index) : item._id || item.id || index;
                return (
                  <tr
                    key={key}
                    className="hover:bg-gold/[0.03] dark:hover:bg-white/[0.02] transition-colors duration-100 group"
                  >
                    {columns.map((col) => {
                      const isSelect = col.key === '__select__';
                      const alignClass =
                        col.align === 'center' || isSelect
                          ? 'text-center'
                          : col.align === 'right'
                          ? 'text-right'
                          : 'text-left';

                      return (
                        <td
                          key={col.key}
                          style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                          className={`${
                            isSelect
                              ? 'w-10 min-w-[40px] max-w-[40px] px-1 py-2'
                              : 'px-3 sm:px-3.5 py-2 sm:py-2.5'
                          } align-middle ${alignClass} ${
                            isSelect
                              ? 'sticky left-0 z-10 bg-surface/95 dark:bg-zinc-900/95 backdrop-blur-sm'
                              : ''
                          } ${col.className || ''}`}
                        >
                          {col.render ? col.render(item) : item[col.key] ?? '—'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
