import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useArticles, useActiveTopics } from '../../../hooks/usePublicData';
import ArticleCard from '../../../components/public/ArticleCard';
import Pagination from '../../../components/public/Pagination';
import SearchBar from '../../../components/public/SearchBar';
import EmptyState from '../../../components/ui/EmptyState';
import { ArticleCardSkeleton } from '../../../components/ui/Skeleton';
import Icon from '../../../components/icons/Icon';
import Seo from '../../../components/shared/Seo';

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

  const currentTopic = topicsData?.find((t) => t.slug === selectedTopicSlug);

  const pageTitle = searchQuery
    ? `Search: "${searchQuery}"`
    : currentTopic
    ? `Articles in ${currentTopic.name}`
    : 'Articles Library';

  return (
    <div className="min-h-screen bg-bg text-text font-sans py-8 sm:py-16 selection:bg-gold/20 selection:text-gold transition-colors duration-200">
      <Seo
        title={pageTitle}
        description="Explore peer-reviewed research papers, philosophical refutations, and comparative Islamic apologetics publications."
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* Editorial Hero Header */}
        <div className="relative rounded-3xl border border-stone-200/90 dark:border-zinc-800/90 bg-gradient-to-br from-white/95 via-surface to-stone-100/50 dark:from-zinc-900/90 dark:via-zinc-900/60 dark:to-zinc-950 p-6 sm:p-12 shadow-xl shadow-stone-200/40 dark:shadow-black/60 overflow-hidden">
          {/* Ambient Gold Radial Glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gold/10 dark:bg-gold/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gold/10 dark:bg-gold/5 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-xs font-semibold text-gold shadow-sm">
              <Icon name="BookOpen" size={13} />
              <span>Peer-Reviewed Publications &amp; Inquiries</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
              Intellectual &amp; Apologetic <span className="text-gold">Research Library</span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
              Delve into peer-reviewed treatises, critical philosophical refutations, and comparative religion inquiries authored by researchers and academic specialists.
            </p>
          </div>
        </div>

        {/* Filter Toolbar: Search Bar + Topic Pills */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Bar Input */}
            <div className="w-full md:w-80">
              <SearchBar
                initialValue={searchQuery}
                onSearchChange={handleSearchChange}
                placeholder="Search articles, topics or authors..."
              />
            </div>

            {/* Results count indicator */}
            <div className="flex items-center justify-between md:justify-end gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              {pagination && (
                <span className="font-medium">
                  {pagination.total} {pagination.total === 1 ? 'article' : 'articles'} cataloged
                </span>
              )}

              {(searchQuery || selectedTopicSlug) && (
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1 font-semibold text-gold hover:text-goldHover transition-colors border border-gold/30 bg-gold/10 px-2.5 py-1 rounded-full text-xs"
                >
                  <Icon name="X" size={12} />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Horizontal Topic Filter Pills */}
          {topicsData && topicsData.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => handleTopicChange('')}
                className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                  selectedTopicSlug === ''
                    ? 'bg-gold text-zinc-950 shadow-md shadow-gold/20 font-bold'
                    : 'border border-stone-200/90 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-400 hover:border-gold/50 hover:text-gold'
                }`}
              >
                All Topics
              </button>

              {topicsData.map((topic) => {
                const isActive = selectedTopicSlug === topic.slug;
                return (
                  <button
                    key={topic._id}
                    onClick={() => handleTopicChange(topic.slug)}
                    className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gold text-zinc-950 shadow-md shadow-gold/20 font-bold'
                        : 'border border-stone-200/90 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-400 hover:border-gold/50 hover:text-gold'
                    }`}
                  >
                    {topic.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Articles Grid — Clean, uncompressed, representative on mobile */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <ArticleCardSkeleton key={n} />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-danger/30 bg-danger/10 p-6 sm:p-8 text-center text-xs sm:text-sm text-danger font-medium">
            Failed to load articles catalog. Please try again later.
          </div>
        ) : articles.length > 0 ? (
          <div className="space-y-8 sm:space-y-12">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {articles.map((article, index) => (
                <ArticleCard key={article._id} article={article} index={index} />
              ))}
            </motion.div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="pt-4 border-t border-stone-200/80 dark:border-zinc-800/80">
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  hasNextPage={pagination.hasNextPage}
                  hasPrevPage={pagination.hasPrevPage}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-stone-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 p-8 sm:p-12">
            <EmptyState
              icon="Search"
              title="No matching research articles found"
              description={
                searchQuery
                  ? `No publications matched your search query "${searchQuery}". Try using different terms or clear the active topic filter.`
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
          </div>
        )}
      </div>
    </div>
  );
}

export default ArticlesPage;
