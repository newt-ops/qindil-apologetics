import { Link, useNavigate } from 'react-router-dom';
import Icon from '../icons/Icon';
import { useSettings } from '../../hooks/useSettings';

interface MaintenancePageProps {
  previewMode?: boolean;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({ previewMode = false }) => {
  const navigate = useNavigate();
  const { data: settings } = useSettings();

  const siteName = settings?.siteName || 'منصة القنديل';
  const contactEmail = settings?.contactEmail || 'contact@qindilapologetics.com';

  return (
    <div className="min-h-screen w-full bg-bg text-text font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Preview Mode Top Banner */}
      {previewMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-bg font-bold px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <Icon name="Eye" size={16} />
            <span>PREVIEW MODE: This is the Maintenance Screen currently presented to public visitors.</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-3 py-1 bg-bg text-text rounded text-xs font-mono hover:bg-surface transition"
          >
            Exit Preview
          </button>
        </div>
      )}

      {/* Subtle Background Glow */}
      <div className="absolute h-96 w-96 rounded-full bg-gold/5 blur-3xl -top-20 -left-20 pointer-events-none" />
      <div className="absolute h-96 w-96 rounded-full bg-gold/5 blur-3xl -bottom-20 -right-20 pointer-events-none" />

      <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-8 text-center space-y-6 shadow-2xl relative z-10">
        {/* Brand Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 border border-gold/40 text-gold shadow-inner">
          <Icon name="Shield" size={32} />
        </div>

        {/* Header Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
            <span className="h-2 w-2 rounded-full bg-gold animate-ping" />
            <span>Scheduled Maintenance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            {siteName}
          </h1>
          <p className="text-xs sm:text-sm text-textMuted leading-relaxed">
            We are currently upgrading our platform systems to serve you better. The public site is temporarily offline and will return shortly.
          </p>
        </div>

        {/* Contact Note */}
        {contactEmail && (
          <div className="pt-4 border-t border-border/60 text-xs text-textMuted">
            <span>Need urgent assistance? Contact us at </span>
            <a
              href={`mailto:${contactEmail}`}
              className="text-gold font-mono font-semibold hover:underline block mt-1"
            >
              {contactEmail}
            </a>
          </div>
        )}

        {/* Admin Login Link */}
        <div className="pt-2 text-xs text-textMuted/70 border-t border-border/40">
          <span>Platform staff? </span>
          <Link to="/login" className="text-gold hover:underline font-semibold">
            Administrator Sign In
          </Link>
        </div>
      </div>

      <div className="mt-8 text-[11px] font-mono text-textMuted/60">
        © {new Date().getFullYear()} {siteName} • System Operations
      </div>
    </div>
  );
};

export default MaintenancePage;
