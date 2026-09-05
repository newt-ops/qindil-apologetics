import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon, { IconName } from '../icons/Icon';
import { useNotifications } from '../../hooks/useNotifications';
import { MyNotification } from '../../api/me';
import { Spinner } from '../ui';

// Utility for relative time formatting
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

// Icon mapper for notification types
function getNotificationIcon(type: string): IconName {
  switch (type) {
    case 'task_assigned':
    case 'task':
      return 'Folder';
    case 'article_review':
    case 'review':
      return 'Eye';
    case 'comment':
      return 'Mail';
    case 'security':
    case 'system':
      return 'Shield';
    default:
      return 'Bell';
  }
}

export interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading, markAsRead, refetch } = useNotifications();

  const handleItemClick = (item: MyNotification) => {
    if (!item.read) {
      markAsRead(item._id);
    }
    setIsOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative rounded-full border border-border bg-bg p-2 text-textMuted hover:border-gold/40 hover:text-text transition-colors focus:outline-none focus:ring-2 focus:ring-gold/30"
        aria-label="Toggle notifications menu"
        title="Notifications"
      >
        <Icon name="Bell" size={18} />

        {/* Unread Badge Overlay */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-black text-bg ring-2 ring-surface">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popup Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Transparent backdrop overlay to dismiss dropdown */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 z-50 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-surface shadow-2xl overflow-hidden font-sans"
            >
              {/* Popup Header */}
              <div className="flex items-center justify-between border-b border-border bg-bg/80 px-4 py-3">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-text">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold border border-gold/30">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => refetch()}
                    className="rounded-md p-1 text-textMuted hover:bg-surface hover:text-text transition-colors"
                    title="Refresh notifications"
                  >
                    <Icon name="Activity" size={14} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-md p-1 text-textMuted hover:bg-surface hover:text-text transition-colors"
                    aria-label="Close notifications popup"
                  >
                    <Icon name="X" size={16} />
                  </button>
                </div>
              </div>

              {/* Notification Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8 text-gold">
                    <Spinner size="md" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
                    <div className="rounded-full bg-border/40 p-3 text-textMuted">
                      <Icon name="Bell" size={24} />
                    </div>
                    <p className="text-xs font-semibold text-text">All caught up!</p>
                    <p className="text-[11px] text-textMuted">No notifications right now.</p>
                  </div>
                ) : (
                  notifications.map((item) => {
                    const iconName = getNotificationIcon(item.type);
                    return (
                      <div
                        key={item._id}
                        onClick={() => handleItemClick(item)}
                        className={`flex items-start space-x-3 p-3.5 text-xs transition-colors duration-150 cursor-pointer ${
                          item.read
                            ? 'bg-surface opacity-75 hover:bg-bg/50'
                            : 'bg-gold/5 border-l-2 border-gold hover:bg-gold/10'
                        }`}
                      >
                        <div
                          className={`shrink-0 rounded-full p-2 mt-0.5 ${
                            item.read
                              ? 'bg-border/40 text-textMuted'
                              : 'bg-gold/20 text-gold'
                          }`}
                        >
                          <Icon name={iconName} size={14} />
                        </div>

                        <div className="flex-1 space-y-1 overflow-hidden">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`font-semibold truncate ${
                                item.read ? 'text-textMuted' : 'text-text'
                              }`}
                            >
                              {item.title}
                            </p>
                            <span className="shrink-0 text-[10px] font-mono text-textMuted">
                              {formatRelativeTime(item.createdAt)}
                            </span>
                          </div>

                          {item.body && (
                            <p className="text-[11px] text-textMuted line-clamp-2 leading-relaxed">
                              {item.body}
                            </p>
                          )}
                        </div>

                        {!item.read && (
                          <div className="h-2 w-2 rounded-full bg-gold shrink-0 mt-1.5" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Popup Footer */}
              <div className="border-t border-border bg-bg/50 p-2 text-center">
                <span className="text-[10px] text-textMuted/70 font-mono">
                  Updates automatically every 30s
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
