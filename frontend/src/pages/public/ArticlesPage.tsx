import { useSearchParams } from 'react-router-dom';
import { useArticles, useActiveTopics } from '../../hooks/usePublicData';
import ArticleCard from '../../components/public/ArticleCard';
import Pagination from '../../components/public/Pagination';
import SearchBar from '../../components/public/SearchBar';
import EmptyState from '../../components/ui/EmptyState';
import Icon from '../../components/icons/Icon';
import Seo from '../../components/shared/Seo';

export function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTopicSlug = searchParams.get('topic') || '';
  const searchQuery = searchParams.get('search') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const { data: topicsData } = useActiveTopics();
  const { data, isLoading, isError } = useArticles({
    topic: selectedTopicSlug,
    search: searchQuery,
    page,
    limit: 9,
  });

  const handleTopicChange = (newSlug: string) => {
    const params: Record<string, string> = {};
    if (newSlug) params.topic = newSlug;
    if (searchQuery) params.search = searchQuery;
    params.page = '1';
    setSearchParams(params);
  };

  const handleSearchChange = (newSearch: string) => {
    const params: Record<string, string> = {};
    if (selectedTopicSlug) params.topic = selectedTopicSlug;
    if (newSearch.trim()) params.search = newSearch.trim();
    params.page = '1';
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage: number) => {
    const params: Record<string, string> = {};
    if (selectedTopicSlug) params.topic = selectedTopicSlug;
    if (searchQuery) params.search = searchQuery;
    params.page = newPage.toString();
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const articles = data?.articles || [];
  const pagination = data?.pagination;

  const pageTitle = searchQuery
    ? `Search: "${searchQuery}"`
    : selectedTopicSlug
    ? `Articles — ${selectedTopicSlug}`
    : 'Articles Library';

  return (
    <div className="min-h-screen bg-bg text-text font-sans py-12">
      <Seo
        title={pageTitle}
        description="Explore peer-reviewed articles, academic refutations, and comparative Islamic apologetics publications."
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header & Filter Controls */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
              Articles Library
            </h1>
            <p className="text-sm text-textMuted max-w-xl">
              Explore scholarly papers, theological refutations, and philosophical essays.
            </p>
          </div>

          {/* Search & Topic Dropdown Filter Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <SearchBar
              initialValue={searchQuery}
              onSearchChange={handleSearchChange}
              className="w-full sm:w-72"
            />

            <div className="flex items-center space-x-2 shrink-0">
              <label className="text-xs font-semibold text-textMuted uppercase tracking-wider hidden sm:inline">
                Topic:
              </label>
              <div className="relative w-full sm:w-auto">
                <select
                  value={selectedTopicSlug}
                  onChange={(e) => handleTopicChange(e.target.value)}
                  className="w-full sm:w-auto appearance-none rounded-lg border border-border bg-surface px-4 py-2 pr-9 text-xs font-semibold text-text transition focus:border-gold focus:outline-none cursor-pointer"
                >
                  <option value="">All Topics</option>
                  {topicsData?.map((t) => (
                    <option key={t._id} value={t.slug}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-textMuted">
                  <Icon name="ChevronDown" size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-48 sm:h-64 animate-pulse rounded-lg border border-border bg-surface/50 p-4 sm:p-6"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-danger/30 bg-danger/10 p-6 text-center text-sm text-danger">
            Failed to load articles catalog. Please try again later.
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, index) => (
                <ArticleCard key={article._id} article={article} index={index} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && (
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                hasNextPage={pagination.hasNextPage}
                hasPrevPage={pagination.hasPrevPage}
              />
            )}
          </>
        ) : (
          <EmptyState
            icon="Search"
            title="No matching articles found"
            description={
              searchQuery
                ? `No articles matched your search query "${searchQuery}". Try using different keywords or clearing active filters.`
                : 'No published articles found matching your selected criteria.'
            }
            action={
              searchQuery || selectedTopicSlug
                ? {
                    label: 'Clear All Filters',
                    onClick: handleClearFilters,
                  }
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}

export default ArticlesPage;

