import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useGenerateTelegramCode, useUnlinkTelegram } from '../../hooks/useMeData';
import { toast } from '../../hooks/useToast';
import Icon from '../icons/Icon';

export const TelegramLinkCard: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const generateCodeMutation = useGenerateTelegramCode();
  const unlinkMutation = useUnlinkTelegram();

  const [linkData, setLinkData] = useState<{
    linkCode: string;
    expiresAt: string;
    botUsername: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const isLinked = Boolean(user?.telegramChatId);

  const handleGenerateCode = async () => {
    try {
      const res = await generateCodeMutation.mutateAsync();
      if (res?.data) {
        setLinkData(res.data);
        toast.info('Link Code Generated: Send this code to the Telegram bot.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Could not generate link code.');
    }
  };

  const handleUnlink = async () => {
    try {
      await unlinkMutation.mutateAsync();
      setLinkData(null);
      toast.success('Telegram Notifications Disabled');
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

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
      {/* Accent Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c9a84c]/20 via-[#c9a84c] to-[#c9a84c]/20" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#c9a84c]/10 text-[#c9a84c]">
            <Icon name="Send" size={22} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">Telegram Notifications</h3>
            <p className="text-xs text-zinc-400">
              Receive real-time task assignments, 24h deadline reminders, & status updates.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        {isLinked ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Icon name="CheckCircle" size={14} />
            Connected
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Icon name="AlertCircle" size={14} />
            Not Connected
          </span>
        )}
      </div>

      {isLinked ? (
        <div className="mt-4 p-4 rounded-lg bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-zinc-200 flex items-center gap-2">
              <Icon name="Shield" size={16} className="text-emerald-400" />
              Account Linked
            </p>
            <p className="text-xs text-zinc-400 font-mono">
              Chat ID: {user?.telegramChatId}
            </p>
          </div>

          <button
            onClick={handleUnlink}
            disabled={unlinkMutation.isPending}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-colors disabled:opacity-50"
          >
            <Icon name="Unlink" size={14} />
            {unlinkMutation.isPending ? 'Unlinking...' : 'Unlink Telegram'}
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {!linkData ? (
            <button
              onClick={handleGenerateCode}
              disabled={generateCodeMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[#c9a84c] text-zinc-950 hover:bg-[#d9b85c] transition-all shadow-md font-sans disabled:opacity-50"
            >
              <Icon name="Send" size={16} />
              {generateCodeMutation.isPending ? 'Generating Code...' : 'Connect Telegram Account'}
            </button>
          ) : (
            <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-zinc-950 rounded-md border border-[#c9a84c]/30">
                <div className="text-center sm:text-left">
                  <p className="text-xs text-zinc-400">Your Temporary Link Code:</p>
                  <p className="text-2xl font-mono tracking-widest font-bold text-[#c9a84c]">
                    {linkData.linkCode}
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md transition-colors"
                >
                  <Icon name={copied ? 'Check' : 'Copy'} size={14} className={copied ? 'text-emerald-400' : ''} />
                  {copied ? 'Copied' : 'Copy Code'}
                </button>
              </div>

              <div className="space-y-2 text-xs text-zinc-300">
                <p className="font-semibold text-zinc-200">How to complete linking:</p>
                <ol className="list-decimal list-inside space-y-1 text-zinc-400 pl-1">
                  <li>
                    Open Telegram & search for{' '}
                    <a
                      href={`https://t.me/${linkData.botUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#c9a84c] hover:underline font-mono inline-flex items-center gap-1"
                    >
                      @{linkData.botUsername}
                      <Icon name="ExternalLink" size={12} />
                    </a>
                  </li>
                  <li>
                    Send this message command: <code className="bg-zinc-950 text-[#c9a84c] px-1.5 py-0.5 rounded font-mono border border-zinc-800">/link {linkData.linkCode}</code>
                  </li>
                  <li>You will receive instant confirmation once linked!</li>
                </ol>
                <p className="text-[11px] text-amber-400/80 pt-1">
                  ⚠️ This code expires in 10 minutes.
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
