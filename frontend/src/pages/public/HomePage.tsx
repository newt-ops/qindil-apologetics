import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFeaturedArticles, useActiveTopics } from '../../hooks/usePublicData';
import { useSettings } from '../../hooks/useSettings';
import ArticleCard from '../../components/public/ArticleCard';
import Icon from '../../components/icons/Icon';
import Seo from '../../components/shared/Seo';

export function HomePage() {
  const { data: articles, isLoading: isArticlesLoading, isError: isArticlesError } = useFeaturedArticles();
  const { data: topics, isLoading: isTopicsLoading } = useActiveTopics();
  const { data: settings } = useSettings();

  const socialLinksObj = settings?.socialLinks || {};
  const sameAsLinks = [
    socialLinksObj.youtube,
    socialLinksObj.telegram,
    socialLinksObj.instagram,
    socialLinksObj.facebook,
    socialLinksObj.tiktok,
  ].filter(Boolean);

  const homeJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Qindil Apologetics',
      url: typeof window !== 'undefined' ? window.location.origin : 'https://qindilapologetics.com',
      logo: typeof window !== 'undefined' ? `${window.location.origin}/logo/logo-dark.svg` : 'https://qindilapologetics.com/logo/logo-dark.svg',
      description: 'Qindil Apologetics is an independent research platform delivering scholarly articles, philosophical refutations, and Islamic theology studies.',
      sameAs: sameAsLinks.length > 0 ? sameAsLinks : ['https://qindilapologetics.com'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Qindil Apologetics',
      url: typeof window !== 'undefined' ? window.location.origin : 'https://qindilapologetics.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${typeof window !== 'undefined' ? window.location.origin : 'https://qindilapologetics.com'}/articles?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  return (
    <div className="min-h-screen bg-bg text-text font-sans selection:bg-gold/30 selection:text-gold">
      <Seo
        title="Islamic Apologetics & Intellectual Research"
        description="Qindil Apologetics provides rigorous research, Islamic apologetics papers, philosophical refutations, and comparative theology studies."
        jsonLd={homeJsonLd}
      />
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-border/80 bg-surface/40 py-10 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent opacity-60" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-6"
          >
            <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 sm:px-4 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-gold">
              <Icon name="BookOpen" size={13} className="sm:w-3.5 sm:h-3.5" />
              <span>Intellectual Clarity & Islamic Apologetics</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight text-text leading-tight">
              Qindil Apologetics: <br className="hidden sm:inline" />
              <span className="text-gold bg-gradient-to-r from-gold via-goldHover to-amber-200 bg-clip-text text-transparent">
                Illuminating Truth, Defending Faith.
              </span>
            </h1>

            <p className="text-xs sm:text-base lg:text-lg text-textMuted leading-relaxed max-w-2xl mx-auto">
              Welcome to Qindil Apologetics. A dedicated research initiative providing peer-reviewed answers, philosophical refutations, and comparative Islamic apologetics analysis for truth-seekers worldwide.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
              <Link
                to="/topics"
                className="w-full sm:w-auto rounded-md bg-gold px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-bold text-bg transition hover:bg-goldHover shadow-lg shadow-gold/20 flex items-center justify-center space-x-2"
              >
                <span>Explore Topics</span>
                <Icon name="ArrowRight" size={15} />
              </Link>
              <a
                href="#featured"
                className="w-full sm:w-auto rounded-md border border-border bg-surface px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold text-text transition hover:border-gold/50 flex items-center justify-center"
              >
                Featured Articles
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. TOPICS PREVIEW STRIP */}
      <section className="py-8 sm:py-16 border-b border-border/60 bg-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4 sm:mb-8">
            <div>
              <h2 className="text-lg font-bold text-gold tracking-tight sm:text-2xl">
                Research Categories
              </h2>
              <p className="text-[11px] sm:text-sm text-textMuted mt-0.5 sm:mt-1">
                Explore articles and refutations organized by topic area
              </p>
            </div>
            <Link
              to="/topics"
              className="text-xs sm:text-sm font-medium text-gold hover:underline flex items-center space-x-1 shrink-0"
            >
              <span>View All</span>
              <Icon name="ChevronRight" size={14} className="sm:w-4 sm:h-4" />
            </Link>
          </div>

          {isTopicsLoading ? (
            <div className="flex overflow-x-auto gap-3 pb-3 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:pb-0 scrollbar-none">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-24 w-[200px] shrink-0 sm:w-auto animate-pulse rounded-lg border border-border/60 bg-surface/50 p-4"
                />
              ))}
            </div>
          ) : topics && topics.length > 0 ? (
            <div className="flex overflow-x-auto snap-x gap-3 pb-3 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:pb-0 scrollbar-none">
              {topics.map((topic, index) => (
                <motion.div
                  key={topic._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="shrink-0 w-[65vw] max-w-[240px] snap-center sm:w-auto sm:max-w-none"
                >
                  <Link
                    to={`/topics?slug=${topic.slug}`}
                    className="group block h-full rounded-lg border border-border bg-surface p-4 sm:p-5 transition hover:border-gold/60 hover:shadow-lg hover:shadow-gold/5"
                  >
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <span className="text-xs sm:text-sm font-bold text-text group-hover:text-gold transition-colors truncate">
                        {topic.name}
                      </span>
                      <Icon
                        name="ArrowRight"
                        size={14}
                        className="text-textMuted group-hover:text-gold group-hover:translate-x-1 transition-all shrink-0 ml-1"
                      />
                    </div>
                    {topic.description && (
                      <p className="text-[11px] sm:text-xs text-textMuted line-clamp-2 leading-relaxed">
                        {topic.description}
                      </p>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-surface/30 p-6 text-center text-xs text-textMuted">
              No categories available at the moment.
            </div>
          )}
        </div>
      </section>

      {/* 3. FEATURED ARTICLES GRID */}
      <section id="featured" className="py-10 sm:py-20 bg-surface/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-10">
            <div>
              <h2 className="text-xl font-bold text-text tracking-tight sm:text-3xl">
                Featured Articles
              </h2>
              <p className="text-[11px] sm:text-sm text-textMuted mt-0.5 sm:mt-1">
                Latest scholastic publications and analytical essays
              </p>
            </div>
          </div>

          {isArticlesLoading ? (
            <div className="flex overflow-x-auto gap-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:pb-0 scrollbar-none">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-64 w-[280px] shrink-0 md:w-auto animate-pulse rounded-lg border border-border bg-surface p-6 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="h-4 w-20 bg-border/60 rounded" />
                    <div className="h-6 w-full bg-border/60 rounded" />
                    <div className="h-4 w-4/5 bg-border/40 rounded" />
                  </div>
                  <div className="h-4 w-1/3 bg-border/40 rounded" />
                </div>
              ))}
            </div>
          ) : isArticlesError ? (
            <div className="rounded-lg border border-danger/30 bg-danger/10 p-6 text-center text-sm text-danger">
              Failed to load featured articles. Please try again later.
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="flex overflow-x-auto snap-x gap-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:pb-0 scrollbar-none">
              {articles.map((article, index) => (
                <div
                  key={article._id}
                  className="shrink-0 w-[82vw] max-w-[320px] snap-center md:w-auto md:max-w-none"
                >
                  <ArticleCard article={article} index={index} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-surface p-8 sm:p-12 text-center text-xs sm:text-sm text-textMuted">
              No published articles available yet. Check back soon!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
