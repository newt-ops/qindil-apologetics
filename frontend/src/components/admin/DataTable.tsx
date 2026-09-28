import React, { useState, useMemo, useEffect, useRef } from 'react';
import Table, { Column } from '../ui/Table';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Icon from '../icons/Icon';
import EmptyState from '../ui/EmptyState';
import Checkbox from '../ui/Checkbox';

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  onSortChange?: (columnKey: string, direction: 'asc' | 'desc') => void;
  onSearchChange?: (searchTerm: string) => void;
  searchPlaceholder?: string;
  filterBar?: React.ReactNode;
  selectable?: boolean;
  selectedIds?: (string | number)[];
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
  bulkActions?: (selectedIds: (string | number)[], clearSelection: () => void) => React.ReactNode;
  enableExport?: boolean;
  exportFilename?: string;
  pagination?: {
    page: number;
    totalPages: number;
    total?: number;
    pageSize?: number;
    pageSizeOptions?: number[];
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  };
  keyExtractor?: (item: T, index: number) => string | number;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  emptyState,
  onSortChange,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filterBar,
  selectable = false,
  selectedIds: controlledSelectedIds,
  onSelectionChange,
  bulkActions,
  enableExport = false,
  exportFilename = 'export.csv',
  pagination,
  keyExtractor,
  className = '',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [internalSelectedIds, setInternalSelectedIds] = useState<(string | number)[]>([]);

  const selectedIds = controlledSelectedIds !== undefined ? controlledSelectedIds : internalSelectedIds;

  const updateSelection = (newSelection: (string | number)[]) => {
    if (controlledSelectedIds === undefined) {
      setInternalSelectedIds(newSelection);
    }
    onSelectionChange?.(newSelection);
  };

  const clearSelection = () => {
    updateSelection([]);
  };

  // Helper to get key for item
  const getItemKey = (item: T, index: number): string | number => {
    if (keyExtractor) return keyExtractor(item, index);
    return item._id || item.id || index;
  };

  // Debounced search trigger for parent callback
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (!onSearchChange) return;

    const timer = setTimeout(() => {
      onSearchChange(searchTerm);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearchChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle column header click for sorting
  const handleSort = (key: string) => {
    let nextDirection: 'asc' | 'desc' = 'asc';
    if (sortColumn === key) {
      nextDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }
    setSortColumn(key);
    setSortDirection(nextDirection);

    if (onSortChange) {
      onSortChange(key, nextDirection);
    }
  };

  // Internal client-side filtering if onSearchChange callback is not passed
  const filteredData = useMemo(() => {
    if (onSearchChange || !searchTerm.trim()) {
      return data;
    }
    const term = searchTerm.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some((val) => {
        if (val === null || val === undefined) return false;
        if (typeof val === 'string' || typeof val === 'number') {
          return val.toString().toLowerCase().includes(term);
        }
        return false;
      })
    );
  }, [data, searchTerm, onSearchChange]);

  // Internal client-side sorting if onSortChange callback is not passed
  const sortedData = useMemo(() => {
    if (onSortChange || !sortColumn) {
      return filteredData;
    }
    return [...filteredData].sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      let comparison = 0;
      if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      } else {
        comparison = valA < valB ? -1 : 1;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection, onSortChange]);

  // Master Select All on visible page
  const allVisibleKeys = useMemo(
    () => sortedData.map((item, idx) => getItemKey(item, idx)),
    [sortedData]
  );

  const isAllSelected = allVisibleKeys.length > 0 && allVisibleKeys.every((k) => selectedIds.includes(k));
  const isSomeSelected = allVisibleKeys.some((k) => selectedIds.includes(k)) && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      // Unselect all visible
      updateSelection(selectedIds.filter((id) => !allVisibleKeys.includes(id)));
    } else {
      // Select all visible
      const set = new Set([...selectedIds, ...allVisibleKeys]);
      updateSelection(Array.from(set));
    }
  };

  const handleToggleRow = (key: string | number) => {
    if (selectedIds.includes(key)) {
      updateSelection(selectedIds.filter((id) => id !== key));
    } else {
      updateSelection([...selectedIds, key]);
    }
  };

  // Generate extended columns if selectable
  const tableColumns: Column<T>[] = useMemo(() => {
    if (!selectable) return columns;

    const selectColumn: Column<T> = {
      key: '__select__',
      header: (
        <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isAllSelected}
            indeterminate={isSomeSelected}
            onChange={handleToggleSelectAll}
            aria-label="Select all rows"
          />
        </div>
      ),
      width: '40px',
      render: (item: T) => {
        const key = getItemKey(item, 0);
        const checked = selectedIds.includes(key);
        return (
          <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={checked}
              onChange={() => handleToggleRow(key)}
              aria-label="Select row"
            />
          </div>
        );
      },
    };

    return [selectColumn, ...columns];
  }, [selectable, columns, selectedIds, sortedData, isAllSelected, isSomeSelected]);

  // CSV Export Function
  const handleExportCsv = () => {
    if (sortedData.length === 0) return;

    const exportColumns = columns.filter((c) => c.key !== '__select__' && c.key !== 'actions');
    const headers = exportColumns
      .map((c) => {
        const title = typeof c.header === 'string' ? c.header : c.key;
        return `"${title.replace(/"/g, '""')}"`;
      })
      .join(',');

    const rows = sortedData.map((item) => {
      return exportColumns
        .map((c) => {
          const val = item[c.key];
          if (val === null || val === undefined) return '""';
          const clean = typeof val === 'object' ? JSON.stringify(val) : String(val);
          return `"${clean.replace(/"/g, '""')}"`;
        })
        .join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', exportFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-3 font-sans ${className}`}>
      {/* Top Controls Bar: Search, Filters & Export */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <div className="w-full">
            <Input
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              leftElement={<Icon name="Search" size={15} className="text-textMuted" />}
              rightElement={
                searchTerm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      onSearchChange?.('');
                    }}
                    className="text-textMuted hover:text-text p-0.5 transition-colors"
                    title="Clear search"
                  >
                    <Icon name="X" size={13} />
                  </button>
                ) : undefined
              }
            />
          </div>

          {enableExport && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCsv}
              disabled={sortedData.length === 0}
              leftIcon={<Icon name="Download" size={14} />}
              className="shrink-0 whitespace-nowrap"
              title="Export visible records to CSV"
            >
              Export
            </Button>
          )}
        </div>

        {filterBar && <div className="shrink-0">{filterBar}</div>}
      </div>

      {/* Floating Bulk Action Bar when rows are selected */}
      {selectable && selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-gold/10 border border-gold/30 backdrop-blur-md shadow-apple-sm text-xs">
          <div className="flex items-center space-x-2 text-gold font-bold">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-bg font-mono text-[10px]">
              {selectedIds.length}
            </span>
            <span>Selected</span>
          </div>

          <div className="flex items-center space-x-2">
            {bulkActions && bulkActions(selectedIds, clearSelection)}

            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="text-textMuted hover:text-text text-xs"
            >
              Deselect All
            </Button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="relative">
        {isLoading ? (
          <div className="w-full overflow-hidden rounded-xl border border-border/70 bg-surface/80 shadow-2xs">
            <div className="w-full overflow-x-auto scrollbar-thin">
              <table className="w-full text-left border-collapse text-xs sm:text-[13px] text-text min-w-[540px] sm:min-w-full">
                <thead className="border-b border-border/70 bg-bg/60 dark:bg-zinc-950/40 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-textMuted select-none">
                  <tr>
                    {selectable && (
                      <th className="w-10 min-w-[40px] max-w-[40px] px-1 py-2 text-center">
                        <div className="h-3.5 w-3.5 mx-auto rounded-[4px] skeleton-shimmer bg-stone-200/60 dark:bg-zinc-800/60" />
                      </th>
                    )}
                    {columns.map((col, idx) => (
                      <th
                        key={idx}
                        style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                        className="px-3 sm:px-3.5 py-2.5"
                      >
                        <div
                          className={`h-3 rounded skeleton-shimmer bg-stone-200/70 dark:bg-zinc-800/70 ${
                            idx === 0 ? 'w-24' : 'w-16'
                          }`}
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {Array.from({ length: 6 }).map((_, rowIdx) => (
                    <tr key={rowIdx}>
                      {selectable && (
                        <td className="w-10 min-w-[40px] max-w-[40px] px-1 py-2 text-center">
                          <div className="h-3.5 w-3.5 mx-auto rounded-[4px] skeleton-shimmer bg-stone-200/60 dark:bg-zinc-800/60" />
                        </td>
                      )}
                      {columns.map((_, colIdx) => (
                        <td key={colIdx} className="px-3 sm:px-3.5 py-2 sm:py-2.5">
                          <div
                            className={`h-3 rounded skeleton-shimmer bg-stone-200/60 dark:bg-zinc-800/60 ${
                              colIdx === 0
                                ? 'w-3/5'
                                : colIdx === 1
                                ? 'w-20'
                                : colIdx === columns.length - 1
                                ? 'w-14 ml-auto'
                                : 'w-16'
                            }`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : sortedData.length === 0 ? (
          emptyState || (
            <EmptyState
              icon="Search"
              title="No matching records found"
              description="Try adjusting your search terms or filters to find what you're looking for."
            />
          )
        ) : (
          <Table
            columns={tableColumns}
            data={sortedData}
            onSort={handleSort}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            keyExtractor={getItemKey}
          />
        )}
      </div>

      {/* Bottom Pagination & Page Size Selector Controls */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/70 pt-3 text-xs text-textMuted">
          {/* Left: Summary & Page Size */}
          <div className="flex items-center space-x-3">
            <div>
              Showing Page <span className="font-bold text-text">{pagination.page}</span> of{' '}
              <span className="font-bold text-text">{pagination.totalPages || 1}</span>
              {pagination.total !== undefined && (
                <span className="ml-1">({pagination.total} total)</span>
              )}
            </div>

            {pagination.onPageSizeChange && (
              <div className="flex items-center space-x-1.5 pl-3 border-l border-border/60">
                <span className="text-[11px]">Rows:</span>
                <select
                  value={pagination.pageSize || 10}
                  onChange={(e) => pagination.onPageSizeChange?.(Number(e.target.value))}
                  className="bg-surface border border-border/80 rounded-lg px-2 py-1 text-xs text-text outline-none focus:border-gold/50 cursor-pointer"
                >
                  {(pagination.pageSizeOptions || [10, 25, 50, 100]).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Right: Page Navigation Buttons */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                leftIcon={<Icon name="ChevronLeft" size={14} />}
              >
                Previous
              </Button>

              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                rightIcon={<Icon name="ChevronRight" size={14} />}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DataTable;
