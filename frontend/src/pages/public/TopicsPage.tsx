import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useActiveTopics } from '../../hooks/usePublicData';
import Icon from '../../components/icons/Icon';
import Seo from '../../components/shared/Seo';

export function TopicsPage() {
  const { data: topics, isLoading, isError } = useActiveTopics();

  return (
    <div className="min-h-screen bg-bg text-text font-sans py-12">
      <Seo
        title="Research Topics"
        description="Explore Qindil Apologetics research topics covering Islamic theology, philosophical refutations, and comparative religion studies."
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-xs font-semibold text-gold">
            <Icon name="Compass" size={14} />
            <span>Curated Research Domains</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
            Apologetics Categories
          </h1>
          <p className="text-sm text-textMuted leading-relaxed">
            Browse our research library categorized by theological, philosophical, and historical topics.
          </p>
        </div>

        {/* Topics Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-36 sm:h-44 animate-pulse rounded-lg border border-border bg-surface/50 p-4 sm:p-6"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-danger/30 bg-danger/10 p-6 text-center text-sm text-danger">
            Failed to load categories. Please try again later.
          </div>
        ) : topics && topics.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
            {topics.map((topic, index) => (
              <motion.div
                key={topic._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.08, 0.4) }}
              >
                <Link
                  to={`/topics/${topic.slug}`}
                  className="group relative flex flex-col justify-between h-36 sm:h-48 rounded-lg border border-border bg-surface p-3.5 sm:p-6 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-gold/50 hover:shadow-xl hover:shadow-gold/5"
                >
                  {/* Subtle Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10 space-y-1 sm:space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs font-semibold text-gold uppercase tracking-wider">
                        Topic Area
                      </span>
                      <Icon
                        name="ArrowRight"
                        size={14}
                        className="text-textMuted group-hover:text-gold group-hover:translate-x-1 transition-all sm:w-4 sm:h-4"
                      />
                    </div>

                    <h3 className="text-xs sm:text-xl font-bold text-text group-hover:text-gold transition-colors leading-snug line-clamp-2">
                      {topic.name}
                    </h3>

                    {topic.description && (
                      <p className="text-[11px] sm:text-xs text-textMuted line-clamp-2 sm:line-clamp-3 leading-relaxed hidden sm:block">
                        {topic.description}
                      </p>
                    )}
                  </div>

                  <div className="relative z-10 flex items-center space-x-1 text-[11px] sm:text-xs font-semibold text-gold mt-2 sm:mt-4">
                    <span>Browse</span>
                    <Icon name="ChevronRight" size={12} className="sm:w-3.5 sm:h-3.5" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-surface p-12 text-center text-sm text-textMuted">
            No research categories found.
          </div>
        )}
      </div>
    </div>
  );
}

export default TopicsPage;
