import React, { useState, useEffect } from 'react';
import Icon from '../../../components/icons/Icon';
import { useSettings, useUpdateSettings } from '../../../hooks/useSettings';
import { AdminPageHeader } from '../../../components/admin';
import { useConfirm } from '../../../hooks/useConfirm';
import { Button } from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { toast } from '../../../hooks/useToast';

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
  const { confirm, ConfirmModalElement } = useConfirm();

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

  const handleMaintenanceToggleClick = async () => {
    const nextState = !maintenanceMode;
    if (nextState === true) {
      const ok = await confirm({
        title: 'Confirm Maintenance Mode Activation',
        description: 'Activating Maintenance Mode will block public visitor access to the site immediately and render the Maintenance Page. Admin operations and workspace pages will remain accessible.',
        confirmText: 'Enable Maintenance Mode',
        variant: 'danger',
      });
      if (!ok) return;
      setMaintenanceMode(true);
    } else {
      setMaintenanceMode(false);
    }
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
      <AdminPageHeader
        discipline="SuperAdmin Governance"
        title="Site Settings & Platform Config"
        subtitle="Manage public platform branding, institutional contact email, social media presence, and maintenance mode status."
      />

      {/* Live Brand Identity Preview Card */}
      <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gold/20 pb-3">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/20 text-gold font-black text-sm border border-gold/40 shadow-inner">
              {siteName ? siteName.charAt(0).toUpperCase() : 'Q'}
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gold">Public Identity Preview</div>
              <h2 className="text-base sm:text-lg font-extrabold text-text">
                {siteName || 'Qindil Apologetics'}
              </h2>
            </div>
          </div>

          <div>
            {maintenanceMode ? (
              <span className="inline-flex items-center space-x-1.5 rounded-full border border-danger/40 bg-danger/10 px-3 py-1 text-xs font-bold text-danger">
                <span className="h-2 w-2 rounded-full bg-danger animate-pulse" />
                <span>Maintenance Mode Engaged</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 rounded-full border border-success/40 bg-success/10 px-3 py-1 text-xs font-bold text-success">
                <span className="h-2 w-2 rounded-full bg-success" />
                <span>Live Public Platform</span>
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-textMuted italic">
          "{tagline || 'Islamic Apologetics & Intellectual Research Platform'}"
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] text-textMuted font-medium">Connected Channels:</span>
          {[
            { label: 'YouTube', url: youtube },
            { label: 'Telegram', url: telegram },
            { label: 'Instagram', url: instagram },
            { label: 'Facebook', url: facebook },
            { label: 'TikTok', url: tiktok },
          ].map((channel) => (
            <span
              key={channel.label}
              className={`inline-flex items-center space-x-1 rounded-md px-2 py-0.5 text-[11px] font-mono border ${
                channel.url
                  ? 'border-gold/30 bg-gold/10 text-gold font-semibold'
                  : 'border-border bg-surface text-textMuted/60'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  channel.url ? 'bg-gold' : 'bg-textMuted/40'
                }`}
              />
              <span>{channel.label}</span>
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
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
                  Maintenance Mode Governance
                </h3>
              </div>
              <p className="text-xs text-textMuted max-w-xl">
                When enabled, anonymous visitors to public pages will see the dedicated Maintenance Screen. Admin scholars retain full access to operations, content pipelines, and configuration tools.
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
            <span className="text-textMuted">Platform Status: </span>
            {maintenanceMode ? (
              <span className="text-danger bg-danger/20 px-2 py-0.5 rounded text-[11px] font-mono font-bold">
                Maintenance Mode Active (Public Site Blocked)
              </span>
            ) : (
              <span className="text-success bg-success/20 px-2 py-0.5 rounded text-[11px] font-mono font-bold">
                Live Public Platform (Normal Operation)
              </span>
            )}
          </div>
        </div>

        {/* Section 1: General Branding */}
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
          <h3 className="text-sm font-extrabold text-text border-b border-border/60 pb-3 flex items-center space-x-2">
            <Icon name="FileText" size={16} className="text-gold" />
            <span>Institutional Identity & Contact</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Platform Name *"
              placeholder="e.g., Qindil Apologetics"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              required
            />

            <Input
              label="Primary Contact Email Address"
              type="email"
              placeholder="e.g., contact@qindilapologetics.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>

          <Input
            label="Site Tagline & Institutional Subtitle"
            placeholder="e.g., Islamic Apologetics & Intellectual Research Platform"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
        </div>

        {/* Section 2: Social Links */}
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
          <h3 className="text-sm font-extrabold text-text border-b border-border/60 pb-3 flex items-center space-x-2">
            <Icon name="Globe" size={16} className="text-gold" />
            <span>Social Outreach Channels (Displayed in Public Footer)</span>
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
            className="px-6"
          >
            Save Configuration
          </Button>
        </div>
      </form>

      {/* Sensitive Confirmation Dialog */}
      {ConfirmModalElement}
    </div>
  );
};

export default SiteSettingsPage;
