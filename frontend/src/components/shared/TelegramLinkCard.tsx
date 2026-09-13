import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useGenerateTelegramCode, useUnlinkTelegram } from '../../hooks/useMeData';
import { toast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
import Icon from '../icons/Icon';

export const TelegramLinkCard: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const { confirm, ConfirmModalElement } = useConfirm();

  const generateCodeMutation = useGenerateTelegramCode();
  const unlinkMutation = useUnlinkTelegram();

  const [linkData, setLinkData] = useState<{
    linkCode: string;
    expiresAt: string;
    botUsername: string;
    deepLink?: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const isLinked = Boolean(user?.telegramChatId);

  const handleGenerateCode = async () => {
    try {
      const res = await generateCodeMutation.mutateAsync();
      if (res?.data) {
        setLinkData(res.data);
        toast.info('Link Code Generated: Connect directly or send code to the Telegram bot.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Could not generate link code.');
    }
  };

  const handleUnlink = async () => {
    const ok = await confirm({
      title: 'Disconnect Telegram Account',
      description: 'Are you sure you want to disconnect your Telegram account from Qindil? You will no longer receive instant task assignments, publication alerts, or deadline warnings.',
      confirmText: 'Disconnect Account',
      cancelText: 'Keep Connected',
      variant: 'danger',
    });

    if (!ok) return;

    try {
      await unlinkMutation.mutateAsync();
      setLinkData(null);
      toast.success('Telegram notifications disabled.');
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Failed to unlink Telegram account.');
    }
  };

  const handleCopyCode = () => {
    if (!linkData?.linkCode) return;
    navigator.clipboard.writeText(linkData.linkCode);
    setCopied(true);
    toast.success('Link code copied to clipboard.');
    setTimeout(() => setCopied(false), 3000);
  };

  const deepLinkUrl =
    linkData?.deepLink ||
    (linkData ? `https://t.me/${linkData.botUsername}?start=${linkData.linkCode}` : '#');

  return (
    <div className="bg-surface border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden transition-colors duration-200">
      {ConfirmModalElement}

      {/* Accent Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold/20 via-gold to-gold/20" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-gold/10 text-gold border border-gold/20 shrink-0">
            <Icon name="Send" size={20} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-text">Telegram Sync</h3>
            <p className="text-[11px] sm:text-xs text-textMuted leading-relaxed">
              Real-time symposium alerts, editorial task updates &amp; reminders.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        {isLinked ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 shrink-0">
            <Icon name="CheckCircle" size={13} />
            <span>Connected</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/25 shrink-0">
            <Icon name="AlertCircle" size={13} />
            <span>Not Connected</span>
          </span>
        )}
      </div>

      {isLinked ? (
        <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-bg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-semibold text-text flex items-center gap-2">
              <Icon name="Shield" size={15} className="text-emerald-500" />
              <span>Account Synchronized</span>
            </p>
            <p className="text-[11px] text-textMuted font-mono">
              Chat ID: {user?.telegramChatId}
            </p>
          </div>

          <button
            onClick={handleUnlink}
            disabled={unlinkMutation.isPending}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-danger bg-danger/10 hover:bg-danger/20 border border-danger/25 rounded-lg transition-colors disabled:opacity-50 active:scale-95"
          >
            <Icon name="Unlink" size={13} />
            <span>{unlinkMutation.isPending ? 'Disconnecting...' : 'Unlink Telegram'}</span>
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {!linkData ? (
            <button
              onClick={handleGenerateCode}
              disabled={generateCodeMutation.isPending}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold bg-gold text-bg hover:bg-goldHover transition shadow-md disabled:opacity-50 active:scale-95"
            >
              <Icon name="Send" size={14} />
              <span>{generateCodeMutation.isPending ? 'Generating Code...' : 'Connect Telegram Account'}</span>
            </button>
          ) : (
            <div className="p-3.5 sm:p-4 rounded-xl bg-bg border border-border space-y-3.5">
              {/* Primary Instant Connect CTA Button */}
              <div className="space-y-2">
                <a
                  href={deepLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-gold text-bg hover:bg-goldHover active:scale-[0.99] transition shadow-md group"
                >
                  <Icon name="Send" size={16} />
                  <span>Connect to Telegram (Instant Link)</span>
                  <Icon name="ExternalLink" size={13} className="opacity-70 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <p className="text-[11px] text-center text-textMuted">
                  Tapping above opens Telegram and automatically links your account with one click.
                </p>
              </div>

              {/* Fallback Manual Code Section */}
              <div className="border-t border-border/60 pt-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-surface rounded-lg border border-border">
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] text-textMuted uppercase tracking-wider font-semibold">Or Enter Code Manually:</p>
                    <p className="text-xl sm:text-2xl font-mono tracking-widest font-black text-gold">
                      {linkData.linkCode}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text bg-bg hover:bg-surface border border-border rounded-lg transition shadow-sm active:scale-95"
                  >
                    <Icon name={copied ? 'Check' : 'Copy'} size={13} className={copied ? 'text-emerald-500' : ''} />
                    <span>{copied ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>

                <p className="text-[10px] text-amber-500 pt-2 flex items-center gap-1.5">
                  <Icon name="Clock" size={12} className="shrink-0 text-amber-500" />
                  <span>Code expires in 10 minutes. Only one Telegram account can be linked at a time.</span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TelegramLinkCard;
