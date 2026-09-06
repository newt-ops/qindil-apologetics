import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/public/Header';
import Footer from '../components/public/Footer';
import MaintenancePage from '../components/public/MaintenancePage';
import CookieConsentBanner from '../components/public/CookieConsentBanner';
import { useSettings } from '../hooks/useSettings';
import { useHasRole } from '../hooks/useHasRole';
import { initGA4, trackGA4PageView } from '../lib/analytics';

export function PublicLayout() {
  const location = useLocation();
  const { data: settings } = useSettings();
  const isAdmin = useHasRole('admin');
  const isSuperAdmin = useHasRole('superAdmin');

  useEffect(() => {
    initGA4();
    trackGA4PageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  const isMaintenanceActive = Boolean(settings?.maintenanceMode) && !isAdmin && !isSuperAdmin;

  if (isMaintenanceActive) {
    return <MaintenancePage />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text font-sans antialiased">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CookieConsentBanner />
    </div>
  );
}

export default PublicLayout;
