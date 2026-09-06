import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../../stores/authStore';
import { useReaderStore } from '../../../stores/readerStore';
import { useMyNotifications, useMarkNotificationRead, useUpdateMyProfile } from '../../../hooks/useMeData';
import { useHasRole } from '../../../hooks/useHasRole';
import Icon from '../../../components/icons/Icon';
import TelegramLinkCard from '../../../components/shared/TelegramLinkCard';
import { uploadToCloudinary } from '../../../lib/cloudinary';
import Seo from '../../../components/shared/Seo';
import EmptyState from '../../../components/ui/EmptyState';
import { NotificationSkeleton } from '../../../components/ui/Skeleton';

export function MiniDashboardPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = useHasRole('superAdmin');
  const isAdmin = useHasRole('admin');

  // Personal Reader Store State
  const bookmarks = useReaderStore((state) => state.bookmarks);
  const removeBookmark = useReaderStore((state) => state.removeBookmark);
  const readingHistory = useReaderStore((state) => state.readingHistory);
  const totalReadingMinutes = useReaderStore((state) => state.totalReadingMinutes);
  const clearHistory = useReaderStore((state) => state.clearHistory);

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'history' | 'notifications' | 'profile'>('bookmarks');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Avatar image size must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    setErrorMessage(null);
    try {
      const url = await uploadToCloudinary(file, 'qindil/avatars');
      setAvatarUrl(url);
      setSuccessMessage('Photo uploaded successfully. Click "Save Changes" to apply.');
    } catch {
      setErrorMessage('Failed to upload photo. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const { data: notifications, isLoading: isNotificationsLoading } = useMyNotifications({
    page: 1,
    limit: 20,
  });

  const markReadMutation = useMarkNotificationRead();
  const updateProfileMutation = useUpdateMyProfile();

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await updateProfileMutation.mutateAsync({ name, avatarUrl });
      setSuccessMessage('Personal profile updated successfully.');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Failed to update profile.';
      setErrorMessage(msg);
    }
  };

  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  return (
    <div className="relative min-h-[85vh] bg-bg text-text font-sans py-6 sm:py-12 selection:bg-gold/20 selection:text-gold transition-colors duration-200">
      <Seo
        title="My Profile & Saved Library"
        description="Manage your personal Qindil profile, bookmarked articles, reading history, and synchronized Telegram alerts."
      />

      <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Admin Access Notice (Discrete, separate domain) */}
        {(isSuperAdmin || isAdmin) && (
          <div className="rounded-2xl border border-gold/40 bg-gold/10 backdrop-blur-md p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-apple-sm">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/20 text-gold shrink-0 border border-gold/30">
                <Icon name="Shield" size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-text">
                  {isSuperAdmin ? 'Super Administrator Access Active' : 'Editorial Admin Access Active'}
                </p>
                <p className="text-[11px] text-textMuted">
                  This is your personal reader profile. Your operational management tools are located in the dedicated console.
                </p>
              </div>
            </div>

            <Link
              to={isSuperAdmin ? '/admin' : '/admin/workspace'}
              className="inline-flex items-center space-x-1.5 rounded-full bg-gold px-4 py-1.5 text-xs font-bold text-zinc-950 shadow-apple-gold hover:bg-goldHover active:scale-95 transition-all shrink-0"
            >
              <span>Open {isSuperAdmin ? 'SuperAdmin' : 'Admin'} Panel</span>
              <Icon name="ArrowRight" size={13} />
            </Link>
          </div>
        )}

        {/* User Identity Header Card */}
        <div className="rounded-3xl border border-border/80 bg-surface/90 backdrop-blur-xl p-5 sm:p-8 shadow-apple-card flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center space-x-4 sm:space-x-5">
            {/* Avatar with Circular Ring */}
            <div className="relative shrink-0">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-2 border-gold/40 bg-gold/15 overflow-hidden shadow-apple-sm">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || 'User Avatar'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xl sm:text-2xl font-bold text-gold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
              </div>
            </div>

            {/* Name & Credentials */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black text-text tracking-tight">
                  {user?.name || 'Reader'}
                </h1>
                {user?.emailVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                    <Icon name="CheckCircle" size={10} />
                    <span>Verified</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-textMuted">{user?.email}</p>
              <p className="text-[11px] text-gold font-medium">Qindil Research Reader</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/articles"
              className="inline-flex items-center space-x-1.5 rounded-full border border-border/80 bg-surface/80 px-4 py-2 text-xs font-semibold text-text hover:border-gold/50 hover:text-gold active:scale-95 transition-all shadow-apple-sm"
            >
              <Icon name="BookOpen" size={14} />
              <span>Browse Library</span>
            </Link>
          </div>
        </div>

        {/* Personal Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-surface/85 backdrop-blur-md p-4 text-center space-y-1 shadow-apple-sm hover:shadow-apple-md hover:-translate-y-0.5 transition-all">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-textMuted flex items-center justify-center gap-1">
              <Icon name="Bookmark" size={12} className="text-gold" />
              <span>Saved Articles</span>
            </span>
            <p className="text-lg sm:text-2xl font-black font-mono text-gold">
              {bookmarks.length}
            </p>
          </div>

          <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-surface/85 backdrop-blur-md p-4 text-center space-y-1 shadow-apple-sm hover:shadow-apple-md hover:-translate-y-0.5 transition-all">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-textMuted flex items-center justify-center gap-1">
              <Icon name="Clock" size={12} className="text-gold" />
              <span>Reading Time</span>
            </span>
            <p className="text-lg sm:text-2xl font-black font-mono text-text">
              {totalReadingMinutes} <span className="text-xs font-sans font-normal text-textMuted">min</span>
            </p>
          </div>

          <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-surface/85 backdrop-blur-md p-4 text-center space-y-1 shadow-apple-sm hover:shadow-apple-md hover:-translate-y-0.5 transition-all">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-textMuted flex items-center justify-center gap-1">
              <Icon name="FileText" size={12} className="text-gold" />
              <span>History</span>
            </span>
            <p className="text-lg sm:text-2xl font-black font-mono text-text">
              {readingHistory.length}
            </p>
          </div>

          <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-surface/85 backdrop-blur-md p-4 text-center space-y-1 shadow-apple-sm hover:shadow-apple-md hover:-translate-y-0.5 transition-all">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-textMuted flex items-center justify-center gap-1">
              <Icon name="Send" size={12} className="text-gold" />
              <span>Telegram Sync</span>
            </span>
            <p className={`text-xs sm:text-sm font-black truncate pt-1 ${user?.telegramChatId ? 'text-emerald-500' : 'text-textMuted'}`}>
              {user?.telegramChatId ? 'Connected' : 'Not Linked'}
            </p>
          </div>
        </div>

        {/* Interactive Tabs Container */}
        <div className="rounded-3xl border border-border/80 bg-surface/90 backdrop-blur-xl shadow-apple-card overflow-hidden">
          {/* Navigation Tab Bar */}
          <div className="flex items-center border-b border-border/70 bg-bg/40 px-3 sm:px-6 pt-3 overflow-x-auto scrollbar-none gap-2 sm:gap-6">
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`pb-3 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'bookmarks'
                  ? 'border-gold text-gold'
                  : 'border-transparent text-textMuted hover:text-text'
              }`}
            >
              <Icon name="Bookmark" size={14} />
              <span>Saved Articles ({bookmarks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'history'
                  ? 'border-gold text-gold'
                  : 'border-transparent text-textMuted hover:text-text'
              }`}
            >
              <Icon name="Clock" size={14} />
              <span>Reading History ({readingHistory.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`pb-3 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'border-gold text-gold'
                  : 'border-transparent text-textMuted hover:text-text'
              }`}
            >
              <Icon name="Bell" size={14} />
              <span>Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-gold text-gold'
                  : 'border-transparent text-textMuted hover:text-text'
              }`}
            >
              <Icon name="User" size={14} />
              <span>Profile &amp; Settings</span>
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="p-4 sm:p-8">
            {/* 1. BOOKMARKS TAB */}
            {activeTab === 'bookmarks' && (
              <div className="space-y-4">
                {bookmarks.length === 0 ? (
                  <div className="py-8">
                    <EmptyState
                      title="No Saved Articles Yet"
                      description="When exploring our intellectual library, click the Bookmark button on any article to save it here for quick access."
                      action={{
                        label: 'Explore Articles',
                        onClick: () => window.location.assign('/articles'),
                      }}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bookmarks.map((b) => (
                      <div
                        key={b.slug}
                        className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-surface/90 p-4 shadow-apple-sm hover:shadow-apple-md hover:border-gold/50 transition-all space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            {b.topic && (
                              <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold text-gold truncate max-w-[130px]">
                                {b.topic.name}
                              </span>
                            )}
                            <button
                              onClick={() => removeBookmark(b.slug)}
                              className="text-textMuted hover:text-danger text-xs transition p-1"
                              title="Remove bookmark"
                            >
                              <Icon name="Trash2" size={13} />
                            </button>
                          </div>

                          <Link
                            to={`/articles/${b.slug}`}
                            className="block text-xs sm:text-sm font-bold text-text group-hover:text-gold transition-colors line-clamp-2"
                          >
                            {b.title}
                          </Link>

                          {b.excerpt && (
                            <p className="text-[11px] text-textMuted line-clamp-2 leading-relaxed">
                              {b.excerpt}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-textMuted">
                          <div className="flex items-center space-x-1">
                            <Icon name="Clock" size={11} className="text-gold" />
                            <span>{b.estimatedReadTime || 3} min read</span>
                          </div>

                          <Link
                            to={`/articles/${b.slug}`}
                            className="inline-flex items-center space-x-1 font-semibold text-gold hover:underline"
                          >
                            <span>Read</span>
                            <Icon name="ChevronRight" size={11} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. READING HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <p className="text-xs text-textMuted">
                    Articles you have read and studied on Qindil Apologetics.
                  </p>
                  {readingHistory.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-[11px] font-semibold text-danger hover:underline inline-flex items-center gap-1"
                    >
                      <Icon name="Trash2" size={12} />
                      <span>Clear History</span>
                    </button>
                  )}
                </div>

                {readingHistory.length === 0 ? (
                  <div className="py-8">
                    <EmptyState
                      title="No Reading History Recorded"
                      description="Articles you read will automatically be cataloged here with reading timestamps and reading progress."
                      action={{
                        label: 'Start Reading',
                        onClick: () => window.location.assign('/articles'),
                      }}
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-border/60">
                    {readingHistory.map((item) => (
                      <div
                        key={`${item.slug}-${item.readAt}`}
                        className="py-3 flex items-center justify-between gap-4 group"
                      >
                        <div className="space-y-1 min-w-0">
                          <Link
                            to={`/articles/${item.slug}`}
                            className="text-xs sm:text-sm font-bold text-text group-hover:text-gold transition-colors truncate block"
                          >
                            {item.title}
                          </Link>
                          <div className="flex items-center space-x-2 text-[10px] text-textMuted">
                            {item.topicName && (
                              <span className="text-gold font-medium">{item.topicName}</span>
                            )}
                            <span>•</span>
                            <span>
                              {new Date(item.readAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>

                        <Link
                          to={`/articles/${item.slug}`}
                          className="rounded-full border border-border/80 bg-surface/80 px-3 py-1 text-[11px] font-semibold text-gold hover:bg-gold hover:text-bg transition shadow-sm shrink-0"
                        >
                          Revisit
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-3">
                {isNotificationsLoading ? (
                  <div className="space-y-2.5">
                    {[1, 2, 3].map((n) => (
                      <NotificationSkeleton key={n} />
                    ))}
                  </div>
                ) : notifications && notifications.length > 0 ? (
                  <div className="space-y-2.5">
                    {notifications.map((n) => (
                      <motion.div
                        key={n._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-start justify-between rounded-2xl border p-3.5 sm:p-4 transition-all shadow-apple-sm ${
                          n.read
                            ? 'border-border/70 bg-bg/40'
                            : 'border-gold/40 bg-gold/5 shadow-apple-sm'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 pr-3">
                          <div className="flex items-center space-x-2">
                            {!n.read && (
                              <span className="h-2 w-2 rounded-full bg-gold shrink-0" />
                            )}
                            <span className="text-xs font-bold text-text truncate">
                              {n.title}
                            </span>
                          </div>
                          {n.body && (
                            <p className="text-xs text-textMuted leading-relaxed line-clamp-2">
                              {n.body}
                            </p>
                          )}
                          <span className="text-[10px] text-textMuted block pt-0.5">
                            {new Date(n.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {!n.read && (
                          <button
                            onClick={() => markReadMutation.mutate(n._id)}
                            disabled={markReadMutation.isPending}
                            className="text-[11px] font-semibold text-gold hover:underline shrink-0 self-center"
                          >
                            Mark read
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8">
                    <EmptyState
                      title="Inbox Cleared"
                      description="You have no unread notifications or active announcements at this time."
                    />
                  </div>
                )}
              </div>
            )}

            {/* 4. PROFILE & SETTINGS TAB */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 space-y-5">
                  <div className="rounded-2xl border border-border/80 bg-surface/90 p-5 space-y-4 shadow-apple-sm">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                      <Icon name="User" size={14} />
                      <span>Update Profile Info</span>
                    </h2>

                    {successMessage && (
                      <div className="rounded-lg border border-success/40 bg-success/10 p-2.5 text-xs text-success flex items-center gap-2">
                        <Icon name="CheckCircle" size={13} className="shrink-0" />
                        <span>{successMessage}</span>
                      </div>
                    )}

                    {errorMessage && (
                      <div className="rounded-lg border border-danger/40 bg-danger/10 p-2.5 text-xs text-danger flex items-center gap-2">
                        <Icon name="AlertCircle" size={13} className="shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                      {/* Avatar Upload */}
                      <div>
                        <label className="block text-xs font-medium text-textMuted mb-2">
                          Profile Avatar Photo
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-bg overflow-hidden shadow-sm">
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt={user?.name || 'User Avatar'}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-xl font-bold text-gold">
                                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </span>
                              )}
                              {isUploadingAvatar && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-gold">
                                  <Icon name="RefreshCw" size={16} className="animate-spin" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex-1 space-y-1">
                            <input
                              ref={avatarInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              className="hidden"
                              id="profileAvatarUploadInput"
                              disabled={isUploadingAvatar || updateProfileMutation.isPending}
                            />
                            <label
                              htmlFor="profileAvatarUploadInput"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/10 hover:bg-gold hover:text-bg text-gold text-xs font-semibold cursor-pointer transition shadow-sm"
                            >
                              <Icon name="Upload" size={13} />
                              <span>{isUploadingAvatar ? 'Uploading...' : 'Upload Photo'}</span>
                            </label>
                            <p className="text-[10px] text-textMuted">
                              PNG, JPG, or WEBP up to 5MB.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Display Name */}
                      <div>
                        <label className="block text-xs font-medium text-textMuted mb-1">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-xs text-text focus:border-gold focus:outline-none transition"
                          placeholder="Your Full Name"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={updateProfileMutation.isPending || isUploadingAvatar}
                        className="w-full rounded-full bg-gold py-2.5 text-xs font-bold text-bg transition hover:bg-goldHover disabled:opacity-50 shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Icon name="Check" size={13} />
                        <span>{updateProfileMutation.isPending ? 'Saving Updates...' : 'Save Profile'}</span>
                      </button>
                    </form>
                  </div>

                  {/* Account Security Card */}
                  <div className="rounded-2xl border border-border/80 bg-surface/90 p-5 space-y-3 shadow-apple-sm">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                      <Icon name="Lock" size={14} />
                      <span>Account Security</span>
                    </h2>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between py-1 border-b border-border/60">
                        <span className="text-textMuted">Registered Email</span>
                        <span className="font-semibold text-text truncate max-w-[200px]">{user?.email}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-border/60">
                        <span className="text-textMuted">Sign-in Method</span>
                        <span className="font-semibold text-text capitalize">
                          {user?.authProvider === 'google'
                            ? 'Google Sign-In'
                            : user?.authProvider === 'both'
                            ? 'Google + Local Password'
                            : 'Password Authentication'}
                        </span>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-textMuted text-[11px]">Need to change your password?</span>
                        <Link
                          to="/forgot-password"
                          className="text-gold hover:underline font-semibold text-[11px] inline-flex items-center gap-1"
                        >
                          <span>Reset Password</span>
                          <Icon name="ChevronRight" size={11} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Telegram Link Card */}
                <div className="lg:col-span-5 space-y-4">
                  <TelegramLinkCard />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MiniDashboardPage;
