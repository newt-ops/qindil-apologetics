import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../components/icons/Icon';
import Sidebar from '../components/admin/Sidebar';
import { useAuthStore } from '../stores/authStore';
import { useLogout } from '../hooks/useAuth';
import { useHasRole } from '../hooks/useHasRole';
import NotificationBell from '../components/shared/NotificationBell';

export const AdminLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();
  const isSuperAdmin = useHasRole('superAdmin');

  // Derive dynamic page title based on current path
  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/admin':
      case '/admin/':
        return 'Admin Dashboard';
      case '/admin/workspace':
        return 'Team Workspace';
      case '/admin/articles':
        return 'My Articles';
      case '/admin/production':
        return 'Production Board';
      case '/admin/calendar':
        return 'Operations Calendar';
      case '/admin/team':
        return 'Team Roster';
      case '/admin/topics':
        return 'Topic Management';
      case '/admin/review-queue':
        return 'Review Queue';
      case '/admin/events':
        return 'Event Management';
      case '/admin/analytics':
        return 'System Analytics';
      case '/admin/contact-inbox':
        return 'Contact Inbox';
      case '/admin/audit-log':
        return 'Security Audit Log';
      case '/admin/settings':
        return 'Site Settings';
      default:
        return 'Admin Workspace';
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/login');
      },
    });
  };

  return (
    <div className="flex h-screen w-full bg-bg font-sans text-text overflow-hidden">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex md:w-64 md:shrink-0">
        <Sidebar className="w-full" />
      </div>

      {/* Mobile Slide-in Drawer (Prompt 08 pattern) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative z-10 h-full w-72 max-w-[80vw]"
            >
              <Sidebar onItemClick={() => setMobileMenuOpen(false)} className="w-full" />

              {/* Close Button on Mobile Drawer Header */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-3 right-3 rounded-md p-1.5 text-textMuted hover:bg-bg hover:text-text transition-colors"
                aria-label="Close Mobile Sidebar"
              >
                <Icon name="X" size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Right Content Workspace Column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Admin Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
          {/* Left Side: Mobile Menu Toggle + Title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-md border border-border p-2 text-textMuted hover:bg-bg hover:text-text md:hidden transition-colors"
              aria-label="Open Mobile Menu"
            >
              <Icon name="Menu" size={20} />
            </button>

            <div>
              <h1 className="text-lg font-bold text-text tracking-tight">
                {getPageTitle(location.pathname)}
              </h1>
            </div>
          </div>

          {/* Right Side: Notification Bell Placeholder + User Dropdown */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell Component */}
            <NotificationBell />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center space-x-2.5 rounded-lg border border-border bg-bg px-3 py-1.5 text-xs hover:border-gold/40 transition-colors"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-6 w-6 rounded-full object-cover border border-gold/40"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 font-bold text-gold text-xs">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                )}

                <span className="hidden sm:inline-block font-semibold text-text max-w-[120px] truncate">
                  {user?.name}
                </span>
                <Icon name="ChevronDown" size={14} className="text-textMuted" />
              </button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 z-30 mt-2 w-56 rounded-lg border border-border bg-surface p-2 shadow-xl space-y-1"
                    >
                      <div className="border-b border-border px-3 py-2">
                        <p className="text-xs font-bold text-text truncate">{user?.name}</p>
                        <p className="text-[11px] text-textMuted truncate">{user?.email}</p>
                        <div className="mt-1.5">
                          <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[9px] font-bold text-gold uppercase tracking-wider">
                            {isSuperAdmin ? 'Super Admin' : 'Admin'}
                          </span>
                        </div>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 rounded-md px-3 py-2 text-xs font-medium text-textMuted hover:bg-bg hover:text-text transition-colors"
                      >
                        <Icon name="User" size={14} />
                        <span>Member Dashboard</span>
                      </Link>

                      <Link
                        to="/"
                        target="_blank"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 rounded-md px-3 py-2 text-xs font-medium text-textMuted hover:bg-bg hover:text-text transition-colors"
                      >
                        <Icon name="ExternalLink" size={14} />
                        <span>Public Website</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className="w-full flex items-center space-x-2 rounded-md px-3 py-2 text-xs font-medium text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                      >
                        <Icon name="LogOut" size={14} />
                        <span>{logoutMutation.isPending ? 'Logging out...' : 'Log Out'}</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dynamic Outlet Main Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 bg-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
