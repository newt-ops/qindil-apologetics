import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useActiveTopics } from '../../../hooks/usePublicData';
import Icon from '../../../components/icons/Icon';
import Seo from '../../../components/shared/Seo';
import { TopicCardSkeleton } from '../../../components/ui/Skeleton';

export function TopicsPage() {
  const { data: topics, isLoading, isError } = useActiveTopics();

  return (
    <div className="min-h-screen bg-bg text-text font-sans py-6 sm:py-16 selection:bg-gold/20 selection:text-gold transition-colors duration-200">
      <Seo
        title="Research Topics"
        description="Explore Qindil Apologetics research topics covering Islamic theology, philosophical refutations, and comparative religion studies."
      />

      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-12">
        {/* Editorial Hero Header Banner */}
        <div className="relative rounded-2xl sm:rounded-3xl border border-stone-200/90 dark:border-zinc-800/90 bg-gradient-to-br from-white/95 via-surface to-stone-100/50 dark:from-zinc-900/90 dark:via-zinc-900/60 dark:to-zinc-950 p-4 sm:p-10 shadow-xl shadow-stone-200/40 dark:shadow-black/60 overflow-hidden text-center max-w-4xl mx-auto">
          {/* Ambient Gold Halo */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-96 rounded-full bg-gold/10 dark:bg-gold/5 blur-3xl" />

          <div className="relative z-10 space-y-2.5 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-semibold text-gold shadow-sm">
              <Icon name="Compass" size={13} />
              <span>Structured Research Disciplines</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
              Apologetics <span className="text-gold">Categories &amp; Domains</span>
            </h1>

            <p className="text-xs sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              Browse our curated research archive structured across philosophical argumentation, classical theism, critical refutations, and manuscript studies.
            </p>
          </div>
        </div>

        {/* Topics Grid - Prompt 42 Mobile Density: Compact 2-column grid on small viewports */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <TopicCardSkeleton key={n} />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-danger/30 bg-danger/10 p-6 sm:p-8 text-center text-xs sm:text-sm text-danger font-medium">
            Failed to load research categories. Please try again later.
          </div>
        ) : topics && topics.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:grid-cols-3">
            {topics.map((topic, index) => (
              <motion.div
                key={topic._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
              >
                <Link
                  to={`/topics/${topic.slug}`}
                  className="group relative flex flex-col justify-between h-40 sm:h-64 rounded-2xl sm:rounded-3xl border border-stone-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-900/90 p-3 sm:p-8 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-2xl hover:shadow-gold/10"
                >
                  {/* Subtle Background Glow on Hover */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Header: Emblem & Arrow */}
                  <div className="relative z-10 flex items-start justify-between gap-2">
                    <div className="flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gold/10 text-gold border border-gold/30 shadow-sm transition-transform duration-300 group-hover:scale-110 shrink-0">
                      <span className="hidden sm:inline">
                        <Icon name="Layers" size={22} />
                      </span>
                      <span className="sm:hidden">
                        <Icon name="Layers" size={16} />
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-[10px] sm:text-xs font-semibold text-gold group-hover:translate-x-1 transition-transform">
                      <span className="hidden sm:inline text-[11px] uppercase tracking-wider">Explore</span>
                      <Icon name="ArrowRight" size={12} className="sm:w-3.5 sm:h-3.5" />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="relative z-10 space-y-1 sm:space-y-2 mt-2 sm:mt-4">
                    <h3 className="text-xs sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-gold transition-colors leading-snug line-clamp-2">
                      {topic.name}
                    </h3>

                    {topic.description && (
                      <p className="hidden sm:block text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {topic.description}
                      </p>
                    )}
                  </div>

                  {/* Footer Pill */}
                  <div className="relative z-10 pt-2 sm:pt-4 border-t border-stone-200/80 dark:border-zinc-800/80 flex items-center justify-between text-[9px] sm:text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span className="font-semibold text-gold truncate">Archive</span>
                    <span className="inline-flex items-center gap-0.5 sm:gap-1 shrink-0">
                      <span className="hidden sm:inline">View treatises</span>
                      <Icon name="ChevronRight" size={11} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl sm:rounded-3xl border border-stone-200/90 dark:border-zinc-800/90 bg-white/70 dark:bg-zinc-900/70 p-8 sm:p-12 text-center text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            No research disciplines found.
          </div>
        )}
      </div>
    </div>
  );
}

export default TopicsPage;
