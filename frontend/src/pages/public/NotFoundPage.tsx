import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/icons/Icon';
import Seo from '../../components/shared/Seo';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg text-text font-sans flex flex-col items-center justify-center p-6 selection:bg-gold/30 selection:text-gold">
      <Seo title="404 — Page Not Found" description="The requested page could not be found on Qindil." />

      <div className="w-full max-w-lg text-center space-y-6 rounded-2xl border border-border bg-surface p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Gold Glow */}
        <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-gold/10 blur-2xl pointer-events-none" />

        {/* 404 Icon Badge */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold/10 text-gold border border-gold/30 shadow-inner">
          <span className="text-3xl font-black font-mono">404</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-textMuted leading-relaxed">
            The page you are looking for does not exist, has been moved, or is temporarily unavailable.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-6 py-2.5 text-xs font-bold text-bg transition hover:bg-goldHover shadow-lg shadow-gold/15"
          >
            <Icon name="ArrowLeft" size={16} />
            <span>Return Home</span>
          </Link>

          <Link
            to="/articles"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-bg px-6 py-2.5 text-xs font-semibold text-text hover:border-gold/50 transition"
          >
            <Icon name="BookOpen" size={16} />
            <span>Browse Articles</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
