import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { useLogout } from '../../hooks/useAuth';
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

  // Close mobile drawer automatically when route changes
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Slide-in Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-[280px] border-l border-border bg-surface p-5 shadow-2xl overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <Logo variant="full" height={28} />
              <button
                onClick={onClose}
                className="rounded-md p-1 text-textMuted transition hover:bg-bg hover:text-text"
                aria-label="Close Mobile Menu"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            <nav className="mt-4 flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className="rounded-md px-3 py-2 text-sm font-medium text-text transition hover:bg-bg hover:text-gold"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-6 border-t border-border pt-4">
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2.5 rounded-md bg-bg p-2.5 border border-border">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/20 text-gold text-xs font-bold shrink-0">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-text truncate">{user.name}</p>
                      <p className="text-[10px] text-textMuted truncate">{user.email}</p>
                    </div>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={onClose}
                    className="flex w-full items-center justify-center space-x-2 rounded-md border border-border bg-bg py-2 text-xs font-semibold text-text transition hover:border-gold"
                  >
                    <Icon name="Activity" size={14} />
                    <span>Workspace</span>
                  </Link>

                  <button
                    onClick={() => {
                      onClose();
                      logoutMutation.mutate();
                    }}
                    className="flex w-full items-center justify-center space-x-2 rounded-md bg-danger/10 border border-danger/30 py-2 text-xs font-semibold text-danger transition hover:bg-danger/20"
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
                    className="flex w-full items-center justify-center rounded-md border border-border bg-bg py-2 text-xs font-semibold text-text transition hover:border-gold"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={onClose}
                    className="flex w-full items-center justify-center rounded-md bg-gold py-2 text-xs font-semibold text-bg transition hover:bg-goldHover"
                  >
                    Register
                  </Link>
                </div>
              )}
              {/* Theme Toggle section in Mobile Menu */}
              <div className="mt-4 flex items-center justify-between rounded-md bg-bg p-2 border border-border">
                <span className="text-xs text-textMuted font-medium">Theme Mode</span>
                <ThemeToggle showLabel />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default MobileMenu;
