import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFeaturedArticles, useActiveTopics } from '../../../hooks/usePublicData';
import { useSettings } from '../../../hooks/useSettings';
import ArticleCard from '../../../components/public/ArticleCard';
import { ArticleCardSkeleton, TopicCardSkeleton } from '../../../components/ui/Skeleton';
import Icon from '../../../components/icons/Icon';
import Seo from '../../../components/shared/Seo';

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
    <div className="min-h-screen bg-bg text-text font-sans selection:bg-gold/30 selection:text-gold transition-colors duration-200">
      <Seo
        title="Islamic Apologetics & Intellectual Research"
        description="Qindil Apologetics delivers peer-reviewed research, classical theology papers, philosophical refutations, and comparative religion studies."
        jsonLd={homeJsonLd}
      />

      {/* 1. HERO SECTION — Prompt 42 Mobile-First Typography & Padding */}
      <section className="relative overflow-hidden border-b border-stone-200/80 dark:border-zinc-800/80 bg-gradient-to-b from-stone-50/70 via-bg to-bg dark:from-zinc-950 dark:via-bg dark:to-bg py-8 sm:py-20 lg:py-32">
        {/* Ambient Gold Radial Glows */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(179,133,76,0.14),transparent_70%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(201,168,76,0.18),transparent_70%)]" />
        <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] sm:h-[420px] w-[500px] sm:w-[600px] bg-gold/10 dark:bg-gold/5 blur-[120px] sm:blur-[140px] rounded-full" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center max-w-4xl mx-auto space-y-4 sm:space-y-6"
          >
            {/* Top Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-gold shadow-sm backdrop-blur-md">
              <Icon name="Sparkles" size={12} className="text-gold" />
              <span>Independent Peer-Reviewed Research Initiative</span>
            </div>

            {/* Main Headline — Scaled for mobile */}
            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
              Illuminating Truth.{' '}
              <span className="block mt-0.5 sm:mt-2 bg-gradient-to-r from-[#b3854c] via-[#c9a84c] to-amber-300 bg-clip-text text-transparent">
                Defending Faith with Reason.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base lg:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto font-normal">
              A dedicated academic platform delivering rigorous theological answers, philosophical refutations, and comparative Islamic apologetics for seekers of truth worldwide.
            </p>

            {/* Hero Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 pt-1 sm:pt-3">
              <Link
                to="/articles"
                className="w-full sm:w-auto rounded-full bg-gold px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-zinc-950 shadow-apple-gold hover:bg-goldHover active:scale-97 flex items-center justify-center space-x-2 transition-all duration-200"
              >
                <Icon name="BookOpen" size={16} />
                <span>Explore Research Library</span>
              </Link>
              <Link
                to="/topics"
                className="w-full sm:w-auto rounded-full border border-border/80 bg-surface/80 backdrop-blur-md px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-text shadow-apple-sm hover:border-gold/50 hover:text-gold active:scale-97 flex items-center justify-center space-x-2 transition-all duration-200"
              >
                <Icon name="Compass" size={16} />
                <span>Browse Disciplines</span>
              </Link>
            </div>

            {/* Scholarly Highlights Strip — Dense mobile grid */}
            <div className="pt-6 sm:pt-12 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 max-w-3xl mx-auto text-left">
              <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-surface/80 p-3.5 sm:p-5 backdrop-blur-md shadow-apple-sm hover:shadow-apple-md hover:-translate-y-0.5 transition-all">
                <p className="text-lg sm:text-2xl font-black text-gold">100%</p>
                <p className="text-[10px] sm:text-[11px] font-medium text-textMuted mt-0.5">Primary Citations</p>
              </div>
              <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-surface/80 p-3.5 sm:p-5 backdrop-blur-md shadow-apple-sm hover:shadow-apple-md hover:-translate-y-0.5 transition-all">
                <p className="text-lg sm:text-2xl font-black text-gold">17+</p>
                <p className="text-[10px] sm:text-[11px] font-medium text-textMuted mt-0.5">Thematic Topics</p>
              </div>
              <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-surface/80 p-3.5 sm:p-5 backdrop-blur-md shadow-apple-sm hover:shadow-apple-md hover:-translate-y-0.5 transition-all">
                <p className="text-lg sm:text-2xl font-black text-gold">32</p>
                <p className="text-[10px] sm:text-[11px] font-medium text-textMuted mt-0.5">Scholarly Team</p>
              </div>
              <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-surface/80 p-3.5 sm:p-5 backdrop-blur-md shadow-apple-sm hover:shadow-apple-md hover:-translate-y-0.5 transition-all">
                <p className="text-lg sm:text-2xl font-black text-gold">Open</p>
                <p className="text-[10px] sm:text-[11px] font-medium text-textMuted mt-0.5">Public Library</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. RESEARCH TOPICS STRIP — Prompt 42 Horizontal Swipe Row on Mobile */}
      <section className="py-8 sm:py-16 border-b border-stone-200/80 dark:border-zinc-800/80 bg-stone-50/50 dark:bg-zinc-950/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gold">
                Thematic Architecture
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                Curated Research Disciplines
              </h2>
            </div>

            <Link
              to="/topics"
              className="inline-flex items-center space-x-1 text-xs sm:text-sm font-bold text-gold hover:text-goldHover transition-colors shrink-0"
            >
              <span>View All</span>
              <Icon name="ArrowRight" size={13} />
            </Link>
          </div>

          {isTopicsLoading ? (
            <div className="flex overflow-x-auto gap-3 pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:pb-0 scrollbar-none">
              {[1, 2, 3, 4].map((n) => (
                <TopicCardSkeleton key={n} className="h-28 w-[200px] shrink-0 sm:w-auto" />
              ))}
            </div>
          ) : topics && topics.length > 0 ? (
            <div className="flex overflow-x-auto snap-x gap-3 pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:pb-0 scrollbar-none">
              {topics.slice(0, 6).map((topic, index) => (
                <motion.div
                  key={topic._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="shrink-0 w-[58vw] max-w-[210px] snap-center sm:w-auto sm:max-w-none"
                >
                  <Link
                    to={`/topics/${topic.slug}`}
                    className="group block h-full rounded-3xl border border-border/80 bg-surface/90 backdrop-blur-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 shadow-apple-sm hover:shadow-apple-card active:scale-98"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gold/10 text-gold border border-gold/30 shadow-apple-sm">
                        <Icon name="Layers" size={16} />
                      </div>
                      <Icon
                        name="ArrowRight"
                        size={13}
                        className="text-textMuted group-hover:text-gold group-hover:translate-x-0.5 transition-all"
                      />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-text group-hover:text-gold transition-colors truncate">
                      {topic.name}
                    </h3>
                    {topic.description && (
                      <p className="text-[10px] sm:text-xs text-textMuted line-clamp-2 leading-relaxed mt-1">
                        {topic.description}
                      </p>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border/80 bg-surface/70 backdrop-blur-sm p-6 text-center text-xs text-textMuted shadow-apple-sm">
              No categories available at the moment.
            </div>
          )}
        </div>
      </section>

      {/* 3. FEATURED ARTICLES SECTION — Prompt 42 Horizontal Swipe Row on Mobile */}
      <section id="featured" className="py-8 sm:py-16 bg-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gold">
                Featured Scholarship
              </span>
              <h2 className="text-lg sm:text-3xl font-black text-text tracking-tight">
                Peer-Reviewed Publications
              </h2>
            </div>

            <Link
              to="/articles"
              className="inline-flex items-center space-x-1 text-xs sm:text-sm font-bold text-gold hover:text-goldHover transition-colors shrink-0 active:scale-95"
            >
              <span>View Library</span>
              <Icon name="ArrowRight" size={13} />
            </Link>
          </div>

          {isArticlesLoading ? (
            <div className="flex overflow-x-auto gap-3 pb-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:pb-0 scrollbar-none">
              {[1, 2, 3].map((n) => (
                <div key={n} className="w-[240px] shrink-0 sm:w-auto h-full">
                  <ArticleCardSkeleton />
                </div>
              ))}
            </div>
          ) : isArticlesError ? (
            <div className="rounded-3xl border border-danger/30 bg-danger/10 p-6 text-center text-xs sm:text-sm text-danger font-medium shadow-apple-sm">
              Failed to load articles. Please refresh the page.
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="flex overflow-x-auto snap-x gap-3 pb-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:pb-0 scrollbar-none">
              {articles.slice(0, 6).map((article, index) => (
                <div
                  key={article._id}
                  className="shrink-0 w-[72vw] max-w-[280px] snap-center sm:w-auto sm:max-w-none"
                >
                  <ArticleCard article={article} index={index} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-border/80 bg-surface/70 backdrop-blur-sm p-8 text-center text-xs text-textMuted shadow-apple-sm">
              No publications currently available in this repository.
            </div>
          )}
        </div>
      </section>

      {/* 4. METHODOLOGY & PILLARS */}
      <section className="py-10 sm:py-20 border-t border-border/60 bg-stone-50/50 dark:bg-zinc-950/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-[10px] sm:text-xs font-bold text-gold uppercase tracking-widest">
              Intellectual Methodology
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-text tracking-tight">
              Our Core Research Pillars
            </h2>
            <p className="text-xs sm:text-sm text-textMuted">
              Defending theological truth through rigorous philosophical argumentation and peer-reviewed scholarship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="rounded-3xl border border-border/80 bg-surface/90 backdrop-blur-xl p-6 sm:p-8 space-y-3.5 shadow-apple-card hover:shadow-apple-elevated hover:border-gold/50 hover:-translate-y-1 transition-all">
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-gold/10 border border-gold/30 shadow-apple-sm flex items-center justify-center text-gold">
                <Icon name="BookOpen" size={22} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-text">
                Theological &amp; Rational Apologetics
              </h3>
              <p className="text-xs text-textMuted leading-relaxed">
                Formulating rigorous philosophical defenses of Monotheism (Tawhid), divine wisdom, and Islamic cosmology against reductionist materialism.
              </p>
            </div>

            <div className="rounded-3xl border border-border/80 bg-surface/90 backdrop-blur-xl p-6 sm:p-8 space-y-3.5 shadow-apple-card hover:shadow-apple-elevated hover:border-gold/50 hover:-translate-y-1 transition-all">
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-gold/10 border border-gold/30 shadow-apple-sm flex items-center justify-center text-gold">
                <Icon name="Shield" size={22} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-text">
                Critical Refutations &amp; Forensics
              </h3>
              <p className="text-xs text-textMuted leading-relaxed">
                Methodically dismantling contemporary anti-theist polemics and orientalist claims using original manuscripts and primary academic citations.
              </p>
            </div>

            <div className="rounded-3xl border border-border/80 bg-surface/90 backdrop-blur-xl p-6 sm:p-8 space-y-3.5 shadow-apple-card hover:shadow-apple-elevated hover:border-gold/50 hover:-translate-y-1 transition-all">
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-gold/10 border border-gold/30 shadow-apple-sm flex items-center justify-center text-gold">
                <Icon name="Video" size={22} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-text">
                Scholarly Digital Publications
              </h3>
              <p className="text-xs text-textMuted leading-relaxed">
                Producing high-definition video treatises, debate dissections, and accessible multimedia presentations for digital intellectual discourse.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INQUIRY & DISCOURSE CALL TO ACTION */}
      <section className="py-10 sm:py-20 bg-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl border border-border/80 bg-surface/95 dark:bg-zinc-900/90 backdrop-blur-2xl p-8 sm:p-14 shadow-apple-float overflow-hidden text-center max-w-3xl mx-auto">
            <div className="relative z-10 space-y-5">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-[10px] sm:text-xs font-semibold text-gold shadow-apple-sm">
                <Icon name="Mail" size={12} />
                <span>Intellectual Inquiries &amp; Contributions</span>
              </div>

              <h2 className="text-xl sm:text-3xl font-black text-text tracking-tight">
                Have a Theological or Philosophical Inquiry?
              </h2>

              <p className="text-xs sm:text-sm text-textMuted leading-relaxed max-w-xl mx-auto">
                Our research council welcomes academic critiques, apologetic inquiries, and collaborative paper submissions from researchers globally.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  to="/contact"
                  className="w-full sm:w-auto rounded-full bg-gold px-6 py-3 text-xs sm:text-sm font-bold text-zinc-950 shadow-apple-gold hover:bg-goldHover active:scale-97 flex items-center justify-center space-x-2 transition-all"
                >
                  <Icon name="Send" size={15} />
                  <span>Submit an Inquiry</span>
                </Link>
                <Link
                  to="/register"
                  className="w-full sm:w-auto rounded-full border border-border/80 bg-surface/80 px-6 py-3 text-xs sm:text-sm font-semibold text-text shadow-apple-sm hover:border-gold/50 hover:text-gold active:scale-97 flex items-center justify-center space-x-2 transition-all"
                >
                  <Icon name="User" size={15} />
                  <span>Join Research Community</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
