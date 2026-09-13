import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useArticleBySlug, useArticles } from '../../../hooks/usePublicData';
import { incrementViewCountApi } from '../../../api/public';
import ContentRenderer from '../../../components/public/ContentRenderer';
import ArticleCard from '../../../components/public/ArticleCard';
import Icon from '../../../components/icons/Icon';
import Seo from '../../../components/shared/Seo';
import { ArticleDetailSkeleton } from '../../../components/ui/Skeleton';
import { useReaderStore } from '../../../stores/readerStore';

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

  const [readingProgress, setReadingProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Track window scroll to calculate reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setReadingProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate estimated reading time
  const wordCount = article?.content
    ? article.content.replace(/<[^>]*>?/gm, '').split(/\s+/).filter(Boolean).length
    : 0;
  const readingTimeMinutes = Math.max(2, Math.ceil(wordCount > 0 ? wordCount / 200 : 4));

  // Reader Store Integration: Bookmarks & History (must be called unconditionally at top level)
  const toggleBookmark = useReaderStore((state) => state.toggleBookmark);
  const isBookmarked = useReaderStore((state) => (slug ? state.isBookmarked(slug) : false));
  const recordRead = useReaderStore((state) => state.recordRead);

  useEffect(() => {
    if (article) {
      recordRead({
        slug: article.slug,
        title: article.title,
        topicName: article.topic?.name,
        coverImageUrl: article.coverImageUrl,
        estimatedReadTime: readingTimeMinutes,
      });
    }
  }, [article, recordRead, readingTimeMinutes]);

  const handleToggleBookmark = () => {
    if (!article) return;
    toggleBookmark({
      slug: article.slug,
      title: article.title,
      topic: article.topic ? { name: article.topic.name, slug: article.topic.slug } : undefined,
      excerpt: article.excerpt,
      coverImageUrl: article.coverImageUrl,
      estimatedReadTime: readingTimeMinutes,
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (isLoading) {
    return <ArticleDetailSkeleton />;
  }

  // Friendly 404 Page (Master §17 Rule 7 Security Boundary)
  if (isError || !article) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-bg text-text font-sans px-4">
        <div className="w-full max-w-md text-center space-y-5 rounded-2xl border border-stone-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-900/95 p-8 shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 text-gold border border-gold/30">
            <Icon name="FileText" size={30} />
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">Article Not Found</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            The article you are looking for does not exist, has been archived, or is currently unpublished.
          </p>
          <Link
            to="/articles"
            className="inline-flex items-center space-x-2 rounded-xl bg-gold px-5 py-2.5 text-xs font-bold text-zinc-950 transition hover:bg-goldHover shadow-md"
          >
            <Icon name="ArrowLeft" size={14} />
            <span>Back to Library</span>
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
  const articleJsonLd = {
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
  };

  return (
    <article className="min-h-screen bg-bg text-text font-sans py-4 sm:py-12 relative selection:bg-gold/20 selection:text-gold transition-colors duration-200">
      {/* Top Fixed Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-stone-200/50 dark:bg-zinc-800/50">
        <div
          className="h-full bg-gradient-to-r from-gold via-goldHover to-gold transition-all duration-150 ease-out shadow-sm shadow-gold/30"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <Seo
        title={article.title}
        description={cleanDescription}
        image={article.coverImageUrl}
        type="article"
        jsonLd={articleJsonLd}
      />

      <div className="mx-auto max-w-4xl px-3 sm:px-6 lg:px-8 space-y-5 sm:space-y-10">
        {/* Breadcrumb Navigation Bar */}
        <nav className="flex items-center space-x-1.5 sm:space-x-2 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 overflow-x-auto whitespace-nowrap scrollbar-none py-1">
          <Link to="/" className="hover:text-gold transition-colors flex items-center gap-1">
            <span>Home</span>
          </Link>
          <Icon name="ChevronRight" size={12} className="text-zinc-400 dark:text-zinc-600" />
          <Link to="/articles" className="hover:text-gold transition-colors">
            Articles
          </Link>
          {article.topic && (
            <>
              <Icon name="ChevronRight" size={12} className="text-zinc-400 dark:text-zinc-600" />
              <Link to={`/topics/${article.topic.slug}`} className="hover:text-gold transition-colors text-gold">
                {article.topic.name}
              </Link>
            </>
          )}
        </nav>

        {/* Article Header & Editorial Details */}
        <header className="space-y-3 sm:space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {article.topic && (
              <Link
                to={`/topics/${article.topic.slug}`}
                className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-gold transition hover:bg-gold/20"
              >
                <Icon name="Tag" size={11} className="sm:w-3 sm:h-3" />
                <span>{article.topic.name}</span>
              </Link>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <Icon name="Clock" size={11} className="text-gold sm:w-3 sm:h-3" />
              <span>{readingTimeMinutes} min read</span>
            </span>
            {article.viewCount !== undefined && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-medium text-zinc-600 dark:text-zinc-400">
                <Icon name="Eye" size={11} className="text-gold sm:w-3 sm:h-3" />
                <span>{article.viewCount} views</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-[1.18]">
            {article.title}
          </h1>

          {article.excerpt && (
            <div className="border-l-2 border-gold pl-3 sm:pl-6 py-0.5 sm:py-1">
              <p className="text-xs sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed font-serif italic">
                "{article.excerpt}"
              </p>
            </div>
          )}

          {/* Author & Byline Meta Card */}
          {/* Author & Byline Meta Card */}
          <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-surface/90 backdrop-blur-xl p-4 sm:p-6 shadow-apple-card flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              {article.author?.avatarUrl ? (
                <img
                  src={article.author.avatarUrl}
                  alt={article.author.name}
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border-2 border-gold/40 shadow-sm shrink-0"
                />
              ) : (
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gold/20 text-gold font-bold text-sm sm:text-base shrink-0 border border-gold/40 shadow-apple-sm">
                  {article.author?.name ? article.author.name.charAt(0).toUpperCase() : 'Q'}
                </div>
              )}
              <div>
                <p className="font-bold text-text text-xs sm:text-base">
                  {article.author?.name || 'Qindil Research Team'}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-textMuted">
                  <span>{formattedDate}</span>
                  <span>•</span>
                  <span className="text-gold font-medium">Peer Reviewed</span>
                </div>
              </div>
            </div>

            {/* Actions: Bookmark & Share */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleToggleBookmark}
                className={`inline-flex items-center space-x-1.5 rounded-full border px-4 py-2 text-[11px] sm:text-xs font-semibold active:scale-95 transition-all shadow-apple-sm ${
                  isBookmarked
                    ? 'border-gold bg-gold/15 text-gold font-bold shadow-apple-sm'
                    : 'border-border/80 bg-surface/80 text-text hover:text-gold hover:border-gold/50'
                }`}
                title={isBookmarked ? 'Remove from Saved Articles' : 'Save Article to Library'}
              >
                <Icon name="Bookmark" size={13} className="text-gold" />
                <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center space-x-1.5 rounded-full border border-border/80 bg-surface/80 px-4 py-2 text-[11px] sm:text-xs font-semibold text-text hover:text-gold hover:border-gold/50 active:scale-95 transition-all shadow-apple-sm"
                title="Copy Article Link"
              >
                <Icon name={copiedLink ? 'Check' : 'Share'} size={13} className="text-gold" />
                <span>{copiedLink ? 'Copied' : 'Share'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Cover Image Feature Banner */}
        {article.coverImageUrl && (
          <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 shadow-apple-elevated">
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="w-full max-h-[240px] sm:max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Article Content Paper */}
        <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-surface/95 dark:bg-zinc-900/95 backdrop-blur-2xl p-6 sm:p-14 shadow-apple-float leading-relaxed">
          <ContentRenderer content={article.content || article.excerpt} />
        </div>

        {/* Academic Citation Reference Box */}
        <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-surface/80 backdrop-blur-md p-4 sm:p-7 space-y-2.5 text-xs shadow-apple-sm">
          <div className="flex items-center gap-1.5 font-bold text-text">
            <Icon name="Bookmark" size={14} className="text-gold" />
            <span className="text-xs sm:text-sm">Academic Citation Reference</span>
          </div>
          <p className="font-mono text-[11px] sm:text-xs text-textMuted bg-bg/80 p-3 sm:p-4 rounded-2xl border border-border/80 break-all select-all shadow-inner">
            {article.author?.name || 'Qindil Research'}. "{article.title}." <em>Qindil Intellectual Journal</em>, {formattedDate || '2026'}. Web.
          </p>
        </div>

        {/* Related Articles Section - Prompt 42: horizontal-scroll row on mobile */}
        {relatedArticles.length > 0 && (
          <section className="border-t border-stone-200/90 dark:border-zinc-800/90 pt-6 sm:pt-14 space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gold">
                  Further Reading
                </span>
                <h2 className="text-base sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                  Related in {article.topic?.name}
                </h2>
              </div>

              {article.topic && (
                <Link
                  to={`/topics/${article.topic.slug}`}
                  className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-gold hover:text-goldHover transition-colors"
                >
                  <span>View All</span>
                  <Icon name="ChevronRight" size={12} />
                </Link>
              )}
            </div>

            {/* Prompt 42: Peer items row as horizontal scroll snap on mobile */}
            <div className="flex overflow-x-auto snap-x gap-2.5 pb-2.5 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible scrollbar-none">
              {relatedArticles.map((relArticle, index) => (
                <div key={relArticle._id} className="w-[220px] sm:w-[260px] md:w-auto shrink-0 snap-start">
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
