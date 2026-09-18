import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../components/icons/Icon';
import Sidebar from '../components/admin/Sidebar';
import AdminCommandPalette from '../components/admin/AdminCommandPalette';
import AdminBreadcrumbs from '../components/admin/AdminBreadcrumbs';
import { useAuthStore } from '../stores/authStore';
import { useLogout } from '../hooks/useAuth';
import { useHasRole } from '../hooks/useHasRole';
import NotificationBell from '../components/shared/NotificationBell';

export const AdminLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Desktop sidebar collapse state with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('qindil_admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('qindil_admin_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();
  const isSuperAdmin = useHasRole('superAdmin');

  // Close mobile drawer when route changes
  const prevPathname = useRef(location.pathname);
  useEffect(() => {
    if (prevPathname.current !== location.pathname) {
      prevPathname.current = location.pathname;
      setMobileMenuOpen(false);
      setQuickCreateOpen(false);
      setProfileDropdownOpen(false);
    }
  }, [location.pathname]);

  // Global keyboard shortcut for Command Palette: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when mobile menu is open without layout thrash
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [mobileMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setProfileDropdownOpen(false);
        setQuickCreateOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      case '/admin/videos':
        return 'Video Workspace';
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
      {/* Global Command Palette Dialog */}
      <AdminCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* Desktop Persistent Sidebar (Supports Smooth Width Transition) */}
      <div
        className={`hidden md:flex shrink-0 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          className="w-full"
        />
      </div>

      {/* Mobile Slide-in Drawer via Portal */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                key="admin-drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-sm md:hidden"
                style={{ willChange: 'opacity' }}
              />
            )}

            {mobileMenuOpen && (
              <motion.div
                key="admin-drawer-panel"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                className="fixed inset-y-0 left-0 z-50 h-full w-[280px] sm:w-72 max-w-[86vw] md:hidden shadow-2xl bg-surface dark:bg-zinc-950"
                style={{ willChange: 'transform', WebkitOverflowScrolling: 'touch' }}
              >
                <Sidebar
                  onClose={() => setMobileMenuOpen(false)}
                  onItemClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Main Right Content Workspace Column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Admin Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/70 bg-surface/85 backdrop-blur-xl px-3 sm:px-6 shadow-apple-sm z-20">
          {/* Left Side: Mobile Menu Toggle + Title / Breadcrumbs */}
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-full border border-border/80 p-2 text-textMuted hover:bg-bg hover:text-text active:scale-90 md:hidden transition-all shadow-apple-sm shrink-0"
              aria-label="Open Mobile Menu"
            >
              <Icon name="Menu" size={20} />
            </button>

            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-text tracking-tight truncate">
                {getPageTitle(location.pathname)}
              </h1>
              <AdminBreadcrumbs className="mt-0.5" />
            </div>
          </div>

          {/* Right Side: Quick Search + Quick Create + Back to Main Page + Notification Bell + User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
            {/* Command Palette Trigger Button */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/80 bg-surface/80 hover:bg-surface text-xs text-textMuted hover:border-gold/40 hover:text-text transition-all shadow-apple-sm active:scale-95"
              title="Quick search across operations (⌘K)"
            >
              <Icon name="Search" size={13} className="text-gold" />
              <span className="hidden lg:inline text-xs">Search operations...</span>
              <kbd className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-bg/80 border border-border text-textMuted">
                ⌘K
              </kbd>
            </button>

            {/* Quick Create Dropdown Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setQuickCreateOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold text-bg font-bold text-xs hover:bg-goldHover active:scale-95 transition-all shadow-apple-sm"
                title="Quick create"
              >
                <Icon name="Plus" size={13} />
                <span className="hidden sm:inline">New</span>
                <Icon name="ChevronDown" size={12} className="opacity-80" />
              </button>

              <AnimatePresence>
                {quickCreateOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setQuickCreateOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 z-30 mt-2 w-52 rounded-2xl border border-border/80 dark:border-white/10 bg-surface/95 dark:bg-zinc-900/95 backdrop-blur-2xl p-1.5 shadow-apple-float space-y-0.5"
                    >
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-textMuted border-b border-border/60">
                        Quick Actions
                      </div>

                      <Link
                        to="/admin/articles"
                        onClick={() => setQuickCreateOpen(false)}
                        className="flex items-center space-x-2 rounded-xl px-3 py-2 text-xs font-semibold text-text hover:bg-gold/10 hover:text-gold transition-colors"
                      >
                        <Icon name="FileText" size={14} className="text-gold" />
                        <span>Create Article</span>
                      </Link>

                      {isSuperAdmin && (
                        <>
                          <Link
                            to="/admin/tasks/assign"
                            onClick={() => setQuickCreateOpen(false)}
                            className="flex items-center space-x-2 rounded-xl px-3 py-2 text-xs font-semibold text-text hover:bg-gold/10 hover:text-gold transition-colors"
                          >
                            <Icon name="CheckSquare" size={14} className="text-gold" />
                            <span>Assign Task</span>
                          </Link>

                          <Link
                            to="/admin/events"
                            onClick={() => setQuickCreateOpen(false)}
                            className="flex items-center space-x-2 rounded-xl px-3 py-2 text-xs font-semibold text-text hover:bg-gold/10 hover:text-gold transition-colors"
                          >
                            <Icon name="Calendar" size={14} className="text-gold" />
                            <span>Schedule Event</span>
                          </Link>

                          <Link
                            to="/admin/topics"
                            onClick={() => setQuickCreateOpen(false)}
                            className="flex items-center space-x-2 rounded-xl px-3 py-2 text-xs font-semibold text-text hover:bg-gold/10 hover:text-gold transition-colors"
                          >
                            <Icon name="Tag" size={14} className="text-gold" />
                            <span>New Topic</span>
                          </Link>
                        </>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Back to Main Page Button */}
            <Link
              to="/"
              className="inline-flex items-center space-x-1.5 rounded-full border border-border/80 bg-surface/80 backdrop-blur-md px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-text hover:border-gold/50 hover:text-gold active:scale-95 transition-all shadow-apple-sm"
              title="Return to Main Page"
            >
              <Icon name="ArrowLeft" size={13} className="text-gold" />
              <span className="hidden sm:inline">Main Page</span>
            </Link>

            {/* Notification Bell Component */}
            <NotificationBell />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center space-x-2 rounded-full border border-border/80 bg-surface/80 backdrop-blur-md px-2.5 sm:px-3 py-1.5 text-xs hover:border-gold/40 active:scale-95 transition-all shadow-apple-sm"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-6 w-6 rounded-full object-cover border border-gold/40"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 font-bold text-gold text-xs border border-gold/30">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                )}

                <span className="hidden md:inline-block font-semibold text-text max-w-[100px] truncate">
                  {user?.name}
                </span>
                <Icon name="ChevronDown" size={13} className="text-textMuted" />
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
                      className="absolute right-0 z-30 mt-2 w-56 rounded-2xl border border-border/80 dark:border-white/10 bg-surface/95 dark:bg-zinc-900/95 backdrop-blur-2xl p-1.5 shadow-apple-float space-y-0.5"
                    >
                      <div className="border-b border-border/60 px-3 py-2">
                        <p className="text-xs font-bold text-text truncate">{user?.name}</p>
                        <p className="text-[11px] text-textMuted truncate">{user?.email}</p>
                        <div className="mt-1.5">
                          <span className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[9px] font-bold text-gold uppercase tracking-wider shadow-apple-sm">
                            {isSuperAdmin ? 'Super Admin' : 'Admin'}
                          </span>
                        </div>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 rounded-xl px-3 py-2 text-xs font-semibold text-text transition hover:bg-gold/10 hover:text-gold"
                      >
                        <Icon name="User" size={14} />
                        <span>Member Dashboard</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setIsCommandPaletteOpen(true);
                        }}
                        className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-text transition hover:bg-gold/10 hover:text-gold"
                      >
                        <div className="flex items-center space-x-2">
                          <Icon name="Search" size={14} />
                          <span>Command Palette</span>
                        </div>
                        <kbd className="text-[10px] font-mono text-textMuted">⌘K</kbd>
                      </button>

                      <Link
                        to="/"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 rounded-xl px-3 py-2 text-xs font-semibold text-text transition hover:bg-surface/80 hover:text-gold"
                      >
                        <Icon name="Globe" size={14} />
                        <span>Back to Main Page</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className="w-full flex items-center space-x-2 rounded-xl px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
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
