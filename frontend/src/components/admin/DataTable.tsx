import React, { useState, useMemo } from 'react';
import Table, { Column } from '../ui/Table';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Icon from '../icons/Icon';
import EmptyState from '../ui/EmptyState';
import { DataTableSkeleton } from '../ui/Skeleton';

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  onSortChange?: (columnKey: string, direction: 'asc' | 'desc') => void;
  onSearchChange?: (searchTerm: string) => void;
  searchPlaceholder?: string;
  filterBar?: React.ReactNode;
  pagination?: {
    page: number;
    totalPages: number;
    total?: number;
    onPageChange: (page: number) => void;
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
  pagination,
  keyExtractor,
  className = '',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
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

  return (
    <div className={`space-y-4 font-sans ${className}`}>
      {/* Top Controls Bar: Search & FilterBar Slot */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:w-72 shrink-0">
          <Input
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            leftElement={<Icon name="Search" size={16} />}
          />
        </div>

        {filterBar && <div className="flex-1">{filterBar}</div>}
      </div>

      {/* Table Container */}
      <div className="relative">
        {isLoading ? (
          <DataTableSkeleton columns={columns.length || 4} rows={5} />
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
            columns={columns}
            data={sortedData}
            onSort={handleSort}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            keyExtractor={keyExtractor}
          />
        )}
      </div>

      {/* Bottom Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-textMuted">
          <div>
            Showing Page <span className="font-bold text-text">{pagination.page}</span> of{' '}
            <span className="font-bold text-text">{pagination.totalPages}</span>
            {pagination.total !== undefined && (
              <span className="ml-1">({pagination.total} total items)</span>
            )}
          </div>

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
        </div>
      )}
    </div>
  );
}

export default DataTable;
