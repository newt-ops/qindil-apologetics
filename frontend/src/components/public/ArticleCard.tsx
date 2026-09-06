import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PublicArticle } from '../../api/public';
import Icon from '../icons/Icon';

interface ArticleCardProps {
  article: PublicArticle;
  index?: number;
}

export function ArticleCard({ article, index = 0 }: ArticleCardProps) {
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
      className="group flex flex-col justify-between rounded-2xl border border-stone-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-300/40 dark:hover:shadow-black/70 hover:border-gold/60 dark:hover:border-gold/50 h-full"
    >
      <Link to={`/articles/${article.slug}`} className="flex flex-col flex-1">
        {/* Visual Cover Banner — Prompt 42 mobile density scaling */}
        <div className="relative h-28 sm:h-44 md:h-48 w-full overflow-hidden bg-stone-100 dark:bg-zinc-950 border-b border-stone-200/60 dark:border-zinc-800/60 shrink-0">
          {article.coverImageUrl ? (
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-[#b3854c]/15 via-stone-100 to-stone-50 dark:from-[#c9a84c]/15 dark:via-zinc-900 dark:to-zinc-950">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,168,76,0.12),transparent_70%)]" />
              <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-gold/30 shadow-md flex items-center justify-center text-gold transition-transform duration-500 group-hover:scale-110">
                <Icon name="BookOpen" size={18} className="sm:hidden" />
                <Icon name="BookOpen" size={24} className="hidden sm:inline" />
              </div>
            </div>
          )}

          {/* Gradient Lighting Overlay on Image */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

          {/* Topic Badge */}
          {article.topic && (
            <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10">
              <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-white/95 dark:bg-zinc-950/90 backdrop-blur-md px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 text-[9px] sm:text-[11px] font-semibold text-gold shadow-sm truncate max-w-[105px] sm:max-w-none">
                <Icon name="Tag" size={9} className="shrink-0 text-gold/80" />
                <span className="truncate">{article.topic.name}</span>
              </span>
            </div>
          )}

          {/* Reading Time Badge */}
          <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/60 text-zinc-200 backdrop-blur-md px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium shadow-sm">
              <Icon name="Clock" size={9} className="text-gold" />
              <span>{readingTime}m</span>
            </span>
          </div>
        </div>

        {/* Card Body — Scaled for mobile 2-col density */}
        <div className="flex flex-col flex-1 justify-between p-2.5 sm:p-4 md:p-5">
          <div className="space-y-1 sm:space-y-2">
            <h3 className="text-xs sm:text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-gold transition-colors line-clamp-2">
              {article.title}
            </h3>

            {article.excerpt && (
              <p className="hidden sm:block text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {article.excerpt}
              </p>
            )}
          </div>

          {/* Card Footer: Author, Views & Date */}
          <div className="mt-2.5 pt-2 sm:mt-4 sm:pt-3 border-t border-stone-200/80 dark:border-zinc-800/80 flex items-center justify-between text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center space-x-1.5 sm:space-x-2 truncate">
              {article.author?.avatarUrl ? (
                <img
                  src={article.author.avatarUrl}
                  alt={article.author.name}
                  className="h-5 w-5 sm:h-6 sm:w-6 rounded-full object-cover border border-gold/40 shrink-0"
                />
              ) : (
                <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-gold/20 text-gold font-bold text-[9px] sm:text-[10px] shrink-0 border border-gold/30">
                  {article.author?.name ? article.author.name.charAt(0).toUpperCase() : 'Q'}
                </div>
              )}
              <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[65px] sm:max-w-none">
                {article.author?.name ? article.author.name.split(' ')[0] : 'Qindil'}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-[9px] sm:text-[11px] shrink-0">
              {article.viewCount !== undefined && article.viewCount > 0 && (
                <div className="flex items-center space-x-0.5 text-zinc-500 dark:text-zinc-400">
                  <Icon name="Eye" size={11} className="text-gold/80" />
                  <span>{article.viewCount}</span>
                </div>
              )}
              <span className="hidden sm:inline text-zinc-400 dark:text-zinc-500">
                {formattedDate}
              </span>
              <div className="flex items-center space-x-0.5 text-gold font-semibold group-hover:translate-x-0.5 transition-transform">
                <span className="hidden md:inline text-[11px]">Read</span>
                <Icon name="ChevronRight" size={12} />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default ArticleCard;
