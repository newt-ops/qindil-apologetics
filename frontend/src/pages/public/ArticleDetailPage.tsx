import { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useArticleBySlug, useArticles } from '../../hooks/usePublicData';
import { incrementViewCountApi } from '../../api/public';
import ContentRenderer from '../../components/public/ContentRenderer';
import ArticleCard from '../../components/public/ArticleCard';
import Icon from '../../components/icons/Icon';
import Seo from '../../components/shared/Seo';

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const viewIncrementedRef = useRef(false);

  const { data: article, isLoading, isError } = useArticleBySlug(slug || '');

  // Fetch related articles in the same topic
  const { data: relatedData } = useArticles({
    topic: article?.topic?.slug || '',
    limit: 4,
  });

  const relatedArticles = (relatedData?.articles || []).filter(
    (a) => a._id !== article?._id
  ).slice(0, 3);

  // Increment view count once per mount using useRef guard
  useEffect(() => {
    if (slug && !viewIncrementedRef.current) {
      viewIncrementedRef.current = true;
      incrementViewCountApi(slug).catch(() => {
        // Silent catch for view count increment errors
      });
    }
  }, [slug]);

  // Strip HTML tags for clean description fallback
  const cleanDescription = article
    ? article.excerpt ||
      (article.content ? article.content.replace(/<[^>]*>?/gm, '').substring(0, 160).trim() : '')
    : undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg text-text font-sans py-16">
        <div className="mx-auto max-w-4xl px-4 space-y-6 animate-pulse">
          <div className="h-6 w-32 bg-surface rounded" />
          <div className="h-10 w-4/5 bg-surface rounded" />
          <div className="h-64 w-full bg-surface rounded-xl" />
          <div className="space-y-3 pt-6">
            <div className="h-4 w-full bg-surface rounded" />
            <div className="h-4 w-full bg-surface rounded" />
            <div className="h-4 w-3/4 bg-surface rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Friendly 404 Page (Master §17 Rule 7 Security Boundary)
  if (isError || !article) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-bg text-text font-sans px-4">
        <div className="w-full max-w-md text-center space-y-4 rounded-xl border border-border bg-surface p-8 shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold">
            <Icon name="FileText" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-text">Article Not Found</h1>
          <p className="text-xs text-textMuted leading-relaxed">
            The article you are looking for does not exist, has been moved, or is not publicly available.
          </p>
          <Link
            to="/articles"
            className="inline-flex items-center space-x-2 rounded-md bg-gold px-5 py-2.5 text-xs font-bold text-bg transition hover:bg-goldHover shadow-md"
          >
            <Icon name="ArrowLeft" size={14} />
            <span>Back to Articles</span>
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  // Construct Article Schema JSON-LD for Search Engine Indexing
  const articleJsonLd = article
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: cleanDescription,
        image: article.coverImageUrl ? [article.coverImageUrl] : undefined,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt || article.publishedAt,
        author: {
          '@type': 'Person',
          name: article.author?.name || 'Qindil Research Team',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Qindil Apologetics',
          logo: {
            '@type': 'ImageObject',
            url: typeof window !== 'undefined' ? `${window.location.origin}/logo/logo-dark.svg` : 'https://qindilapologetics.com/logo/logo-dark.svg',
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': typeof window !== 'undefined' ? window.location.href : undefined,
        },
      }
    : undefined;

  return (
    <article className="min-h-screen bg-bg text-text font-sans py-6 sm:py-12">
      <Seo
        title={article.title}
        description={cleanDescription}
        image={article.coverImageUrl}
        type="article"
        jsonLd={articleJsonLd}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-4 sm:mb-6 flex items-center space-x-2 text-[11px] sm:text-xs text-textMuted overflow-x-auto whitespace-nowrap scrollbar-none">
          <Link to="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <Icon name="ChevronRight" size={12} />
          <Link to="/articles" className="hover:text-gold transition-colors">
            Articles
          </Link>
          {article.topic && (
            <>
              <Icon name="ChevronRight" size={12} />
              <Link to={`/topics/${article.topic.slug}`} className="hover:text-gold transition-colors">
                {article.topic.name}
              </Link>
            </>
          )}
        </div>

        {/* Article Header */}
        <header className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          {article.topic && (
            <Link
              to={`/topics/${article.topic.slug}`}
              className="inline-block rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-gold transition hover:bg-gold/20"
            >
              {article.topic.name}
            </Link>
          )}

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-text tracking-tight leading-tight">
            {article.title}
          </h1>

          <p className="text-sm sm:text-lg text-textMuted leading-relaxed italic font-serif">
            "{article.excerpt}"
          </p>

          {/* Author & Byline */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 sm:pt-4 border-t border-b border-border/60 py-3 sm:py-4 text-xs text-textMuted">
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              {article.author?.avatarUrl ? (
                <img
                  src={article.author.avatarUrl}
                  alt={article.author.name}
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover border border-gold/30 shrink-0"
                />
              ) : (
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gold/20 text-gold font-bold text-xs sm:text-sm shrink-0">
                  {article.author?.name ? article.author.name.charAt(0).toUpperCase() : 'Q'}
                </div>
              )}
              <div>
                <p className="font-semibold text-text text-xs sm:text-sm">{article.author?.name || 'Qindil Research Team'}</p>
                <p className="text-[10px] sm:text-[11px] text-textMuted">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {article.viewCount !== undefined && (
                <div className="flex items-center space-x-1 rounded-full border border-border bg-surface px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs">
                  <Icon name="Eye" size={13} className="text-gold" />
                  <span>{article.viewCount} views</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Cover Image Banner */}
        {article.coverImageUrl && (
          <div className="mb-6 sm:mb-10 overflow-hidden rounded-xl border border-border shadow-xl">
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="w-full max-h-[280px] sm:max-h-[450px] object-cover"
            />
          </div>
        )}

        {/* Article Main Body Content */}
        <div className="rounded-xl border border-border/40 bg-surface/30 p-4 sm:p-10 shadow-sm mb-10 sm:mb-16">
          <ContentRenderer content={article.content || article.excerpt} />
        </div>

        {/* Related Articles Strip */}
        {relatedArticles.length > 0 && (
          <section className="border-t border-border pt-8 sm:pt-12">
            <h2 className="text-lg sm:text-xl font-bold text-gold tracking-tight mb-4 sm:mb-6">
              Related Articles in {article.topic?.name}
            </h2>
            <div className="flex overflow-x-auto snap-x gap-4 pb-4 md:grid md:grid-cols-3 md:overflow-visible md:pb-0 scrollbar-none">
              {relatedArticles.map((relArticle, index) => (
                <div
                  key={relArticle._id}
                  className="shrink-0 w-[82vw] max-w-[300px] snap-center md:w-auto md:max-w-none"
                >
                  <ArticleCard article={relArticle} index={index} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

export default ArticleDetailPage;
