import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { useLogout } from '../../hooks/useAuth';
import { useHasRole } from '../../hooks/useHasRole';
import Icon from '../icons/Icon';
import Logo from '../shared/Logo';
import ThemeToggle from '../shared/ThemeToggle';

interface NavItem {
  label: string;
  path: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
}

export function MobileMenu({ isOpen, onClose, navItems }: MobileMenuProps) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const logoutMutation = useLogout();
  const isSuperAdmin = useHasRole('superAdmin');
  const isAdmin = useHasRole('admin');

  // Close mobile drawer only when the route path actually changes
  const prevPathname = useRef(location.pathname);
  useEffect(() => {
    if (prevPathname.current !== location.pathname) {
      prevPathname.current = location.pathname;
      onClose();
    }
  }, [location.pathname, onClose]);

  // Lock body scroll when mobile menu is open without layout thrash
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mobile-menu-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/65 dark:bg-black/75 md:hidden"
          style={{ willChange: 'opacity' }}
        />
      )}

      {isOpen && (
        <motion.div
          key="mobile-menu-drawer"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-y-0 right-0 z-50 w-full max-w-[290px] rounded-l-3xl border-l border-border/80 bg-surface dark:bg-zinc-900 p-5 shadow-apple-float overflow-y-auto md:hidden"
          style={{ willChange: 'transform', WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <Logo variant="full" height={28} />
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-textMuted transition hover:bg-bg hover:text-text active:scale-90"
              aria-label="Close Mobile Menu"
            >
              <Icon name="X" size={18} />
            </button>
          </div>

          <nav className="mt-4 flex flex-col space-y-1.5">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-gold/15 text-gold font-bold'
                    : 'text-text hover:bg-bg hover:text-gold'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-6 border-t border-border/60 pt-4">
            {isAuthenticated && user ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2.5 rounded-2xl bg-bg/80 p-2.5 border border-border/80 shadow-apple-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/20 text-gold text-xs font-bold shrink-0 border border-gold/30">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-text truncate">{user.name}</p>
                    <p className="text-[10px] text-textMuted truncate">{user.email}</p>
                  </div>
                </div>

                {/* Role-Specific Admin Panel Button */}
                {isSuperAdmin && (
                  <Link
                    to="/admin"
                    onClick={onClose}
                    className="flex w-full items-center justify-center space-x-2 rounded-full bg-gold/15 border border-gold/40 py-2.5 text-xs font-bold text-gold shadow-apple-sm transition hover:bg-gold hover:text-zinc-950 active:scale-97"
                  >
                    <Icon name="Shield" size={14} />
                    <span>SuperAdmin Panel</span>
                  </Link>
                )}

                {isAdmin && !isSuperAdmin && (
                  <Link
                    to="/admin/workspace"
                    onClick={onClose}
                    className="flex w-full items-center justify-center space-x-2 rounded-full bg-gold/15 border border-gold/40 py-2.5 text-xs font-bold text-gold shadow-apple-sm transition hover:bg-gold hover:text-zinc-950 active:scale-97"
                  >
                    <Icon name="Folder" size={14} />
                    <span>Admin Panel</span>
                  </Link>
                )}

                {/* Personal Profile & Saved Articles */}
                <Link
                  to="/dashboard"
                  onClick={onClose}
                  className="flex w-full items-center justify-center space-x-2 rounded-full border border-border/80 bg-surface/80 py-2.5 text-xs font-semibold text-text shadow-apple-sm transition hover:border-gold active:scale-97"
                >
                  <Icon name="User" size={14} className="text-gold" />
                  <span>My Profile &amp; Saved</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    logoutMutation.mutate();
                  }}
                  className="flex w-full items-center justify-center space-x-2 rounded-full bg-danger/10 border border-danger/30 py-2.5 text-xs font-semibold text-danger transition hover:bg-danger/20 active:scale-97"
                >
                  <Icon name="LogOut" size={14} />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="flex w-full items-center justify-center rounded-full border border-border/80 bg-surface/80 py-2.5 text-xs font-semibold text-text shadow-apple-sm transition hover:border-gold active:scale-97"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={onClose}
                  className="flex w-full items-center justify-center rounded-full bg-gold py-2.5 text-xs font-bold text-bg shadow-[0_2px_10px_rgba(201,168,76,0.3)] transition hover:bg-goldHover active:scale-97"
                >
                  Register
                </Link>
              </div>
            )}
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-bg/80 p-2.5 border border-border/80 shadow-apple-sm">
              <span className="text-xs text-textMuted font-medium">Theme Mode</span>
              <ThemeToggle showLabel />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default MobileMenu;

