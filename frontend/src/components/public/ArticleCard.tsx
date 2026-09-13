import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PublicArticle } from '../../api/public';
import Icon from '../icons/Icon';

interface ArticleCardProps {
  article: PublicArticle;
  index?: number;
  hideTopicBadge?: boolean;
}

export function ArticleCard({ article, index = 0, hideTopicBadge = false }: ArticleCardProps) {
  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  // Estimate reading time based on available text
  const textSource = article.content || article.excerpt || '';
  const wordCount = textSource ? textSource.replace(/<[^>]*>?/gm, '').split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.max(2, Math.ceil(wordCount > 0 ? wordCount / 200 : 4));

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
      className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-surface/90 backdrop-blur-xl overflow-hidden shadow-apple-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-apple-elevated hover:border-gold/50 active:scale-[0.98] h-full"
    >
      <Link to={`/articles/${article.slug}`} className="flex flex-col flex-1">
        {/* Visual Cover Banner — Clean, representative aspect ratio */}
        <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-stone-100 dark:bg-zinc-950 border-b border-border/60 shrink-0">
          {article.coverImageUrl ? (
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-[#b3854c]/15 via-stone-100 to-stone-50 dark:from-[#c9a84c]/15 dark:via-zinc-900 dark:to-zinc-950">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,168,76,0.12),transparent_70%)]" />
              <div className="h-12 w-12 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-gold/30 shadow-apple-sm flex items-center justify-center text-gold transition-transform duration-500 group-hover:scale-110">
                <Icon name="BookOpen" size={24} />
              </div>
            </div>
          )}

          {/* Gradient Lighting Overlay on Image */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

          {/* Topic Badge — Hidden on topic catalog pages or when redundant */}
          {!hideTopicBadge && article.topic && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-white/95 dark:bg-zinc-950/90 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-semibold text-gold shadow-apple-sm truncate max-w-[140px] sm:max-w-none">
                <Icon name="Tag" size={10} className="shrink-0 text-gold/80" />
                <span className="truncate">{article.topic.name}</span>
              </span>
            </div>
          )}

          {/* Reading Time Badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 text-zinc-200 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-medium shadow-apple-sm">
              <Icon name="Clock" size={10} className="text-gold" />
              <span>{readingTime} min read</span>
            </span>
          </div>
        </div>

        {/* Card Body — Spacious, readable, representative */}
        <div className="flex flex-col flex-1 justify-between p-4 sm:p-5 space-y-3">
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-gold transition-colors line-clamp-2">
              {article.title}
            </h3>

            {article.excerpt && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {article.excerpt}
              </p>
            )}
          </div>

          {/* Card Footer: Clean Byline and Reading Action */}
          <div className="pt-3 border-t border-stone-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center space-x-2">
              {article.author?.avatarUrl ? (
                <img
                  src={article.author.avatarUrl}
                  alt={article.author.name}
                  className="h-6 w-6 rounded-full object-cover border border-gold/40 shrink-0"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-gold font-bold text-[10px] shrink-0 border border-gold/30">
                  {article.author?.name ? article.author.name.charAt(0).toUpperCase() : 'Q'}
                </div>
              )}
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                {article.author?.name || 'Qindil Research'}
              </span>
            </div>

            <div className="flex items-center space-x-3 text-xs shrink-0">
              {/* Raw view count hidden on mobile to eliminate visual clutter */}
              {article.viewCount !== undefined && article.viewCount > 0 && (
                <div className="hidden sm:flex items-center space-x-1 text-zinc-500 dark:text-zinc-400">
                  <Icon name="Eye" size={12} className="text-gold/80" />
                  <span>{article.viewCount}</span>
                </div>
              )}

              <span className="text-zinc-400 dark:text-zinc-500 text-[11px]">
                {formattedDate}
              </span>

              <div className="flex items-center space-x-0.5 text-gold font-bold group-hover:translate-x-0.5 transition-transform">
                <span className="text-xs">Read</span>
                <Icon name="ChevronRight" size={13} />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default ArticleCard;
