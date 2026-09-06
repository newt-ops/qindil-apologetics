import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useArticles } from '../../../hooks/usePublicData';
import ArticleCard from '../../../components/public/ArticleCard';
import Pagination from '../../../components/public/Pagination';
import EmptyState from '../../../components/ui/EmptyState';
import Icon from '../../../components/icons/Icon';
import Seo from '../../../components/shared/Seo';

export function ArticlesByTopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const { data, isLoading, isError } = useArticles({
    topic: slug || '',
    page,
    limit: 9,
  });

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const articles = data?.articles || [];
  const pagination = data?.pagination;
  const topic = data?.topic;

  const topicTitle = topic?.name || (slug ? slug.replace(/-/g, ' ') : 'Topic Catalog');

  return (
    <div className="min-h-screen bg-bg text-text font-sans py-8 sm:py-16 selection:bg-gold/20 selection:text-gold transition-colors duration-200">
      <Seo
        title={topicTitle}
        description={topic?.description || `Explore Qindil Apologetics articles, scholarly refutations, and publications on ${topicTitle}.`}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400 overflow-x-auto whitespace-nowrap scrollbar-none py-1">
          <Link to="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <Icon name="ChevronRight" size={12} className="text-zinc-400 dark:text-zinc-600" />
          <Link to="/topics" className="hover:text-gold transition-colors">
            Topics
          </Link>
          <Icon name="ChevronRight" size={12} className="text-zinc-400 dark:text-zinc-600" />
          <span className="text-gold font-semibold truncate max-w-[200px] sm:max-w-none">
            {topic?.name || slug}
          </span>
        </nav>

        {/* Topic Banner Box */}
        <div className="relative rounded-3xl border border-stone-200/90 dark:border-zinc-800/90 bg-gradient-to-br from-white/95 via-surface to-stone-100/50 dark:from-zinc-900/90 dark:via-zinc-900/60 dark:to-zinc-950 p-6 sm:p-12 shadow-xl shadow-stone-200/40 dark:shadow-black/60 overflow-hidden">
          {/* Ambient Gold Halo */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gold/10 dark:bg-gold/5 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-xs font-semibold text-gold shadow-sm">
                <Icon name="Tag" size={12} />
                <span>Curated Research Domain</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
                {topic?.name || topicTitle}
              </h1>

              {topic?.description && (
                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                  {topic.description}
                </p>
              )}
            </div>

            {/* Back Button / Quick Action */}
            <div className="shrink-0">
              <Link
                to="/topics"
                className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 px-4 py-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:border-gold/50 hover:text-gold transition-all shadow-sm"
              >
                <Icon name="ArrowLeft" size={14} />
                <span>All Disciplines</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Articles Grid — Prompt 42: Compact 2-column grid on mobile */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-56 sm:h-96 animate-pulse rounded-2xl border border-stone-200 dark:border-zinc-800 bg-stone-100/70 dark:bg-zinc-900/60"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-danger/30 bg-danger/10 p-6 sm:p-8 text-center text-xs sm:text-sm text-danger font-medium">
            Failed to load publications for this category. Please try again later.
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
              className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:grid-cols-3"
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
              icon="BookOpen"
              title="No treatises found in this domain"
              description="Articles are currently being prepared for peer review and publication in this discipline."
              action={{
                label: 'Browse All Articles',
                onClick: () => window.location.assign('/articles'),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ArticlesByTopicPage;
