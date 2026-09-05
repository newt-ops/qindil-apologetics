import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { useMyNotifications, useMarkNotificationRead, useUpdateMyProfile } from '../../hooks/useMeData';
import Icon from '../../components/icons/Icon';
import NotificationBell from '../../components/shared/NotificationBell';
import TelegramLinkCard from '../../components/shared/TelegramLinkCard';

export function MiniDashboardPage() {
  const { user, permissions } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const { data: notifications, isLoading: isNotificationsLoading } = useMyNotifications({
    page: 1,
    limit: 10,
  });

  const markReadMutation = useMarkNotificationRead();
  const updateProfileMutation = useUpdateMyProfile();

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await updateProfileMutation.mutateAsync({ name, avatarUrl });
      setSuccessMessage('Profile updated successfully!');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Failed to update profile.';
      setErrorMessage(msg);
    }
  };

  // Determine if user has admin privileges
  const isAdminUser =
    permissions.includes('*') ||
    user?.roles?.some(
      (r) =>
        (typeof r === 'string' && (r === 'admin' || r === 'superAdmin')) ||
        (typeof r === 'object' && r.name && (r.name === 'admin' || r.name === 'superAdmin'))
    );

  return (
    <div className="min-h-screen bg-bg text-text font-sans py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="text-xs font-semibold text-gold uppercase tracking-wider">
              Reader Home Base
            </span>
            <h1 className="text-3xl font-extrabold text-text tracking-tight mt-1 sm:text-4xl">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}!
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <NotificationBell />
            {isAdminUser && (
              <Link
                to="/admin"
                className="inline-flex items-center space-x-2 rounded-lg bg-gold px-4 py-2.5 text-xs font-bold text-bg transition hover:bg-goldHover shadow-md"
              >
                <Icon name="Activity" size={16} />
                <span>Go to Admin Workspace</span>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Profile Card & Update Form */}
          <div className="space-y-6 lg:col-span-1">
            {/* User Details Card */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-4">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user?.name || 'User Avatar'}
                    className="h-16 w-16 rounded-full object-cover border-2 border-gold/40 shadow"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/20 text-gold font-bold text-2xl border-2 border-gold/40">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}

                <div>
                  <h2 className="text-lg font-bold text-text">{user?.name}</h2>
                  <p className="text-xs text-textMuted">{user?.email}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="inline-block rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[10px] font-semibold text-gold">
                      {isAdminUser ? 'Admin' : 'Registered Member'}
                    </span>
                    {user?.emailVerified && (
                      <span className="inline-flex items-center text-[10px] text-success font-medium">
                        <Icon name="CheckCircle" size={12} className="mr-1" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Edit Form */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-gold uppercase tracking-wider">
                Edit Personal Profile
              </h3>

              {successMessage && (
                <div className="rounded-md border border-success/40 bg-success/10 p-3 text-xs text-success">
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="rounded-md border border-danger/40 bg-danger/10 p-3 text-xs text-danger">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-textMuted uppercase tracking-wider mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-md border border-border bg-bg px-3 py-2 text-xs text-text focus:border-gold focus:outline-none"
                    placeholder="Your Name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-textMuted uppercase tracking-wider mb-1">
                    Avatar Image URL
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full rounded-md border border-border bg-bg px-3 py-2 text-xs text-text focus:border-gold focus:outline-none"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="w-full rounded-md bg-gold py-2 text-xs font-bold text-bg transition hover:bg-goldHover disabled:opacity-50"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            </div>

            {/* Telegram Link Card */}
            <TelegramLinkCard />
          </div>

          {/* Right Column: Personal Notifications */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-border bg-surface p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-text">Your Notifications</h3>
                  <p className="text-xs text-textMuted">Updates, mentions, and system alerts</p>
                </div>
                <Icon name="Bell" size={20} className="text-gold" />
              </div>

              {isNotificationsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-16 animate-pulse rounded-lg border border-border bg-bg/50 p-4" />
                  ))}
                </div>
              ) : notifications && notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <motion.div
                      key={n._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-start justify-between rounded-lg border p-4 transition ${
                        n.read ? 'border-border/60 bg-bg/40' : 'border-gold/40 bg-gold/5 shadow-sm'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {!n.read && <span className="h-2 w-2 rounded-full bg-gold shrink-0" />}
                          <span className="text-xs font-bold text-text">{n.title}</span>
                        </div>
                        {n.body && <p className="text-xs text-textMuted">{n.body}</p>}
                        <span className="text-[10px] text-textMuted block pt-1">
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
                          className="text-[11px] font-semibold text-gold hover:underline shrink-0 ml-3"
                        >
                          Mark read
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-border/60 bg-bg/30 p-8 text-center text-xs text-textMuted space-y-2">
                  <Icon name="Bell" size={24} className="mx-auto text-gold/40 mb-2" />
                  <p className="font-medium text-text">No Notifications</p>
                  <p>You have no unread notifications at the moment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MiniDashboardPage;
