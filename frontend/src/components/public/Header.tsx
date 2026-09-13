import { useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { useLogout } from '../../hooks/useAuth';
import { useHasRole } from '../../hooks/useHasRole';
import Icon from '../icons/Icon';
import MobileMenu from './MobileMenu';
import Logo from '../shared/Logo';
import ThemeToggle from '../shared/ThemeToggle';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const logoutMutation = useLogout();
  const isSuperAdmin = useHasRole('superAdmin');
  const isAdmin = useHasRole('admin');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [headerSearchTerm, setHeaderSearchTerm] = useState('');

  const handleCloseMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearchTerm.trim()) {
      navigate(`/articles?search=${encodeURIComponent(headerSearchTerm.trim())}`);
      setHeaderSearchTerm('');
    }
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Topics', path: '/topics' },
    { label: 'Events', path: '/events' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 w-full border-b border-border/60 bg-bg/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl shadow-apple-sm"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center active:scale-98 transition-transform">
          <Logo variant="full" height={36} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex lg:items-center lg:space-x-1 bg-surface/60 dark:bg-zinc-900/60 border border-border/60 backdrop-blur-md px-3 py-1.5 rounded-full shadow-apple-sm">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-gold/15 text-gold shadow-sm font-bold'
                  : 'text-textMuted hover:text-text hover:bg-surface/80'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Header Compact Search Bar */}
        <form onSubmit={handleHeaderSearchSubmit} className="hidden md:flex items-center relative max-w-xs">
          <input
            type="text"
            value={headerSearchTerm}
            onChange={(e) => setHeaderSearchTerm(e.target.value)}
            placeholder="Search Qindil..."
            className="w-36 lg:w-48 rounded-full border border-border/80 bg-surface/80 backdrop-blur-sm px-3 py-1.5 pl-8 text-xs text-text placeholder:text-textMuted/70 shadow-apple-sm focus:w-56 focus:border-gold focus:ring-4 focus:ring-gold/15 focus:outline-none transition-all duration-300"
          />
          <button type="submit" className="absolute left-2.5 text-textMuted hover:text-gold transition-colors">
            <Icon name="Search" size={14} />
          </button>
        </form>

        {/* Auth / Action Area */}
        <div className="hidden md:flex md:items-center md:space-x-2.5">
          <ThemeToggle />
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-2">
              {/* Distinct Admin Panel Buttons for SuperAdmin & Admin */}
              {isSuperAdmin ? (
                <Link
                  to="/admin"
                  className="inline-flex items-center space-x-1.5 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1.5 text-xs font-bold text-gold hover:bg-gold hover:text-zinc-950 transition-all active:scale-95 shadow-sm"
                  title="SuperAdmin Command Center"
                >
                  <Icon name="Shield" size={13} />
                  <span>SuperAdmin Panel</span>
                </Link>
              ) : isAdmin ? (
                <Link
                  to="/admin/workspace"
                  className="inline-flex items-center space-x-1.5 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1.5 text-xs font-bold text-gold hover:bg-gold hover:text-zinc-950 transition-all active:scale-95 shadow-sm"
                  title="Editorial Operations Console"
                >
                  <Icon name="Folder" size={13} />
                  <span>Admin Panel</span>
                </Link>
              ) : null}

              {/* User Profile & Mini Dashboard Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 rounded-full border border-border/80 bg-surface/80 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-text shadow-apple-sm transition-all hover:border-gold/50 active:scale-95"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-gold text-xs font-bold border border-gold/30 shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
                  <Icon name="ChevronDown" size={13} className="text-textMuted" />
                </button>

                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl border border-border/80 dark:border-white/10 bg-surface/95 dark:bg-zinc-900/95 backdrop-blur-2xl p-1.5 shadow-apple-float space-y-0.5"
                    >
                      {/* User Header in Dropdown */}
                      <div className="px-3 py-2 border-b border-border/60 mb-1">
                        <p className="text-xs font-bold text-text truncate">{user.name}</p>
                        <p className="text-[10px] text-textMuted truncate">{user.email}</p>
                        <span className="inline-block text-[9px] font-semibold text-gold mt-0.5">
                          {isSuperAdmin
                            ? 'Super Administrator'
                            : isAdmin
                            ? 'Editorial Admin'
                            : 'Registered Reader'}
                        </span>
                      </div>

                      {/* Personal Profile & Saved Library */}
                      <Link
                        to="/dashboard"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center space-x-2 rounded-xl px-3 py-2 text-xs font-semibold text-text transition hover:bg-gold/10 hover:text-gold"
                      >
                        <Icon name="User" size={14} className="text-gold" />
                        <span>My Profile &amp; Saved</span>
                      </Link>

                      {/* Admin Link inside dropdown for quick access */}
                      {isSuperAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center space-x-2 rounded-xl px-3 py-2 text-xs font-semibold text-gold transition hover:bg-gold/10"
                        >
                          <Icon name="Shield" size={14} />
                          <span>SuperAdmin Command</span>
                        </Link>
                      )}

                      {isAdmin && !isSuperAdmin && (
                        <Link
                          to="/admin/workspace"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center space-x-2 rounded-xl px-3 py-2 text-xs font-semibold text-gold transition hover:bg-gold/10"
                        >
                          <Icon name="Folder" size={14} />
                          <span>Admin Workspace</span>
                        </Link>
                      )}

                      <div className="border-t border-border/60 my-1" />

                      {/* Logout */}
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          logoutMutation.mutate();
                        }}
                        className="flex w-full items-center space-x-2 rounded-xl px-3 py-2 text-xs font-semibold text-danger transition hover:bg-danger/10"
                      >
                        <Icon name="LogOut" size={14} />
                        <span>Log Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="rounded-full border border-border/80 bg-surface/60 backdrop-blur-sm px-3.5 py-1.5 text-xs font-semibold text-textMuted transition hover:text-text hover:border-gold/40 active:scale-95"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-gold px-4 py-1.5 text-xs font-bold text-bg shadow-[0_2px_10px_rgba(201,168,76,0.3)] transition hover:bg-goldHover active:scale-95"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger & Controls */}
        <div className="flex md:hidden items-center space-x-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="rounded-full p-2 text-textMuted transition hover:bg-surface hover:text-text active:scale-90"
            aria-label="Open Mobile Menu"
          >
            <Icon name="Menu" size={22} />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={handleCloseMobileMenu}
        navItems={navItems}
      />
    </motion.header>
  );
}

export default Header;
