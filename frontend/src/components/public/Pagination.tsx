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
        className="flex items-center space-x-1.5 rounded-full border border-border/80 bg-surface/80 backdrop-blur-md px-4 py-2 text-xs font-semibold text-text shadow-apple-sm transition-all hover:border-gold/50 active:scale-90 disabled:opacity-40 disabled:hover:border-border/80 disabled:active:scale-100"
        aria-label="Previous Page"
      >
        <Icon name="ChevronLeft" size={15} />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {/* First Page indicator if skipped */}
      {pages[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-surface/80 text-xs font-semibold text-text shadow-apple-sm transition hover:border-gold active:scale-90"
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
          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all active:scale-90 ${
            p === page
              ? 'bg-gold text-bg font-bold shadow-apple-gold'
              : 'border border-border/80 bg-surface/80 backdrop-blur-sm text-text hover:border-gold/50 shadow-apple-sm'
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
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-surface/80 text-xs font-semibold text-text shadow-apple-sm transition hover:border-gold active:scale-90"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNextPage}
        className="flex items-center space-x-1.5 rounded-full border border-border/80 bg-surface/80 backdrop-blur-md px-4 py-2 text-xs font-semibold text-text shadow-apple-sm transition-all hover:border-gold/50 active:scale-90 disabled:opacity-40 disabled:hover:border-border/80 disabled:active:scale-100"
        aria-label="Next Page"
      >
        <span className="hidden sm:inline">Next</span>
        <Icon name="ChevronRight" size={15} />
      </button>
    </nav>
  );
}

export default Pagination;
