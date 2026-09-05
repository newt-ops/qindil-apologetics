import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useArticles } from '../../hooks/usePublicData';
import ArticleCard from '../../components/public/ArticleCard';
import Pagination from '../../components/public/Pagination';
import Icon from '../../components/icons/Icon';
import Seo from '../../components/shared/Seo';

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
    <div className="min-h-screen bg-bg text-text font-sans py-12">
      <Seo
        title={topicTitle}
        description={topic?.description || `Explore Qindil Apologetics articles, scholarly refutations, and publications on ${topicTitle}.`}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center space-x-2 text-xs text-textMuted">
          <Link to="/topics" className="hover:text-gold transition-colors">
            Topics
          </Link>
          <Icon name="ChevronRight" size={12} />
          <span className="text-gold font-medium">{topic?.name || slug}</span>
        </div>

        {/* Topic Header Banner */}
        <div className="mb-10 rounded-xl border border-border bg-surface p-8 shadow-lg">
          <div className="space-y-2">
            <span className="inline-block rounded-full border border-gold/30 bg-gold/10 px-3 py-0.5 text-xs font-semibold text-gold">
              Category
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
              {topic?.name || (slug ? slug.replace(/-/g, ' ') : 'Topic Catalog')}
            </h1>
            {topic?.description && (
              <p className="text-sm text-textMuted leading-relaxed max-w-3xl pt-1">
                {topic.description}
              </p>
            )}
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
            Failed to load articles for this topic.
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
          <div className="rounded-lg border border-border bg-surface p-12 text-center text-sm text-textMuted">
            No published articles found in this category yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default ArticlesByTopicPage;
