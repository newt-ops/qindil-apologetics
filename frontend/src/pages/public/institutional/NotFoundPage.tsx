import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import Seo from '../../../components/shared/Seo';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/articles?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const quickLinks = [
    {
      title: 'Research Library',
      desc: 'Browse academic papers & refutations',
      to: '/articles',
      icon: 'BookOpen',
    },
    {
      title: 'Thematic Disciplines',
      desc: 'Explore categorized areas of inquiry',
      to: '/topics',
      icon: 'Layers',
    },
    {
      title: 'Public Symposia',
      desc: 'Webinars, panels & recorded sessions',
      to: '/events',
      icon: 'Calendar',
    },
    {
      title: 'Institutional Mission',
      desc: 'Our methodology & editorial standards',
      to: '/about',
      icon: 'Info',
    },
  ];

  return (
    <div className="relative min-h-screen bg-bg text-text font-sans flex flex-col items-center justify-center p-4 sm:p-8 selection:bg-gold/25 selection:text-gold transition-colors duration-200 overflow-hidden">
      <Seo
        title="404 — Page Not Found"
        description="The requested page could not be located on Qindil Apologetics."
      />

      {/* Ambient background glow & radial highlights */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(179,133,76,0.14),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(201,168,76,0.12),rgba(0,0,0,0))]" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[500px] bg-gold/10 dark:bg-gold/5 blur-[120px] rounded-full" />

      <div className="relative w-full max-w-xl text-center space-y-6 sm:space-y-8 rounded-2xl border border-border bg-surface/90 backdrop-blur-xl p-5 sm:p-10 shadow-2xl">
        {/* Top Trim */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent rounded-t-2xl" />

        {/* 404 Scholarly Badge */}
        <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gold/10 text-gold border border-gold/30 shadow-lg shadow-gold/10">
          <span className="text-2xl sm:text-3xl font-black font-mono tracking-wider">404</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-3xl font-extrabold text-text tracking-tight">
            Discourse Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-textMuted leading-relaxed max-w-md mx-auto">
            The manuscript or page you requested does not exist, has been re-indexed, or is temporarily unavailable in our archives.
          </p>
        </div>

        {/* Search Bar Direct Shortcut */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-md mx-auto">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-textMuted">
            <Icon name="Search" size={15} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search research papers, topics, or terms..."
            className="w-full rounded-xl border border-border bg-bg pl-9 pr-20 py-2.5 text-xs text-text placeholder:text-textMuted/60 focus:border-gold focus:outline-none transition shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 rounded-lg bg-gold px-3 text-[11px] font-bold text-bg hover:bg-goldHover transition"
          >
            Search
          </button>
        </form>

        {/* Quick Navigation Cards - Prompt 42: Compact 2x2 grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-left pt-2">
          {quickLinks.map((link) => (
            <Link
              key={link.title}
              to={link.to}
              className="group rounded-xl border border-border bg-bg/70 p-3 transition hover:border-gold/50 hover:bg-surface"
            >
              <div className="flex items-center space-x-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/10 text-gold group-hover:bg-gold group-hover:text-bg transition">
                  <Icon name={link.icon as any} size={14} />
                </div>
                <span className="text-xs font-bold text-text group-hover:text-gold transition-colors">
                  {link.title}
                </span>
              </div>
              <p className="text-[10px] text-textMuted mt-1 leading-snug hidden sm:block">
                {link.desc}
              </p>
            </Link>
          ))}
        </div>

        {/* Return Home Button */}
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 rounded-lg bg-surface border border-border hover:border-gold px-5 py-2.5 text-xs font-semibold text-text transition shadow-sm"
          >
            <Icon name="ArrowLeft" size={13} />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
