import React, { useState, useEffect } from 'react';
import Icon from '../../components/icons/Icon';
import { useSettings, useUpdateSettings } from '../../hooks/useSettings';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { toast } from '../../hooks/useToast';

export const SiteSettingsPage: React.FC = () => {
  const { data: settings, isLoading } = useSettings();
  const updateSettingsMutation = useUpdateSettings();

  // Form Fields State
  const [siteName, setSiteName] = useState('');
  const [tagline, setTagline] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Social Links State
  const [youtube, setYoutube] = useState('');
  const [telegram, setTelegram] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [tiktok, setTiktok] = useState('');

  // Maintenance Mode State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [pendingMaintenanceToggle, setPendingMaintenanceToggle] = useState<boolean | null>(null);

  // Populate form fields when settings load
  useEffect(() => {
    if (settings) {
      setSiteName(settings.siteName || '');
      setTagline(settings.tagline || '');
      setContactEmail(settings.contactEmail || '');

      const social = settings.socialLinks || {};
      setYoutube(social.youtube || '');
      setTelegram(social.telegram || '');
      setInstagram(social.instagram || '');
      setFacebook(social.facebook || '');
      setTiktok(social.tiktok || '');

      setMaintenanceMode(Boolean(settings.maintenanceMode));
    }
  }, [settings]);

  const handleMaintenanceToggleClick = () => {
    const nextState = !maintenanceMode;
    if (nextState === true) {
      // Enabling maintenance mode requires confirmation
      setPendingMaintenanceToggle(true);
    } else {
      // Disabling maintenance mode can happen directly
      setMaintenanceMode(false);
    }
  };

  const confirmEnableMaintenance = () => {
    setMaintenanceMode(true);
    setPendingMaintenanceToggle(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateSettingsMutation.mutateAsync({
        siteName: siteName.trim() || undefined,
        tagline: tagline.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        socialLinks: {
          youtube: youtube.trim() || undefined,
          telegram: telegram.trim() || undefined,
          instagram: instagram.trim() || undefined,
          facebook: facebook.trim() || undefined,
          tiktok: tiktok.trim() || undefined,
        },
        maintenanceMode,
      });

      toast.success('Site settings saved successfully.');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error?.message || 'Failed to update settings.';
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-textMuted font-sans">
        Loading site settings...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      {/* Page Header */}
      <div className="border-b border-border pb-6">
        <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold mb-2">
          <Icon name="Settings" size={14} />
          <span>SuperAdmin Settings</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
          Site Settings & Platform Config
        </h1>
        <p className="text-xs sm:text-sm text-textMuted mt-1">
          Manage public site branding, contact email, social media presence, and maintenance mode status.
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-8">
        {/* Maintenance Mode Control Box */}
        <div
          className={`rounded-xl border p-5 space-y-4 transition-colors ${
            maintenanceMode
              ? 'bg-danger/10 border-danger/40'
              : 'bg-surface border-border'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Icon
                  name={maintenanceMode ? 'AlertTriangle' : 'CheckCircle'}
                  size={18}
                  className={maintenanceMode ? 'text-danger' : 'text-success'}
                />
                <h3 className="text-sm font-extrabold text-text">
                  Maintenance Mode Status
                </h3>
              </div>
              <p className="text-xs text-textMuted max-w-xl">
                When enabled, anonymous visitors to public pages will see the Maintenance Page. Admins and SuperAdmins retain full access to administrative tools.
              </p>
            </div>

            <button
              type="button"
              onClick={handleMaintenanceToggleClick}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                maintenanceMode ? 'bg-danger' : 'bg-border'
              }`}
              role="switch"
              aria-checked={maintenanceMode}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold">
            <span className="text-textMuted">Current Public Mode: </span>
            {maintenanceMode ? (
              <span className="text-danger bg-danger/20 px-2 py-0.5 rounded text-[11px] font-mono">
                Maintenance Mode Active (Public Site Blocked)
              </span>
            ) : (
              <span className="text-success bg-success/20 px-2 py-0.5 rounded text-[11px] font-mono">
                Live Public Platform (Normal Operation)
              </span>
            )}
          </div>
        </div>

        {/* Section 1: General Branding */}
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
          <h3 className="text-sm font-extrabold text-text border-b border-border/60 pb-3 flex items-center space-x-2">
            <Icon name="FileText" size={16} className="text-gold" />
            <span>General Platform Branding</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Site Name"
              placeholder="e.g., Qindil Apologetics"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              required
            />

            <Input
              label="Contact Email Address"
              type="email"
              placeholder="e.g., contact@qindilapologetics.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>

          <Input
            label="Site Tagline / Description"
            placeholder="e.g., Islamic Apologetics & Intellectual Research Platform"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
        </div>

        {/* Section 2: Social Links */}
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
          <h3 className="text-sm font-extrabold text-text border-b border-border/60 pb-3 flex items-center space-x-2">
            <Icon name="Globe" size={16} className="text-gold" />
            <span>Social Media Channels (Shown in Footer)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="YouTube Channel URL"
              placeholder="https://youtube.com/@qindil"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
            />

            <Input
              label="Telegram Channel URL"
              placeholder="https://t.me/qindil"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
            />

            <Input
              label="Instagram URL"
              placeholder="https://instagram.com/qindil"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />

            <Input
              label="Facebook URL"
              placeholder="https://facebook.com/qindil"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
            />

            <Input
              label="TikTok URL"
              placeholder="https://tiktok.com/@qindil"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={updateSettingsMutation.isPending}
            leftIcon={<Icon name="Check" size={16} />}
          >
            Save Site Settings
          </Button>
        </div>
      </form>

      {/* Maintenance Mode Confirmation Modal */}
      {pendingMaintenanceToggle && (
        <Modal
          isOpen={Boolean(pendingMaintenanceToggle)}
          onClose={() => setPendingMaintenanceToggle(null)}
          title="Confirm Maintenance Mode Activation"
          size="sm"
        >
          <div className="space-y-4 font-sans text-xs">
            <div className="flex items-center space-x-3 text-danger bg-danger/10 p-3 rounded-lg border border-danger/30">
              <Icon name="AlertTriangle" size={24} className="shrink-0" />
              <span>
                Activating Maintenance Mode will block public visitor access to the site immediately and render the Maintenance Page.
              </span>
            </div>

            <p className="text-textMuted">
              Admin operations and workspace pages will remain fully available to you to make necessary system updates.
            </p>

            <div className="flex justify-end space-x-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setPendingMaintenanceToggle(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={confirmEnableMaintenance}
                leftIcon={<Icon name="AlertTriangle" size={14} />}
              >
                Enable Maintenance Mode
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SiteSettingsPage;
