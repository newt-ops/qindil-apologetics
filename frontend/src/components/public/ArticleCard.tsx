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

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.4) }}
      className="group flex flex-col justify-between rounded-lg border border-border bg-surface overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-gold/50 hover:shadow-xl hover:shadow-gold/5 h-full"
    >
      <Link to={`/articles/${article.slug}`} className="flex flex-col flex-1">
        {/* Cover Image or Dark Gradient Fallback */}
        <div className="relative h-32 sm:h-48 w-full overflow-hidden bg-gradient-to-br from-surface to-bg border-b border-border/60 shrink-0">
          {article.coverImageUrl ? (
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/10 via-surface to-bg">
              <Icon name="BookOpen" size={28} className="text-gold/40 sm:w-9 sm:h-9" />
            </div>
          )}

          {/* Topic Badge */}
          {article.topic && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
              <span className="inline-block rounded-full border border-gold/30 bg-bg/90 backdrop-blur-md px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] font-semibold text-gold shadow-sm truncate max-w-[120px] sm:max-w-none">
                {article.topic.name}
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex flex-col flex-1 justify-between p-3 sm:p-5">
          <div className="space-y-1.5 sm:space-y-2.5">
            <h3 className="text-xs sm:text-base font-bold text-text leading-snug group-hover:text-gold transition-colors line-clamp-2">
              {article.title}
            </h3>

            <p className="text-[11px] sm:text-xs text-textMuted line-clamp-2 sm:line-clamp-3 leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          {/* Bottom Meta Row */}
          <div className="mt-3 pt-2 sm:mt-6 sm:pt-3.5 border-t border-border/60 flex items-center justify-between text-[10px] sm:text-xs text-textMuted">
            <div className="flex items-center space-x-1.5 sm:space-x-2 truncate">
              {article.author?.avatarUrl ? (
                <img
                  src={article.author.avatarUrl}
                  alt={article.author.name}
                  className="h-5 w-5 sm:h-6 sm:w-6 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-gold/20 text-gold font-bold text-[9px] sm:text-[10px] shrink-0">
                  {article.author?.name ? article.author.name.charAt(0).toUpperCase() : 'Q'}
                </div>
              )}
              <span className="font-medium text-text truncate max-w-[70px] sm:max-w-none">
                {article.author?.name ? article.author.name.split(' ')[0] : 'Qindil'}
              </span>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 text-[10px] sm:text-[11px] shrink-0">
              {article.viewCount !== undefined && article.viewCount > 0 && (
                <div className="flex items-center space-x-1">
                  <Icon name="Eye" size={12} className="text-textMuted" />
                  <span>{article.viewCount}</span>
                </div>
              )}
              <span className="hidden sm:inline">{formattedDate}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default ArticleCard;
