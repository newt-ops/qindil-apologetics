import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../../stores/authStore';
import { useMyNotifications, useMarkNotificationRead, useUpdateMyProfile } from '../../../hooks/useMeData';
import Icon from '../../../components/icons/Icon';
import NotificationBell from '../../../components/shared/NotificationBell';
import TelegramLinkCard from '../../../components/shared/TelegramLinkCard';
import { uploadToCloudinary } from '../../../lib/cloudinary';
import Seo from '../../../components/shared/Seo';

export function MiniDashboardPage() {
  const { user, permissions } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'notifications' | 'research'>('notifications');
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
    limit: 15,
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

  // Determine admin privileges
  const isAdminUser =
    permissions.includes('*') ||
    user?.roles?.some(
      (r) =>
        (typeof r === 'string' && (r === 'admin' || r === 'superAdmin')) ||
        (typeof r === 'object' && r.name && (r.name === 'admin' || r.name === 'superAdmin'))
    );

  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  const researchShortcuts = [
    {
      title: 'Research Library',
      desc: 'Browse peer-reviewed articles & critical refutations',
      to: '/articles',
      icon: 'BookOpen',
    },
    {
      title: 'Thematic Disciplines',
      desc: 'Explore categorized areas of intellectual inquiry',
      to: '/topics',
      icon: 'Layers',
    },
    {
      title: 'Academic Symposia',
      desc: 'Join live scholarly webinars & recorded panels',
      to: '/events',
      icon: 'Calendar',
    },
    {
      title: 'Submit Academic Inquiry',
      desc: 'Connect directly with resident researchers',
      to: '/contact',
      icon: 'Mail',
    },
  ];

  return (
    <div className="relative min-h-screen bg-bg text-text font-sans py-5 sm:py-12 selection:bg-gold/20 selection:text-gold transition-colors duration-200 overflow-hidden">
      <Seo
        title="Member Portal — Research Home Base"
        description="Manage your Qindil researcher profile, notifications, reading history, and synchronized Telegram alerts."
      />

      {/* Ambient background glow & radial highlights */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(179,133,76,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(201,168,76,0.1),rgba(0,0,0,0))]" />
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[500px] bg-gold/10 dark:bg-gold/5 blur-[130px] rounded-full" />

      <div className="relative mx-auto max-w-6xl px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 sm:pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-gold">
              <Icon name="Shield" size={12} />
              <span>Researcher Home Base</span>
            </div>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-text tracking-tight">
              Welcome, {user?.name || 'Reader'}
            </h1>
            <p className="text-xs text-textMuted">
              Manage your academic profile, notifications, and platform synchronization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="inline-flex items-center space-x-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-text hover:border-gold/50 hover:text-gold transition shadow-sm"
              title="Return to Main Page"
            >
              <Icon name="ArrowLeft" size={14} className="text-gold" />
              <span>Main Page</span>
            </Link>
            <Link
              to="/articles"
              className="inline-flex items-center space-x-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-text hover:border-gold/50 transition shadow-sm"
            >
              <Icon name="BookOpen" size={14} />
              <span className="hidden sm:inline">Browse Library</span>
            </Link>
            {isAdminUser && (
              <Link
                to="/admin"
                className="inline-flex items-center space-x-1.5 rounded-lg bg-gold px-3.5 py-2 text-xs font-bold text-bg transition hover:bg-goldHover shadow-md"
              >
                <Icon name="Activity" size={14} />
                <span>Admin Workspace</span>
              </Link>
            )}
            <NotificationBell />
          </div>
        </div>

        {/* Member Status Metrics Strip - Prompt 42: Compact 3-card swipe strip on mobile */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div className="rounded-xl border border-border bg-surface p-3 sm:p-4 text-center space-y-0.5 shadow-sm">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-textMuted flex items-center justify-center gap-1">
              <Icon name="User" size={12} className="text-gold" />
              <span>Role Tier</span>
            </span>
            <p className="text-xs sm:text-sm font-black text-text truncate">
              {isAdminUser ? 'Admin Fellow' : 'Registered Member'}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-3 sm:p-4 text-center space-y-0.5 shadow-sm">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-textMuted flex items-center justify-center gap-1">
              <Icon name="Send" size={12} className="text-gold" />
              <span>Telegram Sync</span>
            </span>
            <p className={`text-xs sm:text-sm font-black truncate ${user?.telegramChatId ? 'text-emerald-500' : 'text-textMuted'}`}>
              {user?.telegramChatId ? 'Connected' : 'Not Linked'}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-3 sm:p-4 text-center space-y-0.5 shadow-sm">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-textMuted flex items-center justify-center gap-1">
              <Icon name="Bell" size={12} className="text-gold" />
              <span>Alerts</span>
            </span>
            <p className="text-xs sm:text-sm font-black text-gold truncate">
              {unreadCount} Unread
            </p>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Profile Card, Avatar & Security (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Profile Edit Card */}
            <div className="rounded-xl sm:rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                  <Icon name="User" size={14} />
                  <span>Personal Profile</span>
                </h2>
                {user?.emailVerified && (
                  <span className="inline-flex items-center text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <Icon name="CheckCircle" size={11} className="mr-1" /> Verified
                  </span>
                )}
              </div>

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
                {/* Avatar Photo Section */}
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-2">
                    Profile Avatar
                  </label>

                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Circular Avatar Preview */}
                    <div className="relative group shrink-0">
                      <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border-2 border-gold/40 bg-bg overflow-hidden shadow-md">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={user?.name || 'User Avatar'}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gold/15 text-gold font-bold text-xl sm:text-2xl">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}

                        {/* Uploading Overlay */}
                        {isUploadingAvatar && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/65 text-gold backdrop-blur-xs">
                            <Icon name="RefreshCw" size={18} className="animate-spin" />
                          </div>
                        )}
                      </div>

                      {/* Remove Avatar Button */}
                      {avatarUrl && !isUploadingAvatar && (
                        <button
                          type="button"
                          onClick={() => setAvatarUrl('')}
                          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white text-[10px] shadow hover:bg-danger/80 transition"
                          title="Remove photo"
                        >
                          <Icon name="X" size={11} />
                        </button>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 space-y-1.5 min-w-0">
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gold/30 bg-gold/10 hover:bg-gold hover:text-bg text-gold text-xs font-semibold cursor-pointer transition shadow-sm"
                      >
                        <Icon name="Upload" size={13} />
                        <span>{isUploadingAvatar ? 'Uploading...' : 'Upload Photo'}</span>
                      </label>
                      <p className="text-[10px] text-textMuted leading-tight">
                        PNG, JPG, or WEBP up to 5MB. Hosted securely.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Display Name Input */}
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">
                    Display Name
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-textMuted">
                      <Icon name="User" size={14} />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-border bg-bg pl-8 pr-3 py-2 text-xs text-text focus:border-gold focus:outline-none transition"
                      placeholder="Your Full Name"
                      required
                    />
                  </div>
                </div>

                {/* Save Profile Button */}
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending || isUploadingAvatar}
                  className="w-full rounded-lg bg-gold py-2.5 text-xs font-bold text-bg transition hover:bg-goldHover disabled:opacity-50 shadow-md flex items-center justify-center gap-1.5"
                >
                  <Icon name="Check" size={13} />
                  <span>{updateProfileMutation.isPending ? 'Saving Updates...' : 'Save Profile'}</span>
                </button>
              </form>
            </div>

            {/* Account Identity & Security Card */}
            <div className="rounded-xl sm:rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-xl space-y-3">
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
                  <span className="text-textMuted">Authentication Mode</span>
                  <span className="font-semibold text-text capitalize">
                    {user?.authProvider === 'google'
                      ? 'Google Sign-On'
                      : user?.authProvider === 'both'
                      ? 'Google + Local Password'
                      : 'Local Password'}
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

            {/* Telegram Integration Card */}
            <TelegramLinkCard />
          </div>

          {/* Right Column: Notifications & Research Hub (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Tabbed Card */}
            <div className="rounded-xl sm:rounded-2xl border border-border bg-surface shadow-xl overflow-hidden">
              {/* Tabs Strip */}
              <div className="flex items-center border-b border-border bg-bg/50 px-4 sm:px-6 pt-3">
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`pb-3 text-xs font-bold border-b-2 transition flex items-center gap-2 mr-6 ${
                    activeTab === 'notifications'
                      ? 'border-gold text-gold'
                      : 'border-transparent text-textMuted hover:text-text'
                  }`}
                >
                  <Icon name="Bell" size={14} />
                  <span>Notifications ({unreadCount})</span>
                </button>

                <button
                  onClick={() => setActiveTab('research')}
                  className={`pb-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                    activeTab === 'research'
                      ? 'border-gold text-gold'
                      : 'border-transparent text-textMuted hover:text-text'
                  }`}
                >
                  <Icon name="Compass" size={14} />
                  <span>Research Hub</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6">
                {activeTab === 'notifications' ? (
                  <div className="space-y-3">
                    {isNotificationsLoading ? (
                      <div className="space-y-2.5">
                        {[1, 2, 3].map((n) => (
                          <div
                            key={n}
                            className="h-16 animate-pulse rounded-xl border border-border bg-bg/50 p-4"
                          />
                        ))}
                      </div>
                    ) : notifications && notifications.length > 0 ? (
                      <div className="space-y-2.5">
                        {notifications.map((n) => (
                          <motion.div
                            key={n._id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-start justify-between rounded-xl border p-3.5 sm:p-4 transition ${
                              n.read
                                ? 'border-border/60 bg-bg/40'
                                : 'border-gold/40 bg-gold/5 shadow-sm'
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
                      <div className="rounded-xl border border-border/60 bg-bg/30 p-8 sm:p-12 text-center text-xs text-textMuted space-y-2">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold border border-gold/20 mb-2">
                          <Icon name="Bell" size={20} />
                        </div>
                        <p className="font-bold text-text text-sm">Inbox Cleared</p>
                        <p className="max-w-xs mx-auto">
                          You have no unread notifications or active administrative alerts at this time.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-textMuted leading-relaxed">
                      Quick navigation to the core research archives and scholarly services of Qindil Apologetics.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {researchShortcuts.map((s) => (
                        <Link
                          key={s.title}
                          to={s.to}
                          className="group rounded-xl border border-border bg-bg/70 p-3.5 transition hover:border-gold/50 hover:bg-surface space-y-1.5"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/10 text-gold group-hover:bg-gold group-hover:text-bg transition">
                              <Icon name={s.icon as any} size={14} />
                            </div>
                            <span className="text-xs font-bold text-text group-hover:text-gold transition-colors">
                              {s.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-textMuted leading-snug">
                            {s.desc}
                          </p>
                        </Link>
                      ))}
                    </div>

                    <div className="rounded-xl border border-gold/25 bg-gold/5 p-3.5 sm:p-4 space-y-1.5 mt-2">
                      <div className="flex items-center space-x-2 text-xs font-bold text-gold">
                        <Icon name="BookOpen" size={13} />
                        <span>Scholarly Research Mandate</span>
                      </div>
                      <p className="text-[11px] text-textMuted leading-relaxed">
                        Registered members enjoy uninterrupted access to our open-source apologetics treatises, Arabic-to-English classical citations, and live symposium recordings.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MiniDashboardPage;
