import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { useLogout } from '../../hooks/useAuth';
import Icon from '../icons/Icon';
import MobileMenu from './MobileMenu';
import Logo from '../shared/Logo';
import ThemeToggle from '../shared/ThemeToggle';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const logoutMutation = useLogout();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [headerSearchTerm, setHeaderSearchTerm] = useState('');

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
      className="sticky top-0 z-40 w-full border-b border-border bg-bg/90 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center">
          <Logo variant="full" height={36} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex lg:items-center lg:space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium transition-colors ${
                isActive(item.path) ? 'text-gold' : 'text-textMuted hover:text-text'
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
            className="w-36 lg:w-48 rounded-full border border-border bg-surface px-3 py-1.5 pl-8 text-xs text-text placeholder:text-textMuted focus:w-56 focus:border-gold focus:outline-none transition-all duration-300"
          />
          <button type="submit" className="absolute left-2.5 text-textMuted hover:text-gold transition-colors">
            <Icon name="Search" size={14} />
          </button>
        </form>

        {/* Auth / Action Area */}
        <div className="hidden md:flex md:items-center md:space-x-3">
          <ThemeToggle />
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center space-x-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text transition hover:border-gold/50"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-gold text-xs font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span>{user.name.split(' ')[0]}</span>
                <Icon name="ChevronDown" size={16} className="text-textMuted" />
              </button>

              <AnimatePresence>
                {isUserDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-surface p-1 shadow-xl"
                  >
                    <Link
                      to="/dashboard"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm text-text transition hover:bg-bg hover:text-gold"
                    >
                      <Icon name="Activity" size={16} />
                      <span>Workspace</span>
                    </Link>

                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        logoutMutation.mutate();
                      }}
                      className="flex w-full items-center space-x-2 rounded-md px-3 py-2 text-sm text-danger transition hover:bg-bg"
                    >
                      <Icon name="LogOut" size={16} />
                      <span>Log Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="text-sm font-medium text-textMuted transition hover:text-text"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-gold px-3.5 py-1.5 text-sm font-semibold text-bg transition hover:bg-goldHover"
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
            onClick={() => setIsMobileMenuOpen(true)}
            className="rounded-md p-2 text-textMuted transition hover:bg-surface hover:text-text"
            aria-label="Open Mobile Menu"
          >
            <Icon name="Menu" size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navItems={navItems}
      />
    </motion.header>
  );
}

export default Header;
