import Icon from '../icons/Icon';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPrevPage,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers array around current page
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav className="flex items-center justify-center space-x-2 py-8 font-sans">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevPage}
        className="flex items-center space-x-1 rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-text transition hover:border-gold disabled:opacity-40 disabled:hover:border-border"
        aria-label="Previous Page"
      >
        <Icon name="ChevronLeft" size={16} />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {/* First Page indicator if skipped */}
      {pages[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-text transition hover:border-gold"
          >
            1
          </button>
          {pages[0] > 2 && <span className="px-1 text-xs text-textMuted">...</span>}
        </>
      )}

      {/* Page Numbers */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`rounded-md px-3.5 py-2 text-xs font-semibold transition ${
            p === page
              ? 'bg-gold text-bg shadow-md shadow-gold/20'
              : 'border border-border bg-surface text-text hover:border-gold'
          }`}
        >
          {p}
        </button>
      ))}

      {/* Last Page indicator if skipped */}
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="px-1 text-xs text-textMuted">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-text transition hover:border-gold"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNextPage}
        className="flex items-center space-x-1 rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-text transition hover:border-gold disabled:opacity-40 disabled:hover:border-border"
        aria-label="Next Page"
      >
        <span className="hidden sm:inline">Next</span>
        <Icon name="ChevronRight" size={16} />
      </button>
    </nav>
  );
}

export default Pagination;
