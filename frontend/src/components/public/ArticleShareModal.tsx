import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../icons/Icon';

interface ArticleShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url?: string;
  topicName?: string;
}

export function ArticleShareModal({
  isOpen,
  onClose,
  title,
  url,
  topicName,
}: ArticleShareModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API fails
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
      } catch {
        // User cancelled or failed
      }
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${title}\n\n${shareUrl}`
  )}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
    shareUrl
  )}&text=${encodeURIComponent(title)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    shareUrl
  )}&text=${encodeURIComponent(title)}`;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="relative w-full max-w-md rounded-3xl border border-stone-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900 p-6 shadow-2xl z-10 space-y-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gold/15 text-gold border border-gold/30">
                  <Icon name="Share2" size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Share Publication
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Distribute research &amp; apologetics work
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                aria-label="Close dialog"
              >
                <Icon name="X" size={16} />
              </button>
            </div>

            {/* Article Preview Box */}
            <div className="rounded-2xl border border-stone-200/80 dark:border-zinc-800/80 bg-stone-50 dark:bg-zinc-950 p-3.5 space-y-1.5">
              {topicName && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-semibold text-gold border border-gold/30">
                  <Icon name="Tag" size={10} />
                  <span>{topicName}</span>
                </span>
              )}
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
                {title}
              </p>
            </div>

            {/* Share Channel Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2.5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/60 p-3 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:border-emerald-500/50 hover:text-emerald-500 transition-all shadow-sm group"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                  <Icon name="MessageSquare" size={14} />
                </div>
                <span>WhatsApp</span>
              </a>

              {/* Telegram */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2.5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/60 p-3 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:border-sky-500/50 hover:text-sky-500 transition-all shadow-sm group"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/30 group-hover:scale-110 transition-transform">
                  <Icon name="Send" size={14} />
                </div>
                <span>Telegram</span>
              </a>

              {/* Twitter / X */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2.5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/60 p-3 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:border-gold/50 hover:text-gold transition-all shadow-sm group"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gold/10 text-gold border border-gold/30 group-hover:scale-110 transition-transform">
                  <Icon name="Globe" size={14} />
                </div>
                <span>Twitter / X</span>
              </a>

              {/* Mobile Native Share Sheet (If supported) */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="flex items-center space-x-2.5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/60 p-3 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:border-gold/50 hover:text-gold transition-all shadow-sm group text-left"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gold/10 text-gold border border-gold/30 group-hover:scale-110 transition-transform">
                    <Icon name="ExternalLink" size={14} />
                  </div>
                  <span>More Options</span>
                </button>
              )}
            </div>

            {/* Direct Copy Link Field */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                Direct Article URL
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-600 dark:text-zinc-400 focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className={`inline-flex items-center space-x-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold active:scale-95 transition-all shadow-sm ${
                    copied
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-500 font-bold'
                      : 'border-gold bg-gold text-zinc-950 hover:bg-goldHover'
                  }`}
                >
                  <Icon name={copied ? 'Check' : 'Copy'} size={14} />
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default ArticleShareModal;
