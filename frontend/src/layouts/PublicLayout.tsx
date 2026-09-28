import { useEffect, Suspense } from 'react';
import { Outlet, useLocation, Link, useSearchParams } from 'react-router-dom';
import Header from '../components/public/Header';
import Footer from '../components/public/Footer';
import MaintenancePage from '../components/public/MaintenancePage';
import CookieConsentBanner from '../components/public/CookieConsentBanner';
import { useSettings, useUpdateSettings } from '../hooks/useSettings';
import { useHasRole } from '../hooks/useHasRole';
import { initGA4, trackGA4PageView } from '../lib/analytics';
import { UniversalPageSkeleton } from '../components/ui/Skeleton';
import Icon from '../components/icons/Icon';
import { toast } from '../hooks/useToast';

export function PublicLayout() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { data: settings } = useSettings();
  const updateSettingsMutation = useUpdateSettings();
  const isAdmin = useHasRole('admin');
  const isSuperAdmin = useHasRole('superAdmin');

  useEffect(() => {
    initGA4();
    trackGA4PageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  // Support direct visitor view preview
  const isPreviewMode = searchParams.get('preview') === 'maintenance';
  if (isPreviewMode) {
    return <MaintenancePage previewMode={true} />;
  }

  const isMaintenanceActive = Boolean(settings?.maintenanceMode) && !isAdmin && !isSuperAdmin;

  if (isMaintenanceActive) {
    return <MaintenancePage />;
  }

  const handleDisableMaintenance = async () => {
    try {
      await updateSettingsMutation.mutateAsync({ maintenanceMode: false });
      toast.success('Maintenance mode deactivated. Platform is live.');
    } catch {
      toast.error('Failed to deactivate maintenance mode.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text font-sans antialiased">
      {/* Sticky Maintenance Notice for Admins with Bypass Privileges */}
      {Boolean(settings?.maintenanceMode) && (isAdmin || isSuperAdmin) && (
        <div className="sticky top-0 z-50 bg-danger text-white px-4 py-2.5 text-xs sm:text-sm font-semibold flex flex-wrap items-center justify-between gap-2 shadow-lg border-b border-danger/60">
          <div className="flex items-center space-x-2">
            <Icon name="AlertTriangle" size={17} className="shrink-0 animate-pulse text-amber-200" />
            <span>
              <strong className="uppercase font-mono tracking-wider font-extrabold text-amber-200 mr-1.5">
                [Maintenance Active]
              </strong>
              Public visitors are blocked. You are viewing this page with Administrator privileges.
            </span>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <Link
              to="/?preview=maintenance"
              className="px-2.5 py-1 rounded bg-white/20 hover:bg-white/30 text-white font-mono text-xs transition"
            >
              Preview Visitor View
            </Link>
            <button
              onClick={handleDisableMaintenance}
              disabled={updateSettingsMutation.isPending}
              className="px-2.5 py-1 rounded bg-black/40 hover:bg-black/60 text-white font-mono text-xs transition cursor-pointer"
            >
              Turn Off Maintenance
            </button>
            <Link
              to="/admin/settings"
              className="px-2.5 py-1 rounded bg-white/20 hover:bg-white/30 text-white font-mono text-xs transition"
            >
              Settings
            </Link>
          </div>
        </div>
      )}

      <Header />
      <main className="flex-1">
        <Suspense fallback={<UniversalPageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <CookieConsentBanner />
    </div>
  );
}

export default PublicLayout;
